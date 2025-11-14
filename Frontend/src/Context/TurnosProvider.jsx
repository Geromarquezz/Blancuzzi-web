import { useState, useEffect, useCallback } from 'react'
import { TurnosContext } from './TurnosContext.jsx'
import { useAuth } from '../hooks/useAuth.js'
import { apiRequest } from '../utils/apiHandler.js'

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL

export const TurnosProvider = ({ children }) => {
    const { isLoggedIn, isAdmin } = useAuth()
    const [turnos, setTurnos] = useState([])
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState(null)

    // Obtener turnos del usuario
    const getTurnos = useCallback(async () => {
        if (!isLoggedIn) return { success: false, message: 'Usuario no logueado' }
        if (isAdmin) {
            return { success: false, message: 'Los administradores no gestionan turnos' }
        }
        
        setLoading(true)
        setError(null)
        try {
            const result = await apiRequest(`${API_BASE_URL}/api/turnos/user`, {
                credentials: 'include'
            })

            // Si hay rate limiting, devolver el error
            if (result.rateLimited) {
                return { success: false, message: result.message }
            }

            if (result.success) {
                // El apiHandler envuelve la respuesta en result.data
                // Backend envía: { success: true, turnos: [...] }
                // apiHandler lo convierte en: { success: true, data: { success: true, turnos: [...] } }
                setTurnos(result.data.turnos || [])
                return { success: true, turnos: result.data.turnos }
            } else {
                setError(result.message || 'Error obteniendo turnos')
                return { success: false, message: result.message }
            }
        } catch (error) {
            console.error('Error obteniendo turnos:', error)
            setError('Error de conexión con el servidor')
            return { success: false, message: 'Error de conexión' }
        } finally {
            setLoading(false)
        }
    }, [isLoggedIn, isAdmin])

    // Obtener fechas disponibles
    const getFechasDisponibles = async () => {
        setLoading(true)
        try {
            const result = await apiRequest(`${API_BASE_URL}/api/turnos/fechas-disponibles`)

            // Si hay rate limiting, devolver el error
            if (result.rateLimited) {
                return { success: false, message: result.message }
            }
            
            if (result.success) {
                return { success: true, fechas: result.data.available_dates }
            } else {
                setError(result.message || 'Error obteniendo fechas')
                return { success: false, message: result.message }
            }
        } catch (error) {
            console.error('Error obteniendo fechas:', error)
            setError('Error de conexión con el servidor')
            return { success: false, message: 'Error de conexión' }
        } finally {
            setLoading(false)
        }
    }

    // Obtener horarios disponibles para una fecha
    const getHorariosDisponibles = async (date) => {
        setLoading(true)
        try {
            const result = await apiRequest(`${API_BASE_URL}/api/turnos/horarios-disponibles?date=${date}`)

            // Si hay rate limiting, devolver el error
            if (result.rateLimited) {
                return { success: false, message: result.message }
            }

            if (result.success) {
                return { success: true, horarios: result.data.available_times }
            } else {
                setError(result.message || 'Error obteniendo horarios')
                return { success: false, message: result.message }
            }
        } catch (error) {
            console.error('Error obteniendo horarios:', error)
            setError('Error de conexión con el servidor')
            return { success: false, message: 'Error de conexión' }
        } finally {
            setLoading(false)
        }
    }

    // Crear nuevo turno
    const createTurno = async (turnoData) => {
        if (!isLoggedIn) return { success: false, message: 'Usuario no logueado' }
        if (isAdmin) return { success: false, message: 'Los administradores no pueden crear turnos' }

        setLoading(true)
        setError(null)
        try {
            const result = await apiRequest(`${API_BASE_URL}/api/turnos`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(turnoData)
            })

            // Si hay rate limiting, devolver el error
            if (result.rateLimited) {
                return { success: false, message: result.message }
            }

            if (result.success) {
                // Actualizar la lista de turnos después de crear uno nuevo
                await getTurnos()
                return { success: true, turno: result.data.turno, message: result.message }
            } else {
                setError(result.message || 'Error creando turno')
                return { success: false, message: result.message }
            }
        } catch (error) {
            console.error('Error creando turno:', error)
            setError('Error de conexión con el servidor')
            return { success: false, message: 'Error de conexión' }
        } finally {
            setLoading(false)
        }
    }

    // Cancelar turno
    const cancelTurno = async (turnoId) => {
        if (!isLoggedIn) return { success: false, message: 'Usuario no logueado' }
        if (isAdmin) return { success: false, message: 'Los administradores no pueden cancelar turnos' }

        setLoading(true)
        setError(null)
        try {
            const result = await apiRequest(`${API_BASE_URL}/api/turnos/${turnoId}`, {
                method: 'DELETE'
            })

            // Si hay rate limiting, devolver el error
            if (result.rateLimited) {
                return { success: false, message: result.message }
            }

            if (result.success) {
                // Actualizar la lista de turnos después de cancelar
                await getTurnos()
                return { success: true, message: result.message }
            } else {
                setError(result.message || 'Error cancelando turno')
                // Incluir el reason en la respuesta para identificar el tipo de error
                return { 
                    success: false, 
                    message: result.message,
                    reason: result.data?.reason
                }
            }
        } catch (error) {
            console.error('Error cancelando turno:', error)
            setError('Error de conexión con el servidor')
            return { success: false, message: 'Error de conexión' }
        } finally {
            setLoading(false)
        }
    }

    // Limpiar turnos cuando el usuario se desloguea
    useEffect(() => {
        if (!isLoggedIn || isAdmin) {
            setTurnos([])
            setError(null)
        } else {
            // Cargar turnos automáticamente cuando se loguea (solo una vez)
            getTurnos()
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [isLoggedIn, isAdmin]) // 

    const value = {
        // Estado
        turnos,
        loading,
        error,
        
        // Acciones
        getTurnos,
        getFechasDisponibles,
        getHorariosDisponibles,
        createTurno,
        cancelTurno,
        
        // Utilidades
        refreshTurnos: getTurnos
    }

    return (
        <TurnosContext.Provider value={value}>
            {children}
        </TurnosContext.Provider>
    )
}

export default TurnosProvider