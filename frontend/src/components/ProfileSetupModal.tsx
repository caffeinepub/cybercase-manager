import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useRegisterUser } from '../hooks/useQueries';
import { Shield, User } from 'lucide-react';
import { toast } from 'sonner';

export default function ProfileSetupModal() {
  const [name, setName] = useState('');
  const registerUser = useRegisterUser();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    try {
      await registerUser.mutateAsync(name.trim());
      toast.success('Profile created successfully! Welcome to CyberShield.');
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to create profile';
      toast.error(msg);
    }
  };

  return (
    <Dialog open={true}>
      <DialogContent className="bg-cyber-dark-alt border border-neon-green/30 shadow-neon-green max-w-md">
        <div className="absolute inset-0 cyber-grid-bg opacity-30 rounded-lg pointer-events-none" />
        <DialogHeader className="relative z-10">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 rounded border border-neon-green/40 bg-neon-green/10">
              <Shield className="w-6 h-6 text-neon-green" />
            </div>
            <DialogTitle className="font-orbitron text-neon-green text-lg">AGENT REGISTRATION</DialogTitle>
          </div>
          <DialogDescription className="text-muted-foreground font-mono text-sm">
            Initialize your operator profile to access the CyberShield system. The first registered user becomes Admin.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="relative z-10 space-y-4 mt-2">
          <div className="space-y-2">
            <Label htmlFor="name" className="font-mono text-neon-cyan text-xs uppercase tracking-widest">
              Operator Name
            </Label>
            <div className="relative">
              <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neon-green/60" />
              <Input
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Enter your name..."
                className="pl-10 bg-cyber-dark border-cyber-border focus:border-neon-green font-mono text-foreground placeholder:text-muted-foreground/50"
                required
                autoFocus
              />
            </div>
          </div>

          <Button
            type="submit"
            disabled={registerUser.isPending || !name.trim()}
            className="w-full bg-neon-green/20 hover:bg-neon-green/30 border border-neon-green/50 text-neon-green font-orbitron text-sm tracking-widest transition-all hover:shadow-neon-green"
          >
            {registerUser.isPending ? (
              <span className="flex items-center gap-2">
                <div className="w-4 h-4 border-2 border-neon-green border-t-transparent rounded-full animate-spin" />
                INITIALIZING...
              </span>
            ) : (
              'INITIALIZE PROFILE'
            )}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
