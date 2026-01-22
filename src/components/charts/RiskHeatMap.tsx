"use client";

import { ResponsiveContainer, ScatterChart, Scatter, XAxis, YAxis, CartesianGrid, Tooltip, Cell } from 'recharts';

interface RiskData {
  name: string;
  probability: number;
  impact: number;
  riskScore: number;
  category: string;
}

interface RiskHeatMapProps {
  data: RiskData[];
}

const getRiskColor = (score: number) => {
  if (score >= 16) return '#ef4444'; // High risk - red
  if (score >= 8) return '#f97316'; // Medium-high risk - orange
  if (score >= 4) return '#eab308'; // Medium risk - yellow
  if (score >= 2) return '#22c55e'; // Low-medium risk - green
  return '#10b981'; // Low risk - emerald
};

const CustomTooltip = ({ active, payload }: any) => {
  if (active && payload && payload.length > 0) {
    const data = payload[0].payload;
    return (
      <div className="bg-white p-4 border border-gray-200 rounded-lg shadow-lg">
        <p className="font-semibold text-gray-900">{data.name}</p>
        <p className="text-sm text-gray-600">
          <span className="font-medium">Probabilidad:</span> {data.probability}
        </p>
        <p className="text-sm text-gray-600">
          <span className="font-medium">Impacto:</span> {data.impact}
        </p>
        <p className="text-sm text-gray-600">
          <span className="font-medium">Score:</span> {data.riskScore.toFixed(1)}
        </p>
        <p className="text-sm text-gray-600">
          <span className="font-medium">Categoría:</span> {data.category}
        </p>
      </div>
    );
  }
  return null;
};

export default function RiskHeatMap({ data }: RiskHeatMapProps) {
  return (
    <div className="w-full h-80">
      <ResponsiveContainer width="100%" height="100%">
        <ScatterChart
          data={data}
          margin={{ top: 20, right: 20, bottom: 20, left: 20 }}
        >
          <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
          <XAxis 
            dataKey="probability" 
            domain={[0, 5]}
            label={{ value: 'Probabilidad', position: 'insideBottom', offset: -10 }}
          />
          <YAxis 
            dataKey="impact" 
            domain={[0, 5]}
            label={{ value: 'Impacto', angle: -90, position: 'insideLeft' }}
          />
          <Tooltip content={<CustomTooltip />} />
          <Scatter dataKey="impact">
            {data.map((entry, index) => (
              <Cell 
                key={`cell-${index}`} 
                fill={getRiskColor(entry.riskScore)}
              />
            ))}
          </Scatter>
        </ScatterChart>
      </ResponsiveContainer>
    </div>
  );
}