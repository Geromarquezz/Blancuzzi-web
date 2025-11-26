import Blanqueamiento from '../assets/Fotos/Blanqueamiento.webp'
import Strass from '../assets/Fotos/Strass.webp'
import Reconstrucciones from '../assets/Fotos/Reconstruccion-estetica.webp'
import Ortodoncia from '../assets/Fotos/Ortodoncia.webp'
import Endodoncia from '../assets/Fotos/Endodoncia.webp'
import Coronas from '../assets/Fotos/Coronas.webp'
import './MisTrabajos.css'


const MisTrabajos = () => {
  return (
        <section id="mis-trabajos" className="works" itemScope itemType="https://schema.org/MedicalBusiness">
        <div className="container">
            <div className="section-header">
                <h2 className="section-title">Mis Trabajos Odontológicos</h2>
                <div className="section-divider"></div>
            </div>
        </div>
        <div className="carousel" role="region"
            aria-label="Galería de tratamientos dentales realizados por la Od. Angelica Blancuzzi">
            <div className="group">
                <article className="card" itemProp="medicalSpecialty" itemScope
                    itemType="https://schema.org/MedicalSpecialty">
                    <h3 itemProp="name">Blanqueamientos</h3>
                    <img src={Blanqueamiento}
                        alt="Blanqueamiento dental antes y después - tratamiento de estética dental realizado por Od. Angelica Blancuzzi en Villa María"
                        width="250" height="200" loading="lazy"/>
                </article>
                <article className="card" itemProp="medicalSpecialty" itemScope
                    itemType="https://schema.org/MedicalSpecialty">
                    <h3 itemProp="name">Strass Dentales</h3>
                    <img src={Strass}
                        alt="Strass dentales - cristales en dientes para estética dental en Villa María, Córdoba"
                        width="250" height="200" loading="lazy"/>
                </article>
                <article className="card" itemProp="medicalSpecialty" itemScope
                    itemType="https://schema.org/MedicalSpecialty">
                    <h3 itemProp="name">Reconstrucciones</h3>
                    <img src={Reconstrucciones}
                        alt="Reconstrucción estética dental - restauración dental con resina en Villa María" width="250"
                        height="200" loading="lazy"/>
                </article>
                <article className="card" itemProp="medicalSpecialty" itemScope
                    itemType="https://schema.org/MedicalSpecialty">
                    <h3 itemProp="name">Ortodoncia</h3>
                    <img src={Ortodoncia}
                        alt="Tratamiento de ortodoncia en Villa María - alineación dental profesional" width="250"
                        height="200" loading="lazy"/>
                </article>
                <article className="card" itemProp="medicalSpecialty" itemScope
                    itemType="https://schema.org/MedicalSpecialty">
                    <h3 itemProp="name">Endodoncia</h3>
                    <img src={Endodoncia}
                        alt="Tratamiento de endodoncia en Villa María - tratamiento de conducto" width="250"
                        height="200" loading="lazy"/>
                </article>
                <article className="card" itemProp="medicalSpecialty" itemScope
                    itemType="https://schema.org/MedicalSpecialty">
                    <h3 itemProp="name">Coronas</h3>
                    <img src={Coronas}
                        alt="Coronas dentales en Villa María - prótesis dental" width="250"
                        height="200" loading="lazy"/>
                </article>
                
                <article className="card" itemProp="medicalSpecialty" itemScope
                    itemType="https://schema.org/MedicalSpecialty">
                    <h3 itemProp="name">Blanqueamientos</h3>
                    <img src={Blanqueamiento}
                        alt="Blanqueamiento dental antes y después - tratamiento de estética dental realizado por Od. Angelica Blancuzzi en Villa María"
                        width="250" height="200" loading="lazy"/>
                </article>
                <article className="card" itemProp="medicalSpecialty" itemScope
                    itemType="https://schema.org/MedicalSpecialty">
                    <h3 itemProp="name">Strass Dentales</h3>
                    <img src={Strass}
                        alt="Strass dentales - cristales en dientes para estética dental en Villa María, Córdoba"
                        width="250" height="200" loading="lazy"/>
                </article>
                <article className="card" itemProp="medicalSpecialty" itemScope
                    itemType="https://schema.org/MedicalSpecialty">
                    <h3 itemProp="name">Reconstrucciones</h3>
                    <img src={Reconstrucciones}
                        alt="Reconstrucción estética dental - restauración dental con resina en Villa María" width="250"
                        height="200" loading="lazy"/>
                </article>
                <article className="card" itemProp="medicalSpecialty" itemScope
                    itemType="https://schema.org/MedicalSpecialty">
                    <h3 itemProp="name">Ortodoncia</h3>
                    <img src={Ortodoncia}
                        alt="Tratamiento de ortodoncia en Villa María - alineación dental profesional" width="250"
                        height="200" loading="lazy"/>
                </article>
                <article className="card" itemProp="medicalSpecialty" itemScope
                    itemType="https://schema.org/MedicalSpecialty">
                    <h3 itemProp="name">Endodoncia</h3>
                    <img src={Endodoncia}
                        alt="Tratamiento de endodoncia en Villa María - tratamiento de conducto" width="250"
                        height="200" loading="lazy"/>
                </article>
                <article className="card" itemProp="medicalSpecialty" itemScope
                    itemType="https://schema.org/MedicalSpecialty">
                    <h3 itemProp="name">Coronas</h3>
                    <img src={Coronas} alt="Coronas dentales en Villa María - prótesis dental" width="250"
                        height="200"
                        loading="lazy"/>
                </article>
            </div>
        </div>
    </section>
  )
}

export default MisTrabajos