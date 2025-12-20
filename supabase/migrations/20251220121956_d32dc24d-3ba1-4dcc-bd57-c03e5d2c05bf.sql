-- ═══════════════════════════════════════════════════════════════════════════
-- PHASE 0: CORE FOUNDATION TABLES WITH PROVIDER ABSTRACTION
-- Designed for multi-provider flexibility (Cloud, Local, External APIs)
-- ═══════════════════════════════════════════════════════════════════════════

-- ───────────────────────────────────────────────────────────────────────────
-- STORAGE PROVIDER CONFIGURATION
-- Tracks which provider is used for each data type (for migration flexibility)
-- ───────────────────────────────────────────────────────────────────────────
CREATE TYPE public.storage_provider AS ENUM (
  'lovable_cloud',      -- Default: Lovable Cloud
  'local_storage',      -- Browser localStorage/IndexedDB
  'local_server',       -- Self-hosted server (Docker/Ollama)
  'aws_s3',             -- AWS S3
  'gcp_storage',        -- Google Cloud Storage
  'azure_blob',         -- Azure Blob Storage
  'custom_api'          -- Custom REST API endpoint
);

CREATE TABLE public.provider_config (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  
  data_type TEXT NOT NULL,
  provider storage_provider DEFAULT 'lovable_cloud',
  
  endpoint_url TEXT,
  api_key_secret_name TEXT,
  bucket_name TEXT,
  region TEXT,
  
  sync_enabled BOOLEAN DEFAULT true,
  sync_interval_minutes INTEGER DEFAULT 15,
  last_synced_at TIMESTAMPTZ,
  
  fallback_provider storage_provider,
  
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  
  UNIQUE(user_id, data_type)
);

-- ───────────────────────────────────────────────────────────────────────────
-- CONTACT CATEGORIES
-- ───────────────────────────────────────────────────────────────────────────
CREATE TYPE public.contact_category AS ENUM (
  'personal', 'business', 'client', 'vendor', 'legal', 'influencer', 'team', 'other'
);

-- ───────────────────────────────────────────────────────────────────────────
-- UNIFIED CONTACTS TABLE
-- ───────────────────────────────────────────────────────────────────────────
CREATE TABLE public.contacts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  
  external_id TEXT,
  external_provider storage_provider,
  
  name TEXT NOT NULL,
  email TEXT,
  phone TEXT,
  
  organization TEXT,
  job_title TEXT,
  department TEXT,
  
  avatar_url TEXT,
  
  tags TEXT[] DEFAULT '{}',
  categories contact_category[] DEFAULT '{personal}',
  
  category_meta JSONB DEFAULT '{}',
  social_profiles JSONB DEFAULT '{}',
  address JSONB DEFAULT '{}',
  
  created_by_agent TEXT,
  last_accessed_by TEXT[] DEFAULT '{}',
  access_count INTEGER DEFAULT 0,
  
  notes TEXT,
  preferences JSONB DEFAULT '{}',
  
  is_favorite BOOLEAN DEFAULT false,
  is_archived BOOLEAN DEFAULT false,
  
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- ───────────────────────────────────────────────────────────────────────────
-- DOCUMENT FOLDERS
-- ───────────────────────────────────────────────────────────────────────────
CREATE TABLE public.document_folders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  
  name TEXT NOT NULL,
  parent_id UUID REFERENCES public.document_folders(id) ON DELETE CASCADE,
  
  color TEXT,
  icon TEXT,
  
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- ───────────────────────────────────────────────────────────────────────────
-- UNIFIED DOCUMENTS TABLE
-- ───────────────────────────────────────────────────────────────────────────
CREATE TYPE public.document_type AS ENUM (
  'csv', 'pdf', 'docx', 'doc', 'txt', 'xlsx', 'xls',
  'png', 'jpg', 'jpeg', 'gif', 'webp', 'svg',
  'json', 'md', 'html', 'zip', 'video', 'audio', 'other'
);

