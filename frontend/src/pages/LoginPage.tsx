import React from 'react';
import { useInternetIdentity } from '../hooks/useInternetIdentity';
import { useQueryClient } from '@tanstack/react-query';
import { Shield, Lock, Eye, Zap, Globe, Server } from 'lucide-react';
import { Button } from '@/components/ui/button';
import AnimatedBackground from '../components/AnimatedBackground';

const features = [
  { icon: Shield, label: 'Threat Detection', desc: 'Real-time monitoring' },
  { icon: Eye, label: 'Case Management', desc: 'Full incident lifecycle' },
  { icon: Zap, label: 'Rapid Response', desc: 'Automated workflows' },
  { icon: Globe, label: 'Global Coverage', desc: 'Multi-vector defense' },
];

export default function LoginPage() {
  const { login, loginStatus, identity } = useInternetIdentity();
  const queryClient = useQueryClient();
  const isLoggingIn = loginStatus === 'logging-in';

  if (identity) {
    window.location.href = '/dashboard';
    return null;
  }

  return (
    <div className="min-h-screen bg-cyber-dark flex flex-col relative overflow-hidden">
      <AnimatedBackground />

      {/* Hero Banner */}
      <div className="relative w-full h-64 md:h-80 overflow-hidden flex-shrink-0">
        <img
          src="/assets/generated/hero-banner.dim_1440x600.png"
          alt="CyberShield Security Platform"
          className="w-full h-full object-cover"
          style={{ filter: 'brightness(0.7) saturate(1.2)' }}
        />
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-cyber-dark/40 to-cyber-dark" />
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <div className="flex items-center gap-4 mb-4">
            <img
              src="/assets/generated/app-logo.dim_256x256.png"
              alt="Logo"
              className="w-16 h-16 object-contain"
              style={{ filter: 'drop-shadow(0 0 16px oklch(0.82 0.22 155 / 0.9))' }}
            />
            <div>
              <h1 className="font-orbitron text-4xl md:text-5xl font-black text-neon-green neon-text-green">
                CYBER
              </h1>
              <h1 className="font-orbitron text-4xl md:text-5xl font-black text-neon-cyan neon-text-cyan -mt-2">
                SHIELD
              </h1>
            </div>
          </div>
          <p className="font-mono text-sm text-muted-foreground tracking-widest">
            ADVANCED THREAT MANAGEMENT SYSTEM
          </p>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex items-center justify-center px-4 py-8 relative z-10">
        <div className="w-full max-w-4xl grid md:grid-cols-2 gap-8 items-center">
          {/* Features */}
          <div className="space-y-4">
            <div className="mb-6">
              <h2 className="font-orbitron text-xl text-foreground mb-2">
                NEXT-GEN SECURITY OPERATIONS
              </h2>
              <p className="font-mono text-sm text-muted-foreground leading-relaxed">
                Unified cybersecurity platform for threat detection, incident management, and case resolution.
              </p>
            </div>
            <div className="grid grid-cols-2 gap-3">
              {features.map(({ icon: Icon, label, desc }) => (
                <div
                  key={label}
                  className="cyber-card rounded p-3 border border-cyber-border hover:border-neon-cyan/40 transition-all"
                >
                  <Icon className="w-5 h-5 text-neon-cyan mb-2" />
                  <p className="font-orbitron text-xs text-foreground">{label}</p>
                  <p className="font-mono text-xs text-muted-foreground mt-0.5">{desc}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Login Card */}
          <div className="cyber-card rounded border border-neon-green/30 p-8 relative overflow-hidden">
            <div className="absolute inset-0 cyber-grid-bg opacity-20 pointer-events-none" />
            <div className="relative z-10">
              <div className="flex items-center gap-3 mb-6">
                <div className="p-3 rounded border border-neon-green/40 bg-neon-green/10">
                  <Lock className="w-6 h-6 text-neon-green" />
                </div>
                <div>
                  <h3 className="font-orbitron text-base text-neon-green">SECURE ACCESS</h3>
                  <p className="font-mono text-xs text-muted-foreground">Authentication Required</p>
                </div>
              </div>

              <div className="space-y-4 mb-6">
                <div className="flex items-center gap-2 p-3 rounded border border-cyber-border bg-cyber-surface">
                  <Server className="w-4 h-4 text-neon-cyan flex-shrink-0" />
                  <div>
                    <p className="font-mono text-xs text-foreground">Internet Identity</p>
                    <p className="font-mono text-xs text-muted-foreground">Decentralized authentication</p>
                  </div>
                  <div className="ml-auto w-2 h-2 rounded-full bg-neon-green animate-glow-pulse" />
                </div>
              </div>

              <Button
                onClick={login}
                disabled={isLoggingIn}
                className="w-full bg-neon-green/20 hover:bg-neon-green/30 border border-neon-green/50 text-neon-green font-orbitron text-sm tracking-widest py-6 transition-all hover:shadow-neon-green"
              >
                {isLoggingIn ? (
                  <span className="flex items-center gap-2">
                    <div className="w-4 h-4 border-2 border-neon-green border-t-transparent rounded-full animate-spin" />
                    AUTHENTICATING...
                  </span>
                ) : (
                  <span className="flex items-center gap-2">
                    <Shield className="w-4 h-4" />
                    INITIATE SECURE LOGIN
                  </span>
                )}
              </Button>

              <p className="font-mono text-xs text-muted-foreground text-center mt-4">
                Protected by Internet Computer Protocol
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="relative z-10 py-4 px-6 border-t border-cyber-border text-center">
        <p className="font-mono text-xs text-muted-foreground">
          © {new Date().getFullYear()} CyberShield — Built with{' '}
          <span className="text-neon-red">♥</span> using{' '}
          <a
            href={`https://caffeine.ai/?utm_source=Caffeine-footer&utm_medium=referral&utm_content=${encodeURIComponent(window.location.hostname || 'cybershield')}`}
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
