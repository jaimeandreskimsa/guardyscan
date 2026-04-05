"use client";

import Link from "next/link";
import { ArrowLeft, Shield } from "lucide-react";

export default function CookiesPage() {
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
              Política de Cookies
            </h1>
            <p className="text-gray-500 dark:text-gray-400">
              Última actualización: 5 de abril de 2026
            </p>
          </div>

          <div className="prose prose-gray dark:prose-invert max-w-none">

            {/* 1 */}
            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">
                1. ¿Qué son las Cookies?
              </h2>
              <p className="text-gray-600 dark:text-gray-300 mb-4">
                Las cookies son pequeños archivos de texto que un sitio web almacena en su navegador o dispositivo cuando usted lo visita. Se utilizan ampliamente para hacer que los sitios web funcionen correctamente, de manera más eficiente, y para proporcionar información a los operadores del sitio.
              </p>
              <p className="text-gray-600 dark:text-gray-300 mb-4">
                Además de cookies propiamente dichas, GuardyScan puede utilizar tecnologías similares como el almacenamiento local del navegador (<em>localStorage</em>) para guardar preferencias de sesión.
              </p>
            </section>

            {/* 2 */}
            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">
                2. Cookies que Utilizamos
              </h2>
              <p className="text-gray-600 dark:text-gray-300 mb-4">
                GuardyScan utiliza exclusivamente cookies necesarias para el funcionamiento de la plataforma. No utilizamos cookies de seguimiento publicitario ni compartimos datos de cookies con redes de publicidad.
              </p>

              <h3 className="text-xl font-medium text-gray-800 dark:text-gray-200 mb-3">2.1 Cookies Estrictamente Necesarias</h3>
              <p className="text-gray-600 dark:text-gray-300 mb-4">
                Estas cookies son indispensables para que la plataforma funcione correctamente. Sin ellas, no podrá iniciar sesión ni navegar de forma segura por la plataforma. <strong>No requieren su consentimiento</strong> al ser técnicamente esenciales.
              </p>
              <div className="overflow-x-auto mb-6">
                <table className="w-full text-sm text-gray-600 dark:text-gray-300 border border-gray-200 dark:border-gray-600 rounded-lg">
                  <thead className="bg-gray-50 dark:bg-gray-700">
                    <tr>
                      <th className="p-3 text-left font-semibold">Nombre</th>
                      <th className="p-3 text-left font-semibold">Proveedor</th>
                      <th className="p-3 text-left font-semibold">Finalidad</th>
                      <th className="p-3 text-left font-semibold">Duración</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr className="border-t border-gray-200 dark:border-gray-600">
                      <td className="p-3 font-mono text-xs">next-auth.session-token</td>
                      <td className="p-3">GuardyScan</td>
                      <td className="p-3">Gestión de sesión autenticada del usuario (JWT). Mantiene la sesión activa tras el inicio de sesión.</td>
                      <td className="p-3">Sesión / 30 días</td>
                    </tr>
                    <tr className="border-t border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-700/50">
                      <td className="p-3 font-mono text-xs">next-auth.csrf-token</td>
                      <td className="p-3">GuardyScan</td>
                      <td className="p-3">Token de seguridad CSRF para proteger formularios contra ataques de falsificación de solicitudes entre sitios.</td>
                      <td className="p-3">Sesión</td>
                    </tr>
                    <tr className="border-t border-gray-200 dark:border-gray-600">
                      <td className="p-3 font-mono text-xs">next-auth.callback-url</td>
                      <td className="p-3">GuardyScan</td>
                      <td className="p-3">Almacena la URL de redirección tras completar el flujo de autenticación.</td>
                      <td className="p-3">Sesión</td>
                    </tr>
                    <tr className="border-t border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-700/50">
                      <td className="p-3 font-mono text-xs">__Secure-next-auth.session-token</td>
                      <td className="p-3">GuardyScan</td>
                      <td className="p-3">Versión segura (HTTPS) del token de sesión. Usada en producción con flag Secure.</td>
                      <td className="p-3">30 días</td>
                    </tr>
                    <tr className="border-t border-gray-200 dark:border-gray-600">
                      <td className="p-3 font-mono text-xs">__Host-next-auth.csrf-token</td>
                      <td className="p-3">GuardyScan</td>
                      <td className="p-3">Versión segura del token CSRF con flag __Host para mayor seguridad.</td>
                      <td className="p-3">Sesión</td>
                    </tr>
                  </tbody>
                </table>
              </div>

              <h3 className="text-xl font-medium text-gray-800 dark:text-gray-200 mb-3">2.2 Cookies de Terceros — Stripe (Pagos)</h3>
              <p className="text-gray-600 dark:text-gray-300 mb-4">
                Al acceder a funcionalidades de pago o al portal de facturación, Stripe puede establecer cookies en su navegador para gestionar el proceso de pago de forma segura. GuardyScan no controla estas cookies; su uso está sujeto a la{" "}
                <a href="https://stripe.com/es/privacy" target="_blank" rel="noopener noreferrer" className="text-blue-600 dark:text-blue-400 hover:underline">
                  Política de Privacidad de Stripe
                </a>.
              </p>
              <div className="overflow-x-auto mb-6">
                <table className="w-full text-sm text-gray-600 dark:text-gray-300 border border-gray-200 dark:border-gray-600 rounded-lg">
                  <thead className="bg-gray-50 dark:bg-gray-700">
                    <tr>
                      <th className="p-3 text-left font-semibold">Nombre</th>
                      <th className="p-3 text-left font-semibold">Proveedor</th>
                      <th className="p-3 text-left font-semibold">Finalidad</th>
                      <th className="p-3 text-left font-semibold">Duración</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr className="border-t border-gray-200 dark:border-gray-600">
                      <td className="p-3 font-mono text-xs">__stripe_mid</td>
                      <td className="p-3">Stripe</td>
                      <td className="p-3">Identificador de máquina para detección de fraude en pagos.</td>
                      <td className="p-3">1 año</td>
                    </tr>
                    <tr className="border-t border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-700/50">
                      <td className="p-3 font-mono text-xs">__stripe_sid</td>
                      <td className="p-3">Stripe</td>
                      <td className="p-3">Identificador de sesión para el proceso de pago seguro.</td>
                      <td className="p-3">30 minutos</td>
                    </tr>
                  </tbody>
                </table>
              </div>

              <h3 className="text-xl font-medium text-gray-800 dark:text-gray-200 mb-3">2.3 Almacenamiento Local (localStorage)</h3>
              <p className="text-gray-600 dark:text-gray-300 mb-4">
                GuardyScan puede utilizar el almacenamiento local del navegador (<em>localStorage</em>) para guardar preferencias de interfaz de usuario, como el modo oscuro/claro o configuraciones de visualización de datos. Esta información no se transmite a servidores externos y permanece únicamente en su dispositivo.
              </p>
            </section>

            {/* 3 */}
            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">
                3. Cookies que NO Utilizamos
              </h2>
              <p className="text-gray-600 dark:text-gray-300 mb-4">
                GuardyScan <strong>no utiliza</strong> las siguientes categorías de cookies:
              </p>
              <ul className="list-disc pl-6 text-gray-600 dark:text-gray-300 space-y-2 mb-4">
                <li><strong>Cookies de publicidad o retargeting:</strong> No mostramos anuncios ni rastreamos al usuario para publicidad dirigida</li>
                <li><strong>Cookies de análisis de comportamiento de terceros:</strong> No integramos Google Analytics, Hotjar, Mixpanel ni herramientas similares</li>
                <li><strong>Cookies de redes sociales:</strong> No integramos botones de compartir en redes sociales que generen cookies de seguimiento</li>
                <li><strong>Cookies de perfiles de usuario con fines comerciales de terceros:</strong> No compartimos datos de comportamiento con anunciantes</li>
              </ul>
            </section>

            {/* 4 */}
            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">
                4. Base Legal para el Uso de Cookies
              </h2>
              <p className="text-gray-600 dark:text-gray-300 mb-4">
                El uso de cookies estrictamente necesarias se basa en el <strong>interés legítimo</strong> de GuardyScan y en la <strong>necesidad técnica</strong> para prestar el servicio contratado. Sin estas cookies, la plataforma no puede funcionar correctamente y no es posible prestar el servicio.
              </p>
              <p className="text-gray-600 dark:text-gray-300 mb-4">
                Dado que únicamente utilizamos cookies técnicas esenciales, no requerimos su consentimiento explícito para instalarlas. Si usted desactiva estas cookies mediante la configuración de su navegador, es posible que no pueda acceder o utilizar correctamente la plataforma.
              </p>
            </section>

            {/* 5 */}
            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">
                5. Cómo Gestionar y Eliminar Cookies
              </h2>
              <p className="text-gray-600 dark:text-gray-300 mb-4">
                Usted puede gestionar, bloquear o eliminar cookies desde la configuración de su navegador. A continuación encontrará enlaces a las instrucciones de los navegadores más comunes:
              </p>
              <ul className="list-disc pl-6 text-gray-600 dark:text-gray-300 space-y-2 mb-4">
                <li>
                  <strong>Google Chrome:</strong> Configuración → Privacidad y seguridad → Cookies y otros datos de sitios
                </li>
                <li>
                  <strong>Mozilla Firefox:</strong> Opciones → Privacidad y seguridad → Cookies y datos del sitio
                </li>
                <li>
                  <strong>Safari:</strong> Preferencias → Privacidad → Gestionar datos de sitios web
                </li>
                <li>
                  <strong>Microsoft Edge:</strong> Configuración → Cookies y permisos del sitio → Administrar y eliminar cookies
                </li>
              </ul>
              <div className="p-4 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg mb-4">
                <p className="text-amber-800 dark:text-amber-300 text-sm">
                  <strong>Advertencia:</strong> Si bloquea o elimina las cookies de sesión de GuardyScan (next-auth.session-token), su sesión se cerrará automáticamente y deberá volver a iniciar sesión. La desactivación de cookies estrictamente necesarias puede impedir el uso correcto de la plataforma.
                </p>
              </div>
            </section>

            {/* 6 */}
            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">
                6. Seguridad de las Cookies
              </h2>
              <p className="text-gray-600 dark:text-gray-300 mb-4">
                Las cookies de sesión de GuardyScan están configuradas con las siguientes medidas de seguridad:
              </p>
              <ul className="list-disc pl-6 text-gray-600 dark:text-gray-300 space-y-2 mb-4">
                <li><strong>HttpOnly:</strong> Las cookies de sesión no son accesibles mediante JavaScript del lado del cliente, protegiéndolas contra ataques XSS (Cross-Site Scripting)</li>
                <li><strong>Secure:</strong> Las cookies solo se transmiten a través de conexiones HTTPS cifradas, nunca por HTTP</li>
                <li><strong>SameSite=Lax/Strict:</strong> Protección contra ataques CSRF (Cross-Site Request Forgery)</li>
                <li><strong>Expiración automática:</strong> Las cookies de sesión expiran al cerrar el navegador o tras el período establecido, reduciendo el riesgo de accesos no autorizados</li>
              </ul>
            </section>

            {/* 7 */}
            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">
                7. Exención de Responsabilidad — Cookies de Terceros
              </h2>
              <p className="text-gray-600 dark:text-gray-300 mb-4">
                GuardyScan no controla las cookies establecidas por proveedores de servicios de terceros (como Stripe). Estas cookies están sujetas a las políticas de privacidad de sus respectivos proveedores. GuardyScan no asume responsabilidad alguna por el uso que dichos terceros hagan de las cookies que instalen en el dispositivo del Usuario. Le recomendamos revisar las políticas de privacidad de cada proveedor.
              </p>
            </section>

            {/* 8 */}
            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">
                8. Modificaciones de esta Política
              </h2>
              <p className="text-gray-600 dark:text-gray-300 mb-4">
                GuardyScan se reserva el derecho de actualizar esta Política de Cookies en cualquier momento. Ante cambios sustanciales, se notificará al Usuario mediante aviso en la plataforma o por correo electrónico. El uso continuado de la plataforma tras la publicación de los cambios implicará su aceptación.
              </p>
            </section>

            {/* 9 */}
            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">
                9. Contacto
              </h2>
              <p className="text-gray-600 dark:text-gray-300 mb-4">
                Para cualquier consulta sobre esta Política de Cookies o sobre el uso de cookies en la plataforma GuardyScan:
              </p>
              <ul className="list-none text-gray-600 dark:text-gray-300 space-y-2">
                <li><strong>Email:</strong> privacy@guardyscan.com</li>
                <li><strong>Oficial de Protección de Datos:</strong> dpo@guardyscan.com</li>
                <li><strong>Dirección:</strong> Santiago, Chile</li>
              </ul>
            </section>

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
              Términos y Condiciones
            </Link>
            <Link href="/cookies" className="hover:text-gray-900 dark:hover:text-white">
              Política de Cookies
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
