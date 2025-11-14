import { pool } from '../Database/db.js';
import { google } from 'googleapis';
import { getOAuth2Client } from '../Services/googleTokens.Service.js';
import { getArgentinaDate, formatDateArgentina } from '../utils/timezone.js';

// Obtener el cliente OAuth2 con persistencia de tokens
const oauth2Client = getOAuth2Client();

// GET /api/turnos/fechas-disponibles
export const getFechasDisponibles = async (req, res) => {
    try {
        // Verificar autenticación con Google Calendar
        if (!oauth2Client.credentials || !oauth2Client.credentials.access_token) {
            return res.status(401).json({
                success: false,
                message: 'No hay token de autenticación disponible. Conecte con Google Calendar primero.'
            });
        }

        // Obtener fecha actual en Argentina
        const todayArgentina = getArgentinaDate();
        todayArgentina.setHours(0, 0, 0, 0);
        
        const availableDates = [];
        const dayNames = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];
        
        // Iterar día por día desde hoy hasta 30 días adelante
        for (let i = 0; i <= 30; i++) {
            const currentDate = new Date(todayArgentina);
            currentDate.setDate(todayArgentina.getDate() + i);
            
            const dayOfWeek = currentDate.getDay();
            
            // Solo incluir días laborables (1=Lunes, 2=Martes, 3=Miércoles, 4=Jueves, 5=Viernes)
            if (dayOfWeek >= 1 && dayOfWeek <= 5) {
                const dateString = formatDateArgentina(currentDate);
                
                availableDates.push({
                    date: dateString,
                    day_name: dayNames[dayOfWeek],
                    day_number: dayOfWeek,
                    is_today: i === 0
                });
            }
        }

        const startDate = formatDateArgentina(todayArgentina);
        const maxDate = new Date(todayArgentina);
        maxDate.setDate(maxDate.getDate() + 30);
        const endDate = formatDateArgentina(maxDate);

        res.status(200).json({
            success: true,
            message: `Fechas disponibles desde ${startDate} hasta ${endDate}`,
            start_date: startDate,
            end_date: endDate,
            total_available_dates: availableDates.length,
            available_dates: availableDates,
            work_schedule: {
                days: 'Lunes a Viernes',
                hours: '12:00 - 19:00',
            }
        });

    } catch (error) {
        console.error('Error al obtener fechas disponibles:', error);
        res.status(500).json({
            success: false,
            message: 'Error interno del servidor al obtener fechas disponibles',
            error: error.message
        });
    }
};

