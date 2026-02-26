import React from 'react';
import {
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts';
import { BarChart3, PieChart as PieIcon, Activity } from 'lucide-react';
import { useGetAllCases, useGetAllIncidentReports } from '../hooks/useQueries';
import { CaseStatus, IncidentType, Severity } from '../backend';

// ─── Tooltip ─────────────────────────────────────────────────────────────────

const CyberTooltip = ({ active, payload, label }: { active?: boolean; payload?: { name: string; value: number; color: string }[]; label?: string }) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-cyber-dark-alt border border-neon-cyan/30 rounded p-3 font-mono text-xs shadow-lg">
        {label && <p className="text-neon-cyan mb-1">{label}</p>}
        {payload.map((entry) => (
          <p key={entry.name} style={{ color: entry.color }}>
            {entry.name}: {entry.value}
          </p>
        ))}
      </div>
    );
  }
  return null;
};

// ─── Colors ──────────────────────────────────────────────────────────────────

const SEVERITY_COLORS: Record<string, string> = {
  critical: '#ff4444',
  high: '#ff8800',
  medium: '#ffcc00',
  low: '#00ff88',
};

const STATUS_COLORS: Record<string, string> = {
  open: '#ff4444',
  inProgress: '#ffcc00',
  resolved: '#00ff88',
  closed: '#888888',
};

const TYPE_COLORS = ['#00d4ff', '#00ff88', '#ff4444', '#ff8800', '#cc44ff', '#ffcc00'];

const incidentTypeLabels: Record<string, string> = {
  phishing: 'Phishing',
  malware: 'Malware',
  ddos: 'DDoS',
  dataBreach: 'Data Breach',
  unauthorizedAccess: 'Unauth. Access',
  other: 'Other',
};

// ─── Custom Pie Label ─────────────────────────────────────────────────────────

const renderCustomLabel = ({
  cx,
  cy,
  midAngle,
  innerRadius,
  outerRadius,
  percent,
  name,
}: {
  cx: number;
  cy: number;
  midAngle: number;
  innerRadius: number;
  outerRadius: number;
  percent: number;
  name: string;
}) => {
  if (percent < 0.05) return null;
  const RADIAN = Math.PI / 180;
  const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
  const x = cx + radius * Math.cos(-midAngle * RADIAN);
  const y = cy + radius * Math.sin(-midAngle * RADIAN);
  return (
    <text
      x={x}
      y={y}
      fill="white"
      textAnchor="middle"
      dominantBaseline="central"
      fontSize={10}
      fontFamily="Share Tech Mono"
    >
      {`${(percent * 100).toFixed(0)}%`}
    </text>
  );
};

// ─── Component ───────────────────────────────────────────────────────────────

