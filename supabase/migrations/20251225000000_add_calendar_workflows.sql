-- Create workflows table for automation sequences
CREATE TABLE public.workflows (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  steps JSONB DEFAULT '[]'::jsonb, -- Array of steps to execute
  trigger_config JSONB DEFAULT '{}'::jsonb, -- Configuration for triggers
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on workflows
ALTER TABLE public.workflows ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for workflows
CREATE POLICY "Users can view their own workflows"
  ON public.workflows FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own workflows"
  ON public.workflows FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own workflows"
  ON public.workflows FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own workflows"
  ON public.workflows FOR DELETE
  USING (auth.uid() = user_id);

-- Create index for workflows
CREATE INDEX idx_workflows_user_id ON public.workflows(user_id);

-- Add trigger for updated_at on workflows
CREATE TRIGGER update_workflows_updated_at
  BEFORE UPDATE ON public.workflows
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Update calendar_events table with automation fields
ALTER TABLE public.calendar_events
ADD COLUMN instructions TEXT,
ADD COLUMN workflow_id UUID REFERENCES public.workflows(id) ON DELETE SET NULL,
ADD COLUMN related_task_id UUID REFERENCES public.tasks(id) ON DELETE SET NULL,
ADD COLUMN auto_start BOOLEAN DEFAULT false;

-- Add index for the new foreign keys
CREATE INDEX idx_calendar_events_workflow_id ON public.calendar_events(workflow_id);
CREATE INDEX idx_calendar_events_related_task_id ON public.calendar_events(related_task_id);