CREATE TABLE public.documents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  
  external_id TEXT,
  storage_provider storage_provider DEFAULT 'lovable_cloud',
  
  name TEXT NOT NULL,
  file_type document_type DEFAULT 'other',
  mime_type TEXT,
  size_bytes BIGINT,
  
  file_url TEXT NOT NULL,
  thumbnail_url TEXT,
  storage_path TEXT,
  
  folder_id UUID REFERENCES public.document_folders(id) ON DELETE SET NULL,
  tags TEXT[] DEFAULT '{}',
  
  summary TEXT,
  extracted_text TEXT,
  ai_analysis JSONB DEFAULT '{}',
  
  agent_permissions JSONB DEFAULT '{}',
  
  relevance_score REAL,
  last_relevance_calc TIMESTAMPTZ,
  
  version INTEGER DEFAULT 1,
  checksum TEXT,
  
  is_processed BOOLEAN DEFAULT false,
  is_archived BOOLEAN DEFAULT false,
  
  uploaded_at TIMESTAMPTZ DEFAULT now(),
  analyzed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- ───────────────────────────────────────────────────────────────────────────
-- UNIFIED TASKS TABLE
-- ───────────────────────────────────────────────────────────────────────────
CREATE TYPE public.task_status AS ENUM (
  'backlog', 'todo', 'in_progress', 'in_review', 'blocked', 'done', 'cancelled'
);

CREATE TYPE public.task_priority AS ENUM (
  'critical', 'high', 'medium', 'low', 'none'
);

CREATE TABLE public.tasks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  
  external_id TEXT,
  external_provider storage_provider,
  
  title TEXT NOT NULL,
  description TEXT,
  
  status task_status DEFAULT 'todo',
  priority task_priority DEFAULT 'medium',
  
  due_date DATE,
  due_time TIME,
  start_date DATE,
  estimated_minutes INTEGER,
  actual_minutes INTEGER,
  
  assignee_agent TEXT,
  assignee_contact_id UUID REFERENCES public.contacts(id) ON DELETE SET NULL,
  
  parent_task_id UUID REFERENCES public.tasks(id) ON DELETE CASCADE,
  linked_contact_ids UUID[] DEFAULT '{}',
  linked_document_ids UUID[] DEFAULT '{}',
  
  tags TEXT[] DEFAULT '{}',
  category TEXT,
  project TEXT,
  
  completed_at TIMESTAMPTZ,
  completed_by TEXT,
  
  is_recurring BOOLEAN DEFAULT false,
  recurrence_rule TEXT,
  
  created_by_agent TEXT,
  last_worked_by_agent TEXT,
  agent_notes JSONB DEFAULT '{}',
  
  progress_percent INTEGER DEFAULT 0,
  subtask_count INTEGER DEFAULT 0,
  completed_subtask_count INTEGER DEFAULT 0,
  
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- ───────────────────────────────────────────────────────────────────────────
-- AGENT MEMORY TABLE (without vector embedding - can add later)
-- ───────────────────────────────────────────────────────────────────────────
CREATE TYPE public.memory_scope AS ENUM (
  'global', 'agent', 'task', 'session', 'conversation'
);

CREATE TYPE public.memory_type AS ENUM (
  'fact', 'preference', 'context', 'instruction', 'learned', 'summary'
);

CREATE TABLE public.agent_memory (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  
  key TEXT NOT NULL,
  value TEXT NOT NULL,
  
  scope memory_scope DEFAULT 'global',
  memory_type memory_type DEFAULT 'fact',
  
  agent_id TEXT,
  
  task_id UUID REFERENCES public.tasks(id) ON DELETE CASCADE,
  conversation_id TEXT,
  
  metadata JSONB DEFAULT '{}',
  
  -- Embedding stored as JSONB array (can migrate to vector later)
  embedding_data JSONB,
  relevance_score REAL,
  access_count INTEGER DEFAULT 0,
  last_accessed_at TIMESTAMPTZ,
  
  expires_at TIMESTAMPTZ,
  is_permanent BOOLEAN DEFAULT false,
  
  source TEXT,
  source_reference TEXT,
  
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  
  UNIQUE(user_id, key, agent_id, scope)
);

