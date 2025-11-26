import { useState, useEffect } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import logoImg from '../assets/Fotos/Logo-sin-fondo.webp'
import './Navbar.css'


const Navbar = () => {
    const [isMenuOpen, setIsMenuOpen] = useState(false)
    const navigate = useNavigate()
    const location = useLocation()
    const { isLoggedIn, user, logout, isAdmin } = useAuth()

    // Función para alternar el menú móvil
    const toggleMobileMenu = () => {
        setIsMenuOpen(!isMenuOpen)
    }

    // Función para cerrar el menú móvil al hacer clic en un enlace
    const closeMobileMenu = () => {
        setIsMenuOpen(false)
    }

    // Función para la navegación suave que funciona en cualquier página
    const handleNavigation = (e, targetId) => {
        e.preventDefault()
        
        // Si estamos en la página de inicio, hacer scroll suave
        if (location.pathname === '/') {
            const targetSection = document.getElementById(targetId)
            
            if (targetSection) {
                const offsetTop = targetSection.offsetTop - 80 // Compensar altura del navbar
                
                window.scrollTo({
                    top: offsetTop,
                    behavior: 'smooth'
                })
            }
        } else {
            // Si estamos en otra página, navegar a inicio con el hash
            navigate(`/#${targetId}`)
            
            // Después de navegar, hacer scroll (con un pequeño delay para que cargue la página)
            setTimeout(() => {
                const targetSection = document.getElementById(targetId)
                if (targetSection) {
                    const offsetTop = targetSection.offsetTop - 80
                    window.scrollTo({
                        top: offsetTop,
                        behavior: 'smooth'
                    })
                }
            }, 100)
        }
        closeMobileMenu()
    }

    // Función especial para el botón "Turnos"
    const handleTurnosNavigation = (e) => {
        e.preventDefault()
        if (isAdmin) {
            navigate('/admin')
        } else {
            navigate('/turnos')
        }
        closeMobileMenu()
    }

    // Función para manejar el logout
    const handleLogout = async (e) => {
        e.preventDefault()
        await logout()
        navigate('/')
        closeMobileMenu()
    }

    // Efecto para manejar el hash en la URL cuando se carga la página
    useEffect(() => {
        // Si hay un hash en la URL y estamos en la página de inicio
        if (location.pathname === '/' && location.hash) {
            const targetId = location.hash.replace('#', '')
            setTimeout(() => {
                const targetSection = document.getElementById(targetId)
                if (targetSection) {
                    const offsetTop = targetSection.offsetTop - 80
                    window.scrollTo({
                        top: offsetTop,
                        behavior: 'smooth'
                    })
                }
            }, 500) // Delay para asegurar que la página esté completamente cargada
        }
    }, [location])

    // Efecto para manejar el redimensionamiento de ventana
    useEffect(() => {
        const handleResize = () => {
            if (window.innerWidth > 768 && isMenuOpen) {
                setIsMenuOpen(false)
            }
        }

        window.addEventListener('resize', handleResize)
        return () => window.removeEventListener('resize', handleResize)
    }, [isMenuOpen])

    // Efecto para mejorar la accesibilidad del teclado
    useEffect(() => {
        const handleKeydown = (e) => {
            if (e.key === 'Escape' && isMenuOpen) {
                setIsMenuOpen(false)
            }
        }

        document.addEventListener('keydown', handleKeydown)
        return () => document.removeEventListener('keydown', handleKeydown)
    }, [isMenuOpen])
    return (
        <nav className="navbar" id="navbar">
            <div className="nav-container">
                <div className="nav-logo">
                    <a href="#inicio" onClick={(e) => handleNavigation(e, 'inicio')}>
                        <img src={logoImg} alt="Od. Angelica Blancuzzi - Odontóloga Villa María" />
                    </a>
                </div>
               
                <div 
                    className={`nav-toggle ${isMenuOpen ? 'active' : ''}`} 
                    onClick={toggleMobileMenu}
                    role="button"
                    tabIndex={0}
                    onKeyDown={(e) => {
                        if (e.key === 'Enter' || e.key === ' ') {
                            toggleMobileMenu()
                        }
                    }}
                    aria-label="Toggle mobile menu"
                >
                    <span className="bar"></span>
                    <span className="bar"></span>
                    <span className="bar"></span>
                </div>
                
                <ul className={`nav-menu ${isMenuOpen ? 'active' : ''}`}>
                    {/* Menú de usuario */}
                    {isLoggedIn ? (
                        isAdmin ? (
                            <>
                                <li className="nav-item">
                                    <a
                                        href="/admin"
                                        className="nav-link user-link"
                                        onClick={(e) => {
                                            e.preventDefault()
                                            navigate('/admin')
                                            closeMobileMenu()
                                        }}
                                    >
                                        Panel Admin
                                    </a>
                                </li>
                                <li className="nav-item">
                                    <a href="#logout" className="nav-link logout-link" onClick={handleLogout}>
                                        Salir
                                    </a>
                                </li>
                            </>
                        ) : (
                            <>
                                <li className="nav-item">
                                    <a href="/profile" className="nav-link user-link" onClick={(e) => { e.preventDefault(); navigate('/profile'); closeMobileMenu(); }}>
                                        👤 {user?.name || 'Perfil'}
                                    </a>
                                </li>
                                <li className="nav-item">
                                    <a href="#logout" className="nav-link logout-link" onClick={handleLogout}>
                                        🚪 Salir
                                    </a>
                                </li>
                            </>
                        )
                    ) : (
                        <>
                            <li className="nav-item">
                                <a href="/login" className="nav-link login-link" onClick={(e) => { e.preventDefault(); navigate('/login'); closeMobileMenu(); }}>
                                    Ingresar
                                </a>
                            </li>
                            <li className="nav-item">
                                <a href="/register" className="nav-link register-link" onClick={(e) => { e.preventDefault(); navigate('/register'); closeMobileMenu(); }}>
                                    Registrarse
                                </a>
                            </li>
                        </>
                    )}
                </ul>
            </div>
        </nav>

    )
}

export default Navbar