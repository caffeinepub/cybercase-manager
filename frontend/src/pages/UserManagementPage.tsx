import React, { useState } from 'react';
import { Users, Shield, RefreshCw, ChevronDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useGetAllUsers, useSetUserRole, useGetMyProfile } from '../hooks/useQueries';
import { Role, UserProfile } from '../backend';

function RoleBadge({ role }: { role: Role }) {
  const isAdmin = role === Role.admin;
  return (
    <span
      className={`font-mono text-xs px-2 py-0.5 rounded border ${
        isAdmin
          ? 'text-neon-pink border-neon-pink/40 bg-neon-pink/10'
          : 'text-neon-cyan border-neon-cyan/40 bg-neon-cyan/10'
      }`}
    >
      {isAdmin ? 'ADMIN' : 'ANALYST'}
    </span>
  );
}

function truncatePrincipal(principal: string): string {
  if (principal.length <= 16) return principal;
  return `${principal.slice(0, 8)}...${principal.slice(-4)}`;
}

export default function UserManagementPage() {
  const { data: users = [], isLoading, refetch } = useGetAllUsers();
  const { data: myProfile } = useGetMyProfile();
  const setUserRole = useSetUserRole();

  const [pendingChange, setPendingChange] = useState<{
    user: UserProfile;
    newRole: Role;
  } | null>(null);

  const handleRoleChange = (user: UserProfile, newRole: Role) => {
    if (user.role === newRole) return;
    setPendingChange({ user, newRole });
  };

  const confirmRoleChange = async () => {
    if (!pendingChange) return;
    try {
      await setUserRole.mutateAsync({
        principal: pendingChange.user.principal.toString(),
        role: pendingChange.newRole,
      });
    } finally {
      setPendingChange(null);
    }
  };

  const formatDate = (ts: bigint) =>
    new Date(Number(ts) / 1_000_000).toLocaleDateString();

  return (
    <div className="p-6 space-y-6 min-h-full bg-cyber-dark">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-orbitron text-2xl font-bold text-foreground">
            USER <span className="text-neon-pink">MANAGEMENT</span>
          </h1>
          <p className="font-mono text-xs text-muted-foreground mt-1">
            {users.length} registered operator{users.length !== 1 ? 's' : ''} · Admin-only access
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => refetch()}
            className="border border-cyber-border hover:border-neon-pink/40 font-mono text-xs"
          >
            <RefreshCw className="w-3.5 h-3.5 mr-1" />
            REFRESH
          </Button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
        <div className="cyber-card rounded border border-cyber-border p-4 text-center">
          <p className="font-orbitron text-2xl font-bold text-neon-pink">{users.length}</p>
          <p className="font-mono text-xs text-muted-foreground mt-1">Total Users</p>
        </div>
        <div className="cyber-card rounded border border-cyber-border p-4 text-center">
          <p className="font-orbitron text-2xl font-bold text-neon-pink">
            {users.filter((u) => u.role === Role.admin).length}
          </p>
          <p className="font-mono text-xs text-muted-foreground mt-1">Admins</p>
        </div>
        <div className="cyber-card rounded border border-cyber-border p-4 text-center">
          <p className="font-orbitron text-2xl font-bold text-neon-cyan">
            {users.filter((u) => u.role === Role.analyst).length}
          </p>
          <p className="font-mono text-xs text-muted-foreground mt-1">Analysts</p>
        </div>
      </div>

      {/* Users Table */}
      <div className="cyber-card rounded border border-cyber-border overflow-hidden">
        <div className="flex items-center gap-2 p-4 border-b border-cyber-border">
          <Users className="w-4 h-4 text-neon-pink" />
          <h2 className="font-orbitron text-sm text-foreground">REGISTERED OPERATORS</h2>
        </div>
        <Table>
          <TableHeader>
            <TableRow className="border-cyber-border hover:bg-transparent">
              <TableHead className="font-mono text-xs text-neon-pink uppercase tracking-wider">Principal</TableHead>
              <TableHead className="font-mono text-xs text-neon-pink uppercase tracking-wider">Name</TableHead>
              <TableHead className="font-mono text-xs text-neon-pink uppercase tracking-wider">Role</TableHead>
              <TableHead className="font-mono text-xs text-neon-pink uppercase tracking-wider">Registered</TableHead>
              <TableHead className="font-mono text-xs text-neon-pink uppercase tracking-wider text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center py-12">
                  <div className="flex items-center justify-center gap-2">
                    <div className="w-4 h-4 border-2 border-neon-pink border-t-transparent rounded-full animate-spin" />
                    <span className="font-mono text-xs text-muted-foreground">LOADING USERS...</span>
                  </div>
                </TableCell>
              </TableRow>
            ) : users.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center py-12">
                  <Users className="w-8 h-8 text-muted-foreground mx-auto mb-2" />
                  <p className="font-mono text-xs text-muted-foreground">No users registered</p>
                </TableCell>
              </TableRow>
            ) : (
              users.map((user) => {
                const isMe = myProfile?.principal.toString() === user.principal.toString();
                return (
                  <TableRow
                    key={user.principal.toString()}
                    className="border-cyber-border hover:bg-cyber-surface/50 transition-colors"
                  >
                    <TableCell className="font-mono text-xs text-muted-foreground">
                      <span title={user.principal.toString()}>
                        {truncatePrincipal(user.principal.toString())}
                      </span>
                      {isMe && (
                        <span className="ml-2 font-mono text-xs text-neon-green">(you)</span>
                      )}
                    </TableCell>
                    <TableCell className="font-mono text-xs text-foreground">
                      <div className="flex items-center gap-2">
                        <div className={`p-1 rounded ${user.role === Role.admin ? 'bg-neon-pink/10' : 'bg-neon-cyan/10'}`}>
                          <Shield className={`w-3 h-3 ${user.role === Role.admin ? 'text-neon-pink' : 'text-neon-cyan'}`} />
                        </div>
                        {user.name}
                      </div>
                    </TableCell>
                    <TableCell>
                      <RoleBadge role={user.role as Role} />
                    </TableCell>
                    <TableCell className="font-mono text-xs text-muted-foreground">
                      {formatDate(user.createdAt)}
                    </TableCell>
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button
                            variant="ghost"
                            size="sm"
                            disabled={isMe || setUserRole.isPending}
                            className="h-7 px-2 font-mono text-xs text-muted-foreground hover:text-foreground border border-transparent hover:border-cyber-border"
                          >
                            CHANGE ROLE
                            <ChevronDown className="w-3 h-3 ml-1" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent className="bg-cyber-dark-alt border-cyber-border font-mono text-xs">
                          <DropdownMenuItem
                            onClick={() => handleRoleChange(user, Role.admin)}
                            disabled={user.role === Role.admin}
                            className={`cursor-pointer ${user.role === Role.admin ? 'opacity-50' : 'hover:bg-neon-pink/10 text-neon-pink'}`}
                          >
                            <Shield className="w-3 h-3 mr-2" />
                            Set as ADMIN
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => handleRoleChange(user, Role.analyst)}
                            disabled={user.role === Role.analyst}
                            className={`cursor-pointer ${user.role === Role.analyst ? 'opacity-50' : 'hover:bg-neon-cyan/10 text-neon-cyan'}`}
                          >
                            <Shield className="w-3 h-3 mr-2" />
                            Set as ANALYST
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </div>

      {/* Confirmation Dialog */}
      <AlertDialog open={!!pendingChange} onOpenChange={(open) => !open && setPendingChange(null)}>
        <AlertDialogContent className="bg-cyber-dark-alt border border-neon-pink/30">
          <AlertDialogHeader>
            <AlertDialogTitle className="font-orbitron text-neon-pink">CONFIRM ROLE CHANGE</AlertDialogTitle>
            <AlertDialogDescription className="font-mono text-sm text-muted-foreground">
              {pendingChange && (
                <>
                  Change <span className="text-foreground font-bold">{pendingChange.user.name}</span>'s role from{' '}
                  <span className={pendingChange.user.role === Role.admin ? 'text-neon-pink' : 'text-neon-cyan'}>
                    {pendingChange.user.role === Role.admin ? 'ADMIN' : 'ANALYST'}
                  </span>{' '}
                  to{' '}
                  <span className={pendingChange.newRole === Role.admin ? 'text-neon-pink' : 'text-neon-cyan'}>
                    {pendingChange.newRole === Role.admin ? 'ADMIN' : 'ANALYST'}
                  </span>
                  ?
                </>
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="font-mono text-xs border-cyber-border">
              CANCEL
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmRoleChange}
              disabled={setUserRole.isPending}
              className="bg-neon-pink/20 hover:bg-neon-pink/30 border border-neon-pink/50 text-neon-pink font-mono text-xs"
            >
              {setUserRole.isPending ? (
                <span className="flex items-center gap-2">
                  <div className="w-3.5 h-3.5 border-2 border-neon-pink border-t-transparent rounded-full animate-spin" />
                  UPDATING...
                </span>
              ) : 'CONFIRM CHANGE'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
