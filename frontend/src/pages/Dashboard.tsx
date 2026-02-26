import React from 'react';
import { Shield, AlertTriangle, FolderOpen, CheckCircle, Activity } from 'lucide-react';
import StatCard from '../components/StatCard';
import ThreatFeedList from '../components/ThreatFeedList';
import IncidentTrendChart from '../components/IncidentTrendChart';
import AnimatedBackground from '../components/AnimatedBackground';
import { useGetAllCases, useGetAllIncidentReports } from '../hooks/useQueries';
import { CaseStatus, Severity } from '../backend';

export default function Dashboard() {
  const { data: cases = [] } = useGetAllCases();
  const { data: incidents = [] } = useGetAllIncidentReports();

  const openCases = cases.filter((c) => c.status === CaseStatus.open).length;
  const resolvedCases = cases.filter((c) => c.status === CaseStatus.resolved || c.status === CaseStatus.closed).length;
  const criticalThreats = cases.filter((c) => c.severity === Severity.critical && c.status === CaseStatus.open).length;
  const inProgressCases = cases.filter((c) => c.status === CaseStatus.inProgress).length;
  const systemHealth = criticalThreats === 0 ? 'SECURE' : criticalThreats < 3 ? 'ALERT' : 'CRITICAL';

  return (
    <div className="relative min-h-full bg-cyber-dark">
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <AnimatedBackground />
      </div>

      <div className="relative z-10 p-6 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="font-orbitron text-2xl font-bold text-foreground">
              SECURITY <span className="text-neon-green">DASHBOARD</span>
            </h1>
            <p className="font-mono text-xs text-muted-foreground mt-1">
              Real-time threat monitoring and incident overview
            </p>
          </div>
          <div className={`flex items-center gap-2 px-4 py-2 rounded border ${
            systemHealth === 'SECURE'
              ? 'border-neon-green/40 bg-neon-green/10 text-neon-green'
              : systemHealth === 'ALERT'
              ? 'border-neon-yellow/40 bg-neon-yellow/10 text-neon-yellow'
              : 'border-neon-red/40 bg-neon-red/10 text-neon-red'
          }`}>
            <Activity className="w-4 h-4 animate-glow-pulse" />
            <span className="font-orbitron text-xs">{systemHealth}</span>
          </div>
        </div>

        {/* Stat Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard
            title="Active Threats"
            value={criticalThreats}
            icon={AlertTriangle}
            color="red"
            trend={criticalThreats > 0 ? `${criticalThreats} critical` : 'None detected'}
            trendUp={criticalThreats > 0}
            delay={0}
          />
          <StatCard
            title="Open Cases"
            value={openCases}
            icon={FolderOpen}
            color="yellow"
            trend={`${inProgressCases} in progress`}
            trendUp={false}
            delay={100}
          />
          <StatCard
            title="Resolved"
            value={resolvedCases}
            icon={CheckCircle}
            color="green"
            trend="Total closed"
            trendUp={true}
            delay={200}
          />
          <StatCard
            title="Total Incidents"
            value={incidents.length}
            icon={Shield}
            color="cyan"
            trend={`${cases.length} cases created`}
            trendUp={true}
            delay={300}
          />
        </div>

        {/* Charts & Feed */}
        <div className="grid lg:grid-cols-3 gap-4">
          <div className="lg:col-span-2 h-72">
            <IncidentTrendChart />
          </div>
          <div className="h-72">
            <ThreatFeedList />
          </div>
        </div>

        {/* Recent Cases */}
        <div className="cyber-card rounded border border-cyber-border p-4">
          <div className="flex items-center gap-2 mb-4">
            <FolderOpen className="w-4 h-4 text-neon-cyan" />
            <h3 className="font-orbitron text-sm text-foreground">RECENT CASES</h3>
          </div>
          {cases.length === 0 ? (
            <p className="font-mono text-xs text-muted-foreground text-center py-6">
              No cases found. Create your first case to get started.
            </p>
          ) : (
            <div className="space-y-2">
              {cases.slice(0, 5).map((c) => (
                <div
                  key={c.id.toString()}
                  className="flex items-center gap-3 p-3 rounded border border-cyber-border hover:border-neon-cyan/30 bg-cyber-surface/50 transition-all"
                >
                  <span className="font-mono text-xs text-muted-foreground w-16">#{c.id.toString()}</span>
                  <span className="font-mono text-xs text-foreground flex-1 truncate">{c.title}</span>
                  <SeverityBadge severity={c.severity as string} />
                  <StatusBadge status={c.status as string} />
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function SeverityBadge({ severity }: { severity: string }) {
  const config: Record<string, string> = {
    critical: 'text-neon-red border-neon-red/40 bg-neon-red/10',
    high: 'text-neon-orange border-neon-orange/40 bg-neon-orange/10',
    medium: 'text-neon-yellow border-neon-yellow/40 bg-neon-yellow/10',
    low: 'text-neon-green border-neon-green/40 bg-neon-green/10',
  };
  return (
    <span className={`font-mono text-xs px-2 py-0.5 rounded border ${config[severity] || config.low}`}>
      {severity.toUpperCase()}
    </span>
  );
}

function StatusBadge({ status }: { status: string }) {
  const config: Record<string, string> = {
    open: 'text-neon-red border-neon-red/40 bg-neon-red/10',
    inProgress: 'text-neon-yellow border-neon-yellow/40 bg-neon-yellow/10',
    resolved: 'text-neon-green border-neon-green/40 bg-neon-green/10',
    closed: 'text-muted-foreground border-cyber-border bg-cyber-surface',
  };
  const labels: Record<string, string> = {
    open: 'OPEN',
    inProgress: 'IN PROGRESS',
    resolved: 'RESOLVED',
    closed: 'CLOSED',
  };
  return (
    <span className={`font-mono text-xs px-2 py-0.5 rounded border ${config[status] || config.open}`}>
      {labels[status] || status.toUpperCase()}
    </span>
  );
}
