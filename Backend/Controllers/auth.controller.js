import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { pool } from '../Database/db.js';
import { sendVerifyAccountOtpMail, sendVerifyResetPasswordOtpMail } from '../Config/brevo.mailing.js';
import { getArgentinaDate, addMinutesArgentina } from '../utils/timezone.js';

export const register = async (req, res) => {

    //Crear el usuario
    const { name, lastname, email, phone, password } = req.body;
    //Si no esta ninguno de estos mando un json con el error
    if (!name || !lastname || !phone || !email || !password ) {
        return res.json({ success: false, message: "Debes completar todos los campos" })
    }

    try {
        //Si un usuario esta con este mail entonces se agrega a la variable
        const existingUserResult = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
        const existingUser = existingUserResult.rows[0];

        if (existingUser) { //Si el usuario con el mail existe entonces:
            return res.json({ success: false, message: "Ya existe un usuario con ese email" })
        }
        //Se hashea la password del usuario
        const hashedPassword = await bcrypt.hash(password, 10);

        //Se crea el usuario en PostgreSQL
        const userResult = await pool.query(
            'INSERT INTO users (name, lastname, email, phone, password) VALUES ($1, $2, $3, $4, $5) RETURNING *',
            [name, lastname, email, phone, hashedPassword]
        );
        const user = userResult.rows[0];

        // NO generar sesión aún - el usuario debe verificar primero
        // La cookie se generará después de verificar el OTP

        // Generar OTP de 6 dígitos
        const otp = String(Math.floor(100000 + Math.random() * 900000));
        
        // Calcular tiempo de expiración (10 minutos desde ahora en Argentina)
        const expireAt = addMinutesArgentina(10);

        // Guardar OTP de verificación en la base de datos
        await pool.query(
            'UPDATE users SET verify_otp = $1, verify_otp_expire_at = $2 WHERE id = $3',
            [otp, expireAt, user.id]
        );

        // Enviar email con OTP de verificación
        await sendVerifyAccountOtpMail(name, email, otp, 10);

        //El usuario es creado correctamente
        return res.json({ 
            success: true, 
            message: 'Usuario creado exitosamente. Por favor verifica tu email.',
            data: { 
                email: user.email,
                requiresVerification: true
            }
        });

    } catch (error) {
        res.json({ success: false, message: error.message })
    }

}

export const login = async (req, res) => {

    const { email, password } = req.body;

    if (!email || !password) {
        return res.json({ success: false, message: "Campos Email y contraseña son requeridos" })
    }

    try {
        //Lo mismo que en el register, si vemos un user con el email lo agregamos a la variable
        const userResult = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
        const user = userResult.rows[0];

        if (!user) {
            return res.json({ success: false, message: 'Comprueba email y contraseña e inténtalo de nuevo.' });
        }
        //Compara si la password que manda el usuario es igual a la de la BD
        const isMatch = await bcrypt.compare(password, user.password);

        if (!isMatch) {
            return res.json({ success: false, message: 'Comprueba email y contraseña e inténtalo de nuevo' })
        }

        //Crear token (usando user.id en lugar de user._id)
        const token = jwt.sign({ id: user.id }, process.env.JWT_SECRET, { expiresIn: '7d' });

        res.cookie('token', token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'strict',
            maxAge: 7 * 24 * 60 * 60 * 1000 // Transformarlo en 7 dias
        });

        // El usuario es logeado correctamente 
    const role = user.id === 1 ? 'admin' : 'patient';

    return res.json({ success: true, data: { role } });


    } catch (error) {
        res.json({ success: false, message: error.message })
    }

}

export const logout = async (req, res) => {
    try {
        //Si removemos el cookie del usuario se hace logout
        res.clearCookie('token', {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'strict',
        })

        return res.json({ success: true, message: "Sesion Cerrada" })

    } catch (error) {
        return res.json({ success: false, message: error.message })
    }
}

