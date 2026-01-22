"use client";

import Link from "next/link";
import { ArrowLeft, Shield } from "lucide-react";

export default function PrivacyPage() {
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
              Política de Privacidad
            </h1>
            <p className="text-gray-500 dark:text-gray-400">
              Última actualización: 21 de enero de 2026
            </p>
          </div>

          <div className="prose prose-gray dark:prose-invert max-w-none">
          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">
              1. Introducción
            </h2>
            <p className="text-gray-600 dark:text-gray-300 mb-4">
              En GuardyScan, nos tomamos muy en serio la privacidad de nuestros usuarios. Esta Política de Privacidad describe cómo recopilamos, usamos, almacenamos y protegemos su información personal cuando utiliza nuestra plataforma de ciberseguridad.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">
              2. Información que Recopilamos
            </h2>
            <p className="text-gray-600 dark:text-gray-300 mb-4">
              Recopilamos los siguientes tipos de información:
            </p>
            
            <h3 className="text-xl font-medium text-gray-800 dark:text-gray-200 mb-2">
              2.1 Información de Cuenta
            </h3>
            <ul className="list-disc pl-6 text-gray-600 dark:text-gray-300 space-y-2 mb-4">
              <li>Nombre completo</li>
              <li>Dirección de correo electrónico</li>
              <li>Nombre de la empresa</li>
              <li>Información de facturación</li>
            </ul>

            <h3 className="text-xl font-medium text-gray-800 dark:text-gray-200 mb-2">
              2.2 Información Técnica
            </h3>
            <ul className="list-disc pl-6 text-gray-600 dark:text-gray-300 space-y-2 mb-4">
              <li>Direcciones IP de activos escaneados (con su autorización)</li>
              <li>Resultados de escaneos de vulnerabilidades</li>
              <li>Logs de actividad en la plataforma</li>
              <li>Información del navegador y dispositivo</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">
              3. Uso de la Información
            </h2>
            <p className="text-gray-600 dark:text-gray-300 mb-4">
              Utilizamos su información para:
            </p>
            <ul className="list-disc pl-6 text-gray-600 dark:text-gray-300 space-y-2">
              <li>Proporcionar y mejorar nuestros servicios de ciberseguridad</li>
              <li>Realizar escaneos de vulnerabilidades en sus activos autorizados</li>
              <li>Generar reportes de seguridad y cumplimiento</li>
              <li>Enviar alertas de seguridad y notificaciones importantes</li>
              <li>Procesar pagos y gestionar su suscripción</li>
              <li>Proporcionar soporte técnico</li>
              <li>Cumplir con obligaciones legales y regulatorias</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">
              4. Protección de Datos
            </h2>
            <p className="text-gray-600 dark:text-gray-300 mb-4">
              Implementamos medidas de seguridad técnicas y organizativas para proteger su información:
            </p>
            <ul className="list-disc pl-6 text-gray-600 dark:text-gray-300 space-y-2">
              <li>Encriptación de datos en tránsito (TLS 1.3) y en reposo (AES-256)</li>
              <li>Acceso restringido basado en roles</li>
              <li>Monitoreo continuo de seguridad</li>
              <li>Auditorías de seguridad regulares</li>
              <li>Backups seguros y redundantes</li>
              <li>Cumplimiento con ISO 27001</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">
              5. Compartir Información
            </h2>
            <p className="text-gray-600 dark:text-gray-300 mb-4">
              No vendemos ni compartimos su información personal con terceros, excepto en los siguientes casos:
            </p>
            <ul className="list-disc pl-6 text-gray-600 dark:text-gray-300 space-y-2">
              <li><strong>Proveedores de servicios:</strong> Stripe para procesamiento de pagos</li>
              <li><strong>Obligaciones legales:</strong> Cuando sea requerido por ley o autoridad competente</li>
              <li><strong>Protección de derechos:</strong> Para proteger nuestros derechos, privacidad, seguridad o propiedad</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">
              6. Retención de Datos
            </h2>
            <p className="text-gray-600 dark:text-gray-300 mb-4">
              Retenemos su información personal mientras su cuenta esté activa o según sea necesario para proporcionarle servicios. Los datos de escaneos se retienen por el período especificado en su plan de suscripción. Puede solicitar la eliminación de sus datos contactándonos.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">
              7. Sus Derechos
            </h2>
            <p className="text-gray-600 dark:text-gray-300 mb-4">
              Usted tiene derecho a:
            </p>
            <ul className="list-disc pl-6 text-gray-600 dark:text-gray-300 space-y-2">
              <li><strong>Acceso:</strong> Solicitar una copia de sus datos personales</li>
              <li><strong>Rectificación:</strong> Corregir datos inexactos o incompletos</li>
              <li><strong>Eliminación:</strong> Solicitar la eliminación de sus datos</li>
              <li><strong>Portabilidad:</strong> Recibir sus datos en formato estructurado</li>
              <li><strong>Oposición:</strong> Oponerse al procesamiento de sus datos</li>
              <li><strong>Limitación:</strong> Solicitar la limitación del procesamiento</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">
              8. Cookies y Tecnologías Similares
            </h2>
            <p className="text-gray-600 dark:text-gray-300 mb-4">
              Utilizamos cookies y tecnologías similares para:
            </p>
            <ul className="list-disc pl-6 text-gray-600 dark:text-gray-300 space-y-2">
              <li>Mantener su sesión activa</li>
              <li>Recordar sus preferencias</li>
              <li>Analizar el uso de la plataforma</li>
              <li>Mejorar la seguridad</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">
              9. Transferencias Internacionales
            </h2>
            <p className="text-gray-600 dark:text-gray-300 mb-4">
              Sus datos pueden ser procesados en servidores ubicados fuera de su país de residencia. Nos aseguramos de que cualquier transferencia internacional cumpla con las leyes de protección de datos aplicables.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">
              10. Cambios a esta Política
            </h2>
            <p className="text-gray-600 dark:text-gray-300 mb-4">
              Podemos actualizar esta Política de Privacidad ocasionalmente. Le notificaremos sobre cambios significativos por correo electrónico o mediante un aviso destacado en nuestra plataforma.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">
              11. Contacto
            </h2>
            <p className="text-gray-600 dark:text-gray-300 mb-4">
              Si tiene preguntas sobre esta Política de Privacidad o desea ejercer sus derechos, puede contactarnos en:
            </p>
            <ul className="list-none text-gray-600 dark:text-gray-300 space-y-2">
              <li><strong>Email:</strong> privacy@guardyscan.com</li>
              <li><strong>Oficial de Protección de Datos:</strong> dpo@guardyscan.com</li>
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
