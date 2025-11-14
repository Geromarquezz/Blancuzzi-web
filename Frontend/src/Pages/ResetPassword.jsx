import { useState, useEffect } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { toast } from 'react-toastify'
import { apiRequest } from '../utils/apiHandler.js'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import './Auth.css'

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL

const ResetPassword = () => {
  const navigate = useNavigate()
  const location = useLocation()
  const [currentStep, setCurrentStep] = useState(1) // 1: email, 2: OTP, 3: nueva contraseña, 4: éxito
  const [email, setEmail] = useState('')
  const [otp, setOtp] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [showNewPassword, setShowNewPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)

  // ✨ Cargar email si viene desde el perfil
  useEffect(() => {
    if (location.state?.email) {
      setEmail(location.state.email)
      toast.info('Email cargado desde tu perfil', { autoClose: 2000 })
    }
  }, [location])

  // PASO 1: Enviar OTP al email
  const handleSendOtp = async (e) => {
    e.preventDefault()

    // Validar email
    if (!email) {
      toast.error('El email es requerido')
      return
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      toast.error('Por favor ingresa un email válido')
      return
    }

    setLoading(true)

    try {
      const result = await apiRequest(`${API_BASE_URL}/api/auth/send-reset-otp`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      })

      // El toast ya se muestra automáticamente en apiRequest para rate limiting
      if (result.rateLimited) {
        setLoading(false)
        return
      }

      if (result.success) {
        toast.success(result.message)
        setCurrentStep(2) // Pasar al paso 2
      } else {
        toast.error(result.message)
      }
    } catch (error) {
      console.error('Error al enviar OTP:', error)
      toast.error('Error de conexión con el servidor')
    } finally {
      setLoading(false)
    }
  }

  // PASO 2: Verificar OTP
  const handleVerifyOtp = async (e) => {
    e.preventDefault()

    // Validar OTP
    if (!otp) {
      toast.error('El código OTP es requerido')
      return
    }

    if (otp.length !== 6) {
      toast.error('El código OTP debe tener 6 dígitos')
      return
    }

    setLoading(true)

    try {
      const result = await apiRequest(`${API_BASE_URL}/api/auth/verify-reset-password-otp`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, otp }),
      })

      // El toast ya se muestra automáticamente en apiRequest para rate limiting
      if (result.rateLimited) {
        setLoading(false)
        return
      }

      if (result.success) {
        toast.success(result.message)
        setCurrentStep(3) // Pasar al paso 3
      } else {
        toast.error(result.message)
      }
    } catch (error) {
      console.error('Error al verificar OTP:', error)
      toast.error('Error de conexión con el servidor')
    } finally {
      setLoading(false)
    }
  }

  // PASO 3: Cambiar contraseña
  const handleResetPassword = async (e) => {
    e.preventDefault()

    // Validar contraseñas
    if (!newPassword || !confirmPassword) {
      toast.error('Ambos campos de contraseña son requeridos')
      return
    }

    if (newPassword.length < 8) {
      toast.error('La contraseña debe tener al menos 8 caracteres')
      return
    }

    if (newPassword !== confirmPassword) {
      toast.error('Las contraseñas no coinciden')
      return
    }

    setLoading(true)

    try {
      const result = await apiRequest(`${API_BASE_URL}/api/auth/verify-reset-password`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, newPassword }),
      })

      // El toast ya se muestra automáticamente en apiRequest para rate limiting
      if (result.rateLimited) {
        setLoading(false)
        return
      }

      if (result.success) {
        toast.success(result.message)
        setCurrentStep(4) // Pasar al paso 4 (éxito)
        
        // Redirigir al login después de 3 segundos
        setTimeout(() => {
          navigate('/login')
        }, 3000)
      } else {
        toast.error(result.message)
      }
    } catch (error) {
      console.error('Error al cambiar contraseña:', error)
      toast.error('Error de conexión con el servidor')
    } finally {
      setLoading(false)
    }
  }

  // Función para volver al paso anterior
  const handleBack = () => {
    if (currentStep === 2) {
      setCurrentStep(1)
      setOtp('')
    } else if (currentStep === 3) {
      setCurrentStep(2)
      setNewPassword('')
      setConfirmPassword('')
    }
  }

  return (
    <div className="auth-container">
      <div className="auth-card">
        {/* PASO 1: Ingresar Email */}
        {currentStep === 1 && (
          <>
            <div className="auth-header">
              <h1>Restablecer Contraseña</h1>
              <p>Ingresa tu email para recibir un código de verificación</p>
            </div>

            <form onSubmit={handleSendOtp} className="auth-form">
              <div className="form-group">
                <label htmlFor="email">Email</label>
                <input
                  type="email"
                  id="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="tu-email@ejemplo.com"
                  required
                  disabled={loading || !!location.state?.email}
                  style={location.state?.email ? {
                    background: '#e9ecef',
                    cursor: 'not-allowed',
                    opacity: 0.7
                  } : {}}
                />
                {location.state?.email && (
                  <small style={{ color: '#28a745', fontSize: '0.85rem', marginTop: '5px' }}>
                    ✓ Email cargado desde tu perfil
                  </small>
                )}
              </div>

              <button type="submit" className="auth-btn" disabled={loading}>
                {loading ? (
                  <>
                    <div className="loading-spinner"></div>
                    Enviando...
                  </>
                ) : (
                  'Enviar Código'
                )}
              </button>

              <div className="auth-links">
                <p>
                  ¿Recordaste tu contraseña?{' '}
                  <a href="/login">Iniciar sesión</a>
                </p>
              </div>
            </form>
          </>
        )}

        {/* PASO 2: Ingresar OTP */}
        {currentStep === 2 && (
          <>
            <div className="auth-header">
              <h1>Código de Verificación</h1>
              <p>Ingresa el código de 6 dígitos enviado a <strong>{email}</strong></p>
            </div>

            <form onSubmit={handleVerifyOtp} className="auth-form">
              <div className="form-group">
                <label htmlFor="otp">Código</label>
                <input
                  type="text"
                  id="otp"
                  value={otp}
                  onChange={(e) => {
                    const value = e.target.value.replace(/\D/g, '') // Solo números
                    if (value.length <= 6) {
                      setOtp(value)
                    }
                  }}
                  placeholder="123456"
                  maxLength="6"
                  required
                  disabled={loading}
                  style={{ 
                    fontSize: '1.5rem', 
                    letterSpacing: '0.5rem', 
                    textAlign: 'center',
                    fontWeight: 'bold'
                  }}
                />
                <small style={{ color: '#666', fontSize: '0.85rem', marginTop: '5px' }}>
                  El código expira en 10 minutos
                </small>
              </div>

              <button type="submit" className="auth-btn" disabled={loading}>
                {loading ? (
                  <>
                    <div className="loading-spinner"></div>
                    Verificando...
                  </>
                ) : (
                  'Verificar Código'
                )}
              </button>

              <button 
                type="button" 
                onClick={handleBack} 
                className="auth-btn"
                style={{ background: '#6c757d', marginTop: '10px' }}
                disabled={loading}
              >
                ← Volver
              </button>

              <div className="auth-links">
                <p>
                  ¿No recibiste el código?{' '}
                  <a href="#" onClick={(e) => {
                    e.preventDefault()
                    setCurrentStep(1)
                    setOtp('')
                  }}>
                    Reenviar
                  </a>
                </p>
              </div>
            </form>
          </>
        )}

        {/* PASO 3: Ingresar Nueva Contraseña */}
        {currentStep === 3 && (
          <>
            <div className="auth-header">
              <h1>Nueva Contraseña</h1>
              <p>Crea una contraseña segura para tu cuenta</p>
            </div>

            <form onSubmit={handleResetPassword} className="auth-form">
              <div className="form-group">
                <label htmlFor="newPassword">Nueva Contraseña</label>
                <div className="password-input-wrapper">
                  <input
                    type={showNewPassword ? "text" : "password"}
                    id="newPassword"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="Mínimo 8 caracteres"
                    minLength="8"
                    required
                    disabled={loading}
                  />
                  <button
                    type="button"
                    className="password-toggle-btn"
                    onClick={() => setShowNewPassword(!showNewPassword)}
                    aria-label={showNewPassword ? "Mostrar contraseña" : "Ocultar contraseña"}
                  >
                    <FontAwesomeIcon icon={showNewPassword ? "eye" : "eye-slash"} />
                  </button>
                </div>
              </div>

              <div className="form-group">
                <label htmlFor="confirmPassword">Confirmar Contraseña</label>
                <div className="password-input-wrapper">
                  <input
                    type={showConfirmPassword ? "text" : "password"}
                    id="confirmPassword"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Repite tu contraseña"
                    minLength="8"
                    required
                    disabled={loading}
                  />
                  <button
                    type="button"
                    className="password-toggle-btn"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    aria-label={showConfirmPassword ? "Mostrar contraseña" : "Ocultar contraseña"}
                  >
                    <FontAwesomeIcon icon={showConfirmPassword ? "eye" : "eye-slash"} />
                  </button>
                </div>
              </div>

              {newPassword && confirmPassword && newPassword !== confirmPassword && (
                <div className="error-message">
                  Las contraseñas no coinciden
                </div>
              )}

              {newPassword && newPassword.length > 0 && newPassword.length < 8 && (
                <div className="error-message">
                  La contraseña debe tener al menos 8 caracteres
                </div>
              )}

              <button type="submit" className="auth-btn" disabled={loading}>
                {loading ? (
                  <>
                    <div className="loading-spinner"></div>
                    Cambiando...
                  </>
                ) : (
                  'Cambiar Contraseña'
                )}
              </button>

              <button 
                type="button" 
                onClick={handleBack} 
                className="auth-btn"
                style={{ background: '#6c757d', marginTop: '10px' }}
                disabled={loading}
              >
                ← Volver
              </button>
            </form>
          </>
        )}

        {/* PASO 4: Éxito */}
        {currentStep === 4 && (
          <>
            <div className="auth-header">
              <div style={{ fontSize: '4rem', marginBottom: '20px' }}></div>
              <h1>¡Contraseña Cambiada!</h1>
              <p>Tu contraseña se ha actualizado exitosamente</p>
            </div>

            <div className="success-message" style={{ marginTop: '30px' }}>
              Redirigiendo al inicio de sesión...
            </div>

            <div style={{ textAlign: 'center', marginTop: '30px' }}>
              <div className="loading-spinner" style={{ margin: '0 auto' }}></div>
            </div>

            <div className="auth-links" style={{ marginTop: '30px' }}>
              <p>
                ¿No quieres esperar?{' '}
                <a href="/login">Ir al login ahora</a>
              </p>
            </div>
          </>
        )}
      </div>
    </div>
  )
}

export default ResetPassword
