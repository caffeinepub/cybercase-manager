import React, { ReactNode } from 'react';
import Sidebar from './Sidebar';
import { useInternetIdentity } from '../hooks/useInternetIdentity';
import { useGetMyProfile } from '../hooks/useQueries';
import { useQueryClient } from '@tanstack/react-query';
import { LogOut, Bell, Shield } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Role } from '../backend';

interface LayoutProps {
  children: ReactNode;
}

export default function Layout({ children }: LayoutProps) {
  const { clear } = useInternetIdentity();
  const { data: userProfile } = useGetMyProfile();
  const queryClient = useQueryClient();

  const handleLogout = async () => {
    await clear();
    queryClient.clear();
  };

  const isAdmin = userProfile?.role === Role.admin;
  const roleLabel = isAdmin ? 'ADMIN' : 'ANALYST';
  const roleColor = isAdmin ? 'text-neon-pink' : 'text-neon-cyan';

  return (
    <div className="flex h-screen bg-cyber-dark overflow-hidden">
      <Sidebar />
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Top Header */}
        <header className="h-14 flex items-center justify-between px-6 border-b border-cyber-border bg-cyber-dark-alt/80 backdrop-blur-sm flex-shrink-0">
          <div className="flex items-center gap-3">
            <div className="hidden md:flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-neon-green animate-glow-pulse" />
              <span className="font-mono text-xs text-muted-foreground">SYSTEM ONLINE</span>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <button className="relative p-2 rounded border border-cyber-border hover:border-neon-cyan/50 transition-colors">
              <Bell className="w-4 h-4 text-muted-foreground" />
              <span className="absolute top-1 right-1 w-1.5 h-1.5 bg-neon-red rounded-full" />
            </button>

            <div className="flex items-center gap-3 px-3 py-1.5 rounded border border-cyber-border bg-cyber-surface">
              <div className={`p-1 rounded ${isAdmin ? 'bg-neon-pink/10 border border-neon-pink/30' : 'bg-neon-green/10 border border-neon-green/30'}`}>
                <Shield className={`w-3.5 h-3.5 ${isAdmin ? 'text-neon-pink' : 'text-neon-green'}`} />
              </div>
              <div className="hidden sm:block">
                <p className="font-mono text-xs text-foreground leading-none">{userProfile?.name || 'Unknown'}</p>
                <p className={`font-mono text-xs ${roleColor} leading-none mt-0.5`}>{roleLabel}</p>
              </div>
            </div>

            <Button
              variant="ghost"
              size="sm"
              onClick={handleLogout}
              className="font-mono text-xs text-muted-foreground hover:text-neon-red hover:bg-neon-red/10 border border-transparent hover:border-neon-red/30 transition-all"
            >
              <LogOut className="w-4 h-4 mr-1" />
              <span className="hidden sm:inline">LOGOUT</span>
            </Button>
          </div>
        </header>

        {/* Main Content */}
        <main className="flex-1 overflow-y-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
