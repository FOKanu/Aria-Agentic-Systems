import { Activity, Wifi } from 'lucide-react';
import { cn } from '@/lib/utils';
import { UserMenu } from '@/components/UserMenu';
import { MockUser } from '@/pages/AuthPage';

interface TopBarProps {
  fleetStatus: 'online' | 'partial' | 'offline';
  activeAgents: number;
  totalAgents: number;
  user?: MockUser;
  onViewProfile?: () => void;
  onLogout?: () => void;
}

export function TopBar({ 
  fleetStatus, 
  activeAgents, 
  totalAgents,
  user,
  onViewProfile,
  onLogout,
}: TopBarProps) {
  const fleetStatusConfig = {
    online: { color: 'text-success', bg: 'bg-success/10', label: 'All Systems Operational' },
    partial: { color: 'text-warning', bg: 'bg-warning/10', label: 'Partial Activity' },
    offline: { color: 'text-destructive', bg: 'bg-destructive/10', label: 'Systems Offline' },
  };

  const status = fleetStatusConfig[fleetStatus];

  return (
    <div className="fixed top-0 left-16 right-0 h-14 bg-card/95 backdrop-blur border-b border-border z-40 flex items-center justify-between px-6">
      {/* Left Section - Fleet Status */}
      <div className="flex items-center gap-6">
        <div className={cn("flex items-center gap-2 px-3 py-1.5 rounded-md", status.bg)}>
          <Wifi className={cn("w-4 h-4", status.color)} />
          <span className={cn("text-sm font-medium", status.color)}>{status.label}</span>
        </div>

        <div className="flex items-center gap-2 text-muted-foreground">
          <Activity className="w-4 h-4" />
          <span className="text-sm">
            {activeAgents} of {totalAgents} agents active
          </span>
        </div>
      </div>

      {/* Right Section - User */}
      <div className="flex items-center gap-4">
        {user && onViewProfile && onLogout && (
          <UserMenu 
            user={user} 
            onViewProfile={onViewProfile} 
            onLogout={onLogout} 
          />
        )}
      </div>
    </div>
  );
}