// GET /api/turnos/horarios-disponibles?date=YYYY-MM-DD
export const getHorariosDisponibles = async (req, res) => {
    try {
        const { date } = req.query;

        // Validar que se proporcione la fecha
        if (!date) {
            return res.status(400).json({
                success: false,
                message: 'El parámetro "date" es obligatorio. Use formato: YYYY-MM-DD'
            });
        }

        // Validar formato de fecha y convertir a fecha de Argentina
        const selectedDate = new Date(date + 'T12:00:00');
        if (isNaN(selectedDate.getTime())) {
            return res.status(400).json({
                success: false,
                message: 'Formato de fecha inválido. Use formato: YYYY-MM-DD'
            });
        }

        // Obtener día de la semana en Argentina
        const argDate = getArgentinaDate(selectedDate);
        const dayOfWeek = argDate.getDay();
        
        // Validar que sea día laborable (lunes a viernes)
        if (dayOfWeek === 0 || dayOfWeek === 6) {
            return res.status(400).json({
                success: false,
                message: 'Los turnos solo están disponibles de lunes a viernes'
            });
        }

        // Validar que la fecha no sea pasada (comparar en Argentina)
        const todayArgentina = getArgentinaDate();
        todayArgentina.setHours(0, 0, 0, 0);
        argDate.setHours(0, 0, 0, 0);
        
        if (argDate < todayArgentina) {
            return res.status(400).json({
                success: false,
                message: 'Solo puedes solicitar turnos con 24 horas de anticipacion'
            });
        }

        // Verificar autenticación con Google Calendar
        if (!oauth2Client.credentials || !oauth2Client.credentials.access_token) {
            return res.status(401).json({
                success: false,
                message: 'No hay token de autenticación disponible. Conecte con Google Calendar primero.'
            });
        }

        const calendar = google.calendar({ version: 'v3', auth: oauth2Client });

        // Definir horarios de trabajo (12:00 - 20:00, bloques de 1 hora)
        const WORK_START_HOUR = 12;
        const WORK_END_HOUR = 20;
        const allTimeSlots = [];

        // Generar todos los horarios posibles
        for (let hour = WORK_START_HOUR; hour < WORK_END_HOUR; hour++) {
            allTimeSlots.push({
                time: `${hour.toString().padStart(2, '0')}:00`,
                hour: hour,
                end_time: `${(hour + 1).toString().padStart(2, '0')}:00`,
                available: true
            });
        }

        // 1. Consultar turnos existentes en PostgreSQL para la fecha
        const turnosQuery = `
            SELECT 
                EXTRACT(HOUR FROM date) as hour
            FROM turnos 
            WHERE DATE(date) = $1 AND status = 'confirmed'
        `;
        const turnosResult = await pool.query(turnosQuery, [date]);
        
        // Marcar horarios ocupados por turnos en PostgreSQL
        const occupiedHours = new Set();
        
        turnosResult.rows.forEach(row => { // row.hour es numérico
            occupiedHours.add(parseInt(row.hour)); // Asegurar que sea entero
        });

        // 2. Consultar eventos en Google Calendar para la fecha
        const startOfDay = new Date(date + 'T00:00:00.000Z');
        const endOfDay = new Date(date + 'T23:59:59.999Z');

        const eventsResponse = await calendar.events.list({
            calendarId: 'primary',
            timeMin: startOfDay.toISOString(),
            timeMax: endOfDay.toISOString(),
            singleEvents: true,
            orderBy: 'startTime'
        });

        // Marcar horarios ocupados por eventos de Google Calendar
        // Lógica: Si un evento interfiere con un bloque de 1 hora, ese bloque queda bloqueado
        if (eventsResponse.data.items) {
            eventsResponse.data.items.forEach(event => {
                if (event.start && event.start.dateTime && event.end && event.end.dateTime) {
                    const eventStart = new Date(event.start.dateTime);
                    const eventEnd = new Date(event.end.dateTime);
                    
                    // Recorrer cada bloque de 1 hora del horario laboral
                    for (let hour = WORK_START_HOUR; hour < WORK_END_HOUR; hour++) {
                        // Bloque de 1 hora: hour:00 a (hour+1):00
                        const blockStart = new Date(date + `T${hour.toString().padStart(2, '0')}:00:00`);
                        const blockEnd = new Date(date + `T${(hour + 1).toString().padStart(2, '0')}:00:00`);
                        
                        // Verificar si el evento interfiere con este bloque
                        const hasConflict = (eventStart < blockEnd && eventEnd > blockStart);
                        
                        if (hasConflict) {
                            occupiedHours.add(hour);
                        }
                    }
                }
            });
        }

        // 3. Si es el día actual, marcar horarios pasados como no disponibles (en hora Argentina)
        const nowArgentina = getArgentinaDate();
        const todayArgentinaString = formatDateArgentina(nowArgentina);
        const isToday = date === todayArgentinaString;
        
        if (isToday) {
            const currentHour = nowArgentina.getHours();
            for (let hour = WORK_START_HOUR; hour <= currentHour; hour++) {
                occupiedHours.add(hour);
            }
        }

        // 4. Actualizar disponibilidad de cada slot
        const finalTimeSlots = allTimeSlots.map(slot => {
            const isOccupied = occupiedHours.has(slot.hour);
            return {
                ...slot,
                available: !isOccupied,
                reason: isOccupied ? 'Ocupado' : null
            };
        });

        // Separar horarios disponibles y ocupados
        const availableSlots = finalTimeSlots.filter(slot => slot.available);
        const occupiedSlots = finalTimeSlots.filter(slot => !slot.available);

        const dayNames = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];

        res.status(200).json({
            success: true,
            message: `Horarios para ${date}`,
            date: date,
            day_name: dayNames[dayOfWeek],
            is_today: isToday,
            total_slots: finalTimeSlots.length,
            available_slots: availableSlots.length,
            occupied_slots: occupiedSlots.length,
            work_schedule: {
                start_hour: WORK_START_HOUR,
                end_hour: WORK_END_HOUR,
            },
            available_times: availableSlots,
            occupied_times: occupiedSlots,
            all_times: finalTimeSlots
        });

    } catch (error) {
        console.error('Error al obtener horarios disponibles:', error);
        res.status(500).json({
            success: false,
            message: 'Error interno del servidor al obtener horarios disponibles',
            error: error.message
        });
    }
};

