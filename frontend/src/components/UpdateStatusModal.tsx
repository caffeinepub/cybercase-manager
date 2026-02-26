import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useUpdateCaseStatus } from '../hooks/useQueries';
import { CaseStatus } from '../backend';
import { RefreshCw } from 'lucide-react';
import { toast } from 'sonner';

interface Props {
  caseId: bigint;
  currentStatus: string;
  onClose: () => void;
}

export default function UpdateStatusModal({ caseId, currentStatus, onClose }: Props) {
  const [status, setStatus] = useState<CaseStatus>(currentStatus as CaseStatus);
  const updateStatus = useUpdateCaseStatus();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await updateStatus.mutateAsync({ caseId, status });
      toast.success('Case status updated');
      onClose();
    } catch (e: any) {
      toast.error(e.message || 'Failed to update status');
    }
  };

  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent className="bg-cyber-dark-alt border border-neon-yellow/30 max-w-sm">
        <div className="absolute inset-0 cyber-grid-bg opacity-20 rounded-lg pointer-events-none" />
        <DialogHeader className="relative z-10">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded border border-neon-yellow/40 bg-neon-yellow/10">
              <RefreshCw className="w-5 h-5 text-neon-yellow" />
            </div>
            <DialogTitle className="font-orbitron text-neon-yellow">UPDATE STATUS</DialogTitle>
          </div>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="relative z-10 space-y-4">
          <div className="space-y-1.5">
            <Label className="font-mono text-xs text-neon-yellow uppercase tracking-widest">New Status</Label>
            <Select value={status} onValueChange={(v) => setStatus(v as CaseStatus)}>
              <SelectTrigger className="bg-cyber-dark border-cyber-border font-mono text-sm">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-cyber-dark-alt border-cyber-border font-mono text-sm">
                <SelectItem value={CaseStatus.open}>🔴 Open</SelectItem>
                <SelectItem value={CaseStatus.inProgress}>🟡 In Progress</SelectItem>
                <SelectItem value={CaseStatus.resolved}>🟢 Resolved</SelectItem>
                <SelectItem value={CaseStatus.closed}>⚫ Closed</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <DialogFooter className="gap-2">
            <Button
              type="button"
              variant="ghost"
              onClick={onClose}
              className="font-mono text-xs border border-cyber-border hover:border-muted-foreground"
            >
              CANCEL
            </Button>
            <Button
              type="submit"
              disabled={updateStatus.isPending}
              className="bg-neon-yellow/20 hover:bg-neon-yellow/30 border border-neon-yellow/50 text-neon-yellow font-orbitron text-xs tracking-wider transition-all"
            >
              {updateStatus.isPending ? (
                <span className="flex items-center gap-2">
                  <div className="w-3.5 h-3.5 border-2 border-neon-yellow border-t-transparent rounded-full animate-spin" />
                  UPDATING...
                </span>
              ) : 'UPDATE STATUS'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
