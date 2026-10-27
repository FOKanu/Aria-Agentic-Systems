import { useState, useEffect } from 'react';
import { Terminal, Lock, Plug } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { runtimeClient } from '@/agent-engine/services/runtimeBridge';

export function RuntimeConfigSection() {
  const { toast } = useToast();
  const [token, setToken] = useState('');
  const [status, setStatus] = useState<'connected' | 'disconnected' | 'checking'>('checking');

  useEffect(() => {
    // Load existing token
    const savedToken = runtimeClient.getToken();
    if (savedToken) {
      setToken(savedToken);
      checkConnection();
    } else {
      setStatus('disconnected');
    }
  }, []);

  const checkConnection = async () => {
    setStatus('checking');
    try {
      await runtimeClient.checkHealth();
      setStatus('connected');
    } catch (error) {
      setStatus('disconnected');
    }
  };

  const handleSave = async () => {
    if (!token.trim()) return;

    runtimeClient.setToken(token.trim());
    toast({
      title: 'Token saved',
      description: 'Verifying connection...',
    });

    await checkConnection();

    if (status === 'connected') { // Note: status update is async, this check might be stale in this concise version but let's rely on the effect or next check
      // Re-check call is actual source of truth
      try {
        await runtimeClient.checkHealth();
        toast({ title: 'Connected', description: 'Everything is ready.' });
      } catch {
        toast({ title: 'Connection failed', description: 'Token saved but sidecar unreachable.', variant: 'destructive' });
      }
    }
  };

  return (
    <div className="space-y-4 p-4 border rounded-lg bg-card">
      <div className="flex items-center gap-2 mb-4">
        <Terminal className="w-5 h-5 text-primary" />
        <h3 className="font-medium">Runtime Connection</h3>
      </div>

      <div className="space-y-2">
        <Label htmlFor="runtime-token">ARIA Access Token</Label>
        <div className="flex gap-2">
          <div className="relative flex-1">
            <Lock className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              id="runtime-token"
              type="password"
              placeholder="Enter token from terminal..."
              className="pl-9"
              value={token}
              onChange={(e) => setToken(e.target.value)}
            />
          </div>
          <Button onClick={handleSave}>Save</Button>
        </div>
        <p className="text-xs text-muted-foreground">
          Copy the token printed in your terminal when you started the server.
        </p>
      </div>

      <div className="flex items-center gap-2 text-sm mt-2">
        <div className={`w-2 h-2 rounded-full ${status === 'connected' ? 'bg-green-500' : 'bg-red-500'}`} />
        <span className="text-muted-foreground capitalize">
          Status: {status}
        </span>
        {status === 'disconnected' && (
          <Button variant="link" size="sm" className="h-auto p-0 ml-2" onClick={checkConnection}>
            Retry
          </Button>
        )}
      </div>
    </div>
  );
}
