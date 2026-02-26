import React from 'react';
import { AlertTriangle, Clock } from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';

interface ThreatItem {
  id: string;
  title: string;
  severity: 'critical' | 'high' | 'medium' | 'low';
  timestamp: string;
  type: string;
}

const mockThreats: ThreatItem[] = [
  { id: 'T-001', title: 'SQL Injection Attempt on DB Server', severity: 'critical', timestamp: '2 min ago', type: 'Intrusion' },
  { id: 'T-002', title: 'Phishing Campaign Detected', severity: 'high', timestamp: '8 min ago', type: 'Phishing' },
  { id: 'T-003', title: 'Unusual Port Scan Activity', severity: 'medium', timestamp: '15 min ago', type: 'Recon' },
  { id: 'T-004', title: 'Malware Signature Match on Endpoint', severity: 'critical', timestamp: '22 min ago', type: 'Malware' },
  { id: 'T-005', title: 'Brute Force Login Attempts', severity: 'high', timestamp: '31 min ago', type: 'Auth Attack' },
  { id: 'T-006', title: 'Suspicious DNS Queries', severity: 'medium', timestamp: '45 min ago', type: 'DNS' },
  { id: 'T-007', title: 'Data Exfiltration Pattern Detected', severity: 'critical', timestamp: '1 hr ago', type: 'Data Breach' },
  { id: 'T-008', title: 'Unauthorized API Access', severity: 'low', timestamp: '2 hr ago', type: 'API' },
];

const severityConfig = {
  critical: { label: 'CRIT', color: 'text-neon-red border-neon-red/50 bg-neon-red/10', dot: 'bg-neon-red' },
  high: { label: 'HIGH', color: 'text-neon-orange border-neon-orange/50 bg-neon-orange/10', dot: 'bg-neon-orange' },
  medium: { label: 'MED', color: 'text-neon-yellow border-neon-yellow/50 bg-neon-yellow/10', dot: 'bg-neon-yellow' },
  low: { label: 'LOW', color: 'text-neon-green border-neon-green/50 bg-neon-green/10', dot: 'bg-neon-green' },
};

export default function ThreatFeedList() {
  return (
    <div className="cyber-card rounded border border-cyber-border h-full flex flex-col">
      <div className="flex items-center justify-between p-4 border-b border-cyber-border">
        <div className="flex items-center gap-2">
          <AlertTriangle className="w-4 h-4 text-neon-red animate-glow-pulse" />
          <h3 className="font-orbitron text-sm text-foreground">LIVE THREAT FEED</h3>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-1.5 h-1.5 rounded-full bg-neon-red animate-glow-pulse" />
          <span className="font-mono text-xs text-neon-red">LIVE</span>
        </div>
      </div>

      <ScrollArea className="flex-1">
        <div className="divide-y divide-cyber-border">
          {mockThreats.map((threat, i) => {
            const sev = severityConfig[threat.severity];
            return (
              <div
                key={threat.id}
                className="flex items-start gap-3 p-3 hover:bg-cyber-surface/50 transition-colors"
                style={{ animationDelay: `${i * 100}ms` }}
              >
                <div className={`mt-0.5 w-1.5 h-1.5 rounded-full flex-shrink-0 ${sev.dot}`} />
                <div className="flex-1 min-w-0">
                  <p className="font-mono text-xs text-foreground truncate">{threat.title}</p>
                  <div className="flex items-center gap-2 mt-1">
                    <span className={`font-mono text-xs px-1.5 py-0.5 rounded border ${sev.color}`}>
                      {sev.label}
                    </span>
                    <span className="font-mono text-xs text-muted-foreground">{threat.type}</span>
                  </div>
                </div>
                <div className="flex items-center gap-1 flex-shrink-0">
                  <Clock className="w-3 h-3 text-muted-foreground" />
                  <span className="font-mono text-xs text-muted-foreground">{threat.timestamp}</span>
                </div>
              </div>
            );
          })}
        </div>
      </ScrollArea>
    </div>
  );
}
