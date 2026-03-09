"use client";

import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { Users, UserCheck, AlertCircle, CheckCircle, Activity, Clock, Headphones, MessageSquare, Phone, X, Bell } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

interface User {
  id: string;
  name: string | null;
  email: string;
  company: string | null;
  role: string;
  plan: string;
  status: string;
  scansCount: number;
  createdAt: string;
  subscriptionEnd: string | null;
}

interface AdvisoryRequest {
  id: string;
  message: string | null;
  status: string;
  createdAt: string;
  user: {
    id: string;
    name: string | null;
    email: string;
    company: string | null;
  };
}

interface AdminData {
  metrics: {
    totalUsers: number;
    activeSubscriptions: number;
    recentActiveUsers: number;
  };
  users: User[];
}

export default function UsersPage() {
  const [data, setData] = useState<AdminData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [filter, setFilter] = useState<'all' | 'active' | 'inactive'>('all');
  const [advisoryRequests, setAdvisoryRequests] = useState<AdvisoryRequest[]>([]);
  const [updatingAdvisory, setUpdatingAdvisory] = useState<string | null>(null);

  useEffect(() => {
    fetchAdminData();
    fetchAdvisoryRequests();
  }, []);

  const fetchAdminData = async () => {
    try {
      const response = await fetch("/api/admin/stats");
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Error al cargar datos");
      }
      const result = await response.json();
      setData(result);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const fetchAdvisoryRequests = async () => {
    try {
      const res = await fetch("/api/advisory");
      if (res.ok) {
        const data = await res.json();
        setAdvisoryRequests(Array.isArray(data) ? data : []);
      }
    } catch { /* ignore */ }
  };

  const updateAdvisoryStatus = async (id: string, status: string) => {
    setUpdatingAdvisory(id);
    try {
      const res = await fetch("/api/advisory", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, status }),
      });
      if (res.ok) {
        setAdvisoryRequests(prev => prev.map(r => r.id === id ? { ...r, status } : r));
      }
    } catch { /* ignore */ }
    setUpdatingAdvisory(null);
  };

  const getPlanBadge = (plan: string) => {
    const colors: { [key: string]: string } = {
      FREE: "bg-gray-100 text-gray-700",
      BASIC: "bg-blue-100 text-blue-700",
      PROFESSIONAL: "bg-purple-100 text-purple-700",
      ENTERPRISE: "bg-yellow-100 text-yellow-700",
    };
    return colors[plan] || colors.FREE;
  };

  const getStatusBadge = (status: string) => {
    if (status === 'ACTIVE') {
      return <Badge className="bg-green-100 text-green-700"><CheckCircle className="h-3 w-3 mr-1" />Activa</Badge>;
    }
    return <Badge className="bg-gray-100 text-gray-700"><AlertCircle className="h-3 w-3 mr-1" />Inactiva</Badge>;
  };

  if (loading) {
    return (
      <div className="p-8">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 rounded w-1/4"></div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-32 bg-gray-200 rounded-lg"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-8">
        <Card className="p-6 bg-red-50 border-red-200">
          <div className="flex items-center gap-2 text-red-700">
            <AlertCircle className="h-5 w-5" />
            <p className="font-semibold">Error: {error}</p>
          </div>
        </Card>
      </div>
    );
  }

  if (!data) return null;

  const { metrics, users } = data;

  // Filtrar usuarios
  const filteredUsers = users.filter(user => {
    if (filter === 'active') return user.status === 'ACTIVE';
    if (filter === 'inactive') return user.status !== 'ACTIVE';
    return true;
  });

  return (
    <div className="p-8 space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
          Usuarios Activos
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          Gestión y monitoreo de usuarios del sistema
        </p>
      </div>

      {/* Métricas de Usuarios */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="p-6 hover:shadow-lg transition-shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Total Usuarios</p>
              <p className="text-3xl font-bold text-gray-900 dark:text-white">
                {metrics.totalUsers}
              </p>
            </div>
            <div className="h-12 w-12 bg-blue-100 rounded-lg flex items-center justify-center">
              <Users className="h-6 w-6 text-blue-600" />
            </div>
          </div>
        </Card>

        <Card className="p-6 hover:shadow-lg transition-shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Suscripciones Activas</p>
              <p className="text-3xl font-bold text-green-600">
                {metrics.activeSubscriptions}
              </p>
              <p className="text-xs text-gray-500 mt-1">
                {((metrics.activeSubscriptions / metrics.totalUsers) * 100).toFixed(1)}% del total
              </p>
            </div>
            <div className="h-12 w-12 bg-green-100 rounded-lg flex items-center justify-center">
              <UserCheck className="h-6 w-6 text-green-600" />
            </div>
          </div>
        </Card>

        <Card className="p-6 hover:shadow-lg transition-shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Activos Este Mes</p>
              <p className="text-3xl font-bold text-purple-600">
                {metrics.recentActiveUsers}
              </p>
              <p className="text-xs text-gray-500 mt-1">
                Usuarios con actividad reciente
              </p>
            </div>
            <div className="h-12 w-12 bg-purple-100 rounded-lg flex items-center justify-center">
              <Activity className="h-6 w-6 text-purple-600" />
            </div>
          </div>
        </Card>
      </div>

      {/* Alertas de Solicitudes de Asesoría */}
      {advisoryRequests.length > 0 && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="relative">
                <Bell className="h-5 w-5 text-indigo-600" />
                {advisoryRequests.filter(r => r.status === 'PENDING').length > 0 && (
                  <span className="absolute -top-1.5 -right-1.5 w-4 h-4 bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center animate-pulse">
                    {advisoryRequests.filter(r => r.status === 'PENDING').length}
                  </span>
                )}
              </div>
              <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                Solicitudes de Asesoría
              </h2>
            </div>
            <span className="px-3 py-1.5 rounded-full bg-indigo-50 dark:bg-indigo-900/20 text-indigo-700 dark:text-indigo-300 text-sm font-semibold">
              {advisoryRequests.filter(r => r.status === 'PENDING').length} pendiente{advisoryRequests.filter(r => r.status === 'PENDING').length !== 1 ? 's' : ''}
            </span>
          </div>
          <div className="space-y-3">
            {advisoryRequests.map((request) => (
              <Card key={request.id} className={`overflow-hidden border-l-4 transition-all hover:shadow-lg ${
                request.status === 'PENDING'
                  ? 'border-l-indigo-500 bg-indigo-50/50 dark:bg-indigo-900/10'
                  : request.status === 'CONTACTED'
                  ? 'border-l-amber-500 bg-amber-50/50 dark:bg-amber-900/10'
                  : 'border-l-emerald-500 bg-emerald-50/50 dark:bg-emerald-900/10'
              }`}>
                <div className="p-5">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex items-start gap-4">
                      <div className={`p-3 rounded-xl flex-shrink-0 ${
                        request.status === 'PENDING'
                          ? 'bg-indigo-100 dark:bg-indigo-800/30'
                          : request.status === 'CONTACTED'
                          ? 'bg-amber-100 dark:bg-amber-800/30'
                          : 'bg-emerald-100 dark:bg-emerald-800/30'
                      }`}>
                        <Headphones className={`h-5 w-5 ${
                          request.status === 'PENDING'
                            ? 'text-indigo-600'
                            : request.status === 'CONTACTED'
                            ? 'text-amber-600'
                            : 'text-emerald-600'
                        }`} />
                      </div>
                      <div>
                        <div className="flex items-center gap-2 flex-wrap">
                          <h3 className="font-bold text-gray-900 dark:text-white text-lg">
                            {request.user.name || 'Usuario sin nombre'}
                          </h3>
                          <Badge className={`text-xs ${
                            request.status === 'PENDING'
                              ? 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-400'
                              : request.status === 'CONTACTED'
                              ? 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400'
                              : 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400'
                          }`}>
                            {request.status === 'PENDING' && '⏳ Pendiente'}
                            {request.status === 'CONTACTED' && '📞 Contactado'}
                            {request.status === 'RESOLVED' && '✓ Resuelto'}
                          </Badge>
                          {request.status === 'PENDING' && (
                            <span className="flex items-center gap-1 px-2 py-0.5 bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400 text-xs font-semibold rounded-full animate-pulse">
                              <span className="w-1.5 h-1.5 bg-red-500 rounded-full" />
                              Nueva solicitud
                            </span>
                          )}
                        </div>
                        <div className="flex items-center gap-4 mt-1.5 text-sm text-gray-500 dark:text-gray-400 flex-wrap">
                          <span className="font-medium">{request.user.email}</span>
                          {request.user.company && (
                            <span className="bg-gray-100 dark:bg-gray-800 px-2 py-0.5 rounded text-xs">
                              {request.user.company}
                            </span>
                          )}
                          <span className="flex items-center gap-1">
                            <Clock className="h-3.5 w-3.5" />
                            {new Date(request.createdAt).toLocaleString('es-ES', { dateStyle: 'medium', timeStyle: 'short' })}
                          </span>
                        </div>
                        {request.message && (
                          <div className="mt-3 p-3 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
                            <div className="flex items-center gap-1.5 text-xs text-gray-500 mb-1">
                              <MessageSquare className="h-3 w-3" />
                              Mensaje del cliente:
                            </div>
                            <p className="text-sm text-gray-700 dark:text-gray-300">{request.message}</p>
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="flex flex-col gap-2 flex-shrink-0">
                      {request.status === 'PENDING' && (
                        <Button
                          size="sm"
                          className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white"
                          onClick={() => updateAdvisoryStatus(request.id, 'CONTACTED')}
                          disabled={updatingAdvisory === request.id}
                        >
                          <Phone className="h-3.5 w-3.5 mr-1.5" />
                          Marcar Contactado
                        </Button>
                      )}
                      {request.status === 'CONTACTED' && (
                        <Button
                          size="sm"
                          className="bg-emerald-600 hover:bg-emerald-700 text-white"
                          onClick={() => updateAdvisoryStatus(request.id, 'RESOLVED')}
                          disabled={updatingAdvisory === request.id}
                        >
                          <CheckCircle className="h-3.5 w-3.5 mr-1.5" />
                          Marcar Resuelto
                        </Button>
                      )}
                      {request.status !== 'PENDING' && request.status !== 'CONTACTED' && (
                        <span className="text-xs text-emerald-600 font-semibold flex items-center gap-1">
                          <CheckCircle className="h-3.5 w-3.5" /> Completado
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Filtros */}
      <Card className="p-4">
        <div className="flex items-center gap-4">
          <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Filtrar:</span>
          <div className="flex gap-2">
            <button
              onClick={() => setFilter('all')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                filter === 'all'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Todos ({users.length})
            </button>
            <button
              onClick={() => setFilter('active')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                filter === 'active'
                  ? 'bg-green-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Activos ({users.filter(u => u.status === 'ACTIVE').length})
            </button>
            <button
              onClick={() => setFilter('inactive')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                filter === 'inactive'
                  ? 'bg-gray-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Inactivos ({users.filter(u => u.status !== 'ACTIVE').length})
            </button>
          </div>
        </div>
      </Card>

      {/* Tabla de Usuarios */}
      <Card className="p-6">
        <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
          Listado de Usuarios ({filteredUsers.length})
        </h2>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200 dark:border-gray-700">
                <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700 dark:text-gray-300">
                  Usuario
                </th>
                <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700 dark:text-gray-300">
                  Email
                </th>
                <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700 dark:text-gray-300">
                  Empresa
                </th>
                <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700 dark:text-gray-300">
                  Plan
                </th>
                <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700 dark:text-gray-300">
                  Estado
                </th>
                <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700 dark:text-gray-300">
                  Escaneos
                </th>
                <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700 dark:text-gray-300">
                  Registro
                </th>
              </tr>
            </thead>
            <tbody>
              {filteredUsers.map((user) => (
                <tr
                  key={user.id}
                  className="border-b border-gray-100 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors"
                >
                  <td className="py-3 px-4">
                    <div>
                      <p className="font-medium text-gray-900 dark:text-white">
                        {user.name || "Sin nombre"}
                      </p>
                      {user.role === 'admin' && (
                        <Badge className="mt-1 text-xs bg-red-100 text-red-700">Admin</Badge>
                      )}
                    </div>
                  </td>
                  <td className="py-3 px-4 text-sm text-gray-600 dark:text-gray-400">
                    {user.email}
                  </td>
                  <td className="py-3 px-4 text-sm text-gray-600 dark:text-gray-400">
                    {user.company || "-"}
                  </td>
                  <td className="py-3 px-4">
                    <Badge className={getPlanBadge(user.plan)}>
                      {user.plan}
                    </Badge>
                  </td>
                  <td className="py-3 px-4">
                    {getStatusBadge(user.status)}
                  </td>
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-2">
                      <Activity className="h-4 w-4 text-gray-400" />
                      <span className="text-sm text-gray-600 dark:text-gray-400">
                        {user.scansCount}
                      </span>
                    </div>
                  </td>
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-2">
                      <Clock className="h-4 w-4 text-gray-400" />
                      <span className="text-sm text-gray-600 dark:text-gray-400">
                        {new Date(user.createdAt).toLocaleDateString('es-CL')}
                      </span>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
