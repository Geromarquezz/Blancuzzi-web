import { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { toast } from 'react-toastify'
import { useAuth } from '../hooks/useAuth'
import { useTurnos } from '../hooks/useTurnos'
import './Turnos.css'

const Turnos = () => {
    const navigate = useNavigate()
    const { isLoggedIn, isAdmin, loading: authLoading, user, updateUser } = useAuth()
    const { getFechasDisponibles, getHorariosDisponibles, createTurno } = useTurnos()
    const scheduleInfoRef = useRef(null) // Ref para scroll a la sección de horarios
    const adminRedirected = useRef(false)

    const [fechasDisponibles, setFechasDisponibles] = useState([])
    const [horariosDisponibles, setHorariosDisponibles] = useState([])
    const [loading, setLoading] = useState(true)
    const [loadingHorarios, setLoadingHorarios] = useState(false)
    const [creatingTurno, setCreatingTurno] = useState(false)
    const [selectedDate, setSelectedDate] = useState(null)
    const [selectedHour, setSelectedHour] = useState(null)
    const [consultationType, setConsultationType] = useState('Consulta General')
    const [patientNotes, setPatientNotes] = useState('')
    const [currentMonth, setCurrentMonth] = useState(new Date())
    const [currentStep, setCurrentStep] = useState(1) // 1: fecha, 2: hora, 3: tipo/notas, 4: confirmar
    
    // Estados para modal de teléfono
    const [showPhoneModal, setShowPhoneModal] = useState(false)
    const [phoneInput, setPhoneInput] = useState('')
    const [updatingPhone, setUpdatingPhone] = useState(false)

    // Verificar autenticación
    useEffect(() => {
        // Esperar a que termine de validar la sesión
        if (authLoading) return

        if (!isLoggedIn) {
            navigate('/login')
            return
        }

        if (isAdmin) {
            if (!adminRedirected.current) {
                toast.info('El panel de turnos es solo para pacientes. Redirigido al panel administrativo.')
                adminRedirected.current = true
            }
            navigate('/admin', { replace: true })
            return
        }

        // Cargar fechas disponibles
        const loadFechas = async () => {
            try {
                setLoading(true)
                const result = await getFechasDisponibles()

                if (result.success) {
                    setFechasDisponibles(result.fechas)
                } else {
                    toast.error(result.message || 'Error al cargar fechas disponibles')
                }
            } catch (err) {
                console.error('Error cargando fechas:', err)
                toast.error('Error de conexión con el servidor')
            } finally {
                setLoading(false)
            }
        }

        loadFechas()
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [isLoggedIn, isAdmin, authLoading, navigate])

    // Generar días del calendario
    const generateCalendarDays = () => {
        const year = currentMonth.getFullYear()
        const month = currentMonth.getMonth()

        // Primer día del mes
        const firstDay = new Date(year, month, 1)
        // Último día del mes
        const lastDay = new Date(year, month + 1, 0)

        // Día de la semana del primer día (0 = domingo, 1 = lunes, etc.)
        const startDayOfWeek = firstDay.getDay()

        // Array para almacenar todos los días del calendario
        const days = []

        // Agregar días vacíos al inicio (días del mes anterior)
        // Como domingo es 0, no necesitamos ajustar
        for (let i = 0; i < startDayOfWeek; i++) {
            days.push(null)
        }

        // Agregar todos los días del mes
        for (let day = 1; day <= lastDay.getDate(); day++) {
            days.push(new Date(year, month, day))
        }

        return days
    }

    // Verificar si una fecha es fin de semana
    const isWeekend = (date) => {
        if (!date) return false
        const dayOfWeek = date.getDay()
        return dayOfWeek === 0 || dayOfWeek === 6 // 0 = Domingo, 6 = Sábado
    }

    // Verificar si es el día de hoy
    const isToday = (date) => {
        if (!date) return false
        const today = new Date()
        today.setHours(0, 0, 0, 0)
        const compareDate = new Date(date)
        compareDate.setHours(0, 0, 0, 0)
        return compareDate.getTime() === today.getTime()
    }

    // Verificar si una fecha está disponible
    const isDateAvailable = (date) => {
        if (!date) return false
        
        // Los fines de semana NUNCA están disponibles
        if (isWeekend(date)) return false

        const dateString = date.toISOString().split('T')[0]
        return fechasDisponibles.some(fecha => fecha.date === dateString)
    }

    // Verificar si es la fecha seleccionada
    const isDateSelected = (date) => {
        if (!date || !selectedDate) return false
        return date.toISOString().split('T')[0] === selectedDate
    }

    // Manejar click en una fecha
    const handleDateClick = async (date) => {
        if (!date || !isDateAvailable(date)) return

        const dateString = date.toISOString().split('T')[0]
        setSelectedDate(dateString)
        setSelectedHour(null)
        setCurrentStep(2)

        // Cargar horarios disponibles para la fecha seleccionada
        try {
            setLoadingHorarios(true)

            const result = await getHorariosDisponibles(dateString)

            if (result.success) {
                setHorariosDisponibles(result.horarios)

                // Hacer scroll a la sección de horarios en mobile (después de cargar)
                setTimeout(() => {
                    if (scheduleInfoRef.current && window.innerWidth <= 768) {
                        scheduleInfoRef.current.scrollIntoView({
                            behavior: 'instant',
                            block: 'start'
                        })
                    }
                }, 100)
            } else {
                toast.error(result.message || 'Error al cargar horarios disponibles')
                setHorariosDisponibles([])
            }
        } catch (err) {
            console.error('Error cargando horarios:', err)
            toast.error('Error de conexión al cargar horarios')
            setHorariosDisponibles([])
        } finally {
            setLoadingHorarios(false)
        }
    }

    // Manejar selección de horario
    const handleHourClick = (hour) => {
        setSelectedHour(hour)
        setCurrentStep(3) // Ir al paso de tipo de consulta y notas
    }

    // Continuar a confirmación
    const handleContinueToConfirm = () => {
        setCurrentStep(4) // Ir al paso de confirmación
    }

    // Manejar confirmación y creación del turno
    const handleConfirmTurno = async () => {
        if (!selectedDate || !selectedHour) {
            toast.error('Debe seleccionar una fecha y un horario')
            return
        }

        // Verificar que el usuario tenga un teléfono válido
        if (!user.phone || user.phone === '0000000000') {
            setShowPhoneModal(true)
            return
        }

        await proceedWithTurnoCreation()
    }

    // Proceder con la creación del turno (después de validar teléfono)
    const proceedWithTurnoCreation = async () => {
        try {
            setCreatingTurno(true)

            const turnoData = {
                date: selectedDate,
                hour: selectedHour,
                consultation_type: consultationType,
                patient_notes: patientNotes.trim() || null
            }

            const result = await createTurno(turnoData)

            if (result.success) {
                // Mostrar mensaje de éxito y redirigir al perfil
                toast.success('¡Turno creado exitosamente!')
                setTimeout(() => {
                    navigate('/profile')
                }, 2000)
            } else {
                // Verificar si el error es por falta de verificación de cuenta
                if (result.requiresVerification) {
                    // Mostrar toast con botón para ir a verificar
                    toast.error(
                        <div>
                            <p style={{ marginBottom: '10px' }}>
                                {result.message || 'Debes verificar tu cuenta antes de agendar turnos'}
                            </p>
                            <button
                                onClick={() => navigate('/verify-account')}
                                style={{
                                    background: '#4a90e2',
                                    color: 'white',
                                    border: 'none',
                                    padding: '8px 16px',
                                    borderRadius: '4px',
                                    cursor: 'pointer',
                                    fontSize: '0.9rem',
                                    fontWeight: '600'
                                }}
                            >
                                Verificar Ahora
                            </button>
                        </div>,
                        {
                            autoClose: 6000,
                            closeButton: true
                        }
                    )
                } else {
                    toast.error(result.message || 'Error al crear el turno')
                }
            }
        } catch (err) {
            console.error('Error creando turno:', err)
            toast.error('Error de conexión al crear el turno')
        } finally {
            setCreatingTurno(false)
        }
    }

    // Manejar actualización de teléfono desde el modal
    const handleUpdatePhone = async () => {
        if (!phoneInput || phoneInput.trim().length < 9) {
            toast.error('Por favor ingresa un número de teléfono válido (mínimo 9 dígitos)')
            return
        }

        setUpdatingPhone(true)
        try {
            await updateUser({ phone: phoneInput.trim() })
            toast.success('Teléfono actualizado correctamente')
            setShowPhoneModal(false)
            setPhoneInput('')
            // Proceder con la creación del turno
            await proceedWithTurnoCreation()
        } catch (error) {
            console.error('Error al actualizar teléfono:', error)
            toast.error(error.message || 'Error al actualizar el teléfono')
        } finally {
            setUpdatingPhone(false)
        }
    }

    // Volver al paso anterior
    const handleBack = () => {
        if (currentStep === 4) {
            // De confirmación a tipo/notas
            setCurrentStep(3)
        } else if (currentStep === 3) {
            // De tipo/notas a horarios
            setSelectedHour(null)
            setCurrentStep(2)
        } else if (currentStep === 2) {
            // De horarios a calendario
            setSelectedDate(null)
            setSelectedHour(null)
            setConsultationType('Consulta General')
            setPatientNotes('')
            setHorariosDisponibles([])
            setCurrentStep(1)
        }
    }

    // Navegar al mes anterior
    const goToPreviousMonth = () => {
        setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1))
    }

    // Navegar al mes siguiente
    const goToNextMonth = () => {
        setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1))
    }

    // Obtener nombre del mes y año
    const getMonthYearText = () => {
        const months = [
            'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
            'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
        ]
        return `${months[currentMonth.getMonth()]} ${currentMonth.getFullYear()}`
    }

    // Verificar si podemos ir al mes anterior (no antes del mes actual)
    const canGoPrevious = () => {
        const today = new Date()
        const firstOfCurrentMonth = new Date(today.getFullYear(), today.getMonth(), 1)
        const firstOfDisplayedMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), 1)
        return firstOfDisplayedMonth > firstOfCurrentMonth
    }

    const calendarDays = generateCalendarDays()

    if (isAdmin) {
        return null
    }

    if (loading) {
        return (
            <div className="turnos-container">
                <div className="turnos-loading">
                    <div className="spinner"></div>
                    <p>Cargando fechas disponibles...</p>
                </div>
            </div>
        )
    }

    return (
        <div className="turnos-container">
            <div className="turnos-header">
                <h2>Selecciona una fecha disponible para tu consulta</h2>
            </div>

            <div className="turnos-content">
                {/* Calendario */}
                <div className="calendar-section">
                    <div className="calendar-header">
                        <button
                            className="calendar-nav-btn"
                            onClick={goToPreviousMonth}
                            disabled={!canGoPrevious()}
                            aria-label="Mes anterior"
                        >
                            ◀
                        </button>
                        <h2 className="calendar-month">{getMonthYearText()}</h2>
                        <button
                            className="calendar-nav-btn"
                            onClick={goToNextMonth}
                            aria-label="Mes siguiente"
                        >
                            ▶
                        </button>
                    </div>

                    <div className="calendar">
                        {/* Días de la semana */}
                        <div className="calendar-weekdays">
                            <div className="calendar-weekday">Dom</div>
                            <div className="calendar-weekday">Lun</div>
                            <div className="calendar-weekday">Mar</div>
                            <div className="calendar-weekday">Mié</div>
                            <div className="calendar-weekday">Jue</div>
                            <div className="calendar-weekday">Vie</div>
                            <div className="calendar-weekday">Sáb</div>
                        </div>

                        {/* Días del mes */}
                        <div className="calendar-days">
                            {calendarDays.map((date, index) => {
                                if (!date) {
                                    return <div key={`empty-${index}`} className="calendar-day empty"></div>
                                }

                                const available = isDateAvailable(date)
                                const selected = isDateSelected(date)
                                const todayDay = isToday(date)
                                const weekend = isWeekend(date)

                                return (
                                    <div
                                        key={index}
                                        className={`calendar-day ${available ? 'available' : 'unavailable'} ${selected ? 'selected' : ''} ${todayDay ? 'today' : ''} ${weekend ? 'weekend' : ''}`}
                                        onClick={() => handleDateClick(date)}
                                        role={available ? 'button' : 'presentation'}
                                        tabIndex={available ? 0 : -1}
                                        aria-label={available ? `Seleccionar ${date.getDate()} de ${getMonthYearText()}` : `${date.getDate()} no disponible`}
                                    >
                                        <span className="day-number">{date.getDate()}</span>
                                    </div>
                                )
                            })}
                        </div>
                    </div>

                    {/* Leyenda */}
                    <div className="calendar-legend">
                        <div className="legend-item">
                            <span className="legend-color available"></span>
                            <span>Disponible</span>
                        </div>
                        <div className="legend-item">
                            <span className="legend-color unavailable"></span>
                            <span>No disponible</span>
                        </div>
                        <div className="legend-item">
                            <span className="legend-color selected"></span>
                            <span>Seleccionado</span>
                        </div>
                    </div>
                </div>

                {/* Información de horarios y selección */}
                <div className="schedule-info" ref={scheduleInfoRef}>
                    {/* Paso 1: Información general */}
                    {currentStep === 1 && (
                        <>
                            <h3>Horarios de atención</h3>
                            <div className="info-card">
                                <p><strong>📅 Días:</strong> Lunes a Viernes</p>
                                <p><strong>🕐 Horarios:</strong> 12:00 - 20:00 hs</p>
                            </div>
                            <div className="info-message">
                                <p>👆 Selecciona una fecha disponible en el calendario para ver los horarios</p>
                            </div>
                        </>
                    )}

                    {/* Paso 2: Selección de horario */}
                    {currentStep === 2 && (
                        <>
                            <div className="selected-date-info">
                                <h4>Fecha:</h4>
                                <p className="selected-date-text">
                                    {new Date(selectedDate + 'T12:00:00').toLocaleDateString('es-AR', {
                                        weekday: 'long',
                                        year: 'numeric',
                                        month: 'long',
                                        day: 'numeric'
                                    })}
                                </p>
                            </div>

                            <div className="step-header">
                                <button className="back-btn" onClick={handleBack}>
                                    ← Volver
                                </button>
                                <h3>Horarios disponibles:</h3>
                            </div>


                            {loadingHorarios ? (
                                <div className="loading-horarios">
                                    <div className="spinner-small"></div>
                                    <p>Cargando horarios...</p>
                                </div>
                            ) : horariosDisponibles.length === 0 ? (
                                <div className="no-horarios">
                                    <p>😔 No hay horarios disponibles para esta fecha</p>
                                    <button className="back-btn" onClick={handleBack}>
                                        Elegir otra fecha
                                    </button>
                                </div>
                            ) : (
                                <div className="horarios-grid">
                                    {horariosDisponibles.map((horario) => (
                                        <button
                                            key={horario.time}
                                            className={`horario-btn ${!horario.available ? 'disabled' : ''} ${selectedHour === horario.time ? 'selected' : ''}`}
                                            onClick={() => horario.available && handleHourClick(horario.time)}
                                            disabled={!horario.available}
                                        >
                                            <span className="hour-time">{horario.time}</span>
                                            {!horario.available && <span className="hour-status">Ocupado</span>}
                                        </button>
                                    ))}
                                </div>
                            )}
                        </>
                    )}

                    {/* Paso 3: Tipo de consulta y notas */}
                    {currentStep === 3 && (
                        <>
                            <div className="selected-date-info">
                                <h4>Fecha y hora:</h4>
                                <p className="selected-date-text">
                                    {new Date(selectedDate + 'T12:00:00').toLocaleDateString('es-AR', {
                                        weekday: 'long',
                                        day: 'numeric',
                                        month: 'long',
                                        year: 'numeric'
                                    })}
                                    {' a las '}
                                    {selectedHour} hs
                                </p>
                            </div>

                            <div className="step-header">
                                <button className="back-btn" onClick={handleBack}>
                                    ← Volver
                                </button>
                                <h3>Detalles de la consulta</h3>
                            </div>


                            <div className="consultation-form">
                                <div className="form-group">
                                    <label htmlFor="consultation-type">
                                        <strong>Tipo de consulta:</strong>
                                    </label>
                                    <select
                                        id="consultation-type"
                                        value={consultationType}
                                        onChange={(e) => setConsultationType(e.target.value)}
                                        className="form-select"
                                    >
                                        <option value="Consulta General">Consulta General</option>
                                    </select>
                                </div>

                                <div className="form-group">
                                    <label htmlFor="patient-notes">
                                        <strong>Notas adicionales (opcional):</strong>
                                    </label>
                                    <textarea
                                        id="patient-notes"
                                        value={patientNotes}
                                        onChange={(e) => setPatientNotes(e.target.value)}
                                        className="form-textarea"
                                        placeholder="Describe tus síntomas, dudas o cualquier información que consideres importante para la consulta..."
                                        rows="5"
                                        maxLength="500"
                                    />
                                    <div className="char-counter">
                                        {patientNotes.length}/500 caracteres
                                    </div>
                                </div>

                                <button
                                    className="continue-btn-full"
                                    onClick={handleContinueToConfirm}
                                >
                                    Continuar a confirmación →
                                </button>
                            </div>
                        </>
                    )}

                    {/* Paso 4: Confirmación */}
                    {currentStep === 4 && (
                        <>
                            <div className="step-header">
                                <button className="back-btn" onClick={handleBack}>
                                    ← Volver
                                </button>
                                <h3>Confirmación de  turno</h3>
                            </div>

                            <div className="confirmation-card">
                                <h4>Resumen del turno:</h4>
                                <div className="confirmation-details">
                                    <div className="detail-row">
                                        <span className="detail-label">Fecha:</span>
                                        <span className="detail-value">
                                            {new Date(selectedDate + 'T12:00:00').toLocaleDateString('es-AR', {
                                                weekday: 'long',
                                                day: 'numeric',
                                                month: 'long',
                                                year: 'numeric'
                                            })}
                                        </span>
                                    </div>
                                    <div className="detail-row">
                                        <span className="detail-label">Hora:</span>
                                        <span className="detail-value">{selectedHour} hs</span>
                                    </div>
                                    <div className="detail-row">
                                        <span className="detail-label">Tipo:</span>
                                        <span className="detail-value">{consultationType}</span>
                                    </div>
                                    <div className="detail-row">
                                        <span className="detail-label">Duración:</span>
                                        <span className="detail-value">1 hora</span>
                                    </div>
                                    {patientNotes && (
                                        <div className="detail-row notes-row">
                                            <span className="detail-label">Notas:</span>
                                            <span className="detail-value notes-value">{patientNotes}</span>
                                        </div>
                                    )}
                                </div>

                                <button
                                    className="confirm-btn"
                                    onClick={handleConfirmTurno}
                                    disabled={creatingTurno}
                                >
                                    {creatingTurno ? (
                                        <>
                                            <div className="spinner-small"></div>
                                            Creando turno...
                                        </>
                                    ) : (
                                        'Confirmar turno'
                                    )}
                                </button>
                            </div>
                        </>
                    )}
                </div>
            </div>

            {/* Modal para completar teléfono */}
            {showPhoneModal && (
                <div className="modal-overlay" onClick={() => setShowPhoneModal(false)}>
                    <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                        <div className="modal-header">
                            <h3>📞 Teléfono Requerido</h3>
                        </div>
                        <div className="modal-body">
                            <p style={{ marginBottom: '15px', color: '#555', lineHeight: '1.6' }}>
                                Para confirmar tu turno necesitamos tu número de teléfono. 
                                La odontóloga lo utilizará para comunicarse contigo en caso de cambios 
                                en el turno o cualquier eventualidad.
                            </p>
                            <input
                                type="tel"
                                value={phoneInput}
                                onChange={(e) => setPhoneInput(e.target.value)}
                                placeholder="Ej: 1123456789"
                                className="phone-input"
                                maxLength="20"
                                disabled={updatingPhone}
                            />
                            <small style={{ display: 'block', marginTop: '5px', color: '#777' }}>
                                Mínimo 9 dígitos
                            </small>
                        </div>
                        <div className="modal-footer">
                            <button
                                className="btn-secondary"
                                onClick={() => setShowPhoneModal(false)}
                                disabled={updatingPhone}
                            >
                                Cancelar
                            </button>
                            <button
                                className="btn-primary"
                                onClick={handleUpdatePhone}
                                disabled={updatingPhone || !phoneInput}
                            >
                                {updatingPhone ? 'Guardando...' : 'Guardar y Continuar'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}

export default Turnos
