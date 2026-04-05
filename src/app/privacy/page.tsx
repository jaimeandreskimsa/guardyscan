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
              Política de Seguridad y Privacidad de Datos
            </h1>
            <p className="text-gray-500 dark:text-gray-400">
              Última actualización: 5 de abril de 2026
            </p>
          </div>

          <div className="prose prose-gray dark:prose-invert max-w-none">

            {/* 1 */}
            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">
                1. Introducción e Identificación del Responsable
              </h2>
              <p className="text-gray-600 dark:text-gray-300 mb-4">
                GuardyScan (en adelante, &quot;GuardyScan&quot;, &quot;nosotros&quot; o &quot;la Empresa&quot;) opera desde la República de Chile y actúa como responsable del tratamiento de los datos personales recabados a través de su plataforma de ciberseguridad.
              </p>
              <p className="text-gray-600 dark:text-gray-300 mb-4">
                Esta Política de Seguridad y Privacidad de Datos (en adelante, &quot;la Política&quot;) describe de manera transparente cómo recopilamos, utilizamos, almacenamos, protegemos y transferimos la información personal y empresarial de nuestros usuarios. Está redactada en cumplimiento de la <strong>Ley N° 19.628 sobre Protección de la Vida Privada</strong> de Chile, la <strong>Ley N° 21.663</strong> y, en la medida aplicable, el <strong>Reglamento General de Protección de Datos (GDPR)</strong> de la Unión Europea.
              </p>
              <ul className="list-none text-gray-600 dark:text-gray-300 space-y-2">
                <li><strong>Oficial de Protección de Datos (DPO):</strong> dpo@guardyscan.com</li>
                <li><strong>Contacto de privacidad:</strong> privacy@guardyscan.com</li>
                <li><strong>Dirección:</strong> Santiago, Chile</li>
              </ul>
            </section>

            {/* 2 */}
            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">
                2. Información que Recopilamos
              </h2>

              <h3 className="text-xl font-medium text-gray-800 dark:text-gray-200 mb-2">
                2.1 Datos de Cuenta e Identificación
              </h3>
              <ul className="list-disc pl-6 text-gray-600 dark:text-gray-300 space-y-2 mb-4">
                <li>Nombre completo y dirección de correo electrónico</li>
                <li>Contraseña (almacenada en formato hash bcrypt, nunca en texto plano)</li>
                <li>Imagen de perfil (opcional)</li>
                <li>Datos de la empresa: nombre, sitio web, industria y tamaño</li>
                <li>Información de facturación (gestionada directamente por Stripe)</li>
              </ul>

              <h3 className="text-xl font-medium text-gray-800 dark:text-gray-200 mb-2">
                2.2 Datos Técnicos de Uso y Escaneo
              </h3>
              <ul className="list-disc pl-6 text-gray-600 dark:text-gray-300 space-y-2 mb-4">
                <li>Dominios, URLs y direcciones IP de activos escaneados (ingresados por el Usuario)</li>
                <li>Resultados de análisis de vulnerabilidades, SSL/TLS, encabezados de seguridad, DNS, tecnologías detectadas y puertos abiertos</li>
                <li>Registros de actividad en la plataforma (logs de sesión, acciones realizadas)</li>
                <li>Información del navegador y dispositivo (user agent, idioma, resolución)</li>
                <li>Dirección IP de acceso del Usuario</li>
              </ul>

              <h3 className="text-xl font-medium text-gray-800 dark:text-gray-200 mb-2">
                2.3 Datos de Seguridad y Cumplimiento
              </h3>
              <ul className="list-disc pl-6 text-gray-600 dark:text-gray-300 space-y-2 mb-4">
                <li>Incidentes de seguridad registrados por el Usuario</li>
                <li>Evaluaciones de riesgo y análisis de impacto de negocio</li>
                <li>Evidencias y controles de cumplimiento normativo</li>
                <li>Datos de eventos SIEM (patrones de comportamiento de usuarios del sistema)</li>
                <li>Información de miembros de comités y sesiones</li>
                <li>Planes de continuidad de negocio y recuperación</li>
                <li>Evaluaciones de riesgo de terceros</li>
              </ul>

              <h3 className="text-xl font-medium text-gray-800 dark:text-gray-200 mb-2">
                2.4 Datos de Pago y Suscripción
              </h3>
              <p className="text-gray-600 dark:text-gray-300 mb-4">
                Los datos de pago (número de tarjeta, CVV, etc.) son procesados y almacenados directamente por <strong>Stripe</strong>, nuestro procesador de pagos certificado PCI-DSS Nivel 1. GuardyScan únicamente almacena identificadores de suscripción, el plan activo, el estado de la suscripción y el historial de compras de reportes PDF.
              </p>

              <h3 className="text-xl font-medium text-gray-800 dark:text-gray-200 mb-2">
                2.5 Datos de Inteligencia Artificial
              </h3>
              <p className="text-gray-600 dark:text-gray-300 mb-4">
                Cuando el Usuario utiliza funcionalidades de diagnóstico asistido por IA, cierta información contextual (datos de vulnerabilidades, configuraciones detectadas, métricas de riesgo) puede ser transmitida a los servidores de <strong>Anthropic (Claude AI)</strong> para generar recomendaciones. Dichas transmisiones se realizan bajo los términos de uso y política de privacidad de Anthropic. GuardyScan almacena los resultados de los diagnósticos de IA en su base de datos. No se transmite información de identificación personal (nombres, emails) a los modelos de IA.
              </p>
            </section>

            {/* 3 */}
            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">
                3. Finalidad y Base Legal del Tratamiento
              </h2>
              <p className="text-gray-600 dark:text-gray-300 mb-4">
                Tratamos sus datos con las siguientes finalidades y bases legales:
              </p>
              <div className="overflow-x-auto mb-4">
                <table className="w-full text-sm text-gray-600 dark:text-gray-300 border border-gray-200 dark:border-gray-600 rounded-lg">
                  <thead className="bg-gray-50 dark:bg-gray-700">
                    <tr>
                      <th className="p-3 text-left font-semibold">Finalidad</th>
                      <th className="p-3 text-left font-semibold">Base Legal</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr className="border-t border-gray-200 dark:border-gray-600">
                      <td className="p-3">Prestación del servicio contratado</td>
                      <td className="p-3">Ejecución de contrato</td>
                    </tr>
                    <tr className="border-t border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-700/50">
                      <td className="p-3">Procesamiento de pagos y gestión de suscripciones</td>
                      <td className="p-3">Ejecución de contrato</td>
                    </tr>
                    <tr className="border-t border-gray-200 dark:border-gray-600">
                      <td className="p-3">Envío de alertas de seguridad y notificaciones</td>
                      <td className="p-3">Ejecución de contrato / interés legítimo</td>
                    </tr>
                    <tr className="border-t border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-700/50">
                      <td className="p-3">Generación de reportes y análisis</td>
                      <td className="p-3">Ejecución de contrato</td>
                    </tr>
                    <tr className="border-t border-gray-200 dark:border-gray-600">
                      <td className="p-3">Soporte técnico al Usuario</td>
                      <td className="p-3">Ejecución de contrato / interés legítimo</td>
                    </tr>
                    <tr className="border-t border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-700/50">
                      <td className="p-3">Cumplimiento de obligaciones legales y regulatorias</td>
                      <td className="p-3">Obligación legal</td>
                    </tr>
                    <tr className="border-t border-gray-200 dark:border-gray-600">
                      <td className="p-3">Mejora de la plataforma (datos anonimizados)</td>
                      <td className="p-3">Interés legítimo</td>
                    </tr>
                    <tr className="border-t border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-700/50">
                      <td className="p-3">Detección y prevención de fraude y abusos</td>
                      <td className="p-3">Interés legítimo / obligación legal</td>
                    </tr>
                    <tr className="border-t border-gray-200 dark:border-gray-600">
                      <td className="p-3">Comunicaciones de marketing (solo con consentimiento)</td>
                      <td className="p-3">Consentimiento</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </section>

            {/* 4 */}
            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">
                4. Seguridad Técnica y Organizativa de los Datos
              </h2>
              <p className="text-gray-600 dark:text-gray-300 mb-4">
                GuardyScan implementa medidas de seguridad técnicas y organizativas conforme a los estándares de la industria:
              </p>

              <h3 className="text-xl font-medium text-gray-800 dark:text-gray-200 mb-2">4.1 Medidas Técnicas</h3>
              <ul className="list-disc pl-6 text-gray-600 dark:text-gray-300 space-y-2 mb-4">
                <li><strong>Cifrado en tránsito:</strong> TLS 1.2/1.3 en todas las comunicaciones</li>
                <li><strong>Cifrado en reposo:</strong> Datos almacenados cifrados mediante AES-256 en la infraestructura de Neon (PostgreSQL)</li>
                <li><strong>Contraseñas:</strong> Almacenadas exclusivamente en formato hash bcrypt con salt (10 rondas)</li>
                <li><strong>Autenticación:</strong> JWT seguro con expiración, sesiones gestionadas por NextAuth.js</li>
                <li><strong>Control de acceso:</strong> Basado en roles (OWNER, ADMIN, MEMBER, VIEWER) con principio de mínimo privilegio</li>
                <li><strong>Infraestructura:</strong> Alojada en Vercel (edge network con alta disponibilidad) y Neon (PostgreSQL cloud)</li>
                <li><strong>Tokens de recuperación:</strong> Expiración automática de tokens de restablecimiento de contraseña</li>
              </ul>

              <h3 className="text-xl font-medium text-gray-800 dark:text-gray-200 mb-2">4.2 Medidas Organizativas</h3>
              <ul className="list-disc pl-6 text-gray-600 dark:text-gray-300 space-y-2 mb-4">
                <li>Acceso a datos de producción restringido al personal autorizado bajo necesidad estricta</li>
                <li>Revisiones periódicas de seguridad y auditorías de acceso</li>
                <li>Procedimiento documentado de respuesta ante brechas de seguridad</li>
                <li>Formación continua del equipo en materia de seguridad y privacidad</li>
                <li>Acuerdos de confidencialidad con todos los empleados y contratistas</li>
              </ul>

              <h3 className="text-xl font-medium text-gray-800 dark:text-gray-200 mb-2">4.3 Notificación de Brechas de Seguridad</h3>
              <p className="text-gray-600 dark:text-gray-300 mb-4">
                En caso de producirse una brecha de seguridad que afecte a datos personales, GuardyScan notificará a los Usuarios afectados y, cuando sea requerido por ley, a las autoridades competentes, en los plazos establecidos por la normativa aplicable (máximo 72 horas para notificación a autoridades bajo GDPR). Para reportar incidentes de seguridad, contacte a: <strong>security@guardyscan.com</strong>.
              </p>
            </section>

            {/* 5 */}
            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">
                5. Procesadores de Datos y Transferencias a Terceros
              </h2>
              <p className="text-gray-600 dark:text-gray-300 mb-4">
                GuardyScan no vende, alquila ni comparte datos personales con terceros con fines comerciales propios de dichos terceros. Compartimos datos únicamente con los siguientes procesadores de datos bajo acuerdos contractuales adecuados:
              </p>
              <div className="overflow-x-auto mb-4">
                <table className="w-full text-sm text-gray-600 dark:text-gray-300 border border-gray-200 dark:border-gray-600 rounded-lg">
                  <thead className="bg-gray-50 dark:bg-gray-700">
                    <tr>
                      <th className="p-3 text-left font-semibold">Proveedor</th>
                      <th className="p-3 text-left font-semibold">Finalidad</th>
                      <th className="p-3 text-left font-semibold">Ubicación</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr className="border-t border-gray-200 dark:border-gray-600">
                      <td className="p-3"><strong>Stripe</strong></td>
                      <td className="p-3">Procesamiento de pagos y suscripciones (PCI-DSS Nivel 1)</td>
                      <td className="p-3">EE.UU. / Global</td>
                    </tr>
                    <tr className="border-t border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-700/50">
                      <td className="p-3"><strong>Vercel</strong></td>
                      <td className="p-3">Infraestructura de hosting y despliegue serverless</td>
                      <td className="p-3">EE.UU. / Global (edge)</td>
                    </tr>
                    <tr className="border-t border-gray-200 dark:border-gray-600">
                      <td className="p-3"><strong>Neon</strong></td>
                      <td className="p-3">Base de datos PostgreSQL cloud</td>
                      <td className="p-3">EE.UU.</td>
                    </tr>
                    <tr className="border-t border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-700/50">
                      <td className="p-3"><strong>Anthropic (Claude AI)</strong></td>
                      <td className="p-3">Diagnósticos de seguridad asistidos por IA</td>
                      <td className="p-3">EE.UU.</td>
                    </tr>
                  </tbody>
                </table>
              </div>
              <p className="text-gray-600 dark:text-gray-300 mb-4">
                También podemos divulgar datos cuando sea requerido por ley, orden judicial, autoridad competente, o cuando sea necesario para proteger los derechos, propiedad o seguridad de GuardyScan, sus usuarios o el público en general.
              </p>
            </section>

            {/* 6 */}
            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">
                6. Transferencias Internacionales de Datos
              </h2>
              <p className="text-gray-600 dark:text-gray-300 mb-4">
                Dado que nuestros proveedores de infraestructura (Vercel, Neon, Stripe, Anthropic) operan principalmente desde Estados Unidos, sus datos pueden ser transferidos y procesados fuera de Chile. GuardyScan garantiza que dichas transferencias se realizan bajo mecanismos de protección adecuados, incluyendo:
              </p>
              <ul className="list-disc pl-6 text-gray-600 dark:text-gray-300 space-y-2 mb-4">
                <li>Contratos de procesamiento de datos con cláusulas de protección equivalente</li>
                <li>Elección de proveedores con certificaciones internacionales reconocidas (SOC 2, ISO 27001)</li>
                <li>Cláusulas contractuales tipo cuando aplica la normativa europea</li>
              </ul>
            </section>

            {/* 7 */}
            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">
                7. Retención y Eliminación de Datos
              </h2>
              <p className="text-gray-600 dark:text-gray-300 mb-4">
                Conservamos los datos personales durante el tiempo necesario para cumplir las finalidades descritas y las obligaciones legales aplicables:
              </p>
              <div className="overflow-x-auto mb-4">
                <table className="w-full text-sm text-gray-600 dark:text-gray-300 border border-gray-200 dark:border-gray-600 rounded-lg">
                  <thead className="bg-gray-50 dark:bg-gray-700">
                    <tr>
                      <th className="p-3 text-left font-semibold">Tipo de dato</th>
                      <th className="p-3 text-left font-semibold">Período de retención</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr className="border-t border-gray-200 dark:border-gray-600">
                      <td className="p-3">Datos de cuenta activa</td>
                      <td className="p-3">Mientras la cuenta esté activa</td>
                    </tr>
                    <tr className="border-t border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-700/50">
                      <td className="p-3">Datos de cuenta tras cancelación</td>
                      <td className="p-3">90 días (exportables a solicitud)</td>
                    </tr>
                    <tr className="border-t border-gray-200 dark:border-gray-600">
                      <td className="p-3">Registros de escaneo y vulnerabilidades</td>
                      <td className="p-3">Según plan: hasta 15 días (Professional), indefinido (Enterprise)</td>
                    </tr>
                    <tr className="border-t border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-700/50">
                      <td className="p-3">Registros de facturación y pagos</td>
                      <td className="p-3">6 años (obligación tributaria chilena)</td>
                    </tr>
                    <tr className="border-t border-gray-200 dark:border-gray-600">
                      <td className="p-3">Logs de actividad y seguridad</td>
                      <td className="p-3">12 meses</td>
                    </tr>
                    <tr className="border-t border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-700/50">
                      <td className="p-3">Tokens de recuperación de contraseña</td>
                      <td className="p-3">24 horas (expiración automática)</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </section>

            {/* 8 */}
            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">
                8. Sus Derechos como Titular de Datos
              </h2>
              <p className="text-gray-600 dark:text-gray-300 mb-4">
                De conformidad con la Ley N° 19.628 de Chile y, en la medida aplicable, el GDPR, el Usuario tiene los siguientes derechos:
              </p>
              <ul className="list-disc pl-6 text-gray-600 dark:text-gray-300 space-y-2 mb-4">
                <li><strong>Acceso:</strong> Solicitar información sobre qué datos personales suyos tratamos y obtener una copia</li>
                <li><strong>Rectificación:</strong> Corregir datos inexactos, incompletos o desactualizados</li>
                <li><strong>Supresión / Eliminación:</strong> Solicitar la eliminación de sus datos cuando ya no sean necesarios o retire su consentimiento</li>
                <li><strong>Portabilidad:</strong> Recibir sus datos en formato estructurado, legible por máquina (JSON/CSV)</li>
                <li><strong>Oposición:</strong> Oponerse al tratamiento de sus datos para finalidades basadas en interés legítimo</li>
                <li><strong>Limitación del tratamiento:</strong> Solicitar la restricción del procesamiento en determinados casos</li>
                <li><strong>Retirada del consentimiento:</strong> Retirar el consentimiento prestado en cualquier momento, sin afectar la licitud del tratamiento previo</li>
              </ul>
              <p className="text-gray-600 dark:text-gray-300 mb-4">
                Para ejercer sus derechos, contacte a <strong>privacy@guardyscan.com</strong> o <strong>dpo@guardyscan.com</strong>, indicando el derecho que desea ejercer e incluyendo información que permita verificar su identidad. Responderemos en un plazo máximo de <strong>30 días hábiles</strong>.
              </p>
              <p className="text-gray-600 dark:text-gray-300 mb-4">
                <strong>Limitaciones:</strong> Algunos derechos pueden estar sujetos a limitaciones cuando el tratamiento sea necesario para el cumplimiento de obligaciones legales, la defensa de reclamaciones o la prestación del servicio contratado.
              </p>
            </section>

            {/* 9 */}
            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">
                9. Datos de Menores de Edad
              </h2>
              <p className="text-gray-600 dark:text-gray-300 mb-4">
                GuardyScan es un servicio dirigido exclusivamente a empresas y profesionales mayores de 18 años. No recopilamos intencionadamente datos personales de menores de 18 años. Si tenemos conocimiento de que hemos recopilado datos de un menor, los eliminaremos de inmediato. Si usted tiene conocimiento de ello, notifíquenos en <strong>privacy@guardyscan.com</strong>.
              </p>
            </section>

            {/* 10 */}
            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">
                10. Uso de Cookies y Tecnologías de Seguimiento
              </h2>
              <p className="text-gray-600 dark:text-gray-300 mb-4">
                GuardyScan utiliza cookies y tecnologías similares para garantizar el funcionamiento de la plataforma, autenticar sesiones de usuario y mejorar la experiencia de uso. Para información detallada sobre los tipos de cookies que usamos, sus finalidades y cómo gestionarlas, consulte nuestra{" "}
                <Link href="/cookies" className="text-blue-600 dark:text-blue-400 hover:underline">
                  Política de Cookies
                </Link>.
              </p>
            </section>

            {/* 11 */}
            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">
                11. Exención de Responsabilidad en Materia de Datos
              </h2>
              <p className="text-gray-600 dark:text-gray-300 mb-4">
                El Usuario es el responsable exclusivo de los datos que ingresa en la plataforma, incluyendo datos personales de terceros (empleados, clientes, proveedores, miembros de comités, etc.). Al introducir datos de terceros, el Usuario declara y garantiza que:
              </p>
              <ul className="list-disc pl-6 text-gray-600 dark:text-gray-300 space-y-2 mb-4">
                <li>Cuenta con la base legal adecuada para tratar dichos datos (consentimiento, contrato, obligación legal, etc.)</li>
                <li>Ha informado a los terceros afectados sobre el tratamiento de sus datos</li>
                <li>El tratamiento cumple con la normativa de protección de datos aplicable en su jurisdicción</li>
              </ul>
              <p className="text-gray-600 dark:text-gray-300 mb-4">
                GuardyScan actúa como <strong>encargado del tratamiento</strong> respecto a los datos de terceros ingresados por el Usuario, y como <strong>responsable del tratamiento</strong> respecto a los datos del propio Usuario. GuardyScan no será responsable por el incumplimiento del Usuario de sus obligaciones como responsable del tratamiento de datos de terceros.
              </p>
            </section>

            {/* 12 */}
            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">
                12. Cambios a esta Política
              </h2>
              <p className="text-gray-600 dark:text-gray-300 mb-4">
                GuardyScan se reserva el derecho de actualizar esta Política en cualquier momento. Ante cambios sustanciales, notificaremos al Usuario mediante correo electrónico o aviso destacado en la plataforma con al menos <strong>15 días de anticipación</strong> a la entrada en vigor. El uso continuado del servicio tras la fecha de vigencia de la nueva Política implicará su aceptación.
              </p>
            </section>

            {/* 13 */}
            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">
                13. Reclamaciones ante Autoridad de Control
              </h2>
              <p className="text-gray-600 dark:text-gray-300 mb-4">
                Si el Usuario considera que el tratamiento de sus datos personales infringe la normativa aplicable, tiene derecho a presentar una reclamación ante la autoridad de protección de datos competente en Chile u otras autoridades aplicables. Le animamos a contactarnos primero en <strong>dpo@guardyscan.com</strong> para intentar resolver cualquier inquietud de forma directa.
              </p>
            </section>

            {/* 14 */}
            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">
                14. Contacto
              </h2>
              <p className="text-gray-600 dark:text-gray-300 mb-4">
                Para cualquier consulta, solicitud o reclamación relacionada con el tratamiento de sus datos personales:
              </p>
              <ul className="list-none text-gray-600 dark:text-gray-300 space-y-2">
                <li><strong>Privacidad general:</strong> privacy@guardyscan.com</li>
                <li><strong>Oficial de Protección de Datos (DPO):</strong> dpo@guardyscan.com</li>
                <li><strong>Seguridad e incidentes:</strong> security@guardyscan.com</li>
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
