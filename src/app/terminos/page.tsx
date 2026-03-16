'use client';

import { LandingNavbar } from '@/components/layout/LandingNavbar';
import { Footer } from '@/components/landing/Footer';

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-white">
      <LandingNavbar />
      <div className="pt-24 pb-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-8">Términos de Servicio</h1>
          <p className="text-gray-500 mb-8">Última actualización: {new Date().toLocaleDateString('es-DO', { year: 'numeric', month: 'long', day: 'numeric' })}</p>

          <div className="prose prose-lg max-w-none text-gray-600">
            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">1. Aceptación de los Términos</h2>
              <p className="mb-4">
                Al acceder y utilizar CloudSuite Pro, usted acepta estar sujeto a estos Términos de Servicio y a todas las leyes y regulaciones aplicables. Si no está de acuerdo con alguno de estos términos, no debe utilizar nuestros servicios.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">2. Descripción del Servicio</h2>
              <p className="mb-4">
                CloudSuite Pro es una plataforma de gestión empresarial en la nube que ofrece soluciones para:
              </p>
              <ul className="list-disc pl-6 mb-4 space-y-2">
                <li>Punto de venta (POS)</li>
                <li>Gestión de inventario</li>
                <li>Facturación electrónica con NCF</li>
                <li>Control de clientes y proveedores</li>
                <li>Reportes y análisis de ventas</li>
                <li>Gestión contable básica</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">3. Registro y Cuenta de Usuario</h2>
              <p className="mb-4">
                Para utilizar CloudSuite Pro, debe crear una cuenta proporcionando información veraz y completa. Usted es responsable de:
              </p>
              <ul className="list-disc pl-6 mb-4 space-y-2">
                <li>Mantener la confidencialidad de su contraseña</li>
                <li>Todas las actividades que ocurran bajo su cuenta</li>
                <li>Notificar inmediatamente cualquier uso no autorizado</li>
                <li>Mantener actualizada su información de contacto</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">4. Uso Aceptable</h2>
              <p className="mb-4">
                Usted se compromete a no utilizar el servicio para:
              </p>
              <ul className="list-disc pl-6 mb-4 space-y-2">
                <li>Actividades ilegales o fraudulentas</li>
                <li>Violar derechos de propiedad intelectual</li>
                <li>Distribuir malware o código malicioso</li>
                <li>Intentar acceder a sistemas sin autorización</li>
                <li>Interferir con el funcionamiento del servicio</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">5. Facturación y Pagos</h2>
              <p className="mb-4">
                Los términos de pago varían según el plan seleccionado:
              </p>
              <ul className="list-disc pl-6 mb-4 space-y-2">
                <li>Los pagos se procesan de forma mensual o anual según su suscripción</li>
                <li>Los precios están sujetos a cambios con previo aviso de 30 días</li>
                <li>No se realizan reembolsos por períodos parciales</li>
                <li>El impago puede resultar en la suspensión del servicio</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">6. Propiedad Intelectual</h2>
              <p className="mb-4">
                CloudSuite Pro y todo su contenido, características y funcionalidad son propiedad de CloudSuite Pro y están protegidos por leyes de propiedad intelectual. Los datos que usted ingrese en el sistema permanecen siendo de su propiedad.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">7. Limitación de Responsabilidad</h2>
              <p className="mb-4">
                CloudSuite Pro no será responsable por:
              </p>
              <ul className="list-disc pl-6 mb-4 space-y-2">
                <li>Pérdidas indirectas, incidentales o consecuentes</li>
                <li>Pérdida de datos debido a fallas del usuario</li>
                <li>Interrupciones temporales del servicio por mantenimiento</li>
                <li>Decisiones comerciales basadas en los datos del sistema</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">8. Respaldo de Datos</h2>
              <p className="mb-4">
                Realizamos respaldos automáticos de sus datos. Sin embargo, recomendamos que mantenga copias de seguridad propias de información crítica. En caso de terminación del servicio, tendrá 30 días para exportar sus datos.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">9. Terminación</h2>
              <p className="mb-4">
                Podemos suspender o terminar su acceso al servicio si:
              </p>
              <ul className="list-disc pl-6 mb-4 space-y-2">
                <li>Viola estos términos de servicio</li>
                <li>No realiza los pagos correspondientes</li>
                <li>Utiliza el servicio de manera fraudulenta</li>
              </ul>
              <p className="mb-4">
                Usted puede cancelar su cuenta en cualquier momento desde la configuración de su cuenta.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">10. Modificaciones</h2>
              <p className="mb-4">
                Nos reservamos el derecho de modificar estos términos en cualquier momento. Los cambios significativos serán notificados con al menos 30 días de anticipación. El uso continuado del servicio después de los cambios constituye su aceptación de los nuevos términos.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">11. Ley Aplicable</h2>
              <p className="mb-4">
                Estos términos se regirán e interpretarán de acuerdo con las leyes de la República Dominicana, sin tener en cuenta sus disposiciones sobre conflictos de leyes.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">12. Contacto</h2>
              <p className="mb-4">
                Para cualquier pregunta sobre estos Términos de Servicio, puede contactarnos en:
              </p>
              <ul className="list-none mb-4 space-y-2">
                <li><strong>Email:</strong> cloudsuitep@gmail.com</li>
                <li><strong>Teléfono:</strong> +1 (829) 657-1774</li>
                <li><strong>Dirección:</strong> Av. Winston Churchill, Santo Domingo, RD</li>
              </ul>
            </section>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
}
