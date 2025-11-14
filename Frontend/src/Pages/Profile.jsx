import { useState, useEffect } from 'react'
import { toast } from 'react-toastify'
import { useAuth } from '../hooks/useAuth'
import { useTurnos } from '../hooks/useTurnos'
import { useConfirm } from '../Context/ConfirmContext.jsx'
import { useNavigate } from 'react-router-dom'
import './Auth.css'

const Profile = () => {
  const { user, isLoggedIn, loading: authLoading, logout, refreshUserData, updateUser, isAdmin } = useAuth()
  const { turnos, loading: loadingTurnos, cancelTurno: cancelTurnoFromContext } = useTurnos()
  const confirmDialog = useConfirm()
  const [isEditing, setIsEditing] = useState(false)
  const [loadingProfile, setLoadingProfile] = useState(true)
  const [editFormData, setEditFormData] = useState({
    name: '',
    lastname: '',
    phone: ''
  })
  // Estados para pestañas y paginación
  const [activeTab, setActiveTab] = useState('confirmed') // confirmed, completed, cancelled
  const [currentPage, setCurrentPage] = useState(1)
  const ITEMS_PER_PAGE = 5
  const navigate = useNavigate()

  useEffect(() => {
    // Esperar a que termine de validar la sesión
    if (authLoading) return

    if (!isLoggedIn) {
      navigate('/login')
      return
    }

    if (isAdmin) {
      navigate('/admin')
      return
    }
    
    // Cargar datos del usuario solo una vez cuando el componente se monta
    const loadData = async () => {
      try {
        await refreshUserData()
      } catch (error) {
        console.error('Error cargando datos del usuario:', error)
      } finally {
        setLoadingProfile(false)
      }
    }
    
    // Si ya hay datos del usuario, no mostrar loading
    if (user) {
      setLoadingProfile(false)
    } else {
      loadData()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isLoggedIn, isAdmin, authLoading, navigate]) // ✅ Agregado authLoading

  // Actualizar el formulario cuando cambian los datos del usuario
  useEffect(() => {
    if (user) {
      setEditFormData({
        name: user.name || '',
        lastname: user.lastname || '',
        phone: user.phone || ''
      })
    }
  }, [user])

  const handleLogout = async () => {
    const result = await logout()
    if (result.success) {
      navigate('/')
    }
  }

  const handleEditClick = () => {
    setIsEditing(true)
  }

  const handleCancelEdit = () => {
    setIsEditing(false)
    // Restaurar valores originales
    if (user) {
      setEditFormData({
        name: user.name || '',
        lastname: user.lastname || '',
        phone: user.phone || ''
      })
    }
  }

  const handleInputChange = (e) => {
    setEditFormData({
      ...editFormData,
      [e.target.name]: e.target.value
    })
  }

  const handleSaveProfile = async (e) => {
    e.preventDefault()
    
    // Validaciones
    if (!editFormData.name || !editFormData.lastname || !editFormData.phone) {
      toast.error('Todos los campos son requeridos')
      return
    }

    if (editFormData.phone.length < 9) {
      toast.error('El teléfono debe tener al menos 9 caracteres')
      return
    }

    try {
      const result = await updateUser(editFormData)
      
      if (result.success) {
        toast.success('Perfil actualizado exitosamente')
        setIsEditing(false)
        // Recargar datos del usuario
        await refreshUserData()
      } else {
        toast.error(result.message || 'Error al actualizar perfil')
      }
    } catch (error) {
      console.error('Error actualizando perfil:', error)
      toast.error('Error de conexión al actualizar el perfil')
    }
  }

  const cancelTurno = async (turnoId) => {
    const accepted = await confirmDialog({
      title: 'Cancelar turno',
      message: '¿Estás seguro de que deseas cancelar este turno?',
      confirmText: 'Sí, cancelar',
      cancelText: 'No, mantener',
      tone: 'danger'
    })

    if (!accepted) {
      return
    }
    
    try {
      const result = await cancelTurnoFromContext(turnoId)
      if (result.success) {
        toast.success('Turno cancelado exitosamente')
      } else {
        // Verificar si es el error de 24 horas
        if (result.reason === 'cancellation_too_late') {
          toast.error('Solo puedes cancelar turnos con 24 horas de anticipación. Consulta a la odontóloga por WhatsApp.', {
            autoClose: 3000,
            style: { fontSize: '0.95rem' }
          })
        } else {
          toast.error(result.message || 'Error al cancelar el turno')
        }
      }
    } catch (error) {
      console.error('Error cancelando turno:', error)
      toast.error('Error de conexión al cancelar el turno')
    }
  }

  const formatDate = (dateString) => {
    // Extraer solo la fecha si viene con hora (YYYY-MM-DD HH:MM:SS)
    const dateOnly = dateString.split(' ')[0]
    
    // Dividir la fecha en partes (YYYY-MM-DD)
    const [year, month, day] = dateOnly.split('-').map(Number)
    
    // Crear fecha usando el constructor con parámetros para evitar problemas de zona horaria
    // Los meses en JavaScript son 0-indexed, por eso restamos 1
    const date = new Date(year, month - 1, day)
    
    return date.toLocaleDateString('es-AR', { 
      weekday: 'long', 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    })  
  }

  const getStatusColor = (status) => {
    switch(status) {   
      case 'confirmed': return '#28a745'    // Verde para confirmado
      case 'completed': return '#2881a7ff'  // Azul para completado
      case 'cancelled': return '#dc3545'    // Rojo para cancelado
      default: return '#6c757d'             // Gris por defecto
    }
  }

  const getStatusText = (status) => {
    switch(status) {
      case 'confirmed': return 'Confirmado'
      case 'completed': return 'Completado'
      case 'cancelled': return 'Cancelado'
      default: return status
    }
  }

  // ⏰ Verificar si quedan más de 24 horas para el turno
  const canCancelTurno = (turno) => {
    const now = new Date()
    // Combinar fecha y hora del turno (date viene como YYYY-MM-DD, hour como HH:MM)
    const turnoDateTime = new Date(`${turno.date}T${turno.hour}:00`)
    const hoursUntilAppointment = (turnoDateTime - now) / (1000 * 60 * 60)
    
    return hoursUntilAppointment >= 24
  }

  // Filtrar turnos por estado
  const filteredTurnos = turnos.filter(turno => turno.state === activeTab)
  
  // Calcular contadores por estado
  const confirmedCount = turnos.filter(t => t.state === 'confirmed').length
  const completedCount = turnos.filter(t => t.state === 'completed').length
  const cancelledCount = turnos.filter(t => t.state === 'cancelled').length

  // Paginación
  const totalPages = Math.ceil(filteredTurnos.length / ITEMS_PER_PAGE)
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE
  const endIndex = startIndex + ITEMS_PER_PAGE
  const paginatedTurnos = filteredTurnos.slice(startIndex, endIndex)

  // Reset a página 1 cuando cambia la pestaña
  const handleTabChange = (tab) => {
    setActiveTab(tab)
    setCurrentPage(1)
  }

  if (isAdmin) {
    return null
  }

  if (loadingProfile || !user) {
    return (
      <div className="profile-container">
        <div className="profile-loading" style={{ 
          display: 'flex', 
          justifyContent: 'center', 
          alignItems: 'center', 
          minHeight: '400px',
          flexDirection: 'column',
          gap: '15px'
        }}>
          <div className="spinner"></div>
          <p>Cargando perfil...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="profile-container">
      {/* Header del perfil */}
      <div className="profile-header">
        <h1>Hola, {user.name} {user.lastname}</h1>
        <p>Bienvenido/a a tu panel de usuario</p>
      </div>

      <div className="profile-content">
        {/* Información del usuario */}
        <div className="profile-section">
          <h2>👤 Información Personal</h2>
          
          {isEditing ? (
            <form onSubmit={handleSaveProfile} className="auth-form">
              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="name">Nombre</label>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    value={editFormData.name}
                    onChange={handleInputChange}
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
                    value={editFormData.lastname}
                    onChange={handleInputChange}
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
                  value={editFormData.phone}
                  onChange={handleInputChange}
                  placeholder="Tu número de teléfono"
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="email">Email</label>
                <input
                  type="email"
                  id="email"
                  value={user.email}
                  disabled
                  style={{ 
                    background: '#e9ecef', 
                    cursor: 'not-allowed',
                    opacity: 0.7
                  }}
                />
                <small style={{ color: '#6c757d', fontSize: '0.85rem', marginTop: '4px' }}>
                  El email no puede ser modificado, crea otra cuenta si deseas cambiarlo
                </small>
              </div>

              <div style={{ display: 'flex', gap: '10px', marginTop: '15px' }}>
                <button 
                  type="submit" 
                  className="auth-btn"
                  style={{ 
                    flex: 1,
                    background: '#28a745',
                    color: 'white'
                  }}
                >
                  Guardar Cambios
                </button>
                <button 
                  type="button"
                  onClick={handleCancelEdit}
                  className="auth-btn"
                  style={{ 
                    flex: 1,
                    background: '#6c757d',
                    color: 'white'
                  }}
                >
                  Cancelar
                </button>
              </div>
            </form>
          ) : (
            <>
              <div className="user-info-grid">
                <div className="info-item">
                  <span className="info-label">Nombre</span>
                  <span className="info-value">{user.name}</span>
                </div>
                
                <div className="info-item">
                  <span className="info-label">Apellido</span>
                  <span className="info-value">{user.lastname}</span>
                </div>
                
                <div className="info-item">
                  <span className="info-label">
                    Email {user.is_verified ? '✅' : '❌'}
                  </span>
                  <span className="info-value" style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
                    {user.email}
                    {!user.is_verified && (
                      <button
                        onClick={() => navigate('/verify-account')}
                        style={{
                          background: '#4a90e2',
                          color: 'white',
                          border: 'none',
                          padding: '6px 14px',
                          borderRadius: '999px',
                          cursor: 'pointer',
                          fontSize: '0.85rem',
                          fontWeight: 600
                        }}
                      >
                        Verificar
                      </button>
                    )}
                  </span>
                </div>
                
                <div className="info-item">
                  <span className="info-label">Teléfono</span>
                  <span className="info-value">{user.phone}</span>
                </div>
              </div>
              {/* Botón de editar abajo a la derecha */}
              <div className="profile-edit-btn-container">
                <button 
                  onClick={handleEditClick}
                  className="auth-btn profile-edit-btn"
                  style={{ 
                    padding: '8px 16px',
                    fontSize: '0.9rem',
                    background: '#4a90e2',
                    color: 'white',
                    margin: 0
                  }}
                >
                  ✏️ Editar Perfil
                </button>
              </div>
            </>
          )}
        </div>

        {/* Mis turnos */}
        <div className="profile-section">
          <h2>Mis Turnos</h2>
          <p style={{ color: '#6c757d', fontSize: '0.9rem', margin: '6px 0 18px 0' }}>
            Solo se pueden cancelar turnos con 24 horas de anticipación
          </p>
          
          {loadingTurnos ? (
            <div className="loading-turnos">
              <p>📋 Cargando turnos...</p>
            </div>
          ) : turnos.length === 0 ? (
            <div className="no-turnos">
              <p>No tienes turnos programados</p>
              <button 
                onClick={() => navigate('/turnos')}
                className="auth-btn"
                style={{ marginTop: '15px' }}
              >
                Solicitar Turno
              </button>
            </div>
          ) : (
            <>
              {/* Pestañas */}
              <div className="turnos-tabs">
                <button
                  onClick={() => handleTabChange('confirmed')}
                  className={`tab-button ${activeTab === 'confirmed' ? 'active' : ''}`}
                  style={{
                    background: activeTab === 'confirmed' ? '#28a745' : '#f8f9fa',
                    color: activeTab === 'confirmed' ? 'white' : '#6c757d',
                    borderBottom: activeTab === 'confirmed' ? '3px solid #28a745' : 'none'
                  }}
                >
                  Confirmados ({confirmedCount})
                </button>
                <button
                  onClick={() => handleTabChange('completed')}
                  className={`tab-button ${activeTab === 'completed' ? 'active' : ''}`}
                  style={{
                    background: activeTab === 'completed' ? '#2881a7ff' : '#f8f9fa',
                    color: activeTab === 'completed' ? 'white' : '#6c757d',
                    borderBottom: activeTab === 'completed' ? '3px solid #2881a7ff' : 'none'
                  }}
                >
                  Completados ({completedCount})
                </button>
                <button
                  onClick={() => handleTabChange('cancelled')}
                  className={`tab-button ${activeTab === 'cancelled' ? 'active' : ''}`}
                  style={{
                    background: activeTab === 'cancelled' ? '#dc3545' : '#f8f9fa',
                    color: activeTab === 'cancelled' ? 'white' : '#6c757d',
                    borderBottom: activeTab === 'cancelled' ? '3px solid #dc3545' : 'none'
                  }}
                >
                  Cancelados ({cancelledCount})
                </button>
              </div>

              {/* Lista de turnos paginados */}
              {filteredTurnos.length === 0 ? (
                <div className="no-turnos-in-tab" style={{
                  padding: '30px',
                  textAlign: 'center',
                  background: '#f8f9fa',
                  borderRadius: '8px',
                  color: '#6c757d'
                }}>
                  <p>No hay turnos {activeTab === 'confirmed' ? 'confirmados' : activeTab === 'completed' ? 'completados' : 'cancelados'}</p>
                </div>
              ) : (
                <>
                  <div className="turnos-list">
                    {paginatedTurnos.map(turno => (
                      <div key={turno.id} className="turno-card">
                        <div className="turno-header">
                          <h3>{turno.consultation_type || 'Consulta General'}</h3>
                          <span 
                            className="turno-status"
                            style={{ 
                              backgroundColor: getStatusColor(turno.state),
                              color: 'white',
                              padding: '4px 8px',
                              borderRadius: '12px',
                              fontSize: '0.8rem',
                              fontWeight: 'bold'
                            }}
                          >
                            {getStatusText(turno.state)}
                          </span>
                        </div>
                        
                        <div className="turno-details">
                          <p><strong>Fecha:</strong> {formatDate(turno.date)}</p>
                          <p><strong>Hora:</strong> {turno.hour}</p>
                          {turno.patient_notes && (
                            <div className="patient-notes">
                              <p><strong>Notas:</strong></p>
                              <div style={{
                                background: '#f8f9fa',
                                padding: '10px',
                                borderRadius: '6px',
                                marginTop: '5px',
                                fontStyle: 'italic',
                                color: '#6c757d'
                              }}>
                                {turno.patient_notes}
                              </div>
                            </div>
                          )}
                          {turno.createdAt && (
                            <p><strong>Solicitado el:</strong> {new Date(turno.createdAt).toLocaleDateString('es-AR')}</p>
                          )}
                        </div>

                        {turno.state === 'confirmed' && (
                          <div className="turno-actions">
                            {canCancelTurno(turno) ? (
                              <>
                                <button 
                                  onClick={() => cancelTurno(turno.id)}
                                  className="cancel-turno-btn"
                                  style={{
                                    background: '#dc3545',
                                    color: 'white',
                                    border: 'none',
                                    padding: '10px 20px',
                                    borderRadius: '6px',
                                    cursor: 'pointer',
                                    fontSize: '0.95rem',
                                    fontWeight: '600',
                                    transition: 'all 0.3s ease',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '8px',
                                    justifyContent: 'center'
                                  }}
                                  onMouseOver={(e) => {
                                    e.target.style.background = '#c82333'
                                    e.target.style.transform = 'translateY(-2px)'
                                    e.target.style.boxShadow = '0 4px 12px rgba(220, 53, 69, 0.3)'
                                  }}
                                  onMouseOut={(e) => {
                                    e.target.style.background = '#dc3545'
                                    e.target.style.transform = 'translateY(0)'
                                    e.target.style.boxShadow = 'none'
                                  }}
                                >
                                  Cancelar Turno
                                </button>
                              </>
                            ) : (
                              <>
                                <button 
                                  disabled
                                  className="cancel-turno-btn"
                                  style={{
                                    background: '#6c757d',
                                    color: 'white',
                                    border: 'none',
                                    padding: '10px 20px',
                                    borderRadius: '6px',
                                    cursor: 'not-allowed',
                                    fontSize: '0.95rem',
                                    fontWeight: '600',
                                    display: 'flex',
                                    flexDirection: 'column',
                                    alignItems: 'center',
                                    gap: '8px',
                                    justifyContent: 'center',
                                    opacity: 0.6
                                  }}
                                >
                                  <span>Cancelación no disponible</span>
                                  <span style={{ fontSize: '0.85rem' }}>Consulta a la odontóloga por WhatsApp</span>
                                </button>
                              </>
                            )}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>

                  {/* Paginación */}
                  {totalPages > 1 && (
                    <div className="pagination" style={{
                      display: 'flex',
                      justifyContent: 'center',
                      alignItems: 'center',
                      gap: '10px',
                      marginTop: '25px',
                      padding: '15px 0'
                    }}>
                      <button
                        onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                        disabled={currentPage === 1}
                        style={{
                          padding: '8px 16px',
                          border: '1px solid #dee2e6',
                          background: currentPage === 1 ? '#e9ecef' : 'white',
                          color: currentPage === 1 ? '#6c757d' : '#212529',
                          borderRadius: '6px',
                          cursor: currentPage === 1 ? 'not-allowed' : 'pointer',
                          fontWeight: '500',
                          transition: 'all 0.3s ease'
                        }}
                      >
                        ← Anterior
                      </button>
                      
                      <span style={{
                        padding: '8px 16px',
                        color: '#6c757d',
                        fontWeight: '600',
                        fontSize: '0.95rem'
                      }}>
                        Página {currentPage} de {totalPages}
                      </span>
                      
                      <button
                        onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                        disabled={currentPage === totalPages}
                        style={{
                          padding: '8px 16px',
                          border: '1px solid #dee2e6',
                          background: currentPage === totalPages ? '#e9ecef' : 'white',
                          color: currentPage === totalPages ? '#6c757d' : '#212529',
                          borderRadius: '6px',
                          cursor: currentPage === totalPages ? 'not-allowed' : 'pointer',
                          fontWeight: '500',
                          transition: 'all 0.3s ease'
                        }}
                      >
                        Siguiente →
                      </button>
                    </div>
                  )}
                </>
              )}
            </>
          )}
        </div>

        {/* Acciones */}
        <div className="profile-section">
          <h2>Acciones</h2>
          <div style={{ display: 'flex', gap: '15px', flexWrap: 'wrap' }}>
            <button 
              onClick={() => navigate('/turnos')}
              className="profile-action-btn-turnos-btn"
              style={{ background: '#28a745' }}
            >
              Solicitar Turno
            </button>
            
            <button 
              onClick={() => navigate('/reset-password', { state: { email: user.email } })}
              className="profile-action-btn"
              style={{ background: '#ffc107', color: '#212529' }}
            >
              Cambiar Contraseña
            </button>
            
            <button onClick={handleLogout} className="profile-action-btn">
              Cerrar Sesión
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Profile