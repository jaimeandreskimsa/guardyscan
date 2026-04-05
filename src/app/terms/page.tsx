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
              Términos y Condiciones de Uso
            </h1>
            <p className="text-gray-500 dark:text-gray-400">
              Última actualización: 5 de abril de 2026
            </p>
            <div className="mt-4 p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
              <p className="text-blue-800 dark:text-blue-300 text-sm font-medium">
                AVISO IMPORTANTE: Lea atentamente estos Términos y Condiciones antes de utilizar la plataforma GuardyScan. Al acceder o utilizar nuestros servicios, usted declara haber leído, comprendido y aceptado íntegramente estos Términos. Si no está de acuerdo con alguna disposición, debe abstenerse de utilizar la plataforma.
              </p>
            </div>
          </div>

          <div className="prose prose-gray dark:prose-invert max-w-none">

            {/* 1 */}
            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">
                1. Identificación del Titular del Servicio
              </h2>
              <p className="text-gray-600 dark:text-gray-300 mb-4">
                GuardyScan (en adelante, &quot;GuardyScan&quot;, &quot;nosotros&quot; o &quot;la Empresa&quot;) es una plataforma de ciberseguridad operada desde la República de Chile. Para consultas legales, puede contactarnos en <strong>legal@guardyscan.com</strong>.
              </p>
              <p className="text-gray-600 dark:text-gray-300 mb-4">
                El usuario (en adelante, &quot;Usuario&quot;, &quot;usted&quot; o &quot;Cliente&quot;) es la persona natural o jurídica que accede y utiliza la plataforma GuardyScan.
              </p>
            </section>

            {/* 2 */}
            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">
                2. Descripción del Servicio
              </h2>
              <p className="text-gray-600 dark:text-gray-300 mb-4">
                GuardyScan proporciona una plataforma de ciberseguridad SaaS (Software como Servicio) que incluye, entre otros:
              </p>
              <ul className="list-disc pl-6 text-gray-600 dark:text-gray-300 space-y-2 mb-4">
                <li>Escaneo automatizado de vulnerabilidades en activos digitales</li>
                <li>Monitoreo continuo de seguridad (24/7 SIEM)</li>
                <li>Gestión de incidentes y alertas de seguridad</li>
                <li>Evaluación de cumplimiento normativo (ISO 27001, Ley 21.663, GDPR)</li>
                <li>Gestión de riesgos y continuidad de negocio</li>
                <li>Diagnósticos asistidos por Inteligencia Artificial</li>
                <li>Generación de reportes de seguridad</li>
              </ul>
              <p className="text-gray-600 dark:text-gray-300 mb-4">
                <strong>Los resultados y reportes generados por la plataforma tienen carácter meramente informativo y orientativo.</strong> GuardyScan no presta servicios de asesoría legal, jurídica, regulatoria ni de seguridad certificada. El Usuario es el único responsable de interpretar los resultados y tomar decisiones basadas en ellos.
              </p>
            </section>

            {/* 3 */}
            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">
                3. Elegibilidad y Registro de Cuenta
              </h2>
              <p className="text-gray-600 dark:text-gray-300 mb-4">
                Para utilizar GuardyScan, el Usuario debe:
              </p>
              <ul className="list-disc pl-6 text-gray-600 dark:text-gray-300 space-y-2 mb-4">
                <li>Ser mayor de 18 años o la edad legal de mayoría en su jurisdicción</li>
                <li>Actuar en nombre de una empresa u organización debidamente constituida, si corresponde</li>
                <li>Proporcionar información veraz, completa y actualizada durante el registro</li>
                <li>Tener capacidad legal para contratar y aceptar estos Términos</li>
              </ul>
              <p className="text-gray-600 dark:text-gray-300 mb-4">
                El Usuario es el único responsable de:
              </p>
              <ul className="list-disc pl-6 text-gray-600 dark:text-gray-300 space-y-2 mb-4">
                <li>Mantener la confidencialidad de sus credenciales de acceso</li>
                <li>Todas las actividades realizadas bajo su cuenta, autorizadas o no</li>
                <li>Notificar inmediatamente a GuardyScan ante cualquier acceso no autorizado o brecha de seguridad en su cuenta, a través de <strong>security@guardyscan.com</strong></li>
                <li>Mantener actualizada su información de contacto, facturación y empresa</li>
              </ul>
              <p className="text-gray-600 dark:text-gray-300 mb-4">
                GuardyScan no será responsable por pérdidas o daños derivados del incumplimiento de estas obligaciones por parte del Usuario.
              </p>
            </section>

            {/* 4 */}
            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">
                4. Autorización de Escaneo — Obligación Esencial del Usuario
              </h2>
              <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg mb-4">
                <p className="text-red-800 dark:text-red-300 font-semibold">
                  ADVERTENCIA LEGAL CRÍTICA
                </p>
              </div>
              <p className="text-gray-600 dark:text-gray-300 mb-4">
                El Usuario declara y garantiza bajo su exclusiva responsabilidad que:
              </p>
              <ul className="list-disc pl-6 text-gray-600 dark:text-gray-300 space-y-2 mb-4">
                <li>Tiene autorización legal expresa para escanear, analizar o monitorear todos y cada uno de los activos, dominios, servidores, aplicaciones y sistemas que ingrese en la plataforma</li>
                <li>Es propietario de dichos activos o cuenta con autorización escrita del propietario legítimo</li>
                <li>No utilizará GuardyScan para escanear sistemas, redes o activos de terceros sin su consentimiento previo y documentado</li>
                <li>Cumplirá con todas las leyes aplicables en su jurisdicción relativas al acceso a sistemas informáticos</li>
              </ul>
              <p className="text-gray-600 dark:text-gray-300 mb-4">
                <strong>GuardyScan actúa exclusivamente como herramienta tecnológica al servicio del Usuario. Cualquier uso indebido de la plataforma para acceder, escanear o analizar sistemas sin autorización es responsabilidad exclusiva del Usuario.</strong> GuardyScan quedará completamente exento de toda responsabilidad civil, penal o administrativa derivada del uso no autorizado de sus herramientas de escaneo.
              </p>
              <p className="text-gray-600 dark:text-gray-300 mb-4">
                El incumplimiento de esta cláusula constituirá una infracción grave que facultará a GuardyScan para suspender o terminar la cuenta de forma inmediata y sin reembolso, y para ejercer las acciones legales que correspondan.
              </p>
            </section>

            {/* 5 */}
            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">
                5. Planes, Pagos y Facturación
              </h2>
              <p className="text-gray-600 dark:text-gray-300 mb-4">
                GuardyScan ofrece planes de suscripción mensual y compras únicas de reportes. Al contratar un plan de pago:
              </p>
              <ul className="list-disc pl-6 text-gray-600 dark:text-gray-300 space-y-2 mb-4">
                <li>Los pagos se procesan de forma segura a través de <strong>Stripe</strong>, un procesador de pagos certificado PCI-DSS. GuardyScan no almacena datos de tarjetas de crédito</li>
                <li>Las suscripciones se renuevan automáticamente al término de cada período salvo cancelación expresa</li>
                <li>El Usuario puede cancelar su suscripción en cualquier momento desde el panel de facturación; la cancelación tendrá efecto al término del período vigente</li>
                <li>Los precios publicados no incluyen el Impuesto al Valor Agregado (IVA) ni otros impuestos aplicables en la jurisdicción del Usuario, los cuales serán añadidos según corresponda</li>
                <li>GuardyScan se reserva el derecho de modificar sus precios con un aviso previo de <strong>30 días corridos</strong> por correo electrónico</li>
              </ul>
              <h3 className="text-xl font-medium text-gray-800 dark:text-gray-200 mb-2">5.1 Política de No Reembolsos</h3>
              <p className="text-gray-600 dark:text-gray-300 mb-4">
                <strong>Todos los pagos realizados a GuardyScan son definitivos y no reembolsables</strong>, salvo lo expresamente establecido en la legislación chilena del consumidor que resulte aplicable. No se emitirán reembolsos por:
              </p>
              <ul className="list-disc pl-6 text-gray-600 dark:text-gray-300 space-y-2 mb-4">
                <li>Períodos de suscripción parcialmente utilizados</li>
                <li>Inactividad voluntaria de la cuenta por parte del Usuario</li>
                <li>Reportes PDF generados y descargados</li>
                <li>Cancelaciones anticipadas dentro de un período ya facturado</li>
              </ul>
              <h3 className="text-xl font-medium text-gray-800 dark:text-gray-200 mb-2">5.2 Impagos y Suspensión por Mora</h3>
              <p className="text-gray-600 dark:text-gray-300 mb-4">
                En caso de fallo en el cobro de la suscripción, GuardyScan podrá suspender el acceso a las funcionalidades de pago de forma automática, sin necesidad de notificación previa adicional. La reactivación estará sujeta al pago de los saldos pendientes.
              </p>
            </section>

            {/* 6 */}
            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">
                6. Uso Aceptable y Conductas Prohibidas
              </h2>
              <p className="text-gray-600 dark:text-gray-300 mb-4">
                El Usuario se compromete expresamente a NO:
              </p>
              <ul className="list-disc pl-6 text-gray-600 dark:text-gray-300 space-y-2 mb-4">
                <li>Utilizar la plataforma para realizar actividades ilegales, fraudulentas o que violen derechos de terceros</li>
                <li>Escanear activos o sistemas sin la debida autorización legal de sus propietarios</li>
                <li>Intentar acceder, comprometer o exfiltrar datos de otras cuentas de usuarios de GuardyScan</li>
                <li>Compartir, transferir, sublicenciar o vender sus credenciales de acceso a terceros</li>
                <li>Realizar ingeniería inversa, descompilar, desensamblar o intentar extraer el código fuente de la plataforma</li>
                <li>Sobrecargar intencionalmente la infraestructura de GuardyScan mediante ataques de denegación de servicio (DoS/DDoS) u otros medios</li>
                <li>Usar bots, scrapers u herramientas automatizadas no autorizadas para interactuar con la plataforma</li>
                <li>Introducir virus, malware, ransomware u otro código malicioso en la plataforma</li>
                <li>Usar la plataforma para hostigar, amenazar o perjudicar a terceros</li>
                <li>Eludir, desactivar o interferir con mecanismos de seguridad, autenticación o control de acceso de la plataforma</li>
                <li>Revender, redistribuir o proporcionar acceso a la plataforma a terceros sin autorización escrita de GuardyScan</li>
                <li>Usar los resultados de los escaneos para actividades de ciberataque, espionaje industrial o cualquier propósito malicioso</li>
              </ul>
              <p className="text-gray-600 dark:text-gray-300 mb-4">
                GuardyScan se reserva el derecho de monitorear el uso de la plataforma para detectar infracciones a esta política y tomar las medidas que estime pertinentes, incluyendo la suspensión inmediata de la cuenta y la notificación a las autoridades competentes.
              </p>
            </section>

            {/* 7 */}
            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">
                7. Propiedad Intelectual
              </h2>
              <p className="text-gray-600 dark:text-gray-300 mb-4">
                Todos los derechos de propiedad intelectual e industrial relativos a la plataforma GuardyScan, incluyendo pero sin limitarse a: software, código fuente, algoritmos, bases de datos, diseños gráficos, logos, marcas comerciales, interfaces de usuario, documentación y metodologías de análisis, son propiedad exclusiva de GuardyScan o de sus licenciantes y están protegidos por las leyes de propiedad intelectual de Chile y los tratados internacionales aplicables.
              </p>
              <p className="text-gray-600 dark:text-gray-300 mb-4">
                Estos Términos no otorgan al Usuario ningún derecho de propiedad sobre la plataforma. Se concede únicamente una licencia de uso personal, no exclusiva, intransferible, revocable y limitada al objeto de estos Términos.
              </p>
              <h3 className="text-xl font-medium text-gray-800 dark:text-gray-200 mb-2">7.1 Datos del Usuario</h3>
              <p className="text-gray-600 dark:text-gray-300 mb-4">
                El Usuario conserva la propiedad de los datos que ingresa en la plataforma. Sin embargo, al utilizar GuardyScan, el Usuario otorga a GuardyScan una licencia no exclusiva para procesar, almacenar y utilizar dichos datos con el único fin de prestar el servicio contratado. GuardyScan podrá utilizar datos anonimizados y agregados —que no permitan identificar al Usuario ni a sus activos— para mejorar la plataforma, desarrollar inteligencia de amenazas y elaborar estadísticas de uso.
              </p>
            </section>

            {/* 8 */}
            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">
                8. Inteligencia Artificial — Limitaciones y Exención de Responsabilidad
              </h2>
              <p className="text-gray-600 dark:text-gray-300 mb-4">
                GuardyScan integra modelos de Inteligencia Artificial de terceros (actualmente Anthropic Claude) para generar diagnósticos, recomendaciones y análisis de seguridad. El Usuario reconoce y acepta que:
              </p>
              <ul className="list-disc pl-6 text-gray-600 dark:text-gray-300 space-y-2 mb-4">
                <li>Los resultados generados por IA son <strong>orientativos e informativos</strong> y no constituyen asesoría profesional de seguridad, legal ni regulatoria</li>
                <li>Los modelos de IA pueden producir resultados incompletos, inexactos o inapropiados para ciertos contextos</li>
                <li>El Usuario es el único responsable de validar, interpretar y actuar sobre las recomendaciones generadas por IA</li>
                <li>Para el procesamiento de IA, cierta información puede ser transmitida a servidores de Anthropic bajo los términos de uso y privacidad de dicho proveedor</li>
                <li>GuardyScan no garantiza que los diagnósticos de IA detectarán todas las vulnerabilidades existentes ni que sus recomendaciones sean suficientes para alcanzar ningún estándar de seguridad o cumplimiento normativo</li>
              </ul>
            </section>

            {/* 9 */}
            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">
                9. Exención de Garantías — Servicio &quot;Tal Cual&quot;
              </h2>
              <p className="text-gray-600 dark:text-gray-300 mb-4">
                <strong>En la máxima medida permitida por la ley aplicable, GuardyScan proporciona sus servicios &quot;tal cual&quot; (as-is) y &quot;según disponibilidad&quot; (as-available), sin garantías de ningún tipo, ya sean expresas, implícitas, legales o de cualquier otra índole.</strong>
              </p>
              <p className="text-gray-600 dark:text-gray-300 mb-4">
                GuardyScan no garantiza expresamente:
              </p>
              <ul className="list-disc pl-6 text-gray-600 dark:text-gray-300 space-y-2 mb-4">
                <li>Que el servicio sea ininterrumpido, sin errores, libre de virus o completamente seguro</li>
                <li>Que los resultados de los escaneos sean completos, exactos o actualizados</li>
                <li>Que la plataforma detectará todas las vulnerabilidades existentes en los activos escaneados</li>
                <li>Que el uso de la plataforma garantizará el cumplimiento de ninguna normativa específica (ISO 27001, GDPR, Ley 21.663, u otras)</li>
                <li>Que la plataforma estará disponible en un porcentaje mínimo de tiempo (uptime)</li>
                <li>Que los diagnósticos de IA serán precisos, completos o apropiados para las necesidades específicas del Usuario</li>
              </ul>
              <p className="text-gray-600 dark:text-gray-300 mb-4">
                El Usuario utiliza el servicio bajo su propio riesgo y responsabilidad.
              </p>
            </section>

            {/* 10 */}
            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">
                10. Limitación de Responsabilidad
              </h2>
              <p className="text-gray-600 dark:text-gray-300 mb-4">
                <strong>En la máxima medida permitida por la legislación chilena aplicable, GuardyScan, sus directivos, empleados, socios, proveedores y licenciantes no serán responsables bajo ninguna teoría legal —contractual, extracontractual, objetiva u otra— por:</strong>
              </p>
              <ul className="list-disc pl-6 text-gray-600 dark:text-gray-300 space-y-2 mb-4">
                <li>Daños indirectos, incidentales, especiales, punitivos, consecuentes o ejemplares</li>
                <li>Pérdida de ingresos, beneficios, datos, fondo de comercio o contratos</li>
                <li>Daños derivados del uso o la imposibilidad de uso del servicio</li>
                <li>Accesos no autorizados a sistemas del Usuario o de terceros</li>
                <li>Vulnerabilidades no detectadas por la plataforma</li>
                <li>Decisiones comerciales, técnicas o legales tomadas con base en los resultados o recomendaciones de la plataforma</li>
                <li>Interrupciones del servicio por mantenimiento, fallas técnicas o causas de fuerza mayor</li>
                <li>Daños causados por el uso indebido de la plataforma por parte del Usuario o de terceros que accedan a su cuenta</li>
              </ul>
              <p className="text-gray-600 dark:text-gray-300 mb-4">
                <strong>En ningún caso la responsabilidad total acumulada de GuardyScan frente al Usuario, por cualquier causa y bajo cualquier teoría legal, excederá el monto total de los pagos efectivamente realizados por el Usuario a GuardyScan durante los doce (12) meses inmediatamente anteriores al evento que origine la reclamación.</strong>
              </p>
              <p className="text-gray-600 dark:text-gray-300 mb-4">
                Las limitaciones anteriores se aplicarán incluso si GuardyScan ha sido informado de la posibilidad de dichos daños. Algunos territorios pueden no permitir la exclusión o limitación de ciertos daños, en cuyo caso estas limitaciones se aplicarán en la medida máxima permitida por la ley local.
              </p>
            </section>

            {/* 11 */}
            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">
                11. Indemnización por parte del Usuario
              </h2>
              <p className="text-gray-600 dark:text-gray-300 mb-4">
                El Usuario se compromete a defender, indemnizar y mantener indemne a GuardyScan, sus directivos, empleados, agentes, socios y licenciantes, frente a cualquier reclamación, demanda, acción judicial, multa, sanción, pérdida, daño, costo y gasto (incluidos honorarios de abogados razonables) que surjan de o estén relacionados con:
              </p>
              <ul className="list-disc pl-6 text-gray-600 dark:text-gray-300 space-y-2 mb-4">
                <li>El uso de la plataforma por parte del Usuario o de terceros que accedan a través de su cuenta</li>
                <li>Cualquier violación de estos Términos y Condiciones</li>
                <li>El escaneo de activos sin la debida autorización legal</li>
                <li>La infracción de derechos de terceros, incluyendo propiedad intelectual, privacidad o derechos de acceso a sistemas</li>
                <li>El uso de los resultados de la plataforma de manera ilegal, fraudulenta o dañina</li>
                <li>Información falsa o inexacta proporcionada durante el registro o el uso de la plataforma</li>
                <li>Cualquier actividad ilegal realizada mediante la plataforma</li>
              </ul>
            </section>

            {/* 12 */}
            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">
                12. Confidencialidad
              </h2>
              <p className="text-gray-600 dark:text-gray-300 mb-4">
                Ambas partes reconocen que pueden tener acceso a información confidencial de la otra parte en el marco de esta relación contractual. Cada parte se compromete a:
              </p>
              <ul className="list-disc pl-6 text-gray-600 dark:text-gray-300 space-y-2 mb-4">
                <li>Mantener la confidencialidad de dicha información y no divulgarla a terceros sin consentimiento previo y escrito</li>
                <li>Usar la información confidencial únicamente para los fines previstos en estos Términos</li>
                <li>Adoptar las mismas medidas de protección que aplicaría a su propia información confidencial, con un mínimo de diligencia razonable</li>
              </ul>
              <p className="text-gray-600 dark:text-gray-300 mb-4">
                Esta obligación de confidencialidad subsistirá durante dos (2) años tras la terminación de la relación contractual.
              </p>
            </section>

            {/* 13 */}
            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">
                13. Suspensión y Terminación del Servicio
              </h2>
              <h3 className="text-xl font-medium text-gray-800 dark:text-gray-200 mb-2">13.1 Terminación por el Usuario</h3>
              <p className="text-gray-600 dark:text-gray-300 mb-4">
                El Usuario puede cancelar su cuenta en cualquier momento desde el panel de configuración. La cancelación tendrá efecto al finalizar el período de suscripción vigente y no dará derecho a reembolso alguno.
              </p>
              <h3 className="text-xl font-medium text-gray-800 dark:text-gray-200 mb-2">13.2 Suspensión o Terminación por GuardyScan</h3>
              <p className="text-gray-600 dark:text-gray-300 mb-4">
                GuardyScan podrá suspender o terminar el acceso a la plataforma, con o sin previo aviso y sin obligación de reembolso, en los siguientes casos:
              </p>
              <ul className="list-disc pl-6 text-gray-600 dark:text-gray-300 space-y-2 mb-4">
                <li>Incumplimiento de cualquier disposición de estos Términos</li>
                <li>Impago de suscripciones o cargos pendientes</li>
                <li>Uso fraudulento, abusivo o ilegal de la plataforma</li>
                <li>Escaneo de activos sin autorización o uso que ponga en riesgo a terceros</li>
                <li>Requerimiento de autoridades competentes</li>
                <li>Riesgo de daño a la infraestructura, reputación u otros usuarios de GuardyScan</li>
                <li>A discreción de GuardyScan, por cualquier razón, con aviso previo de 30 días cuando no exista causa grave</li>
              </ul>
              <h3 className="text-xl font-medium text-gray-800 dark:text-gray-200 mb-2">13.3 Efectos de la Terminación</h3>
              <p className="text-gray-600 dark:text-gray-300 mb-4">
                Tras la terminación, el Usuario perderá el acceso a la plataforma y a todos los datos almacenados. GuardyScan conservará los datos del Usuario durante un período máximo de 90 días tras la terminación, transcurrido el cual podrán ser eliminados definitivamente, salvo que la ley exija su conservación por mayor tiempo. El Usuario podrá solicitar una exportación de sus datos dentro del período de retención.
              </p>
            </section>

            {/* 14 */}
            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">
                14. Servicios y Proveedores Terceros
              </h2>
              <p className="text-gray-600 dark:text-gray-300 mb-4">
                GuardyScan puede integrar o enlazar servicios de terceros (Stripe para pagos, Anthropic para IA, Vercel para infraestructura, Neon para base de datos, entre otros). GuardyScan no controla ni es responsable de los servicios, contenidos, políticas de privacidad o prácticas de dichos terceros. El uso de servicios de terceros integrados en GuardyScan está sujeto a los términos y condiciones propios de cada proveedor.
              </p>
            </section>

            {/* 15 */}
            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">
                15. Modificaciones del Servicio y de los Términos
              </h2>
              <p className="text-gray-600 dark:text-gray-300 mb-4">
                GuardyScan se reserva el derecho de modificar, actualizar, suspender o discontinuar cualquier aspecto de la plataforma en cualquier momento. Para modificaciones sustanciales de los Términos, GuardyScan notificará al Usuario mediante correo electrónico o aviso destacado en la plataforma con al menos <strong>15 días de anticipación</strong>. El uso continuado del servicio tras la fecha de entrada en vigor de los nuevos Términos constituirá aceptación de los mismos. Si el Usuario no acepta los cambios, debe discontinuar el uso del servicio.
              </p>
            </section>

            {/* 16 */}
            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">
                16. Fuerza Mayor
              </h2>
              <p className="text-gray-600 dark:text-gray-300 mb-4">
                GuardyScan no será responsable por incumplimientos o retrasos causados por eventos fuera de su control razonable, incluyendo pero no limitado a: desastres naturales, pandemias, guerras, actos terroristas, fallos de infraestructura de internet, ataques cibernéticos masivos, cortes de suministro eléctrico, huelgas, decisiones gubernamentales o regulatorias, o fallos de proveedores de servicios esenciales. En caso de fuerza mayor, GuardyScan notificará al Usuario a la brevedad posible e intentará restablecer el servicio.
              </p>
            </section>

            {/* 17 */}
            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">
                17. Ley Aplicable y Resolución de Disputas
              </h2>
              <p className="text-gray-600 dark:text-gray-300 mb-4">
                Estos Términos se regirán e interpretarán exclusivamente de acuerdo con las leyes de la República de Chile.
              </p>
              <h3 className="text-xl font-medium text-gray-800 dark:text-gray-200 mb-2">17.1 Resolución Amistosa</h3>
              <p className="text-gray-600 dark:text-gray-300 mb-4">
                Ante cualquier controversia derivada de estos Términos, las partes se comprometen a intentar resolverla de buena fe mediante negociación directa durante un período de <strong>30 días corridos</strong> desde que una parte notifique a la otra por escrito la existencia del conflicto.
              </p>
              <h3 className="text-xl font-medium text-gray-800 dark:text-gray-200 mb-2">17.2 Mediación</h3>
              <p className="text-gray-600 dark:text-gray-300 mb-4">
                De no lograrse acuerdo en la etapa anterior, las partes podrán someter la disputa a un proceso de mediación ante un mediador acordado mutuamente, antes de recurrir a los tribunales ordinarios.
              </p>
              <h3 className="text-xl font-medium text-gray-800 dark:text-gray-200 mb-2">17.3 Tribunales Competentes</h3>
              <p className="text-gray-600 dark:text-gray-300 mb-4">
                Para las controversias que no puedan resolverse amistosamente, las partes se someten a la jurisdicción exclusiva de los Tribunales Ordinarios de Justicia de la ciudad de Santiago, República de Chile, renunciando expresamente a cualquier otro fuero que pudiera corresponderles.
              </p>
            </section>

            {/* 18 */}
            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">
                18. Disposiciones Generales
              </h2>
              <h3 className="text-xl font-medium text-gray-800 dark:text-gray-200 mb-2">18.1 Divisibilidad</h3>
              <p className="text-gray-600 dark:text-gray-300 mb-4">
                Si alguna disposición de estos Términos fuera declarada nula, inválida o inaplicable por un tribunal competente, dicha disposición se modificará en la medida mínima necesaria o se eliminará, sin afectar la validez y vigencia del resto de los Términos.
              </p>
              <h3 className="text-xl font-medium text-gray-800 dark:text-gray-200 mb-2">18.2 No Renuncia</h3>
              <p className="text-gray-600 dark:text-gray-300 mb-4">
                La falta de ejercicio o el retraso en el ejercicio de cualquier derecho o recurso por parte de GuardyScan no constituirá una renuncia a dicho derecho o recurso.
              </p>
              <h3 className="text-xl font-medium text-gray-800 dark:text-gray-200 mb-2">18.3 Acuerdo Completo</h3>
              <p className="text-gray-600 dark:text-gray-300 mb-4">
                Estos Términos, junto con la Política de Privacidad y la Política de Cookies, constituyen el acuerdo completo entre el Usuario y GuardyScan en relación con el uso de la plataforma, y sustituyen cualquier acuerdo previo sobre el mismo objeto.
              </p>
              <h3 className="text-xl font-medium text-gray-800 dark:text-gray-200 mb-2">18.4 Cesión</h3>
              <p className="text-gray-600 dark:text-gray-300 mb-4">
                El Usuario no podrá ceder ni transferir estos Términos ni los derechos derivados de ellos sin el consentimiento previo y escrito de GuardyScan. GuardyScan podrá ceder estos Términos en el contexto de una fusión, adquisición, reorganización corporativa o venta de activos, notificando al Usuario.
              </p>
            </section>

            {/* 19 */}
            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">
                19. Contacto Legal
              </h2>
              <p className="text-gray-600 dark:text-gray-300 mb-4">
                Para notificaciones legales, reclamaciones o consultas sobre estos Términos y Condiciones:
              </p>
              <ul className="list-none text-gray-600 dark:text-gray-300 space-y-2">
                <li><strong>Email legal:</strong> legal@guardyscan.com</li>
                <li><strong>Email de seguridad:</strong> security@guardyscan.com</li>
                <li><strong>Dirección:</strong> Santiago, Chile</li>
              </ul>
              <p className="text-gray-600 dark:text-gray-300 mt-4">
                Las notificaciones legales deberán realizarse por escrito y se considerarán recibidas cuando sean entregadas en mano, o a los 3 días hábiles de enviadas por correo electrónico con acuse de recibo.
              </p>
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
