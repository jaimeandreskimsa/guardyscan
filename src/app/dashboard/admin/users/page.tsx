"use client";

import { useEffect, useState, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import {
  Users, UserCheck, Activity, AlertCircle, CheckCircle,
  Clock, Search, X, Filter, RefreshCw, Trash2,
  ChevronLeft, ChevronRight, Shield, Building2,
  AlertTriangle,
} from "lucide-react";

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
}

interface AdminData {
  metrics: { totalUsers: number; activeSubscriptions: number; recentActiveUsers: number };
  users: User[];
}

const PLAN_COLORS: Record<string, string> = {
  FREE:         "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300",
  BASIC:        "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300",
  PROFESSIONAL: "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300",
  ENTERPRISE:   "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-300",
};

const PAGE_SIZE = 15;

export default function UsersPage() {
  const [data, setData] = useState<AdminData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const { toast } = useToast();

  // Filters
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<"ALL" | "ACTIVE" | "INACTIVE">("ALL");
  const [planFilter, setPlanFilter] = useState<"ALL" | "FREE" | "BASIC" | "PROFESSIONAL" | "ENTERPRISE">("ALL");
  const [roleFilter, setRoleFilter] = useState<"ALL" | "user" | "admin">("ALL");
  const [page, setPage] = useState(1);

  // Delete
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [confirmDelete, setConfirmDelete] = useState<User | null>(null);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/stats");
      if (!res.ok) throw new Error((await res.json()).error || "Error al cargar");
      setData(await res.json());
      setError("");
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  // Reset page on filter change
  useEffect(() => { setPage(1); }, [search, statusFilter, planFilter, roleFilter]);

  const handleDelete = async (user: User) => {
    setDeletingId(user.id);
    try {
      const res = await fetch("/api/admin/users", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: user.id }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error);
      setData(prev => prev ? {
        ...prev,
        users: prev.users.filter(u => u.id !== user.id),
        metrics: { ...prev.metrics, totalUsers: prev.metrics.totalUsers - 1 },
      } : prev);
      toast({ title: "✅ Usuario eliminado", description: user.email });
    } catch (e: any) {
      toast({ title: "❌ Error", description: e.message, variant: "destructive" });
    } finally {
      setDeletingId(null);
      setConfirmDelete(null);
    }
  };

  if (loading) return (
    <div className="space-y-6 p-6">
      <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-48 animate-pulse" />
      <div className="grid grid-cols-3 gap-4">
        {[1,2,3].map(i => <div key={i} className="h-28 bg-gray-200 dark:bg-gray-700 rounded-xl animate-pulse" />)}
      </div>
      <div className="h-96 bg-gray-200 dark:bg-gray-700 rounded-xl animate-pulse" />
    </div>
  );

  if (error) return (
    <div className="p-6">
      <Card className="p-6 bg-red-50 border-red-200 dark:bg-red-900/10 dark:border-red-800">
        <div className="flex items-center gap-2 text-red-700 dark:text-red-400">
          <AlertCircle className="h-5 w-5" />
          <p className="font-semibold">{error}</p>
        </div>
      </Card>
    </div>
  );

  if (!data) return null;
  const { metrics, users } = data;

  // Apply all filters
  const filtered = users.filter(u => {
    if (statusFilter === "ACTIVE" && u.status !== "ACTIVE") return false;
    if (statusFilter === "INACTIVE" && u.status === "ACTIVE") return false;
    if (planFilter !== "ALL" && u.plan !== planFilter) return false;
    if (roleFilter !== "ALL" && u.role !== roleFilter) return false;
    if (search) {
      const q = search.toLowerCase();
      if (
        !u.name?.toLowerCase().includes(q) &&
        !u.email.toLowerCase().includes(q) &&
        !u.company?.toLowerCase().includes(q)
      ) return false;
    }
    return true;
  });

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const paginated = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);
  const hasFilters = search || statusFilter !== "ALL" || planFilter !== "ALL" || roleFilter !== "ALL";

  const clearFilters = () => {
    setSearch(""); setStatusFilter("ALL"); setPlanFilter("ALL"); setRoleFilter("ALL");
  };

  const fmt = (d: string) => new Date(d).toLocaleDateString("es-ES", { day: "2-digit", month: "short", year: "numeric" });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-3xl font-bold">Usuarios</h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1">Gestión y administración de usuarios del sistema</p>
        </div>
        <Button variant="outline" onClick={fetchData} disabled={loading} className="gap-2">
          <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
          Actualizar
        </Button>
      </div>

      {/* Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card className="p-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">Total usuarios</p>
              <p className="text-3xl font-black mt-1">{metrics.totalUsers}</p>
            </div>
            <div className="h-12 w-12 bg-blue-100 dark:bg-blue-900/30 rounded-xl flex items-center justify-center">
              <Users className="h-6 w-6 text-blue-600" />
            </div>
          </div>
        </Card>
        <Card className="p-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">Suscripciones activas</p>
              <p className="text-3xl font-black mt-1 text-emerald-600">{metrics.activeSubscriptions}</p>
              <p className="text-xs text-gray-400 mt-0.5">
                {metrics.totalUsers > 0 ? ((metrics.activeSubscriptions / metrics.totalUsers) * 100).toFixed(1) : 0}% del total
              </p>
            </div>
            <div className="h-12 w-12 bg-emerald-100 dark:bg-emerald-900/30 rounded-xl flex items-center justify-center">
              <UserCheck className="h-6 w-6 text-emerald-600" />
            </div>
          </div>
        </Card>
        <Card className="p-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">Activos este mes</p>
              <p className="text-3xl font-black mt-1 text-purple-600">{metrics.recentActiveUsers}</p>
            </div>
            <div className="h-12 w-12 bg-purple-100 dark:bg-purple-900/30 rounded-xl flex items-center justify-center">
              <Activity className="h-6 w-6 text-purple-600" />
            </div>
          </div>
        </Card>
      </div>

      {/* Search + filters */}
      <div className="flex flex-col sm:flex-row gap-3 flex-wrap">
        {/* Search */}
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <input
            type="text"
            placeholder="Buscar por nombre, email o empresa..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full pl-9 pr-9 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-400"
          />
          {search && (
            <button onClick={() => setSearch("")} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
              <X className="h-4 w-4" />
            </button>
          )}
        </div>

        {/* Status */}
        <div className="relative">
          <Filter className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
          <select value={statusFilter} onChange={e => setStatusFilter(e.target.value as any)}
            className="pl-9 pr-8 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/30 appearance-none">
            <option value="ALL">Todos los estados</option>
            <option value="ACTIVE">Activo</option>
            <option value="INACTIVE">Inactivo</option>
          </select>
        </div>

        {/* Plan */}
        <div className="relative">
          <Filter className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
          <select value={planFilter} onChange={e => setPlanFilter(e.target.value as any)}
            className="pl-9 pr-8 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/30 appearance-none">
            <option value="ALL">Todos los planes</option>
            <option value="FREE">Free</option>
            <option value="BASIC">Basic</option>
            <option value="PROFESSIONAL">Professional</option>
            <option value="ENTERPRISE">Enterprise</option>
          </select>
        </div>

        {/* Role */}
        <div className="relative">
          <Shield className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
          <select value={roleFilter} onChange={e => setRoleFilter(e.target.value as any)}
            className="pl-9 pr-8 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/30 appearance-none">
            <option value="ALL">Todos los roles</option>
            <option value="user">Usuario</option>
            <option value="admin">Admin</option>
          </select>
        </div>

        {hasFilters && (
          <Button variant="ghost" onClick={clearFilters} className="gap-1.5 text-gray-500 hover:text-gray-700">
            <X className="h-4 w-4" /> Limpiar
          </Button>
        )}
      </div>

      {/* Table */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-base font-semibold">
              {filtered.length} usuario{filtered.length !== 1 ? "s" : ""}
              {hasFilters && <span className="text-gray-400 font-normal"> (filtrado)</span>}
            </CardTitle>
            {hasFilters && (
              <button onClick={clearFilters} className="text-xs text-blue-500 hover:underline">
                Limpiar filtros
              </button>
            )}
          </div>
        </CardHeader>
        <CardContent className="pt-0 px-0">
          {paginated.length === 0 ? (
            <div className="text-center py-16">
              <Users className="h-12 w-12 mx-auto text-gray-200 dark:text-gray-700 mb-3" />
              <p className="text-gray-400">No se encontraron usuarios</p>
              {hasFilters && (
                <button onClick={clearFilters} className="mt-2 text-sm text-blue-500 hover:underline">
                  Limpiar filtros
                </button>
              )}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-100 dark:border-gray-800">
                    {["Usuario", "Email", "Empresa", "Plan", "Estado", "Escaneos", "Registro", ""].map(h => (
                      <th key={h} className="text-left py-3 px-4 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider whitespace-nowrap">
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {paginated.map(user => (
                    <tr key={user.id} className="border-b border-gray-50 dark:border-gray-800/50 hover:bg-gray-50 dark:hover:bg-gray-800/30 transition-colors group">
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-2.5">
                          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
                            {(user.name || user.email)[0].toUpperCase()}
                          </div>
                          <div>
                            <p className="font-medium text-sm text-gray-900 dark:text-gray-100 whitespace-nowrap">
                              {user.name || "Sin nombre"}
                            </p>
                            {user.role === "admin" && (
                              <span className="text-[10px] font-bold text-red-600 bg-red-50 dark:bg-red-900/20 px-1.5 py-0.5 rounded">ADMIN</span>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <a href={`mailto:${user.email}`} className="text-sm text-blue-600 hover:underline whitespace-nowrap">
                          {user.email}
                        </a>
                      </td>
                      <td className="py-3 px-4">
                        <span className="text-sm text-gray-600 dark:text-gray-400 whitespace-nowrap">
                          {user.company || <span className="text-gray-300 dark:text-gray-600">—</span>}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <Badge className={`text-xs whitespace-nowrap ${PLAN_COLORS[user.plan] || PLAN_COLORS.FREE}`}>
                          {user.plan}
                        </Badge>
                      </td>
                      <td className="py-3 px-4">
                        {user.status === "ACTIVE" ? (
                          <span className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-700 bg-emerald-100 dark:bg-emerald-900/20 dark:text-emerald-400 px-2 py-1 rounded-full">
                            <CheckCircle className="h-3 w-3" /> Activo
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-xs font-semibold text-gray-600 bg-gray-100 dark:bg-gray-800 dark:text-gray-400 px-2 py-1 rounded-full">
                            <AlertCircle className="h-3 w-3" /> Inactivo
                          </span>
                        )}
                      </td>
                      <td className="py-3 px-4">
                        <span className="flex items-center gap-1.5 text-sm text-gray-600 dark:text-gray-400">
                          <Activity className="h-3.5 w-3.5 text-gray-400" />
                          {user.scansCount}
                        </span>
                      </td>
                      <td className="py-3 px-4 whitespace-nowrap">
                        <span className="flex items-center gap-1.5 text-sm text-gray-500 dark:text-gray-400">
                          <Clock className="h-3.5 w-3.5 text-gray-400" />
                          {fmt(user.createdAt)}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        {user.role !== "admin" && (
                          <Button
                            size="sm" variant="ghost"
                            disabled={deletingId === user.id}
                            onClick={() => setConfirmDelete(user)}
                            className="h-8 w-8 p-0 text-gray-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 opacity-0 group-hover:opacity-100 transition-all"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between px-4 pt-4 mt-2 border-t border-gray-100 dark:border-gray-800">
              <p className="text-sm text-gray-500">
                Página {page} de {totalPages} · {filtered.length} usuarios
              </p>
              <div className="flex items-center gap-1">
                <Button variant="outline" size="sm" disabled={page === 1} onClick={() => setPage(1)} className="h-8 w-8 p-0 text-xs">«</Button>
                <Button variant="outline" size="sm" disabled={page === 1} onClick={() => setPage(p => p - 1)} className="h-8 w-8 p-0">
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                  let n: number;
                  if (totalPages <= 5) n = i + 1;
                  else if (page <= 3) n = i + 1;
                  else if (page >= totalPages - 2) n = totalPages - 4 + i;
                  else n = page - 2 + i;
                  return (
                    <Button key={n} variant={page === n ? "default" : "outline"} size="sm"
                      onClick={() => setPage(n)} className="h-8 w-8 p-0 text-xs">
                      {n}
                    </Button>
                  );
                })}
                <Button variant="outline" size="sm" disabled={page === totalPages} onClick={() => setPage(p => p + 1)} className="h-8 w-8 p-0">
                  <ChevronRight className="h-4 w-4" />
                </Button>
                <Button variant="outline" size="sm" disabled={page === totalPages} onClick={() => setPage(totalPages)} className="h-8 w-8 p-0 text-xs">»</Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Delete confirmation modal */}
      {confirmDelete && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-2xl w-full max-w-sm p-6 space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center flex-shrink-0">
                <AlertTriangle className="h-6 w-6 text-red-600" />
              </div>
              <div>
                <h3 className="font-bold text-gray-900 dark:text-gray-100">Eliminar usuario</h3>
                <p className="text-sm text-gray-500">Esta acción no se puede deshacer</p>
              </div>
            </div>

            <div className="p-3 rounded-xl bg-gray-50 dark:bg-gray-800 space-y-1">
              <p className="font-semibold text-sm text-gray-900 dark:text-gray-100">{confirmDelete.name || "Sin nombre"}</p>
              <p className="text-sm text-gray-500">{confirmDelete.email}</p>
              {confirmDelete.company && (
                <p className="flex items-center gap-1 text-xs text-gray-400">
                  <Building2 className="h-3 w-3" /> {confirmDelete.company}
                </p>
              )}
            </div>

            <p className="text-sm text-gray-600 dark:text-gray-400">
              Se eliminarán permanentemente todos sus datos: escaneos, incidentes, vulnerabilidades y suscripción.
            </p>

            <div className="flex gap-3 pt-1">
              <Button variant="outline" className="flex-1" onClick={() => setConfirmDelete(null)}>
                Cancelar
              </Button>
              <Button
                variant="destructive" className="flex-1 gap-2"
                disabled={deletingId === confirmDelete.id}
                onClick={() => handleDelete(confirmDelete)}
              >
                {deletingId === confirmDelete.id
                  ? <RefreshCw className="h-4 w-4 animate-spin" />
                  : <Trash2 className="h-4 w-4" />}
                Eliminar
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