// GET /api/turnos/user
export const getUserTurnos = async (req, res) => {
    try {
        const userId = req.userId;

        // ACTUALIZAR TURNOS VENCIDOS A 'completed' AUTOMÁTICAMENTE (usar hora Argentina)
        const nowArgentina = getArgentinaDate();
        await pool.query(`
            UPDATE turnos 
            SET status = 'completed', updated_at = CURRENT_TIMESTAMP 
            WHERE end_date <= $1 AND status = 'confirmed'
        `, [nowArgentina]);

        // Obtener todos los turnos del usuario ordenados por fecha más reciente primero
        const query = `
            SELECT 
                id,
                TO_CHAR(date, 'YYYY-MM-DD') as date,
                TO_CHAR(date, 'HH24:MI') as hour,
                TO_CHAR(date, 'YYYY-MM-DD HH24:MI:SS') as date_full,
                TO_CHAR(end_date, 'YYYY-MM-DD HH24:MI:SS') as end_date,
                status as state,
                consultation_type,
                patient_notes,
                google_event_id,
                TO_CHAR(created_at, 'YYYY-MM-DD HH24:MI:SS') as createdAt,
                TO_CHAR(updated_at, 'YYYY-MM-DD HH24:MI:SS') as updatedAt
            FROM turnos 
            WHERE user_id = $1 
            ORDER BY date DESC, created_at DESC
        `;
        
        const result = await pool.query(query, [userId]);

        // Transformar los datos para que coincidan con el formato esperado en el frontend
        const turnos = result.rows.map(turno => ({
            id: turno.id,
            date: turno.date,
            hour: turno.hour,
            date_full: turno.date_full,
            end_date: turno.end_date,
            state: turno.state,
            consultation_type: turno.consultation_type || 'Consulta General',
            patient_notes: turno.patient_notes,
            createdAt: turno.createdat,
            updatedAt: turno.updatedat
        }));

        res.status(200).json({
            success: true,
            message: 'Turnos obtenidos exitosamente',
            turnos: turnos
        });

    } catch (error) {
        console.error('Error al obtener turnos del usuario:', error);
        res.status(500).json({
            success: false,
            message: 'Error interno del servidor al obtener los turnos',
            error: error.message
        });
    }
};

