import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { format, startOfMonth, endOfMonth, startOfWeek, endOfWeek, addMonths, subMonths } from 'date-fns';
import type { Json } from '@/integrations/supabase/types';

export interface CalendarEvent {
  id: string;
  user_id: string;
  title: string;
  description?: string;
  location?: string;
  start_time: string;
  end_time: string;
  all_day: boolean;
  recurrence_rule?: string;
  color: string;
  status: 'confirmed' | 'tentative' | 'cancelled';
  visibility: 'public' | 'private' | 'busy';
  reminders: Json;
  attendees: Json;
  assigned_agent?: string;
  external_id?: string;
  metadata: Record<string, unknown>;
  created_at: string;
  updated_at: string;
}

export interface CreateEventData {
  title: string;
  description?: string;
  location?: string;
  start_time: string;
  end_time: string;
  all_day?: boolean;
  color?: string;
  status?: 'confirmed' | 'tentative' | 'cancelled';
  assigned_agent?: string;
  attendees?: Json;
  reminders?: Json;
}

export interface UpdateEventData extends Partial<CreateEventData> {
  id: string;
}

export function useCalendarEvents() {
  const { toast } = useToast();
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [selectedEvent, setSelectedEvent] = useState<CalendarEvent | null>(null);

  const fetchEvents = useCallback(async (startDate?: Date, endDate?: Date) => {
    setLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        setEvents([]);
        return;
      }

      const start = startDate || startOfWeek(startOfMonth(currentMonth));
      const end = endDate || endOfWeek(endOfMonth(currentMonth));

      const { data, error } = await supabase
        .from('calendar_events')
        .select('*')
        .eq('user_id', user.id)
        .gte('start_time', start.toISOString())
        .lte('end_time', end.toISOString())
        .order('start_time', { ascending: true });

      if (error) throw error;
      
      setEvents((data || []) as CalendarEvent[]);
    } catch (error) {
      console.error('Error fetching events:', error);
      toast({
        title: 'Error loading events',
        description: 'Please try again',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  }, [currentMonth, toast]);

  useEffect(() => {
    fetchEvents();
  }, [fetchEvents]);

  const createEvent = async (eventData: CreateEventData): Promise<CalendarEvent | null> => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast({
          title: 'Sign in required',
          description: 'Please sign in to create events',
          variant: 'destructive',
        });
        return null;
      }

      const insertData = {
        user_id: user.id,
        title: eventData.title,
        description: eventData.description || null,
        location: eventData.location || null,
        start_time: eventData.start_time,
        end_time: eventData.end_time,
        all_day: eventData.all_day ?? false,
        color: eventData.color || '#3b82f6',
        status: eventData.status || 'confirmed',
        assigned_agent: eventData.assigned_agent || null,
        attendees: (eventData.attendees || []) as Json,
        reminders: (eventData.reminders || []) as Json,
      };

      const { data, error } = await supabase
        .from('calendar_events')
        .insert(insertData)
        .select()
        .single();

      if (error) throw error;

      const newEvent = data as CalendarEvent;
      setEvents(prev => [...prev, newEvent].sort((a, b) => 
        new Date(a.start_time).getTime() - new Date(b.start_time).getTime()
      ));

      toast({
        title: 'Event created',
        description: `"${eventData.title}" has been added to your calendar`,
      });

      return newEvent;
    } catch (error) {
      console.error('Error creating event:', error);
      toast({
        title: 'Error creating event',
        description: 'Please try again',
        variant: 'destructive',
      });
      return null;
    }
  };

  const updateEvent = async (eventData: UpdateEventData): Promise<CalendarEvent | null> => {
    try {
      const updateData: Record<string, unknown> = {};
      if (eventData.title !== undefined) updateData.title = eventData.title;
      if (eventData.description !== undefined) updateData.description = eventData.description;
      if (eventData.location !== undefined) updateData.location = eventData.location;
      if (eventData.start_time !== undefined) updateData.start_time = eventData.start_time;
      if (eventData.end_time !== undefined) updateData.end_time = eventData.end_time;
      if (eventData.all_day !== undefined) updateData.all_day = eventData.all_day;
      if (eventData.color !== undefined) updateData.color = eventData.color;
      if (eventData.status !== undefined) updateData.status = eventData.status;
      if (eventData.assigned_agent !== undefined) updateData.assigned_agent = eventData.assigned_agent;
      if (eventData.attendees !== undefined) updateData.attendees = eventData.attendees as Json;
      if (eventData.reminders !== undefined) updateData.reminders = eventData.reminders as Json;

      const { data, error } = await supabase
        .from('calendar_events')
        .update(updateData)
        .eq('id', eventData.id)
        .select()
        .single();

      if (error) throw error;

      const updatedEvent = data as CalendarEvent;
      setEvents(prev => prev.map(e => e.id === eventData.id ? updatedEvent : e));

      toast({
        title: 'Event updated',
        description: 'Your changes have been saved',
      });

      return updatedEvent;
    } catch (error) {
      console.error('Error updating event:', error);
      toast({
        title: 'Error updating event',
        description: 'Please try again',
        variant: 'destructive',
      });
      return null;
    }
  };

  const deleteEvent = async (eventId: string): Promise<boolean> => {
    try {
      const { error } = await supabase
        .from('calendar_events')
        .delete()
        .eq('id', eventId);

      if (error) throw error;

      setEvents(prev => prev.filter(e => e.id !== eventId));

      toast({
        title: 'Event deleted',
        description: 'The event has been removed from your calendar',
      });

      return true;
    } catch (error) {
      console.error('Error deleting event:', error);
      toast({
        title: 'Error deleting event',
        description: 'Please try again',
        variant: 'destructive',
      });
      return false;
    }
  };

  const goToNextMonth = () => setCurrentMonth(addMonths(currentMonth, 1));
  const goToPrevMonth = () => setCurrentMonth(subMonths(currentMonth, 1));
  const goToToday = () => setCurrentMonth(new Date());

  const getEventsForDate = (date: Date): CalendarEvent[] => {
    const dateStr = format(date, 'yyyy-MM-dd');
    return events.filter(event => {
      const eventDate = format(new Date(event.start_time), 'yyyy-MM-dd');
      return eventDate === dateStr;
    });
  };

  return {
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
    fetchEvents,
    goToNextMonth,
    goToPrevMonth,
    goToToday,
    getEventsForDate,
  };
}
