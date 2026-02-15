"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { 
  AlertTriangle, Plus, Eye, Edit, Trash2, 
  CheckCircle, Clock, XCircle, AlertCircle,
  Filter, Search, Calendar, FileText, Upload, 
  Link as LinkIcon, Shield, Timer, User
} from "lucide-react";
import { useSession } from "next-auth/react";

const SEVERITY_CONFIG = {
  LOW: { label: "Baja", color: "bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300", icon: "ℹ️" },
  MEDIUM: { label: "Media", color: "bg-yellow-100 text-yellow-700 dark:bg-yellow-900 dark:text-yellow-300", icon: "⚠️" },
  HIGH: { label: "Alta", color: "bg-orange-100 text-orange-700 dark:bg-orange-900 dark:text-orange-300", icon: "🔥" },
  CRITICAL: { label: "Crítica", color: "bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300", icon: "🚨" },
};

const STATUS_CONFIG = {
  OPEN: { label: "Abierto", color: "bg-red-100 text-red-700", icon: AlertCircle },
  IN_PROGRESS: { label: "En Progreso", color: "bg-yellow-100 text-yellow-700", icon: Clock },
  RESOLVED: { label: "Resuelto", color: "bg-green-100 text-green-700", icon: CheckCircle },
  CLOSED: { label: "Cerrado", color: "bg-gray-100 text-gray-700", icon: XCircle },
};

const SLA_HOURS: Record<string, number> = {
  CRITICAL: 4,
  HIGH: 8,
  MEDIUM: 24,
  LOW: 72,
};

const INCIDENT_CATEGORIES = [
  "Brecha de Datos",
  "Phishing",
  "Malware",
  "Ransomware",
  "Acceso No Autorizado",
  "Denegación de Servicio (DoS)",
  "Fuga de Información",
  "Uso Indebido de Recursos",
  "Ingeniería Social",
  "Vulnerabilidad de Sistema",
  "Pérdida de Dispositivos",
  "Otro"
];

const ORIGIN_OPTIONS = ["Vulnerabilidad", "SIEM", "Tercero", "Manual"];

