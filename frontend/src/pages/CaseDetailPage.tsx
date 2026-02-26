import React, { useState } from 'react';
import { useParams, useNavigate } from '@tanstack/react-router';
import { ArrowLeft, MessageSquare, Clock, User, Shield, Send, UserCheck } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useGetCaseById, useAddCaseNote, useGetMyProfile, useAssignCase } from '../hooks/useQueries';
import { Role, Severity, CaseStatus } from '../backend';
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

export default function CaseDetailPage() {
  const { caseId } = useParams({ from: '/authenticated/cases/$caseId' });
  const navigate = useNavigate();
  const [noteContent, setNoteContent] = useState('');
  const [analystPrincipal, setAnalystPrincipal] = useState('');
  const [showAssign, setShowAssign] = useState(false);

  const caseIdBigInt = BigInt(caseId);
  const { data: caseData, isLoading } = useGetCaseById(caseIdBigInt);
  const { data: userProfile } = useGetMyProfile();
  const addNote = useAddCaseNote();
  const assignCase = useAssignCase();

  const isAdmin = userProfile?.role === Role.admin;

  const handleAddNote = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!noteContent.trim()) return;
    try {
      await addNote.mutateAsync({ caseId: caseIdBigInt, content: noteContent.trim() });
      setNoteContent('');
      toast.success('Note added');
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : 'Failed to add note';
      toast.error(msg);
    }
  };

  const handleAssign = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!analystPrincipal.trim()) return;
    try {
      await assignCase.mutateAsync({ caseId: caseIdBigInt, analyst: analystPrincipal.trim() });
      setAnalystPrincipal('');
      setShowAssign(false);
      toast.success('Case assigned successfully');
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : 'Failed to assign case';
      toast.error(msg);
    }
  };

  const formatDate = (ts: bigint) => {
    return new Date(Number(ts) / 1_000_000).toLocaleString();
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-full bg-cyber-dark">
        <div className="text-center">
          <div className="w-12 h-12 border-2 border-neon-cyan border-t-transparent rounded-full animate-spin mx-auto mb-3" />
          <p className="font-mono text-xs text-neon-cyan">LOADING CASE DATA...</p>
        </div>
      </div>
    );
  }

  if (!caseData) {
    return (
      <div className="flex items-center justify-center min-h-full bg-cyber-dark">
        <div className="text-center">
          <Shield className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
          <p className="font-mono text-sm text-muted-foreground">Case not found</p>
          <Button
            variant="ghost"
            onClick={() => navigate({ to: '/cases' })}
            className="mt-4 font-mono text-xs text-neon-cyan"
          >
            ← Back to Cases
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6 min-h-full bg-cyber-dark">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => navigate({ to: '/cases' })}
          className="font-mono text-xs text-muted-foreground hover:text-neon-cyan border border-cyber-border hover:border-neon-cyan/40"
        >
          <ArrowLeft className="w-3.5 h-3.5 mr-1" />
          BACK
        </Button>
        <div className="flex-1">
          <div className="flex items-center gap-3 flex-wrap">
            <h1 className="font-orbitron text-xl font-bold text-foreground">{caseData.title}</h1>
            <SeverityBadge severity={caseData.severity as string} />
            <StatusBadge status={caseData.status as string} />
          </div>
          <p className="font-mono text-xs text-muted-foreground mt-1">
            Case #{caseData.id.toString()} · Created {formatDate(caseData.createdAt)}
          </p>
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Case Details */}
        <div className="lg:col-span-2 space-y-4">
          {/* Description */}
          <div className="cyber-card rounded border border-cyber-border p-5">
            <h3 className="font-orbitron text-sm text-neon-cyan mb-3">DESCRIPTION</h3>
            <p className="font-mono text-sm text-muted-foreground leading-relaxed">{caseData.description}</p>
          </div>

          {/* Notes */}
          <div className="cyber-card rounded border border-cyber-border p-5">
            <div className="flex items-center gap-2 mb-4">
              <MessageSquare className="w-4 h-4 text-neon-cyan" />
              <h3 className="font-orbitron text-sm text-neon-cyan">INVESTIGATION NOTES</h3>
              <span className="font-mono text-xs text-muted-foreground ml-auto">
                {caseData.notes.length} notes
              </span>
            </div>

            {caseData.notes.length > 0 ? (
              <ScrollArea className="h-64 mb-4">
                <div className="space-y-3 pr-4">
                  {caseData.notes.map((note, i) => (
                    <div key={i} className="p-3 rounded border border-cyber-border bg-cyber-surface/50">
                      <div className="flex items-center gap-2 mb-2">
                        <User className="w-3 h-3 text-neon-cyan" />
                        <span className="font-mono text-xs text-neon-cyan truncate max-w-xs">
                          {note.author.length > 20
                            ? `${note.author.slice(0, 8)}...${note.author.slice(-4)}`
                            : note.author}
                        </span>
                        <Clock className="w-3 h-3 text-muted-foreground ml-auto" />
                        <span className="font-mono text-xs text-muted-foreground">
                          {formatDate(note.timestamp)}
                        </span>
                      </div>
                      <p className="font-mono text-xs text-foreground leading-relaxed">{note.content}</p>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            ) : (
              <div className="text-center py-6 mb-4">
                <MessageSquare className="w-8 h-8 text-muted-foreground mx-auto mb-2" />
                <p className="font-mono text-xs text-muted-foreground">No notes yet</p>
              </div>
            )}

            {/* Add Note Form */}
            <form onSubmit={handleAddNote} className="flex gap-2">
              <Textarea
                value={noteContent}
                onChange={(e) => setNoteContent(e.target.value)}
                placeholder="Add investigation note..."
                className="bg-cyber-dark border-cyber-border focus:border-neon-cyan font-mono text-sm min-h-16 resize-none flex-1"
              />
              <Button
                type="submit"
                disabled={addNote.isPending || !noteContent.trim()}
                className="bg-neon-cyan/20 hover:bg-neon-cyan/30 border border-neon-cyan/50 text-neon-cyan font-mono text-xs self-end"
              >
                {addNote.isPending ? (
                  <div className="w-4 h-4 border-2 border-neon-cyan border-t-transparent rounded-full animate-spin" />
                ) : (
                  <Send className="w-4 h-4" />
                )}
              </Button>
            </form>
          </div>
        </div>

        {/* Sidebar Info */}
        <div className="space-y-4">
          {/* Case Meta */}
          <div className="cyber-card rounded border border-cyber-border p-4 space-y-3">
            <h3 className="font-orbitron text-sm text-neon-cyan">CASE INFO</h3>
            <div className="space-y-2">
              <div>
                <p className="font-mono text-xs text-muted-foreground">Reporter</p>
                <p className="font-mono text-xs text-foreground truncate">
                  {caseData.reporter.toString().slice(0, 8)}...{caseData.reporter.toString().slice(-4)}
                </p>
              </div>
              <div>
                <p className="font-mono text-xs text-muted-foreground">Assigned Analyst</p>
                {caseData.assignedAnalyst ? (
                  <p className="font-mono text-xs text-neon-cyan truncate">
                    {caseData.assignedAnalyst.toString().slice(0, 8)}...{caseData.assignedAnalyst.toString().slice(-4)}
                  </p>
                ) : (
                  <p className="font-mono text-xs text-muted-foreground">Unassigned</p>
                )}
              </div>
              <div>
                <p className="font-mono text-xs text-muted-foreground">Last Updated</p>
                <p className="font-mono text-xs text-foreground">{formatDate(caseData.updatedAt)}</p>
              </div>
            </div>
          </div>

          {/* Admin Actions */}
          {isAdmin && (
            <div className="cyber-card rounded border border-neon-pink/30 p-4 space-y-3">
              <h3 className="font-orbitron text-sm text-neon-pink">ADMIN ACTIONS</h3>

              {!showAssign ? (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowAssign(true)}
                  className="w-full font-mono text-xs text-neon-pink hover:bg-neon-pink/10 border border-neon-pink/30 hover:border-neon-pink/50"
                >
                  <UserCheck className="w-3.5 h-3.5 mr-2" />
                  ASSIGN ANALYST
                </Button>
              ) : (
                <form onSubmit={handleAssign} className="space-y-2">
                  <Label className="font-mono text-xs text-neon-pink uppercase tracking-widest">
                    Analyst Principal
                  </Label>
                  <Input
                    value={analystPrincipal}
                    onChange={(e) => setAnalystPrincipal(e.target.value)}
                    placeholder="Principal ID..."
                    className="bg-cyber-dark border-cyber-border focus:border-neon-pink font-mono text-xs"
                  />
                  <div className="flex gap-2">
                    <Button
                      type="submit"
                      disabled={assignCase.isPending || !analystPrincipal.trim()}
                      size="sm"
                      className="flex-1 bg-neon-pink/20 hover:bg-neon-pink/30 border border-neon-pink/50 text-neon-pink font-mono text-xs"
                    >
                      {assignCase.isPending ? (
                        <div className="w-3.5 h-3.5 border-2 border-neon-pink border-t-transparent rounded-full animate-spin" />
                      ) : 'ASSIGN'}
                    </Button>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => { setShowAssign(false); setAnalystPrincipal(''); }}
                      className="font-mono text-xs border border-cyber-border"
                    >
                      CANCEL
                    </Button>
                  </div>
                </form>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
