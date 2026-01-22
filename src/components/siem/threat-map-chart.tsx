"use client";

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';

interface ThreatMapChartProps {
  data: any[];
}

const THREAT_COLORS = {
  malware: '#ef4444',
  phishing: '#f97316',
  c2: '#8b5cf6',
  botnet: '#06b6d4',
  spam: '#eab308',
  other: '#6b7280',
};

export function ThreatMapChart({ data }: ThreatMapChartProps) {
  const threatsByType = data.reduce((acc: any, threat) => {
    const type = threat.threatType;
    const existing = acc.find((item: any) => item.name === type);
    if (existing) {
      existing.count += 1;
    } else {
      acc.push({
        name: type,
        count: 1,
        color: THREAT_COLORS[type as keyof typeof THREAT_COLORS] || THREAT_COLORS.other
      });
    }
    return acc;
  }, []);

  if (data.length === 0) {
    return (
      <div className="h-64 flex items-center justify-center text-gray-500">
        <div className="text-center">
          <p className="text-sm">No active threats</p>
          <p className="text-xs mt-1">System secure</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-64">
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={threatsByType}
            cx="50%"
            cy="50%"
            labelLine={false}
            label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
            outerRadius={80}
            fill="#8884d8"
            dataKey="count"
          >
            {threatsByType.map((entry: any, index: number) => (
              <Cell key={`cell-${index}`} fill={entry.color} />
            ))}
          </Pie>
          <Tooltip 
            contentStyle={{ 
              backgroundColor: 'white', 
              border: '1px solid #e5e7eb',
              borderRadius: '8px',
              boxShadow: '0 4px 6px rgba(0,0,0,0.1)'
            }}
          />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}