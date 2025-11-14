// fontawesome.js - Configuración de Font Awesome
import { library } from '@fortawesome/fontawesome-svg-core'
import { 
  faCalendarAlt, 
  faMapMarkerAlt, 
  faPhone, 
  faEnvelope, 
  faClock,
  faUser,
  faSmile,
  faAward,
  faHeart,
  faTooth,
  faEye,
  faEyeSlash
} from '@fortawesome/free-solid-svg-icons'
import { 
  faWhatsapp, 
  faInstagram,
  faGoogle
} from '@fortawesome/free-brands-svg-icons'

// Agregar iconos a la librería
library.add(
  // Solid icons
  faCalendarAlt,
  faMapMarkerAlt, 
  faPhone,
  faEnvelope,
  faClock,
  faUser,
  faSmile,
  faAward,
  faHeart,
  faTooth,
  faEye,
  faEyeSlash,
  // Brand icons
  faWhatsapp,
  faInstagram,
  faGoogle
)