"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import {
  MessageSquare, Clock, CheckCircle2, PhoneCall,
  Mail, Building2, Calendar, RefreshCw,
} from "lucide-react";

interface AdvisoryRequest {
  id: string;
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

export default function AdminPage() {
  const [requests, setRequests] = useState<AdvisoryRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<"ALL" | "PENDING" | "CONTACTED" | "RESOLVED">("ALL");
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const { toast } = useToast();

  const fetchRequests = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/advisory");
      if (res.ok) setRequests(await res.json());
    } catch {}
    finally { setLoading(false); }
  };

  useEffect(() => { fetchRequests(); }, []);

  const updateStatus = async (id: string, status: string) => {
    setUpdatingId(id);
    try {
      const res = await fetch("/api/advisory", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, status }),
      });
      if (!res.ok) throw new Error();
      setRequests(prev => prev.map(r => r.id === id ? { ...r, status: status as any } : r));
      toast({ title: "✅ Estado actualizado" });
    } catch {
      toast({ title: "❌ Error al actualizar", variant: "destructive" });
    } finally { setUpdatingId(null); }
  };

  const filtered = filter === "ALL" ? requests : requests.filter(r => r.status === filter);
  const counts = {
    ALL: requests.length,
    PENDING: requests.filter(r => r.status === "PENDING").length,
    CONTACTED: requests.filter(r => r.status === "CONTACTED").length,
    RESOLVED: requests.filter(r => r.status === "RESOLVED").length,
  };
  const fmt = (d: string) => new Date(d).toLocaleString("es-ES", { day: "2-digit", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Panel de Administración</h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1">Solicitudes de contacto con experto</p>
        </div>
        <Button variant="outline" onClick={fetchRequests} disabled={loading} className="gap-2">
          <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
          Actualizar
        </Button>
      </div>

      {/* Stat cards / filters */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {(["ALL", "PENDING", "CONTACTED", "RESOLVED"] as const).map((key) => (
          <button
            key={key}
            onClick={() => setFilter(key)}
            className={`p-4 rounded-xl border text-left transition-all ${
              filter === key
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

      {/* Requests */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MessageSquare className="h-5 w-5 text-blue-600" />
            Solicitudes de asesoría
          </CardTitle>
          <CardDescription>
            {filtered.length} resultado{filtered.length !== 1 ? "s" : ""}
            {filter !== "ALL" && ` · Filtro: ${STATUS_CONFIG[filter].label}`}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex items-center justify-center py-16">
              <RefreshCw className="h-8 w-8 animate-spin text-gray-300" />
            </div>
          ) : filtered.length === 0 ? (
            <div className="text-center py-16">
              <MessageSquare className="h-12 w-12 mx-auto text-gray-200 dark:text-gray-700 mb-4" />
              <p className="text-gray-400">No hay solicitudes{filter !== "ALL" ? ` en estado "${STATUS_CONFIG[filter].label}"` : ""}</p>
            </div>
          ) : (
            <div className="space-y-3">
              {filtered.map((req) => {
                const { Icon } = STATUS_CONFIG[req.status];
                return (
                  <div key={req.id} className="p-4 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 hover:border-gray-300 transition-all">
                    <div className="flex items-start justify-between gap-4 flex-wrap">
                      {/* User */}
                      <div className="flex items-start gap-3 min-w-0">
                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center flex-shrink-0 text-white font-bold text-sm">
                          {(req.user.name || req.user.email)[0].toUpperCase()}
                        </div>
                        <div className="min-w-0">
                          <p className="font-semibold text-gray-900 dark:text-gray-100">{req.user.name || "Sin nombre"}</p>
                          <a href={`mailto:${req.user.email}`} className="flex items-center gap-1 text-sm text-blue-600 hover:underline">
                            <Mail className="h-3 w-3" />{req.user.email}
                          </a>
                          {req.user.company && (
                            <p className="flex items-center gap-1 text-xs text-gray-400 mt-0.5">
                              <Building2 className="h-3 w-3" />{req.user.company}
                            </p>
                          )}
                        </div>
                      </div>

                      {/* Badge + actions */}
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full border text-xs font-semibold ${STATUS_CONFIG[req.status].color}`}>
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
                            className="text-xs gap-1 h-7 px-2 text-emerald-700 border-emerald-300 hover:bg-emerald-50">
                            <CheckCircle2 className="h-3 w-3" /> Resolver
                          </Button>
                        )}
                        {req.status !== "PENDING" && (
                          <Button size="sm" variant="ghost" disabled={updatingId === req.id}
                            onClick={() => updateStatus(req.id, "PENDING")}
                            className="text-xs h-7 px-2 text-gray-400">
                            Reabrir
                          </Button>
                        )}
                      </div>
                    </div>

                    {/* Message */}
                    {req.message && (
                      <div className="mt-3 p-3 rounded-lg bg-gray-50 dark:bg-gray-800/50 border border-gray-100 dark:border-gray-700">
                        <p className="text-sm text-gray-700 dark:text-gray-300 whitespace-pre-wrap">{req.message}</p>
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
        </CardContent>
      </Card>
    </div>
  );
}

