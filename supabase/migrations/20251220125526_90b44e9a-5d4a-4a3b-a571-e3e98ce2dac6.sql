-- Create calendar_events table for full event management
CREATE TABLE public.calendar_events (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  location TEXT,
  start_time TIMESTAMP WITH TIME ZONE NOT NULL,
  end_time TIMESTAMP WITH TIME ZONE NOT NULL,
  all_day BOOLEAN DEFAULT false,
  recurrence_rule TEXT,
  color TEXT DEFAULT '#3b82f6',
  status TEXT DEFAULT 'confirmed' CHECK (status IN ('confirmed', 'tentative', 'cancelled')),
  visibility TEXT DEFAULT 'private' CHECK (visibility IN ('public', 'private', 'busy')),
  reminders JSONB DEFAULT '[]'::jsonb,
  attendees JSONB DEFAULT '[]'::jsonb,
  assigned_agent TEXT,
  external_id TEXT,
  external_provider public.storage_provider,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.calendar_events ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY "Users can view their own events"
  ON public.calendar_events FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own events"
  ON public.calendar_events FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own events"
  ON public.calendar_events FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own events"
  ON public.calendar_events FOR DELETE
  USING (auth.uid() = user_id);

-- Create indexes for performance
CREATE INDEX idx_calendar_events_user_id ON public.calendar_events(user_id);
CREATE INDEX idx_calendar_events_start_time ON public.calendar_events(start_time);
CREATE INDEX idx_calendar_events_end_time ON public.calendar_events(end_time);

-- Create trigger for updated_at
CREATE TRIGGER update_calendar_events_updated_at
  BEFORE UPDATE ON public.calendar_events
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();