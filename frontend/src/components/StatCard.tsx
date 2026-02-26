import React from 'react';
import { LucideIcon } from 'lucide-react';

interface StatCardProps {
  title: string;
  value: string | number;
  icon: LucideIcon;
  trend?: string;
  trendUp?: boolean;
  color?: 'green' | 'cyan' | 'red' | 'yellow' | 'pink';
  delay?: number;
}

const colorMap = {
  green: {
    border: 'border-neon-green/30 hover:border-neon-green/60',
    icon: 'text-neon-green bg-neon-green/10 border-neon-green/30',
    value: 'text-neon-green',
    glow: 'hover:shadow-neon-green',
    dot: 'bg-neon-green',
  },
  cyan: {
    border: 'border-neon-cyan/30 hover:border-neon-cyan/60',
    icon: 'text-neon-cyan bg-neon-cyan/10 border-neon-cyan/30',
    value: 'text-neon-cyan',
    glow: 'hover:shadow-neon-cyan',
    dot: 'bg-neon-cyan',
  },
  red: {
    border: 'border-neon-red/30 hover:border-neon-red/60',
    icon: 'text-neon-red bg-neon-red/10 border-neon-red/30',
    value: 'text-neon-red',
    glow: 'hover:shadow-neon-red',
    dot: 'bg-neon-red',
  },
  yellow: {
    border: 'border-neon-yellow/30 hover:border-neon-yellow/60',
    icon: 'text-neon-yellow bg-neon-yellow/10 border-neon-yellow/30',
    value: 'text-neon-yellow',
    glow: '',
    dot: 'bg-neon-yellow',
  },
  pink: {
    border: 'border-neon-pink/30 hover:border-neon-pink/60',
    icon: 'text-neon-pink bg-neon-pink/10 border-neon-pink/30',
    value: 'text-neon-pink',
    glow: '',
    dot: 'bg-neon-pink',
  },
};

export default function StatCard({ title, value, icon: Icon, trend, trendUp, color = 'green', delay = 0 }: StatCardProps) {
  const colors = colorMap[color];

  return (
    <div
      className={`relative cyber-card rounded p-5 border transition-all duration-300 cursor-default animate-slide-up ${colors.border} ${colors.glow}`}
      style={{
        animationDelay: `${delay}ms`,
        backgroundImage: 'url(/assets/generated/card-texture.dim_600x400.png)',
        backgroundSize: 'cover',
        backgroundBlendMode: 'overlay',
      }}
    >
      {/* Corner accents */}
      <div className={`absolute top-0 left-0 w-3 h-3 border-t-2 border-l-2 ${colors.border.split(' ')[0].replace('border-', 'border-')}`} />
      <div className={`absolute top-0 right-0 w-3 h-3 border-t-2 border-r-2 ${colors.border.split(' ')[0].replace('border-', 'border-')}`} />
      <div className={`absolute bottom-0 left-0 w-3 h-3 border-b-2 border-l-2 ${colors.border.split(' ')[0].replace('border-', 'border-')}`} />
      <div className={`absolute bottom-0 right-0 w-3 h-3 border-b-2 border-r-2 ${colors.border.split(' ')[0].replace('border-', 'border-')}`} />

      <div className="flex items-start justify-between mb-3">
        <div className={`p-2 rounded border ${colors.icon}`}>
          <Icon className="w-5 h-5" />
        </div>
        <div className={`w-2 h-2 rounded-full ${colors.dot} animate-glow-pulse`} />
      </div>

      <div className={`font-orbitron text-3xl font-bold ${colors.value} mb-1`}>
        {value}
      </div>
      <div className="font-mono text-xs text-muted-foreground uppercase tracking-widest mb-2">
        {title}
      </div>

      {trend && (
        <div className={`font-mono text-xs ${trendUp ? 'text-neon-green' : 'text-neon-red'}`}>
          {trendUp ? '▲' : '▼'} {trend}
        </div>
      )}
    </div>
  );
}
