import { format, startOfMonth, endOfMonth, startOfWeek, endOfWeek, eachDayOfInterval, isSameMonth, isSameDay, isToday } from 'date-fns';
import { cn } from '@/lib/utils';
import type { CalendarEvent } from '@/hooks/useCalendarEvents';

interface CalendarGridProps {
  currentMonth: Date;
  events: CalendarEvent[];
  selectedDate: Date | null;
  onDateSelect: (date: Date) => void;
  onEventClick: (event: CalendarEvent) => void;
}

export function CalendarGrid({
  currentMonth,
  events,
  selectedDate,
  onDateSelect,
  onEventClick,
}: CalendarGridProps) {
  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(currentMonth);
  const calendarStart = startOfWeek(monthStart);
  const calendarEnd = endOfWeek(monthEnd);

  const days = eachDayOfInterval({ start: calendarStart, end: calendarEnd });

  const getEventsForDay = (day: Date): CalendarEvent[] => {
    return events.filter(event => {
      const eventDate = new Date(event.start_time);
      return isSameDay(eventDate, day);
    });
  };

  const weekDays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  return (
    <div className="bg-card rounded-lg border border-border overflow-hidden">
      {/* Week day headers */}
      <div className="grid grid-cols-7 border-b border-border">
        {weekDays.map(day => (
          <div
            key={day}
            className="py-2 text-center text-xs font-medium text-muted-foreground"
          >
            {day}
          </div>
        ))}
      </div>

      {/* Calendar days */}
      <div className="grid grid-cols-7">
        {days.map((day, idx) => {
          const dayEvents = getEventsForDay(day);
          const isCurrentMonth = isSameMonth(day, currentMonth);
          const isSelected = selectedDate && isSameDay(day, selectedDate);
          const isCurrentDay = isToday(day);

          return (
            <button
              key={idx}
              onClick={() => onDateSelect(day)}
              className={cn(
                'min-h-[80px] p-1 border-b border-r border-border text-left transition-colors hover:bg-secondary/30',
                !isCurrentMonth && 'bg-muted/30',
                isSelected && 'bg-primary/10 ring-1 ring-primary',
                idx % 7 === 6 && 'border-r-0'
              )}
            >
              <div
                className={cn(
                  'w-6 h-6 flex items-center justify-center text-xs rounded-full mb-1',
                  isCurrentDay && 'bg-primary text-primary-foreground font-bold',
                  !isCurrentMonth && 'text-muted-foreground'
                )}
              >
                {format(day, 'd')}
              </div>

              {/* Events */}
              <div className="space-y-0.5">
                {dayEvents.slice(0, 3).map(event => (
                  <button
                    key={event.id}
                    onClick={e => {
                      e.stopPropagation();
                      onEventClick(event);
                    }}
                    className={cn(
                      'w-full text-left px-1 py-0.5 rounded text-xs truncate transition-opacity hover:opacity-80',
                      event.status === 'cancelled' && 'line-through opacity-50'
                    )}
                    style={{
                      backgroundColor: `${event.color}20`,
                      color: event.color,
                      borderLeft: `2px solid ${event.color}`,
                    }}
                  >
                    {event.all_day ? (
                      event.title
                    ) : (
                      <>
                        <span className="font-medium">
                          {format(new Date(event.start_time), 'h:mm')}
                        </span>{' '}
                        {event.title}
                      </>
                    )}
                  </button>
                ))}
                {dayEvents.length > 3 && (
                  <div className="text-xs text-muted-foreground px-1">
                    +{dayEvents.length - 3} more
                  </div>
                )}
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
