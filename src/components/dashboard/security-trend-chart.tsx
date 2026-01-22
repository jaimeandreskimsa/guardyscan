"use client";

import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

interface SecurityTrendChartProps {
  scans: any[];
}

export function SecurityTrendChart({ scans }: SecurityTrendChartProps) {
  const data = scans
    .filter(scan => scan.score !== null)
    .reverse()
    .map((scan, index) => ({
      name: `#${index + 1}`,
      score: scan.score,
      date: new Date(scan.createdAt).toLocaleDateString('es-ES', { day: 'numeric', month: 'short' }),
    }));

  if (data.length === 0) {
    return (
      <div className="h-64 flex items-center justify-center text-gray-500">
        <div className="text-center">
          <p className="text-sm">No hay datos suficientes</p>
          <p className="text-xs mt-1">Realiza más escaneos para ver la tendencia</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-64">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
          <defs>
            <linearGradient id="colorScore" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/>
              <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
          <XAxis 
            dataKey="date" 
            stroke="#6b7280" 
            fontSize={12}
            tickLine={false}
          />
          <YAxis 
            stroke="#6b7280" 
            fontSize={12}
            domain={[0, 100]}
            tickLine={false}
          />
          <Tooltip 
            contentStyle={{ 
              backgroundColor: 'white', 
              border: '1px solid #e5e7eb',
              borderRadius: '8px',
              boxShadow: '0 4px 6px rgba(0,0,0,0.1)'
            }}
            labelStyle={{ fontWeight: 'bold', color: '#1f2937' }}
          />
          <Area 
            type="monotone" 
            dataKey="score" 
            stroke="#3b82f6" 
            strokeWidth={2}
            fill="url(#colorScore)" 
            name="Puntuación"
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
