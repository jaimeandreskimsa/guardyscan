"use client";

import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { Users, DollarSign, TrendingUp, Activity, CreditCard, UserCheck, AlertCircle, CheckCircle } from "lucide-react";
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
    totalRevenue: number;
    monthlyRecurring: number;
    annualRevenue: number;
    recentActiveUsers: number;
    planDistribution: { [key: string]: number };
  };
  users: User[];
}

export default function AdminPage() {
  const [data, setData] = useState<AdminData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

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

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('es-CL', {
      style: 'currency',
      currency: 'CLP',
      minimumFractionDigits: 0,
    }).format(amount);
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
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[1, 2, 3, 4].map(i => (
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

  return (
    <div className="p-8 space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
          Finanzas y Métricas
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          Ingresos, proyecciones y análisis financiero
        </p>
      </div>

      {/* Métricas Principales */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Total Usuarios */}
        <Card className="p-6 hover:shadow-lg transition-shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Total Usuarios</p>
              <p className="text-3xl font-bold text-gray-900 dark:text-white">
                {metrics.totalUsers}
              </p>
              <p className="text-xs text-gray-500 mt-1">
                {metrics.recentActiveUsers} activos este mes
              </p>
            </div>
            <div className="h-12 w-12 bg-blue-100 rounded-lg flex items-center justify-center">
              <Users className="h-6 w-6 text-blue-600" />
            </div>
          </div>
        </Card>

        {/* Suscripciones Activas */}
        <Card className="p-6 hover:shadow-lg transition-shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Suscripciones Activas</p>
              <p className="text-3xl font-bold text-green-600">
                {metrics.activeSubscriptions}
              </p>
              <p className="text-xs text-gray-500 mt-1">
                {((metrics.activeSubscriptions / metrics.totalUsers) * 100).toFixed(1)}% conversión
              </p>
            </div>
            <div className="h-12 w-12 bg-green-100 rounded-lg flex items-center justify-center">
              <UserCheck className="h-6 w-6 text-green-600" />
            </div>
          </div>
        </Card>

        {/* Ingresos Mensuales (MRR) */}
        <Card className="p-6 hover:shadow-lg transition-shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Ingresos Mensuales (MRR)</p>
              <p className="text-3xl font-bold text-purple-600">
                {formatCurrency(metrics.monthlyRecurring)}
              </p>
              <p className="text-xs text-gray-500 mt-1">
                Recurrente mensual
              </p>
            </div>
            <div className="h-12 w-12 bg-purple-100 rounded-lg flex items-center justify-center">
              <DollarSign className="h-6 w-6 text-purple-600" />
            </div>
          </div>
        </Card>

        {/* Proyección Anual (ARR) */}
        <Card className="p-6 hover:shadow-lg transition-shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Proyección Anual (ARR)</p>
              <p className="text-3xl font-bold text-orange-600">
                {formatCurrency(metrics.annualRevenue)}
              </p>
              <p className="text-xs text-gray-500 mt-1">
                Ingresos proyectados
              </p>
            </div>
            <div className="h-12 w-12 bg-orange-100 rounded-lg flex items-center justify-center">
              <TrendingUp className="h-6 w-6 text-orange-600" />
            </div>
          </div>
        </Card>
      </div>

      {/* Distribución por Planes */}
      <Card className="p-6">
        <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
          Distribución por Planes
        </h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {Object.entries(metrics.planDistribution).map(([plan, count]) => (
            <div key={plan} className="text-center p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{count}</p>
              <p className="text-sm text-gray-600 dark:text-gray-400 capitalize mt-1">{plan}</p>
            </div>
          ))}
        </div>
      </Card>

      {/* Resumen Financiero */}
      <Card className="p-6">
        <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-6">
          Resumen de Ingresos
        </h2>
        <div className="space-y-4">
          <div className="flex items-center justify-between p-4 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Ingresos Mensuales (MRR)</p>
              <p className="text-2xl font-bold text-purple-600">{formatCurrency(metrics.monthlyRecurring)}</p>
            </div>
            <DollarSign className="h-8 w-8 text-purple-600" />
          </div>
          <div className="flex items-center justify-between p-4 bg-orange-50 dark:bg-orange-900/20 rounded-lg">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Proyección Anual (ARR)</p>
              <p className="text-2xl font-bold text-orange-600">{formatCurrency(metrics.annualRevenue)}</p>
            </div>
            <TrendingUp className="h-8 w-8 text-orange-600" />
          </div>
          <div className="flex items-center justify-between p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Tasa de Conversión</p>
              <p className="text-2xl font-bold text-green-600">
                {((metrics.activeSubscriptions / metrics.totalUsers) * 100).toFixed(1)}%
              </p>
            </div>
            <CheckCircle className="h-8 w-8 text-green-600" />
          </div>
        </div>
      </Card>
    </div>
  );
}