// POST /api/turnos
export const createTurno = async (req, res) => {
    try {
        if (req.isAdmin) {
            return res.status(403).json({
                success: false,
                message: 'Los administradores no pueden solicitar turnos.',
                admin: true
            });
        }

        // VALIDACIÓN DE DATOS DE ENTRADA
        const { date, hour, patient_notes, consultation_type = 'Consulta General' } = req.body;
        const user_id = req.userId; // Del middleware de autenticación

        // Validar campos obligatorios
        if (!date || !hour) {
            return res.status(400).json({
                success: false,
                message: 'Los campos "date" y "hour" son obligatorios',
                required_fields: ['date (YYYY-MM-DD)', 'hour (HH:00)']
            });
        }

        // Construir fecha y hora completa en Argentina
        // hour viene en formato "HH:00", extraer solo la hora
        const hourValue = parseInt(hour.split(':')[0]);
        
        // Crear fecha con la hora especificada (importante: agregar T12:00:00 para evitar UTC)
        const turnoDate = new Date(date + 'T12:00:00');
        turnoDate.setHours(hourValue, 0, 0, 0);
        
        // Validar formato de fecha y hora
        if (isNaN(turnoDate.getTime()) || isNaN(hourValue)) {
            return res.status(400).json({
                success: false,
                message: 'Formato de fecha u hora inválido',
                expected_format: {
                    date: 'YYYY-MM-DD',
                    hour: 'HH:00'
                }
            });
        }

        // Calcular fecha de fin (1 hora después)
        const endDate = new Date(turnoDate.getTime() + 60 * 60 * 1000);

        // 2. VALIDACIONES DE NEGOCIO (usar hora Argentina)
        
        // Validar horario de trabajo (12:00 - 20:00)
        const turnoArgentina = getArgentinaDate(turnoDate);
        if (hourValue < 12 || hourValue >= 20) {
            return res.status(400).json({
                success: false,
                message: 'Los turnos solo pueden ser entre las 12:00 y las 19:00 horas',
                allowed_hours: ['12:00', '13:00', '14:00', '15:00', '16:00', '17:00', '18:00', '19:00']
            });
        }

        // Validar días laborables (lunes a viernes) en Argentina
        const dayOfWeek = turnoArgentina.getDay();
        if (dayOfWeek === 0 || dayOfWeek === 6) {
            return res.status(400).json({
                success: false,
                message: 'Los turnos solo pueden ser de lunes a viernes',
                allowed_days: ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes']
            });
        }

        // Validar que la fecha no sea pasada (comparar en Argentina)
        const nowArgentina = getArgentinaDate();
        if (turnoArgentina < nowArgentina) {
            return res.status(400).json({
                success: false,
                message: 'Solo puedes solicitar turnos con 24 horas de anticipacion'
            });
        }

        // 3. VERIFICACIÓN DE USUARIO
        const userCheck = await pool.query(
            'SELECT id, name, lastname, email, phone, is_blocked FROM users WHERE id = $1', 
            [user_id]
        );
        
        if (userCheck.rows.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Usuario no encontrado'
            });
        }
        
        const userData = userCheck.rows[0];

        if (userData.is_blocked) {
            return res.status(403).json({
                success: false,
                message: 'Tu cuenta fue bloqueada por el administrador. Contacta para más información.',
                blocked: true
            });
        }

        // 4. VERIFICACIÓN DE CONFLICTOS EN POSTGRESQL
        const conflictCheck = await pool.query(
            `SELECT id, TO_CHAR(date, 'YYYY-MM-DD HH24:MI') as date 
             FROM turnos 
             WHERE date = $1 AND status = 'confirmed'`,
            [turnoDate]
        );

        if (conflictCheck.rows.length > 0) {
            return res.status(409).json({
                success: false,
                message: 'Ya existe un turno confirmado para esa fecha y hora',
                conflict: {
                    existing_appointment: conflictCheck.rows[0].date,
                    turno_id: conflictCheck.rows[0].id
                }
            });
        }

        // 5. VERIFICACIÓN DE AUTENTICACIÓN CON GOOGLE CALENDAR
        if (!oauth2Client.credentials || !oauth2Client.credentials.access_token) {
            return res.status(401).json({
                success: false,
                message: 'No hay token de autenticación disponible. Conecte con Google Calendar primero.'
            });
        }

        const calendar = google.calendar({ version: 'v3', auth: oauth2Client });

        // 6. VERIFICACIÓN DE CONFLICTOS EN GOOGLE CALENDAR
        const existingEvents = await calendar.events.list({
            calendarId: 'primary',
            timeMin: turnoDate.toISOString(),
            timeMax: endDate.toISOString(),
            singleEvents: true,
        });

        if (existingEvents.data.items && existingEvents.data.items.length > 0) {
            return res.status(409).json({
                success: false,
                message: 'Ya existe un turno para esa fecha y hora. Refresque la pagina'
            });
        }

        // 7. CREAR EVENTO EN GOOGLE CALENDAR
        const eventTitle = `🦷 ${userData.name} ${userData.lastname}`;
        const eventDescription = `
                Consulta odontológica programada

                👤 Paciente: ${userData.name} ${userData.lastname}
                📧 Email: ${userData.email}
                📞 Teléfono: ${userData.phone}
                🦷 Tipo de consulta: ${consultation_type}

                ${patient_notes ? `📝 Notas del paciente: ${patient_notes}` : ''}

            ---
            Creado automáticamente por el sistema de turnos
        `.trim();

        const googleEvent = {
            summary: eventTitle,
            description: eventDescription,
            start: {
                dateTime: turnoDate.toISOString(),
                timeZone: 'America/Argentina/Buenos_Aires',
            },
            end: {
                dateTime: endDate.toISOString(),
                timeZone: 'America/Argentina/Buenos_Aires',
            }
        };

        const createdEvent = await calendar.events.insert({
            calendarId: 'primary',
            requestBody: googleEvent,
        });

        const googleEventId = createdEvent.data.id;

        // 8. CREAR TURNO EN POSTGRESQL
        const insertQuery = `
            INSERT INTO turnos (user_id, date, end_date, status, consultation_type, patient_notes, google_event_id)
            VALUES ($1, $2, $3, $4, $5, $6, $7)
            RETURNING 
                id, 
                TO_CHAR(date, 'YYYY-MM-DD HH24:MI:SS') as date,
                TO_CHAR(end_date, 'YYYY-MM-DD HH24:MI:SS') as end_date,
                status, 
                consultation_type, 
                patient_notes, 
                google_event_id,
                created_at
        `;

        const result = await pool.query(insertQuery, [
            user_id,
            turnoDate,
            endDate,
            'confirmed',
            consultation_type,
            patient_notes || null,
            googleEventId
        ]);

        const newTurno = result.rows[0];

        // 9. RESPUESTA EXITOSA
        res.status(201).json({
            success: true,
            message: 'Turno creado exitosamente',
            turno: {
                id: newTurno.id,
                patient: {
                    name: userData.name,
                    lastname: userData.lastname,
                    email: userData.email,
                    phone: userData.phone
                },
                appointment: {
                    date: newTurno.date,
                    end_date: newTurno.end_date,
                    status: newTurno.status,
                    consultation_type: newTurno.consultation_type,
                    patient_notes: newTurno.patient_notes
                },
                integrations: {
                    google_calendar: {
                        event_id: newTurno.google_event_id,
                        status: 'created',
                    }
                },
                created_at: newTurno.created_at
            }
        });

    } catch (error) {
        console.error('Error al crear turno:', error);

        // Si se creó el evento en Google Calendar pero falló la BD, intentar limpiarlo
        if (error.google_event_id) {
            try {
                const calendar = google.calendar({ version: 'v3', auth: oauth2Client });
                await calendar.events.delete({
                    calendarId: 'primary',
                    eventId: error.google_event_id,
                });
                console.log('Evento de Google Calendar eliminado debido a error en base de datos');
            } catch (cleanupError) {
                console.error('Error al limpiar evento de Google Calendar:', cleanupError);
            }
        }

        // Manejo específico de errores
        if (error.code === '23503') {
            return res.status(404).json({
                success: false,
                message: 'El usuario especificado no existe'
            });
        }

        if (error.code === '23505') {
            return res.status(409).json({
                success: false,
                message: 'Ya existe un turno para esa fecha y hora. Refresque la pagina'
            });
        }

        if (error.code === 401) {
            return res.status(401).json({
                success: false,
                message: 'Token de autenticación con Google Calendar expirado'
            });
        }

        if (error.code === 409 || (error.errors && error.errors[0]?.reason === 'duplicate')) {
            return res.status(409).json({
                success: false,
                message: 'Ya existe un turno para esa fecha y hora. Refresque la pagina'
            });
        }

        res.status(500).json({
            success: false,
            message: 'Error interno del servidor al crear el turno',
            error: error.message
        });
    }
};

