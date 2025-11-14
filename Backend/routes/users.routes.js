import { Router } from 'express';
import { getUsers, updateCurrentUser, getCurrentUser, updateUserBlockStatus } from '../Controllers/users.controller.js';
import userAuth from '../Middleware/user.auth.js';
import { userLimiter } from '../Middleware/rateLimiters.js';
import adminAuth from '../Middleware/admin.auth.js';

const userRouter = Router();

// Aplicar middleware de autenticación a todas las rutas de usuarios
userRouter.use(userAuth);

// Aplicar rate limiter a todas las rutas de usuarios
userRouter.use(userLimiter);

// Ruta para obtener los datos del usuario autenticado actual
userRouter.get('/me', getCurrentUser);

// Ruta para actualizar el perfil del usuario autenticado
userRouter.put('/me', updateCurrentUser);

// Rutas administrativas para gestionar usuarios
userRouter.get('/', adminAuth, getUsers);
userRouter.patch('/:id/block', adminAuth, updateUserBlockStatus); 

export default userRouter;