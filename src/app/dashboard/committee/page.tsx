"use client";

import { useSession } from "next-auth/react";
import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Users, UserPlus, Edit, Trash2, Shield, Building, Mail, Phone, Calendar, Clock, FileText, Plus, CheckCircle, Power, MoreHorizontal, Eye } from "lucide-react";

const ROLES = [
  "CISO - Chief Information Security Officer",
  "Oficial de Seguridad de la Información",
  "Miembro del Directorio",
  "Gerente de TI",
  "Analista de Seguridad",
  "Responsable de Cumplimiento",
  "Coordinador de Respuesta a Incidentes",
  "Auditor Interno",
  "DPO - Data Protection Officer",
  "Otro"
];

export default function CommitteePage() {
  const { data: session } = useSession();
  const [members, setMembers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingMember, setEditingMember] = useState<any>(null);
  const [filterStatus, setFilterStatus] = useState<string>("ALL");

  const [formData, setFormData] = useState({
    name: "",
    role: "",
    email: "",
    phone: "",
    department: "",
    responsibilities: "",
    notes: "",
  });

  // Sessions state
  const [sessions, setSessions] = useState<any[]>([]);
  const [showSessionForm, setShowSessionForm] = useState(false);
  const [sessionForm, setSessionForm] = useState({
    date: new Date().toISOString().split("T")[0],
    time: "10:00",
    topic: "",
    description: "",
    decisions: "",
    attendees: "",
    status: "SCHEDULED",
  });

  useEffect(() => {
    loadMembers();
    loadSessions();
  }, []);

  const loadMembers = async () => {
    try {
      setLoading(true);
      const response = await fetch("/api/committee");
      const data = await response.json();
      setMembers(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("Error loading committee members:", error);
    } finally {
      setLoading(false);
    }
  };

  const loadSessions = async () => {
    try {
      const response = await fetch("/api/committee/sessions");
      const data = await response.json();
      setSessions(Array.isArray(data) ? data : []);
    } catch (error) {
      // Sessions API may not exist yet, that's fine
      setSessions([]);
    }
  };

  const handleSessionSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await fetch("/api/committee/sessions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(sessionForm),
      });
      if (!response.ok) throw new Error("Error al crear sesión");
      setShowSessionForm(false);
      setSessionForm({ date: new Date().toISOString().split("T")[0], time: "10:00", topic: "", description: "", decisions: "", attendees: "", status: "SCHEDULED" });
      await loadSessions();
    } catch (error) {
      console.error("Error creating session:", error);
      alert("Error al guardar la sesión");
    }
  };

  const handleSessionComplete = async (sessionId: string) => {
    try {
      const response = await fetch("/api/committee/sessions", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: sessionId, status: "COMPLETED" }),
      });
      if (!response.ok) throw new Error("Error al completar sesión");
      await loadSessions();
    } catch (error) {
      console.error("Error completing session:", error);
    }
  };

  const handleSessionDelete = async (sessionId: string) => {
    if (!confirm("¿Eliminar esta sesión?")) return;
    try {
      await fetch(`/api/committee/sessions?id=${sessionId}`, { method: "DELETE" });
      await loadSessions();
    } catch (error) {
      console.error("Error deleting session:", error);
    }
  };

  const resetForm = () => {
    setFormData({
      name: "",
      role: "",
      email: "",
      phone: "",
      department: "",
      responsibilities: "",
      notes: "",
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const url = editingMember 
        ? `/api/committee/${editingMember.id}`
        : "/api/committee";
      
      const method = editingMember ? "PUT" : "POST";

      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        throw new Error("Error al guardar miembro");
      }

      setShowForm(false);
      setEditingMember(null);
      resetForm();
      loadMembers();
    } catch (error) {
      console.error("Error:", error);
      alert("Error al guardar miembro del comité");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("¿Estás seguro de eliminar este miembro del comité?")) return;

    try {
      await fetch(`/api/committee/${id}`, { method: "DELETE" });
      loadMembers();
    } catch (error) {
      console.error("Error eliminando miembro:", error);
    }
  };

  const handleEdit = (member: any) => {
    setEditingMember(member);
    setFormData({
      name: member.name,
      role: member.role,
      email: member.email,
      phone: member.phone || "",
      department: member.department || "",
      responsibilities: member.responsibilities || "",
      notes: member.notes || "",
    });
    setShowForm(true);
  };

  const handleToggleStatus = async (member: any) => {
    try {
      const newStatus = member.status === "ACTIVE" ? "INACTIVE" : "ACTIVE";
      await fetch(`/api/committee/${member.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...member, status: newStatus }),
      });
      loadMembers();
    } catch (error) {
      console.error("Error updating status:", error);
    }
  };

  const filteredMembers = members.filter(member => {
    if (filterStatus === "ALL") return true;
    return member.status === filterStatus;
  });

  const activeCount = members.filter(m => m.status === "ACTIVE").length;
  const inactiveCount = members.filter(m => m.status === "INACTIVE").length;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-3">
            <Users className="h-8 w-8 text-blue-600" />
            Comité de Ciberseguridad
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-2">
            Gestión del comité según ISO 27001 y Ley 21.663
          </p>
        </div>
        <Button onClick={() => { setShowForm(true); setEditingMember(null); resetForm(); }}>
          <UserPlus className="h-4 w-4 mr-2" />
          Agregar Miembro
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-blue-100 dark:bg-blue-900 rounded-lg">
                <Users className="h-6 w-6 text-blue-600" />
              </div>
              <div>
                <div className="text-2xl font-bold">{members.length}</div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Miembros Totales</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-green-100 dark:bg-green-900 rounded-lg">
                <Shield className="h-6 w-6 text-green-600" />
              </div>
              <div>
                <div className="text-2xl font-bold">{activeCount}</div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Activos</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-indigo-100 dark:bg-indigo-900 rounded-lg">
                <Calendar className="h-6 w-6 text-indigo-600" />
              </div>
              <div>
                <div className="text-2xl font-bold">{sessions.filter(s => new Date(s.date || s.createdAt).getFullYear() === new Date().getFullYear()).length}</div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Sesiones Año Actual</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-amber-100 dark:bg-amber-900 rounded-lg">
                <Clock className="h-6 w-6 text-amber-600" />
              </div>
              <div>
                <div className="text-2xl font-bold">{sessions.filter(s => s.status === "SCHEDULED").length}</div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Decisiones Pendientes</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex gap-2">
            <Button
              variant={filterStatus === "ALL" ? "default" : "outline"}
              onClick={() => setFilterStatus("ALL")}
              size="sm"
            >
              Todos
            </Button>
            <Button
              variant={filterStatus === "ACTIVE" ? "default" : "outline"}
              onClick={() => setFilterStatus("ACTIVE")}
              size="sm"
            >
              Activos
            </Button>
            <Button
              variant={filterStatus === "INACTIVE" ? "default" : "outline"}
              onClick={() => setFilterStatus("INACTIVE")}
              size="sm"
            >
              Inactivos
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Form Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <Card className="max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <CardHeader>
              <CardTitle>
                {editingMember ? "Editar Miembro" : "Nuevo Miembro del Comité"}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">
                      Nombre Completo <span className="text-red-500">*</span>
                    </label>
                    <Input
                      required
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      placeholder="Juan Pérez"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">
                      Rol/Cargo <span className="text-red-500">*</span>
                    </label>
                    <select
                      required
                      value={formData.role}
                      onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                      className="w-full rounded-md border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 px-3 py-2"
                    >
                      <option value="">Seleccione un rol</option>
                      {ROLES.map((role) => (
                        <option key={role} value={role}>{role}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">
                      Email <span className="text-red-500">*</span>
                    </label>
                    <Input
                      required
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      placeholder="juan.perez@empresa.com"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">
                      Teléfono
                    </label>
                    <Input
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      placeholder="+56 9 1234 5678"
                    />
                  </div>

                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium mb-2">
                      Departamento/Área
                    </label>
                    <Input
                      value={formData.department}
                      onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                      placeholder="Tecnología, Seguridad, Operaciones, etc."
                    />
                  </div>

                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium mb-2">
                      Responsabilidades
                    </label>
                    <Textarea
                      value={formData.responsibilities}
                      onChange={(e: any) => setFormData({ ...formData, responsibilities: e.target.value })}
                      placeholder="Describa las responsabilidades específicas del miembro en el comité"
                      rows={3}
                    />
                  </div>

                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium mb-2">
                      Notas Adicionales
                    </label>
                    <Textarea
                      value={formData.notes}
                      onChange={(e: any) => setFormData({ ...formData, notes: e.target.value })}
                      placeholder="Información adicional relevante"
                      rows={2}
                    />
                  </div>
                </div>

                <div className="flex gap-3 pt-4">
                  <Button type="submit" disabled={loading} className="flex-1">
                    {loading ? "Guardando..." : editingMember ? "Actualizar" : "Crear Miembro"}
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => {
                      setShowForm(false);
                      setEditingMember(null);
                      resetForm();
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

      {/* Members List */}
      <div className="space-y-4">
        {filteredMembers.length === 0 ? (
          <Card>
            <CardContent className="pt-6 text-center text-gray-500">
              <Users className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>No hay miembros registrados en el comité</p>
              <p className="text-sm mt-2">Comienza agregando el primer miembro</p>
            </CardContent>
          </Card>
        ) : (
          filteredMembers.map((member) => {
            const initials = (member.name || '').split(' ').map((w: string) => w[0]).join('').toUpperCase().slice(0, 2)
            const isActive = member.status === 'ACTIVE'
            return (
              <div key={member.id} className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 hover:shadow-md transition-all overflow-hidden">
                <div className="p-5">
                  <div className="flex items-start gap-4">
                    {/* Avatar */}
                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 text-white font-bold text-sm ${
                      isActive ? 'bg-gradient-to-br from-blue-500 to-indigo-600' : 'bg-gradient-to-br from-gray-400 to-gray-500'
                    }`}>
                      {initials}
                    </div>

                    {/* Info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap mb-0.5">
                        <h3 className="font-semibold text-gray-900 dark:text-white">{member.name}</h3>
                        <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold ${
                          isActive
                            ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                            : 'bg-gray-100 text-gray-500 dark:bg-gray-700 dark:text-gray-400'
                        }`}>
                          <span className={`w-1.5 h-1.5 rounded-full ${isActive ? 'bg-green-500' : 'bg-gray-400'}`} />
                          {isActive ? 'Activo' : 'Inactivo'}
                        </span>
                      </div>
                      <p className="text-sm text-blue-600 dark:text-blue-400 font-medium">{member.role}</p>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-1 flex-shrink-0">
                      <button
                        onClick={() => handleEdit(member)}
                        className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors"
                        title="Editar"
                      >
                        <Edit className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => handleToggleStatus(member)}
                        className={`p-2 rounded-lg transition-colors ${
                          isActive
                            ? 'text-gray-400 hover:text-orange-600 hover:bg-orange-50 dark:hover:bg-orange-900/20'
                            : 'text-gray-400 hover:text-green-600 hover:bg-green-50 dark:hover:bg-green-900/20'
                        }`}
                        title={isActive ? 'Desactivar miembro' : 'Activar miembro'}
                      >
                        <Power className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(member.id)}
                        className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                        title="Eliminar"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>

                  {/* Contact grid */}
                  <div className="mt-4 grid grid-cols-2 md:grid-cols-4 gap-3">
                    <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400 min-w-0">
                      <Mail className="h-3.5 w-3.5 text-gray-400 flex-shrink-0" />
                      <a href={`mailto:${member.email}`} className="truncate hover:text-blue-600 transition-colors">{member.email}</a>
                    </div>
                    {member.phone && (
                      <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                        <Phone className="h-3.5 w-3.5 text-gray-400 flex-shrink-0" />
                        <span className="truncate">{member.phone}</span>
                      </div>
                    )}
                    {member.department && (
                      <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                        <Building className="h-3.5 w-3.5 text-gray-400 flex-shrink-0" />
                        <span>{member.department}</span>
                      </div>
                    )}
                    <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                      <Calendar className="h-3.5 w-3.5 text-gray-400 flex-shrink-0" />
                      <span>Desde {new Date(member.appointedDate).toLocaleDateString('es-CL')}</span>
                    </div>
                  </div>

                  {/* Responsibilities & Notes */}
                  {(member.responsibilities || member.notes) && (
                    <div className="mt-3 space-y-2">
                      {member.responsibilities && (
                        <div className="bg-blue-50 dark:bg-blue-900/15 px-3 py-2.5 rounded-lg">
                          <p className="text-xs font-semibold text-blue-700 dark:text-blue-400 mb-0.5">Responsabilidades</p>
                          <p className="text-xs text-gray-700 dark:text-gray-300 whitespace-pre-line leading-relaxed">{member.responsibilities}</p>
                        </div>
                      )}
                      {member.notes && (
                        <div className="bg-amber-50 dark:bg-amber-900/15 px-3 py-2.5 rounded-lg">
                          <p className="text-xs font-semibold text-amber-700 dark:text-amber-400 mb-0.5">Notas</p>
                          <p className="text-xs text-gray-700 dark:text-gray-300 leading-relaxed">{member.notes}</p>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            )
          })
        )}
      </div>

      {/* Sessions Section */}
      <Card className="border-none shadow-lg">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5 text-indigo-600" />
                Sesiones del Comité
              </CardTitle>
              <p className="text-sm text-gray-500 mt-1">
                Sesiones: {sessions.length} | Decisiones pendientes: {sessions.filter(s => s.status === "SCHEDULED").length}
              </p>
            </div>
            <Button onClick={() => setShowSessionForm(true)} variant="outline">
              <Plus className="h-4 w-4 mr-2" />
              Crear Sesión
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {showSessionForm && (
            <form onSubmit={handleSessionSubmit} className="mb-6 p-4 border rounded-lg bg-gray-50 dark:bg-gray-800/50 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Fecha</label>
                  <Input
                    type="date"
                    value={sessionForm.date}
                    onChange={(e) => setSessionForm({ ...sessionForm, date: e.target.value })}
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Hora</label>
                  <Input
                    type="time"
                    value={sessionForm.time}
                    onChange={(e) => setSessionForm({ ...sessionForm, time: e.target.value })}
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Estado</label>
                  <select
                    value={sessionForm.status}
                    onChange={(e) => setSessionForm({ ...sessionForm, status: e.target.value })}
                    className="w-full rounded-md border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 px-3 py-2 text-sm"
                  >
                    <option value="SCHEDULED">Programada</option>
                    <option value="COMPLETED">Completada</option>
                    <option value="CANCELLED">Cancelada</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Tema Principal *</label>
                <Input
                  value={sessionForm.topic}
                  onChange={(e) => setSessionForm({ ...sessionForm, topic: e.target.value })}
                  placeholder="Ej: Revisión trimestral de riesgos"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Descripción / Agenda</label>
                <Textarea
                  value={sessionForm.description}
                  onChange={(e: any) => setSessionForm({ ...sessionForm, description: e.target.value })}
                  placeholder="Agenda de la sesión..."
                  rows={2}
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Asistentes</label>
                <Input
                  value={sessionForm.attendees}
                  onChange={(e) => setSessionForm({ ...sessionForm, attendees: e.target.value })}
                  placeholder="Nombres separados por coma"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Decisiones / Acuerdos</label>
                <Textarea
                  value={sessionForm.decisions}
                  onChange={(e: any) => setSessionForm({ ...sessionForm, decisions: e.target.value })}
                  placeholder="Registrar decisiones tomadas..."
                  rows={2}
                />
              </div>
              <div className="flex gap-3">
                <Button type="submit">Guardar Sesión</Button>
                <Button type="button" variant="outline" onClick={() => setShowSessionForm(false)}>Cancelar</Button>
              </div>
            </form>
          )}

          {sessions.length === 0 && !showSessionForm ? (
            <div className="text-center py-8 text-gray-500">
              <Calendar className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>No hay sesiones registradas</p>
              <Button onClick={() => setShowSessionForm(true)} className="mt-4" variant="outline">
                <Plus className="h-4 w-4 mr-2" />
                Crear primera sesión
              </Button>
            </div>
          ) : (
            <div className="space-y-3">
              {sessions
                .sort((a, b) => new Date(b.date || b.createdAt).getTime() - new Date(a.date || a.createdAt).getTime())
                .map((sess) => (
                  <div key={sess.id} className="flex items-start justify-between p-4 border rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800/50">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-1">
                        <h4 className="font-medium">{sess.topic}</h4>
                        <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                          sess.status === "COMPLETED" ? "bg-green-100 text-green-700" :
                          sess.status === "CANCELLED" ? "bg-red-100 text-red-700" :
                          "bg-blue-100 text-blue-700"
                        }`}>
                          {sess.status === "COMPLETED" ? "Completada" : sess.status === "CANCELLED" ? "Cancelada" : "Programada"}
                        </span>
                      </div>
                      <div className="flex items-center gap-4 text-xs text-gray-500">
                        <span className="flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          {new Date(sess.date).toLocaleDateString('es-CL')} {sess.time}
                        </span>
                        {sess.attendees && (
                          <span className="flex items-center gap-1">
                            <Users className="h-3 w-3" />
                            {sess.attendees}
                          </span>
                        )}
                      </div>
                      {sess.decisions && (
                        <p className="text-sm text-gray-600 mt-2 flex items-start gap-1">
                          <FileText className="h-3 w-3 mt-0.5 shrink-0" />
                          {sess.decisions}
                        </p>
                      )}
                    </div>
                    <div className="flex items-center gap-2 ml-3">
                      {sess.status === "SCHEDULED" && (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleSessionComplete(sess.id)}
                        >
                          <CheckCircle className="h-4 w-4 mr-1" />
                          Completar
                        </Button>
                      )}
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleSessionDelete(sess.id)}
                        className="text-red-600 hover:text-red-700"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Info Box */}
      <Card className="border-blue-200 bg-blue-50 dark:bg-blue-900/20">
        <CardContent className="pt-6">
          <div className="flex items-start gap-3">
            <Shield className="h-5 w-5 text-blue-600 mt-0.5" />
            <div className="text-sm">
              <p className="font-semibold text-blue-900 dark:text-blue-100 mb-1">
                Importancia del Comité de Ciberseguridad
              </p>
              <ul className="list-disc list-inside space-y-1 text-blue-800 dark:text-blue-200">
                <li>ISO 27001:2022 - Anexo A.5.2: Roles y responsabilidades de seguridad</li>
                <li>Ley 21.663 Art. 24: Responsabilidad del directorio en supervisión</li>
                <li>Ley 21.663 Art. 25: Designación de oficial de seguridad (CISO)</li>
                <li>Gobernanza y toma de decisiones en ciberseguridad</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
