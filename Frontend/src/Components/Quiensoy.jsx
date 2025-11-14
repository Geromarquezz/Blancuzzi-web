import { useState, useEffect } from 'react'
import './Quiensoy.css'
import './Sections.css'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import img3 from '../assets/Fotos/Img ella 3.jpeg'
import img5 from '../assets/Fotos/Img ella 5.jpeg'

const Quiensoy = () => {
    const images = [img3, img5]
    const [currentImageIndex, setCurrentImageIndex] = useState(0)

    // Función para el carrusel de imágenes about
    useEffect(() => {
        if (images.length <= 1) return // No inicializar si hay una sola imagen o ninguna

        const intervalId = setInterval(() => {
            setCurrentImageIndex((prevIndex) => (prevIndex + 1) % images.length)
        }, 5000)

        return () => clearInterval(intervalId)
    }, [images.length])
  return (
        <section id="Quien-soy?" className="about" itemScope itemType="https://schema.org/AboutPage">
        <div className="container">
            <div className="section-header">
                <h2 className="section-title">¿Quién soy?</h2>
                <div className="section-divider"></div>
            </div>
            <div className="about-content">
                <div className="about-carousel">
                    {images.map((img, index) => (
                        <div key={index} className={`about-image-container ${
                            index === currentImageIndex ? 'active' : ''
                        }`}>
                            <img 
                                src={img}
                                alt="Od. Angelica Blancuzzi - Odontóloga profesional en Villa María, Córdoba especialista en estética dental y tratamientos integrales"
                                className={`about-image ${
                                    index === currentImageIndex ? 'active' : ''
                                }`} 
                                width="400" 
                                height="500"
                            />
                        </div>
                    ))}
                </div>
                <div className="about-text">
                    <p className="about-description" itemProp="description">
                        Soy la <strong>Od. Angelica Blancuzzi</strong>, odontóloga con más de <em>25 años de
                        experiencia</em> en la ciudad de <strong>Villa María, Córdoba, Argentina</strong>.
                        Amo lo que hago, soy muy feliz atendiendo a mis pacientes, ellos me confían su salud dental y yo
                        les brindo todo lo que está a mi alcance para hacerles el bien. Mi objetivo es crear una
                        experiencia cómoda y profesional, donde cada sonrisa cuenta una historia de cuidado y
                        dedicación.
                    </p>
                </div>
                <div className="about-icons">
                    <article className="icon-item">
                        <i><FontAwesomeIcon icon="tooth" /></i>
                        <h3>Cuidado Integral</h3>
                        <p>Tratamientos dentales completos para toda la familia en Villa María</p>
                    </article>
                    <article className="icon-item">
                        <i>
                            <FontAwesomeIcon icon="heart" />
                        </i>
                        <h3>Atención Personalizada</h3>
                        <p>Cada paciente es único y especial, atención odontológica profesional</p>
                    </article>
                    <article className="icon-item">
                        <i>
                            <FontAwesomeIcon icon="smile" />
                        </i>
                        <h3>Sonrisas Saludables</h3>
                        <p>Tu bienestar es mi prioridad</p>
                    </article>
                </div>
            </div>
        </div>
    </section>
  )
}

export default Quiensoy