import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { toast } from 'react-toastify'
import { useAuth } from '../hooks/useAuth'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import './Auth.css'

const Register = () => {

  const [formData, setFormData] = useState({
    name: '',
    lastname: '',
    phone: '',
    email: '',
    password: '',
    confirmPassword: ''
  })
  const [isLoading, setIsLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [acceptedTerms, setAcceptedTerms] = useState(false)

  const { register } = useAuth()
  const navigate = useNavigate()

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    })
  }

  const handleGoogleRegister = () => {
    // Redirigir al backend para iniciar el flujo de OAuth
    const backendUrl = import.meta.env.VITE_API_BASE_URL?.split(',')[0]
    window.location.href = `${backendUrl}/api/auth/google`
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setIsLoading(true)

    // Validaciones básicas
    if (!formData.name || !formData.lastname || !formData.phone || 
        !formData.email || !formData.password || !formData.confirmPassword) {
      toast.error('Todos los campos son requeridos')
      setIsLoading(false)
      return
    }
    
    if (formData.phone.length < 9) {
      toast.error('El telefono debe tener al menos 9 caracteres')
      setIsLoading(false)
      return
    }

    if (formData.password !== formData.confirmPassword) {
      toast.error('Las contraseñas no coinciden')
      setIsLoading(false)
      return
    }

    if (formData.password.length < 8) {
      toast.error('La contraseña debe tener al menos 6 caracteres')
      setIsLoading(false)
      return
    }

    if (!acceptedTerms) {
      toast.error('Debes aceptar los términos y condiciones')
      setIsLoading(false)
      return
    }

    // Registrar usuario
    const result = await register(formData)
    
    if (result.success) {
      toast.success('¡Registro exitoso! Verifica tu email.')
      setTimeout(() => {
        // Redirigir a verify-account con el email
        navigate('/verify-account', { 
          replace: true,
          state: { email: formData.email }
        })
      }, 1500)
    } else {
      toast.error(result.message || 'Error en el registro')
    }

    setIsLoading(false)
  }

  return (
    <div className="auth-container">
      <div className="auth-card">
        <div className="auth-header">
          <h1>Crear Cuenta</h1>
          <p>Regístrate para agendar tus turnos</p>
        </div>

        <button 
          onClick={handleGoogleRegister}
          className="google-btn"
          type="button"
        >
          <svg viewBox="0 0 24 24" width="20" height="20" xmlns="http://www.w3.org/2000/svg">
            <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
            <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
            <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
            <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
          </svg>
          Continuar con Google
        </button>

        <div className="auth-divider">
          <span>o</span>
        </div>

        <form onSubmit={handleSubmit} className="auth-form">
          <div className="form-row">
            <div className="form-group">
              <label htmlFor="name">Nombre</label>
              <input
                type="text"
                id="name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                placeholder="Tu nombre"
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="lastname">Apellido</label>
              <input
                type="text"
                id="lastname"
                name="lastname"
                value={formData.lastname}
                onChange={handleChange}
                placeholder="Tu apellido"
                required
              />
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="phone">Teléfono</label>
            <input
              type="tel"
              id="phone"
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              placeholder="Tu número de teléfono"
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="email">Email</label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="ejemplo@gmail.com"
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="password">Contraseña</label>
            <div className="password-input-wrapper">
              <input
                type={showPassword ? "text" : "password"}
                id="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                placeholder="Mínimo 8 caracteres"
                required
              />
              <button
                type="button"
                className="password-toggle-btn"
                onClick={() => setShowPassword(!showPassword)}
                aria-label={showPassword ? "Mostrar contraseña" : "Ocultar contraseña"}
              >
                <FontAwesomeIcon icon={showPassword ? "eye" : "eye-slash"} />
              </button>
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="confirmPassword">Confirmar Contraseña</label>
            <div className="password-input-wrapper">
              <input
                type={showConfirmPassword ? "text" : "password"}
                id="confirmPassword"
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleChange}
                placeholder="Repite tu contraseña"
                required
              />
              <button
                type="button"
                className="password-toggle-btn"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                aria-label={showConfirmPassword ? "Ocultar contraseña" : "Mostrar contraseña"}
              >
                <FontAwesomeIcon icon={showConfirmPassword ? "eye" : "eye-slash"} />
              </button>
            </div>
          </div>

          <div className="form-group" style={{ 
            display: 'flex', 
            alignItems: 'flex-start', 
            gap: '8px',
            marginTop: '10px' 
          }}>
            <input
              type="checkbox"
              id="acceptTerms"
              checked={acceptedTerms}
              onChange={(e) => setAcceptedTerms(e.target.checked)}
              style={{ 
                marginTop: '4px',
                width: '16px',
                height: '16px',
                cursor: 'pointer'
              }}
            />
            <label 
              htmlFor="acceptTerms" 
              style={{ 
                fontSize: '0.9rem', 
                cursor: 'pointer',
                userSelect: 'none'
              }}
            >
              Acepto los{' '}
              <Link 
                to="/terms-and-conditions" 
                target="_blank"
                style={{ 
                  color: '#b3996c',
                  textDecoration: 'underline',
                  fontWeight: '500'
                }}
              >
                términos y condiciones
              </Link>
            </label>
          </div>

          <button 
            type="submit" 
            className="auth-btn"
            disabled={isLoading}
          >
            {isLoading ? 'Creando cuenta...' : 'Crear Cuenta'}
          </button>
        </form>

        <div className="auth-links">
          <p>
            ¿Ya tienes cuenta? {' '}
            <Link to="/login" className="link">
              Inicia sesión aquí
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}

export default Register