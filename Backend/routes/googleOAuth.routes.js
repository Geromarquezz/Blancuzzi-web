import express from 'express';
import { initiateGoogleAuth, handleGoogleCallback, getGoogleAuthStatus } from '../Controllers/googleOAuth.controller.js';
import userAuth from '../Middleware/user.auth.js';

const router = express.Router();

// Iniciar autenticación con Google
router.get('/google', initiateGoogleAuth);

// Callback de Google después de autorización
router.get('/google/callback', handleGoogleCallback);

// Verificar estado de autenticación 
router.get('/google/status', userAuth, getGoogleAuthStatus);

export default router;
