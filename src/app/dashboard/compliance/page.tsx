"use client";

import { useSession } from "next-auth/react";
import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { CheckCircle2, XCircle, Clock, Shield, FileText, AlertTriangle, Upload, Link as LinkIcon, FileEdit, User, CalendarDays } from "lucide-react";

// Controles ISO 27001:2022 - Anexo A
const ISO27001_CONTROLS = [
  { id: "A.5.1", name: "Políticas de seguridad de la información", category: "Organizacional", description: "Directrices de gestión para la seguridad de la información" },
  { id: "A.5.2", name: "Roles y responsabilidades de seguridad", category: "Organizacional", description: "Asignación de responsabilidades de seguridad" },
  { id: "A.5.3", name: "Segregación de funciones", category: "Organizacional", description: "Separación de funciones incompatibles" },
  { id: "A.5.4", name: "Responsabilidades de gestión", category: "Organizacional", description: "Obligaciones de gestión en seguridad" },
  { id: "A.5.5", name: "Contacto con autoridades", category: "Organizacional", description: "Relaciones con autoridades relevantes" },
  { id: "A.5.6", name: "Contacto con grupos de interés especial", category: "Organizacional", description: "Relaciones con comunidades de seguridad" },
  { id: "A.5.7", name: "Inteligencia de amenazas", category: "Organizacional", description: "Recopilación de información sobre amenazas" },
  { id: "A.5.8", name: "Seguridad de la información en gestión de proyectos", category: "Organizacional", description: "Integración de seguridad en proyectos" },
  { id: "A.5.9", name: "Inventario de activos", category: "Organizacional", description: "Identificación y registro de activos" },
  { id: "A.5.10", name: "Uso aceptable de activos", category: "Organizacional", description: "Reglas para el uso de activos" },
  { id: "A.5.11", name: "Devolución de activos", category: "Organizacional", description: "Proceso de devolución al finalizar empleo" },
  { id: "A.5.12", name: "Clasificación de la información", category: "Organizacional", description: "Niveles de clasificación de información" },
  { id: "A.5.13", name: "Etiquetado de información", category: "Organizacional", description: "Marcado según clasificación" },
  { id: "A.5.14", name: "Transferencia de información", category: "Organizacional", description: "Reglas para transferir información" },
  { id: "A.5.15", name: "Control de acceso", category: "Organizacional", description: "Política de control de acceso" },
  { id: "A.5.16", name: "Gestión de identidades", category: "Organizacional", description: "Ciclo de vida de identidades" },
  { id: "A.5.17", name: "Información de autenticación", category: "Organizacional", description: "Gestión de credenciales" },
  { id: "A.5.18", name: "Derechos de acceso", category: "Organizacional", description: "Aprovisionamiento de accesos" },
  { id: "A.6.1", name: "Selección de personal", category: "Personas", description: "Verificación de antecedentes" },
  { id: "A.6.2", name: "Términos y condiciones de empleo", category: "Personas", description: "Acuerdos contractuales de seguridad" },
  { id: "A.6.3", name: "Concienciación, educación y capacitación", category: "Personas", description: "Programas de formación en seguridad" },
  { id: "A.6.4", name: "Proceso disciplinario", category: "Personas", description: "Sanciones por incumplimiento" },
  { id: "A.6.5", name: "Responsabilidades tras la terminación", category: "Personas", description: "Obligaciones post-empleo" },
  { id: "A.6.6", name: "Acuerdos de confidencialidad", category: "Personas", description: "NDAs y acuerdos de secreto" },
  { id: "A.6.7", name: "Trabajo remoto", category: "Personas", description: "Políticas de teletrabajo" },
  { id: "A.6.8", name: "Reporte de eventos de seguridad", category: "Personas", description: "Canales para reportar incidentes" },
  { id: "A.7.1", name: "Perímetros de seguridad física", category: "Físico", description: "Protección de instalaciones" },
  { id: "A.7.2", name: "Controles de acceso físico", category: "Físico", description: "Restricción de acceso a áreas" },
  { id: "A.7.3", name: "Seguridad de oficinas, salas e instalaciones", category: "Físico", description: "Protección de espacios de trabajo" },
  { id: "A.7.4", name: "Monitoreo de seguridad física", category: "Físico", description: "Vigilancia y detección" },
  { id: "A.7.5", name: "Protección contra amenazas físicas y ambientales", category: "Físico", description: "Desastres naturales y fallas" },
  { id: "A.7.6", name: "Trabajo en áreas seguras", category: "Físico", description: "Reglas para zonas sensibles" },
  { id: "A.7.7", name: "Escritorio limpio y pantalla limpia", category: "Físico", description: "Política de escritorio limpio" },
  { id: "A.7.8", name: "Ubicación y protección de equipos", category: "Físico", description: "Emplazamiento de equipos" },
  { id: "A.7.9", name: "Seguridad de activos fuera de las instalaciones", category: "Físico", description: "Protección de equipos externos" },
  { id: "A.7.10", name: "Medios de almacenamiento", category: "Físico", description: "Gestión de medios físicos" },
  { id: "A.7.11", name: "Servicios de soporte", category: "Físico", description: "Mantenimiento de infraestructura" },
  { id: "A.7.12", name: "Seguridad del cableado", category: "Físico", description: "Protección de cables de red y energía" },
  { id: "A.7.13", name: "Mantenimiento de equipos", category: "Físico", description: "Mantenimiento seguro" },
  { id: "A.7.14", name: "Eliminación segura de equipos", category: "Físico", description: "Disposición final de equipos" },
  { id: "A.8.1", name: "Dispositivos de punto final de usuario", category: "Tecnológico", description: "Protección de endpoints" },
  { id: "A.8.2", name: "Derechos de acceso privilegiados", category: "Tecnológico", description: "Gestión de cuentas privilegiadas" },
  { id: "A.8.3", name: "Restricción de acceso a la información", category: "Tecnológico", description: "Control de acceso lógico" },
  { id: "A.8.4", name: "Acceso a código fuente", category: "Tecnológico", description: "Protección del código" },
  { id: "A.8.5", name: "Autenticación segura", category: "Tecnológico", description: "MFA y métodos de autenticación" },
  { id: "A.8.6", name: "Gestión de capacidad", category: "Tecnológico", description: "Monitoreo de recursos" },
  { id: "A.8.7", name: "Protección contra malware", category: "Tecnológico", description: "Antivirus y antimalware" },
  { id: "A.8.8", name: "Gestión de vulnerabilidades técnicas", category: "Tecnológico", description: "Parcheo y actualizaciones" },
  { id: "A.8.9", name: "Gestión de configuración", category: "Tecnológico", description: "Configuraciones seguras" },
  { id: "A.8.10", name: "Eliminación de información", category: "Tecnológico", description: "Borrado seguro de datos" },
  { id: "A.8.11", name: "Enmascaramiento de datos", category: "Tecnológico", description: "Anonimización y pseudonimización" },
  { id: "A.8.12", name: "Prevención de fuga de datos", category: "Tecnológico", description: "DLP - Data Loss Prevention" },
  { id: "A.8.13", name: "Respaldo de información", category: "Tecnológico", description: "Copias de seguridad" },
  { id: "A.8.14", name: "Redundancia de instalaciones de procesamiento", category: "Tecnológico", description: "Alta disponibilidad" },
  { id: "A.8.15", name: "Registro de eventos", category: "Tecnológico", description: "Logs y auditoría" },
  { id: "A.8.16", name: "Actividades de monitoreo", category: "Tecnológico", description: "Monitoreo continuo" },
  { id: "A.8.17", name: "Sincronización de relojes", category: "Tecnológico", description: "NTP y sincronización horaria" },
  { id: "A.8.18", name: "Uso de programas de utilidad privilegiados", category: "Tecnológico", description: "Control de herramientas admin" },
  { id: "A.8.19", name: "Instalación de software en sistemas operativos", category: "Tecnológico", description: "Control de instalaciones" },
  { id: "A.8.20", name: "Seguridad de redes", category: "Tecnológico", description: "Firewall y segmentación" },
  { id: "A.8.21", name: "Seguridad de servicios de red", category: "Tecnológico", description: "Protección de servicios" },
  { id: "A.8.22", name: "Segregación de redes", category: "Tecnológico", description: "VLANs y segmentación" },
  { id: "A.8.23", name: "Filtrado web", category: "Tecnológico", description: "Control de navegación" },
  { id: "A.8.24", name: "Uso de criptografía", category: "Tecnológico", description: "Cifrado de datos" },
  { id: "A.8.25", name: "Ciclo de vida de desarrollo seguro", category: "Tecnológico", description: "SDLC seguro" },
  { id: "A.8.26", name: "Requisitos de seguridad de aplicaciones", category: "Tecnológico", description: "Requerimientos de seguridad" },
  { id: "A.8.27", name: "Principios de ingeniería y arquitectura de sistemas seguros", category: "Tecnológico", description: "Diseño seguro" },
  { id: "A.8.28", name: "Codificación segura", category: "Tecnológico", description: "Prácticas de código seguro" },
  { id: "A.8.29", name: "Pruebas de seguridad en desarrollo y aceptación", category: "Tecnológico", description: "Testing de seguridad" },
  { id: "A.8.30", name: "Desarrollo externalizado", category: "Tecnológico", description: "Outsourcing de desarrollo" },
  { id: "A.8.31", name: "Separación de entornos", category: "Tecnológico", description: "Dev, test, producción" },
  { id: "A.8.32", name: "Gestión de cambios", category: "Tecnológico", description: "Control de cambios" },
  { id: "A.8.33", name: "Información de prueba", category: "Tecnológico", description: "Datos de prueba seguros" },
  { id: "A.8.34", name: "Protección de sistemas de información durante pruebas de auditoría", category: "Tecnológico", description: "Auditorías sin impacto" }
];

