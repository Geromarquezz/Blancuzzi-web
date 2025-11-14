import './Contacto.css'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'

const Contacto = () => {


    return (
        <section id="contactos" className="contact" itemScope itemType="https://schema.org/ContactPage">
            <div className="container">
                <div className="section-header">
                    <h2 className="section-title">Contactame</h2>
                    <div className="section-divider"></div>
                </div>
                <div className="contact-content">
                    <div className="contact-info" itemScope itemType="https://schema.org/Dentist">
                        <article className="contact-item">
                            <i>
                                <FontAwesomeIcon icon="phone" />
                            </i>
                            <div>
                                <h3>Teléfono</h3>
                                <p itemProp="telephone">
                                    <a href="tel:+5493534728035" aria-label="Llamar a Od. Angelica Blancuzzi">
                                        +54 9 353 472-8035
                                    </a>
                                </p>
                            </div>
                        </article>

                        <div className="contact-item">
                            <i>
                                <FontAwesomeIcon icon="envelope" />
                            </i>
                            <div>
                                <h3>Email</h3>
                                <p>mablancuzzi@gmail.com</p>
                            </div>
                        </div>

                        <div className="contact-item">
                            <i>
                                <FontAwesomeIcon icon="calendar-alt" />
                            </i>
                            <div>
                                <h3>Turnos</h3>
                                <p>Solicita tu turno mediante el sistema de turnos Iniciando Sesión</p>
                            </div>
                        </div>
                    </div>

                </div>
            </div>
        </section>
    )
}

export default Contacto