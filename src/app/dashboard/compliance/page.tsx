'use client'

import { useState, useEffect, useMemo, useCallback } from 'react'
import { useSession } from 'next-auth/react'
import {
  Shield, FileText, Search, CheckCircle2, XCircle, Clock, AlertTriangle,
  Upload, Link as LinkIcon, FileEdit, User, CalendarDays, X, Loader2,
  ChevronRight, Download, BarChart3, Filter, Eye, Lock, Globe,
  Server, Cpu, Users, Building2, BookOpen, Gavel, Activity,
  RefreshCw, ChevronDown, Info, Minus
} from 'lucide-react'
import {
  PieChart, Pie, Cell, Tooltip, ResponsiveContainer
} from 'recharts'

// ═══════════════════════════════════════════════════════════════════════
// CONTROLES ISO 27001:2022 — Anexo A
// ═══════════════════════════════════════════════════════════════════════

const ISO27001_CONTROLS = [
  { id: 'A.5.1',  name: 'Políticas de seguridad de la información', category: 'Organizacional', description: 'Directrices de gestión para la seguridad de la información', requirement: 'Este control exige que la organización defina, apruebe y mantenga una política de seguridad de la información formal.' },
  { id: 'A.5.2',  name: 'Roles y responsabilidades de seguridad', category: 'Organizacional', description: 'Asignación de responsabilidades de seguridad', requirement: 'La organización debe definir y asignar todos los roles y responsabilidades de seguridad de la información.' },
  { id: 'A.5.3',  name: 'Segregación de funciones', category: 'Organizacional', description: 'Separación de funciones incompatibles', requirement: 'Se deben separar funciones y áreas de responsabilidad conflictivas para reducir riesgos de uso indebido.' },
  { id: 'A.5.4',  name: 'Responsabilidades de gestión', category: 'Organizacional', description: 'Obligaciones de gestión en seguridad', requirement: 'La dirección debe exigir a empleados y contratistas aplicar la seguridad de acuerdo con las políticas establecidas.' },
  { id: 'A.5.5',  name: 'Contacto con autoridades', category: 'Organizacional', description: 'Relaciones con autoridades relevantes', requirement: 'Se deben mantener contactos apropiados con las autoridades pertinentes en materia de seguridad.' },
  { id: 'A.5.6',  name: 'Contacto con grupos de interés especial', category: 'Organizacional', description: 'Relaciones con comunidades de seguridad', requirement: 'Se deben mantener contactos con grupos de interés especial, foros de seguridad y asociaciones profesionales.' },
  { id: 'A.5.7',  name: 'Inteligencia de amenazas', category: 'Organizacional', description: 'Recopilación de información sobre amenazas', requirement: 'Se debe recopilar y analizar información sobre amenazas a la seguridad de la información.' },
  { id: 'A.5.8',  name: 'Seguridad en gestión de proyectos', category: 'Organizacional', description: 'Integración de seguridad en proyectos', requirement: 'La seguridad de la información debe integrarse en la gestión de proyectos, independientemente del tipo.' },
  { id: 'A.5.9',  name: 'Inventario de activos', category: 'Organizacional', description: 'Identificación y registro de activos', requirement: 'Se debe desarrollar y mantener un inventario de activos de información y otros activos asociados.' },
  { id: 'A.5.10', name: 'Uso aceptable de activos', category: 'Organizacional', description: 'Reglas para el uso de activos', requirement: 'Se deben identificar, documentar e implementar reglas para el uso aceptable de activos de información.' },
  { id: 'A.5.11', name: 'Devolución de activos', category: 'Organizacional', description: 'Proceso de devolución al finalizar empleo', requirement: 'El personal debe devolver todos los activos de la organización al finalizar su empleo o contrato.' },
  { id: 'A.5.12', name: 'Clasificación de la información', category: 'Organizacional', description: 'Niveles de clasificación de información', requirement: 'La información debe clasificarse según necesidades de confidencialidad, integridad y disponibilidad.' },
  { id: 'A.5.13', name: 'Etiquetado de información', category: 'Organizacional', description: 'Marcado según clasificación', requirement: 'Se debe desarrollar un procedimiento adecuado de etiquetado de información conforme al esquema de clasificación.' },
  { id: 'A.5.14', name: 'Transferencia de información', category: 'Organizacional', description: 'Reglas para transferir información', requirement: 'Deben existir reglas, procedimientos o acuerdos para la transferencia de información dentro y fuera de la organización.' },
  { id: 'A.5.15', name: 'Control de acceso', category: 'Organizacional', description: 'Política de control de acceso', requirement: 'Se deben establecer e implementar reglas para controlar el acceso físico y lógico a la información.' },
  { id: 'A.5.16', name: 'Gestión de identidades', category: 'Organizacional', description: 'Ciclo de vida de identidades', requirement: 'Se debe gestionar el ciclo de vida completo de las identidades, desde su creación hasta su eliminación.' },
  { id: 'A.5.17', name: 'Información de autenticación', category: 'Organizacional', description: 'Gestión de credenciales', requirement: 'Se debe controlar la asignación y gestión de la información de autenticación mediante un proceso formal.' },
  { id: 'A.5.18', name: 'Derechos de acceso', category: 'Organizacional', description: 'Aprovisionamiento de accesos', requirement: 'Los derechos de acceso deben otorgarse, revisarse, modificarse y eliminarse conforme a la política de acceso.' },
  { id: 'A.6.1',  name: 'Selección de personal', category: 'Personas', description: 'Verificación de antecedentes', requirement: 'Se deben realizar verificaciones de antecedentes de todos los candidatos antes de su contratación.' },
  { id: 'A.6.2',  name: 'Términos y condiciones de empleo', category: 'Personas', description: 'Acuerdos contractuales de seguridad', requirement: 'Los contratos laborales deben incluir las responsabilidades del empleado en materia de seguridad de la información.' },
  { id: 'A.6.3',  name: 'Concienciación y capacitación', category: 'Personas', description: 'Programas de formación en seguridad', requirement: 'Todo el personal debe recibir educación y capacitación apropiada en seguridad de la información.' },
  { id: 'A.6.4',  name: 'Proceso disciplinario', category: 'Personas', description: 'Sanciones por incumplimiento', requirement: 'Debe existir un proceso disciplinario formal para empleados que cometan violaciones de seguridad.' },
  { id: 'A.6.5',  name: 'Responsabilidades tras la terminación', category: 'Personas', description: 'Obligaciones post-empleo', requirement: 'Las responsabilidades y deberes de seguridad que siguen vigentes después de la terminación deben ser comunicados.' },
  { id: 'A.6.6',  name: 'Acuerdos de confidencialidad', category: 'Personas', description: 'NDAs y acuerdos de secreto', requirement: 'Los acuerdos de confidencialidad deben reflejar las necesidades de protección de la organización.' },
  { id: 'A.6.7',  name: 'Trabajo remoto', category: 'Personas', description: 'Políticas de teletrabajo', requirement: 'Se deben implementar medidas de seguridad para proteger la información accedida o procesada de forma remota.' },
  { id: 'A.6.8',  name: 'Reporte de eventos de seguridad', category: 'Personas', description: 'Canales para reportar incidentes', requirement: 'Se deben establecer mecanismos para que el personal reporte eventos de seguridad observados o sospechados.' },
  { id: 'A.7.1',  name: 'Perímetros de seguridad física', category: 'Físico', description: 'Protección de instalaciones', requirement: 'Se deben definir perímetros de seguridad para proteger áreas que contienen información sensible.' },
  { id: 'A.7.2',  name: 'Controles de acceso físico', category: 'Físico', description: 'Restricción de acceso a áreas', requirement: 'Las áreas seguras deben protegerse mediante controles de entrada apropiados.' },
  { id: 'A.7.3',  name: 'Seguridad de oficinas e instalaciones', category: 'Físico', description: 'Protección de espacios de trabajo', requirement: 'Se debe diseñar y aplicar seguridad física para oficinas, salas e instalaciones.' },
  { id: 'A.7.4',  name: 'Monitoreo de seguridad física', category: 'Físico', description: 'Vigilancia y detección', requirement: 'Se deben monitorear continuamente las instalaciones para detectar accesos físicos no autorizados.' },
  { id: 'A.7.5',  name: 'Protección contra amenazas ambientales', category: 'Físico', description: 'Desastres naturales y fallas', requirement: 'Se deben implementar medidas de protección contra amenazas físicas y ambientales como incendios e inundaciones.' },
  { id: 'A.7.6',  name: 'Trabajo en áreas seguras', category: 'Físico', description: 'Reglas para zonas sensibles', requirement: 'Se deben diseñar e implementar medidas de seguridad para trabajar en áreas seguras.' },
  { id: 'A.7.7',  name: 'Escritorio y pantalla limpia', category: 'Físico', description: 'Política de escritorio limpio', requirement: 'Se deben adoptar políticas de escritorio limpio para documentos y pantalla limpia para equipos.' },
  { id: 'A.7.8',  name: 'Ubicación y protección de equipos', category: 'Físico', description: 'Emplazamiento de equipos', requirement: 'Los equipos deben situarse y protegerse para reducir riesgos de amenazas ambientales y accesos no autorizados.' },
  { id: 'A.7.9',  name: 'Seguridad de activos fuera de las instalaciones', category: 'Físico', description: 'Protección de equipos externos', requirement: 'Se deben aplicar medidas de seguridad a los activos fuera de las instalaciones, considerando los riesgos adicionales.' },
  { id: 'A.7.10', name: 'Medios de almacenamiento', category: 'Físico', description: 'Gestión de medios físicos', requirement: 'Los medios de almacenamiento deben gestionarse durante todo su ciclo de vida de acuerdo con su clasificación.' },
  { id: 'A.7.11', name: 'Servicios de soporte', category: 'Físico', description: 'Mantenimiento de infraestructura', requirement: 'Las instalaciones deben contar con servicios de soporte como electricidad y telecomunicaciones protegidos.' },
  { id: 'A.7.12', name: 'Seguridad del cableado', category: 'Físico', description: 'Protección de cables', requirement: 'El cableado que transporta energía y datos debe protegerse contra interceptación y daños.' },
  { id: 'A.7.13', name: 'Mantenimiento de equipos', category: 'Físico', description: 'Mantenimiento seguro', requirement: 'Los equipos deben mantenerse correctamente para asegurar su disponibilidad e integridad continuas.' },
  { id: 'A.7.14', name: 'Eliminación segura de equipos', category: 'Físico', description: 'Disposición final de equipos', requirement: 'Los equipos que contienen medios de almacenamiento deben verificarse para asegurar la eliminación de datos sensibles.' },
  { id: 'A.8.1',  name: 'Dispositivos de punto final', category: 'Tecnológico', description: 'Protección de endpoints', requirement: 'La información almacenada, procesada o accesible a través de dispositivos de punto final debe protegerse.' },
  { id: 'A.8.2',  name: 'Derechos de acceso privilegiados', category: 'Tecnológico', description: 'Gestión de cuentas privilegiadas', requirement: 'Se debe restringir y gestionar la asignación y uso de derechos de acceso privilegiados.' },
  { id: 'A.8.3',  name: 'Restricción de acceso a la información', category: 'Tecnológico', description: 'Control de acceso lógico', requirement: 'El acceso a la información y funciones de aplicación debe restringirse conforme a la política de control de acceso.' },
  { id: 'A.8.4',  name: 'Acceso a código fuente', category: 'Tecnológico', description: 'Protección del código', requirement: 'El acceso al código fuente, herramientas de desarrollo y bibliotecas debe controlarse adecuadamente.' },
  { id: 'A.8.5',  name: 'Autenticación segura', category: 'Tecnológico', description: 'MFA y métodos de autenticación', requirement: 'Se deben implementar tecnologías y procedimientos de autenticación segura según la política de control de acceso.' },
  { id: 'A.8.6',  name: 'Gestión de capacidad', category: 'Tecnológico', description: 'Monitoreo de recursos', requirement: 'El uso de recursos debe monitorearse y ajustarse a las necesidades de capacidad actuales y proyectadas.' },
  { id: 'A.8.7',  name: 'Protección contra malware', category: 'Tecnológico', description: 'Antivirus y antimalware', requirement: 'Se deben implementar controles de detección, prevención y recuperación contra malware junto con concienciación.' },
  { id: 'A.8.8',  name: 'Gestión de vulnerabilidades técnicas', category: 'Tecnológico', description: 'Parcheo y actualizaciones', requirement: 'Se debe obtener información sobre vulnerabilidades técnicas, evaluar la exposición y tomar medidas apropiadas.' },
  { id: 'A.8.9',  name: 'Gestión de configuración', category: 'Tecnológico', description: 'Configuraciones seguras', requirement: 'Se deben establecer, documentar, implementar, monitorear y revisar las configuraciones de seguridad.' },
  { id: 'A.8.10', name: 'Eliminación de información', category: 'Tecnológico', description: 'Borrado seguro de datos', requirement: 'La información almacenada en sistemas, dispositivos o medios debe eliminarse cuando ya no sea necesaria.' },
  { id: 'A.8.11', name: 'Enmascaramiento de datos', category: 'Tecnológico', description: 'Anonimización y pseudonimización', requirement: 'El enmascaramiento de datos debe usarse conforme a la política de control de acceso y requisitos del negocio.' },
  { id: 'A.8.12', name: 'Prevención de fuga de datos', category: 'Tecnológico', description: 'DLP - Data Loss Prevention', requirement: 'Se deben aplicar medidas de prevención de fuga de datos a sistemas, redes y dispositivos que procesan información sensible.' },
  { id: 'A.8.13', name: 'Respaldo de información', category: 'Tecnológico', description: 'Copias de seguridad', requirement: 'Se deben mantener y probar regularmente copias de respaldo de información, software y configuraciones del sistema.' },
  { id: 'A.8.14', name: 'Redundancia de procesamiento', category: 'Tecnológico', description: 'Alta disponibilidad', requirement: 'Las instalaciones de procesamiento deben implementarse con redundancia suficiente para cumplir requisitos de disponibilidad.' },
  { id: 'A.8.15', name: 'Registro de eventos', category: 'Tecnológico', description: 'Logs y auditoría', requirement: 'Se deben producir, almacenar, proteger y analizar registros de actividades, excepciones y eventos de seguridad.' },
  { id: 'A.8.16', name: 'Actividades de monitoreo', category: 'Tecnológico', description: 'Monitoreo continuo', requirement: 'Las redes, sistemas y aplicaciones deben monitorearse para detectar comportamientos anómalos.' },
  { id: 'A.8.17', name: 'Sincronización de relojes', category: 'Tecnológico', description: 'NTP y sincronización horaria', requirement: 'Los relojes de todos los sistemas de procesamiento de información deben sincronizarse con fuentes de tiempo aprobadas.' },
  { id: 'A.8.18', name: 'Uso de utilidades privilegiadas', category: 'Tecnológico', description: 'Control de herramientas admin', requirement: 'El uso de programas de utilidad capaces de anular controles del sistema debe restringirse y controlarse.' },
  { id: 'A.8.19', name: 'Instalación de software', category: 'Tecnológico', description: 'Control de instalaciones', requirement: 'Se deben implementar procedimientos y medidas para gestionar de forma segura la instalación de software.' },
  { id: 'A.8.20', name: 'Seguridad de redes', category: 'Tecnológico', description: 'Firewall y segmentación', requirement: 'Las redes y dispositivos de red deben protegerse, gestionarse y controlarse para proteger la información.' },
  { id: 'A.8.21', name: 'Seguridad de servicios de red', category: 'Tecnológico', description: 'Protección de servicios', requirement: 'Se deben identificar, implementar y monitorear mecanismos de seguridad y niveles de servicio de red.' },
  { id: 'A.8.22', name: 'Segregación de redes', category: 'Tecnológico', description: 'VLANs y segmentación', requirement: 'Los grupos de servicios de información, usuarios y sistemas deben segregarse en la red de la organización.' },
  { id: 'A.8.23', name: 'Filtrado web', category: 'Tecnológico', description: 'Control de navegación', requirement: 'Se debe gestionar el acceso a sitios web externos para reducir la exposición a contenido malicioso.' },
  { id: 'A.8.24', name: 'Uso de criptografía', category: 'Tecnológico', description: 'Cifrado de datos', requirement: 'Se deben definir e implementar reglas para el uso efectivo de criptografía, incluyendo gestión de claves.' },
  { id: 'A.8.25', name: 'Ciclo de vida de desarrollo seguro', category: 'Tecnológico', description: 'SDLC seguro', requirement: 'Se deben establecer reglas para el desarrollo seguro de software y sistemas aplicados a todos los desarrollos.' },
  { id: 'A.8.26', name: 'Requisitos de seguridad de aplicaciones', category: 'Tecnológico', description: 'Requerimientos de seguridad', requirement: 'Se deben identificar, especificar y aprobar requisitos de seguridad de la información para desarrollo o adquisición.' },
  { id: 'A.8.27', name: 'Arquitectura de sistemas seguros', category: 'Tecnológico', description: 'Diseño seguro', requirement: 'Se deben establecer principios de ingeniería de sistemas seguros, documentarlos y aplicarlos a todas las actividades.' },
  { id: 'A.8.28', name: 'Codificación segura', category: 'Tecnológico', description: 'Prácticas de código seguro', requirement: 'Se deben aplicar principios de codificación segura al desarrollo de software.' },
  { id: 'A.8.29', name: 'Pruebas de seguridad', category: 'Tecnológico', description: 'Testing de seguridad', requirement: 'Se deben definir y ejecutar procesos de pruebas de seguridad en el ciclo de desarrollo.' },
  { id: 'A.8.30', name: 'Desarrollo externalizado', category: 'Tecnológico', description: 'Outsourcing de desarrollo', requirement: 'La organización debe dirigir, monitorear y revisar las actividades relacionadas con desarrollo externalizado.' },
  { id: 'A.8.31', name: 'Separación de entornos', category: 'Tecnológico', description: 'Dev, test, producción', requirement: 'Los entornos de desarrollo, prueba y producción deben separarse y protegerse.' },
  { id: 'A.8.32', name: 'Gestión de cambios', category: 'Tecnológico', description: 'Control de cambios', requirement: 'Los cambios en las instalaciones de procesamiento y sistemas deben estar sujetos a procedimientos de gestión de cambios.' },
  { id: 'A.8.33', name: 'Información de prueba', category: 'Tecnológico', description: 'Datos de prueba seguros', requirement: 'La información de prueba debe seleccionarse, protegerse y gestionarse adecuadamente.' },
  { id: 'A.8.34', name: 'Protección en pruebas de auditoría', category: 'Tecnológico', description: 'Auditorías sin impacto', requirement: 'Las auditorías y pruebas sobre sistemas operativos deben planificarse para minimizar el impacto en el negocio.' },
]

