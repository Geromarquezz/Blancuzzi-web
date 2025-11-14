import './Media.css'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'

const Media = () => {
    return (
        <>
            <a href="https://wa.me/5493534728035" className="whatsapp-float" target="_blank" title="Contactar por WhatsApp">
                <FontAwesomeIcon icon={['fab', 'whatsapp']} />
            </a>

            <a href="https://www.instagram.com/odontologia.blancuzzi/" className="instagram-float" target="_blank"
                title="Contactar por Instagram">
                <i>

                    <FontAwesomeIcon icon={['fab', 'instagram']} />
                </i>
            </a>
        </>
    )
}

export default Media