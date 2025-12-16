import { AgentEvent } from '@/types/agent';
import { cn } from '@/lib/utils';
import { Info, AlertTriangle, AlertCircle, Zap, ShieldCheck } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

interface EventsFeedProps {
  events: AgentEvent[];
  maxItems?: number;
}

const eventIcons = {
  info: Info,
  warning: AlertTriangle,
  error: AlertCircle,
  action: Zap,
  approval: ShieldCheck,
};

const eventColors = {
  info: 'text-muted-foreground border-l-muted-foreground',
  warning: 'text-warning border-l-warning',
  error: 'text-destructive border-l-destructive',
  action: 'text-primary border-l-primary',
  approval: 'text-success border-l-success',
};

export function EventsFeed({ events, maxItems = 5 }: EventsFeedProps) {
  const displayEvents = events.slice(0, maxItems);

  return (
    <div className="space-y-2">
      <h3 className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Recent Events</h3>
      <div className="space-y-1">
        {displayEvents.map((event) => {
          const Icon = eventIcons[event.type];
          return (
            <div
              key={event.id}
              className={cn(
                'flex items-start gap-2 p-2 rounded-md bg-secondary/50 border-l-2',
                eventColors[event.type]
              )}
            >
              <Icon className="w-3.5 h-3.5 mt-0.5 flex-shrink-0" />
              <div className="flex-1 min-w-0">
                <p className="text-sm truncate">{event.message}</p>
                <p className="text-[10px] text-muted-foreground">
                  {formatDistanceToNow(new Date(event.timestamp), { addSuffix: true })}
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
