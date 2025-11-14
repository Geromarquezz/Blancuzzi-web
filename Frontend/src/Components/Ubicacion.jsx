import './Ubicacion.css'
import './Sections.css'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'

const Ubicacion = () => {
  return (
    <section id="ubicacion" className="location">
      <div className="container">
        <div className="section-header">
          <h2 className="section-title">Dónde encontrarme</h2>
          <div className="section-divider"></div>
        </div>
        <div className="location-content">
          <div className="location-info">
            <div className="location-item">
              <i>
                <FontAwesomeIcon icon="map-marker-alt" />
              </i>
              <div>
                <h3>Dirección</h3>
                <p>Sabatini 163, Villa María, Cordoba, Argentina</p>
              </div>
            </div>
            <div className="location-item">
              <i>
                <FontAwesomeIcon icon="clock" />
              </i>
              <div>
                <h3>Horarios de atención</h3>
                <p>Lunes a Viernes: 12:00 - 20:00hs</p>
              </div>
            </div>
          </div>
          <div className="map-container">
            <iframe
              src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3355.7234567890123!2d-63.2456789!3d-32.4123456!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2sSabatini%20163%2C%20Villa%20Mar%C3%ADa%205900!5e0!3m2!1ses!2sar!4v1234567890123"
              width="100%"
              height="300"
              style={{ border: 0 }}
              allowFullScreen=""
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade">
            </iframe>
          </div>
        </div>
      </div>
    </section>
  )
}

export default Ubicacion