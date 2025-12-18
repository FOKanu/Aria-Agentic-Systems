import { 
  Play, 
  Square, 
  Pause, 
  CheckCircle, 
  XCircle, 
  Shield, 
  Settings, 
  User,
  Clock
} from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { cn } from '@/lib/utils';
import { useActivityLog, ActivityType } from '@/hooks/useActivityLog';
import { formatDistanceToNow } from 'date-fns';

const typeConfig: Record<ActivityType, { icon: typeof Play; color: string; bg: string }> = {
  agent_start: { icon: Play, color: 'text-green-500', bg: 'bg-green-500/10' },
  agent_stop: { icon: Square, color: 'text-red-500', bg: 'bg-red-500/10' },
  agent_pause: { icon: Pause, color: 'text-yellow-500', bg: 'bg-yellow-500/10' },
  task_complete: { icon: CheckCircle, color: 'text-emerald-500', bg: 'bg-emerald-500/10' },
  task_fail: { icon: XCircle, color: 'text-red-500', bg: 'bg-red-500/10' },
  approval: { icon: Shield, color: 'text-blue-500', bg: 'bg-blue-500/10' },
  system: { icon: Settings, color: 'text-muted-foreground', bg: 'bg-muted' },
  user_action: { icon: User, color: 'text-purple-500', bg: 'bg-purple-500/10' },
};

interface ActivityLogProps {
  maxHeight?: string;
  showHeader?: boolean;
  limit?: number;
}

export function ActivityLog({ maxHeight = '300px', showHeader = true, limit }: ActivityLogProps) {
  const { activities } = useActivityLog();
  const displayActivities = limit ? activities.slice(0, limit) : activities;

  return (
    <div className="rounded-lg border border-border bg-card">
      {showHeader && (
        <div className="flex items-center gap-2 px-4 py-3 border-b border-border">
          <Clock className="h-4 w-4 text-muted-foreground" />
          <h4 className="font-semibold text-sm">Activity Log</h4>
          <span className="text-xs text-muted-foreground ml-auto">
            {activities.length} events
          </span>
        </div>
      )}
      
      <ScrollArea style={{ maxHeight }}>
        {displayActivities.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-8 text-muted-foreground">
            <Clock className="h-8 w-8 mb-2 opacity-50" />
            <p className="text-sm">No activity yet</p>
          </div>
        ) : (
          <div className="relative">
            {/* Timeline line */}
            <div className="absolute left-6 top-0 bottom-0 w-px bg-border" />
            
            <div className="space-y-0">
              {displayActivities.map((activity, index) => {
                const config = typeConfig[activity.type];
                const Icon = config.icon;
                
                return (
                  <div 
                    key={activity.id}
                    className="relative flex gap-3 px-4 py-3 hover:bg-muted/30 transition-colors"
                  >
                    {/* Timeline dot */}
                    <div className={cn(
                      "relative z-10 flex-shrink-0 w-5 h-5 rounded-full flex items-center justify-center",
                      config.bg
                    )}>
                      <Icon className={cn("h-3 w-3", config.color)} />
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <p className="text-sm font-medium">{activity.title}</p>
                        {activity.agentName && (
                          <span className="text-[10px] px-1.5 py-0.5 rounded bg-muted text-muted-foreground">
                            {activity.agentName}
                          </span>
                        )}
                      </div>
                      {activity.description && (
                        <p className="text-xs text-muted-foreground mt-0.5">
                          {activity.description}
                        </p>
                      )}
                      <span className="text-[10px] text-muted-foreground/70 mt-1 block">
                        {formatDistanceToNow(activity.timestamp, { addSuffix: true })}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </ScrollArea>
    </div>
  );
}