// DELETE /api/turnos/:id
export const deleteTurno = async (req, res) => {
    try {
        const { id } = req.params;
        const userId = req.userId;

        // Verificar que el turno existe y pertenece al usuario
        const checkQuery = `
            SELECT id, google_event_id, status, date
            FROM turnos 
            WHERE id = $1 AND user_id = $2
        `;
        const checkResult = await pool.query(checkQuery, [id, userId]);

        if (checkResult.rows.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Turno no encontrado o no tienes permiso para eliminarlo'
            });
        }

        const turno = checkResult.rows[0];

        // ⏰ VALIDACIÓN DE 24 HORAS DE ANTICIPACIÓN (en hora Argentina)
        const nowArgentina = getArgentinaDate();
        const turnoDateTime = new Date(turno.date);
        const turnoArgentina = getArgentinaDate(turnoDateTime);
        const hoursUntilAppointment = (turnoArgentina - nowArgentina) / (1000 * 60 * 60); // Diferencia en horas

        if (hoursUntilAppointment < 24) {
            return res.status(400).json({
                success: false,
                message: 'Solo puedes cancelar turnos con 24 horas de anticipación. Consulta a la odontóloga por WhatsApp.',
                reason: 'cancellation_too_late',
                turno_date: turno.date,
                hours_remaining: Math.round(hoursUntilAppointment * 10) / 10, // Redondear a 1 decimal
                minimum_required_hours: 24
            });
        }

        // Cancelar el turno (no eliminar físicamente)
        const cancelQuery = `
            UPDATE turnos 
            SET status = 'cancelled', updated_at = CURRENT_TIMESTAMP 
            WHERE id = $1 AND user_id = $2
            RETURNING id, TO_CHAR(date, 'YYYY-MM-DD HH24:MI:SS') as date, status
        `;
        const cancelResult = await pool.query(cancelQuery, [id, userId]);

        // También cancelar en Google Calendar
        if (turno.google_event_id) {
            try {
                if (oauth2Client.credentials && oauth2Client.credentials.access_token) {
                    const calendar = google.calendar({ version: 'v3', auth: oauth2Client });
                    await calendar.events.delete({
                        calendarId: 'primary',
                        eventId: turno.google_event_id,
                    });
                }
            } catch (googleError) {
                console.error('Error al eliminar evento en Google Calendar:', googleError);
                // No fallar la operación completa si Google Calendar falla
            }
        }

        res.status(200).json({
            success: true,
            message: 'Turno cancelado exitosamente',
            data: cancelResult.rows[0]
        });

    } catch (error) {
        console.error('Error al eliminar turno:', error);
        res.status(500).json({
            success: false,
            message: 'Error interno del servidor al eliminar el turno',
            error: error.message
        });
    }
};