// ═══════════════════════════════════════════════════════════════════════
// CONTROLES LEY 21.663 — Ley Marco de Ciberseguridad (Chile)
// ═══════════════════════════════════════════════════════════════════════

const LEY21663_CONTROLS = [
  { id: 'L1',  name: 'Política Nacional de Ciberseguridad', category: 'Marco Legal', description: 'Implementación de política nacional', requirement: 'La organización debe alinear sus prácticas con la Política Nacional de Ciberseguridad definida por el Estado.' },
  { id: 'L2',  name: 'Agencia Nacional de Ciberseguridad', category: 'Marco Legal', description: 'Coordinación con ANCI', requirement: 'Se debe coordinar con la Agencia Nacional de Ciberseguridad (ANCI) en materias de ciberseguridad aplicables.' },
  { id: 'L3',  name: 'Identificación de Infraestructura Crítica', category: 'Infraestructura Crítica', description: 'Identificación de activos y servicios críticos', requirement: 'Se deben identificar y clasificar los activos de infraestructura crítica de la información de la organización.' },
  { id: 'L4',  name: 'Protección de Infraestructura Crítica', category: 'Infraestructura Crítica', description: 'Medidas de protección', requirement: 'Se deben implementar medidas específicas para proteger la infraestructura crítica de la información.' },
  { id: 'L5',  name: 'Reporte de Incidentes', category: 'Gestión de Incidentes', description: 'Obligación de reportar incidentes significativos', requirement: 'Se deben reportar los incidentes de ciberseguridad significativos conforme a los mecanismos establecidos por la ley.' },
  { id: 'L6',  name: 'Plazos de Notificación', category: 'Gestión de Incidentes', description: 'Cumplimiento de plazos (24-72 horas)', requirement: 'Los incidentes deben notificarse dentro de los plazos legales: 24 horas para la alerta preliminar y 72 horas para el informe completo.' },
  { id: 'L7',  name: 'CSIRT — Equipo de Respuesta', category: 'Gestión de Incidentes', description: 'Equipo de respuesta a incidentes', requirement: 'Se debe establecer o contratar un equipo de respuesta a incidentes de seguridad informática (CSIRT).' },
  { id: 'L8',  name: 'Protección de Datos Personales', category: 'Protección de Datos', description: 'Cumplimiento Ley 19.628', requirement: 'Se debe cumplir con la Ley 19.628 sobre protección de datos personales en todos los procesos.' },
  { id: 'L9',  name: 'Gestión de Riesgos de Ciberseguridad', category: 'Gestión de Riesgos', description: 'Evaluación y gestión de riesgos', requirement: 'Se debe implementar un proceso formal de evaluación y gestión de riesgos de ciberseguridad.' },
  { id: 'L10', name: 'Plan de Continuidad de Negocio', category: 'Continuidad', description: 'Plan de continuidad ante incidentes', requirement: 'Se debe desarrollar, mantener y probar un plan de continuidad de negocio que considere escenarios de ciberseguridad.' },
  { id: 'L11', name: 'Plan de Recuperación de Desastres', category: 'Continuidad', description: 'Procedimientos de recuperación', requirement: 'Se deben establecer procedimientos documentados de recuperación ante desastres de ciberseguridad.' },
  { id: 'L12', name: 'Capacitación en Ciberseguridad', category: 'Capacitación', description: 'Programas de formación obligatorios', requirement: 'Se deben implementar programas regulares de capacitación y concientización en ciberseguridad para todo el personal.' },
  { id: 'L13', name: 'Auditorías de Seguridad', category: 'Auditoría', description: 'Auditorías periódicas', requirement: 'Se deben realizar auditorías periódicas de ciberseguridad por auditores internos o externos independientes.' },
  { id: 'L14', name: 'Registro de Activos de Información', category: 'Gestión de Activos', description: 'Inventario de activos actualizado', requirement: 'Se debe mantener un inventario actualizado de todos los activos de información y tecnología de la organización.' },
  { id: 'L15', name: 'Seguridad en Cadena de Suministro', category: 'Terceros', description: 'Evaluación de proveedores', requirement: 'Se debe evaluar y gestionar el riesgo de ciberseguridad de proveedores y terceros de la cadena de suministro.' },
  { id: 'L16', name: 'Contratos con Cláusulas de Seguridad', category: 'Terceros', description: 'Acuerdos con requisitos de seguridad', requirement: 'Los contratos con proveedores deben incluir cláusulas específicas de ciberseguridad y protección de datos.' },
  { id: 'L17', name: 'Seguridad en Servicios Cloud', category: 'Tecnológico', description: 'Controles para servicios en la nube', requirement: 'Se deben implementar controles de seguridad específicos para los servicios en la nube utilizados por la organización.' },
  { id: 'L18', name: 'Cifrado de Información Sensible', category: 'Tecnológico', description: 'Protección criptográfica obligatoria', requirement: 'La información sensible debe protegerse mediante mecanismos criptográficos en reposo y en tránsito.' },
  { id: 'L19', name: 'Control de Acceso y Autenticación', category: 'Tecnológico', description: 'Gestión de identidades y accesos', requirement: 'Se deben implementar controles robustos de autenticación y autorización, incluyendo MFA cuando corresponda.' },
  { id: 'L20', name: 'Monitoreo y Detección de Amenazas', category: 'Tecnológico', description: 'Detección continua', requirement: 'Se deben implementar sistemas de monitoreo y detección continua de amenazas y eventos de seguridad.' },
  { id: 'L21', name: 'Actualización y Parcheo', category: 'Tecnológico', description: 'Gestión de vulnerabilidades', requirement: 'Se deben mantener los sistemas actualizados y aplicar parches de seguridad de manera oportuna.' },
  { id: 'L22', name: 'Respaldo y Recuperación de Datos', category: 'Tecnológico', description: 'Backups seguros y probados', requirement: 'Se deben mantener copias de respaldo seguras y realizar pruebas periódicas de restauración de datos.' },
  { id: 'L23', name: 'Cumplimiento Normativo', category: 'Cumplimiento', description: 'Adhesión a normas y regulaciones', requirement: 'La organización debe demostrar el cumplimiento de todas las normas y regulaciones de ciberseguridad aplicables.' },
  { id: 'L24', name: 'Responsabilidad del Directorio', category: 'Gobernanza', description: 'Supervisión por directorio', requirement: 'El directorio de la organización debe asumir responsabilidad sobre la supervisión de la ciberseguridad.' },
  { id: 'L25', name: 'Oficial de Seguridad de la Información', category: 'Gobernanza', description: 'Designación de CISO', requirement: 'Se debe designar un Oficial de Seguridad de la Información (CISO) o responsable equivalente.' },
  { id: 'L26', name: 'Inversión en Ciberseguridad', category: 'Gobernanza', description: 'Presupuesto para seguridad', requirement: 'Se debe asignar presupuesto adecuado y documentado para las iniciativas de ciberseguridad.' },
  { id: 'L27', name: 'Colaboración Público-Privada', category: 'Coordinación', description: 'Iniciativas sectoriales', requirement: 'La organización debe participar en iniciativas de colaboración público-privada en ciberseguridad del sector.' },
  { id: 'L28', name: 'Ejercicios de Simulación', category: 'Capacitación', description: 'Simulacros de respuesta', requirement: 'Se deben realizar ejercicios de simulación periódicos para probar la capacidad de respuesta ante incidentes.' },
  { id: 'L29', name: 'Sanciones por Incumplimiento', category: 'Cumplimiento', description: 'Penalidades aplicables', requirement: 'La organización debe conocer las sanciones por incumplimiento y mantener evidencia de su gestión de riesgos.' },
  { id: 'L30', name: 'Documentación y Evidencias', category: 'Cumplimiento', description: 'Registro de cumplimiento', requirement: 'Se debe mantener documentación completa y evidencias de cumplimiento de todos los requisitos legales.' },
]

