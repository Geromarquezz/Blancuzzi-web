import { useEffect, useState } from 'react'
import { AuthContext } from './AuthContext.jsx'
import { apiRequest } from '../utils/apiHandler.js'

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL

export const AuthProvider = ({ children }) => {
    const [isLoggedIn, setIsLoggedIn] = useState(false)
    const [isAuthenticated, setIsAuthenticated] = useState(false)
    const [loading, setLoading] = useState(false)
    const [user, setUser] = useState(null)

    // Función auxiliar para obtener datos del usuario actual autenticado
    const getUserData = async (silentFail = false) => {
        try {
            // Obtener datos del usuario autenticado
            const response = await fetch(`${API_BASE_URL}/api/users/me`, {
                credentials: 'include'
            })

            const data = await response.json()

            // Si es validación silenciosa (al cargar página), no mostrar errores
            if (silentFail && !response.ok) {
                return { success: false, message: data.message || 'No autenticado' }
            }

            // Si no es validación silenciosa, usar el handler normal
            if (!silentFail && response.status === 429) {
                return { success: false, message: data.message, rateLimited: true }
            }

            if (response.ok && data.success && data.user) {
                const fetchedUser = data.user
                const role = fetchedUser.role || (fetchedUser.id === 1 ? 'admin' : 'patient')

                setUser({
                    ...fetchedUser,
                    role
                })
                return { success: true, user: { ...fetchedUser, role } }
            }
            
            if (!silentFail) {
                console.error('getUserData - estructura de respuesta inesperada')
            }
            return { success: false, message: 'No se pudieron obtener los datos del usuario' }
        } catch (error) {
            if (!silentFail) {
                console.error('Error obteniendo datos del usuario:', error)
            }
            return { success: false, message: 'Error de conexión' }
        }
    }

    // Restaurar sesión si existe una cookie válida
    useEffect(() => {
        let isMounted = true

        const initializeSession = async () => {
            setLoading(true)
            try {
                // silentFail = true para no mostrar errores en consola
                // Es normal que no haya token en páginas públicas
                const result = await getUserData(true)

                if (!isMounted) return

                if (result.success && result.user) {
                    setIsLoggedIn(true)
                    setIsAuthenticated(true)
                } else {
                    setIsLoggedIn(false)
                    setIsAuthenticated(false)
                    setUser(null)
                }
            } catch (error) {
                if (!isMounted) return

                // No mostrar error en consola, es normal en páginas públicas
                setIsLoggedIn(false)
                setIsAuthenticated(false)
                setUser(null)
            } finally {
                if (isMounted) {
                    setLoading(false)
                }
            }
        }

        initializeSession()

        return () => {
            isMounted = false
        }
    }, [])

    const register = async (formData) => {
        setLoading(true)
        try {
            const result = await apiRequest(`${API_BASE_URL}/api/auth/register`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(formData)
            })

            // Si hay rate limiting, devolver el error
            if (result.rateLimited) {
                return { success: false, message: result.message }
            }

            if (result.success) {
                setIsLoggedIn(true)
                setIsAuthenticated(true)

                const roleFromResponse = result.data?.data?.role || 'patient'

                const userResponse = await getUserData()

                if (!userResponse.success) {
                    setUser({
                        name: formData.name,
                        lastname: formData.lastname,
                        email: formData.email,
                        phone: formData.phone,
                        role: roleFromResponse
                    })
                }
                return { success: true, message: result.message || 'Registro exitoso' }
            } else {
                return { success: false, message: result.message || 'Error en el registro' }
            }
        } catch (error) {
            console.error('Error en registro:', error)
            return { success: false, message: 'Error de conexión con el servidor' }
        } finally {
            setLoading(false)
        }
    }

    const login = async (email, password) => {
        setLoading(true)
        try {
            const result = await apiRequest(`${API_BASE_URL}/api/auth/login`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ email, password })
            })

            // Si hay rate limiting, devolver el error
            if (result.rateLimited) {
                return { success: false, message: result.message }
            }

            if (result.success) {
                setIsLoggedIn(true)
                setIsAuthenticated(true)

                const roleFromResponse = result.data?.data?.role || 'patient'

                // Intentar obtener datos del usuario después del login
                try {
                    const userResponse = await getUserData()

                    if (!userResponse.success) {
                        setUser(prevUser => ({
                            ...(prevUser || {}),
                            email,
                            role: roleFromResponse
                        }))
                    }
                } catch (userError) {
                    console.error('Error obteniendo datos del usuario:', userError)
                    setUser({ email, role: roleFromResponse })
                }

                return { success: true, message: result.message || 'Login exitoso' }
            } else {
                return { success: false, message: result.message || 'Credenciales incorrectas' }
            }
        } catch (error) {
            console.error('Error en login:', error)
            return { success: false, message: 'Error de conexión con el servidor' }
        } finally {
            setLoading(false)
        }
    }

    const logout = async () => {
        setLoading(true)
        try {
            const result = await apiRequest(`${API_BASE_URL}/api/auth/logout`, {
                method: 'POST',
                credentials: 'include'
            })

            // Si hay rate limiting, devolver el error
            if (result.rateLimited) {
                setLoading(false)
                return { success: false, message: result.message }
            }

            if (result.success) {
                setIsLoggedIn(false)
                setIsAuthenticated(false)
                setUser(null)
                return { success: true, message: result.message || 'Logout exitoso' }
            } else {
                // Incluso si el backend falla, limpiamos el estado local
                setIsLoggedIn(false)
                setIsAuthenticated(false)
                setUser(null)
                return { success: true, message: 'Sesión cerrada localmente' }
            }
        } catch (error) {
            console.error('Error en logout:', error)
            // En caso de error, aún así limpiamos el estado local
            setIsLoggedIn(false)
            setIsAuthenticated(false)
            setUser(null)
            return { success: true, message: 'Sesión cerrada localmente' }
        } finally {
            setLoading(false)
        }
    }

    const refreshUserData = async () => {
        // Intentar obtener datos del usuario sin verificar isLoggedIn
        // ya que puede haber casos donde el estado no esté sincronizado
        try {
            const result = await getUserData()
            if (result.success) {
                return result
            }
            return { success: false, message: result.message || 'No se pudieron refrescar los datos' }
        } catch (error) {
            console.error('Error en refreshUserData:', error)
            return { success: false, message: 'Error al refrescar datos' }
        }
    }

    const updateUser = async (userData) => {
        if (!isLoggedIn) return { success: false, message: 'Usuario no logueado' }
        
        setLoading(true)
        try {
            const result = await apiRequest(`${API_BASE_URL}/api/users/me`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(userData)
            })

            // Si hay rate limiting, devolver el error
            if (result.rateLimited) {
                return { success: false, message: result.message }
            }

            if (result.success) {
                if (result.data?.user) {
                    const persistedRole = user?.role || (result.data.user.id === 1 ? 'admin' : 'patient')
                    const nextRole = result.data.user.role || persistedRole
                    setUser({
                        ...result.data.user,
                        role: nextRole
                    })
                }
                return { success: true, message: result.message || 'Perfil actualizado exitosamente' }
            } else {
                return { success: false, message: result.message || 'Error al actualizar el perfil' }
            }
        } catch (error) {
            console.error('Error actualizando perfil:', error)
            return { success: false, message: 'Error de conexión con el servidor' }
        } finally {
            setLoading(false)
        }
    }

    // Función para reenviar OTP de verificación de cuenta
    const resendVerificationOtp = async (email) => {
        setLoading(true)
        try {
            const result = await apiRequest(`${API_BASE_URL}/api/auth/send-verify-account-otp`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ email })
            })

            if (result.rateLimited) {
                return { success: false, message: result.message }
            }

            return result
        } catch (error) {
            console.error('Error reenviando OTP de verificación:', error)
            return { success: false, message: 'Error de conexión con el servidor' }
        } finally {
            setLoading(false)
        }
    }

    // Función para verificar cuenta con OTP
    const verifyAccount = async (email, otp) => {
        setLoading(true)
        try {
            const result = await apiRequest(`${API_BASE_URL}/api/auth/verify-account-otp`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ email, otp })
            })

            if (result.rateLimited) {
                setLoading(false)
                return { success: false, message: result.message }
            }

            if (result.success) {
                // result.data contiene la respuesta del backend
                // result.data.user contiene el objeto usuario
                if (result.data?.user) {
                    setUser({
                        ...result.data.user,
                        is_verified: true,
                        role: result.data.user.id === 1 ? 'admin' : 'patient'
                    })
                    setIsLoggedIn(true)
                    setIsAuthenticated(true)
                } else {
                    // Actualizar solo is_verified si no hay datos completos
                    setUser(prevUser => {
                        if (!prevUser) return prevUser
                        return {
                            ...prevUser,
                            is_verified: true
                        }
                    })
                }
            }

            setLoading(false)
            // Retornar result que incluye result.data con el usuario
            return result
        } catch (error) {
            console.error('Error verificando cuenta:', error)
            setLoading(false)
            return { success: false, message: 'Error de conexión con el servidor' }
        }
    }

    const value = {
        isLoggedIn,
        isAuthenticated,
        loading,
        user,
        register,
        login,
        logout,
        getUserData,
        refreshUserData,
        updateUser,
        resendVerificationOtp,
        verifyAccount,
        isAdmin: user?.role === 'admin',
        userRole: user?.role || null
    }

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    )
}

export default AuthProvider