// Ley 21.663 - Ley Marco de Ciberseguridad e Infraestructura Crítica de la Información (Chile)
const LEY21663_CONTROLS = [
  { id: "L1", name: "Política Nacional de Ciberseguridad", category: "Marco Legal", description: "Implementación de política nacional de ciberseguridad" },
  { id: "L2", name: "Agencia Nacional de Ciberseguridad", category: "Marco Legal", description: "Coordinación con ANCI en materias de ciberseguridad" },
  { id: "L3", name: "Identificación de Infraestructura Crítica", category: "Infraestructura Crítica", description: "Identificación de activos y servicios críticos" },
  { id: "L4", name: "Protección de Infraestructura Crítica", category: "Infraestructura Crítica", description: "Medidas de protección para infraestructura crítica" },
  { id: "L5", name: "Reporte de Incidentes de Ciberseguridad", category: "Gestión de Incidentes", description: "Obligación de reportar incidentes significativos" },
  { id: "L6", name: "Plazos de Notificación", category: "Gestión de Incidentes", description: "Cumplimiento de plazos legales de notificación (24-72 horas)" },
  { id: "L7", name: "CSIRT - Equipo de Respuesta a Incidentes", category: "Gestión de Incidentes", description: "Establecimiento de equipo de respuesta" },
  { id: "L8", name: "Protección de Datos Personales", category: "Protección de Datos", description: "Cumplimiento Ley 19.628 sobre protección de datos" },
  { id: "L9", name: "Gestión de Riesgos de Ciberseguridad", category: "Gestión de Riesgos", description: "Evaluación y gestión de riesgos" },
  { id: "L10", name: "Plan de Continuidad de Negocio", category: "Continuidad", description: "Plan de continuidad ante incidentes" },
  { id: "L11", name: "Plan de Recuperación de Desastres", category: "Continuidad", description: "Procedimientos de recuperación" },
  { id: "L12", name: "Capacitación en Ciberseguridad", category: "Capacitación", description: "Programas de formación obligatorios" },
  { id: "L13", name: "Auditorías de Seguridad", category: "Auditoría", description: "Auditorías periódicas de ciberseguridad" },
  { id: "L14", name: "Registro de Activos de Información", category: "Gestión de Activos", description: "Inventario actualizado de activos" },
  { id: "L15", name: "Seguridad en la Cadena de Suministro", category: "Terceros", description: "Evaluación de proveedores y terceros" },
  { id: "L16", name: "Contratos con Cláusulas de Seguridad", category: "Terceros", description: "Acuerdos con requisitos de ciberseguridad" },
  { id: "L17", name: "Seguridad en Servicios en la Nube", category: "Tecnológico", description: "Controles para servicios cloud" },
  { id: "L18", name: "Cifrado de Información Sensible", category: "Tecnológico", description: "Protección criptográfica obligatoria" },
  { id: "L19", name: "Control de Acceso y Autenticación", category: "Tecnológico", description: "Gestión de identidades y accesos" },
  { id: "L20", name: "Monitoreo y Detección de Amenazas", category: "Tecnológico", description: "Sistemas de detección continua" },
  { id: "L21", name: "Actualización y Parcheo de Sistemas", category: "Tecnológico", description: "Gestión de vulnerabilidades" },
  { id: "L22", name: "Respaldo y Recuperación de Datos", category: "Tecnológico", description: "Backups seguros y probados" },
  { id: "L23", name: "Cumplimiento Normativo", category: "Cumplimiento", description: "Adhesión a normas y regulaciones aplicables" },
  { id: "L24", name: "Responsabilidad del Directorio", category: "Gobernanza", description: "Supervisión de ciberseguridad por directorio" },
  { id: "L25", name: "Oficial de Seguridad de la Información", category: "Gobernanza", description: "Designación de CISO o responsable" },
  { id: "L26", name: "Inversión en Ciberseguridad", category: "Gobernanza", description: "Presupuesto asignado para seguridad" },
  { id: "L27", name: "Colaboración Público-Privada", category: "Coordinación", description: "Participación en iniciativas sectoriales" },
  { id: "L28", name: "Ejercicios de Simulación", category: "Capacitación", description: "Simulacros y pruebas de respuesta" },
  { id: "L29", name: "Sanciones por Incumplimiento", category: "Cumplimiento", description: "Conocimiento de penalidades aplicables" },
  { id: "L30", name: "Documentación y Evidencias", category: "Cumplimiento", description: "Registro de cumplimiento y evidencias" }
];

