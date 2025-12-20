import { useState } from 'react';
import { Calendar as CalendarIcon, Plus, ChevronLeft, ChevronRight, Clock, MapPin, Users } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, isToday, addMonths, subMonths } from 'date-fns';

interface CalendarEvent {
  id: string;
  title: string;
  date: Date;
  time: string;
  duration: string;
  type: 'meeting' | 'task' | 'reminder' | 'call';
  attendees?: string[];
  location?: string;
}

const mockEvents: CalendarEvent[] = [
  { id: '1', title: 'Team Standup', date: new Date(), time: '09:00', duration: '30m', type: 'meeting', attendees: ['Nova', 'Atlas'], location: 'Zoom' },
  { id: '2', title: 'Review Agent Logs', date: new Date(), time: '14:00', duration: '1h', type: 'task' },
  { id: '3', title: 'Client Call', date: new Date(Date.now() + 86400000), time: '10:00', duration: '45m', type: 'call', attendees: ['Client Corp'] },
  { id: '4', title: 'Deploy Update', date: new Date(Date.now() + 172800000), time: '16:00', duration: '2h', type: 'task' },
];

const eventTypeColors = {
  meeting: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
  task: 'bg-green-500/20 text-green-400 border-green-500/30',
  reminder: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
  call: 'bg-purple-500/20 text-purple-400 border-purple-500/30',
};

export function CalendarPage() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(new Date());

  const monthStart = startOfMonth(currentDate);
  const monthEnd = endOfMonth(currentDate);
  const days = eachDayOfInterval({ start: monthStart, end: monthEnd });

  const startDay = monthStart.getDay();
  const paddedDays = Array(startDay).fill(null).concat(days);

  const selectedDateEvents = mockEvents.filter(
    event => selectedDate && format(event.date, 'yyyy-MM-dd') === format(selectedDate, 'yyyy-MM-dd')
  );

  const hasEventsOnDay = (day: Date) => {
    return mockEvents.some(event => format(event.date, 'yyyy-MM-dd') === format(day, 'yyyy-MM-dd'));
  };

  return (
    <div className="space-y-6 animate-slide-up">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
            <CalendarIcon className="w-5 h-5 text-primary" />
          </div>
          <div>
            <h1 className="text-xl font-bold font-display">Calendar</h1>
            <p className="text-sm text-muted-foreground">Schedule and manage events</p>
          </div>
        </div>
        <Button className="gap-2">
          <Plus className="w-4 h-4" />
          New Event
        </Button>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Calendar Grid */}
        <Card className="lg:col-span-2">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-lg font-semibold">
              {format(currentDate, 'MMMM yyyy')}
            </CardTitle>
            <div className="flex items-center gap-1">
              <Button 
                variant="ghost" 
                size="icon" 
                onClick={() => setCurrentDate(subMonths(currentDate, 1))}
              >
                <ChevronLeft className="w-4 h-4" />
              </Button>
              <Button 
                variant="ghost" 
                size="sm"
                onClick={() => setCurrentDate(new Date())}
              >
                Today
              </Button>
              <Button 
                variant="ghost" 
                size="icon" 
                onClick={() => setCurrentDate(addMonths(currentDate, 1))}
              >
                <ChevronRight className="w-4 h-4" />
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {/* Day headers */}
            <div className="grid grid-cols-7 gap-1 mb-2">
              {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
                <div key={day} className="text-center text-xs font-medium text-muted-foreground py-2">
                  {day}
                </div>
              ))}
            </div>
            {/* Calendar days */}
            <div className="grid grid-cols-7 gap-1">
              {paddedDays.map((day, index) => (
                <button
                  key={index}
                  disabled={!day}
                  onClick={() => day && setSelectedDate(day)}
                  className={cn(
                    "aspect-square p-1 rounded-lg text-sm transition-all relative",
                    !day && "invisible",
                    day && !isSameMonth(day, currentDate) && "text-muted-foreground/50",
                    day && isToday(day) && "bg-primary text-primary-foreground font-bold",
                    day && selectedDate && format(day, 'yyyy-MM-dd') === format(selectedDate, 'yyyy-MM-dd') && !isToday(day) && "bg-primary/20 text-primary",
                    day && !isToday(day) && !(selectedDate && format(day, 'yyyy-MM-dd') === format(selectedDate, 'yyyy-MM-dd')) && "hover:bg-secondary"
                  )}
                >
                  {day && format(day, 'd')}
                  {day && hasEventsOnDay(day) && (
                    <div className="absolute bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-primary" />
                  )}
                </button>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Events for Selected Day */}
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium text-muted-foreground">
              {selectedDate ? format(selectedDate, 'EEEE, MMMM d') : 'Select a date'}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {selectedDateEvents.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <CalendarIcon className="w-10 h-10 mx-auto mb-2 opacity-50" />
                <p className="text-sm">No events scheduled</p>
              </div>
            ) : (
              selectedDateEvents.map(event => (
                <div
                  key={event.id}
                  className={cn(
                    "p-3 rounded-lg border transition-all hover:border-primary/50 cursor-pointer",
                    eventTypeColors[event.type]
                  )}
                >
                  <div className="flex items-start justify-between mb-2">
                    <h4 className="font-medium text-sm">{event.title}</h4>
                    <Badge variant="outline" className="text-xs capitalize">
                      {event.type}
                    </Badge>
                  </div>
                  <div className="space-y-1 text-xs opacity-80">
                    <div className="flex items-center gap-2">
                      <Clock className="w-3 h-3" />
                      {event.time} · {event.duration}
                    </div>
                    {event.location && (
                      <div className="flex items-center gap-2">
                        <MapPin className="w-3 h-3" />
                        {event.location}
                      </div>
                    )}
                    {event.attendees && (
                      <div className="flex items-center gap-2">
                        <Users className="w-3 h-3" />
                        {event.attendees.join(', ')}
                      </div>
                    )}
                  </div>
                </div>
              ))
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
