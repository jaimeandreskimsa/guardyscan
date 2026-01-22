"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { 
  Shield, Calendar, AlertCircle, CreditCard, ChevronRight, 
  Building2, Users, Plus, Mail, Crown, ShieldCheck, Eye, 
  UserPlus, Trash2, X, Check, Loader2
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import Link from "next/link";

interface Organization {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  website: string | null;
  industry: string | null;
  size: string | null;
  ownerId: string;
  createdAt: string;
  members?: OrganizationMember[];
  _count?: { members: number; invitations: number };
}

interface OrganizationMember {
  id: string;
  userId: string;
  role: "OWNER" | "ADMIN" | "MEMBER" | "VIEWER";
  joinedAt: string;
  user: {
    id: string;
    name: string | null;
    email: string;
    image: string | null;
  };
}

interface Invitation {
  id: string;
  email: string;
  role: string;
  expiresAt: string;
}

const roleLabels: Record<string, { label: string; icon: any; color: string }> = {
  OWNER: { label: "Dueño", icon: Crown, color: "text-yellow-600 bg-yellow-100 dark:bg-yellow-900/30" },
  ADMIN: { label: "Admin", icon: ShieldCheck, color: "text-blue-600 bg-blue-100 dark:bg-blue-900/30" },
  MEMBER: { label: "Miembro", icon: Users, color: "text-green-600 bg-green-100 dark:bg-green-900/30" },
  VIEWER: { label: "Visor", icon: Eye, color: "text-gray-600 bg-gray-100 dark:bg-gray-800" },
};

const industries = [
  "Tecnología",
  "Finanzas",
  "Salud",
  "Educación",
  "Retail",
  "Manufactura",
  "Servicios",
  "Gobierno",
  "ONG",
  "Otro"
];

const companySizes = [
  { value: "1-10", label: "1-10 empleados" },
  { value: "11-50", label: "11-50 empleados" },
  { value: "51-200", label: "51-200 empleados" },
  { value: "201-500", label: "201-500 empleados" },
  { value: "500+", label: "500+ empleados" },
];

