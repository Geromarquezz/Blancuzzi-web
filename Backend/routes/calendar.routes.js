import express from 'express';
import { setupWebhook, handleWebhook, manualSync, getHealthStatus } from '../Controllers/calendar.controller.js';
import userAuth from '../Middleware/user.auth.js';
import adminAuth from '../Middleware/admin.auth.js';

const calendarRouter = express.Router();

// Configurar webhook con Google Calendar
calendarRouter.post('/setup-webhook', setupWebhook);

// Recibir notificaciones de Google Calendar (webhook automático)
calendarRouter.post('/calendar-webhook', handleWebhook);

// Sincronización manual - solo admin (POST /api/calendar/sync)
calendarRouter.post('/sync', userAuth, adminAuth, manualSync);

// Ruta de salud del servicio
calendarRouter.get('/health', getHealthStatus);

export default calendarRouter;