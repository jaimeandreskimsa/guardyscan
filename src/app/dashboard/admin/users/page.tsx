"use client";

import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { Users, UserCheck, AlertCircle, CheckCircle, Activity, Clock } from "lucide-react";
import { Badge } from "@/components/ui/badge";

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

  useEffect(() => {
    fetchAdminData();
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

  const getPlanBadge = (plan: string) => {
    const colors: { [key: string]: string } = {
      free: "bg-gray-100 text-gray-700",
      basic: "bg-blue-100 text-blue-700",
      professional: "bg-purple-100 text-purple-700",
      enterprise: "bg-yellow-100 text-yellow-700",
    };
    return colors[plan] || colors.free;
  };

  const getStatusBadge = (status: string) => {
    if (status === 'active') {
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
    if (filter === 'active') return user.status === 'active';
    if (filter === 'inactive') return user.status !== 'active';
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
              Activos ({users.filter(u => u.status === 'active').length})
            </button>
            <button
              onClick={() => setFilter('inactive')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                filter === 'inactive'
                  ? 'bg-gray-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Inactivos ({users.filter(u => u.status !== 'active').length})
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
