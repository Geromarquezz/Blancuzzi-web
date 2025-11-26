import { useState } from 'react'
import { Link } from 'react-router-dom'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { useAuth } from '../hooks/useAuth'
import './Footer.css'

const Footer = () => {
  const { isLoggedIn, isAdmin } = useAuth()
  const currentYear = new Date().getFullYear()
  const [openSections, setOpenSections] = useState({})

  const toggleSection = (key) => {
    setOpenSections((prev) => ({
      ...prev,
      [key]: !prev[key],
    }))
  }

  const sections = [
    {
      key: 'contacto',
      title: 'Contacto',
      content: (
        <div className="footer-contact">
          <a href="tel:+5493534728035" className="footer-link">
            <FontAwesomeIcon icon="phone" />
            <span>+54 9 353 472-8035</span>
          </a>
          <a href="mailto:mablancuzzi@gmail.com" className="footer-link">
            <FontAwesomeIcon icon="envelope" />
            <span>mablancuzzi@gmail.com</span>
          </a>
          <a
            href="https://www.google.com/maps/search/?api=1&query=Sabatini+163+Villa+María+Córdoba"
            target="_blank"
            rel="noopener noreferrer"
            className="footer-link"
          >
            <FontAwesomeIcon icon="map-marker-alt" />
            <span>Sabatini 163, Villa María, Córdoba</span>
          </a>
          <div className="footer-link">
            <FontAwesomeIcon icon="clock" />
            <span>Lun - Vie: 12:00 - 20:00 hs</span>
          </div>
        </div>
      ),
    },
    {
      key: 'navegacion',
      title: 'Navegación',
      content: (
        <div className="footer-links">
          <a href="/#inicio" className="footer-link-text">Inicio</a>
          <a href="/#quiensoy" className="footer-link-text">Quién Soy</a>
          <a href="/#trabajos" className="footer-link-text">Mis Trabajos</a>
          <a href="/#ubicacion" className="footer-link-text">Ubicación</a>
          <a href="/#contactos" className="footer-link-text">Contacto</a>
          {isLoggedIn && !isAdmin && (
            <Link to="/turnos" className="footer-link-text">Solicitar Turno</Link>
          )}
        </div>
      ),
    },
    {
      key: 'acceso',
      title: 'Acceso',
      content: (
        <div className="footer-links">
          {isLoggedIn ? (
            <>
              <Link to="/profile" className="footer-link-text">Mi Perfil</Link>
              {isAdmin ? (
                <Link to="/admin" className="footer-link-text">Panel Admin</Link>
              ) : (
                <Link to="/turnos" className="footer-link-text">Mis Turnos</Link>
              )}
            </>
          ) : (
            <>
              <Link to="/login" className="footer-link-text">Iniciar Sesión</Link>
              <Link to="/register" className="footer-link-text">Registrarse</Link>
            </>
          )}
          <Link to="/reset-password" className="footer-link-text">Recuperar Contraseña</Link>
        </div>
      ),
    },
    {
      key: 'redes',
      title: 'Redes Sociales',
      content: (
        <div className="footer-social-wrapper">
          <div className="footer-social">
            <a
              href="https://wa.me/5493534728035"
              target="_blank"
              rel="noopener noreferrer"
              className="footer-social-link whatsapp"
              aria-label="Contactar por WhatsApp"
            >
              <FontAwesomeIcon icon={['fab', 'whatsapp']} />
            </a>
            <a
              href="https://www.instagram.com/odontologia.blancuzzi/"
              target="_blank"
              rel="noopener noreferrer"
              className="footer-social-link instagram"
              aria-label="Seguir en Instagram"
            >
              <FontAwesomeIcon icon={['fab', 'instagram']} />
            </a>
          </div>
          <p className="footer-cta">
            ¡Seguime en redes para ver más contenido y novedades!
          </p>
        </div>
      ),
    },
  ]

  return (
    <footer className="footer">
      <div className="footer-container">
        {sections.map(({ key, title, content }) => {
          const sectionId = `footer-panel-${key}`
          const isOpen = !!openSections[key]

          return (
            <div className={`footer-section ${isOpen ? 'open' : ''}`} key={key}>
              <button
                type="button"
                className="footer-title footer-title-button"
                onClick={() => toggleSection(key)}
                aria-expanded={isOpen}
                aria-controls={sectionId}
              >
                <span>{title}</span>
                <span className="footer-title-icon" aria-hidden="true">
                  {isOpen ? '−' : '+'}
                </span>
              </button>
              <div
                id={sectionId}
                className="footer-panel"
                aria-hidden={!isOpen}
              >
                {content}
              </div>
            </div>
          )
        })}
      </div>

      {/* Sección inferior: Copyright */}
      <div className="footer-bottom">
        <div className="footer-bottom-content">
          <p>&copy; {currentYear} Od. Angelica Blancuzzi. Todos los derechos reservados.</p>
          <p className="footer-credits">
            Odontología profesional en Villa María, Córdoba
          </p>
        </div>
      </div>
    </footer>
  )
}

export default Footer