export default function CompliancePage() {
  const { data: session } = useSession();
  const [activeFramework, setActiveFramework] = useState<"ISO27001" | "LEY21663">("ISO27001");
  const [controls, setControls] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("ALL");
  const [editingControl, setEditingControl] = useState<any>(null);
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    loadControls();
  }, [activeFramework]);

  const loadControls = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/compliance?framework=${activeFramework}`);
      const data = await response.json();
      setControls(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("Error loading controls:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleToggleImplemented = async (control: any, currentStatus: boolean) => {
    try {
      await fetch(`/api/compliance/${control.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          implemented: !currentStatus,
          framework: activeFramework,
          controlName: control.name,
          description: control.description,
          category: control.category,
        }),
      });
      loadControls();
    } catch (error) {
      console.error("Error updating control:", error);
    }
  };

  const handleSaveEvidence = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingControl) return;

    try {
      await fetch(`/api/compliance/${editingControl.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          evidence: editingControl.evidence,
          notes: editingControl.notes,
          lastReviewed: new Date(),
          framework: activeFramework,
          controlName: editingControl.name,
          description: editingControl.description,
          category: editingControl.category,
        }),
      });
      setShowModal(false);
      setEditingControl(null);
      loadControls();
    } catch (error) {
      console.error("Error saving evidence:", error);
    }
  };

  const templateControls = activeFramework === "ISO27001" ? ISO27001_CONTROLS : LEY21663_CONTROLS;
  
  // Combinar controles de template con datos guardados
  const mergedControls = templateControls.map(template => {
    const saved = controls.find(c => c.controlId === template.id);
    return {
      ...template,
      ...saved,
      implemented: saved?.implemented || false,
    };
  });

  const filteredControls = mergedControls.filter(control => {
    const matchesSearch = control.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         control.id.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === "ALL" || control.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const categories = ["ALL", ...new Set(templateControls.map(c => c.category))];
  const implementedCount = mergedControls.filter(c => c.implemented).length;
  const totalCount = mergedControls.length;
  const percentage = Math.round((implementedCount / totalCount) * 100);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Cumplimiento Normativo</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-2">
            Gestión de cumplimiento ISO 27001 y Ley 21.663
          </p>
        </div>
      </div>

      {/* Framework Selector */}
      <div className="flex gap-4">
        <Button
          variant={activeFramework === "ISO27001" ? "default" : "outline"}
          onClick={() => setActiveFramework("ISO27001")}
          className="flex-1"
        >
          <Shield className="h-4 w-4 mr-2" />
          ISO 27001:2022
        </Button>
        <Button
          variant={activeFramework === "LEY21663" ? "default" : "outline"}
          onClick={() => setActiveFramework("LEY21663")}
          className="flex-1"
        >
          <FileText className="h-4 w-4 mr-2" />
          Ley 21.663 (Chile)
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold">{totalCount}</div>
            <p className="text-sm text-gray-600 dark:text-gray-400">Controles Totales</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold text-green-600">{implementedCount}</div>
            <p className="text-sm text-gray-600 dark:text-gray-400">Implementados</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold text-orange-600">{totalCount - implementedCount}</div>
            <p className="text-sm text-gray-600 dark:text-gray-400">Pendientes</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold text-blue-600">{percentage}%</div>
            <p className="text-sm text-gray-600 dark:text-gray-400">Completado</p>
          </CardContent>
        </Card>
      </div>

      {/* Progress Bar */}
      <Card>
        <CardContent className="pt-6">
          <div className="mb-2 flex justify-between">
            <span className="text-sm font-medium">Progreso de Implementación</span>
            <span className="text-sm font-medium">{percentage}%</span>
          </div>
          <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-4">
            <div
              className="bg-blue-600 h-4 rounded-full transition-all duration-500"
              style={{ width: `${percentage}%` }}
            />
          </div>
        </CardContent>
      </Card>

      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col md:flex-row gap-4">
            <Input
              placeholder="Buscar controles..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="flex-1"
            />
            <div className="flex gap-2 flex-wrap">
              {categories.map(cat => (
                <Button
                  key={cat}
                  variant={selectedCategory === cat ? "default" : "outline"}
                  size="sm"
                  onClick={() => setSelectedCategory(cat)}
                >
                  {cat}
                </Button>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Controls List */}
      <div className="space-y-3">
        {filteredControls.map((control) => (
          <Card key={control.id} className="hover:shadow-md transition-shadow">
            <CardContent className="pt-6">
              <div className="flex items-start gap-4">
                <button
                  onClick={() => handleToggleImplemented(control, control.implemented)}
                  className="mt-1"
                >
                  {control.implemented ? (
                    <CheckCircle2 className="h-6 w-6 text-green-600" />
                  ) : (
                    <XCircle className="h-6 w-6 text-gray-400" />
                  )}
                </button>
                
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <Badge variant="outline">{control.id}</Badge>
                    <Badge className={control.implemented ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-800"}>
                      {control.category}
                    </Badge>
                    {control.lastReviewed && (
                      <span className="text-xs text-gray-500 flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        Revisado: {new Date(control.lastReviewed).toLocaleDateString('es-ES')}
                      </span>
                    )}
                  </div>
                  
                  <h3 className="font-semibold text-lg mb-1">{control.name}</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                    {control.description}
                  </p>

                  {control.evidence && (
                    <div className="bg-blue-50 dark:bg-blue-900/20 p-3 rounded-md mb-2">
                      <p className="text-sm font-medium mb-1">
                        {control.docType === "link" ? "📎 Enlace:" : control.docType === "upload" ? "📄 Documento:" : "📝 Evidencia:"}
                      </p>
                      <p className="text-sm text-gray-700 dark:text-gray-300">
                        {control.docType === "link" ? (
                          <a href={control.evidence} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline flex items-center gap-1">
                            <LinkIcon className="h-3 w-3" />{control.evidence}
                          </a>
                        ) : control.evidence}
                      </p>
                    </div>
                  )}

                  {/* Status, Responsible, Target Date row */}
                  {(control.responsible || control.targetDate || control.implementationStatus) && (
                    <div className="flex flex-wrap gap-3 mb-2 text-xs">
                      {control.implementationStatus && (
                        <span className={`px-2 py-1 rounded-full font-medium ${
                          control.implementationStatus === "IMPLEMENTED" ? "bg-green-100 text-green-700" :
                          control.implementationStatus === "IN_PROGRESS" ? "bg-yellow-100 text-yellow-700" :
                          control.implementationStatus === "NOT_APPLICABLE" ? "bg-blue-100 text-blue-700" :
                          "bg-gray-100 text-gray-700"
                        }`}>
                          {control.implementationStatus === "IMPLEMENTED" ? "✅ Implementado" :
                           control.implementationStatus === "IN_PROGRESS" ? "🔄 En progreso" :
                           control.implementationStatus === "NOT_APPLICABLE" ? "➖ No aplica" :
                           "⬜ No iniciado"}
                        </span>
                      )}
                      {control.responsible && (
                        <span className="flex items-center gap-1 text-gray-600">
                          <User className="h-3 w-3" /> {control.responsible}
                        </span>
                      )}
                      {control.targetDate && (
                        <span className="flex items-center gap-1 text-gray-600">
                          <CalendarDays className="h-3 w-3" /> Objetivo: {new Date(control.targetDate).toLocaleDateString('es-ES')}
                        </span>
                      )}
                    </div>
                  )}

                  {control.notes && (
                    <div className="bg-yellow-50 dark:bg-yellow-900/20 p-3 rounded-md mb-2">
                      <p className="text-sm font-medium mb-1">Notas:</p>
                      <p className="text-sm text-gray-700 dark:text-gray-300">{control.notes}</p>
                    </div>
                  )}

                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setEditingControl(control);
                      setShowModal(true);
                    }}
                  >
                    <FileText className="h-4 w-4 mr-2" />
                    {control.evidence ? "Editar Evidencia" : "Agregar Evidencia"}
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Modal for Evidence */}
      {showModal && editingControl && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <Card className="max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <CardHeader>
              <CardTitle>Documentar Control: {editingControl.id}</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSaveEvidence} className="space-y-4">
                <div>
                  <h3 className="font-semibold mb-2">{editingControl.name}</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                    {editingControl.description}
                  </p>
                </div>

                {/* Implementation Status */}
                <div>
                  <label className="block text-sm font-medium mb-2">
                    Estado de Implementación
                  </label>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                    {[
                      { value: "NOT_STARTED", label: "No iniciado", color: "border-gray-300 bg-gray-50 text-gray-700" },
                      { value: "IN_PROGRESS", label: "En progreso", color: "border-yellow-300 bg-yellow-50 text-yellow-700" },
                      { value: "IMPLEMENTED", label: "Implementado", color: "border-green-300 bg-green-50 text-green-700" },
                      { value: "NOT_APPLICABLE", label: "No aplica", color: "border-blue-300 bg-blue-50 text-blue-700" },
                    ].map((opt) => (
                      <button
                        key={opt.value}
                        type="button"
                        onClick={() => setEditingControl({ ...editingControl, implementationStatus: opt.value })}
                        className={`p-2 rounded-lg border-2 text-xs font-medium transition-all ${
                          editingControl.implementationStatus === opt.value
                            ? opt.color + " ring-2 ring-offset-1 ring-blue-500"
                            : "border-gray-200 bg-white dark:bg-gray-800 hover:border-gray-300"
                        }`}
                      >
                        {opt.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Responsible + Target Date */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-2 flex items-center gap-1">
                      <User className="h-4 w-4" />
                      Responsable
                    </label>
                    <Input
                      value={editingControl.responsible || ""}
                      onChange={(e) => setEditingControl({ ...editingControl, responsible: e.target.value })}
                      placeholder="Nombre del responsable"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2 flex items-center gap-1">
                      <CalendarDays className="h-4 w-4" />
                      Fecha Objetivo
                    </label>
                    <Input
                      type="date"
                      value={editingControl.targetDate || ""}
                      onChange={(e) => setEditingControl({ ...editingControl, targetDate: e.target.value })}
                    />
                  </div>
                </div>

                {/* Documentation Type */}
                <div>
                  <label className="block text-sm font-medium mb-3">
                    Tipo de Documentación
                  </label>
                  <div className="grid grid-cols-3 gap-3">
                    <button
                      type="button"
                      onClick={() => setEditingControl({ ...editingControl, docType: "upload" })}
                      className={`p-3 border-2 rounded-lg flex flex-col items-center gap-2 transition-all ${
                        editingControl.docType === "upload"
                          ? "border-blue-500 bg-blue-50 dark:bg-blue-900/30"
                          : "border-gray-200 hover:border-gray-300"
                      }`}
                    >
                      <Upload className="h-5 w-5 text-blue-600" />
                      <span className="text-xs font-medium">Subir documento</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setEditingControl({ ...editingControl, docType: "link" })}
                      className={`p-3 border-2 rounded-lg flex flex-col items-center gap-2 transition-all ${
                        editingControl.docType === "link"
                          ? "border-blue-500 bg-blue-50 dark:bg-blue-900/30"
                          : "border-gray-200 hover:border-gray-300"
                      }`}
                    >
                      <LinkIcon className="h-5 w-5 text-green-600" />
                      <span className="text-xs font-medium">Enlace a documento</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setEditingControl({ ...editingControl, docType: "manual" })}
                      className={`p-3 border-2 rounded-lg flex flex-col items-center gap-2 transition-all ${
                        editingControl.docType === "manual"
                          ? "border-blue-500 bg-blue-50 dark:bg-blue-900/30"
                          : "border-gray-200 hover:border-gray-300"
                      }`}
                    >
                      <FileEdit className="h-5 w-5 text-purple-600" />
                      <span className="text-xs font-medium">Descripción manual</span>
                    </button>
                  </div>
                </div>

                {/* Conditional fields based on docType */}
                {editingControl.docType === "upload" && (
                  <div>
                    <label className="block text-sm font-medium mb-2">
                      <Upload className="inline h-4 w-4 mr-1" />
                      Subir Documento
                    </label>
                    <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center cursor-pointer hover:border-blue-400 transition-colors">
                      <Upload className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                      <p className="text-sm text-gray-500">Arrastre un archivo aquí o haga clic para seleccionar</p>
                      <p className="text-xs text-gray-400 mt-1">PDF, DOCX, XLSX (máx. 10MB)</p>
                      <input
                        type="file"
                        className="hidden"
                        accept=".pdf,.docx,.xlsx,.doc,.xls"
                      />
                    </div>
                    {editingControl.evidence && (
                      <p className="text-xs text-green-600 mt-2 flex items-center gap-1">
                        <CheckCircle2 className="h-3 w-3" /> Referencia guardada: {editingControl.evidence}
                      </p>
                    )}
                  </div>
                )}

                {editingControl.docType === "link" && (
                  <div>
                    <label className="block text-sm font-medium mb-2">
                      <LinkIcon className="inline h-4 w-4 mr-1" />
                      Enlace al Documento
                    </label>
                    <Input
                      type="url"
                      value={editingControl.evidence || ""}
                      onChange={(e) => setEditingControl({ ...editingControl, evidence: e.target.value })}
                      placeholder="https://docs.empresa.com/politica-seguridad.pdf"
                    />
                  </div>
                )}

                {editingControl.docType === "manual" && (
                  <div>
                    <label className="block text-sm font-medium mb-2">
                      <FileEdit className="inline h-4 w-4 mr-1" />
                      Descripción de Implementación
                    </label>
                    <Textarea
                      value={editingControl.evidence || ""}
                      onChange={(e) => setEditingControl({ ...editingControl, evidence: e.target.value })}
                      placeholder="Describa cómo se implementó este control, incluya referencias a políticas, procedimientos, herramientas, etc."
                      rows={5}
                    />
                  </div>
                )}

                {/* Fallback if no docType selected */}
                {!editingControl.docType && (
                  <div>
                    <label className="block text-sm font-medium mb-2">
                      Evidencia de Implementación
                    </label>
                    <Textarea
                      value={editingControl.evidence || ""}
                      onChange={(e) => setEditingControl({ ...editingControl, evidence: e.target.value })}
                      placeholder="Describa cómo se implementó este control..."
                      rows={4}
                    />
                  </div>
                )}

                <div>
                  <label className="block text-sm font-medium mb-2">
                    Notas Adicionales
                  </label>
                  <Textarea
                    value={editingControl.notes || ""}
                    onChange={(e) => setEditingControl({ ...editingControl, notes: e.target.value })}
                    placeholder="Observaciones, mejoras planificadas, etc."
                    rows={3}
                  />
                </div>

                <div className="flex gap-3 pt-4">
                  <Button type="submit" className="flex-1">
                    Guardar
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => {
                      setShowModal(false);
                      setEditingControl(null);
                    }}
                    className="flex-1"
                  >
                    Cancelar
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Alert if low compliance */}
      {percentage < 50 && (
        <Card className="border-orange-500 bg-orange-50 dark:bg-orange-900/20">
          <CardContent className="pt-6">
            <div className="flex items-start gap-3">
              <AlertTriangle className="h-5 w-5 text-orange-600 mt-0.5" />
              <div>
                <h3 className="font-semibold text-orange-900 dark:text-orange-100">
                  Nivel de Cumplimiento Bajo
                </h3>
                <p className="text-sm text-orange-800 dark:text-orange-200 mt-1">
                  El nivel de cumplimiento actual es {percentage}%. Se recomienda implementar controles adicionales
                  para alcanzar al menos un 80% de cobertura.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
