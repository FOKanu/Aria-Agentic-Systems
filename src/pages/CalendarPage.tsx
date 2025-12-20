import { useState } from 'react';
import { Calendar as CalendarIcon, Plus, ChevronLeft, ChevronRight, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { format } from 'date-fns';
import { useCalendarEvents, type CreateEventData } from '@/hooks/useCalendarEvents';
import { CalendarGrid } from '@/components/calendar/CalendarGrid';
import { DayEventsPanel } from '@/components/calendar/DayEventsPanel';
import { EventFormDialog } from '@/components/calendar/EventFormDialog';

export function CalendarPage() {
  const {
    events,
    loading,
    currentMonth,
    selectedDate,
    selectedEvent,
    setSelectedDate,
    setSelectedEvent,
    createEvent,
    updateEvent,
    deleteEvent,
    goToNextMonth,
    goToPrevMonth,
    goToToday,
  } = useCalendarEvents();

  const [showEventForm, setShowEventForm] = useState(false);
  const [editingEvent, setEditingEvent] = useState(false);

  const handleCreateEvent = () => {
    setEditingEvent(false);
    setShowEventForm(true);
  };

  const handleEditEvent = (event: typeof selectedEvent) => {
    setSelectedEvent(event);
    setEditingEvent(true);
    setShowEventForm(true);
  };

  const handleSaveEvent = async (data: CreateEventData) => {
    if (editingEvent && selectedEvent) {
      await updateEvent({ id: selectedEvent.id, ...data });
    } else {
      await createEvent(data);
    }
  };

  const handleDeleteEvent = async () => {
    if (selectedEvent) {
      await deleteEvent(selectedEvent.id);
      setSelectedEvent(null);
    }
  };

  const handleDateSelect = (date: Date) => {
    setSelectedDate(date);
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
        <Button className="gap-2" onClick={handleCreateEvent}>
          <Plus className="w-4 h-4" />
          New Event
        </Button>
      </div>

      {/* Navigation */}
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold">
          {format(currentMonth, 'MMMM yyyy')}
        </h2>
        <div className="flex items-center gap-1">
          <Button variant="ghost" size="icon" onClick={goToPrevMonth}>
            <ChevronLeft className="w-4 h-4" />
          </Button>
          <Button variant="ghost" size="sm" onClick={goToToday}>
            Today
          </Button>
          <Button variant="ghost" size="icon" onClick={goToNextMonth}>
            <ChevronRight className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* Main content */}
      {loading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
        </div>
      ) : (
        <div className="grid lg:grid-cols-3 gap-6">
          {/* Calendar Grid */}
          <div className="lg:col-span-2">
            <CalendarGrid
              currentMonth={currentMonth}
              events={events}
              selectedDate={selectedDate}
              onDateSelect={handleDateSelect}
              onEventClick={handleEditEvent}
            />
          </div>

          {/* Events Panel */}
          <div>
            {selectedDate ? (
              <DayEventsPanel
                date={selectedDate}
                events={events}
                onEventEdit={handleEditEvent}
                onEventDelete={deleteEvent}
                onClose={() => setSelectedDate(null)}
              />
            ) : (
              <div className="bg-card rounded-lg border border-border p-6 text-center text-muted-foreground">
                <CalendarIcon className="w-10 h-10 mx-auto mb-2 opacity-50" />
                <p className="text-sm">Select a date to view events</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Event Form Dialog */}
      <EventFormDialog
        open={showEventForm}
        onOpenChange={(open) => {
          setShowEventForm(open);
          if (!open) {
            setSelectedEvent(null);
            setEditingEvent(false);
          }
        }}
        initialDate={selectedDate || undefined}
        event={editingEvent ? selectedEvent : null}
        onSave={handleSaveEvent}
        onDelete={editingEvent ? handleDeleteEvent : undefined}
      />
    </div>
  );
}
