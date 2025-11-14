import { Router } from 'express';
import { 
    createTurno, 
    deleteTurno,
    getFechasDisponibles,
    getHorariosDisponibles,
    getUserTurnos
} from '../Controllers/turnos.controller.js';
import userAuth from '../Middleware/user.auth.js';
import requireVerifiedAccount from '../Middleware/account.verification.js';
import { crearTurnoLimiter, cancelTurnoLimiter } from '../Middleware/rateLimiters.js';

const turnoRouter = Router();

// 1. GET /api/turnos/fechas-disponibles (sin autenticación, con limiter)
turnoRouter.get('/fechas-disponibles',  getFechasDisponibles);

// Middleware de autenticación para todas las rutas siguientes
turnoRouter.use(userAuth);

// 2. GET /api/turnos/horarios-disponibles?date=YYYY-MM-DD
turnoRouter.get('/horarios-disponibles', getHorariosDisponibles);

// 3. POST /api/turnos (crear turno) - Requiere cuenta verificada
turnoRouter.post('/', requireVerifiedAccount, crearTurnoLimiter, createTurno);

// 4. Obtener todos los turnos del usuario autenticado
turnoRouter.get('/user', getUserTurnos);

// 8. Eliminar/cancelar turno
turnoRouter.delete('/:id', cancelTurnoLimiter, deleteTurno);

export default turnoRouter;