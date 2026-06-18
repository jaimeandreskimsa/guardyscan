"use client";

import { useState } from "react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { Info, TrendingUp, AlertTriangle, ShieldCheck, Zap, HelpCircle } from "lucide-react";

interface MonteCarloData {
  range: string;
  frequency: number;
  probability: number;
}

interface MonteCarloChartProps {
  data: MonteCarloData[];
  statistics?: {
    mean: number;
    var95: number;
    var99: number;
    max: number;
    min: number;
    standardDeviation?: number;
  };
}

const fmt = (n: number) =>
  n >= 1_000_000
    ? `${(n / 1_000_000).toFixed(1)}M €`
    : n >= 1_000
    ? `${Math.round(n / 1_000)}K €`
    : `${Math.round(n)} €`;

const getRiskLevel = (mean: number) => {
  if (mean >= 500_000) return { label: "MUY ALTO", color: "text-red-600", bg: "bg-red-50 border-red-200", icon: "🔴" };
  if (mean >= 200_000) return { label: "ALTO", color: "text-orange-600", bg: "bg-orange-50 border-orange-200", icon: "🟠" };
  if (mean >= 50_000)  return { label: "MEDIO", color: "text-yellow-600", bg: "bg-yellow-50 border-yellow-200", icon: "🟡" };
  return { label: "BAJO", color: "text-green-600", bg: "bg-green-50 border-green-200", icon: "🟢" };
};

function InfoTooltip({ text }: { text: string }) {
  const [open, setOpen] = useState(false);
  return (
    <span
      className="relative inline-flex items-center ml-1 cursor-help"
      onMouseEnter={() => setOpen(true)}
      onMouseLeave={() => setOpen(false)}
    >
      <HelpCircle className="h-3.5 w-3.5 text-gray-400 hover:text-gray-600 transition-colors" />
      {open && (
        <span className="absolute z-50 bottom-full left-1/2 -translate-x-1/2 mb-2 w-60 rounded-lg bg-gray-900 px-3 py-2 text-xs text-white leading-relaxed shadow-xl">
          {text}
          <span className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-gray-900" />
        </span>
      )}
    </span>
  );
}

function StatCard({ label, sublabel, value, colorClass, bgClass, tooltip }: {
  label: string; sublabel: string; value: string;
  colorClass: string; bgClass: string; tooltip: string;
}) {
  return (
    <div className={`rounded-xl border p-4 ${bgClass}`}>
      <div className="flex items-center justify-between mb-1">
        <span className="text-xs font-semibold text-gray-500 uppercase tracking-wide leading-tight">{label}</span>
        <InfoTooltip text={tooltip} />
      </div>
      <div className={`text-xl font-bold ${colorClass} mt-1`}>{value}</div>
      <div className="text-[11px] text-gray-400 mt-0.5 leading-tight">{sublabel}</div>
    </div>
  );
}

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length > 0) {
    const d = payload[0].payload;
    return (
      <div className="bg-white border border-gray-200 rounded-xl shadow-xl p-3 text-sm">
        <p className="font-semibold text-gray-800 mb-1">Pérdida: {label}</p>
        <p className="text-gray-500">Ocurrió en <span className="font-medium text-gray-700">{d.frequency} simulaciones</span></p>
        <p className="text-gray-500">Probabilidad: <span className="font-medium text-gray-700">{(d.probability * 100).toFixed(1)}%</span></p>
      </div>
    );
  }
  return null;
};

const getBarColor = (index: number, total: number) => {
  const hue = Math.round(120 - (index / (total - 1)) * 120);
  return `hsl(${hue}, 70%, 50%)`;
};

