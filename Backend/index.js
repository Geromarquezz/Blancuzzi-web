import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import cookieParser from "cookie-parser";
import authRoutes from "./routes/auth.routes.js";
import userRouter from "./routes/users.routes.js";
import turnoRouter from "./routes/turnos.routes.js";
import googleAuthRoutes from './routes/googleAuth.routes.js'; // Google Calendar
import googleOAuthRoutes from './routes/googleOAuth.routes.js'; // Google OAuth para usuarios
import calendarRoutes from './routes/calendar.routes.js';
import { globalLimiter } from './Middleware/rateLimiters.js';
import { initializeOAuth2Client } from './Services/googleTokens.Service.js';

// Aumentar límite de listeners para evitar warning en desarrollo
process.setMaxListeners(15);

// Cargar variables de entorno desde .env.dev en desarrollo
dotenv.config({ path: '.env.prod' });

const BACKEND_URL = process.env.BACKEND_URL;
const FRONTEND_URL = process.env.FRONTEND_URL;
const PORT = process.env.PORT;
const app = express();

// Configurar trust proxy para rate limiter y headers X-Forwarded-*
// En desarrollo: trust localhost
// En producción: trust proxy (Nginx, Docker, etc.)
if (process.env.NODE_ENV === 'production') {
    app.set('trust proxy', 1); // Trust first proxy
} else {
    app.set('trust proxy', 'loopback'); // Trust localhost en desarrollo
}

// Configurar CORS para desarrollo y producción
const allowedOrigins = process.env.ALLOWED_ORIGINS?.split(',')

console.log('CORS - Orígenes permitidos:', allowedOrigins);

app.use(cors({
    origin: function(origin, callback) {
        // Permitir requests sin origin (como Postman, mobile apps)
        if (!origin) return callback(null, true);
        
        if (allowedOrigins.includes(origin)) {
            callback(null, true);
        } else {
            console.log('CORS blocked origin:', origin);
            callback(new Error('Not allowed by CORS'));
        }
    },
    credentials: true, // Permitir cookies
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
}));

// Middleware para parsear cookies
app.use(cookieParser());

// Middleware para parsear JSON
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// APLICAR RATE LIMITER GLOBAL (afecta a todas las rutas)
app.use(globalLimiter);

// Routes
app.use('/auth/google', googleAuthRoutes); // Google Calendar OAuth (admin)
app.use('/api/auth', googleOAuthRoutes); // Google OAuth para login/registro de usuarios
app.use('/api/calendar', calendarRoutes); // Calendar routes
app.use("/api/auth", authRoutes); // Autenticación tradicional (email/password)
app.use("/api/users", userRouter); // Usuarios routes
app.use("/api/turnos", turnoRouter); // Turnos routes

// Healthcheck y ruta raíz
app.get('/', (req, res) => {
    res.status(200).send({ status: 'ok', uptime: process.uptime() });
});

// Ruta raíz
const startServer = async () => {
    try {
        console.log('Iniciando Servidor...')
        
        // Intentar inicializar OAuth2 con tokens guardados
        const isAuthenticated = await initializeOAuth2Client();
        
        console.log('\n Estado del Sistema:');
        console.log('─────────────────────────────────────────');
        
        if (isAuthenticated) {
            console.log('Google Calendar: AUTENTICADO');
            console.log('Sistema de turnos: OPERATIVO');
            console.log('Los pacientes pueden solicitar turnos');
        } else {
            console.log('Google Calendar: NO AUTENTICADO');
            console.log('Sistema de turnos: LIMITADO');
            console.log('Se requiere autenticación inicial');
        }


        app.listen(PORT, '0.0.0.0', () => {
            console.log('─────────────────────────────────────────');
            console.log(`URL: ${BACKEND_URL}`);
            console.log(`URL: ${FRONTEND_URL}`);
            console.log('─────────────────────────────────────────');
            if (!isAuthenticated) {
                console.log('─────────────────────────────────────────');
                console.log(`Visita: ${BACKEND_URL}/auth/google`);
            }
        });
    } catch (error) {
        console.error('Error iniciando servidor:', error);
        console.error('Detalles:', error.message);
        process.exit(1);
    }
};

// Iniciar servidor
startServer();
