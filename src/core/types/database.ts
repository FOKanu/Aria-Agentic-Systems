// Core Database Types - Provider Agnostic
// These types mirror the database schema but are designed for multi-provider use

export type StorageProvider = 
  | 'lovable_cloud'
  | 'local_storage'
  | 'local_server'
  | 'aws_s3'
  | 'gcp_storage'
  | 'azure_blob'
  | 'custom_api';

export type ContactCategory = 
  | 'personal'
  | 'business'
  | 'client'
  | 'vendor'
  | 'legal'
  | 'influencer'
  | 'team'
  | 'other';

export type DocumentType = 
  | 'csv' | 'pdf' | 'docx' | 'doc' | 'txt' | 'xlsx' | 'xls'
  | 'png' | 'jpg' | 'jpeg' | 'gif' | 'webp' | 'svg'
  | 'json' | 'md' | 'html' | 'zip' | 'video' | 'audio' | 'other';

export type TaskStatus = 
  | 'backlog' | 'todo' | 'in_progress' | 'in_review' | 'blocked' | 'done' | 'cancelled';

export type TaskPriority = 
  | 'critical' | 'high' | 'medium' | 'low' | 'none';

export type MemoryScope = 
  | 'global' | 'agent' | 'task' | 'session' | 'conversation';

export type MemoryType = 
  | 'fact' | 'preference' | 'context' | 'instruction' | 'learned' | 'summary';

// Provider Configuration
export interface ProviderConfig {
  id: string;
  user_id: string;
  data_type: 'contacts' | 'documents' | 'tasks' | 'memory' | 'files';
  provider: StorageProvider;
  endpoint_url?: string;
  api_key_secret_name?: string;
  bucket_name?: string;
  region?: string;
  sync_enabled: boolean;
  sync_interval_minutes: number;
  last_synced_at?: string;
  fallback_provider?: StorageProvider;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

// Contact (Unified across all agents)
export interface Contact {
  id: string;
  user_id: string;
  external_id?: string;
  external_provider?: StorageProvider;
  
  // Essential
  name: string;
  email?: string;
  phone?: string;
  
  // Organization
  organization?: string;
  job_title?: string;
  department?: string;
  
  avatar_url?: string;
  
  // Tagging
  tags: string[];
  categories: ContactCategory[];
  
  // Cross-capability metadata
  category_meta: Record<string, Record<string, unknown>>;
  social_profiles: Record<string, string>;
  address: {
    street?: string;
    city?: string;
    state?: string;
    zip?: string;
    country?: string;
  };
  
  // Agent tracking
  created_by_agent?: string;
  last_accessed_by: string[];
  access_count: number;
  
  notes?: string;
  preferences: Record<string, unknown>;
  
  is_favorite: boolean;
  is_archived: boolean;
  
  created_at: string;
  updated_at: string;
}

// Document Folder
export interface DocumentFolder {
  id: string;
  user_id: string;
  name: string;
  parent_id?: string;
  color?: string;
  icon?: string;
  created_at: string;
  updated_at: string;
}

// Document (Unified file management)
export interface Document {
  id: string;
  user_id: string;
  external_id?: string;
  storage_provider: StorageProvider;
  
  name: string;
  file_type: DocumentType;
  mime_type?: string;
  size_bytes?: number;
  
  file_url: string;
  thumbnail_url?: string;
  storage_path?: string;
  
  folder_id?: string;
  tags: string[];
  
  // AI metadata
  summary?: string;
  extracted_text?: string;
  ai_analysis: Record<string, unknown>;
  
  // Agent access
  agent_permissions: Record<string, string[]>;
  
  relevance_score?: number;
  last_relevance_calc?: string;
  
  version: number;
  checksum?: string;
  
  is_processed: boolean;
  is_archived: boolean;
  
  uploaded_at: string;
  analyzed_at?: string;
  created_at: string;
  updated_at: string;
}

// Task (Unified task management)
export interface Task {
  id: string;
  user_id: string;
  external_id?: string;
  external_provider?: StorageProvider;
  
  title: string;
  description?: string;
  
  status: TaskStatus;
  priority: TaskPriority;
  
  due_date?: string;
  due_time?: string;
  start_date?: string;
  estimated_minutes?: number;
  actual_minutes?: number;
  
  assignee_agent?: string;
  assignee_contact_id?: string;
  
  parent_task_id?: string;
  linked_contact_ids: string[];
  linked_document_ids: string[];
  
  tags: string[];
  category?: string;
  project?: string;
  
  completed_at?: string;
  completed_by?: string;
  
  is_recurring: boolean;
  recurrence_rule?: string;
  
  created_by_agent?: string;
  last_worked_by_agent?: string;
  agent_notes: Record<string, unknown>;
  
  progress_percent: number;
  subtask_count: number;
  completed_subtask_count: number;
  
  created_at: string;
  updated_at: string;
}

// Agent Memory
export interface AgentMemory {
  id: string;
  user_id: string;
  
  key: string;
  value: string;
  
  scope: MemoryScope;
  memory_type: MemoryType;
  
  agent_id?: string;
  task_id?: string;
  conversation_id?: string;
  
  metadata: Record<string, unknown>;
  
  embedding_data?: number[];
  relevance_score?: number;
  access_count: number;
  last_accessed_at?: string;
  
  expires_at?: string;
  is_permanent: boolean;
  
  source?: string;
  source_reference?: string;
  
  created_at: string;
  updated_at: string;
}

// Sync Log (for provider migration)
export interface SyncLog {
  id: string;
  user_id: string;
  data_type: string;
  record_id: string;
  source_provider: StorageProvider;
  target_provider: StorageProvider;
  status: 'pending' | 'syncing' | 'success' | 'failed' | 'conflict';
  error_message?: string;
  conflict_data?: Record<string, unknown>;
  resolved_by?: 'source' | 'target' | 'merge' | 'user';
  started_at: string;
  completed_at?: string;
  created_at: string;
}

// Form input types (for progressive disclosure forms)
export interface ContactFormData {
  // Essential
  name: string;
  email?: string;
  phone?: string;
  
  // Advanced (optional)
  organization?: string;
  job_title?: string;
  department?: string;
  tags?: string[];
  categories?: ContactCategory[];
  notes?: string;
  social_profiles?: Record<string, string>;
  address?: Contact['address'];
}

export interface TaskFormData {
  // Essential
  title: string;
  description?: string;
  
  // Advanced (optional)
  status?: TaskStatus;
  priority?: TaskPriority;
  due_date?: string;
  due_time?: string;
  assignee_agent?: string;
  tags?: string[];
  category?: string;
  project?: string;
}

export interface DocumentFormData {
  name: string;
  file: File;
  folder_id?: string;
  tags?: string[];
}
