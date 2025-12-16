import { Coins, Shield, Activity, Wifi } from 'lucide-react';
import { cn } from '@/lib/utils';

interface TopBarProps {
  credits: number;
  fleetStatus: 'online' | 'partial' | 'offline';
  activeAgents: number;
  totalAgents: number;
}

export function TopBar({ credits, fleetStatus, activeAgents, totalAgents }: TopBarProps) {
  const fleetStatusConfig = {
    online: { color: 'text-success', bg: 'bg-success/20', label: 'All Systems Go' },
    partial: { color: 'text-warning', bg: 'bg-warning/20', label: 'Partial Activity' },
    offline: { color: 'text-destructive', bg: 'bg-destructive/20', label: 'Fleet Offline' },
  };

  const status = fleetStatusConfig[fleetStatus];

  return (
    <div className="fixed top-0 left-20 right-0 h-14 bg-card/80 backdrop-blur-xl border-b border-border z-40 flex items-center justify-between px-4">
      {/* Left Section - Fleet Status */}
      <div className="flex items-center gap-4">
        <div className={cn("flex items-center gap-2 px-3 py-1.5 rounded-full", status.bg)}>
          <Wifi className={cn("w-4 h-4", status.color)} />
          <span className={cn("text-sm font-medium", status.color)}>{status.label}</span>
        </div>

        <div className="flex items-center gap-2 text-muted-foreground">
          <Activity className="w-4 h-4" />
          <span className="text-sm font-mono">
            {activeAgents}/{totalAgents} Active
          </span>
        </div>
      </div>

      {/* Right Section - Credits */}
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2 px-4 py-1.5 rounded-full bg-gradient-to-r from-gold/20 to-warning/10 border border-gold/30">
          <Coins className="w-4 h-4 text-gold" />
          <span className="font-mono font-bold text-gold">{credits.toLocaleString()}</span>
          <span className="text-xs text-gold/70">credits</span>
        </div>

        <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary/10 border border-primary/30">
          <Shield className="w-4 h-4 text-primary" />
          <span className="text-sm font-medium text-primary">Fleet Commander</span>
        </div>
      </div>
    </div>
  );
}