// ═══════════════════════════════════════════════════════════════════════
// TYPES & HELPERS
// ═══════════════════════════════════════════════════════════════════════

type ControlStatus = 'NOT_STARTED' | 'IN_PROGRESS' | 'IMPLEMENTED' | 'NOT_APPLICABLE'
type DocType = 'upload' | 'link' | 'manual' | null

interface ControlData {
  implementationStatus: ControlStatus
  docType: DocType
  evidence: string
  notes: string
  responsible: string
  targetDate: string
  fileName: string
  lastReviewed: string | null
}

const STATUS_CONFIG: Record<ControlStatus, { label: string; icon: any; color: string; bg: string; ring: string; dot: string }> = {
  NOT_STARTED:    { label: 'No iniciado',  icon: XCircle,      color: 'text-gray-500',   bg: 'bg-gray-50 dark:bg-gray-800',     ring: 'ring-gray-300 dark:ring-gray-600',     dot: 'bg-gray-400' },
  IN_PROGRESS:    { label: 'En progreso',  icon: Clock,        color: 'text-yellow-600', bg: 'bg-yellow-50 dark:bg-yellow-900/15', ring: 'ring-yellow-400 dark:ring-yellow-600', dot: 'bg-yellow-500' },
  IMPLEMENTED:    { label: 'Implementado', icon: CheckCircle2, color: 'text-green-600',  bg: 'bg-green-50 dark:bg-green-900/15',  ring: 'ring-green-400 dark:ring-green-600',   dot: 'bg-green-500' },
  NOT_APPLICABLE: { label: 'No aplica',    icon: Minus,        color: 'text-blue-500',   bg: 'bg-blue-50 dark:bg-blue-900/15',    ring: 'ring-blue-300 dark:ring-blue-500',     dot: 'bg-blue-400' },
}

