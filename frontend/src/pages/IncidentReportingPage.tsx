import React, { useState } from 'react';
import { AlertTriangle, Send, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { useGetAllIncidentReports, useReportIncident } from '../hooks/useQueries';
import { IncidentType, Severity } from '../backend';
import { toast } from 'sonner';

const incidentTypeLabels: Record<string, string> = {
  phishing: 'Phishing',
  malware: 'Malware',
  ddos: 'DDoS',
  dataBreach: 'Data Breach',
  unauthorizedAccess: 'Unauthorized Access',
  other: 'Other',
};

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

const defaultForm = {
  title: '',
  incidentType: IncidentType.other,
  description: '',
  affectedSystems: '',
  severity: Severity.medium,
  reporterName: '',
};

export default function IncidentReportingPage() {
  const [form, setForm] = useState({ ...defaultForm });
  const { data: incidents = [], isLoading, refetch } = useGetAllIncidentReports();
  const reportIncident = useReportIncident();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (
      !form.title.trim() ||
      !form.description.trim() ||
      !form.affectedSystems.trim() ||
      !form.reporterName.trim()
    ) {
      toast.error('Please fill in all required fields');
      return;
    }
    try {
      await reportIncident.mutateAsync(form);
      toast.success('Incident reported and case created successfully');
      setForm({ ...defaultForm });
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : 'Failed to report incident';
      toast.error(msg);
    }
  };

  const formatDate = (ts: bigint) =>
    new Date(Number(ts) / 1_000_000).toLocaleString();

  return (
    <div className="p-6 space-y-6 min-h-full bg-cyber-dark">
      {/* Header */}
      <div>
        <h1 className="font-orbitron text-2xl font-bold text-foreground">
          INCIDENT <span className="text-neon-red">REPORTING</span>
        </h1>
        <p className="font-mono text-xs text-muted-foreground mt-1">
          Log security incidents and automatically create tracking cases
        </p>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Report Form */}
        <div className="cyber-card rounded border border-neon-red/30 p-6">
          <div className="flex items-center gap-2 mb-5">
            <AlertTriangle className="w-4 h-4 text-neon-red" />
            <h2 className="font-orbitron text-sm text-neon-red">NEW INCIDENT REPORT</h2>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1.5">
              <Label className="font-mono text-xs text-neon-red uppercase tracking-widest">
                Incident Title *
              </Label>
              <Input
                value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
                placeholder="Brief incident title..."
                className="bg-cyber-dark border-cyber-border focus:border-neon-red font-mono text-sm"
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label className="font-mono text-xs text-neon-red uppercase tracking-widest">
                  Type *
                </Label>
                <Select
                  value={form.incidentType}
                  onValueChange={(v) => setForm({ ...form, incidentType: v as IncidentType })}
                >
                  <SelectTrigger className="bg-cyber-dark border-cyber-border font-mono text-sm">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-cyber-dark-alt border-cyber-border font-mono text-sm">
                    <SelectItem value={IncidentType.phishing}>Phishing</SelectItem>
                    <SelectItem value={IncidentType.malware}>Malware</SelectItem>
                    <SelectItem value={IncidentType.ddos}>DDoS</SelectItem>
                    <SelectItem value={IncidentType.dataBreach}>Data Breach</SelectItem>
                    <SelectItem value={IncidentType.unauthorizedAccess}>Unauthorized Access</SelectItem>
                    <SelectItem value={IncidentType.other}>Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-1.5">
                <Label className="font-mono text-xs text-neon-red uppercase tracking-widest">
                  Severity *
                </Label>
                <Select
                  value={form.severity}
                  onValueChange={(v) => setForm({ ...form, severity: v as Severity })}
                >
                  <SelectTrigger className="bg-cyber-dark border-cyber-border font-mono text-sm">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-cyber-dark-alt border-cyber-border font-mono text-sm">
                    <SelectItem value={Severity.critical}>🔴 Critical</SelectItem>
                    <SelectItem value={Severity.high}>🟠 High</SelectItem>
                    <SelectItem value={Severity.medium}>🟡 Medium</SelectItem>
                    <SelectItem value={Severity.low}>🟢 Low</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-1.5">
              <Label className="font-mono text-xs text-neon-red uppercase tracking-widest">
                Description *
              </Label>
              <Textarea
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
                placeholder="Describe what happened in detail..."
                className="bg-cyber-dark border-cyber-border focus:border-neon-red font-mono text-sm min-h-24 resize-none"
                required
              />
            </div>

            <div className="space-y-1.5">
              <Label className="font-mono text-xs text-neon-red uppercase tracking-widest">
                Affected Systems *
              </Label>
              <Input
                value={form.affectedSystems}
                onChange={(e) => setForm({ ...form, affectedSystems: e.target.value })}
                placeholder="e.g. Web Server, DB-01, Workstation-12..."
                className="bg-cyber-dark border-cyber-border focus:border-neon-red font-mono text-sm"
                required
              />
            </div>

            <div className="space-y-1.5">
              <Label className="font-mono text-xs text-neon-red uppercase tracking-widest">
                Reporter Name *
              </Label>
              <Input
                value={form.reporterName}
                onChange={(e) => setForm({ ...form, reporterName: e.target.value })}
                placeholder="Your name..."
                className="bg-cyber-dark border-cyber-border focus:border-neon-red font-mono text-sm"
                required
              />
            </div>

            <Button
              type="submit"
              disabled={reportIncident.isPending}
              className="w-full bg-neon-red/20 hover:bg-neon-red/30 border border-neon-red/50 text-neon-red font-orbitron text-xs tracking-wider hover:shadow-neon-red transition-all py-5"
            >
              {reportIncident.isPending ? (
                <span className="flex items-center gap-2">
                  <div className="w-3.5 h-3.5 border-2 border-neon-red border-t-transparent rounded-full animate-spin" />
                  SUBMITTING REPORT...
                </span>
              ) : (
                <span className="flex items-center gap-2">
                  <Send className="w-4 h-4" />
                  SUBMIT INCIDENT REPORT
                </span>
              )}
            </Button>
          </form>
        </div>

        {/* Info Panel */}
        <div className="space-y-4">
          <div className="cyber-card rounded border border-cyber-border p-5">
            <h3 className="font-orbitron text-sm text-neon-cyan mb-3">REPORTING GUIDELINES</h3>
            <ul className="space-y-2">
              {[
                'Document all affected systems immediately',
                'Preserve evidence before remediation',
                'Notify stakeholders within 1 hour of critical incidents',
                'A case will be auto-created for tracking',
                'Follow up with detailed forensic notes in the case',
              ].map((item, i) => (
                <li key={i} className="flex items-start gap-2">
                  <span className="text-neon-cyan font-mono text-xs mt-0.5">▸</span>
                  <span className="font-mono text-xs text-muted-foreground">{item}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="grid grid-cols-2 gap-3">
            {[
              { label: 'Total Reports', value: incidents.length, color: 'text-neon-cyan' },
              {
                label: 'Critical',
                value: incidents.filter((i) => i.severity === Severity.critical).length,
                color: 'text-neon-red',
              },
              {
                label: 'High',
                value: incidents.filter((i) => i.severity === Severity.high).length,
                color: 'text-neon-orange',
              },
              {
                label: 'Medium/Low',
                value: incidents.filter(
                  (i) => i.severity === Severity.medium || i.severity === Severity.low
                ).length,
                color: 'text-neon-green',
              },
            ].map(({ label, value, color }) => (
              <div
                key={label}
                className="cyber-card rounded border border-cyber-border p-3 text-center"
              >
                <p className={`font-orbitron text-2xl font-bold ${color}`}>{value}</p>
                <p className="font-mono text-xs text-muted-foreground mt-1">{label}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Incident Log Table */}
      <div className="cyber-card rounded border border-cyber-border overflow-hidden">
        <div className="flex items-center justify-between p-4 border-b border-cyber-border">
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-neon-yellow" />
            <h2 className="font-orbitron text-sm text-foreground">INCIDENT LOG</h2>
            <span className="font-mono text-xs text-muted-foreground ml-2">
              {incidents.length} records
            </span>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => refetch()}
            className="border border-cyber-border hover:border-neon-cyan/40 font-mono text-xs"
          >
            <RefreshCw className="w-3.5 h-3.5 mr-1" />
            REFRESH
          </Button>
        </div>

        <Table>
          <TableHeader>
            <TableRow className="border-cyber-border hover:bg-transparent">
              <TableHead className="font-mono text-xs text-neon-cyan uppercase tracking-wider">ID</TableHead>
              <TableHead className="font-mono text-xs text-neon-cyan uppercase tracking-wider">Title</TableHead>
              <TableHead className="font-mono text-xs text-neon-cyan uppercase tracking-wider">Type</TableHead>
              <TableHead className="font-mono text-xs text-neon-cyan uppercase tracking-wider">Severity</TableHead>
              <TableHead className="font-mono text-xs text-neon-cyan uppercase tracking-wider">Reporter</TableHead>
              <TableHead className="font-mono text-xs text-neon-cyan uppercase tracking-wider">Time</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-10">
                  <div className="flex items-center justify-center gap-2">
                    <div className="w-4 h-4 border-2 border-neon-red border-t-transparent rounded-full animate-spin" />
                    <span className="font-mono text-xs text-muted-foreground">LOADING INCIDENTS...</span>
                  </div>
                </TableCell>
              </TableRow>
            ) : incidents.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-10">
                  <AlertTriangle className="w-8 h-8 text-muted-foreground mx-auto mb-2" />
                  <p className="font-mono text-xs text-muted-foreground">No incidents reported yet</p>
                </TableCell>
              </TableRow>
            ) : (
              [...incidents]
                .sort((a, b) => Number(b.createdAt - a.createdAt))
                .map((incident) => (
                  <TableRow
                    key={incident.id.toString()}
                    className="border-cyber-border hover:bg-cyber-surface/50 transition-colors"
                  >
                    <TableCell className="font-mono text-xs text-muted-foreground">
                      #{incident.id.toString()}
                    </TableCell>
                    <TableCell className="font-mono text-xs text-foreground max-w-xs truncate">
                      {incident.title}
                    </TableCell>
                    <TableCell className="font-mono text-xs text-neon-cyan">
                      {incidentTypeLabels[incident.incidentType as string] || incident.incidentType}
                    </TableCell>
                    <TableCell>
                      <SeverityBadge severity={incident.severity as string} />
                    </TableCell>
                    <TableCell className="font-mono text-xs text-foreground">
                      {incident.reporterName}
                    </TableCell>
                    <TableCell className="font-mono text-xs text-muted-foreground">
                      {formatDate(incident.createdAt)}
                    </TableCell>
                  </TableRow>
                ))
            )}
          </TableBody>
        </Table>
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
