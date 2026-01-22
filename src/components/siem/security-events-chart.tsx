"use client";

import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area } from 'recharts';

interface SecurityEventsChartProps {
  data: any[];
}

export function SecurityEventsChart({ data }: SecurityEventsChartProps) {
  // Process data for timeline chart
  const processedData = data.reduce((acc: any[], event) => {
    const hour = new Date(event.timestamp).getHours();
    const timeSlot = `${hour}:00`;
    
    const existing = acc.find(item => item.time === timeSlot);
    if (existing) {
      existing.events += 1;
      if (event.severity === 'CRITICAL') existing.critical += 1;
      if (event.severity === 'HIGH') existing.high += 1;
      if (event.severity === 'MEDIUM') existing.medium += 1;
      if (event.severity === 'LOW') existing.low += 1;
    } else {
      acc.push({
        time: timeSlot,
        events: 1,
        critical: event.severity === 'CRITICAL' ? 1 : 0,
        high: event.severity === 'HIGH' ? 1 : 0,
        medium: event.severity === 'MEDIUM' ? 1 : 0,
        low: event.severity === 'LOW' ? 1 : 0,
      });
    }
    
    return acc;
  }, []);

  // Fill missing hours with 0 events
  const last24Hours = Array.from({ length: 24 }, (_, i) => {
    const hour = (new Date().getHours() - (23 - i)) % 24;
    const timeSlot = `${hour < 0 ? hour + 24 : hour}:00`;
    const existing = processedData.find(item => item.time === timeSlot);
    return existing || {
      time: timeSlot,
      events: 0,
      critical: 0,
      high: 0,
      medium: 0,
      low: 0,
    };
  });

  if (data.length === 0) {
    return (
      <div className="h-64 flex items-center justify-center text-gray-500">
        <div className="text-center">
          <p className="text-sm">No security events detected</p>
          <p className="text-xs mt-1">Monitoring active...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-64">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={last24Hours} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
          <defs>
            <linearGradient id="colorCritical" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#ef4444" stopOpacity={0.3}/>
              <stop offset="95%" stopColor="#ef4444" stopOpacity={0}/>
            </linearGradient>
            <linearGradient id="colorHigh" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#f97316" stopOpacity={0.3}/>
              <stop offset="95%" stopColor="#f97316" stopOpacity={0}/>
            </linearGradient>
            <linearGradient id="colorMedium" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#eab308" stopOpacity={0.3}/>
              <stop offset="95%" stopColor="#eab308" stopOpacity={0}/>
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
          <XAxis 
            dataKey="time" 
            stroke="#6b7280" 
            fontSize={12}
            tickLine={false}
          />
          <YAxis 
            stroke="#6b7280" 
            fontSize={12}
            tickLine={false}
            allowDecimals={false}
          />
          <Tooltip 
            contentStyle={{ 
              backgroundColor: 'white', 
              border: '1px solid #e5e7eb',
              borderRadius: '8px',
              boxShadow: '0 4px 6px rgba(0,0,0,0.1)'
            }}
          />
          <Area 
            type="monotone" 
            dataKey="critical" 
            stackId="1"
            stroke="#ef4444" 
            fill="url(#colorCritical)" 
            name="Critical"
          />
          <Area 
            type="monotone" 
            dataKey="high" 
            stackId="1"
            stroke="#f97316" 
            fill="url(#colorHigh)" 
            name="High"
          />
          <Area 
            type="monotone" 
            dataKey="medium" 
            stackId="1"
            stroke="#eab308" 
            fill="url(#colorMedium)" 
            name="Medium"
          />
          <Area 
            type="monotone" 
            dataKey="low" 
            stackId="1"
            stroke="#3b82f6" 
            fill="rgba(59, 130, 246, 0.1)" 
            name="Low"
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}