import { google } from 'googleapis';
import { pool } from '../Database/db.js';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { sendVerifyAccountOtpMail } from '../Config/brevo.mailing.js';

const JWT_SECRET = process.env.JWT_SECRET;
const FRONTEND_URL = process.env.FRONTEND_URL;

// Configurar OAuth2 Client para autenticación de usuarios
const oauth2Client = new google.auth.OAuth2(
    process.env.GOOGLE_OAUTH_CLIENT_ID,
    process.env.GOOGLE_OAUTH_CLIENT_SECRET,
    process.env.GOOGLE_OAUTH_REDIRECT_URI
);

// GET /api/auth/google
export const initiateGoogleAuth = (req, res) => {
    try {
        const authUrl = oauth2Client.generateAuthUrl({
            access_type: 'offline',
            scope: [
                'https://www.googleapis.com/auth/userinfo.profile',
                'https://www.googleapis.com/auth/userinfo.email'
            ],
            prompt: 'consent' // Siempre pedir consentimiento para obtener refresh token
        });

        res.redirect(authUrl);
    } catch (error) {
        console.error('Error al iniciar autenticación con Google:', error);
        res.status(500).json({
            success: false,
            message: 'Error al iniciar autenticación con Google'
        });
    }
};

// GET /api/auth/google/callback
// Google redirige aquí después de que el usuario autoriza
export const handleGoogleCallback = async (req, res) => {
    try {
        const { code } = req.query;

        if (!code) {
            return res.redirect(`${FRONTEND_URL}/login?error=no_code`);
        }

        // Intercambiar el código por tokens
        const { tokens } = await oauth2Client.getToken(code);
        oauth2Client.setCredentials(tokens);

        // Obtener información del usuario de Google
        const oauth2 = google.oauth2({
            auth: oauth2Client,
            version: 'v2'
        });

        const { data } = await oauth2.userinfo.get();

        // Datos del usuario de Google
        const {
            id: googleId,
            email,
            name,
            given_name: firstName,
            family_name: lastName,
        } = data;

        console.log('Usuario de Google:', { googleId, email, name });

        // Verificar si el usuario ya existe en la base de datos
        let userQuery = await pool.query(
            'SELECT * FROM users WHERE email = $1', 
            [email]
        );

        let user;

        if (userQuery.rows.length > 0) {
            // Usuario ya existe
            user = userQuery.rows[0];

            // Verificar si está bloqueado
            if (user.is_blocked) {
                return res.redirect(`${FRONTEND_URL}/login?error=account_blocked`);
            }

            // Si el usuario NO está verificado, generar y enviar OTP
            if (!user.is_verified) {
                console.log('Usuario existente no verificado, enviando OTP a:', user.email);
                
                // Generar OTP de 6 dígitos
                const otp = String(Math.floor(100000 + Math.random() * 900000));
                
                // Calcular tiempo de expiración (10 minutos desde ahora)
                const expireAt = new Date(Date.now() + 10 * 60 * 1000);

                // Guardar OTP de verificación en la base de datos
                await pool.query(
                    'UPDATE users SET verify_otp = $1, verify_otp_expire_at = $2 WHERE id = $3',
                    [otp, expireAt, user.id]
                );

                // Enviar email con OTP de verificación
                await sendVerifyAccountOtpMail(user.name, user.email, otp, 10);
                console.log('OTP reenviado a usuario existente no verificado:', user.email);
            }

            // Actualizar google_id si no lo tiene
            if (!user.google_id) {
                await pool.query(
                    'UPDATE users SET google_id = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2',
                    [googleId, user.id]
                );
                console.log('google_id actualizado para usuario existente:', user.email);
            }

            console.log('Usuario existente logueado:', user.email);
        } else {
            // Usuario nuevo - REGISTRO
            const randomPassword = await bcrypt.hash(Math.random().toString(36), 10);

            const insertQuery = `
                INSERT INTO users (email, password, name, lastname, phone, is_verified, google_id)
                VALUES ($1, $2, $3, $4, $5, $6, $7)
                RETURNING id, email, name, lastname, phone, is_verified, google_id, created_at
            `;

            const newUserResult = await pool.query(insertQuery, [
                email,
                randomPassword,
                firstName || name || 'Usuario',
                lastName || '',
                '0000000000', // Teléfono placeholder (10 dígitos)
                false, // NO verificado automáticamente - requiere OTP
                googleId
            ]);

            user = newUserResult.rows[0];
            console.log('Nuevo usuario registrado:', user.email);

            // Generar OTP de 6 dígitos
            const otp = String(Math.floor(100000 + Math.random() * 900000));
            
            // Calcular tiempo de expiración (10 minutos desde ahora)
            const expireAt = new Date(Date.now() + 10 * 60 * 1000);

            // Guardar OTP de verificación en la base de datos
            await pool.query(
                'UPDATE users SET verify_otp = $1, verify_otp_expire_at = $2 WHERE id = $3',
                [otp, expireAt, user.id]
            );

            // Enviar email con OTP de verificación
            await sendVerifyAccountOtpMail(user.name, user.email, otp, 10);
            console.log('OTP enviado a:', user.email);
        }

        // Generar JWT
        const token = jwt.sign(
            {
                id: user.id,  
                email: user.email
            },
            JWT_SECRET,
            { expiresIn: '7d' }
        );

        // Establecer cookie con el token
        res.cookie('token', token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'lax',
            maxAge: 7 * 24 * 60 * 60 * 1000 // 7 días
        });

        // Redirigir al frontend con éxito
        res.redirect(`${FRONTEND_URL}/auth/google/success`);

    } catch (error) {
        console.error('Error en callback de Google:', error);
        res.redirect(`${FRONTEND_URL}/login?error=auth_failed`);
    }
};

// GET /api/auth/google/status
// Endpoint para verificar el estado de autenticación después del redirect
export const getGoogleAuthStatus = async (req, res) => {
    try {
        // El middleware de autenticación ya verificó el token
        const userId = req.userId;

        const userQuery = await pool.query(
            'SELECT id, email, name, lastname, phone, is_verified FROM users WHERE id = $1',
            [userId]
        );

        if (userQuery.rows.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Usuario no encontrado'
            });
        }

        const user = userQuery.rows[0];

        res.status(200).json({
            success: true,
            message: 'Autenticación exitosa',
            data: {
                user: {
                    id: user.id,
                    email: user.email,
                    name: user.name,
                    lastname: user.lastname,
                    phone: user.phone,
                    isVerified: user.is_verified
                }
            }
        });
    } catch (error) {
        console.error('Error al obtener estado de autenticación:', error);
        res.status(500).json({
            success: false,
            message: 'Error al obtener estado de autenticación'
        });
    }
};
