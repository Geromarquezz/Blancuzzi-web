import { useState, useEffect } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { toast } from 'react-toastify'
import { useAuth } from '../hooks/useAuth'
import './Auth.css'

const VerifyAccount = () => {
  const [otp, setOtp] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [isSendingOtp, setIsSendingOtp] = useState(false)
  const [canResend, setCanResend] = useState(false)
  const [countdown, setCountdown] = useState(30)

  const { user, verifyAccount, resendVerificationOtp, refreshUserData } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()

  // Email puede venir del state (registro) o del usuario autenticado (OAuth)
  const userEmail = location.state?.email || user?.email

  useEffect(() => {
    // Si no hay email, redirigir al login
    if (!userEmail) {
      toast.error('No se encontró el email. Por favor inicia sesión.')
      navigate('/login')
      return
    }

    // Si el usuario ya está verificado, redirigir al perfil
    if (user?.is_verified) {
      navigate('/profile')
    }
  }, [user, userEmail, navigate])

  useEffect(() => {
    // Countdown para reenviar OTP
    if (countdown > 0 && !canResend) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000)
      return () => clearTimeout(timer)
    } else if (countdown === 0) {
      setCanResend(true)
    }
  }, [countdown, canResend])

  const handleSubmit = async (e) => {
    e.preventDefault()

    if (!otp || otp.length !== 6) {
      toast.error('Por favor ingresa un código de 6 dígitos')
      return
    }

    setIsLoading(true)

    try {
      const result = await verifyAccount(userEmail, otp)

      if (result.success) {
        toast.success('¡Cuenta verificada exitosamente!')

        await refreshUserData()
        const userPhone = result.data?.user?.phone

        if (userPhone === '0000000000') {
          navigate('/complete-profile')
        } else {
          navigate('/profile')
        }

      } else {
        toast.error(result.message || 'Código incorrecto o expirado')
      }
    } catch (error) {
      console.error('Error verificando cuenta:', error)
      toast.error('Error al verificar la cuenta')
    } finally {
      setIsLoading(false)
    }
  }

  const handleResendOtp = async () => {
    if (!canResend) return

    setIsSendingOtp(true)

    try {
      const result = await resendVerificationOtp(userEmail)

      if (result.success) {
        toast.success('Código reenviado a tu email')
        setCanResend(false)
        setCountdown(60)
      } else {
        toast.error(result.message || 'Error al reenviar el código')
      }
    } catch (error) {
      console.error('Error reenviando OTP:', error)
      toast.error('Error al reenviar el código')
    } finally {
      setIsSendingOtp(false)
    }
  }

  const handleOtpChange = (e) => {
    const value = e.target.value.replace(/\D/g, '').slice(0, 6)
    setOtp(value)
  }

  return (
    <div className="auth-container">
      <div className="auth-card">
        <div className="auth-header">
          <h1>Verifica tu Cuenta</h1>
          <p>Ingresa el código de 6 dígitos que enviamos a</p>
          <p style={{ fontWeight: 'bold', color: '#4a90e2', marginTop: '5px' }}>
            {userEmail}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="auth-form">
          <div className="form-group">
            <label htmlFor="otp">Código de Verificación</label>
            <input
              type="text"
              id="otp"
              name="otp"
              value={otp}
              onChange={handleOtpChange}
              placeholder="123456"
              maxLength={6}
              required
              style={{
                fontSize: '1.5rem',
                textAlign: 'center',
                letterSpacing: '0.5rem',
                fontWeight: 'bold'
              }}
            />
            <small style={{
              color: '#6c757d',
              fontSize: '0.85rem',
              marginTop: '8px',
              display: 'block'
            }}>
              El código expira en 10 minutos
            </small>
          </div>

          <button
            type="submit"
            className="auth-btn"
            disabled={isLoading || otp.length !== 6}
            style={{
              marginTop: '10px'
            }}
          >
            {isLoading ? 'Verificando...' : 'Verificar Cuenta'}
          </button>
        </form>

        <div style={{
          marginTop: '20px',
          textAlign: 'center',
          paddingTop: '20px',
          borderTop: '1px solid #e0e0e0'
        }}>
          <p style={{
            color: '#6c757d',
            fontSize: '0.9rem',
            marginBottom: '10px'
          }}>
            ¿No recibiste el código?
          </p>

          <button
            onClick={handleResendOtp}
            disabled={!canResend || isSendingOtp}
            style={{
              background: canResend ? '#4a90e2' : '#9e9e9e',
              color: 'white',
              border: 'none',
              padding: '10px 20px',
              borderRadius: '6px',
              cursor: canResend ? 'pointer' : 'not-allowed',
              fontSize: '0.9rem',
              fontWeight: '600',
              transition: 'all 0.3s ease'
            }}
          >
            {isSendingOtp
              ? 'Reenviando...'
              : canResend
                ? 'Reenviar Código'
                : `⏱Espera ${countdown}s`
            }
          </button>
        </div>
      </div>
    </div>
  )
}

export default VerifyAccount
