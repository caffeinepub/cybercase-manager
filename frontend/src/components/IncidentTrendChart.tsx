import React from 'react';
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer
} from 'recharts';
import { TrendingUp } from 'lucide-react';

const data = [
  { day: 'MON', incidents: 4, resolved: 2 },
  { day: 'TUE', incidents: 7, resolved: 5 },
  { day: 'WED', incidents: 3, resolved: 3 },
  { day: 'THU', incidents: 9, resolved: 6 },
  { day: 'FRI', incidents: 6, resolved: 4 },
  { day: 'SAT', incidents: 2, resolved: 2 },
  { day: 'SUN', incidents: 5, resolved: 3 },
];

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-cyber-dark-alt border border-neon-cyan/30 rounded p-3 font-mono text-xs">
        <p className="text-neon-cyan mb-1">{label}</p>
        {payload.map((entry: any) => (
          <p key={entry.name} style={{ color: entry.color }}>
            {entry.name.toUpperCase()}: {entry.value}
          </p>
        ))}
      </div>
    );
  }
  return null;
};

export default function IncidentTrendChart() {
  return (
    <div className="cyber-card rounded border border-cyber-border p-4 h-full flex flex-col">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <TrendingUp className="w-4 h-4 text-neon-cyan" />
          <h3 className="font-orbitron text-sm text-foreground">INCIDENT TREND (7 DAYS)</h3>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1.5">
            <div className="w-2 h-2 rounded-full bg-neon-red" />
            <span className="font-mono text-xs text-muted-foreground">Incidents</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-2 h-2 rounded-full bg-neon-green" />
            <span className="font-mono text-xs text-muted-foreground">Resolved</span>
          </div>
        </div>
      </div>

      <div className="flex-1 min-h-0">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data} margin={{ top: 5, right: 5, left: -20, bottom: 0 }}>
            <defs>
              <linearGradient id="incidentGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#ff4444" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#ff4444" stopOpacity={0} />
              </linearGradient>
              <linearGradient id="resolvedGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#00ff88" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#00ff88" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
            <XAxis
              dataKey="day"
              tick={{ fill: 'rgba(255,255,255,0.4)', fontSize: 10, fontFamily: 'Share Tech Mono' }}
              axisLine={{ stroke: 'rgba(255,255,255,0.1)' }}
              tickLine={false}
            />
            <YAxis
              tick={{ fill: 'rgba(255,255,255,0.4)', fontSize: 10, fontFamily: 'Share Tech Mono' }}
              axisLine={false}
              tickLine={false}
            />
            <Tooltip content={<CustomTooltip />} />
            <Area
              type="monotone"
              dataKey="incidents"
              stroke="#ff4444"
              strokeWidth={2}
              fill="url(#incidentGrad)"
            />
            <Area
              type="monotone"
              dataKey="resolved"
              stroke="#00ff88"
              strokeWidth={2}
              fill="url(#resolvedGrad)"
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
