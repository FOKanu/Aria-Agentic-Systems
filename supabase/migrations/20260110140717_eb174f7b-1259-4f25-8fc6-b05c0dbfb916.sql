-- Create enum types for providers
CREATE TYPE public.email_provider AS ENUM ('gmail', 'outlook', 'imap', 'resend', 'sendgrid', 'smtp');
CREATE TYPE public.phone_provider AS ENUM ('twilio', 'vapi', 'vonage', 'custom');
CREATE TYPE public.email_trigger_type AS ENUM ('keyword', 'sender', 'time_based', 'all_incoming');
CREATE TYPE public.email_action_type AS ENUM ('auto_reply', 'forward_to_agent', 'label', 'archive', 'create_task');

-- Create email_accounts table
CREATE TABLE public.email_accounts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  provider public.email_provider NOT NULL,
  email_address TEXT NOT NULL,
  display_name TEXT,
  is_primary BOOLEAN DEFAULT false,
  is_active BOOLEAN DEFAULT true,
  oauth_token_encrypted TEXT,
  refresh_token_encrypted TEXT,
  smtp_host TEXT,
  smtp_port INTEGER,
  smtp_username TEXT,
  imap_host TEXT,
  imap_port INTEGER,
  api_key_secret_name TEXT,
  assigned_agent_id TEXT,
  auto_reply_enabled BOOLEAN DEFAULT false,
  auto_reply_template TEXT,
  signature TEXT,
  sync_enabled BOOLEAN DEFAULT true,
  last_synced_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Create phone_configurations table
CREATE TABLE public.phone_configurations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  provider public.phone_provider NOT NULL,
  phone_number TEXT NOT NULL,
  display_name TEXT,
  is_primary BOOLEAN DEFAULT false,
  is_active BOOLEAN DEFAULT true,
  account_sid TEXT,
  auth_token_encrypted TEXT,
  api_key_secret_name TEXT,
  voice_model TEXT DEFAULT 'female_professional',
  assigned_agent_id TEXT,
  voicemail_enabled BOOLEAN DEFAULT true,
  voicemail_greeting TEXT,
  voicemail_transcription_enabled BOOLEAN DEFAULT true,
  working_hours_start TIME,
  working_hours_end TIME,
  working_days INTEGER[] DEFAULT ARRAY[1,2,3,4,5],
  escalation_rules JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Create email_automation_rules table
CREATE TABLE public.email_automation_rules (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  email_account_id UUID REFERENCES public.email_accounts(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  trigger_type public.email_trigger_type NOT NULL,
  trigger_value TEXT,
  trigger_config JSONB DEFAULT '{}',
  action_type public.email_action_type NOT NULL,
  action_config JSONB DEFAULT '{}',
  assigned_agent_id TEXT,
  priority INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  execution_count INTEGER DEFAULT 0,
  last_executed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Enable RLS on all tables
ALTER TABLE public.email_accounts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.phone_configurations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.email_automation_rules ENABLE ROW LEVEL SECURITY;

-- RLS policies for email_accounts
CREATE POLICY "Users manage own email accounts"
ON public.email_accounts
FOR ALL
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- RLS policies for phone_configurations
CREATE POLICY "Users manage own phone configurations"
ON public.phone_configurations
FOR ALL
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- RLS policies for email_automation_rules
CREATE POLICY "Users manage own email rules"
ON public.email_automation_rules
FOR ALL
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- Create update triggers
CREATE TRIGGER update_email_accounts_updated_at
BEFORE UPDATE ON public.email_accounts
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_phone_configurations_updated_at
BEFORE UPDATE ON public.phone_configurations
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_email_automation_rules_updated_at
BEFORE UPDATE ON public.email_automation_rules
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();