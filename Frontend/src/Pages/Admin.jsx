import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { toast } from 'react-toastify'
import { useAuth } from '../hooks/useAuth'
import { apiRequest } from '../utils/apiHandler'
import { useConfirm } from '../Context/ConfirmContext.jsx'
import './Admin.css'

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL

const Admin = () => {
  const navigate = useNavigate()
  const { isLoggedIn, loading: authLoading, userRole } = useAuth()
  const confirmDialog = useConfirm()

  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)
  const [fetchError, setFetchError] = useState(null)
  const [blockingId, setBlockingId] = useState(null)
  const [deletingId, setDeletingId] = useState(null)
  
  // Estados para sincronización de calendario
  const [syncing, setSyncing] = useState(false)
  const [syncResult, setSyncResult] = useState(null)
  const [lastSyncTime, setLastSyncTime] = useState(null)
  
  // Estados para pestañas, búsqueda y paginación
  const [activeTab, setActiveTab] = useState('active') // active, blocked
  const [searchQuery, setSearchQuery] = useState('')
  const [currentPage, setCurrentPage] = useState(1)
  const ITEMS_PER_PAGE = 5

  // Redirecciones básicas según rol
  useEffect(() => {
    // Esperar a que termine de validar la sesión
    if (authLoading) return

    if (!isLoggedIn) {
      navigate('/login')
      return
    }

    if (userRole && userRole !== 'admin') {
      navigate('/')
    }
  }, [isLoggedIn, authLoading, userRole, navigate])

  // Cargar usuarios registrados
  useEffect(() => {
    if (!isLoggedIn || userRole !== 'admin') {
      setUsers([])
      setLoading(false)
      return
    }

    let isMounted = true

    const loadUsers = async () => {
      setLoading(true)
      setFetchError(null)

      try {
        const result = await apiRequest(`${API_BASE_URL}/api/users`)

        if (!isMounted) return

        if (result.rateLimited) {
          setFetchError(result.message)
          setUsers([])
          return
        }

        if (result.success) {
          const payload = Array.isArray(result.data)
            ? result.data
            : result.data?.data?.users || []

          const sorted = [...payload].sort((a, b) => a.id - b.id)
          setUsers(sorted)
        } else {
          setFetchError(result.message || 'Error al obtener los usuarios')
          setUsers([])

          if (!result.toastShown) {
            toast.error(result.message || 'Error al obtener los usuarios')
          }
        }
      } catch (error) {
        console.error('Error cargando usuarios:', error)
        if (!isMounted) return
        setFetchError('Error de conexión con el servidor')
        setUsers([])
        toast.error('Error de conexión con el servidor')
      } finally {
        if (isMounted) {
          setLoading(false)
        }
      }
    }

    loadUsers()

    return () => {
      isMounted = false
    }
  }, [isLoggedIn, userRole])

  const adminUser = useMemo(
    () => users.find((u) => u.id === 1) || null,
    [users]
  )

  const patientUsers = useMemo(
    () => users.filter((u) => u.id !== 1),
    [users]
  )

  // Filtrar por pestaña activa (activo/bloqueado)
  const filteredByTab = useMemo(() => {
    return patientUsers.filter(user => {
      if (activeTab === 'active') return !user.is_blocked
      if (activeTab === 'blocked') return user.is_blocked
      return true
    })
  }, [patientUsers, activeTab])

  // Filtrar por búsqueda
  const filteredUsers = useMemo(() => {
    if (!searchQuery.trim()) return filteredByTab

    const query = searchQuery.toLowerCase()
    return filteredByTab.filter(user => {
      return (
        user.name?.toLowerCase().includes(query) ||
        user.lastname?.toLowerCase().includes(query) ||
        user.email?.toLowerCase().includes(query) ||
        user.phone?.toLowerCase().includes(query)
      )
    })
  }, [filteredByTab, searchQuery])

  // Contadores por estado
  const activeCount = useMemo(() => 
    patientUsers.filter(u => !u.is_blocked).length,
    [patientUsers]
  )
  
  const blockedCount = useMemo(() => 
    patientUsers.filter(u => u.is_blocked).length,
    [patientUsers]
  )

  // Paginación
  const totalPages = Math.ceil(filteredUsers.length / ITEMS_PER_PAGE)
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE
  const endIndex = startIndex + ITEMS_PER_PAGE
  const paginatedUsers = filteredUsers.slice(startIndex, endIndex)

  // Reset a página 1 cuando cambia la pestaña o la búsqueda
  const handleTabChange = (tab) => {
    setActiveTab(tab)
    setCurrentPage(1)
  }

  const handleSearchChange = (e) => {
    setSearchQuery(e.target.value)
    setCurrentPage(1)
  }

  // Función para sincronizar manualmente con Google Calendar
  const handleManualSync = async () => {
    setSyncing(true)
    setSyncResult(null)

    try {
      const result = await apiRequest(`${API_BASE_URL}/api/calendar/sync`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        }
      })

      if (result.rateLimited) {
        return
      }

      if (result.success) {
        setSyncResult(result.data?.data || result.data)
        setLastSyncTime(new Date().toLocaleString('es-AR'))
        toast.success('Sincronización completada exitosamente')
      } else {
        setSyncResult({ error: result.message })
        if (!result.toastShown) {
          toast.error(result.message || 'Error al sincronizar con Google Calendar')
        }
      }
    } catch (error) {
      console.error('Error en sincronización manual:', error)
      setSyncResult({ error: 'Error de conexión' })
      toast.error('Error de conexión al sincronizar')
    } finally {
      setSyncing(false)
    }
  }

  const toggleBlockUser = async (targetUser) => {
    if (!targetUser || targetUser.id === 1) return

    setBlockingId(targetUser.id)

    try {
      const result = await apiRequest(`${API_BASE_URL}/api/users/${targetUser.id}/block`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ blocked: !targetUser.is_blocked })
      })

      if (result.rateLimited) {
        return
      }

      if (result.success) {
        const updatedUser = result.data?.data?.user

        if (updatedUser) {
          const normalizedUser = {
            ...updatedUser,
            role: updatedUser.role || (updatedUser.id === 1 ? 'admin' : 'patient')
          }

          setUsers((prev) =>
            prev.map((u) => (u.id === targetUser.id ? normalizedUser : u))
          )
        } else {
          setUsers((prev) =>
            prev.map((u) => (u.id === targetUser.id ? {
              ...u,
              is_blocked: !u.is_blocked
            } : u))
          )
        }

        toast.success(result.message || 'Estado de usuario actualizado')
      } else {
        if (!result.toastShown) {
          toast.error(result.message || 'No se pudo actualizar el usuario')
        }
      }
    } catch (error) {
      console.error('Error bloqueando usuario:', error)
      toast.error('Error de conexión al actualizar el usuario')
    } finally {
      setBlockingId(null)
    }
  }

  if (!isLoggedIn) {
    return null
  }

  if (!userRole) {
    return (
      <div className="admin-page">
        <div className="admin-loading">
          <div className="admin-spinner"></div>
          <p>Preparando panel...</p>
        </div>
      </div>
    )
  }

  if (userRole !== 'admin') {
    return null
  }

  return (
    <div className="admin-page">
      <div className="admin-header">
        <div>
          <h1>Panel administrativo</h1>
          <p>Gestioná a todos los usuarios registrados en la plataforma</p>
        </div>
      </div>

      {fetchError && (
        <div className="admin-alert admin-alert--error">
          {fetchError}
        </div>
      )}

      {loading ? (
        <div className="admin-loading">
          <div className="admin-spinner"></div>
          <p>Cargando usuarios...</p>
        </div>
      ) : (
        <>
          {adminUser && (
            <section className="admin-card">
              <h2>Administrador principal</h2>
              <div className="admin-card__content">
                <div className="admin-card__info">
                  <p><strong>Nombre:</strong> {adminUser.name} {adminUser.lastname}</p>
                  <p><strong>Email:</strong> {adminUser.email}</p>
                  <p><strong>Teléfono:</strong> {adminUser.phone}</p>
                </div>
                <div className="admin-card__status">
                  <span className="status-chip status-chip--admin">Administrador</span>
                  {adminUser.is_verified ? (
                    <span className="status-chip status-chip--success">Cuenta verificada</span>
                  ) : (
                    <span className="status-chip status-chip--warning">Cuenta sin verificar</span>
                  )}
                </div>
              </div>
            </section>
          )}

          {/* Sección de Sincronización con Google Calendar */}
          <section className="admin-card" style={{ marginTop: '30px' }}>
            <div style={{ 
              display: 'flex', 
              justifyContent: 'space-between', 
              alignItems: 'center',
              marginBottom: '20px'
            }}>
              <div>
                <h2>Sincronización con Google Calendar</h2>
                <p style={{ 
                  fontSize: '0.9rem', 
                  color: '#6c757d', 
                  marginTop: '5px' 
                }}>
                  Sincroniza los turnos de la base de datos con los eventos de Google Calendar
                </p>
              </div>
              <button
                onClick={handleManualSync}
                disabled={syncing}
                style={{
                  padding: '12px 24px',
                  background: syncing ? '#6c757d' : '#4a90e2',
                  color: 'white',
                  border: 'none',
                  borderRadius: '8px',
                  cursor: syncing ? 'not-allowed' : 'pointer',
                  fontSize: '0.95rem',
                  fontWeight: '600',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  transition: 'all 0.3s ease',
                  boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
                }}
                onMouseOver={(e) => {
                  if (!syncing) e.target.style.background = '#3a7bc8'
                }}
                onMouseOut={(e) => {
                  if (!syncing) e.target.style.background = '#4a90e2'
                }}
              >
                {syncing ? (
                  <>
                    <div style={{
                      width: '16px',
                      height: '16px',
                      border: '2px solid white',
                      borderTopColor: 'transparent',
                      borderRadius: '50%',
                      animation: 'spin 0.8s linear infinite'
                    }}></div>
                    Sincronizando...
                  </>
                ) : (
                  <>
                    🔄 Sincronizar ahora
                  </>
                )}
              </button>
            </div>

            {lastSyncTime && (
              <div style={{
                padding: '10px 15px',
                background: '#e7f3ff',
                borderLeft: '4px solid #4a90e2',
                borderRadius: '4px',
                fontSize: '0.9rem',
                color: '#0056b3',
                marginBottom: '15px'
              }}>
                <strong>Última sincronización:</strong> {lastSyncTime}
              </div>
            )}

            {syncResult && (
              <div className="admin-card__content" style={{ marginTop: '20px' }}>
                {syncResult.error ? (
                  <div style={{
                    padding: '15px',
                    background: '#f8d7da',
                    borderLeft: '4px solid #dc3545',
                    borderRadius: '4px',
                    color: '#721c24'
                  }}>
                    <strong>❌ Error:</strong> {syncResult.error}
                  </div>
                ) : (
                  <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                    gap: '15px'
                  }}>
                    <div style={{
                      padding: '15px',
                      background: '#d4edda',
                      borderLeft: '4px solid #28a745',
                      borderRadius: '8px'
                    }}>
                      <div style={{ fontSize: '0.85rem', color: '#155724', marginBottom: '5px' }}>
                        Eventos en Calendar
                      </div>
                      <div style={{ fontSize: '1.5rem', fontWeight: '700', color: '#155724' }}>
                        {syncResult.calendarEvents || 0}
                      </div>
                    </div>

                    <div style={{
                      padding: '15px',
                      background: '#d1ecf1',
                      borderLeft: '4px solid #17a2b8',
                      borderRadius: '8px'
                    }}>
                      <div style={{ fontSize: '0.85rem', color: '#0c5460', marginBottom: '5px' }}>
                        Turnos en Base de Datos
                      </div>
                      <div style={{ fontSize: '1.5rem', fontWeight: '700', color: '#0c5460' }}>
                        {syncResult.turnosDB || 0}
                      </div>
                    </div>

                    <div style={{
                      padding: '15px',
                      background: '#fff3cd',
                      borderLeft: '4px solid #ffc107',
                      borderRadius: '8px'
                    }}>
                      <div style={{ fontSize: '0.85rem', color: '#856404', marginBottom: '5px' }}>
                        Turnos Cancelados
                      </div>
                      <div style={{ fontSize: '1.5rem', fontWeight: '700', color: '#856404' }}>
                        {syncResult.cancelados || 0}
                      </div>
                    </div>

                    <div style={{
                      padding: '15px',
                      background: '#cce5ff',
                      borderLeft: '4px solid #004085',
                      borderRadius: '8px'
                    }}>
                      <div style={{ fontSize: '0.85rem', color: '#004085', marginBottom: '5px' }}>
                        Turnos Mantenidos
                      </div>
                      <div style={{ fontSize: '1.5rem', fontWeight: '700', color: '#004085' }}>
                        {syncResult.mantenidos || 0}
                      </div>
                    </div>
                  </div>
                )}

                {!syncResult.error && syncResult.cancelados > 0 && (
                  <div style={{
                    marginTop: '15px',
                    padding: '12px',
                    background: '#fff3cd',
                    borderRadius: '6px',
                    fontSize: '0.9rem',
                    color: '#856404'
                  }}>
                    ℹ️ <strong>Nota:</strong> Se cancelaron {syncResult.cancelados} turno(s) que fueron eliminados del Google Calendar
                  </div>
                )}
              </div>
            )}
          </section>

          <section className="admin-table-section">
            <div className="admin-table-section__header">
              <h2>Pacientes registrados</h2>
              <span className="admin-meta__badge">{patientUsers.length} paciente(s)</span>
            </div>

            {/* Pestañas */}
            <div className="admin-tabs" style={{
              display: 'flex',
              gap: '10px',
              marginBottom: '20px',
              borderBottom: '2px solid #e9ecef',
              flexWrap: 'wrap'
            }}>
              <button
                onClick={() => handleTabChange('active')}
                className={`tab-button ${activeTab === 'active' ? 'active' : ''}`}
                style={{
                  padding: '10px 20px',
                  border: 'none',
                  background: activeTab === 'active' ? '#28a745' : '#f8f9fa',
                  color: activeTab === 'active' ? 'white' : '#6c757d',
                  borderRadius: '8px 8px 0 0',
                  cursor: 'pointer',
                  fontWeight: activeTab === 'active' ? '600' : '400',
                  fontSize: '0.95rem',
                  transition: 'all 0.3s ease',
                  borderBottom: activeTab === 'active' ? '3px solid #28a745' : 'none'
                }}
              >
                Activos ({activeCount})
              </button>
              <button
                onClick={() => handleTabChange('blocked')}
                className={`tab-button ${activeTab === 'blocked' ? 'active' : ''}`}
                style={{
                  padding: '10px 20px',
                  border: 'none',
                  background: activeTab === 'blocked' ? '#dc3545' : '#f8f9fa',
                  color: activeTab === 'blocked' ? 'white' : '#6c757d',
                  borderRadius: '8px 8px 0 0',
                  cursor: 'pointer',
                  fontWeight: activeTab === 'blocked' ? '600' : '400',
                  fontSize: '0.95rem',
                  transition: 'all 0.3s ease',
                  borderBottom: activeTab === 'blocked' ? '3px solid #dc3545' : 'none'
                }}
              >
                Bloqueados ({blockedCount})
              </button>
            </div>

            {/* Campo de búsqueda */}
            <div className="admin-search" style={{
              marginBottom: '20px',
              display: 'flex',
              alignItems: 'center',
              gap: '10px'
            }}>
              <input
                type="text"
                placeholder="Buscar por nombre, apellido, email o teléfono..."
                value={searchQuery}
                onChange={handleSearchChange}
                style={{
                  flex: 1,
                  padding: '12px 16px',
                  border: '1px solid #dee2e6',
                  borderRadius: '8px',
                  fontSize: '0.95rem',
                  outline: 'none',
                  transition: 'border-color 0.3s ease'
                }}
                onFocus={(e) => e.target.style.borderColor = '#4a90e2'}
                onBlur={(e) => e.target.style.borderColor = '#dee2e6'}
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  style={{
                    padding: '12px 16px',
                    background: '#6c757d',
                    color: 'white',
                    border: 'none',
                    borderRadius: '8px',
                    cursor: 'pointer',
                    fontSize: '0.95rem',
                    fontWeight: '600',
                    transition: 'all 0.3s ease'
                  }}
                  onMouseOver={(e) => e.target.style.background = '#5a6268'}
                  onMouseOut={(e) => e.target.style.background = '#6c757d'}
                >
                  Limpiar
                </button>
              )}
            </div>

            {filteredUsers.length === 0 ? (
              <div className="admin-empty">
                {searchQuery ? (
                  <p>No se encontraron pacientes que coincidan con "{searchQuery}"</p>
                ) : (
                  <p>No hay pacientes {activeTab === 'active' ? 'activos' : 'bloqueados'}.</p>
                )}
              </div>
            ) : (
              <>
                <div className="admin-table-wrapper">
                  <table className="admin-table">
                    <thead>
                      <tr>
                        <th>#</th>
                        <th>Nombre</th>
                        <th>Apellido</th>
                        <th>Email</th>
                        <th>Teléfono</th>
                        <th>Estado</th>
                        <th>Acciones</th>
                      </tr>
                    </thead>
                    <tbody>
                      {paginatedUsers.map((patient, index) => (
                        <tr key={patient.id}>
                          <td>{startIndex + index + 1}</td>
                          <td>{patient.name}</td>
                          <td>{patient.lastname}</td>
                          <td>{patient.email}</td>
                          <td>{patient.phone}</td>
                          <td>
                            <div className="admin-status-col">
                              <span className={`status-chip ${patient.is_blocked ? 'status-chip--danger' : 'status-chip--success'}`}>
                                {patient.is_blocked ? 'Bloqueado' : 'Activo'}
                              </span>
                              <span className={`status-subtitle ${patient.is_verified ? 'status-subtitle--ok' : 'status-subtitle--warn'}`}>
                                {patient.is_verified ? 'Verificado' : 'Sin verificar'}
                              </span>
                            </div>
                          </td>
                          <td>
                            <div className="admin-actions">
                              <button
                                className={`admin-btn ${patient.is_blocked ? 'admin-btn--secondary' : 'admin-btn--primary'}`}
                                onClick={() => toggleBlockUser(patient)}
                                disabled={blockingId === patient.id || deletingId === patient.id}
                              >
                                {blockingId === patient.id
                                  ? 'Actualizando...'
                                  : patient.is_blocked ? 'Desbloquear' : 'Bloquear'}
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
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
          </section>
        </>
      )}
    </div>
  )
}

export default Admin