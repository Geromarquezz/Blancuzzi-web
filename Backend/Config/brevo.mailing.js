import brevo from '@getbrevo/brevo';


function getApiInstance() {
    const apiInstance = new brevo.TransactionalEmailsApi();
    apiInstance.setApiKey(
        brevo.TransactionalEmailsApiApiKeys.apiKey,
        process.env.BREVOAPI
    );
    return apiInstance;
}

function getSender() {
    return {
        name: process.env.GMAILNAME,
        email: process.env.GMAILADD,
    };
}

export const sendVerifyResetPasswordOtpMail = async (name, mail, resetOtp, expireMinutes) => {

    if (!name || !mail || !resetOtp) {
        console.error('Parámetros inválidos');
        return false;
    }
    const apiInstance = getApiInstance();

    try {
        const sendSmtpEmail = new brevo.SendSmtpEmail();

        sendSmtpEmail.subject = "Restablecer contraseña en Odontologia Blancuzzi";
        sendSmtpEmail.to = [
            { email: mail, name: name},
        ];
        sendSmtpEmail.htmlContent = `
        <html>
            <head>
                <style>
                    body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; margin: 0; padding: 20px; background-color: #f8f9fa; }
                    .container { max-width: 600px; margin: 0 auto; background: white; border-radius: 10px; padding: 30px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); }
                    .header { text-align: center; margin-bottom: 30px; }
                    .logo { color: #2c5aa0; font-size: 20px; font-weight: bold; margin-bottom: 10px; }
                    .otp-code { background: #fef2f2; border-radius: 8px; padding: 20px; text-align: center; margin: 20px 0; border: 2px solid #f87171; }
                    .code { font-size: 32px; font-weight: bold; color: #dc2626; letter-spacing: 4px; margin: 10px 0; }
                    .content { color: #555; line-height: 1.6; }
                    .footer { text-align: center; margin-top: 30px; padding-top: 20px; border-top: 1px solid #eee; color: #666; font-size: 14px; }
                    .security { background: #fef3c7; border-left: 4px solid #f59e0b; padding: 15px; margin: 20px 0; border-radius: 4px; }
                </style>
            </head>
            <body>
                <div class="container">
                    <div class="header">
                        <div class="logo">Od. Angelica Blancuzzi</div>
                        <h2>Restablecer contraseña</h2>
                    </div>
                    
                    <div class="content">
                        <p>Hola <strong>${name}</strong>,</p>
                        
                        <p>Recibimos una solicitud para restablecer la contraseña de tu cuenta en el sistema de turnos.</p>
                        
                        <div class="otp-code">
                            <p>Tu código de seguridad es:</p>
                            <div class="code">${resetOtp}</div>
                            <p><small>Este código expira en ${expireMinutes} minutos</small></p>
                        </div>
                        
                        <p><strong>¿Qué hacer ahora?</strong></p>
                        <ol>
                            <li>Ingresa este código en la página de restablecimiento</li>
                            <li>Crea una nueva contraseña segura</li>
                            <li>Accede normalmente a tu cuenta</li>
                        </ol>
                        
                        <div class="security">
                            <strong>🛡️ Seguridad:</strong> Si no solicitaste este cambio, ignora este email. Tu contraseña actual seguirá siendo válida.
                        </div>
                    </div>
                    
                    <div class="footer">
                        <p><strong>Od. Angelica Blancuzzi</strong><br>
                        Cuido tu sonrisa con profesionalismo<br>
                        🌐 odontologiablancuzzi.com</p>
                    </div>
                </div>
            </body>
        </html>`
        sendSmtpEmail.sender = getSender();
        await apiInstance.sendTransacEmail(sendSmtpEmail);
        return true;
    } catch (error) {
        console.error('Error enviando reset password email:', error);
        return false;
    }
}

export const sendVerifyAccountOtpMail = async (name, mail, otp, expireMinutes) => {

    if (!name || !mail || !otp) {
        console.error('Parámetros inválidos');
        return false;
    }
    const apiInstance = getApiInstance();

    try {
        const sendSmtpEmail = new brevo.SendSmtpEmail();

        sendSmtpEmail.subject = "Verifica tu cuenta en Odontologia Blancuzzi";
        sendSmtpEmail.to = [
            { email: mail, name: name},
        ];
        sendSmtpEmail.htmlContent = `
        <html>
            <head>
                <style>
                    body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; margin: 0; padding: 20px; background-color: #f8f9fa; }
                    .container { max-width: 600px; margin: 0 auto; background: white; border-radius: 10px; padding: 30px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); }
                    .header { text-align: center; margin-bottom: 30px; }
                    .logo { color: #2c5aa0; font-size: 20px; font-weight: bold; margin-bottom: 10px; }
                    .welcome { color: #10b981; font-size: 24px; font-weight: bold; margin-bottom: 10px; }
                    .otp-code { background: #f0f9ff; border-radius: 8px; padding: 20px; text-align: center; margin: 20px 0; border: 2px solid #3b82f6; }
                    .code { font-size: 32px; font-weight: bold; color: #1e40af; letter-spacing: 4px; margin: 10px 0; }
                    .content { color: #555; line-height: 1.6; }
                    .footer { text-align: center; margin-top: 30px; padding-top: 20px; border-top: 1px solid #eee; color: #666; font-size: 14px; }
                    .benefits { background: #f0fdf4; border-left: 4px solid #10b981; padding: 15px; margin: 20px 0; border-radius: 4px; }
                    .benefits ul { margin: 10px 0; padding-left: 20px; }
                    .benefits li { margin: 5px 0; }
                </style>
            </head>
            <body>
                <div class="container">
                    <div class="header">
                        <div class="logo">Od. Angelica Blancuzzi</div>
                        <div class="welcome">¡Bienvenido/a!</div>
                    </div>
                    
                    <div class="content">
                        <p>Hola <strong>${name}</strong>,</p>
                        
                        <p>¡Gracias por registrarte en el sistema de turnos!.</p>
                        
                        <div class="otp-code">
                            <p>Tu código de verificación es:</p>
                            <div class="code">${otp}</div>
                            <p><small>Este código expira en ${expireMinutes} minutos</small></p>
                        </div>
                        
                        <p><strong>¿Qué hacer ahora?</strong></p>
                        <ol>
                            <li>Ingresa este código en la página de verificación</li>
                            <li>Activa tu cuenta</li>
                            <li>¡Comienza a agendar tus turnos!</li>
                        </ol>
                        
                        <div class="benefits">
                            <strong>Una vez verificada tu cuenta podrás:</strong>
                            <ul>
                                <li>Agendar turnos de forma rápida y sencilla</li>
                                <li>Ver tus próximas citas</li>
                                <li>Gestionar tu información de contacto</li>
                            </ul>
                        </div>
                        
                        <p><small><em>Si no te registraste en el sistema, puedes ignorar este email.</em></small></p>
                    </div>
                    
                    <div class="footer">
                        <p><strong>Od. Angelica Blancuzzi</strong><br>
                        Cuido tu sonrisa con profesionalismo<br>
                        🌐 odontologiablancuzzi.com</p>
                    </div>
                </div>
            </body>
        </html>`
        sendSmtpEmail.sender = getSender();
        await apiInstance.sendTransacEmail(sendSmtpEmail);
        return true;
    } catch (error) {
        console.error(error);
        return false;
    }
}