const CATEGORY_ICONS: Record<string, any> = {
  'Organizacional': Building2, 'Personas': Users, 'Físico': Lock, 'Tecnológico': Cpu,
  'Marco Legal': Gavel, 'Infraestructura Crítica': Server, 'Gestión de Incidentes': AlertTriangle,
  'Protección de Datos': Shield, 'Gestión de Riesgos': Activity, 'Continuidad': RefreshCw,
  'Capacitación': BookOpen, 'Auditoría': Eye, 'Gestión de Activos': Server,
  'Terceros': Globe, 'Tecnológico_ley': Cpu, 'Cumplimiento': FileText, 'Gobernanza': BarChart3, 'Coordinación': Users,
}

const CATEGORY_COLORS: Record<string, string> = {
  'Organizacional': 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300',
  'Personas': 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300',
  'Físico': 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-300',
  'Tecnológico': 'bg-cyan-100 text-cyan-700 dark:bg-cyan-900/30 dark:text-cyan-300',
  'Marco Legal': 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-300',
  'Infraestructura Crítica': 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300',
  'Gestión de Incidentes': 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300',
  'Protección de Datos': 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300',
  'Gestión de Riesgos': 'bg-pink-100 text-pink-700 dark:bg-pink-900/30 dark:text-pink-300',
  'Continuidad': 'bg-teal-100 text-teal-700 dark:bg-teal-900/30 dark:text-teal-300',
  'Capacitación': 'bg-violet-100 text-violet-700 dark:bg-violet-900/30 dark:text-violet-300',
  'Auditoría': 'bg-slate-100 text-slate-700 dark:bg-slate-900/30 dark:text-slate-300',
  'Gestión de Activos': 'bg-lime-100 text-lime-700 dark:bg-lime-900/30 dark:text-lime-300',
  'Terceros': 'bg-sky-100 text-sky-700 dark:bg-sky-900/30 dark:text-sky-300',
  'Cumplimiento': 'bg-fuchsia-100 text-fuchsia-700 dark:bg-fuchsia-900/30 dark:text-fuchsia-300',
  'Gobernanza': 'bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-300',
  'Coordinación': 'bg-stone-100 text-stone-700 dark:bg-stone-900/30 dark:text-stone-300',
}

