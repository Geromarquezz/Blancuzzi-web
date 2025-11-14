import { useState, useEffect } from 'react'
import './Hero.css'
import './Sections.css'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import perfilImg from '../assets/Fotos/perfil-sin-fondo.png'
import img1 from '../assets/Fotos/Img ella 1 sin fondo.png'
import img6 from '../assets/Fotos/Img ella 6 sin fondo.png'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'


const Hero = () => {
    const images = [perfilImg, img1, img6]
    const [currentImageIndex, setCurrentImageIndex] = useState(0)
    const navigate = useNavigate()
    const { isLoggedIn, isAdmin } = useAuth()

    // Función para el carrusel de imágenes del hero
    useEffect(() => {
        if (images.length <= 1) return // No inicializar si hay una sola imagen o ninguna

        const intervalId = setInterval(() => {
            setCurrentImageIndex((prevIndex) => (prevIndex + 1) % images.length)
        }, 4000)

        return () => clearInterval(intervalId)
    }, [images.length])

    const handleAgendarTurno = (e) => {
        e.preventDefault()
        
        // Si el usuario está logueado, ir a /turnos
        // Si no está logueado, ir a /login
        if (isLoggedIn) {
            if (isAdmin) {
                navigate('/admin')
            } else {
                navigate('/turnos')
            }
        } else {
            navigate('/login')
        }
    }

    return (
        <header id="inicio" className="hero">
            <div className="hero-container">
                <div className="hero-content">
                    <div className="hero-image">
                        {images.map((img, index) => (
                            <img
                                key={index}
                                src={img}
                                alt="Od. Angelica Blancuzzi - Odontóloga profesional en Villa María, Córdoba especialista en estética dental y tratamientos integrales"
                                className={`doctor-image ${index === currentImageIndex ? 'active' : ''
                                    } ${index === 0 ? 'sinfondo-hero' :
                                        index === 1 ? 'sinfondo1-hero' : ''
                                    }`}
                                width="400"
                                height="500"
                            />
                        ))}
                    </div>
                    <div className="hero-text">
                        <h1 className="hero-title">Estoy para hacerte sonreír</h1>
                        <p className="hero-subtitle">Cuidado dental profesional con calidez humana en Villa María, Córdoba</p>
                        <a href="#contactos" className="cta-button" onClick={handleAgendarTurno} aria-label="Agendar turno con la Od. Angelica Blancuzzi">
                            <i>
                                <FontAwesomeIcon icon="calendar-alt" />
                            </i>
                            Agendá tu turno
                        </a>
                    </div>
                </div>
            </div>
        </header>
    )
}

export default Hero