// PASO 1: Enviar OTP al email del usuario
export const sendResetPasswordOtp = async (req, res) => {
    const { email } = req.body;

    if (!email) {
        return res.json({ success: false, message: "Email requerido" })
    }

    try {
        // Verificar si el usuario existe
        const userResult = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
        const user = userResult.rows[0];

        if (!user) {
            return res.json({ success: false, message: "No existe un usuario con ese email" })
        }

        // Generar OTP de 6 dígitos
        const otp = String(Math.floor(100000 + Math.random() * 900000));
        
        // Calcular tiempo de expiración (10 minutos desde ahora)
        const expireAt = new Date(Date.now() + 10 * 60 * 1000);

        // Guardar OTP y tiempo de expiración en la base de datos
        await pool.query(
            'UPDATE users SET reset_password_otp = $1, reset_password_otp_expire_at = $2 WHERE email = $3',
            [otp, expireAt, email]
        );

        // Enviar email con OTP
        await sendVerifyResetPasswordOtpMail(user.name, email, otp, expireAt.getMinutes());

        return res.json({ 
            success: true, 
            message: `Código de 6 enviado a tu email. Válido por ${expireAt.getMinutes()} minutos.` 
        });

    } catch (error) {
        console.error('Error al enviar el codigo:', error);
        return res.json({ success: false, message: "Error al enviar el código" })
    }
}

// PASO 2: Verificar OTP
export const verifyResetPasswordOtp = async (req, res) => {
    const { email, otp } = req.body;

    // Validar campos requeridos
    if (!email || !otp) {
        return res.json({ success: false, message: 'Email y código de 6 dígitos son requeridos' });
    }

    try {
        // Buscar usuario por email
        const userResult = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
        const user = userResult.rows[0];

        if (!user) {
            return res.json({ success: false, message: 'Usuario no encontrado' });
        }

        // Verificar si existe un OTP
        if (!user.reset_password_otp) {
            return res.json({ 
                success: false, 
                message: 'No se ha solicitado un código de 6 dígitos. Solicita uno primero.' 
            });
        }

        // Verificar si el OTP es correcto
        if (user.reset_password_otp !== otp) {
            return res.json({ success: false, message: 'Código de 6 digitos incorrecto' });
        }

        // Verificar si el OTP ha expirado
        const now = new Date();
        const expireAt = new Date(user.reset_password_otp_expire_at);

        if (now > expireAt) {
            // Limpiar OTP expirado
            await pool.query(
                'UPDATE users SET reset_password_otp = NULL, reset_password_otp_expire_at = NULL WHERE email = $1',
                [email]
            );
            return res.json({ 
                success: false, 
                message: 'El código ha expirado. Solicita uno nuevo.' 
            });
        }

        return res.json({ 
            success: true, 
            message: 'Código verificado correctamente. Ahora puedes cambiar tu contraseña.' 
        });

    } catch (error) {
        console.error('Error al verificar OTP:', error);
        return res.json({ success: false, message: 'Error al verificar el código OTP' });
    }
}  

// ENVIAR OTP DE VERIFICACIÓN DE CUENTA
export const sendVerifyAccountOtp = async (req, res) => {
    const { email } = req.body;

    if (!email) {
        return res.json({ success: false, message: "Email requerido" });
    }

    try {
        // Verificar si el usuario existe
        const userResult = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
        const user = userResult.rows[0];

        if (!user) {
            return res.json({ success: false, message: "No existe un usuario con ese email" });
        }

        // Verificar si ya está verificado
        if (user.is_verified) {
            return res.json({ success: false, message: "Tu cuenta ya está verificada" });
        }

        // Generar OTP de 6 dígitos
        const otp = String(Math.floor(100000 + Math.random() * 900000));
        
        // Calcular tiempo de expiración (10 minutos desde ahora en Argentina)
        const expireAt = addMinutesArgentina(10);

        // Guardar OTP y tiempo de expiración en la base de datos
        await pool.query(
            'UPDATE users SET verify_otp = $1, verify_otp_expire_at = $2 WHERE email = $3',
            [otp, expireAt, email]
        );

        // Enviar email con OTP
        await sendVerifyAccountOtpMail(user.name, email, otp, 10);

        return res.json({ 
            success: true, 
            message: "Código de verificación enviado a tu email. Válido por 10 minutos." 
        });

    } catch (error) {
        console.error('Error al enviar OTP de verificación:', error);
        return res.json({ success: false, message: "Error al enviar el código de verificación" });
    }
}

