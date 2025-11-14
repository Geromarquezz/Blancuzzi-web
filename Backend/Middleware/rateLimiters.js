import rateLimit from "express-rate-limit";

// Límite global general para toda la API
export const globalLimiter = rateLimit({
  windowMs: 1 * 60 * 1000, // 1 minutos
  max: 300, // máximo 200 requests por IP
  message: {
    status: 429,
    message: "Demasiadas solicitudes desde esta IP. Por favor, espere un minuto.",
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// LOGIN – proteger contra fuerza bruta
export const loginLimiter = rateLimit({
  windowMs: 1 * 60 * 1000, // 1 minutos
  max: 10,
  message: {
    status: 429,
    message: "Demasiados intentos de inicio de sesión. Intente nuevamente en un minuto.",
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// REGISTER – prevenir spam de cuentas
export const registerLimiter = rateLimit({
  windowMs: 1 * 60 * 1000, // 10 minutos
  max: 3,
  message: {
    status: 429,
    message: "Demasiadas registros desde esta IP. Intente más tarde.",
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// SEND RESET OTP – limitar envío de mails
export const sendOtpLimiter = rateLimit({
  windowMs: 1 * 60 * 1000, 
  max: 5,
  message: {
    status: 429,
    message: "Demasiadas solicitudes de código. Espere un minuto e intente nuevamente.",
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// VERIFY OTP y RESET PASSWORD – limitar intentos
export const verifyOtpLimiter = rateLimit({
  windowMs: 1 * 60 * 1000, // 1 minuto
  max: 5,
  message: {
    status: 429,
    message: "Demasiados solicitudes de codigo. Espere un minuto e intente nuevamente.",
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// CREAR TURNO – evitar spam o doble reserva
export const crearTurnoLimiter = rateLimit({
  windowMs: 1 * 60 * 1000, // 1 minuto
  max: 3,
  message: {
    status: 429,
    message: "Demasiadas peticiones para creación de turno. Intente nuevamente en un minuto.",
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// ❌ CANCELAR TURNO – limitar cancelaciones excesivas
export const cancelTurnoLimiter = rateLimit({
  windowMs: 1 * 60 * 1000, // 1 minutos
  max: 10,
  message: {
    status: 429,
    message: "Demasiadas cancelaciones. Intente nuevamente en un minuto.",
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// 👤 PERFIL DE USUARIO – evitar spam de peticiones
export const userLimiter = rateLimit({
  windowMs: 1 * 60 * 1000,
  max: 50,
  message: {
    status: 429,
    message: "Demasiadas peticiones en el perfil. Intente nuevamente mas tarde.",
  },
  standardHeaders: true,
  legacyHeaders: false,
});