-- ───────────────────────────────────────────────────────────────────────────
-- SYNC LOG TABLE
-- ───────────────────────────────────────────────────────────────────────────
CREATE TABLE public.sync_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  
  data_type TEXT NOT NULL,
  record_id UUID NOT NULL,
  
  source_provider storage_provider NOT NULL,
  target_provider storage_provider NOT NULL,
  
  status TEXT DEFAULT 'pending',
  error_message TEXT,
  
  conflict_data JSONB,
  resolved_by TEXT,
  
  started_at TIMESTAMPTZ DEFAULT now(),
  completed_at TIMESTAMPTZ,
  
  created_at TIMESTAMPTZ DEFAULT now()
);

-- ═══════════════════════════════════════════════════════════════════════════
-- INDEXES
-- ═══════════════════════════════════════════════════════════════════════════

CREATE INDEX idx_contacts_user ON public.contacts(user_id);
CREATE INDEX idx_contacts_email ON public.contacts(email);
CREATE INDEX idx_contacts_categories ON public.contacts USING GIN(categories);
CREATE INDEX idx_contacts_tags ON public.contacts USING GIN(tags);
CREATE INDEX idx_contacts_external ON public.contacts(external_provider, external_id);

CREATE INDEX idx_documents_user ON public.documents(user_id);
CREATE INDEX idx_documents_folder ON public.documents(folder_id);
CREATE INDEX idx_documents_type ON public.documents(file_type);
CREATE INDEX idx_documents_tags ON public.documents USING GIN(tags);

CREATE INDEX idx_tasks_user ON public.tasks(user_id);
CREATE INDEX idx_tasks_status ON public.tasks(status);
CREATE INDEX idx_tasks_due ON public.tasks(user_id, due_date);
CREATE INDEX idx_tasks_assignee ON public.tasks(assignee_agent);
CREATE INDEX idx_tasks_tags ON public.tasks USING GIN(tags);

CREATE INDEX idx_memory_user ON public.agent_memory(user_id);
CREATE INDEX idx_memory_agent ON public.agent_memory(agent_id);
CREATE INDEX idx_memory_scope ON public.agent_memory(scope);
CREATE INDEX idx_memory_key ON public.agent_memory(user_id, key);
CREATE INDEX idx_memory_expires ON public.agent_memory(expires_at) WHERE expires_at IS NOT NULL;

CREATE INDEX idx_sync_log_user ON public.sync_log(user_id, data_type);

-- ═══════════════════════════════════════════════════════════════════════════
-- ROW LEVEL SECURITY
-- ═══════════════════════════════════════════════════════════════════════════

ALTER TABLE public.provider_config ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.contacts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.document_folders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.agent_memory ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sync_log ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users manage own provider config" ON public.provider_config FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users access own contacts" ON public.contacts FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users access own documents" ON public.documents FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users access own folders" ON public.document_folders FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users access own tasks" ON public.tasks FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users access own memory" ON public.agent_memory FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users access own sync logs" ON public.sync_log FOR ALL USING (auth.uid() = user_id);

-- ═══════════════════════════════════════════════════════════════════════════
-- UPDATED_AT TRIGGERS
-- ═══════════════════════════════════════════════════════════════════════════

CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_provider_config_updated_at BEFORE UPDATE ON public.provider_config FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_contacts_updated_at BEFORE UPDATE ON public.contacts FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_documents_updated_at BEFORE UPDATE ON public.documents FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_folders_updated_at BEFORE UPDATE ON public.document_folders FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_tasks_updated_at BEFORE UPDATE ON public.tasks FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_memory_updated_at BEFORE UPDATE ON public.agent_memory FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();