export default function SettingsPage() {
  const [loading, setLoading] = useState(false);
  const [config, setConfig] = useState({
    autoScanEnabled: false,
    autoScanUrl: "",
    lastAutoScan: null as string | null,
  });
  const { toast } = useToast();

  // Organization state
  const [organizations, setOrganizations] = useState<{
    owned: Organization[];
    member: (Organization & { myRole: string })[];
  }>({ owned: [], member: [] });
  const [orgLimits, setOrgLimits] = useState<{
    plan: string;
    maxOrganizations: number;
    currentCount: number;
    canCreate: boolean;
  } | null>(null);
  const [selectedOrg, setSelectedOrg] = useState<Organization | null>(null);
  const [orgMembers, setOrgMembers] = useState<OrganizationMember[]>([]);
  const [orgInvitations, setOrgInvitations] = useState<Invitation[]>([]);
  const [showCreateOrg, setShowCreateOrg] = useState(false);
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [orgLoading, setOrgLoading] = useState(false);
  
  const [newOrg, setNewOrg] = useState({
    name: "",
    description: "",
    website: "",
    industry: "",
    size: ""
  });
  
  const [inviteData, setInviteData] = useState({
    email: "",
    role: "MEMBER"
  });

  useEffect(() => {
    fetchConfig();
    fetchOrganizations();
  }, []);

  const fetchConfig = async () => {
    try {
      const res = await fetch("/api/auto-scan/config");
      if (res.ok) {
        const data = await res.json();
        setConfig(data);
      }
    } catch (error) {
      console.error("Error fetching config:", error);
    }
  };

  const fetchOrganizations = async () => {
    try {
      const res = await fetch("/api/organizations");
      if (res.ok) {
        const data = await res.json();
        setOrganizations({ owned: data.owned, member: data.member });
        if (data.limits) {
          setOrgLimits(data.limits);
        }
      }
    } catch (error) {
      console.error("Error fetching organizations:", error);
    }
  };

  const fetchOrgDetails = async (orgId: string) => {
    setOrgLoading(true);
    try {
      const [orgRes, membersRes] = await Promise.all([
        fetch(`/api/organizations/${orgId}`),
        fetch(`/api/organizations/${orgId}/members`)
      ]);

      if (orgRes.ok) {
        const org = await orgRes.json();
        setSelectedOrg(org);
      }

      if (membersRes.ok) {
        const data = await membersRes.json();
        setOrgMembers(data.members);
        setOrgInvitations(data.invitations);
      }
    } catch (error) {
      console.error("Error fetching org details:", error);
    } finally {
      setOrgLoading(false);
    }
  };

  const handleSave = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/auto-scan/config", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          autoScanEnabled: config.autoScanEnabled,
          autoScanUrl: config.autoScanUrl,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Error al guardar");
      }

      toast({
        title: "✅ Configuración guardada",
        description: "El escaneo automático se ha configurado correctamente",
      });

      fetchConfig();
    } catch (error: any) {
      toast({
        title: "❌ Error",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCreateOrg = async () => {
    if (!newOrg.name.trim()) {
      toast({ title: "Error", description: "El nombre es requerido", variant: "destructive" });
      return;
    }

    setOrgLoading(true);
    try {
      const res = await fetch("/api/organizations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newOrg)
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error);
      }

      toast({
        title: "✅ Empresa creada",
        description: `${data.name} ha sido creada correctamente`
      });

      setShowCreateOrg(false);
      setNewOrg({ name: "", description: "", website: "", industry: "", size: "" });
      fetchOrganizations();
      fetchOrgDetails(data.id);
    } catch (error: any) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } finally {
      setOrgLoading(false);
    }
  };

  const handleInviteMember = async () => {
    if (!inviteData.email.trim() || !selectedOrg) {
      toast({ title: "Error", description: "El email es requerido", variant: "destructive" });
      return;
    }

    setOrgLoading(true);
    try {
      const res = await fetch(`/api/organizations/${selectedOrg.id}/members`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(inviteData)
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error);
      }

      toast({
        title: data.type === "member_added" ? "✅ Usuario agregado" : "📧 Invitación enviada",
        description: data.message
      });

      setShowInviteModal(false);
      setInviteData({ email: "", role: "MEMBER" });
      fetchOrgDetails(selectedOrg.id);
    } catch (error: any) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } finally {
      setOrgLoading(false);
    }
  };

  const handleRemoveMember = async (memberId: string) => {
    if (!selectedOrg) return;
    
    if (!confirm("¿Estás seguro de eliminar este miembro?")) return;

    try {
      const res = await fetch(`/api/organizations/${selectedOrg.id}/members/${memberId}`, {
        method: "DELETE"
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error);
      }

      toast({ title: "✅ Miembro eliminado", description: "El miembro ha sido removido de la organización" });
      fetchOrgDetails(selectedOrg.id);
    } catch (error: any) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    }
  };

  const handleUpdateRole = async (memberId: string, newRole: string) => {
    if (!selectedOrg) return;

    try {
      const res = await fetch(`/api/organizations/${selectedOrg.id}/members/${memberId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ role: newRole })
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error);
      }

      toast({ title: "✅ Rol actualizado" });
      fetchOrgDetails(selectedOrg.id);
    } catch (error: any) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    }
  };

  const handleDeleteOrg = async () => {
    if (!selectedOrg) return;
    
    if (!confirm(`¿Estás seguro de eliminar "${selectedOrg.name}"? Esta acción no se puede deshacer.`)) return;

    try {
      const res = await fetch(`/api/organizations/${selectedOrg.id}`, {
        method: "DELETE"
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error);
      }

      toast({ title: "✅ Empresa eliminada" });
      setSelectedOrg(null);
      fetchOrganizations();
    } catch (error: any) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Configuración</h1>
        <p className="text-gray-600 dark:text-gray-400">
          Gestiona tu cuenta, empresa y preferencias
        </p>
      </div>

      {/* Organization Section */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 bg-purple-100 dark:bg-purple-900 rounded-lg flex items-center justify-center">
                <Building2 className="h-6 w-6 text-purple-600 dark:text-purple-400" />
              </div>
              <div>
                <CardTitle>Empresa / Organización</CardTitle>
                <CardDescription>
                  Crea tu empresa y gestiona los usuarios que pueden acceder
                  {orgLimits && (
                    <span className="ml-2 text-xs">
                      ({orgLimits.currentCount}/{orgLimits.maxOrganizations} empresas)
                    </span>
                  )}
                </CardDescription>
              </div>
            </div>
            <div className="flex flex-col items-end gap-1">
              <Button 
                onClick={() => setShowCreateOrg(true)} 
                className="gap-2"
                disabled={orgLimits ? !orgLimits.canCreate : false}
              >
                <Plus className="h-4 w-4" />
                Nueva Empresa
              </Button>
              {orgLimits && !orgLimits.canCreate && orgLimits.plan !== "ENTERPRISE" && (
                <Link href="/dashboard/billing" className="text-xs text-purple-600 hover:underline">
                  Actualiza a Enterprise para más empresas
                </Link>
              )}
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {/* Plan Limit Info */}
          {orgLimits && (
            <div className={`mb-4 p-3 rounded-lg text-sm ${
              orgLimits.canCreate 
                ? "bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300" 
                : "bg-yellow-50 dark:bg-yellow-900/20 text-yellow-700 dark:text-yellow-300"
            }`}>
              <div className="flex items-center gap-2">
                <Building2 className="h-4 w-4" />
                <span>
                  {orgLimits.plan === "ENTERPRISE" ? (
                    <>Plan Enterprise: hasta {orgLimits.maxOrganizations} empresas ({orgLimits.currentCount} creadas)</>
                  ) : (
                    <>Plan {orgLimits.plan === "PROFESSIONAL" ? "Profesional" : orgLimits.plan === "BASIC" ? "Básico" : "Gratuito"}: {orgLimits.maxOrganizations} empresa permitida</>
                  )}
                </span>
              </div>
            </div>
          )}

          {/* Organizations List */}
          {organizations.owned.length === 0 && organizations.member.length === 0 ? (
            <div className="text-center py-12 bg-gray-50 dark:bg-gray-800/50 rounded-lg">
              <Building2 className="h-12 w-12 mx-auto text-gray-400 mb-4" />
              <h3 className="font-medium text-gray-900 dark:text-gray-100 mb-2">
                No tienes ninguna empresa
              </h3>
              <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
                Crea una empresa para invitar a tu equipo y compartir los resultados
              </p>
              <Button 
                onClick={() => setShowCreateOrg(true)} 
                variant="outline" 
                className="gap-2"
                disabled={orgLimits ? !orgLimits.canCreate : false}
              >
                <Plus className="h-4 w-4" />
                Crear mi primera empresa
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              {/* Owned Organizations */}
              {organizations.owned.length > 0 && (
                <div>
                  <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-3">
                    Mis empresas ({organizations.owned.length}/{orgLimits?.maxOrganizations || 1})
                  </h3>
                  <div className="space-y-2">
                    {organizations.owned.map((org) => (
                      <div
                        key={org.id}
                        className={`p-4 border rounded-lg transition-all ${
                          selectedOrg?.id === org.id ? "border-purple-500 bg-purple-50 dark:bg-purple-900/20" : ""
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <div 
                            className="flex items-center gap-3 flex-1 cursor-pointer"
                            onClick={() => fetchOrgDetails(org.id)}
                          >
                            <div className="h-10 w-10 bg-purple-100 dark:bg-purple-900 rounded-lg flex items-center justify-center font-bold text-purple-600 dark:text-purple-400">
                              {org.name.charAt(0).toUpperCase()}
                            </div>
                            <div>
                              <h4 className="font-medium flex items-center gap-2">
                                {org.name}
                                <span className="inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-full bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400">
                                  <Crown className="h-3 w-3" />
                                  Dueño
                                </span>
                              </h4>
                              <p className="text-sm text-gray-500 dark:text-gray-400">
                                {org._count?.members || 0} miembros
                              </p>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={(e) => {
                                e.stopPropagation();
                                setSelectedOrg(org);
                                setShowInviteModal(true);
                              }}
                              className="gap-1 text-purple-600 hover:text-purple-700 hover:bg-purple-50"
                            >
                              <UserPlus className="h-4 w-4" />
                              <span className="hidden sm:inline">Agregar Usuario</span>
                            </Button>
                            <ChevronRight 
                              className="h-5 w-5 text-gray-400 cursor-pointer hover:text-purple-600" 
                              onClick={() => fetchOrgDetails(org.id)}
                            />
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Member Organizations */}
              {organizations.member.length > 0 && (
                <div>
                  <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-3">
                    Empresas donde soy miembro
                  </h3>
                  <div className="space-y-2">
                    {organizations.member.map((org) => (
                      <div
                        key={org.id}
                        onClick={() => fetchOrgDetails(org.id)}
                        className={`p-4 border rounded-lg cursor-pointer transition-all hover:border-purple-500 ${
                          selectedOrg?.id === org.id ? "border-purple-500 bg-purple-50 dark:bg-purple-900/20" : ""
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <div className="h-10 w-10 bg-gray-100 dark:bg-gray-800 rounded-lg flex items-center justify-center font-bold text-gray-600 dark:text-gray-400">
                              {org.name.charAt(0).toUpperCase()}
                            </div>
                            <div>
                              <h4 className="font-medium flex items-center gap-2">
                                {org.name}
                                <span className={`inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-full ${roleLabels[org.myRole]?.color}`}>
                                  {roleLabels[org.myRole]?.label}
                                </span>
                              </h4>
                              <p className="text-sm text-gray-500 dark:text-gray-400">
                                {org._count?.members || 0} miembros
                              </p>
                            </div>
                          </div>
                          <ChevronRight className="h-5 w-5 text-gray-400" />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Selected Organization Details */}
          {selectedOrg && (
            <div className="mt-6 pt-6 border-t">
              {orgLoading ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="h-6 w-6 animate-spin text-purple-600" />
                </div>
              ) : (
                <>
                  <div className="flex items-center justify-between mb-6">
                    <div>
                      <h3 className="text-lg font-semibold">{selectedOrg.name}</h3>
                      {selectedOrg.description && (
                        <p className="text-sm text-gray-500 dark:text-gray-400">{selectedOrg.description}</p>
                      )}
                    </div>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setShowInviteModal(true)}
                        className="gap-2"
                      >
                        <UserPlus className="h-4 w-4" />
                        Invitar Usuario
                      </Button>
                      {organizations.owned.some(o => o.id === selectedOrg.id) && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={handleDeleteOrg}
                          className="gap-2 text-red-600 hover:text-red-700 hover:bg-red-50"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  </div>

                  {/* Members List */}
                  <div className="space-y-4">
                    <h4 className="text-sm font-medium text-gray-500 dark:text-gray-400 flex items-center gap-2">
                      <Users className="h-4 w-4" />
                      Miembros ({orgMembers.length})
                    </h4>
                    <div className="space-y-2">
                      {orgMembers.map((member) => {
                        const RoleIcon = roleLabels[member.role]?.icon || Users;
                        const isOwner = member.role === "OWNER";
                        const canManage = organizations.owned.some(o => o.id === selectedOrg.id);
                        
                        return (
                          <div
                            key={member.id}
                            className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800/50 rounded-lg"
                          >
                            <div className="flex items-center gap-3">
                              <div className="h-10 w-10 bg-gray-200 dark:bg-gray-700 rounded-full flex items-center justify-center">
                                {member.user.image ? (
                                  <img src={member.user.image} alt="" className="h-10 w-10 rounded-full" />
                                ) : (
                                  <span className="font-medium text-gray-600 dark:text-gray-300">
                                    {member.user.name?.charAt(0) || member.user.email.charAt(0).toUpperCase()}
                                  </span>
                                )}
                              </div>
                              <div>
                                <p className="font-medium">{member.user.name || "Sin nombre"}</p>
                                <p className="text-sm text-gray-500 dark:text-gray-400">{member.user.email}</p>
                              </div>
                            </div>
                            <div className="flex items-center gap-2">
                              {canManage && !isOwner ? (
                                <select
                                  value={member.role}
                                  onChange={(e) => handleUpdateRole(member.id, e.target.value)}
                                  className="text-xs px-2 py-1 rounded border bg-white dark:bg-gray-900"
                                >
                                  <option value="ADMIN">Admin</option>
                                  <option value="MEMBER">Miembro</option>
                                  <option value="VIEWER">Visor</option>
                                </select>
                              ) : (
                                <span className={`inline-flex items-center gap-1 text-xs px-2 py-1 rounded-full ${roleLabels[member.role]?.color}`}>
                                  <RoleIcon className="h-3 w-3" />
                                  {roleLabels[member.role]?.label}
                                </span>
                              )}
                              {canManage && !isOwner && (
                                <button
                                  onClick={() => handleRemoveMember(member.id)}
                                  className="p-1 text-gray-400 hover:text-red-600 transition-colors"
                                >
                                  <Trash2 className="h-4 w-4" />
                                </button>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>

                    {/* Pending Invitations */}
                    {orgInvitations.length > 0 && (
                      <div className="mt-4">
                        <h4 className="text-sm font-medium text-gray-500 dark:text-gray-400 flex items-center gap-2 mb-3">
                          <Mail className="h-4 w-4" />
                          Invitaciones pendientes ({orgInvitations.length})
                        </h4>
                        <div className="space-y-2">
                          {orgInvitations.map((invitation) => (
                            <div
                              key={invitation.id}
                              className="flex items-center justify-between p-3 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg"
                            >
                              <div className="flex items-center gap-3">
                                <div className="h-8 w-8 bg-yellow-100 dark:bg-yellow-900 rounded-full flex items-center justify-center">
                                  <Mail className="h-4 w-4 text-yellow-600 dark:text-yellow-400" />
                                </div>
                                <div>
                                  <p className="font-medium text-sm">{invitation.email}</p>
                                  <p className="text-xs text-gray-500">
                                    Expira: {new Date(invitation.expiresAt).toLocaleDateString("es-ES")}
                                  </p>
                                </div>
                              </div>
                              <span className="text-xs px-2 py-1 rounded-full bg-yellow-100 dark:bg-yellow-900 text-yellow-700 dark:text-yellow-400">
                                {roleLabels[invitation.role]?.label || invitation.role}
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Create Organization Modal */}
      {showCreateOrg && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-900 rounded-xl shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold">Crear Nueva Empresa</h2>
                <button onClick={() => setShowCreateOrg(false)} className="text-gray-400 hover:text-gray-600">
                  <X className="h-5 w-5" />
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Nombre de la empresa *</label>
                  <input
                    type="text"
                    value={newOrg.name}
                    onChange={(e) => setNewOrg({ ...newOrg, name: e.target.value })}
                    placeholder="Mi Empresa S.A."
                    className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">Descripción</label>
                  <textarea
                    value={newOrg.description}
                    onChange={(e) => setNewOrg({ ...newOrg, description: e.target.value })}
                    placeholder="Breve descripción de la empresa..."
                    rows={3}
                    className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">Sitio web</label>
                  <input
                    type="url"
                    value={newOrg.website}
                    onChange={(e) => setNewOrg({ ...newOrg, website: e.target.value })}
                    placeholder="https://miempresa.com"
                    className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">Industria</label>
                  <select
                    value={newOrg.industry}
                    onChange={(e) => setNewOrg({ ...newOrg, industry: e.target.value })}
                    className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  >
                    <option value="">Seleccionar...</option>
                    {industries.map((ind) => (
                      <option key={ind} value={ind}>{ind}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">Tamaño de la empresa</label>
                  <select
                    value={newOrg.size}
                    onChange={(e) => setNewOrg({ ...newOrg, size: e.target.value })}
                    className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  >
                    <option value="">Seleccionar...</option>
                    {companySizes.map((size) => (
                      <option key={size.value} value={size.value}>{size.label}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="flex gap-3 mt-6">
                <Button variant="outline" onClick={() => setShowCreateOrg(false)} className="flex-1">
                  Cancelar
                </Button>
                <Button onClick={handleCreateOrg} disabled={orgLoading} className="flex-1 gap-2">
                  {orgLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Check className="h-4 w-4" />}
                  Crear Empresa
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Invite Member Modal */}
      {showInviteModal && selectedOrg && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-900 rounded-xl shadow-xl max-w-md w-full">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold">Invitar Usuario</h2>
                <button onClick={() => setShowInviteModal(false)} className="text-gray-400 hover:text-gray-600">
                  <X className="h-5 w-5" />
                </button>
              </div>

              <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
                Invita a un usuario a <strong>{selectedOrg.name}</strong>. Si el usuario ya tiene cuenta, será agregado inmediatamente.
              </p>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Email del usuario *</label>
                  <input
                    type="email"
                    value={inviteData.email}
                    onChange={(e) => setInviteData({ ...inviteData, email: e.target.value })}
                    placeholder="usuario@ejemplo.com"
                    className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">Rol</label>
                  <select
                    value={inviteData.role}
                    onChange={(e) => setInviteData({ ...inviteData, role: e.target.value })}
                    className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  >
                    <option value="ADMIN">Admin - Puede gestionar miembros y configuración</option>
                    <option value="MEMBER">Miembro - Acceso completo a información</option>
                    <option value="VIEWER">Visor - Solo puede ver información</option>
                  </select>
                </div>

                <div className="bg-blue-50 dark:bg-blue-900/20 p-3 rounded-lg">
                  <p className="text-xs text-blue-700 dark:text-blue-300">
                    <strong>Nota:</strong> Si el usuario no tiene cuenta en GuardyScan, se creará una invitación pendiente que expira en 7 días.
                  </p>
                </div>
              </div>

              <div className="flex gap-3 mt-6">
                <Button variant="outline" onClick={() => setShowInviteModal(false)} className="flex-1">
                  Cancelar
                </Button>
                <Button onClick={handleInviteMember} disabled={orgLoading} className="flex-1 gap-2">
                  {orgLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <UserPlus className="h-4 w-4" />}
                  Invitar
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Auto-Scan Configuration */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 bg-blue-100 dark:bg-blue-900 rounded-lg flex items-center justify-center">
              <Calendar className="h-6 w-6 text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <CardTitle>Escaneo Automático Mensual</CardTitle>
              <CardDescription>
                Programa un escaneo automático cada día 1 de mes
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Info Alert */}
          <div className="bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-900 rounded-lg p-4">
            <div className="flex gap-3">
              <AlertCircle className="h-5 w-5 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" />
              <div className="text-sm text-blue-900 dark:text-blue-200">
                <p className="font-medium mb-1">Disponible solo para planes de pago</p>
                <p className="text-blue-700 dark:text-blue-300">
                  El escaneo automático ejecutará un análisis completo de la URL configurada
                  cada día 1 de mes. El escaneo consumirá 1 crédito de tu plan.
                </p>
              </div>
            </div>
          </div>

          {/* Enable/Disable */}
          <div className="flex items-center justify-between p-4 border rounded-lg">
            <div className="flex-1">
              <h3 className="font-medium">Activar escaneo automático</h3>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Ejecutar un escaneo el día 1 de cada mes
              </p>
            </div>
            <button
              onClick={() => setConfig({ ...config, autoScanEnabled: !config.autoScanEnabled })}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                config.autoScanEnabled ? "bg-blue-600" : "bg-gray-200 dark:bg-gray-700"
              }`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                  config.autoScanEnabled ? "translate-x-6" : "translate-x-1"
                }`}
              />
            </button>
          </div>

          {/* URL Input */}
          <div className="space-y-2">
            <label htmlFor="autoScanUrl" className="text-sm font-medium">
              URL para escanear automáticamente
            </label>
            <input
              id="autoScanUrl"
              type="url"
              value={config.autoScanUrl}
              onChange={(e) => setConfig({ ...config, autoScanUrl: e.target.value })}
              placeholder="https://tuempresa.com"
              disabled={!config.autoScanEnabled}
              className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-600 disabled:opacity-50 disabled:cursor-not-allowed"
            />
            <p className="text-xs text-gray-500 dark:text-gray-400">
              Esta URL será escaneada automáticamente cada mes
            </p>
          </div>

          {/* Last Auto Scan */}
          {config.lastAutoScan && (
            <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4">
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Último escaneo automático:{" "}
                <span className="font-medium text-gray-900 dark:text-gray-100">
                  {new Date(config.lastAutoScan).toLocaleDateString("es-ES", {
                    day: "numeric",
                    month: "long",
                    year: "numeric",
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </span>
              </p>
            </div>
          )}

          {/* Next Scheduled Scan */}
          {config.autoScanEnabled && (
            <div className="bg-green-50 dark:bg-green-950/20 border border-green-200 dark:border-green-900 rounded-lg p-4">
              <div className="flex items-start gap-3">
                <Shield className="h-5 w-5 text-green-600 dark:text-green-400 mt-0.5" />
                <div className="text-sm">
                  <p className="font-medium text-green-900 dark:text-green-200">
                    Próximo escaneo programado
                  </p>
                  <p className="text-green-700 dark:text-green-300 mt-1">
                    {(() => {
                      const now = new Date();
                      const nextMonth = new Date(now.getFullYear(), now.getMonth() + 1, 1);
                      return nextMonth.toLocaleDateString("es-ES", {
                        day: "numeric",
                        month: "long",
                        year: "numeric",
                      });
                    })()}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Save Button */}
          <div className="flex justify-end pt-4 border-t">
            <Button onClick={handleSave} disabled={loading}>
              {loading ? "Guardando..." : "Guardar configuración"}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* How it works */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">¿Cómo funciona el escaneo automático?</CardTitle>
        </CardHeader>
        <CardContent>
          <ol className="space-y-3 text-sm text-gray-600 dark:text-gray-400">
            <li className="flex gap-3">
              <span className="flex-shrink-0 flex items-center justify-center h-6 w-6 rounded-full bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-400 font-medium text-xs">
                1
              </span>
              <span>Configura la URL de tu sitio web o aplicación</span>
            </li>
            <li className="flex gap-3">
              <span className="flex-shrink-0 flex items-center justify-center h-6 w-6 rounded-full bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-400 font-medium text-xs">
                2
              </span>
              <span>Activa el escaneo automático (solo planes de pago)</span>
            </li>
            <li className="flex gap-3">
              <span className="flex-shrink-0 flex items-center justify-center h-6 w-6 rounded-full bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-400 font-medium text-xs">
                3
              </span>
              <span>Cada día 1 de mes, GuardyScan ejecutará automáticamente un escaneo completo</span>
            </li>
            <li className="flex gap-3">
              <span className="flex-shrink-0 flex items-center justify-center h-6 w-6 rounded-full bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-400 font-medium text-xs">
                4
              </span>
              <span>Revisa los resultados en tu dashboard y recibe alertas si se detectan problemas</span>
            </li>
            <li className="flex gap-3">
              <span className="flex-shrink-0 flex items-center justify-center h-6 w-6 rounded-full bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-400 font-medium text-xs">
                5
              </span>
              <span>El escaneo consumirá 1 crédito de tu plan mensual</span>
            </li>
          </ol>
        </CardContent>
      </Card>

      {/* Billing Section */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 bg-green-100 dark:bg-green-900 rounded-lg flex items-center justify-center">
              <CreditCard className="h-6 w-6 text-green-600 dark:text-green-400" />
            </div>
            <div>
              <CardTitle>Facturación y Suscripción</CardTitle>
              <CardDescription>
                Gestiona tu plan, métodos de pago e historial de facturas
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Link href="/dashboard/billing">
            <div className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors cursor-pointer group">
              <div>
                <h3 className="font-medium group-hover:text-blue-600 transition-colors">Ir a Facturación</h3>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Ver tu plan actual, actualizar suscripción o gestionar pagos
                </p>
              </div>
              <ChevronRight className="h-5 w-5 text-gray-400 group-hover:text-blue-600 transition-colors" />
            </div>
          </Link>
        </CardContent>
      </Card>
    </div>
  );
}
