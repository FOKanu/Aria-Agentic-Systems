import { format, isSameDay } from 'date-fns';
import { Clock, MapPin, Bot, Edit2, Trash2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { AGENTS } from '@/data/agentsData';
import type { CalendarEvent } from '@/hooks/useCalendarEvents';

interface DayEventsPanelProps {
  date: Date;
  events: CalendarEvent[];
  onEventEdit: (event: CalendarEvent) => void;
  onEventDelete: (eventId: string) => void;
  onClose: () => void;
}

export function DayEventsPanel({
  date,
  events,
  onEventEdit,
  onEventDelete,
  onClose,
}: DayEventsPanelProps) {
  const dayEvents = events.filter(event =>
    isSameDay(new Date(event.start_time), date)
  );

  const getAgentName = (agentId?: string) => {
    if (!agentId) return null;
    const agent = AGENTS.find(a => a.id === agentId);
    return agent?.name;
  };

  return (
    <div className="bg-card rounded-lg border border-border overflow-hidden">
      <div className="p-3 border-b border-border flex items-center justify-between">
        <div>
          <h3 className="font-medium">{format(date, 'EEEE')}</h3>
          <p className="text-sm text-muted-foreground">{format(date, 'MMMM d, yyyy')}</p>
        </div>
        <Button variant="ghost" size="sm" onClick={onClose}>
          Close
        </Button>
      </div>

      <ScrollArea className="h-[300px]">
        {dayEvents.length === 0 ? (
          <div className="p-4 text-center text-muted-foreground text-sm">
            No events scheduled
          </div>
        ) : (
          <div className="p-2 space-y-2">
            {dayEvents.map(event => (
              <div
                key={event.id}
                className={cn(
                  'p-3 rounded-lg border transition-colors',
                  event.status === 'cancelled' && 'opacity-50'
                )}
                style={{
                  borderLeftWidth: '3px',
                  borderLeftColor: event.color,
                }}
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1 min-w-0">
                    <h4
                      className={cn(
                        'font-medium truncate',
                        event.status === 'cancelled' && 'line-through'
                      )}
                    >
                      {event.title}
                    </h4>

                    <div className="mt-1 space-y-1">
                      <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                        <Clock className="w-3 h-3" />
                        {event.all_day ? (
                          'All day'
                        ) : (
                          <>
                            {format(new Date(event.start_time), 'h:mm a')} -{' '}
                            {format(new Date(event.end_time), 'h:mm a')}
                          </>
                        )}
                      </div>

                      {event.location && (
                        <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                          <MapPin className="w-3 h-3" />
                          <span className="truncate">{event.location}</span>
                        </div>
                      )}

                      {event.assigned_agent && (
                        <div className="flex items-center gap-1.5 text-xs text-primary">
                          <Bot className="w-3 h-3" />
                          {getAgentName(event.assigned_agent)}
                        </div>
                      )}
                    </div>

                    {event.description && (
                      <p className="mt-2 text-xs text-muted-foreground line-clamp-2">
                        {event.description}
                      </p>
                    )}
                  </div>

                  <div className="flex gap-1">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-7 w-7"
                      onClick={() => onEventEdit(event)}
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-7 w-7 text-destructive hover:text-destructive"
                      onClick={() => onEventDelete(event.id)}
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </Button>
                  </div>
                </div>

                {/* Status badge */}
                {event.status !== 'confirmed' && (
                  <div className="mt-2">
                    <span
                      className={cn(
                        'text-xs px-1.5 py-0.5 rounded',
                        event.status === 'tentative' && 'bg-yellow-500/20 text-yellow-600',
                        event.status === 'cancelled' && 'bg-red-500/20 text-red-600'
                      )}
                    >
                      {event.status}
                    </span>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </ScrollArea>
    </div>
  );
}
