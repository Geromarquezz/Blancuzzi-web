import { getOAuth2Client, saveTokens, isAuthenticated } from '../Services/googleTokens.Service.js';

const oauth2Client = getOAuth2Client();

/* Generar URL de autenticación para la odontóloga - Solo se usa la primera vez o cuando se necesita re-autenticar
 */
export function authOffline(req, res) {
    try {
        const url = oauth2Client.generateAuthUrl({
            access_type: 'offline', // IMPORTANTE: Obtiene refresh token
            prompt: 'consent', // Fuerza a mostrar la pantalla de consentimiento para obtener refresh token
            scope: [
                'https://www.googleapis.com/auth/calendar',
                'https://www.googleapis.com/auth/calendar.events'
            ],
        });

        console.log('🔗 URL de autenticación generada');
        res.redirect(url);
    } catch (error) {
        console.error('Error generando URL de autenticación:', error);
        res.status(500).json({
            success: false,
            message: 'Error generando URL de autenticación',
            error: error.message
        });
    }
}

/* Manejar el callback de Google OAuth - Guarda los tokens en la base de datos para uso permanente */
export async function redirectHandler(req, res) {
    const code = req.query.code;

    if (!code) {
        return res.status(400).json({
            success: false,
            message: 'Código de autorización no proporcionado'
        });
    }

    try {
        // Obtener tokens usando el código
        const { tokens } = await oauth2Client.getToken(code);

        // Configurar credentials
        oauth2Client.setCredentials(tokens);

        // GUARDAR TOKENS EN BASE DE DATOS PARA PERSISTENCIA
        await saveTokens(tokens);

        if (!tokens.refresh_token) {
            console.log('ADVERTENCIA: No se obtuvo refresh token. Puede que necesites revocar el acceso y volver a autenticarte.');
        }

        // Redirigir a una página de éxito con información visual
        res.send(`
            <!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <title>Autenticación Exitosa</title>
    <style>
        body {
            font-family: Arial, sans-serif;
            background: #e3f2fd;
            display: flex;
            justify-content: center;
            align-items: center;
            min-height: 100vh;
        }
        .container {
            background: #fff;
            padding: 32px 24px;
            border-radius: 12px;
            box-shadow: 0 4px 24px rgba(44,82,130,0.12);
            text-align: center;
        }
        h1 {
            color: #1976d2;
            margin-bottom: 16px;
        }
        p {
            color: #333;
            margin-bottom: 12px;
        }
        .success {
            font-size: 48px;
            color: #43a047;
            margin-bottom: 16px;
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="success">✔️</div>
        <h1>¡Autenticación Exitosa!</h1>
        <p>El sistema está conectado correctamente a Google Calendar.</p>
        <p>Ya puedes cerrar esta ventana.</p>
    </div>
</body>
</html>
        `);
    } catch (error) {
        console.error('Error en el callback de autenticación:', error);
        res.status(500).send(`
            <!DOCTYPE html>
            <html lang="es">
            <head>
                <meta charset="UTF-8">
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
                <title>Error de Autenticación</title>
                <style>
                    body {
                        font-family: 'Poppins', Arial, sans-serif;
                        display: flex;
                        justify-content: center;
                        align-items: center;
                        min-height: 100vh;
                        margin: 0;
                        background: linear-gradient(135deg, #ff6b6b 0%, #ee5a6f 100%);
                    }
                    .container {
                        background: white;
                        padding: 40px;
                        border-radius: 15px;
                        box-shadow: 0 10px 40px rgba(0,0,0,0.2);
                        text-align: center;
                        max-width: 500px;
                    }
                    h1 { color: #dc3545; margin-bottom: 20px; }
                    p { color: #666; line-height: 1.6; }
                    .error-icon { font-size: 60px; margin-bottom: 20px; }
                </style>
            </head>
            <body>
                <div class="container">
                    <div class="error-icon">❌</div>
                    <h1>Error de Autenticación</h1>
                    <p>${error.message}</p>
                    <p>Por favor, contacta al administrador del sistema.</p>
                </div>
            </body>
            </html>
        `);
    }
}

/*Verificar estado de autenticación (endpoint útil para debugging)*/
export async function checkAuthStatus(req, res) {
    try {
        const authenticated = await isAuthenticated();

        res.json({
            success: true,
            authenticated: authenticated,
            message: authenticated
                ? 'Sistema autenticado correctamente con Google Calendar'
                : 'Sistema no autenticado. Visita /auth/google para autenticarte'
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error verificando estado de autenticación',
            error: error.message
        });
    }
}

export default { authOffline, redirectHandler, checkAuthStatus };