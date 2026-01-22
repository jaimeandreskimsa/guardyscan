"use client";

import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';

interface RiskTrendData {
  month: string;
  inherentRisk: number;
  residualRisk: number;
  riskAppetite: number;
  newRisks: number;
}

interface RiskTrendChartProps {
  data: RiskTrendData[];
}

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length > 0) {
    return (
      <div className="bg-white p-4 border border-gray-200 rounded-lg shadow-lg">
        <p className="font-semibold text-gray-900 mb-2">{label}</p>
        {payload.map((entry: any, index: number) => (
          <p key={index} className="text-sm" style={{ color: entry.color }}>
            <span className="font-medium">{entry.name}:</span> {entry.value}
          </p>
        ))}
      </div>
    );
  }
  return null;
};

export default function RiskTrendChart({ data }: RiskTrendChartProps) {
  return (
    <div className="w-full h-80">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart
          data={data}
          margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
        >
          <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
          <XAxis dataKey="month" />
          <YAxis yAxisId="left" />
          <YAxis yAxisId="right" orientation="right" />
          <Tooltip content={<CustomTooltip />} />
          <Legend />
          <Line 
            type="monotone" 
            dataKey="inherentRisk" 
            stroke="#ef4444" 
            strokeWidth={2}
            name="Riesgo Inherente"
            dot={{ fill: '#ef4444', strokeWidth: 2, r: 4 }}
            yAxisId="left"
          />
          <Line 
            type="monotone" 
            dataKey="residualRisk" 
            stroke="#f97316" 
            strokeWidth={2}
            name="Riesgo Residual"
            dot={{ fill: '#f97316', strokeWidth: 2, r: 4 }}
            yAxisId="left"
          />
          <Line 
            type="monotone" 
            dataKey="riskAppetite" 
            stroke="#22c55e" 
            strokeWidth={2}
            strokeDasharray="5 5"
            name="Apetito de Riesgo"
            dot={{ fill: '#22c55e', strokeWidth: 2, r: 4 }}
            yAxisId="left"
          />
          <Line 
            type="monotone" 
            dataKey="newRisks" 
            stroke="#8b5cf6" 
            strokeWidth={2}
            name="Nuevos Riesgos"
            dot={{ fill: '#8b5cf6', strokeWidth: 2, r: 4 }}
            yAxisId="right"
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}