function fmtDate(d: string | null) {
  if (!d) return 'N/A'
  return new Date(d).toLocaleDateString('es-CL', { day: '2-digit', month: '2-digit', year: 'numeric' })
}

function exportToCSV(controls: any[], controlStates: Record<string, ControlData>, frameworkName: string) {
  const headers = ['ID', 'Control', 'Categoría', 'Descripción', 'Estado', 'Responsable', 'Fecha Objetivo', 'Evidencia', 'Notas', 'Última Revisión']
  const rows = controls.map(c => {
    const st = controlStates[c.id]
    return [
      c.id,
      c.name,
      c.category,
      c.description,
      st ? STATUS_CONFIG[st.implementationStatus].label : 'No iniciado',
      st?.responsible || '',
      st?.targetDate || '',
      st?.evidence || '',
      (st?.notes || '').replace(/"/g, '""'),
      st?.lastReviewed || '',
    ]
  })
  const csv = [headers.join(','), ...rows.map(r => r.map(cell => `"${cell}"`).join(','))].join('\n')
  const blob = new Blob(['\ufeff' + csv], { type: 'text/csv;charset=utf-8;' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `cumplimiento_${frameworkName.toLowerCase().replace(/\s+/g, '_')}_${new Date().toISOString().split('T')[0]}.csv`
  a.click()
  URL.revokeObjectURL(url)
}

// ═══════════════════════════════════════════════════════════════════════
// MAIN COMPONENT
// ═══════════════════════════════════════════════════════════════════════

export default function CompliancePage() {
  const { data: session } = useSession()
  const [activeFramework, setActiveFramework] = useState<'ISO27001' | 'LEY21663'>('ISO27001')
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('ALL')
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [exporting, setExporting] = useState(false)

  // Control states — keyed by framework+controlId
  const [controlStates, setControlStates] = useState<Record<string, ControlData>>({})

  // Modal
  const [showModal, setShowModal] = useState(false)
  const [editingControl, setEditingControl] = useState<typeof ISO27001_CONTROLS[0] | null>(null)
  const [modalForm, setModalForm] = useState<ControlData>({
    implementationStatus: 'NOT_STARTED',
    docType: null,
    evidence: '',
    notes: '',
    responsible: '',
    targetDate: '',
    fileName: '',
    lastReviewed: null,
  })

  // ── Load from API ──────────────────────────────────────────
  const loadControls = useCallback(async () => {
    try {
      setLoading(true)
      const res = await fetch(`/api/compliance?framework=${activeFramework}`)
      const data = await res.json()
      if (Array.isArray(data)) {
        const newStates: Record<string, ControlData> = { ...controlStates }
        data.forEach((saved: any) => {
          newStates[saved.controlId] = {
            implementationStatus: saved.implementationStatus || (saved.implemented ? 'IMPLEMENTED' : 'NOT_STARTED'),
            docType: saved.docType || null,
            evidence: saved.evidence || '',
            notes: saved.notes || '',
            responsible: saved.responsible || '',
            targetDate: saved.targetDate || '',
            fileName: saved.fileName || '',
            lastReviewed: saved.lastReviewed || null,
          }
        })
        setControlStates(newStates)
      }
    } catch (e) {
      console.error('Error loading controls:', e)
    } finally {
      setLoading(false)
    }
  }, [activeFramework])

  useEffect(() => { loadControls() }, [loadControls])

  // ── Template controls + computed ──────────────────────────
  const templateControls = activeFramework === 'ISO27001' ? ISO27001_CONTROLS : LEY21663_CONTROLS
  const categories = useMemo(() => ['ALL', ...Array.from(new Set(templateControls.map(c => c.category)))], [templateControls])

  const filteredControls = useMemo(() =>
    templateControls.filter(c =>
      (selectedCategory === 'ALL' || c.category === selectedCategory) &&
      (c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
       c.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
       c.description.toLowerCase().includes(searchTerm.toLowerCase()))
    ), [templateControls, selectedCategory, searchTerm])

  // Stats
  const stats = useMemo(() => {
    const total = templateControls.length
    let implemented = 0, inProgress = 0, notApplicable = 0
    templateControls.forEach(c => {
      const st = controlStates[c.id]
      if (st?.implementationStatus === 'IMPLEMENTED') implemented++
      else if (st?.implementationStatus === 'IN_PROGRESS') inProgress++
      else if (st?.implementationStatus === 'NOT_APPLICABLE') notApplicable++
    })
    const pending = total - implemented - notApplicable
    const applicable = total - notApplicable
    const percentage = applicable > 0 ? Math.round((implemented / applicable) * 100) : 0
    return { total, implemented, inProgress, pending, notApplicable, percentage }
  }, [templateControls, controlStates])

  // Category breakdown for chart
  const categoryChartData = useMemo(() =>
    categories.filter(c => c !== 'ALL').map(cat => {
      const catControls = templateControls.filter(c => c.category === cat)
      const impl = catControls.filter(c => controlStates[c.id]?.implementationStatus === 'IMPLEMENTED').length
      return { name: cat.substring(0, 14), total: catControls.length, implemented: impl, fill: impl === catControls.length ? '#22c55e' : impl > 0 ? '#eab308' : '#e5e7eb' }
    }), [categories, templateControls, controlStates])

  const statusChartData = [
    { name: 'Implementado', value: stats.implemented, fill: '#22c55e' },
    { name: 'En progreso', value: stats.inProgress, fill: '#eab308' },
    { name: 'No iniciado', value: stats.total - stats.implemented - stats.inProgress - stats.notApplicable, fill: '#e5e7eb' },
    { name: 'No aplica', value: stats.notApplicable, fill: '#93c5fd' },
  ]

  // ── Modal actions ──────────────────────────────────────────
  const openModal = (control: typeof ISO27001_CONTROLS[0]) => {
    const existing = controlStates[control.id]
    setEditingControl(control)
    setModalForm(existing || {
      implementationStatus: 'NOT_STARTED', docType: null, evidence: '', notes: '',
      responsible: '', targetDate: '', fileName: '', lastReviewed: null,
    })
    setShowModal(true)
  }

  const handleSave = async () => {
    if (!editingControl) return
    setSaving(true)

    const newStates = { ...controlStates }
    newStates[editingControl.id] = {
      ...modalForm,
      lastReviewed: new Date().toISOString().split('T')[0],
    }
    setControlStates(newStates)

    // Try saving to API
    try {
      await fetch(`/api/compliance/${editingControl.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          framework: activeFramework,
          frameworkId: activeFramework,
          controlName: editingControl.name,
          title: editingControl.name,
          description: editingControl.description,
          category: editingControl.category,
          domain: editingControl.category,
          implementationStatus: modalForm.implementationStatus,
          implemented: modalForm.implementationStatus === 'IMPLEMENTED',
          evidence: modalForm.evidence,
          notes: modalForm.notes,
          responsible: modalForm.responsible,
          targetDate: modalForm.targetDate,
          docType: modalForm.docType,
          lastReviewed: new Date().toISOString(),
        }),
      })
    } catch (e) {
      console.error('Error saving to API:', e)
    }

    setSaving(false)
    setShowModal(false)
    setEditingControl(null)
  }

  const handleExport = () => {
    setExporting(true)
    setTimeout(() => {
      exportToCSV(templateControls, controlStates, activeFramework === 'ISO27001' ? 'ISO_27001' : 'Ley_21663')
      setExporting(false)
    }, 400)
  }

  // ═══════════════════════════════════════════════════════════
  // RENDER
  // ═══════════════════════════════════════════════════════════
  return (
    <div className="space-y-6">

      {/* ════════ HEADER ════════ */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-3">
            <Shield className="h-8 w-8 text-blue-600" />
            Cumplimiento Normativo
          </h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1">
            Gestión de cumplimiento y evidencias · ISO 27001:2022 · Ley 21.663 (Chile)
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <button onClick={handleExport} disabled={exporting}
            className="flex items-center gap-2 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors text-sm font-medium disabled:opacity-50">
            {exporting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Download className="h-4 w-4" />}
            Exportar
          </button>
        </div>
      </div>

      {/* ════════ FRAMEWORK TABS ════════ */}
      <div className="flex gap-3">
        <button onClick={() => { setActiveFramework('ISO27001'); setSelectedCategory('ALL') }}
          className={`flex-1 flex items-center justify-center gap-2 px-5 py-3.5 rounded-xl font-semibold text-sm transition-all ${
            activeFramework === 'ISO27001'
              ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/20'
              : 'bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-300 hover:border-blue-300'
          }`}>
          <Shield className="h-4 w-4" /> ISO 27001:2022
        </button>
        <button onClick={() => { setActiveFramework('LEY21663'); setSelectedCategory('ALL') }}
          className={`flex-1 flex items-center justify-center gap-2 px-5 py-3.5 rounded-xl font-semibold text-sm transition-all ${
            activeFramework === 'LEY21663'
              ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/20'
              : 'bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-300 hover:border-blue-300'
          }`}>
          <Gavel className="h-4 w-4" /> Ley 21.663 (Chile)
        </button>
      </div>

      {/* ════════ STATS ════════ */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'Controles Totales', value: stats.total, color: 'text-gray-900 dark:text-white', icon: Shield, iconColor: 'text-blue-500', bg: 'bg-blue-50 dark:bg-blue-900/20' },
          { label: 'Implementados', value: stats.implemented, color: 'text-green-600', icon: CheckCircle2, iconColor: 'text-green-500', bg: 'bg-green-50 dark:bg-green-900/20' },
          { label: 'Pendientes', value: stats.pending, color: 'text-orange-600', icon: Clock, iconColor: 'text-orange-500', bg: 'bg-orange-50 dark:bg-orange-900/20' },
          { label: 'Completado', value: `${stats.percentage}%`, color: 'text-blue-600', icon: BarChart3, iconColor: 'text-blue-500', bg: 'bg-indigo-50 dark:bg-indigo-900/20' },
        ].map(s => (
          <div key={s.label} className={`${s.bg} rounded-xl p-5 border border-gray-200 dark:border-gray-700`}>
            <div className="flex items-center justify-between mb-2">
              <s.icon className={`h-5 w-5 ${s.iconColor}`} />
            </div>
            <p className={`text-3xl font-bold ${s.color}`}>{s.value}</p>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">{s.label}</p>
          </div>
        ))}
      </div>

      {/* ════════ PROGRESS BAR ════════ */}
      <div className="bg-white dark:bg-gray-800 rounded-xl p-5 shadow-lg border border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-between mb-3">
          <span className="text-sm font-semibold text-gray-700 dark:text-gray-300">Progreso de Implementación</span>
          <span className="text-sm font-bold text-blue-600">{stats.percentage}%</span>
        </div>
        <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3.5 overflow-hidden">
          <div className="h-3.5 rounded-full transition-all duration-700 ease-out bg-gradient-to-r from-blue-500 to-blue-600"
            style={{ width: `${stats.percentage}%` }} />
        </div>
        <div className="flex items-center gap-6 mt-3 text-xs text-gray-500 dark:text-gray-400">
          <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-green-500" /> Implementado: {stats.implemented}</span>
          <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-yellow-500" /> En progreso: {stats.inProgress}</span>
          <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-gray-300" /> No iniciado: {stats.total - stats.implemented - stats.inProgress - stats.notApplicable}</span>
          <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-blue-400" /> No aplica: {stats.notApplicable}</span>
        </div>
      </div>

      {/* ════════ CHARTS ROW ════════ */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Status donut */}
        <div className="bg-white dark:bg-gray-800 rounded-xl p-5 shadow-lg border border-gray-200 dark:border-gray-700">
          <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3 flex items-center gap-2">
            <BarChart3 className="h-4 w-4 text-blue-500" /> Estado General de Controles
          </h3>
          <div className="flex items-center gap-6">
            <ResponsiveContainer width="45%" height={160}>
              <PieChart>
                <Pie data={statusChartData.filter(d => d.value > 0)} cx="50%" cy="50%" innerRadius={35} outerRadius={65} dataKey="value" strokeWidth={2}>
                  {statusChartData.filter(d => d.value > 0).map((e, i) => <Cell key={i} fill={e.fill} />)}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
            <div className="flex-1 space-y-2">
              {statusChartData.map(d => (
                <div key={d.name} className="flex items-center justify-between text-sm">
                  <span className="flex items-center gap-2">
                    <span className="w-3 h-3 rounded-sm" style={{ backgroundColor: d.fill }} />
                    {d.name}
                  </span>
                  <span className="font-bold text-gray-900 dark:text-white">{d.value}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Category progress */}
        <div className="bg-white dark:bg-gray-800 rounded-xl p-5 shadow-lg border border-gray-200 dark:border-gray-700">
          <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3 flex items-center gap-2">
            <Filter className="h-4 w-4 text-purple-500" /> Progreso por Categoría
          </h3>
          <div className="space-y-2.5 max-h-[160px] overflow-y-auto pr-1">
            {categoryChartData.map(cat => {
              const pct = cat.total > 0 ? Math.round((cat.implemented / cat.total) * 100) : 0
              return (
                <div key={cat.name}>
                  <div className="flex items-center justify-between text-xs mb-1">
                    <span className="font-medium text-gray-700 dark:text-gray-300">{cat.name}</span>
                    <span className="text-gray-500">{cat.implemented}/{cat.total} ({pct}%)</span>
                  </div>
                  <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-1.5">
                    <div className="h-1.5 rounded-full transition-all duration-500"
                      style={{ width: `${pct}%`, backgroundColor: cat.fill }} />
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </div>

      {/* ════════ SEARCH + CATEGORY FILTERS ════════ */}
      <div className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-lg border border-gray-200 dark:border-gray-700">
        <div className="flex flex-col gap-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input type="text" placeholder="Buscar controles..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent" />
          </div>
          <div className="flex gap-2 flex-wrap">
            {categories.map(cat => (
              <button key={cat} onClick={() => setSelectedCategory(cat)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                  selectedCategory === cat
                    ? 'bg-blue-600 text-white shadow-sm'
                    : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                }`}>
                {cat === 'ALL' ? 'ALL' : cat}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* ════════ CONTROLS LIST ════════ */}
      <div className="space-y-2.5">
        {loading ? (
          <div className="bg-white dark:bg-gray-800 rounded-xl p-12 text-center border border-gray-200 dark:border-gray-700">
            <Loader2 className="h-8 w-8 animate-spin mx-auto text-blue-500 mb-3" />
            <p className="text-gray-500">Cargando controles...</p>
          </div>
        ) : filteredControls.length === 0 ? (
          <div className="bg-white dark:bg-gray-800 rounded-xl p-12 text-center border border-gray-200 dark:border-gray-700">
            <Search className="h-10 w-10 mx-auto text-gray-300 dark:text-gray-600 mb-3" />
            <h3 className="text-lg font-medium mb-1">No se encontraron controles</h3>
            <p className="text-gray-500 text-sm">Ajusta la búsqueda o los filtros de categoría</p>
          </div>
        ) : filteredControls.map(control => {
          const st = controlStates[control.id]
          const status = st?.implementationStatus || 'NOT_STARTED'
          const statusCfg = STATUS_CONFIG[status]
          const StatusIcon = statusCfg.icon
          const catColor = CATEGORY_COLORS[control.category] || 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300'
          const hasEvidence = !!(st?.evidence)

          return (
            <div key={control.id}
              className="bg-white dark:bg-gray-800 rounded-xl p-5 shadow-sm border border-gray-200 dark:border-gray-700 hover:shadow-md transition-shadow">
              <div className="flex items-start gap-4">
                {/* Status Icon */}
                <button onClick={() => openModal(control)} className="mt-0.5 flex-shrink-0 transition-transform hover:scale-110" title={statusCfg.label}>
                  <StatusIcon className={`h-6 w-6 ${statusCfg.color}`} />
                </button>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap mb-1.5">
                    <span className="text-xs font-bold text-gray-900 dark:text-white bg-gray-100 dark:bg-gray-700 px-2 py-0.5 rounded-md">{control.id}</span>
                    <span className={`px-2.5 py-0.5 rounded-full text-[11px] font-semibold ${catColor}`}>{control.category}</span>
                    {st?.lastReviewed && (
                      <span className="text-[11px] text-gray-400 flex items-center gap-1">
                        <Clock className="h-3 w-3" /> Revisado: {fmtDate(st.lastReviewed)}
                      </span>
                    )}
                  </div>

                  <h3 className="font-semibold text-gray-900 dark:text-white text-[15px] mb-0.5">{control.name}</h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400 mb-3">{control.description}</p>

                  {/* Evidence & status indicators */}
                  {st && (status !== 'NOT_STARTED' || hasEvidence) && (
                    <div className="flex flex-wrap gap-2 mb-3">
                      {status !== 'NOT_STARTED' && (
                        <span className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold ${statusCfg.bg} ${statusCfg.color} ring-1 ${statusCfg.ring}`}>
                          {statusCfg.label}
                        </span>
                      )}
                      {hasEvidence && (
                        <span className="text-[11px] px-2 py-1 rounded-lg bg-blue-50 text-blue-600 dark:bg-blue-900/20 dark:text-blue-400 flex items-center gap-1">
                          {st.docType === 'link' ? <LinkIcon className="h-3 w-3" /> : st.docType === 'upload' ? <Upload className="h-3 w-3" /> : <FileEdit className="h-3 w-3" />}
                          Evidencia registrada
                        </span>
                      )}
                      {st.responsible && (
                        <span className="text-[11px] text-gray-500 flex items-center gap-1">
                          <User className="h-3 w-3" /> {st.responsible}
                        </span>
                      )}
                      {st.targetDate && (
                        <span className="text-[11px] text-gray-500 flex items-center gap-1">
                          <CalendarDays className="h-3 w-3" /> Objetivo: {fmtDate(st.targetDate)}
                        </span>
                      )}
                    </div>
                  )}

                  <button onClick={() => openModal(control)}
                    className="flex items-center gap-2 px-3.5 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-xs font-semibold text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                    <FileText className="h-3.5 w-3.5" />
                    {hasEvidence ? 'Editar Evidencia' : 'Agregar Evidencia'}
                  </button>
                </div>

                {/* Status badge (right side) */}
                <div className="hidden sm:flex flex-col items-end gap-2 flex-shrink-0">
                  <span className={`w-2.5 h-2.5 rounded-full ${statusCfg.dot}`} title={statusCfg.label} />
                  {status === 'IMPLEMENTED' && (
                    <span className="text-[10px] font-bold text-green-600">✓</span>
                  )}
                </div>
              </div>
            </div>
          )
        })}
      </div>

      {/* ════════ LOW COMPLIANCE ALERT ════════ */}
      {stats.percentage < 50 && stats.total > 0 && (
        <div className="flex items-start gap-3 p-5 rounded-xl border-2 border-orange-300 bg-orange-50 dark:bg-orange-900/15 dark:border-orange-700">
          <AlertTriangle className="h-5 w-5 text-orange-600 flex-shrink-0 mt-0.5" />
          <div>
            <h3 className="font-semibold text-orange-900 dark:text-orange-200">Nivel de Cumplimiento Bajo</h3>
            <p className="text-sm text-orange-800 dark:text-orange-300 mt-1">
              El nivel de cumplimiento actual es <strong>{stats.percentage}%</strong>. Se recomienda implementar controles
              adicionales para alcanzar al menos un 80% de cobertura.
            </p>
          </div>
        </div>
      )}

      {/* ════════════════════════════════════════════════════════════ */}
      {/* ═══ MODAL: DOCUMENTAR CONTROL ═══════════════════════════ */}
      {/* ════════════════════════════════════════════════════════════ */}
      {showModal && editingControl && (
        <div className="fixed inset-0 bg-black/50 flex items-start justify-center z-50 p-4 pt-[3vh] overflow-y-auto"
          onClick={e => { if (e.target === e.currentTarget) { setShowModal(false); setEditingControl(null) } }}>
          <div className="bg-white dark:bg-gray-900 rounded-2xl max-w-2xl w-full shadow-2xl mb-8">

            {/* ── Header ── */}
            <div className="sticky top-0 bg-white dark:bg-gray-900 rounded-t-2xl px-7 py-5 border-b border-gray-200 dark:border-gray-700 z-10">
              <div className="flex items-start justify-between">
                <div>
                  <h2 className="text-lg font-bold text-gray-900 dark:text-white">
                    Documentar Control: {editingControl.id}
                  </h2>
                  <p className="text-sm font-semibold text-gray-700 dark:text-gray-300 mt-1">{editingControl.name}</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">{editingControl.description}</p>
                </div>
                <button onClick={() => { setShowModal(false); setEditingControl(null) }}
                  className="text-gray-400 hover:text-gray-600 p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800">
                  <X className="h-5 w-5" />
                </button>
              </div>
            </div>

            <div className="px-7 py-6 space-y-6">

              {/* ── Requirement explanation ── */}
              <div className="p-4 rounded-xl bg-blue-50 dark:bg-blue-900/15 border border-blue-200 dark:border-blue-800/30">
                <div className="flex items-start gap-2.5">
                  <Info className="h-4 w-4 text-blue-600 flex-shrink-0 mt-0.5" />
                  <p className="text-sm text-blue-800 dark:text-blue-300 leading-relaxed">{editingControl.requirement}</p>
                </div>
              </div>

              {/* ── ¿Cómo quieres documentarlo? ── */}
              <section>
                <h4 className="text-sm font-bold text-gray-800 dark:text-gray-200 mb-3">¿Cómo quieres documentarlo?</h4>
                <div className="grid grid-cols-3 gap-3">
                  {([
                    { type: 'upload' as const, label: 'Subir documento', sub: 'Arrastrar archivo', icon: Upload, color: 'text-blue-600' },
                    { type: 'link' as const,   label: 'Enlace a documento', sub: 'URL', icon: LinkIcon, color: 'text-green-600' },
                    { type: 'manual' as const, label: 'Descripción manual', sub: 'Texto', icon: FileEdit, color: 'text-purple-600' },
                  ]).map(opt => (
                    <button key={opt.type} type="button"
                      onClick={() => setModalForm({ ...modalForm, docType: opt.type })}
                      className={`p-4 rounded-xl border-2 flex flex-col items-center gap-2 transition-all text-center ${
                        modalForm.docType === opt.type
                          ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20 shadow-sm'
                          : 'border-gray-200 dark:border-gray-700 hover:border-gray-300'
                      }`}>
                      <div className={`w-9 h-9 rounded-full ${
                        modalForm.docType === opt.type ? 'bg-blue-100 dark:bg-blue-900/30' : 'bg-gray-100 dark:bg-gray-700'
                      } flex items-center justify-center`}>
                        <opt.icon className={`h-4 w-4 ${modalForm.docType === opt.type ? 'text-blue-600' : opt.color}`} />
                      </div>
                      <div>
                        <p className="text-xs font-semibold text-gray-800 dark:text-gray-200">{opt.label}</p>
                        <p className="text-[10px] text-gray-500">[ {opt.sub} ]</p>
                      </div>
                    </button>
                  ))}
                </div>

                {/* Conditional content */}
                <div className="mt-4">
                  {modalForm.docType === 'upload' && (
                    <div>
                      <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-xl p-8 text-center cursor-pointer hover:border-blue-400 dark:hover:border-blue-500 transition-colors bg-gray-50 dark:bg-gray-800">
                        <Upload className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                        <p className="text-sm text-gray-600 dark:text-gray-400 font-medium">Arrastre un archivo aquí o haga clic para seleccionar</p>
                        <p className="text-xs text-gray-400 mt-1">PDF, DOCX, XLSX (máx. 10MB)</p>
                      </div>
                      {modalForm.fileName && (
                        <p className="text-xs text-green-600 mt-2 flex items-center gap-1"><CheckCircle2 className="h-3 w-3" /> {modalForm.fileName}</p>
                      )}
                      <div className="mt-3">
                        <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 mb-1.5 uppercase tracking-wider">Referencia del documento</label>
                        <input type="text" value={modalForm.evidence} onChange={e => setModalForm({ ...modalForm, evidence: e.target.value })}
                          placeholder="Nombre o referencia del documento subido"
                          className="w-full px-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent" />
                      </div>
                    </div>
                  )}

                  {modalForm.docType === 'link' && (
                    <div>
                      <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 mb-1.5 uppercase tracking-wider">
                        URL del documento
                      </label>
                      <input type="url" value={modalForm.evidence} onChange={e => setModalForm({ ...modalForm, evidence: e.target.value })}
                        placeholder="https://docs.empresa.com/politica-seguridad.pdf"
                        className="w-full px-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent" />
                    </div>
                  )}

                  {modalForm.docType === 'manual' && (
                    <div>
                      <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 mb-1.5 uppercase tracking-wider">
                        Evidencia de Implementación
                      </label>
                      <textarea value={modalForm.evidence} onChange={e => setModalForm({ ...modalForm, evidence: e.target.value })}
                        rows={4} placeholder="Describa cómo se implementó este control, incluya referencias a políticas, procedimientos, herramientas, etc."
                        className="w-full px-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-sm focus:ring-2 focus:ring-blue-500 resize-none focus:border-transparent" />
                    </div>
                  )}
                </div>
              </section>

              <hr className="border-gray-100 dark:border-gray-800" />

              {/* ── Estado del control ── */}
              <section>
                <h4 className="text-sm font-bold text-gray-800 dark:text-gray-200 mb-3">Estado del control</h4>
                <div className="space-y-2">
                  {(Object.entries(STATUS_CONFIG) as [ControlStatus, typeof STATUS_CONFIG[ControlStatus]][]).map(([key, cfg]) => {
                    const IconS = cfg.icon
                    const selected = modalForm.implementationStatus === key
                    return (
                      <label key={key}
                        className={`flex items-center gap-3 p-3 rounded-xl border-2 cursor-pointer transition-all ${
                          selected
                            ? `${cfg.bg} ${cfg.ring} ring-1 shadow-sm`
                            : 'border-gray-200 dark:border-gray-700 hover:border-gray-300'
                        }`}>
                        <input type="radio" name="controlStatus" value={key}
                          checked={selected}
                          onChange={() => setModalForm({ ...modalForm, implementationStatus: key })}
                          className="h-4 w-4 text-blue-600 border-gray-300 focus:ring-blue-500" />
                        <IconS className={`h-4 w-4 ${selected ? cfg.color : 'text-gray-400'}`} />
                        <span className={`text-sm font-medium ${selected ? cfg.color : 'text-gray-600 dark:text-gray-300'}`}>{cfg.label}</span>
                      </label>
                    )
                  })}
                </div>
              </section>

              <hr className="border-gray-100 dark:border-gray-800" />

              {/* ── Responsable + Fecha objetivo ── */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 mb-1.5 uppercase tracking-wider flex items-center gap-1">
                    <User className="h-3.5 w-3.5" /> Responsable
                  </label>
                  <input type="text" value={modalForm.responsible} onChange={e => setModalForm({ ...modalForm, responsible: e.target.value })}
                    placeholder="Nombre / Rol"
                    className="w-full px-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent" />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 mb-1.5 uppercase tracking-wider flex items-center gap-1">
                    <CalendarDays className="h-3.5 w-3.5" /> Fecha objetivo
                  </label>
                  <input type="date" value={modalForm.targetDate} onChange={e => setModalForm({ ...modalForm, targetDate: e.target.value })}
                    className="w-full px-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent" />
                </div>
              </div>

              <hr className="border-gray-100 dark:border-gray-800" />

              {/* ── Notas Adicionales ── */}
              <div>
                <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 mb-1.5 uppercase tracking-wider">
                  Notas Adicionales
                </label>
                <textarea value={modalForm.notes} onChange={e => setModalForm({ ...modalForm, notes: e.target.value })}
                  rows={3} placeholder="Observaciones, mejoras planificadas, responsables, fechas, etc."
                  className="w-full px-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-sm focus:ring-2 focus:ring-blue-500 resize-none focus:border-transparent" />
              </div>

              {/* ── Actions ── */}
              <div className="flex gap-3 pt-5 border-t border-gray-200 dark:border-gray-700">
                <button onClick={handleSave} disabled={saving}
                  className="flex-1 px-6 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 disabled:opacity-50 transition-colors text-sm font-semibold flex items-center justify-center gap-2 shadow-lg shadow-blue-600/20">
                  {saving ? <><Loader2 className="h-4 w-4 animate-spin" />Guardando...</> : 'Guardar'}
                </button>
                <button onClick={() => { setShowModal(false); setEditingControl(null) }}
                  className="flex-1 px-6 py-3 border border-gray-300 dark:border-gray-600 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors text-sm font-medium">
                  Cancelar
                </button>
              </div>

            </div>
          </div>
        </div>
      )}
    </div>
  )
}
