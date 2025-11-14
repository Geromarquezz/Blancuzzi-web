import { google } from 'googleapis';
import { getOAuth2Client } from '../Services/googleTokens.Service.js';
import { getArgentinaDate } from '../utils/timezone.js';
import { pool } from '../Database/db.js';
import dotenv from 'dotenv';

const oauth2Client = getOAuth2Client();

dotenv.config();

const BACKEND_URL = process.env.BACKEND_URL;

// Función principal de sincronización entre Google Calendar y PostgreSQL
async function syncCalendarWithDatabase() {
    try {
        console.log('Iniciando sincronización Calendar → PostgreSQL...');

        if (!oauth2Client.credentials || !oauth2Client.credentials.access_token) {
            throw new Error('Token de acceso no disponible');
        }

        const calendar = google.calendar({ version: 'v3', auth: oauth2Client });

        // Obtener eventos solo de los próximos 30 días (para sincronizar con turnos)
        const nowArgentina = getArgentinaDate();
        const maxDate = new Date(nowArgentina);
        maxDate.setDate(maxDate.getDate() + 30);
        
        const response = await calendar.events.list({
            calendarId: 'primary',
            timeMin: nowArgentina.toISOString(),
            timeMax: maxDate.toISOString(), // Limitar a 30 días
            maxResults: 100,
            singleEvents: true,
            orderBy: 'startTime'
        });

        const calendarEvents = response.data.items || [];
        console.log(`📅 Eventos encontrados en Google Calendar: ${calendarEvents.length}`);
        
        // Log detallado de cada evento (temporal para debug)
        calendarEvents.forEach((event, index) => {
            console.log(`  ${index + 1}. ${event.summary} - ${event.start?.dateTime || event.start?.date} - ID: ${event.id}`);
        });

        // Obtener todos los turnos futuros de la base de datos
        const turnosResult = await pool.query(
            `SELECT id, google_event_id, date, status, user_id 
             FROM turnos 
             WHERE date >= $1 AND status = 'confirmed'`,
            [nowArgentina]
        );
        const turnosDB = turnosResult.rows;
        console.log(`Turnos confirmados en BD: ${turnosDB.length}`);

        // Crear mapas para comparación rápida
        const calendarEventIds = new Set(calendarEvents.map(e => e.id));
        const turnosMap = new Map(turnosDB.map(t => [t.google_event_id, t]));

        let cancelados = 0;
        let mantenidos = 0;

        // Buscar turnos que fueron eliminados del calendario
        for (const turno of turnosDB) {
            if (!turno.google_event_id) {
                console.log(`Turno ${turno.id} sin google_event_id`);
                continue;
            }

            if (!calendarEventIds.has(turno.google_event_id)) {
                // El evento fue eliminado del calendario, cancelar el turno
                await pool.query(
                    `UPDATE turnos 
                     SET status = 'cancelled', updated_at = CURRENT_TIMESTAMP 
                     WHERE id = $1`,
                    [turno.id]
                );
                cancelados++;
                console.log(`Turno ${turno.id} cancelado (eliminado del calendar)`);
            } else {
                mantenidos++;
            }
        }

        console.log('Sincronización completada:');
        console.log(`   - Turnos cancelados: ${cancelados}`);
        console.log(`   - Turnos mantenidos: ${mantenidos}`);

        return {
            success: true,
            calendarEvents: calendarEvents.length,
            turnosDB: turnosDB.length,
            cancelados,
            mantenidos
        };

    } catch (error) {
        console.error('Error en sincronización:', error);
        throw error;
    }
}

// Configurar webhook para recibir notificaciones de cambios en el calendario
export async function setupWebhook (req, res) {
    try {
        if (!oauth2Client.credentials || !oauth2Client.credentials.access_token) {
            return res.status(401).json({ 
                success: false, 
                error: 'Token de acceso no disponible' 
            });
        }

        const calendar = google.calendar({ version: 'v3', auth: oauth2Client });
        
        // Configurar webhook para recibir notificaciones de cambios
        const webhook = await calendar.events.watch({
            calendarId: 'primary',
            requestBody: {
                id: `webhook-${Date.now()}`, // ID único
                type: 'web_hook',
                address: `${BACKEND_URL}/api/calendar-webhook`, // URL del webhook
                expiration: Date.now() + (7 * 24 * 60 * 60 * 1000) // Expira en 7 días
            }
        });

        console.log('📡 Webhook configurado:', webhook.data);
        
        res.json({ 
            success: true, 
            webhook: webhook.data,
            message: 'Webhook configurado correctamente para recibir actualizaciones automáticas' 
        });
        
    } catch (error) {
        console.error('Error al configurar webhook:', error);
        res.status(500).json({ 
            success: false, 
            error: 'Error al configurar webhook',
            details: error.message 
        });
    }
};

// Manejar notificaciones del webhook (llamado automáticamente por Google)
export async function handleWebhook (req, res) {
    console.log('📨 Notificación recibida de Google Calendar');
    
    // Responder inmediatamente a Google (requiere respuesta rápida)
    res.status(200).send('OK');
    
    // Ejecutar sincronización en background
    try {
        // Esperar 2 segundos para que Google termine de propagar el cambio
        setTimeout(async () => {
            try {
                await syncCalendarWithDatabase();
                console.log('Sincronización automática completada');
            } catch (error) {
                console.error('Error en sincronización automática:', error);
            }
        }, 2000);
    } catch (error) {
        console.error('Error al programar sincronización:', error);
    }
};

// Endpoint manual para que el admin sincronice cuando quiera
export async function manualSync (req, res) {
    try {
        // Verificar que sea admin (middleware ya lo validó)
        if (!req.isAdmin) {
            return res.status(403).json({
                success: false,
                message: 'Solo administradores pueden sincronizar manualmente'
            });
        }

        console.log('🔘 Sincronización manual iniciada por admin');
        
        const result = await syncCalendarWithDatabase();
        
        res.json({
            success: true,
            message: 'Sincronización completada exitosamente',
            data: result
        });

    } catch (error) {
        console.error('Error en sincronización manual:', error);
        res.status(500).json({
            success: false,
            message: 'Error al sincronizar con Google Calendar',
            error: error.message
        });
    }
};

export function getHealthStatus (req, res) {
    const nowArgentina = getArgentinaDate();
    
    res.json({ 
        status: 'OK', 
        message: 'Backend API funcionando correctamente',
        timezone: 'America/Argentina/Buenos_Aires (UTC-3)',
        argentineTime: nowArgentina.toLocaleString('es-AR', { timeZone: 'America/Argentina/Buenos_Aires' }),
        timestamp: nowArgentina.toISOString(),
        date: nowArgentina.toLocaleDateString('es-AR'),
        time: nowArgentina.toLocaleTimeString('es-AR')
    });
};

export default { setupWebhook, handleWebhook, manualSync, getHealthStatus };
