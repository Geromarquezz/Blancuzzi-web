import { useNavigate } from 'react-router-dom'
import './Auth.css'

const TermsAndConditions = () => {
  const navigate = useNavigate()

  return (
    <div className="auth-container">
      <div className="auth-card" style={{ maxWidth: '800px' }}>
        <div className="auth-header">
          <h1>Términos y Condiciones</h1>
          <p style={{ fontSize: '0.9rem', color: '#666' }}>
            Última actualización: {new Date().toLocaleDateString('es-AR')}
          </p>
        </div>

        <div style={{ 
          padding: '20px 0', 
          lineHeight: '1.8', 
          color: '#444',
          maxHeight: '60vh',
          overflowY: 'auto'
        }}>
          <section style={{ marginBottom: '25px' }}>
            <h2 style={{ color: '#2c3e50', fontSize: '1.3rem', marginBottom: '10px' }}>
              1. Aceptación de los Términos
            </h2>
            <p style={{ marginBottom: '10px' }}>
              Al acceder y utilizar este sitio web de servicios odontológicos, usted acepta estar sujeto a estos 
              términos y condiciones de uso, todas las leyes y regulaciones aplicables, y acepta que es responsable 
              del cumplimiento de las leyes locales aplicables.
            </p>
          </section>

          <section style={{ marginBottom: '25px' }}>
            <h2 style={{ color: '#2c3e50', fontSize: '1.3rem', marginBottom: '10px' }}>
              2. Uso del Servicio
            </h2>
            <p style={{ marginBottom: '10px' }}>
              Este sitio web proporciona una plataforma para agendar turnos odontológicos. Los usuarios pueden:
            </p>
            <ul style={{ marginLeft: '20px', marginBottom: '10px' }}>
              <li>Registrarse y crear una cuenta personal</li>
              <li>Agendar, modificar y cancelar turnos odontológicos</li>
              <li>Gestionar su información de contacto</li>
              <li>Recibir recordatorios y notificaciones sobre sus turnos</li>
            </ul>
          </section>

          <section style={{ marginBottom: '25px' }}>
            <h2 style={{ color: '#2c3e50', fontSize: '1.3rem', marginBottom: '10px' }}>
              3. Cuenta de Usuario
            </h2>
            <p style={{ marginBottom: '10px' }}>
              Para utilizar ciertas funcionalidades del servicio, debe crear una cuenta proporcionando información 
              precisa y completa. Usted es responsable de:
            </p>
            <ul style={{ marginLeft: '20px', marginBottom: '10px' }}>
              <li>Mantener la confidencialidad de sus credenciales de acceso</li>
              <li>Todas las actividades que ocurran bajo su cuenta</li>
              <li>Notificar inmediatamente cualquier uso no autorizado de su cuenta</li>
              <li>Proporcionar información de contacto actualizada y precisa</li>
            </ul>
          </section>

          <section style={{ marginBottom: '25px' }}>
            <h2 style={{ color: '#2c3e50', fontSize: '1.3rem', marginBottom: '10px' }}>
              4. Política de Turnos
            </h2>
            <p style={{ marginBottom: '10px' }}>
              Los turnos agendados están sujetos a las siguientes condiciones:
            </p>
            <ul style={{ marginLeft: '20px', marginBottom: '10px' }}>
              <li>Las cancelaciones deben realizarse con al menos 24 horas de anticipación</li>
              <li>Los turnos no cancelados con la anticipación requerida pueden resultar en restricciones futuras</li>
              <li>La odontóloga se reserva el derecho de reprogramar turnos por razones de fuerza mayor</li>
              <li>Se enviarán recordatorios por email o teléfono según la información de contacto proporcionada</li>
            </ul>
          </section>

          <section style={{ marginBottom: '25px' }}>
            <h2 style={{ color: '#2c3e50', fontSize: '1.3rem', marginBottom: '10px' }}>
              5. Privacidad y Protección de Datos
            </h2>
            <p style={{ marginBottom: '10px' }}>
              Recopilamos y procesamos información personal de acuerdo con nuestra Política de Privacidad. 
              Los datos recopilados incluyen:
            </p>
            <ul style={{ marginLeft: '20px', marginBottom: '10px' }}>
              <li>Nombre completo y datos de contacto (email, teléfono)</li>
              <li>Información relacionada con los turnos agendados</li>
              <li>Notas del paciente proporcionadas voluntariamente</li>
            </ul>
            <p style={{ marginBottom: '10px' }}>
              Esta información se utiliza exclusivamente para gestionar sus turnos y comunicaciones relacionadas 
              con el servicio odontológico. No compartimos su información con terceros sin su consentimiento, 
              excepto cuando sea requerido por ley.
            </p>
          </section>

          <section style={{ marginBottom: '25px' }}>
            <h2 style={{ color: '#2c3e50', fontSize: '1.3rem', marginBottom: '10px' }}>
              6. Limitación de Responsabilidad
            </h2>
            <p style={{ marginBottom: '10px' }}>
              Este sitio web funciona como una plataforma de agendamiento de turnos. La práctica odontológica 
              y sus profesionales son responsables de los servicios médicos prestados. El sitio web no se hace 
              responsable por:
            </p>
            <ul style={{ marginLeft: '20px', marginBottom: '10px' }}>
              <li>Errores en la reserva de turnos causados por información incorrecta del usuario</li>
              <li>Interrupciones del servicio debido a mantenimiento o problemas técnicos</li>
              <li>Pérdida de datos debido a problemas técnicos fuera de nuestro control</li>
            </ul>
          </section>

          <section style={{ marginBottom: '25px' }}>
            <h2 style={{ color: '#2c3e50', fontSize: '1.3rem', marginBottom: '10px' }}>
              7. Modificaciones del Servicio
            </h2>
            <p style={{ marginBottom: '10px' }}>
              Nos reservamos el derecho de modificar o discontinuar, temporal o permanentemente, el servicio 
              (o cualquier parte del mismo) con o sin previo aviso. No seremos responsables ante usted o 
              terceros por cualquier modificación, suspensión o discontinuación del servicio.
            </p>
          </section>

          <section style={{ marginBottom: '25px' }}>
            <h2 style={{ color: '#2c3e50', fontSize: '1.3rem', marginBottom: '10px' }}>
              8. Propiedad Intelectual
            </h2>
            <p style={{ marginBottom: '10px' }}>
              Todo el contenido del sitio web, incluyendo textos, gráficos, logos, imágenes y software, 
              es propiedad del consultorio odontológico y está protegido por las leyes de derechos de autor. 
              No está permitido reproducir, distribuir o modificar cualquier contenido sin autorización previa.
            </p>
          </section>

          <section style={{ marginBottom: '25px' }}>
            <h2 style={{ color: '#2c3e50', fontSize: '1.3rem', marginBottom: '10px' }}>
              9. Conducta del Usuario
            </h2>
            <p style={{ marginBottom: '10px' }}>
              Al utilizar este servicio, usted acepta no:
            </p>
            <ul style={{ marginLeft: '20px', marginBottom: '10px' }}>
              <li>Utilizar el servicio para fines ilegales o no autorizados</li>
              <li>Intentar acceder a áreas restringidas del sitio web</li>
              <li>Interferir o interrumpir el servicio o los servidores</li>
              <li>Proporcionar información falsa o engañosa</li>
              <li>Agendar turnos de manera maliciosa o sin intención de asistir</li>
            </ul>
          </section>

          <section style={{ marginBottom: '25px' }}>
            <h2 style={{ color: '#2c3e50', fontSize: '1.3rem', marginBottom: '10px' }}>
              10. Ley Aplicable
            </h2>
            <p style={{ marginBottom: '10px' }}>
              Estos términos y condiciones se rigen por las leyes de la República Argentina. Cualquier 
              disputa relacionada con estos términos será sometida a la jurisdicción exclusiva de los 
              tribunales competentes de Argentina.
            </p>
          </section>

          <section style={{ marginBottom: '25px' }}>
            <h2 style={{ color: '#2c3e50', fontSize: '1.3rem', marginBottom: '10px' }}>
              11. Contacto
            </h2>
            <p style={{ marginBottom: '10px' }}>
              Si tiene preguntas sobre estos Términos y Condiciones, puede contactarnos a través de 
              los medios de contacto disponibles en el sitio web.
            </p>
          </section>

          <section style={{ marginBottom: '25px' }}>
            <h2 style={{ color: '#2c3e50', fontSize: '1.3rem', marginBottom: '10px' }}>
              12. Cambios en los Términos
            </h2>
            <p style={{ marginBottom: '10px' }}>
              Nos reservamos el derecho de actualizar estos términos y condiciones en cualquier momento. 
              Los cambios entrarán en vigencia inmediatamente después de su publicación en el sitio web. 
              El uso continuado del servicio después de dichos cambios constituye su aceptación de los 
              nuevos términos.
            </p>
          </section>
        </div>

        <div style={{ 
          marginTop: '30px', 
          paddingTop: '20px', 
          borderTop: '2px solid #e0e0e0',
          display: 'flex',
          justifyContent: 'center'
        }}>
          <button
            onClick={() => navigate(-1)}
            className="auth-btn"
            style={{
              maxWidth: '300px',
              background: '#4a90e2'
            }}
          >
            ← Volver
          </button>
        </div>
      </div>
    </div>
  )
}

export default TermsAndConditions
