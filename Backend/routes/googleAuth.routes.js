import express from 'express';
import { authOffline, redirectHandler, checkAuthStatus } from '../Controllers/googleAuth.controller.js';

const googleAuthRouter = express.Router();

// Ruta para iniciar autenticación
googleAuthRouter.get('/', authOffline);

// Ruta de callback después de autenticación con Google
googleAuthRouter.get('/redirect', redirectHandler);

// Ruta para verificar estado de autenticación (útil para debugging)
googleAuthRouter.get('/status', checkAuthStatus);

export default googleAuthRouter;