import {Router} from 'express';
import { register, login, logout, sendResetPasswordOtp, verifyResetPasswordOtp, resetPasswordWithOtp, sendVerifyAccountOtp, verifyAccountOtp } from '../Controllers/auth.controller.js';
import { loginLimiter, registerLimiter, sendOtpLimiter, verifyOtpLimiter } from '../Middleware/rateLimiters.js';

const authRouter = Router();

// 🔐 Aplicar limiters específicos a cada ruta
authRouter.post('/register', registerLimiter, register);
authRouter.post('/login', loginLimiter, login);
authRouter.post('/logout', logout); // No necesita limiter (es una acción única)

// Rutas para verificar cuenta
authRouter.post('/send-verify-account-otp', sendOtpLimiter, sendVerifyAccountOtp); // Enviar OTP de verificación
authRouter.post('/verify-account-otp', verifyOtpLimiter, verifyAccountOtp); // Verificar cuenta con OTP

// Rutas para restablecer contraseña
authRouter.post('/send-reset-otp', sendOtpLimiter, sendResetPasswordOtp);      // Enviar OTP al email
authRouter.post('/verify-reset-password-otp', verifyOtpLimiter, verifyResetPasswordOtp); // Verificar OTP
authRouter.post('/verify-reset-password', verifyOtpLimiter, resetPasswordWithOtp); // Verificar OTP y cambiar contraseña



export default authRouter;