// VERIFICAR OTP DE CUENTA
export const verifyAccountOtp = async (req, res) => {
    const { email, otp } = req.body;

    // Validar campos requeridos
    if (!email || !otp) {
        return res.json({ success: false, message: 'Email y código OTP son requeridos' });
    }

    try {
        // Buscar usuario por email
        const userResult = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
        const user = userResult.rows[0];

        if (!user) {
            return res.json({ success: false, message: 'Usuario no encontrado' });
        }

        // Verificar si ya está verificado
        if (user.is_verified) {
            return res.json({ success: false, message: 'Tu cuenta ya está verificada' });
        }

        // Verificar si existe un OTP
        if (!user.verify_otp) {
            return res.json({ 
                success: false, 
                message: 'No se ha solicitado un código de verificación. Solicita uno primero.' 
            });
        }

        // Verificar si el OTP es correcto
        if (user.verify_otp !== otp) {
            return res.json({ success: false, message: 'Código de 6 dígitos incorrecto' });
        }

        // Verificar si el OTP ha expirado (comparar en hora Argentina)
        const nowArgentina = getArgentinaDate();
        const expireAt = new Date(user.verify_otp_expire_at);

        if (nowArgentina > expireAt) {
            // Limpiar OTP expirado
            await pool.query(
                'UPDATE users SET verify_otp = NULL, verify_otp_expire_at = NULL WHERE email = $1',
                [email]
            );
            return res.json({ 
                success: false, 
                message: 'El código ha expirado. Solicita uno nuevo.' 
            });
        }

        // Marcar cuenta como verificada y limpiar OTP
        await pool.query(
            'UPDATE users SET is_verified = TRUE, verify_otp = NULL, verify_otp_expire_at = NULL WHERE email = $1',
            [email]
        );

        // Generar JWT y establecer sesión
        const token = jwt.sign({ id: user.id }, process.env.JWT_SECRET, { expiresIn: '7d' });

        res.cookie('token', token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'strict',
            maxAge: 7 * 24 * 60 * 60 * 1000 // 7 días
        });

        return res.json({ 
            success: true, 
            message: '¡Cuenta verificada exitosamente! Ahora puedes agendar turnos.',
            user: {
                id: user.id,
                email: user.email,
                name: user.name,
                lastname: user.lastname,
                phone: user.phone,
                is_verified: true
            }
        });

    } catch (error) {
        console.error('Error al verificar OTP de cuenta:', error);
        return res.json({ success: false, message: 'Error al verificar el código' });
    }
}

// PASO 3: Cambiar contraseña (después de verificar OTP)
export const resetPasswordWithOtp = async (req, res) => {
    const { email, newPassword } = req.body;

    // Validar campos requeridos
    if (!email || !newPassword) {
        return res.json({ 
            success: false, 
            message: "Email y nueva contraseña son requeridos" 
        })
    }

    // Validar longitud mínima de contraseña
    if (newPassword.length < 8) {
        return res.json({ 
            success: false, 
            message: "La nueva contraseña debe tener al menos 8 caracteres" 
        })
    }

    try {
        // Buscar usuario por email
        const userResult = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
        const user = userResult.rows[0];

        if (!user) {
            return res.json({ success: false, message: "Usuario no encontrado" })
        }

        // Verificar si existe un OTP (debe haber sido verificado previamente)
        if (!user.reset_password_otp) {
            return res.json({ 
                success: false, 
                message: "Debes verificar el código de 6 dígitos primero" 
            })
        }

        // Verificar si el OTP ha expirado (comparar en hora Argentina)
        const nowArgentina = getArgentinaDate();
        const expireAt = new Date(user.reset_password_otp_expire_at);

        if (nowArgentina > expireAt) {
            // Limpiar OTP expirado
            await pool.query(
                'UPDATE users SET reset_password_otp = NULL, reset_password_otp_expire_at = NULL WHERE email = $1',
                [email]
            );
            return res.json({ 
                success: false, 
                message: "El código de 6 dígitos ha expirado. Solicita uno nuevo." 
            })
        }

        // Hashear la nueva contraseña
        const hashedPassword = await bcrypt.hash(newPassword, 10);

        // Actualizar contraseña y limpiar OTP
        await pool.query(
            'UPDATE users SET password = $1, reset_password_otp = NULL, reset_password_otp_expire_at = NULL WHERE email = $2',
            [hashedPassword, email]
        );

        return res.json({ 
            success: true, 
            message: "Contraseña restablecida exitosamente. Ya puedes iniciar sesión con tu nueva contraseña." 
        });

    } catch (error) {
        console.error('Error al restablecer contraseña:', error);
        return res.json({ success: false, message: "Error al restablecer la contraseña" })
    }
}


