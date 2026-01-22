"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { 
  AlertTriangle, Plus, Eye, Edit, Trash2, 
  CheckCircle, Clock, XCircle, AlertCircle,
  Filter, Search, Calendar
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

export default function IncidentsPage() {
  const { data: session } = useSession();
  const [incidents, setIncidents] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [editingIncident, setEditingIncident] = useState<any>(null);
  const [filterStatus, setFilterStatus] = useState<string>("ALL");
  const [searchTerm, setSearchTerm] = useState("");

  // Form state
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    severity: "MEDIUM",
    category: "",
    affectedSystems: "",
    assignedTo: "",
    notes: "",
  });

  useEffect(() => {
    loadIncidents();
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
      affectedSystems: incident.affectedSystems || "",
      assignedTo: incident.assignedTo || "",
      notes: incident.notes || "",
    });
    setShowForm(true);
  };

  const resetForm = () => {
    setFormData({
      title: "",
      description: "",
      severity: "MEDIUM",
      category: "",
      affectedSystems: "",
      assignedTo: "",
      notes: "",
    });
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

      {/* Form Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 overflow-y-auto">
          <Card className="w-full max-w-3xl">
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

                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium mb-2">
                      Descripción <span className="text-red-500">*</span>
                    </label>
                    <textarea
                      required
                      value={formData.description}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                      placeholder="Describa el incidente de forma detallada..."
                      rows={4}
                      className="w-full rounded-md border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 px-3 py-2"
                    />
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

                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium mb-2">
                      Responsable Asignado
                    </label>
                    <Input
                      value={formData.assignedTo}
                      onChange={(e) => setFormData({ ...formData, assignedTo: e.target.value })}
                      placeholder="Ej: Juan Pérez - Equipo de Seguridad"
                    />
                  </div>

                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium mb-2">
                      Notas Adicionales / Acciones Tomadas
                    </label>
                    <textarea
                      value={formData.notes}
                      onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                      placeholder="Registre las acciones inmediatas tomadas, evidencias recopiladas, etc."
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
              {filteredIncidents.map((incident) => (
                <div
                  key={incident.id}
                  className="border rounded-lg p-4 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="font-semibold text-lg">{incident.title}</h3>
                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${SEVERITY_CONFIG[incident.severity as keyof typeof SEVERITY_CONFIG].color}`}>
                          {SEVERITY_CONFIG[incident.severity as keyof typeof SEVERITY_CONFIG].icon} {SEVERITY_CONFIG[incident.severity as keyof typeof SEVERITY_CONFIG].label}
                        </span>
                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${STATUS_CONFIG[incident.status as keyof typeof STATUS_CONFIG].color}`}>
                          {STATUS_CONFIG[incident.status as keyof typeof STATUS_CONFIG].label}
                        </span>
                      </div>
                      
                      <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                        {incident.description}
                      </p>

                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                        <div>
                          <span className="font-medium">Categoría:</span>
                          <p className="text-gray-600 dark:text-gray-400">{incident.category}</p>
                        </div>
                        {incident.affectedSystems && (
                          <div>
                            <span className="font-medium">Sistemas Afectados:</span>
                            <p className="text-gray-600 dark:text-gray-400">{incident.affectedSystems}</p>
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
                        {incident.resolvedAt && (
                          <div>
                            <span className="font-medium">Resuelto:</span>
                            <p className="text-gray-600 dark:text-gray-400">
                              {new Date(incident.resolvedAt).toLocaleString("es-ES")}
                            </p>
                          </div>
                        )}
                        {incident.closedAt && (
                          <div>
                            <span className="font-medium">Cerrado:</span>
                            <p className="text-gray-600 dark:text-gray-400">
                              {new Date(incident.closedAt).toLocaleString("es-ES")}
                            </p>
                          </div>
                        )}
                      </div>

                      {incident.notes && (
                        <div className="mt-3 p-3 bg-gray-100 dark:bg-gray-800 rounded-md">
                          <p className="text-sm font-medium mb-1">Notas:</p>
                          <p className="text-sm text-gray-600 dark:text-gray-400">{incident.notes}</p>
                        </div>
                      )}
                    </div>

                    <div className="flex gap-2 ml-4">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleEdit(incident)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDelete(incident.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
