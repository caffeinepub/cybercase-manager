import React, { useState } from 'react';
import { Link, useRouterState } from '@tanstack/react-router';
import {
  LayoutDashboard, FolderOpen, AlertTriangle, BarChart3,
  Users, ChevronLeft, ChevronRight, Shield
} from 'lucide-react';
import { useGetAllCases, useGetMyProfile } from '../hooks/useQueries';
import { CaseStatus, Role, Severity } from '../backend';

const baseNavItems = [
  { path: '/dashboard', label: 'DASHBOARD', icon: LayoutDashboard },
  { path: '/cases', label: 'CASES', icon: FolderOpen },
  { path: '/incidents', label: 'INCIDENTS', icon: AlertTriangle },
  { path: '/analytics', label: 'ANALYTICS', icon: BarChart3 },
];

export default function Sidebar() {
  const [collapsed, setCollapsed] = useState(false);
  const routerState = useRouterState();
  const currentPath = routerState.location.pathname;
  const { data: cases } = useGetAllCases();
  const { data: userProfile } = useGetMyProfile();

  const isAdmin = userProfile?.role === Role.admin;

  const hasCriticalThreats = cases?.some(
    (c) => c.severity === Severity.critical && c.status === CaseStatus.open
  );

  const allNavItems = [
    ...baseNavItems,
    ...(isAdmin ? [{ path: '/user-management', label: 'USER MGMT', icon: Users }] : []),
  ];

  return (
    <aside
      className={`flex flex-col bg-cyber-dark-alt border-r border-cyber-border transition-all duration-300 flex-shrink-0 ${
        collapsed ? 'w-16' : 'w-60'
      }`}
    >
      {/* Logo */}
      <div className={`flex items-center gap-3 p-4 border-b border-cyber-border ${collapsed ? 'justify-center' : ''}`}>
        <div className="relative flex-shrink-0">
          <img
            src="/assets/generated/app-logo.dim_256x256.png"
            alt="CyberShield"
            className="w-9 h-9 object-contain"
            style={{ filter: 'drop-shadow(0 0 8px oklch(0.82 0.22 155 / 0.8))' }}
          />
        </div>
        {!collapsed && (
          <div>
            <h1 className="font-orbitron text-sm font-bold text-neon-green neon-text-green leading-none">
              CYBER
            </h1>
            <h1 className="font-orbitron text-sm font-bold text-neon-cyan neon-text-cyan leading-none">
              SHIELD
            </h1>
          </div>
        )}
      </div>

      {/* System Status */}
      <div className={`mx-3 mt-3 p-2 rounded border ${
        hasCriticalThreats
          ? 'border-neon-red/50 bg-neon-red/5'
          : 'border-neon-green/30 bg-neon-green/5'
      }`}>
        <div className={`flex items-center gap-2 ${collapsed ? 'justify-center' : ''}`}>
          <div className={`w-2 h-2 rounded-full flex-shrink-0 animate-glow-pulse ${
            hasCriticalThreats ? 'bg-neon-red' : 'bg-neon-green'
          }`} />
          {!collapsed && (
            <span className={`font-mono text-xs ${
              hasCriticalThreats ? 'text-neon-red' : 'text-neon-green'
            }`}>
              {hasCriticalThreats ? 'THREATS DETECTED' : 'SYSTEM SECURE'}
            </span>
          )}
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-3 space-y-1 mt-2">
        {allNavItems.map(({ path, label, icon: Icon }) => {
          const isActive = currentPath === path || currentPath.startsWith(path + '/');
          return (
            <Link
              key={path}
              to={path}
              className={`flex items-center gap-3 px-3 py-2.5 rounded transition-all duration-200 group ${
                collapsed ? 'justify-center' : ''
              } ${
                isActive
                  ? 'bg-neon-green/10 border border-neon-green/30 text-neon-green'
                  : 'border border-transparent text-muted-foreground hover:text-foreground hover:bg-cyber-surface hover:border-cyber-border'
              }`}
            >
              <Icon className={`w-4 h-4 flex-shrink-0 ${isActive ? 'text-neon-green' : ''}`} />
              {!collapsed && (
                <span className="font-mono text-xs tracking-wider">{label}</span>
              )}
            </Link>
          );
        })}
      </nav>

      {/* User Info */}
      {!collapsed && userProfile && (
        <div className="mx-3 mb-3 p-2 rounded border border-cyber-border bg-cyber-surface/50">
          <div className="flex items-center gap-2">
            <div className={`p-1 rounded ${isAdmin ? 'bg-neon-pink/10' : 'bg-neon-cyan/10'}`}>
              <Shield className={`w-3 h-3 ${isAdmin ? 'text-neon-pink' : 'text-neon-cyan'}`} />
            </div>
            <div className="min-w-0">
              <p className="font-mono text-xs text-foreground truncate">{userProfile.name}</p>
              <p className={`font-mono text-xs ${isAdmin ? 'text-neon-pink' : 'text-neon-cyan'}`}>
                {isAdmin ? 'ADMIN' : 'ANALYST'}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Collapse Toggle */}
      <button
        onClick={() => setCollapsed(!collapsed)}
        className="flex items-center justify-center p-3 border-t border-cyber-border hover:bg-cyber-surface transition-colors"
      >
        {collapsed
          ? <ChevronRight className="w-4 h-4 text-muted-foreground" />
          : <ChevronLeft className="w-4 h-4 text-muted-foreground" />
        }
      </button>
    </aside>
  );
}
