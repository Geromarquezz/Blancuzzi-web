import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import { toast } from 'react-toastify'

const GoogleAuthSuccess = () => {
  const navigate = useNavigate()
  const { refreshUserData } = useAuth()
  const [hasChecked, setHasChecked] = useState(false)

  useEffect(() => {
    if (hasChecked) return // Evitar múltiples ejecuciones

    const handleGoogleAuthSuccess = async () => {
      try {
        setHasChecked(true)
        
        // Esperar un momento para que las cookies se procesen
        await new Promise(resolve => setTimeout(resolve, 500))
        
        // Intentar refrescar los datos del usuario
        const result = await refreshUserData()
        
        if (result.success && result.user) {
          // 1. Verificar si la cuenta necesita OTP
          if (!result.user.is_verified) {
            setTimeout(() => {
              navigate('/verify-account', { replace: true })
            }, 1000)
            return
          }

          // 2. Verificar si falta el teléfono
          if (result.user.phone === '0000000000') {
            setTimeout(() => {
              navigate('/complete-profile', { replace: true })
            }, 1000)
            return
          }

          // 3. Todo completo - ir al perfil
          setTimeout(() => {
            navigate('/profile', { replace: true })
          }, 1000)
        } else {
          console.log('GoogleAuthSuccess - Entrando al else de error')
          toast.error('Error al verificar la autenticación')
          navigate('/login', { replace: true })
        }
      } catch (error) {
        console.error('Error en autenticación con Google:', error)
        toast.error('Error al iniciar sesión con Google')
        navigate('/login', { replace: true })
      }
    }

    handleGoogleAuthSuccess()
  }, []) // Sin dependencias para ejecutar solo una vez

  return (
    <div className="auth-container">
      <div className="auth-card">
        <div className="auth-header">
          <h1>Verificando autenticación...</h1>
          <p>Por favor espera un momento</p>
        </div>
        <div style={{ textAlign: 'center', padding: '20px' }}>
          <div className="loading-spinner"></div>
        </div>
      </div>
    </div>
  )
}

export default GoogleAuthSuccess