export default function IncidentsPage() {
  const { data: session } = useSession();
  const [incidents, setIncidents] = useState<any[]>([]);
  const [suggestedIncidents, setSuggestedIncidents] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [showDetailModal, setShowDetailModal] = useState<any>(null);
  const [editingIncident, setEditingIncident] = useState<any>(null);
  const [filterStatus, setFilterStatus] = useState<string>("ALL");
  const [searchTerm, setSearchTerm] = useState("");

  // Form state
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    severity: "MEDIUM",
    category: "",
    origin: "Manual",
    affectedSystems: "",
    assignedTo: "",
    notes: "",
    impactFinancial: "MEDIUM",
    impactOperational: "MEDIUM",
    impactReputational: "MEDIUM",
    evidences: [] as string[],
    actions: [] as string[],
  });

  useEffect(() => {
    loadIncidents();
    loadSuggestedIncidents();
  }, []);

  const loadIncidents = async () => {
    try {
      const response = await fetch("/api/incidents");
      const data = await response.json();
      setIncidents(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("Error cargando incidentes:", error);
    }
  };

  const loadSuggestedIncidents = async () => {
    try {
      const response = await fetch("/api/vulnerabilities?severity=CRITICAL&status=OPEN");
      const data = await response.json();
      const vulns = data.vulnerabilities || [];
      setSuggestedIncidents(vulns.slice(0, 3));
    } catch (error) {
      console.error("Error cargando sugerencias:", error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const url = editingIncident 
        ? `/api/incidents/${editingIncident.id}`
        : "/api/incidents";
      
      const method = editingIncident ? "PUT" : "POST";

      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        throw new Error("Error al guardar el incidente");
      }

      setShowForm(false);
      setEditingIncident(null);
      resetForm();
      loadIncidents();
    } catch (error) {
      console.error("Error:", error);
      alert("Error al guardar el incidente");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("¿Estás seguro de eliminar este incidente?")) return;

    try {
      await fetch(`/api/incidents/${id}`, { method: "DELETE" });
      loadIncidents();
    } catch (error) {
      console.error("Error eliminando incidente:", error);
    }
  };

  const handleEdit = (incident: any) => {
    setEditingIncident(incident);
    setFormData({
      title: incident.title,
      description: incident.description,
      severity: incident.severity,
      category: incident.category,
      origin: incident.origin || "Manual",
      affectedSystems: incident.affectedSystems || "",
      assignedTo: incident.assignedTo || "",
      notes: incident.notes || "",
      impactFinancial: incident.impactFinancial || "MEDIUM",
      impactOperational: incident.impactOperational || "MEDIUM",
      impactReputational: incident.impactReputational || "MEDIUM",
      evidences: incident.evidences || [],
      actions: incident.actions || [],
    });
    setShowForm(true);
  };

  const resetForm = () => {
    setFormData({
      title: "",
      description: "",
      severity: "MEDIUM",
      category: "",
      origin: "Manual",
      affectedSystems: "",
      assignedTo: "",
      notes: "",
      impactFinancial: "MEDIUM",
      impactOperational: "MEDIUM",
      impactReputational: "MEDIUM",
      evidences: [],
      actions: [],
    });
  };

  const getSLARemaining = (incident: any) => {
    const slaHours = SLA_HOURS[incident.severity] || 24;
    const created = new Date(incident.detectedAt).getTime();
    const now = Date.now();
    const elapsed = (now - created) / (1000 * 60 * 60);
    const remaining = slaHours - elapsed;
    return { remaining: Math.max(0, remaining), total: slaHours, exceeded: remaining <= 0 };
  };

  const filteredIncidents = incidents.filter(incident => {
    const matchesStatus = filterStatus === "ALL" || incident.status === filterStatus;
    const matchesSearch = incident.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         incident.description.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <AlertTriangle className="h-8 w-8 text-red-600" />
            Gestión de Incidentes de Seguridad
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Conforme a ISO/IEC 27001:2022 - Anexo A.5.24, A.5.25, A.5.26
          </p>
        </div>
        <Button onClick={() => setShowForm(true)} className="bg-red-600 hover:bg-red-700">
          <Plus className="h-4 w-4 mr-2" />
          Registrar Incidente
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {Object.entries(STATUS_CONFIG).map(([status, config]) => {
          const Icon = config.icon;
          const count = incidents.filter(i => i.status === status).length;
          return (
            <Card key={status}>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">{config.label}</p>
                    <p className="text-2xl font-bold mt-1">{count}</p>
                  </div>
                  <Icon className="h-8 w-8 text-gray-400" />
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Buscar incidentes..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <div className="flex gap-2">
              <Button
                variant={filterStatus === "ALL" ? "default" : "outline"}
                onClick={() => setFilterStatus("ALL")}
                size="sm"
              >
                Todos
              </Button>
              {Object.entries(STATUS_CONFIG).map(([status, config]) => (
                <Button
                  key={status}
                  variant={filterStatus === status ? "default" : "outline"}
                  onClick={() => setFilterStatus(status)}
                  size="sm"
                >
                  {config.label}
                </Button>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Suggested Incidents */}
      {suggestedIncidents.length > 0 && (
        <Card className="border-orange-200 bg-orange-50 dark:bg-orange-950/20">
          <CardHeader>
            <CardTitle className="text-orange-700 dark:text-orange-400 flex items-center gap-2">
              <Shield className="h-5 w-5" />
              Incidentes Sugeridos
            </CardTitle>
            <CardDescription>
              Vulnerabilidades críticas que podrían requerir registro como incidente
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {suggestedIncidents.map((vuln: any) => (
                <div key={vuln.id} className="flex items-center justify-between bg-white dark:bg-gray-800 p-3 rounded-lg border">
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <span className="text-red-500">🚨</span>
                      <span className="font-medium text-sm">{vuln.title || vuln.name}</span>
                      <span className="px-2 py-0.5 rounded-full text-xs bg-red-100 text-red-700">Crítica</span>
                    </div>
                    <p className="text-xs text-gray-500 mt-1">{vuln.description?.slice(0, 100)}...</p>
                  </div>
                  <div className="flex gap-2 ml-4">
                    <Button
                      size="sm"
                      className="bg-red-600 hover:bg-red-700"
                      onClick={() => {
                        setFormData({
                          ...formData,
                          title: `Incidente: ${vuln.title || vuln.name}`,
                          description: vuln.description || "",
                          severity: "CRITICAL",
                          category: "Vulnerabilidad de Sistema",
                          origin: "Vulnerabilidad",
                        });
                        setShowForm(true);
                      }}
                    >
                      Crear incidente
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => setSuggestedIncidents(suggestedIncidents.filter((s: any) => s.id !== vuln.id))}
                    >
                      Descartar
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Form Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 overflow-y-auto">
          <Card className="w-full max-w-3xl my-8">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <AlertTriangle className="h-5 w-5" />
                {editingIncident ? "Editar Incidente" : "Registrar Nuevo Incidente"}
              </CardTitle>
              <CardDescription>
                Complete todos los campos obligatorios según el procedimiento de gestión de incidentes
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium mb-2">
                      Título del Incidente <span className="text-red-500">*</span>
                    </label>
                    <Input
                      required
                      value={formData.title}
                      onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                      placeholder="Ej: Intento de acceso no autorizado detectado"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">
                      Severidad <span className="text-red-500">*</span>
                    </label>
                    <select
                      required
                      value={formData.severity}
                      onChange={(e) => setFormData({ ...formData, severity: e.target.value })}
                      className="w-full rounded-md border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 px-3 py-2"
                    >
                      {Object.entries(SEVERITY_CONFIG).map(([key, config]) => (
                        <option key={key} value={key}>
                          {config.icon} {config.label}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">
                      Categoría <span className="text-red-500">*</span>
                    </label>
                    <select
                      required
                      value={formData.category}
                      onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                      className="w-full rounded-md border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 px-3 py-2"
                    >
                      <option value="">Seleccione una categoría</option>
                      {INCIDENT_CATEGORIES.map((cat) => (
                        <option key={cat} value={cat}>{cat}</option>
                      ))}
                    </select>
                  </div>

                  {/* Origin */}
                  <div>
                    <label className="block text-sm font-medium mb-2">
                      Origen del Incidente
                    </label>
                    <select
                      value={formData.origin}
                      onChange={(e) => setFormData({ ...formData, origin: e.target.value })}
                      className="w-full rounded-md border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 px-3 py-2"
                    >
                      {ORIGIN_OPTIONS.map((opt) => (
                        <option key={opt} value={opt}>{opt}</option>
                      ))}
                    </select>
                  </div>

                  {/* SLA indicator */}
                  <div>
                    <label className="block text-sm font-medium mb-2">
                      <Timer className="inline h-4 w-4 mr-1" />
                      SLA de resolución
                    </label>
                    <div className="px-3 py-2 rounded-md border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 text-sm">
                      {SLA_HOURS[formData.severity]} horas ({formData.severity === "CRITICAL" ? "Urgente" : formData.severity === "HIGH" ? "Prioritario" : "Normal"})
                    </div>
                  </div>

                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium mb-2">
                      Descripción <span className="text-red-500">*</span>
                    </label>
                    <textarea
                      required
                      value={formData.description}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                      placeholder="Describa el incidente de forma detallada..."
                      rows={3}
                      className="w-full rounded-md border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 px-3 py-2"
                    />
                  </div>

                  {/* Impact Assessment */}
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium mb-3 flex items-center gap-1">
                      <Shield className="h-4 w-4" />
                      Evaluación de Impacto
                    </label>
                    <div className="grid grid-cols-3 gap-3">
                      <div>
                        <label className="block text-xs text-gray-500 mb-1">💰 Financiero</label>
                        <select
                          value={formData.impactFinancial}
                          onChange={(e) => setFormData({ ...formData, impactFinancial: e.target.value })}
                          className="w-full rounded-md border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 px-3 py-2 text-sm"
                        >
                          <option value="LOW">Bajo</option>
                          <option value="MEDIUM">Medio</option>
                          <option value="HIGH">Alto</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-xs text-gray-500 mb-1">⚙️ Operacional</label>
                        <select
                          value={formData.impactOperational}
                          onChange={(e) => setFormData({ ...formData, impactOperational: e.target.value })}
                          className="w-full rounded-md border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 px-3 py-2 text-sm"
                        >
                          <option value="LOW">Bajo</option>
                          <option value="MEDIUM">Medio</option>
                          <option value="HIGH">Alto</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-xs text-gray-500 mb-1">📢 Reputacional</label>
                        <select
                          value={formData.impactReputational}
                          onChange={(e) => setFormData({ ...formData, impactReputational: e.target.value })}
                          className="w-full rounded-md border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 px-3 py-2 text-sm"
                        >
                          <option value="LOW">Bajo</option>
                          <option value="MEDIUM">Medio</option>
                          <option value="HIGH">Alto</option>
                        </select>
                      </div>
                    </div>
                  </div>

                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium mb-2">
                      Sistemas/Activos Afectados
                    </label>
                    <Input
                      value={formData.affectedSystems}
                      onChange={(e) => setFormData({ ...formData, affectedSystems: e.target.value })}
                      placeholder="Ej: Servidor web principal, Base de datos de clientes"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">
                      <User className="inline h-4 w-4 mr-1" />
                      Responsable Asignado
                    </label>
                    <Input
                      value={formData.assignedTo}
                      onChange={(e) => setFormData({ ...formData, assignedTo: e.target.value })}
                      placeholder="Ej: Juan Pérez"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">
                      <FileText className="inline h-4 w-4 mr-1" />
                      Referencia de evidencia
                    </label>
                    <Input
                      placeholder="URL o referencia de evidencia"
                      onKeyDown={(e) => {
                        if (e.key === "Enter") {
                          e.preventDefault();
                          const val = (e.target as HTMLInputElement).value.trim();
                          if (val) {
                            setFormData({ ...formData, evidences: [...formData.evidences, val] });
                            (e.target as HTMLInputElement).value = "";
                          }
                        }
                      }}
                    />
                    {formData.evidences.length > 0 && (
                      <div className="flex flex-wrap gap-1 mt-2">
                        {formData.evidences.map((ev, i) => (
                          <span key={i} className="px-2 py-1 bg-blue-100 text-blue-700 rounded text-xs flex items-center gap-1">
                            <LinkIcon className="h-3 w-3" />
                            {ev.length > 30 ? ev.slice(0, 30) + "..." : ev}
                            <button type="button" className="ml-1 hover:text-red-500" onClick={() => setFormData({ ...formData, evidences: formData.evidences.filter((_, idx) => idx !== i) })}>×</button>
                          </span>
                        ))}
                      </div>
                    )}
                  </div>

                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium mb-2">
                      Notas Adicionales / Acciones Tomadas
                    </label>
                    <textarea
                      value={formData.notes}
                      onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                      placeholder="Registre las acciones inmediatas tomadas..."
                      rows={3}
                      className="w-full rounded-md border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 px-3 py-2"
                    />
                  </div>
                </div>

                <div className="flex gap-3 pt-4">
                  <Button type="submit" disabled={loading} className="bg-red-600 hover:bg-red-700">
                    {loading ? "Guardando..." : editingIncident ? "Actualizar" : "Registrar Incidente"}
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => {
                      setShowForm(false);
                      setEditingIncident(null);
                      resetForm();
                    }}
                  >
                    Cancelar
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Detail Modal */}
      {showDetailModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 overflow-y-auto">
          <Card className="w-full max-w-3xl my-8">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <Eye className="h-5 w-5" />
                  Detalle del Incidente
                </CardTitle>
                <Button variant="outline" size="sm" onClick={() => setShowDetailModal(null)}>✕</Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h3 className="font-bold text-lg">{showDetailModal.title}</h3>
                <div className="flex gap-2 mt-2">
                  <span className={`px-3 py-1 rounded-full text-xs font-medium ${SEVERITY_CONFIG[showDetailModal.severity as keyof typeof SEVERITY_CONFIG]?.color}`}>
                    {SEVERITY_CONFIG[showDetailModal.severity as keyof typeof SEVERITY_CONFIG]?.icon} {SEVERITY_CONFIG[showDetailModal.severity as keyof typeof SEVERITY_CONFIG]?.label}
                  </span>
                  <span className={`px-3 py-1 rounded-full text-xs font-medium ${STATUS_CONFIG[showDetailModal.status as keyof typeof STATUS_CONFIG]?.color}`}>
                    {STATUS_CONFIG[showDetailModal.status as keyof typeof STATUS_CONFIG]?.label}
                  </span>
                  {showDetailModal.origin && (
                    <span className="px-3 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-700">
                      Origen: {showDetailModal.origin}
                    </span>
                  )}
                </div>
              </div>

              <div className="p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                <p className="text-sm">{showDetailModal.description}</p>
              </div>

              {/* SLA Section */}
              <div className="p-4 border rounded-lg">
                <h4 className="font-medium flex items-center gap-2 mb-3">
                  <Timer className="h-4 w-4" />
                  Control SLA
                </h4>
                {(() => {
                  const sla = getSLARemaining(showDetailModal);
                  const pct = Math.min(100, ((sla.total - sla.remaining) / sla.total) * 100);
                  return (
                    <div>
                      <div className="flex justify-between text-sm mb-1">
                        <span>SLA: {sla.total}h</span>
                        <span className={sla.exceeded ? "text-red-600 font-bold" : "text-green-600"}>
                          {sla.exceeded ? "⚠️ SLA EXCEDIDO" : `${sla.remaining.toFixed(1)}h restantes`}
                        </span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2.5">
                        <div
                          className={`h-2.5 rounded-full ${sla.exceeded ? "bg-red-600" : pct > 75 ? "bg-yellow-500" : "bg-green-500"}`}
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                    </div>
                  );
                })()}
              </div>

              {/* Impact Assessment */}
              <div className="p-4 border rounded-lg">
                <h4 className="font-medium flex items-center gap-2 mb-3">
                  <Shield className="h-4 w-4" />
                  Evaluación de Impacto
                </h4>
                <div className="grid grid-cols-3 gap-3">
                  {[
                    { label: "💰 Financiero", value: showDetailModal.impactFinancial || "N/A" },
                    { label: "⚙️ Operacional", value: showDetailModal.impactOperational || "N/A" },
                    { label: "📢 Reputacional", value: showDetailModal.impactReputational || "N/A" },
                  ].map((item) => (
                    <div key={item.label} className="text-center p-2 bg-gray-50 dark:bg-gray-900 rounded">
                      <p className="text-xs text-gray-500">{item.label}</p>
                      <p className={`font-bold text-sm ${item.value === "HIGH" ? "text-red-600" : item.value === "MEDIUM" ? "text-yellow-600" : "text-green-600"}`}>
                        {item.value === "HIGH" ? "Alto" : item.value === "MEDIUM" ? "Medio" : item.value === "LOW" ? "Bajo" : item.value}
                      </p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Info grid */}
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div><span className="font-medium">Categoría:</span> {showDetailModal.category}</div>
                <div><span className="font-medium">Responsable:</span> {showDetailModal.assignedTo || "Sin asignar"}</div>
                <div><span className="font-medium">Sistemas:</span> {showDetailModal.affectedSystems || "N/A"}</div>
                <div><span className="font-medium">Detectado:</span> {new Date(showDetailModal.detectedAt).toLocaleString("es-ES")}</div>
                {showDetailModal.resolvedAt && (
                  <div><span className="font-medium">Resuelto:</span> {new Date(showDetailModal.resolvedAt).toLocaleString("es-ES")}</div>
                )}
              </div>

              {/* Evidences */}
              {showDetailModal.evidences?.length > 0 && (
                <div className="p-4 border rounded-lg">
                  <h4 className="font-medium flex items-center gap-2 mb-2">
                    <FileText className="h-4 w-4" />
                    Evidencias
                  </h4>
                  <div className="space-y-1">
                    {showDetailModal.evidences.map((ev: string, i: number) => (
                      <div key={i} className="flex items-center gap-2 text-sm text-blue-600">
                        <LinkIcon className="h-3 w-3" />
                        <span>{ev}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Timeline */}
              <div className="p-4 border rounded-lg">
                <h4 className="font-medium mb-3">📋 Línea de Tiempo</h4>
                <div className="space-y-3">
                  <div className="flex items-start gap-3">
                    <div className="w-3 h-3 rounded-full bg-red-500 mt-1.5" />
                    <div>
                      <p className="text-sm font-medium">Detectado</p>
                      <p className="text-xs text-gray-500">{new Date(showDetailModal.detectedAt).toLocaleString("es-ES")}</p>
                    </div>
                  </div>
                  {showDetailModal.status !== "OPEN" && (
                    <div className="flex items-start gap-3">
                      <div className="w-3 h-3 rounded-full bg-yellow-500 mt-1.5" />
                      <div>
                        <p className="text-sm font-medium">En investigación</p>
                        <p className="text-xs text-gray-500">Estado cambiado a En Progreso</p>
                      </div>
                    </div>
                  )}
                  {showDetailModal.resolvedAt && (
                    <div className="flex items-start gap-3">
                      <div className="w-3 h-3 rounded-full bg-green-500 mt-1.5" />
                      <div>
                        <p className="text-sm font-medium">Resuelto</p>
                        <p className="text-xs text-gray-500">{new Date(showDetailModal.resolvedAt).toLocaleString("es-ES")}</p>
                      </div>
                    </div>
                  )}
                  {showDetailModal.closedAt && (
                    <div className="flex items-start gap-3">
                      <div className="w-3 h-3 rounded-full bg-gray-500 mt-1.5" />
                      <div>
                        <p className="text-sm font-medium">Cerrado</p>
                        <p className="text-xs text-gray-500">{new Date(showDetailModal.closedAt).toLocaleString("es-ES")}</p>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {showDetailModal.notes && (
                <div className="p-3 bg-gray-100 dark:bg-gray-800 rounded-md">
                  <p className="text-sm font-medium mb-1">Notas:</p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">{showDetailModal.notes}</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      )}

      {/* Incidents Table */}
      <Card>
        <CardHeader>
          <CardTitle>Registro de Incidentes</CardTitle>
          <CardDescription>
            {filteredIncidents.length} incidente{filteredIncidents.length !== 1 ? 's' : ''} registrado{filteredIncidents.length !== 1 ? 's' : ''}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {filteredIncidents.length === 0 ? (
            <div className="text-center py-12">
              <AlertTriangle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600 dark:text-gray-400">No hay incidentes registrados</p>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredIncidents.map((incident) => {
                const sla = getSLARemaining(incident);
                return (
                <div
                  key={incident.id}
                  className="border rounded-lg p-4 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2 flex-wrap">
                        <h3 className="font-semibold text-lg">{incident.title}</h3>
                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${SEVERITY_CONFIG[incident.severity as keyof typeof SEVERITY_CONFIG].color}`}>
                          {SEVERITY_CONFIG[incident.severity as keyof typeof SEVERITY_CONFIG].icon} {SEVERITY_CONFIG[incident.severity as keyof typeof SEVERITY_CONFIG].label}
                        </span>
                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${STATUS_CONFIG[incident.status as keyof typeof STATUS_CONFIG].color}`}>
                          {STATUS_CONFIG[incident.status as keyof typeof STATUS_CONFIG].label}
                        </span>
                        {/* SLA Badge */}
                        {incident.status !== "CLOSED" && incident.status !== "RESOLVED" && (
                          <span className={`px-3 py-1 rounded-full text-xs font-medium flex items-center gap-1 ${sla.exceeded ? "bg-red-100 text-red-700" : sla.remaining < sla.total * 0.25 ? "bg-yellow-100 text-yellow-700" : "bg-green-100 text-green-700"}`}>
                            <Timer className="h-3 w-3" />
                            {sla.exceeded ? "SLA excedido" : `${sla.remaining.toFixed(1)}h restantes`}
                          </span>
                        )}
                      </div>
                      
                      <p className="text-sm text-gray-600 dark:text-gray-400 mb-3 line-clamp-2">
                        {incident.description}
                      </p>

                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                        <div>
                          <span className="font-medium">Categoría:</span>
                          <p className="text-gray-600 dark:text-gray-400">{incident.category}</p>
                        </div>
                        {incident.origin && (
                          <div>
                            <span className="font-medium">Origen:</span>
                            <p className="text-gray-600 dark:text-gray-400">{incident.origin}</p>
                          </div>
                        )}
                        {incident.assignedTo && (
                          <div>
                            <span className="font-medium">Responsable:</span>
                            <p className="text-gray-600 dark:text-gray-400">{incident.assignedTo}</p>
                          </div>
                        )}
                        <div>
                          <span className="font-medium">Detectado:</span>
                          <p className="text-gray-600 dark:text-gray-400">
                            {new Date(incident.detectedAt).toLocaleString("es-ES")}
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="flex gap-2 ml-4">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setShowDetailModal(incident)}
                        title="Ver detalle"
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleEdit(incident)}
                        title="Editar"
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDelete(incident.id)}
                        title="Eliminar"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
