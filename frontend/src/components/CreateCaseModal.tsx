import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useCreateCase } from '../hooks/useQueries';
import { Severity } from '../backend';
import { FolderOpen } from 'lucide-react';
import { toast } from 'sonner';

interface Props {
  onClose: () => void;
}

export default function CreateCaseModal({ onClose }: Props) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [severity, setSeverity] = useState<Severity>(Severity.medium);
  const createCase = useCreateCase();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !description.trim()) return;
    try {
      await createCase.mutateAsync({ title: title.trim(), description: description.trim(), severity });
      toast.success('Case created successfully');
      onClose();
    } catch (e: any) {
      toast.error(e.message || 'Failed to create case');
    }
  };

  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent className="bg-cyber-dark-alt border border-neon-cyan/30 max-w-lg">
        <div className="absolute inset-0 cyber-grid-bg opacity-20 rounded-lg pointer-events-none" />
        <DialogHeader className="relative z-10">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded border border-neon-cyan/40 bg-neon-cyan/10">
              <FolderOpen className="w-5 h-5 text-neon-cyan" />
            </div>
            <DialogTitle className="font-orbitron text-neon-cyan">CREATE NEW CASE</DialogTitle>
          </div>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="relative z-10 space-y-4">
          <div className="space-y-1.5">
            <Label className="font-mono text-xs text-neon-cyan uppercase tracking-widest">Case Title</Label>
            <Input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Enter case title..."
              className="bg-cyber-dark border-cyber-border focus:border-neon-cyan font-mono text-sm"
              required
            />
          </div>

          <div className="space-y-1.5">
            <Label className="font-mono text-xs text-neon-cyan uppercase tracking-widest">Description</Label>
            <Textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Describe the security incident..."
              className="bg-cyber-dark border-cyber-border focus:border-neon-cyan font-mono text-sm min-h-24 resize-none"
              required
            />
          </div>

          <div className="space-y-1.5">
            <Label className="font-mono text-xs text-neon-cyan uppercase tracking-widest">Severity</Label>
            <Select value={severity} onValueChange={(v) => setSeverity(v as Severity)}>
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
              disabled={createCase.isPending}
              className="bg-neon-cyan/20 hover:bg-neon-cyan/30 border border-neon-cyan/50 text-neon-cyan font-orbitron text-xs tracking-wider hover:shadow-neon-cyan transition-all"
            >
              {createCase.isPending ? (
                <span className="flex items-center gap-2">
                  <div className="w-3.5 h-3.5 border-2 border-neon-cyan border-t-transparent rounded-full animate-spin" />
                  CREATING...
                </span>
              ) : 'CREATE CASE'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
