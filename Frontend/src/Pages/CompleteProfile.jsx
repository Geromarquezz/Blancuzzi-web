import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { toast } from 'react-toastify'
import { useAuth } from '../hooks/useAuth'
import './Auth.css'

const CompleteProfile = () => {
  const [phone, setPhone] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const { updateUser } = useAuth()
  const navigate = useNavigate()

  const handleSubmit = async (e) => {
    e.preventDefault()
    setIsLoading(true)

    // Validar teléfono
    if (!phone || phone.length < 9) {
      toast.error('Por favor ingresa un teléfono válido (mínimo 9 dígitos)')
      setIsLoading(false)
      return
    }

    // Actualizar perfil
    const result = await updateUser({ phone })

    if (result.success) {
      toast.success('¡Perfil completado exitosamente!')
      setTimeout(() => {
        navigate('/profile', { replace: true })
      }, 100)
    } else {
      toast.error(result.message || 'Error al actualizar el perfil')
    }
    setIsLoading(false)
  }

  return (
    <div className="auth-container">
      <div className="auth-card">
        <div className="auth-header">
          <h1>¡Bienvenido/a! {}</h1>
          <p>Completa tu perfil</p>
        </div>

        <form onSubmit={handleSubmit} className="auth-form">
          <div className="form-group">
            <label htmlFor="phone">Teléfono de contacto</label>
            <input
              type="tel"
              id="phone"
              name="phone"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="Ej: 1234567890"
              required
            />
          </div>

          <button 
            type="submit" 
            className="auth-btn"
            disabled={isLoading}
          >
            {isLoading ? 'Guardando...' : 'Completar Perfil'}
          </button>
        </form>
      </div>
    </div>
  )
}

export default CompleteProfile
