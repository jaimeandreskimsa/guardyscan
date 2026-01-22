"use client";

import Link from "next/link";
import { ArrowLeft, Shield } from "lucide-react";

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
      {/* Header */}
      <header className="bg-white bg-opacity-80 dark:bg-gray-800 dark:bg-opacity-80 backdrop-blur-sm border-b border-gray-200 dark:border-gray-700 sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <Link href="/" className="flex items-center gap-3 hover:opacity-80 transition-opacity">
              <Shield className="h-8 w-8 text-blue-600" />
              <span className="text-xl font-bold text-gray-900 dark:text-white">GuardyScan</span>
            </Link>
            <Link href="/" className="inline-flex items-center gap-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors">
              <ArrowLeft className="h-4 w-4" />
              Volver
            </Link>
          </div>
        </div>
      </header>

      {/* Content */}
      <main className="max-w-4xl mx-auto px-4 py-12">
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8 md:p-12">
          <div className="mb-8">
            <h1 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-4">
              Términos de Servicio
            </h1>
            <p className="text-gray-500 dark:text-gray-400">
              Última actualización: 21 de enero de 2026
            </p>
          </div>

          <div className="prose prose-gray dark:prose-invert max-w-none">
          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">
              1. Aceptación de los Términos
            </h2>
            <p className="text-gray-600 dark:text-gray-300 mb-4">
              Al acceder y utilizar la plataforma GuardyScan, usted acepta estar sujeto a estos Términos de Servicio y a todas las leyes y regulaciones aplicables. Si no está de acuerdo con alguno de estos términos, no debe utilizar nuestros servicios.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">
              2. Descripción del Servicio
            </h2>
            <p className="text-gray-600 dark:text-gray-300 mb-4">
              GuardyScan proporciona una plataforma de ciberseguridad que incluye:
            </p>
            <ul className="list-disc pl-6 text-gray-600 dark:text-gray-300 space-y-2">
              <li>Escaneo de vulnerabilidades en activos digitales</li>
              <li>Monitoreo continuo de seguridad 24/7</li>
              <li>Integración con sistemas SIEM</li>
              <li>Gestión de incidentes de seguridad</li>
              <li>Cumplimiento normativo (ISO 27001, Ley 21.663)</li>
              <li>Gestión de riesgos y continuidad de negocio</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">
              3. Registro y Cuenta de Usuario
            </h2>
            <p className="text-gray-600 dark:text-gray-300 mb-4">
              Para utilizar nuestros servicios, debe crear una cuenta proporcionando información precisa y completa. Usted es responsable de:
            </p>
            <ul className="list-disc pl-6 text-gray-600 dark:text-gray-300 space-y-2">
              <li>Mantener la confidencialidad de sus credenciales de acceso</li>
              <li>Todas las actividades realizadas bajo su cuenta</li>
              <li>Notificar inmediatamente cualquier uso no autorizado de su cuenta</li>
              <li>Mantener actualizada su información de contacto</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">
              4. Planes y Pagos
            </h2>
            <p className="text-gray-600 dark:text-gray-300 mb-4">
              GuardyScan ofrece diferentes planes de suscripción. Al suscribirse a un plan de pago:
            </p>
            <ul className="list-disc pl-6 text-gray-600 dark:text-gray-300 space-y-2">
              <li>Los pagos se procesan de forma segura a través de Stripe</li>
              <li>Las suscripciones se renuevan automáticamente según el período seleccionado</li>
              <li>Puede cancelar su suscripción en cualquier momento desde el panel de facturación</li>
              <li>No se realizan reembolsos por períodos parciales no utilizados</li>
              <li>Los precios pueden estar sujetos a cambios con previo aviso de 30 días</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">
              5. Uso Aceptable
            </h2>
            <p className="text-gray-600 dark:text-gray-300 mb-4">
              Al utilizar GuardyScan, usted acepta no:
            </p>
            <ul className="list-disc pl-6 text-gray-600 dark:text-gray-300 space-y-2">
              <li>Utilizar el servicio para actividades ilegales o no autorizadas</li>
              <li>Escanear activos o sistemas sin la debida autorización</li>
              <li>Intentar acceder a sistemas o datos de otros usuarios</li>
              <li>Compartir sus credenciales de acceso con terceros</li>
              <li>Realizar ingeniería inversa o intentar extraer el código fuente</li>
              <li>Sobrecargar intencionalmente nuestros sistemas</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">
              6. Propiedad Intelectual
            </h2>
            <p className="text-gray-600 dark:text-gray-300 mb-4">
              Todos los derechos de propiedad intelectual relacionados con GuardyScan, incluyendo pero no limitado a software, diseños, logos, y documentación, son propiedad exclusiva de GuardyScan o sus licenciantes.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">
              7. Limitación de Responsabilidad
            </h2>
            <p className="text-gray-600 dark:text-gray-300 mb-4">
              GuardyScan proporciona sus servicios &quot;tal cual&quot; y no garantiza que el servicio será ininterrumpido o libre de errores. En ningún caso GuardyScan será responsable por daños indirectos, incidentales, especiales o consecuentes que resulten del uso o la imposibilidad de uso del servicio.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">
              8. Confidencialidad y Seguridad de Datos
            </h2>
            <p className="text-gray-600 dark:text-gray-300 mb-4">
              Nos comprometemos a proteger la confidencialidad de sus datos. Toda la información recopilada durante los escaneos se maneja de acuerdo con nuestra Política de Privacidad y las mejores prácticas de seguridad de la industria.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">
              9. Modificaciones del Servicio
            </h2>
            <p className="text-gray-600 dark:text-gray-300 mb-4">
              GuardyScan se reserva el derecho de modificar, suspender o discontinuar cualquier aspecto del servicio en cualquier momento, con o sin previo aviso.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">
              10. Ley Aplicable
            </h2>
            <p className="text-gray-600 dark:text-gray-300 mb-4">
              Estos términos se regirán e interpretarán de acuerdo con las leyes de la República de Chile, sin dar efecto a ningún principio de conflicto de leyes.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">
              11. Contacto
            </h2>
            <p className="text-gray-600 dark:text-gray-300 mb-4">
              Si tiene preguntas sobre estos Términos de Servicio, puede contactarnos en:
            </p>
            <ul className="list-none text-gray-600 dark:text-gray-300 space-y-2">
              <li><strong>Email:</strong> legal@guardyscan.com</li>
              <li><strong>Dirección:</strong> Santiago, Chile</li>
            </ul>
          </section>
        </div>
      </main>

          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-white bg-opacity-50 dark:bg-gray-800 dark:bg-opacity-50 backdrop-blur-sm border-t border-gray-200 dark:border-gray-700 py-8 mt-12">
        <div className="max-w-4xl mx-auto px-4 text-center text-gray-500 dark:text-gray-400 text-sm">
          <p>© 2026 GuardyScan. Todos los derechos reservados.</p>
          <div className="mt-2 space-x-4">
            <Link href="/privacy" className="hover:text-gray-900 dark:hover:text-white">
              Política de Privacidad
            </Link>
            <Link href="/terms" className="hover:text-gray-900 dark:hover:text-white">
              Términos de Servicio
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
