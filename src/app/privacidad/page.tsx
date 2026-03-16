'use client';

import { LandingNavbar } from '@/components/layout/LandingNavbar';
import { Footer } from '@/components/landing/Footer';

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-white">
      <LandingNavbar />
      <div className="pt-24 pb-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-8">Política de Privacidad</h1>
          <p className="text-gray-500 mb-8">Última actualización: {new Date().toLocaleDateString('es-DO', { year: 'numeric', month: 'long', day: 'numeric' })}</p>

          <div className="prose prose-lg max-w-none text-gray-600">
            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">1. Introducción</h2>
              <p className="mb-4">
                En CloudSuite Pro, nos comprometemos a proteger su privacidad. Esta Política de Privacidad explica cómo recopilamos, usamos, divulgamos y protegemos su información cuando utiliza nuestra plataforma de gestión empresarial.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">2. Información que Recopilamos</h2>

              <h3 className="text-xl font-medium text-gray-800 mb-3">2.1 Información proporcionada directamente</h3>
              <ul className="list-disc pl-6 mb-4 space-y-2">
                <li>Nombre y datos de contacto (email, teléfono, dirección)</li>
                <li>Información de la empresa (RNC, nombre comercial, dirección)</li>
                <li>Credenciales de acceso (nombre de usuario, contraseña cifrada)</li>
                <li>Información de facturación y pago</li>
                <li>Datos de clientes y proveedores que usted ingrese</li>
                <li>Información de productos e inventario</li>
                <li>Registros de transacciones y ventas</li>
              </ul>

              <h3 className="text-xl font-medium text-gray-800 mb-3">2.2 Información recopilada automáticamente</h3>
              <ul className="list-disc pl-6 mb-4 space-y-2">
                <li>Dirección IP y ubicación aproximada</li>
                <li>Tipo de navegador y dispositivo</li>
                <li>Páginas visitadas y tiempo de uso</li>
                <li>Datos de rendimiento y errores del sistema</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">3. Uso de la Información</h2>
              <p className="mb-4">Utilizamos su información para:</p>
              <ul className="list-disc pl-6 mb-4 space-y-2">
                <li>Proporcionar y mantener nuestros servicios</li>
                <li>Procesar transacciones y enviar notificaciones relacionadas</li>
                <li>Generar comprobantes fiscales (NCF) según la normativa de la DGII</li>
                <li>Mejorar y personalizar la experiencia del usuario</li>
                <li>Enviar actualizaciones, alertas de seguridad y soporte</li>
                <li>Analizar el uso para mejorar nuestros servicios</li>
                <li>Cumplir con obligaciones legales y regulatorias</li>
                <li>Prevenir fraudes y actividades no autorizadas</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">4. Compartir Información</h2>
              <p className="mb-4">No vendemos su información personal. Podemos compartir datos con:</p>
              <ul className="list-disc pl-6 mb-4 space-y-2">
                <li><strong>Proveedores de servicios:</strong> Empresas que nos ayudan a operar (hosting, procesamiento de pagos, envío de emails)</li>
                <li><strong>Autoridades fiscales:</strong> Información requerida por la DGII para cumplimiento tributario</li>
                <li><strong>Por requerimiento legal:</strong> Cuando sea necesario por ley, proceso legal o solicitud gubernamental</li>
                <li><strong>Protección de derechos:</strong> Para proteger los derechos, privacidad, seguridad o propiedad</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">5. Seguridad de los Datos</h2>
              <p className="mb-4">Implementamos medidas de seguridad incluyendo:</p>
              <ul className="list-disc pl-6 mb-4 space-y-2">
                <li>Cifrado SSL/TLS para todas las comunicaciones</li>
                <li>Cifrado de contraseñas y datos sensibles</li>
                <li>Acceso restringido a datos personales</li>
                <li>Monitoreo continuo de seguridad</li>
                <li>Respaldos automáticos y redundancia de datos</li>
                <li>Autenticación de dos factores (opcional)</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">6. Retención de Datos</h2>
              <p className="mb-4">
                Conservamos su información mientras su cuenta esté activa o según sea necesario para proporcionar servicios. Los datos fiscales y contables se conservan por el período requerido por ley (mínimo 10 años según la legislación dominicana).
              </p>
              <p className="mb-4">
                Después de cancelar su cuenta, mantendremos ciertos datos por un período adicional para cumplir con obligaciones legales y resolver disputas.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">7. Sus Derechos</h2>
              <p className="mb-4">Usted tiene derecho a:</p>
              <ul className="list-disc pl-6 mb-4 space-y-2">
                <li><strong>Acceso:</strong> Solicitar una copia de sus datos personales</li>
                <li><strong>Rectificación:</strong> Corregir datos inexactos o incompletos</li>
                <li><strong>Eliminación:</strong> Solicitar la eliminación de sus datos (sujeto a requisitos legales)</li>
                <li><strong>Portabilidad:</strong> Exportar sus datos en formato estándar</li>
                <li><strong>Oposición:</strong> Oponerse al procesamiento de sus datos para ciertos fines</li>
                <li><strong>Limitación:</strong> Solicitar la limitación del procesamiento</li>
              </ul>
              <p className="mb-4">
                Para ejercer estos derechos, contacte a cloudsuitep@gmail.com
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">8. Cookies y Tecnologías Similares</h2>
              <p className="mb-4">Utilizamos cookies para:</p>
              <ul className="list-disc pl-6 mb-4 space-y-2">
                <li>Mantener su sesión iniciada</li>
                <li>Recordar sus preferencias</li>
                <li>Analizar el uso de la plataforma</li>
                <li>Mejorar el rendimiento y la seguridad</li>
              </ul>
              <p className="mb-4">
                Puede configurar su navegador para rechazar cookies, aunque esto puede afectar la funcionalidad del servicio.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">9. Transferencias Internacionales</h2>
              <p className="mb-4">
                Sus datos pueden ser procesados en servidores ubicados fuera de la República Dominicana. Nos aseguramos de que cualquier transferencia internacional cumpla con las leyes de protección de datos aplicables y se realice con las garantías adecuadas.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">10. Menores de Edad</h2>
              <p className="mb-4">
                CloudSuite Pro no está dirigido a menores de 18 años. No recopilamos conscientemente información de menores. Si descubrimos que hemos recopilado datos de un menor, los eliminaremos inmediatamente.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">11. Cambios a esta Política</h2>
              <p className="mb-4">
                Podemos actualizar esta política periódicamente. Le notificaremos sobre cambios significativos mediante un aviso en nuestra plataforma o por correo electrónico. Le recomendamos revisar esta política regularmente.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">12. Contacto</h2>
              <p className="mb-4">
                Para preguntas o inquietudes sobre esta Política de Privacidad:
              </p>
              <ul className="list-none mb-4 space-y-2">
                <li><strong>Email:</strong> cloudsuitep@gmail.com</li>
                <li><strong>Teléfono:</strong> +1 (809) 555-0100</li>
                <li><strong>Dirección:</strong> Av. Winston Churchill, Santo Domingo, RD</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">13. Autoridad de Control</h2>
              <p className="mb-4">
                Si considera que el tratamiento de sus datos personales infringe la normativa vigente, tiene derecho a presentar una reclamación ante la autoridad de protección de datos competente.
              </p>
            </section>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
}
