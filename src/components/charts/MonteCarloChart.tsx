"use client";

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';

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
  };
}

const getBarColor = (index: number, total: number) => {
  const ratio = index / (total - 1);
  if (ratio < 0.5) {
    // Green to yellow
    return `hsl(${120 - ratio * 120}, 70%, 50%)`;
  } else {
    // Yellow to red
    return `hsl(${120 - ratio * 120}, 70%, 50%)`;
  }
};

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length > 0) {
    const data = payload[0].payload;
    return (
      <div className="bg-white p-4 border border-gray-200 rounded-lg shadow-lg">
        <p className="font-semibold text-gray-900 mb-2">{label}</p>
        <p className="text-sm text-gray-600">
          <span className="font-medium">Frecuencia:</span> {data.frequency}
        </p>
        <p className="text-sm text-gray-600">
          <span className="font-medium">Probabilidad:</span> {(data.probability * 100).toFixed(2)}%
        </p>
      </div>
    );
  }
  return null;
};

export default function MonteCarloChart({ data, statistics }: MonteCarloChartProps) {
  // Asegurar que data sea un array válido
  const chartData = Array.isArray(data) ? data : [];
  
  if (chartData.length === 0) {
    return (
      <div className="w-full h-80 flex items-center justify-center text-gray-500">
        No hay datos de simulación disponibles
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="w-full h-80">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={chartData}
            margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
          >
            <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
            <XAxis 
              dataKey="range" 
              angle={-45}
              textAnchor="end"
              height={80}
              fontSize={12}
            />
            <YAxis label={{ value: 'Frecuencia', angle: -90, position: 'insideLeft' }} />
            <Tooltip content={<CustomTooltip />} />
            <Bar dataKey="frequency">
              {chartData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={getBarColor(index, chartData.length)} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
      
      {statistics && (
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          <div className="bg-blue-50 rounded-lg p-4 text-center">
            <div className="text-2xl font-bold text-blue-600">
              ${statistics.mean.toLocaleString()}
            </div>
            <div className="text-sm text-blue-500 font-medium">Media</div>
          </div>
          
          <div className="bg-yellow-50 rounded-lg p-4 text-center">
            <div className="text-2xl font-bold text-yellow-600">
              ${statistics.var95.toLocaleString()}
            </div>
            <div className="text-sm text-yellow-500 font-medium">VaR 95%</div>
          </div>
          
          <div className="bg-orange-50 rounded-lg p-4 text-center">
            <div className="text-2xl font-bold text-orange-600">
              ${statistics.var99.toLocaleString()}
            </div>
            <div className="text-sm text-orange-500 font-medium">VaR 99%</div>
          </div>
          
          <div className="bg-red-50 rounded-lg p-4 text-center">
            <div className="text-2xl font-bold text-red-600">
              ${statistics.max.toLocaleString()}
            </div>
            <div className="text-sm text-red-500 font-medium">Máximo</div>
          </div>
          
          <div className="bg-green-50 rounded-lg p-4 text-center">
            <div className="text-2xl font-bold text-green-600">
              ${statistics.min.toLocaleString()}
            </div>
            <div className="text-sm text-green-500 font-medium">Mínimo</div>
          </div>
        </div>
      )}
    </div>
  );
}