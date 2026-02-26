import React, { useState } from 'react';
import { useNavigate } from '@tanstack/react-router';
import { FolderOpen, Plus, Trash2, Eye, RefreshCw, Filter } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { useGetAllCases, useGetMyProfile, useDeleteCase } from '../hooks/useQueries';
import { CaseStatus, Role, Severity } from '../backend';
import CreateCaseModal from '../components/CreateCaseModal';
import UpdateStatusModal from '../components/UpdateStatusModal';
import { toast } from 'sonner';

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
    open: 'OPEN', inProgress: 'IN PROGRESS', resolved: 'RESOLVED', closed: 'CLOSED',
  };
  return (
    <span className={`font-mono text-xs px-2 py-0.5 rounded border ${config[status] || config.open}`}>
      {labels[status] || status.toUpperCase()}
    </span>
  );
}

export default function CaseManagementPage() {
  const navigate = useNavigate();
  const { data: cases = [], isLoading, refetch } = useGetAllCases();
  const { data: userProfile } = useGetMyProfile();
  const isAdmin = userProfile?.role === Role.admin;
  const deleteCase = useDeleteCase();

  const [severityFilter, setSeverityFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [updateStatusCase, setUpdateStatusCase] = useState<{ id: bigint; status: string } | null>(null);

  const filtered = cases.filter((c) => {
    const sevMatch = severityFilter === 'all' || c.severity === severityFilter;
    const statMatch = statusFilter === 'all' || c.status === statusFilter;
    return sevMatch && statMatch;
  });

  const handleDelete = async (id: bigint) => {
    if (!confirm('Delete this case? This action cannot be undone.')) return;
    try {
      await deleteCase.mutateAsync(id);
      toast.success('Case deleted');
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : 'Failed to delete case';
      toast.error(msg);
    }
  };

  const formatDate = (ts: bigint) => {
    return new Date(Number(ts) / 1_000_000).toLocaleDateString();
  };

  return (
    <div className="p-6 space-y-6 min-h-full bg-cyber-dark">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-orbitron text-2xl font-bold text-foreground">
            CASE <span className="text-neon-cyan">MANAGEMENT</span>
          </h1>
          <p className="font-mono text-xs text-muted-foreground mt-1">
            {cases.length} total cases · {filtered.length} shown
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => refetch()}
            className="border border-cyber-border hover:border-neon-cyan/40 font-mono text-xs"
          >
            <RefreshCw className="w-3.5 h-3.5 mr-1" />
            REFRESH
          </Button>
          <Button
            onClick={() => setShowCreateModal(true)}
            className="bg-neon-green/20 hover:bg-neon-green/30 border border-neon-green/50 text-neon-green font-orbitron text-xs tracking-wider hover:shadow-neon-green transition-all"
          >
            <Plus className="w-4 h-4 mr-1" />
            NEW CASE
          </Button>
        </div>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-3 p-3 cyber-card rounded border border-cyber-border">
        <Filter className="w-4 h-4 text-muted-foreground" />
        <span className="font-mono text-xs text-muted-foreground">FILTER:</span>
        <Select value={severityFilter} onValueChange={setSeverityFilter}>
          <SelectTrigger className="w-36 h-8 font-mono text-xs bg-cyber-surface border-cyber-border">
            <SelectValue placeholder="Severity" />
          </SelectTrigger>
          <SelectContent className="bg-cyber-dark-alt border-cyber-border font-mono text-xs">
            <SelectItem value="all">All Severity</SelectItem>
            <SelectItem value={Severity.critical}>Critical</SelectItem>
            <SelectItem value={Severity.high}>High</SelectItem>
            <SelectItem value={Severity.medium}>Medium</SelectItem>
            <SelectItem value={Severity.low}>Low</SelectItem>
          </SelectContent>
        </Select>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-36 h-8 font-mono text-xs bg-cyber-surface border-cyber-border">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent className="bg-cyber-dark-alt border-cyber-border font-mono text-xs">
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value={CaseStatus.open}>Open</SelectItem>
            <SelectItem value={CaseStatus.inProgress}>In Progress</SelectItem>
            <SelectItem value={CaseStatus.resolved}>Resolved</SelectItem>
            <SelectItem value={CaseStatus.closed}>Closed</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Table */}
      <div className="cyber-card rounded border border-cyber-border overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="border-cyber-border hover:bg-transparent">
              <TableHead className="font-mono text-xs text-neon-cyan uppercase tracking-wider">ID</TableHead>
              <TableHead className="font-mono text-xs text-neon-cyan uppercase tracking-wider">Title</TableHead>
              <TableHead className="font-mono text-xs text-neon-cyan uppercase tracking-wider">Severity</TableHead>
              <TableHead className="font-mono text-xs text-neon-cyan uppercase tracking-wider">Status</TableHead>
              <TableHead className="font-mono text-xs text-neon-cyan uppercase tracking-wider">Created</TableHead>
              <TableHead className="font-mono text-xs text-neon-cyan uppercase tracking-wider text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-12">
                  <div className="flex items-center justify-center gap-2">
                    <div className="w-4 h-4 border-2 border-neon-green border-t-transparent rounded-full animate-spin" />
                    <span className="font-mono text-xs text-muted-foreground">LOADING CASES...</span>
                  </div>
                </TableCell>
              </TableRow>
            ) : filtered.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-12">
                  <FolderOpen className="w-8 h-8 text-muted-foreground mx-auto mb-2" />
                  <p className="font-mono text-xs text-muted-foreground">No cases found</p>
                </TableCell>
              </TableRow>
            ) : (
              filtered.map((c) => (
                <TableRow
                  key={c.id.toString()}
                  className="border-cyber-border hover:bg-cyber-surface/50 transition-colors"
                >
                  <TableCell className="font-mono text-xs text-muted-foreground">
                    #{c.id.toString()}
                  </TableCell>
                  <TableCell className="font-mono text-xs text-foreground max-w-xs truncate">
                    {c.title}
                  </TableCell>
                  <TableCell><SeverityBadge severity={c.severity as string} /></TableCell>
                  <TableCell><StatusBadge status={c.status as string} /></TableCell>
                  <TableCell className="font-mono text-xs text-muted-foreground">
                    {formatDate(c.createdAt)}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-1">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => navigate({ to: '/cases/$caseId', params: { caseId: c.id.toString() } })}
                        className="h-7 px-2 font-mono text-xs text-neon-cyan hover:bg-neon-cyan/10 border border-transparent hover:border-neon-cyan/30"
                      >
                        <Eye className="w-3.5 h-3.5" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setUpdateStatusCase({ id: c.id, status: c.status as string })}
                        className="h-7 px-2 font-mono text-xs text-neon-yellow hover:bg-neon-yellow/10 border border-transparent hover:border-neon-yellow/30"
                      >
                        <RefreshCw className="w-3.5 h-3.5" />
                      </Button>
                      {isAdmin && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDelete(c.id)}
                          disabled={deleteCase.isPending}
                          className="h-7 px-2 font-mono text-xs text-neon-red hover:bg-neon-red/10 border border-transparent hover:border-neon-red/30"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </Button>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {showCreateModal && <CreateCaseModal onClose={() => setShowCreateModal(false)} />}
      {updateStatusCase && (
        <UpdateStatusModal
          caseId={updateStatusCase.id}
          currentStatus={updateStatusCase.status}
          onClose={() => setUpdateStatusCase(null)}
        />
      )}
    </div>
  );
}
