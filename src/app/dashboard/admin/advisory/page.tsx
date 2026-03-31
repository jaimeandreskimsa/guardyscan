"use client";

import { useState, useEffect, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import {
  MessageSquare, Clock, CheckCircle2, PhoneCall,
  Mail, Building2, Calendar, RefreshCw, Search,
  ChevronLeft, ChevronRight, X, Filter,
} from "lucide-react";

interface AdvisoryRequest {
  id: string;
  subject: string | null;
  message: string | null;
  status: "PENDING" | "CONTACTED" | "RESOLVED";
  createdAt: string;
  user: {
    id: string;
    name: string | null;
    email: string;
    company: string | null;
  };
}

const STATUS_CONFIG = {
  PENDING: {
    label: "Pendiente",
    color: "bg-yellow-100 text-yellow-800 border-yellow-300 dark:bg-yellow-900/30 dark:text-yellow-300",
    Icon: Clock,
  },
  CONTACTED: {
    label: "Contactado",
    color: "bg-blue-100 text-blue-800 border-blue-300 dark:bg-blue-900/30 dark:text-blue-300",
    Icon: PhoneCall,
  },
  RESOLVED: {
    label: "Resuelto",
    color: "bg-emerald-100 text-emerald-800 border-emerald-300 dark:bg-emerald-900/30 dark:text-emerald-300",
    Icon: CheckCircle2,
  },
};

const PAGE_SIZE = 10;

export default function AdvisoryRequestsPage() {
  const [all, setAll] = useState<AdvisoryRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<"ALL" | "PENDING" | "CONTACTED" | "RESOLVED">("ALL");
  const [page, setPage] = useState(1);
  const { toast } = useToast();

  const fetchRequests = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/advisory");
      if (res.ok) setAll(await res.json());
    } catch {}
    finally { setLoading(false); }
  }, []);

  useEffect(() => { fetchRequests(); }, [fetchRequests]);

  // Reset page when filters change
  useEffect(() => { setPage(1); }, [search, statusFilter]);

  const updateStatus = async (id: string, status: string) => {
    setUpdatingId(id);
    try {
      const res = await fetch("/api/advisory", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, status }),
      });
      if (!res.ok) throw new Error();
      setAll(prev => prev.map(r => r.id === id ? { ...r, status: status as any } : r));
      toast({ title: "✅ Estado actualizado" });
    } catch {
      toast({ title: "❌ Error al actualizar", variant: "destructive" });
    } finally { setUpdatingId(null); }
  };

  // Filter logic
  const filtered = all.filter(r => {
    const matchStatus = statusFilter === "ALL" || r.status === statusFilter;
    const q = search.toLowerCase();
    const matchSearch =
      !q ||
      r.user.name?.toLowerCase().includes(q) ||
      r.user.email.toLowerCase().includes(q) ||
      r.user.company?.toLowerCase().includes(q) ||
      r.message?.toLowerCase().includes(q) ||
      r.subject?.toLowerCase().includes(q);
    return matchStatus && matchSearch;
  });

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const paginated = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const counts = {
    ALL: all.length,
    PENDING: all.filter(r => r.status === "PENDING").length,
    CONTACTED: all.filter(r => r.status === "CONTACTED").length,
    RESOLVED: all.filter(r => r.status === "RESOLVED").length,
  };

  const fmt = (d: string) =>
    new Date(d).toLocaleString("es-ES", { day: "2-digit", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-3xl font-bold">Solicitudes de Asesoría</h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1">
            Gestiona las solicitudes de contacto con experto
          </p>
        </div>
        <Button variant="outline" onClick={fetchRequests} disabled={loading} className="gap-2">
          <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
          Actualizar
        </Button>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {(["ALL", "PENDING", "CONTACTED", "RESOLVED"] as const).map((key) => (
          <button
            key={key}
            onClick={() => setStatusFilter(key)}
            className={`p-4 rounded-xl border text-left transition-all ${
              statusFilter === key
                ? "ring-2 ring-blue-500 border-blue-300 bg-blue-50 dark:bg-blue-900/20"
                : "border-gray-200 dark:border-gray-700 hover:border-gray-300 bg-white dark:bg-gray-900"
            }`}
          >
            <p className="text-2xl font-black text-gray-900 dark:text-white">{counts[key]}</p>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">
              {key === "ALL" ? "Total" : STATUS_CONFIG[key].label}
            </p>
          </button>
        ))}
      </div>

      {/* Search + filter bar */}
      <div className="flex flex-col sm:flex-row gap-3">
        {/* Search */}
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <input
            type="text"
            placeholder="Buscar por nombre, email, empresa o mensaje..."
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

        {/* Status dropdown */}
        <div className="relative">
          <Filter className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
          <select
            value={statusFilter}
            onChange={e => setStatusFilter(e.target.value as any)}
            className="pl-9 pr-8 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-400 appearance-none"
          >
            <option value="ALL">Todos los estados</option>
            <option value="PENDING">Pendiente</option>
            <option value="CONTACTED">Contactado</option>
            <option value="RESOLVED">Resuelto</option>
          </select>
        </div>
      </div>

      {/* Results table */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2 text-base">
              <MessageSquare className="h-5 w-5 text-blue-600" />
              Solicitudes
            </CardTitle>
            <CardDescription className="text-sm">
              {filtered.length} resultado{filtered.length !== 1 ? "s" : ""}
              {(search || statusFilter !== "ALL") && (
                <button
                  onClick={() => { setSearch(""); setStatusFilter("ALL"); }}
                  className="ml-2 text-blue-500 hover:underline text-xs"
                >
                  Limpiar filtros
                </button>
              )}
            </CardDescription>
          </div>
        </CardHeader>
        <CardContent className="pt-0">
          {loading ? (
            <div className="flex items-center justify-center py-16">
              <RefreshCw className="h-8 w-8 animate-spin text-gray-300" />
            </div>
          ) : paginated.length === 0 ? (
            <div className="text-center py-16">
              <MessageSquare className="h-12 w-12 mx-auto text-gray-200 dark:text-gray-700 mb-4" />
              <p className="text-gray-400">No se encontraron solicitudes</p>
              {(search || statusFilter !== "ALL") && (
                <button
                  onClick={() => { setSearch(""); setStatusFilter("ALL"); }}
                  className="mt-2 text-sm text-blue-500 hover:underline"
                >
                  Limpiar filtros
                </button>
              )}
            </div>
          ) : (
            <div className="space-y-3">
              {paginated.map((req) => {
                const { Icon } = STATUS_CONFIG[req.status];
                return (
                  <div
                    key={req.id}
                    className="p-4 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 hover:border-gray-300 dark:hover:border-gray-600 transition-all"
                  >
                    <div className="flex items-start justify-between gap-4 flex-wrap">
                      {/* User info */}
                      <div className="flex items-start gap-3 min-w-0">
                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center flex-shrink-0 text-white font-bold text-sm">
                          {(req.user.name || req.user.email)[0].toUpperCase()}
                        </div>
                        <div className="min-w-0">
                          <p className="font-semibold text-gray-900 dark:text-gray-100 truncate">
                            {req.user.name || "Sin nombre"}
                          </p>
                          <a
                            href={`mailto:${req.user.email}`}
                            className="flex items-center gap-1 text-sm text-blue-600 hover:underline"
                          >
                            <Mail className="h-3 w-3 flex-shrink-0" />
                            <span className="truncate">{req.user.email}</span>
                          </a>
                          {req.user.company && (
                            <p className="flex items-center gap-1 text-xs text-gray-400 mt-0.5">
                              <Building2 className="h-3 w-3 flex-shrink-0" />
                              {req.user.company}
                            </p>
                          )}
                        </div>
                      </div>

                      {/* Badge + actions */}
                      <div className="flex items-center gap-2 flex-wrap flex-shrink-0">
                        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full border text-xs font-semibold ${STATUS_CONFIG[req.status].color}`}>
                          <Icon className="h-3 w-3" />
                          {STATUS_CONFIG[req.status].label}
                        </span>
                        {req.status !== "CONTACTED" && (
                          <Button size="sm" variant="outline" disabled={updatingId === req.id}
                            onClick={() => updateStatus(req.id, "CONTACTED")}
                            className="text-xs gap-1 h-7 px-2">
                            <PhoneCall className="h-3 w-3" /> Contactado
                          </Button>
                        )}
                        {req.status !== "RESOLVED" && (
                          <Button size="sm" variant="outline" disabled={updatingId === req.id}
                            onClick={() => updateStatus(req.id, "RESOLVED")}
                            className="text-xs gap-1 h-7 px-2 text-emerald-700 border-emerald-300 hover:bg-emerald-50 dark:hover:bg-emerald-900/20">
                            <CheckCircle2 className="h-3 w-3" /> Resolver
                          </Button>
                        )}
                        {req.status !== "PENDING" && (
                          <Button size="sm" variant="ghost" disabled={updatingId === req.id}
                            onClick={() => updateStatus(req.id, "PENDING")}
                            className="text-xs h-7 px-2 text-gray-400 hover:text-gray-600">
                            Reabrir
                          </Button>
                        )}
                      </div>
                    </div>

                    {/* Message */}
                    {req.subject && (
                      <div className="mt-3 inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-indigo-50 dark:bg-indigo-900/20 border border-indigo-200 dark:border-indigo-700">
                        <MessageSquare className="h-3.5 w-3.5 text-indigo-600 dark:text-indigo-400 flex-shrink-0" />
                        <span className="text-xs font-semibold text-indigo-700 dark:text-indigo-300">{req.subject}</span>
                      </div>
                    )}
                    {req.message && (
                      <div className="mt-2 p-3 rounded-lg bg-gray-50 dark:bg-gray-800/50 border border-gray-100 dark:border-gray-700">
                        <p className="text-sm text-gray-700 dark:text-gray-300 whitespace-pre-wrap leading-relaxed">
                          {req.message}
                        </p>
                      </div>
                    )}

                    <p className="flex items-center gap-1 mt-3 text-xs text-gray-400">
                      <Calendar className="h-3 w-3" /> {fmt(req.createdAt)}
                    </p>
                  </div>
                );
              })}
            </div>
          )}

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between mt-6 pt-4 border-t border-gray-100 dark:border-gray-800">
              <p className="text-sm text-gray-500">
                Página {page} de {totalPages} · {filtered.length} resultados
              </p>
              <div className="flex items-center gap-1">
                <Button
                  variant="outline" size="sm"
                  disabled={page === 1}
                  onClick={() => setPage(1)}
                  className="h-8 w-8 p-0 text-xs"
                >
                  «
                </Button>
                <Button
                  variant="outline" size="sm"
                  disabled={page === 1}
                  onClick={() => setPage(p => p - 1)}
                  className="h-8 w-8 p-0"
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>

                {/* Page numbers */}
                {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                  let pageNum: number;
                  if (totalPages <= 5) {
                    pageNum = i + 1;
                  } else if (page <= 3) {
                    pageNum = i + 1;
                  } else if (page >= totalPages - 2) {
                    pageNum = totalPages - 4 + i;
                  } else {
                    pageNum = page - 2 + i;
                  }
                  return (
                    <Button
                      key={pageNum}
                      variant={page === pageNum ? "default" : "outline"}
                      size="sm"
                      onClick={() => setPage(pageNum)}
                      className="h-8 w-8 p-0 text-xs"
                    >
                      {pageNum}
                    </Button>
                  );
                })}

                <Button
                  variant="outline" size="sm"
                  disabled={page === totalPages}
                  onClick={() => setPage(p => p + 1)}
                  className="h-8 w-8 p-0"
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>
                <Button
                  variant="outline" size="sm"
                  disabled={page === totalPages}
                  onClick={() => setPage(totalPages)}
                  className="h-8 w-8 p-0 text-xs"
                >
                  »
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
