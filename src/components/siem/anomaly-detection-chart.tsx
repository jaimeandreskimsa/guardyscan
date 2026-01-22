"use client";

import { ScatterChart, Scatter, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

interface AnomalyDetectionChartProps {
  events: any[];
}

export function AnomalyDetectionChart({ events }: AnomalyDetectionChartProps) {
  // Simple anomaly detection algorithm
  const anomalyData = events.map((event, index) => {
    const timestamp = new Date(event.timestamp).getTime();
    const baseTime = new Date().setHours(0, 0, 0, 0);
    const hoursSinceStart = (timestamp - baseTime) / (1000 * 60 * 60);
    
    // Calculate anomaly score based on event frequency and severity
    const recentEvents = events.slice(Math.max(0, index - 10), index);
    const frequencyScore = recentEvents.length;
    const severityScore = event.severity === 'CRITICAL' ? 4 : 
                         event.severity === 'HIGH' ? 3 : 
                         event.severity === 'MEDIUM' ? 2 : 1;
    
    const anomalyScore = frequencyScore * severityScore;
    const isAnomalous = anomalyScore > 8;
    
    return {
      x: hoursSinceStart,
      y: anomalyScore,
      isAnomalous,
      event: event.eventType,
      severity: event.severity,
      source: event.source,
    };
  });

  const normalEvents = anomalyData.filter(d => !d.isAnomalous);
  const anomalousEvents = anomalyData.filter(d => d.isAnomalous);

  if (events.length === 0) {
    return (
      <div className="h-64 flex items-center justify-center text-gray-500">
        <div className="text-center">
          <p className="text-sm">No data for anomaly detection</p>
          <p className="text-xs mt-1">ML engine learning...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-64">
      <ResponsiveContainer width="100%" height="100%">
        <ScatterChart margin={{ top: 20, right: 20, bottom: 20, left: -20 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
          <XAxis 
            type="number" 
            dataKey="x" 
            name="Hours" 
            stroke="#6b7280" 
            fontSize={12}
            tickLine={false}
          />
          <YAxis 
            type="number" 
            dataKey="y" 
            name="Risk Score" 
            stroke="#6b7280" 
            fontSize={12}
            tickLine={false}
          />
          <Tooltip 
            cursor={{ strokeDasharray: '3 3' }}
            content={({ active, payload }) => {
              if (active && payload && payload.length > 0) {
                const data = payload[0].payload;
                return (
                  <div className="bg-white p-3 border border-gray-200 rounded-lg shadow-lg">
                    <p className="font-semibold">{data.event}</p>
                    <p className="text-sm">Source: {data.source}</p>
                    <p className="text-sm">Severity: {data.severity}</p>
                    <p className="text-sm">Risk Score: {data.y.toFixed(2)}</p>
                    {data.isAnomalous && (
                      <p className="text-sm text-red-600 font-semibold">⚠️ Anomaly Detected</p>
                    )}
                  </div>
                );
              }
              return null;
            }}
          />
          <Scatter 
            name="Normal Events" 
            data={normalEvents} 
            fill="#3b82f6" 
            fillOpacity={0.6}
          />
          <Scatter 
            name="Anomalous Events" 
            data={anomalousEvents} 
            fill="#ef4444" 
            fillOpacity={0.8}
          />
        </ScatterChart>
      </ResponsiveContainer>
    </div>
  );
}