export default function AnalyticsPage() {
  const { data: cases = [], isLoading: casesLoading } = useGetAllCases();
  const { data: incidents = [], isLoading: incidentsLoading } = useGetAllIncidentReports();

  const isLoading = casesLoading || incidentsLoading;

  // Severity distribution
  const severityData = [
    { name: 'Critical', value: cases.filter((c) => c.severity === Severity.critical).length, key: 'critical' },
    { name: 'High', value: cases.filter((c) => c.severity === Severity.high).length, key: 'high' },
    { name: 'Medium', value: cases.filter((c) => c.severity === Severity.medium).length, key: 'medium' },
    { name: 'Low', value: cases.filter((c) => c.severity === Severity.low).length, key: 'low' },
  ].filter((d) => d.value > 0);

  // Status distribution
  const statusData = [
    { name: 'Open', value: cases.filter((c) => c.status === CaseStatus.open).length, key: 'open' },
    { name: 'In Progress', value: cases.filter((c) => c.status === CaseStatus.inProgress).length, key: 'inProgress' },
    { name: 'Resolved', value: cases.filter((c) => c.status === CaseStatus.resolved).length, key: 'resolved' },
    { name: 'Closed', value: cases.filter((c) => c.status === CaseStatus.closed).length, key: 'closed' },
  ];

  // Incident type distribution
  const typeCountMap: Record<string, number> = {};
  incidents.forEach((inc) => {
    const key = inc.incidentType as string;
    typeCountMap[key] = (typeCountMap[key] || 0) + 1;
  });
  const incidentTypeData = Object.entries(typeCountMap).map(([key, value]) => ({
    name: incidentTypeLabels[key] || key,
    value,
  }));

  // Summary stats
  const totalCases = cases.length;
  const resolvedRate =
    totalCases > 0
      ? Math.round(
          (cases.filter(
            (c) => c.status === CaseStatus.resolved || c.status === CaseStatus.closed
          ).length /
            totalCases) *
            100
        )
      : 0;
  const criticalOpen = cases.filter(
    (c) => c.severity === Severity.critical && c.status === CaseStatus.open
  ).length;

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-full bg-cyber-dark">
        <div className="text-center">
          <div className="w-12 h-12 border-2 border-neon-cyan border-t-transparent rounded-full animate-spin mx-auto mb-3" />
          <p className="font-mono text-xs text-neon-cyan">LOADING ANALYTICS...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6 min-h-full bg-cyber-dark">
      {/* Header */}
      <div>
        <h1 className="font-orbitron text-2xl font-bold text-foreground">
          SECURITY <span className="text-neon-cyan">ANALYTICS</span>
        </h1>
        <p className="font-mono text-xs text-muted-foreground mt-1">
          Visual intelligence derived from {totalCases} cases and {incidents.length} incident reports
        </p>
      </div>

      {/* KPI Row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Total Cases', value: totalCases, color: 'text-neon-cyan', border: 'border-neon-cyan/30' },
          { label: 'Resolution Rate', value: `${resolvedRate}%`, color: 'text-neon-green', border: 'border-neon-green/30' },
          { label: 'Critical Open', value: criticalOpen, color: 'text-neon-red', border: 'border-neon-red/30' },
          { label: 'Incident Reports', value: incidents.length, color: 'text-neon-pink', border: 'border-neon-pink/30' },
        ].map(({ label, value, color, border }) => (
          <div
            key={label}
            className={`cyber-card rounded border ${border} p-4 text-center animate-slide-up`}
          >
            <p className={`font-orbitron text-3xl font-bold ${color}`}>{value}</p>
            <p className="font-mono text-xs text-muted-foreground mt-1 uppercase tracking-wider">{label}</p>
          </div>
        ))}
      </div>

      {/* Charts Row 1 */}
      <div className="grid lg:grid-cols-2 gap-6">
        {/* Severity Pie */}
        <div className="cyber-card rounded border border-cyber-border p-5">
          <div className="flex items-center gap-2 mb-4">
            <PieIcon className="w-4 h-4 text-neon-pink" />
            <h2 className="font-orbitron text-sm text-foreground">CASES BY SEVERITY</h2>
          </div>
          {severityData.length === 0 ? (
            <div className="flex items-center justify-center h-56 text-muted-foreground">
              <p className="font-mono text-xs">No case data available</p>
            </div>
          ) : (
            <div className="h-56">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={severityData}
                    cx="50%"
                    cy="50%"
                    innerRadius={55}
                    outerRadius={90}
                    paddingAngle={3}
                    dataKey="value"
                    labelLine={false}
                    label={renderCustomLabel}
                  >
                    {severityData.map((entry) => (
                      <Cell
                        key={entry.key}
                        fill={SEVERITY_COLORS[entry.key] || '#888'}
                        stroke="transparent"
                      />
                    ))}
                  </Pie>
                  <Tooltip content={<CyberTooltip />} />
                  <Legend
                    formatter={(value) => (
                      <span style={{ fontFamily: 'Share Tech Mono', fontSize: 11, color: '#aaa' }}>
                        {value}
                      </span>
                    )}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>

        {/* Status Bar */}
        <div className="cyber-card rounded border border-cyber-border p-5">
          <div className="flex items-center gap-2 mb-4">
            <Activity className="w-4 h-4 text-neon-green" />
            <h2 className="font-orbitron text-sm text-foreground">CASES BY STATUS</h2>
          </div>
          {totalCases === 0 ? (
            <div className="flex items-center justify-center h-56 text-muted-foreground">
              <p className="font-mono text-xs">No case data available</p>
            </div>
          ) : (
            <div className="h-56">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={statusData} margin={{ top: 5, right: 5, left: -20, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                  <XAxis
                    dataKey="name"
                    tick={{ fill: 'rgba(255,255,255,0.4)', fontSize: 10, fontFamily: 'Share Tech Mono' }}
                    axisLine={{ stroke: 'rgba(255,255,255,0.1)' }}
                    tickLine={false}
                  />
                  <YAxis
                    tick={{ fill: 'rgba(255,255,255,0.4)', fontSize: 10, fontFamily: 'Share Tech Mono' }}
                    axisLine={false}
                    tickLine={false}
                    allowDecimals={false}
                  />
                  <Tooltip content={<CyberTooltip />} />
                  <Bar dataKey="value" name="Cases" radius={[2, 2, 0, 0]}>
                    {statusData.map((entry) => (
                      <Cell
                        key={entry.key}
                        fill={STATUS_COLORS[entry.key] || '#888'}
                      />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>
      </div>

      {/* Incident Type Chart */}
      <div className="cyber-card rounded border border-cyber-border p-5">
        <div className="flex items-center gap-2 mb-4">
          <BarChart3 className="w-4 h-4 text-neon-cyan" />
          <h2 className="font-orbitron text-sm text-foreground">INCIDENTS BY TYPE</h2>
        </div>
        {incidentTypeData.length === 0 ? (
          <div className="flex items-center justify-center h-48 text-muted-foreground">
            <p className="font-mono text-xs">No incident data available. Submit incident reports to see analytics.</p>
          </div>
        ) : (
          <div className="h-48">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={incidentTypeData} margin={{ top: 5, right: 5, left: -20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                <XAxis
                  dataKey="name"
                  tick={{ fill: 'rgba(255,255,255,0.4)', fontSize: 10, fontFamily: 'Share Tech Mono' }}
                  axisLine={{ stroke: 'rgba(255,255,255,0.1)' }}
                  tickLine={false}
                />
                <YAxis
                  tick={{ fill: 'rgba(255,255,255,0.4)', fontSize: 10, fontFamily: 'Share Tech Mono' }}
                  axisLine={false}
                  tickLine={false}
                  allowDecimals={false}
                />
                <Tooltip content={<CyberTooltip />} />
                <Bar dataKey="value" name="Incidents" radius={[2, 2, 0, 0]}>
                  {incidentTypeData.map((_entry, index) => (
                    <Cell key={index} fill={TYPE_COLORS[index % TYPE_COLORS.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}
      </div>

      {/* Severity breakdown table */}
      <div className="cyber-card rounded border border-cyber-border p-5">
        <h2 className="font-orbitron text-sm text-foreground mb-4">SEVERITY BREAKDOWN</h2>
        <div className="space-y-3">
          {[
            { label: 'Critical', key: Severity.critical, color: 'bg-neon-red', textColor: 'text-neon-red' },
            { label: 'High', key: Severity.high, color: 'bg-neon-orange', textColor: 'text-neon-orange' },
            { label: 'Medium', key: Severity.medium, color: 'bg-neon-yellow', textColor: 'text-neon-yellow' },
            { label: 'Low', key: Severity.low, color: 'bg-neon-green', textColor: 'text-neon-green' },
          ].map(({ label, key, color, textColor }) => {
            const count = cases.filter((c) => c.severity === key).length;
            const pct = totalCases > 0 ? Math.round((count / totalCases) * 100) : 0;
            return (
              <div key={label} className="flex items-center gap-3">
                <span className={`font-mono text-xs w-16 ${textColor}`}>{label}</span>
                <div className="flex-1 h-2 bg-cyber-surface rounded-full overflow-hidden">
                  <div
                    className={`h-full ${color} rounded-full transition-all duration-700`}
                    style={{ width: `${pct}%`, opacity: 0.8 }}
                  />
                </div>
                <span className="font-mono text-xs text-muted-foreground w-16 text-right">
                  {count} ({pct}%)
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Footer */}
      <footer className="pt-4 border-t border-cyber-border text-center">
        <p className="font-mono text-xs text-muted-foreground">
          © {new Date().getFullYear()} CyberShield — Built with{' '}
          <span className="text-neon-red">♥</span> using{' '}
          <a
            href={`https://caffeine.ai/?utm_source=Caffeine-footer&utm_medium=referral&utm_content=${encodeURIComponent(
              window.location.hostname || 'cybershield'
            )}`}
            target="_blank"
            rel="noopener noreferrer"
            className="text-neon-cyan hover:text-neon-green transition-colors"
          >
            caffeine.ai
          </a>
        </p>
      </footer>
    </div>
  );
}