export default function MonteCarloChart({ data, statistics }: MonteCarloChartProps) {
  const chartData = Array.isArray(data) ? data : [];

  if (chartData.length === 0) {
    return (
      <div className="w-full h-48 flex flex-col items-center justify-center gap-3 text-gray-400">
        <ShieldCheck className="h-10 w-10 opacity-40" />
        <p className="text-sm">Ejecuta la simulación para ver los resultados</p>
      </div>
    );
  }

  const stats = statistics;
  const risk = stats ? getRiskLevel(stats.mean) : null;

  return (
    <div className="space-y-5">
      {stats && risk && (
        <div className={`rounded-xl border px-5 py-4 ${risk.bg}`}>
          <div className="flex items-start gap-3">
            <span className="text-2xl mt-0.5">{risk.icon}</span>
            <div>
              <p className="font-semibold text-gray-800 text-sm">
                Nivel de exposición económica:{" "}
                <span className={`font-bold ${risk.color}`}>{risk.label}</span>
              </p>
              <p className="text-sm text-gray-600 mt-1 leading-relaxed">
                Según tus vulnerabilidades e incidentes activos, en un ataque típico
                podrías perder alrededor de{" "}
                <span className="font-semibold text-gray-800">{fmt(stats.mean)}</span>.{" "}
                En 9 de cada 10 casos las pérdidas no superarían{" "}
                <span className="font-semibold text-gray-800">{fmt(stats.var95)}</span>.
              </p>
            </div>
          </div>
        </div>
      )}
      <div>
        <p className="text-xs text-gray-400 mb-3 flex items-center gap-1.5">
          <Info className="h-3.5 w-3.5 shrink-0" />
          Cada barra muestra cuántos de los 10.000 escenarios simulados tuvieron ese nivel de pérdida. Verde = pérdidas bajas · Rojo = pérdidas altas.
        </p>
        <div className="w-full h-64">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData} margin={{ top: 5, right: 10, left: 5, bottom: 65 }}>
              <CartesianGrid strokeDasharray="3 3" className="opacity-20" />
              <XAxis dataKey="range" angle={-38} textAnchor="end" height={70} fontSize={10} tick={{ fill: "#9ca3af" }} label={{ value: "Pérdida económica estimada", position: "insideBottom", offset: -54, fontSize: 11, fill: "#9ca3af" }} />
              <YAxis fontSize={10} tick={{ fill: "#9ca3af" }} label={{ value: "Nº escenarios", angle: -90, position: "insideLeft", offset: 12, fontSize: 11, fill: "#9ca3af" }} />
              <Tooltip content={<CustomTooltip />} />
              <Bar dataKey="frequency" radius={[3, 3, 0, 0]}>
                {chartData.map((_, index) => (
                  <Cell key={`cell-${index}`} fill={getBarColor(index, chartData.length)} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
      {stats && (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
          <StatCard label="Pérdida esperada" sublabel="Promedio de todos los escenarios" value={fmt(stats.mean)} colorClass="text-blue-700" bgClass="bg-blue-50 border-blue-100" tooltip="Lo que perderías en un ataque típico. Es el promedio de los 10.000 escenarios simulados." />
          <StatCard label="Límite 95%" sublabel="9 de cada 10 ataques no llegan aquí" value={fmt(stats.var95)} colorClass="text-yellow-700" bgClass="bg-yellow-50 border-yellow-100" tooltip="En el 95% de los escenarios las pérdidas no superan este valor. Solo 1 de cada 20 ataques sería más grave." />
          <StatCard label="Límite 99%" sublabel="Solo el 1% superaría esta cifra" value={fmt(stats.var99)} colorClass="text-orange-700" bgClass="bg-orange-50 border-orange-100" tooltip="Escenario casi-catastrófico. Útil para dimensionar seguros de ciberriesgo o fondos de reserva." />
          <StatCard label="Peor caso" sublabel="Escenario más extremo posible" value={fmt(stats.max)} colorClass="text-red-700" bgClass="bg-red-50 border-red-100" tooltip="La pérdida más alta registrada entre los 10.000 escenarios. Ocurre cuando todas las vulnerabilidades se explotan a la vez." />
          <StatCard label="Mejor caso" sublabel="Si los riesgos no se materializan" value={fmt(stats.min)} colorClass="text-green-700" bgClass="bg-green-50 border-green-100" tooltip="La pérdida más baja registrada. Ocurre cuando la mayoría de vulnerabilidades no se explotan en ese momento." />
        </div>
      )}
      {stats && (
        <div className="rounded-xl border border-gray-100 bg-gray-50 px-5 py-4">
          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">¿Qué hacer con estos datos?</p>
          <ul className="space-y-2 text-sm text-gray-600">
            <li className="flex items-start gap-2">
              <Zap className="h-4 w-4 text-yellow-500 mt-0.5 shrink-0" />
              <span><strong>Reduce la pérdida esperada</strong> remediando las vulnerabilidades críticas y altas del módulo de escáner.</span>
            </li>
            <li className="flex items-start gap-2">
              <TrendingUp className="h-4 w-4 text-blue-500 mt-0.5 shrink-0" />
              <span><strong>Dimensiona tu seguro</strong> de ciberriesgo usando el <span className="font-medium">Límite 99%</span> ({fmt(stats.var99)}) como referencia de cobertura mínima.</span>
            </li>
            <li className="flex items-start gap-2">
              <AlertTriangle className="h-4 w-4 text-orange-500 mt-0.5 shrink-0" />
              <span><strong>Vuelve a simular</strong> después de resolver incidentes y aplicar parches para ver cómo baja tu exposición.</span>
            </li>
          </ul>
        </div>
      )}
    </div>
  );
}
