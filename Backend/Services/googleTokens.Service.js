import { pool } from '../Database/db.js';
import { google } from 'googleapis';
import dotenv from 'dotenv';

dotenv.config();

// Configurar OAuth2 Client
const oauth2Client = new google.auth.OAuth2(
    process.env.GOOGLE_CLIENT_ID,
    process.env.GOOGLE_CLIENT_SECRET,
    process.env.GOOGLE_REDIRECT_URI
);

/* Guardar tokens en la base de datos */
export const saveTokens = async (tokens) => {
    try {
        const query = `
            INSERT INTO google_tokens (service_name, access_token, refresh_token, token_type, expiry_date, scope, updated_at)
            VALUES ($1, $2, $3, $4, $5, $6, CURRENT_TIMESTAMP)
            ON CONFLICT (service_name) 
            DO UPDATE SET 
                access_token = EXCLUDED.access_token,
                refresh_token = COALESCE(EXCLUDED.refresh_token, google_tokens.refresh_token),
                token_type = EXCLUDED.token_type,
                expiry_date = EXCLUDED.expiry_date,
                scope = EXCLUDED.scope,
                updated_at = CURRENT_TIMESTAMP
            RETURNING *;
        `;

        const values = [
            'calendar',
            tokens.access_token,
            tokens.refresh_token || null,
            tokens.token_type || 'Bearer',
            tokens.expiry_date || null,
            tokens.scope || null
        ];

        const result = await pool.query(query, values);
        console.log('Tokens guardados exitosamente en la base de datos');
        return result.rows[0];
    } catch (error) {
        console.error('Error guardando tokens:', error);
        throw error;
    }
};

/* Obtener tokens desde la base de datos */
export const getTokens = async () => {
    try {
        const query = `
            SELECT * FROM google_tokens 
            WHERE service_name = $1 
            ORDER BY updated_at DESC 
            LIMIT 1;
        `;

        const result = await pool.query(query, ['calendar']);

        if (result.rows.length === 0) {
            console.log('⚠️ No hay tokens guardados en la base de datos');
            return null;
        }

        const tokenData = result.rows[0];
        
        // Convertir a formato que espera Google
        const tokens = {
            access_token: tokenData.access_token,
            refresh_token: tokenData.refresh_token,
            token_type: tokenData.token_type,
            expiry_date: tokenData.expiry_date,
            scope: tokenData.scope
        };

        console.log('Tokens recuperados de la base de datos');
        return tokens;
    } catch (error) {
        console.error('Error obteniendo tokens:', error);
        throw error;
    }
};

// Verificar si los tokens están expirados
export const isTokenExpired = (expiryDate) => {
    if (!expiryDate) return true;
    // Agregar un margen de 5 minutos para renovar antes de que expire
    return Date.now() >= (expiryDate - 5 * 60 * 1000);
};

// Renovar tokens usando el refresh token
export const refreshTokens = async () => {
    try {
        console.log('Intentando renovar tokens...');
        
        const currentTokens = await getTokens();
        
        if (!currentTokens || !currentTokens.refresh_token) {
            console.log('No hay refresh token disponible');
            return null;
        }

        // Configurar credentials con refresh token
        oauth2Client.setCredentials({
            refresh_token: currentTokens.refresh_token
        });

        // Obtener nuevos tokens
        const { credentials } = await oauth2Client.refreshAccessToken();
        
        // Guardar nuevos tokens (mantiene el refresh_token si no viene uno nuevo)
        await saveTokens({
            ...credentials,
            refresh_token: credentials.refresh_token || currentTokens.refresh_token
        });

        console.log('Tokens renovados exitosamente');
        return credentials;
    } catch (error) {
        console.error('Error renovando tokens:', error);
        return null;
    }
};

/* Inicializar OAuth2 Client con tokens guardados */

export const initializeOAuth2Client = async () => {
    try {
        const tokens = await getTokens();

        if (!tokens) {
            console.log('No hay tokens guardados. Necesita autenticarse por primera vez.');
            return false;
        }

        // Verificar si el token está expirado
        if (isTokenExpired(tokens.expiry_date)) {
            console.log('Token expirado, renovando...');
            const newTokens = await refreshTokens();
            
            if (!newTokens) {
                console.log('No se pudo renovar el token. Necesita autenticarse nuevamente.');
                return false;
            }
            
            oauth2Client.setCredentials(newTokens);
        } else {
            oauth2Client.setCredentials(tokens);
            console.log('OAuth2 Client inicializado con tokens guardados');
        }

        // Configurar auto-refresh cuando se reciban nuevos tokens
        oauth2Client.on('tokens', async (newTokens) => {
            console.log('Nuevos tokens recibidos automáticamente');
            if (newTokens.refresh_token) {
                console.log('Nuevo refresh token recibido');
            }
            await saveTokens({
                ...newTokens,
                refresh_token: newTokens.refresh_token || tokens.refresh_token
            });
        });

        return true;
    } catch (error) {
        console.error('Error inicializando OAuth2 Client:', error);
        return false;
    }
};

// 
export const getOAuth2Client = () => {
    return oauth2Client;
};

// Verificar si hay autenticación válida
export const isAuthenticated = async () => {
    try {
        const tokens = await getTokens();
        if (!tokens) return false;
        
        // Si está expirado, intentar renovar
        if (isTokenExpired(tokens.expiry_date)) {
            const newTokens = await refreshTokens();
            return newTokens !== null;
        }
        
        return true;
    } catch (error) {
        console.error('Error verificando autenticación:', error);
        return false;
    }
};

export default {
    saveTokens,
    getTokens,
    refreshTokens,
    initializeOAuth2Client,
    getOAuth2Client,
    isTokenExpired,
    isAuthenticated
};
