// Lovable Cloud Provider Implementation
// Default provider using the integrated backend

import { supabase } from '@/integrations/supabase/client';
import type { 
  Contact, 
  Document, 
  Task, 
  AgentMemory,
  ContactFormData,
  TaskFormData,
  DocumentFormData,
  TaskStatus,
  TaskPriority,
  DocumentType,
  MemoryScope,
  ContactCategory
} from '../types/database';
import type { 
  ContactsProvider, 
  DocumentsProvider, 
  TasksProvider, 
  MemoryProvider,
  ProviderFactory 
} from './types';

// Helper to get current user ID
async function getCurrentUserId(): Promise<string> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('User not authenticated');
  return user.id;
}

// Type guards
function isValidTaskStatus(status: string): status is TaskStatus {
  return ['backlog', 'todo', 'in_progress', 'in_review', 'blocked', 'done', 'cancelled'].includes(status);
}

function isValidTaskPriority(priority: string): priority is TaskPriority {
  return ['critical', 'high', 'medium', 'low', 'none'].includes(priority);
}

function isValidDocumentType(type: string): type is DocumentType {
  return ['csv', 'pdf', 'docx', 'doc', 'txt', 'xlsx', 'xls', 'png', 'jpg', 'jpeg', 'gif', 'webp', 'svg', 'json', 'md', 'html', 'zip', 'video', 'audio', 'other'].includes(type);
}

function isValidMemoryScope(scope: string): scope is MemoryScope {
  return ['global', 'agent', 'task', 'session', 'conversation'].includes(scope);
}

// Contacts Provider
class LovableCloudContactsProvider implements ContactsProvider {
  async getById(id: string): Promise<Contact | null> {
    const { data, error } = await supabase
      .from('contacts')
      .select('*')
      .eq('id', id)
      .maybeSingle();
    
    if (error) throw error;
    return data as Contact | null;
  }

  async getAll(filters?: Record<string, unknown>): Promise<Contact[]> {
    let query = supabase.from('contacts').select('*');
    
    if (filters?.is_archived !== undefined) {
      query = query.eq('is_archived', Boolean(filters.is_archived));
    }
    if (filters?.category && typeof filters.category === 'string') {
      query = query.contains('categories', [filters.category as ContactCategory]);
    }
    
    const { data, error } = await query.order('name');
    if (error) throw error;
    return (data || []) as Contact[];
  }

  async search(queryStr: string, filters?: Record<string, unknown>): Promise<Contact[]> {
    let query = supabase
      .from('contacts')
      .select('*')
      .or(`name.ilike.%${queryStr}%,email.ilike.%${queryStr}%,organization.ilike.%${queryStr}%`);
    
    if (filters?.is_archived !== undefined) {
      query = query.eq('is_archived', Boolean(filters.is_archived));
    }
    
    const { data, error } = await query.order('name').limit(50);
    if (error) throw error;
    return (data || []) as Contact[];
  }

  async create(data: ContactFormData): Promise<Contact> {
    const userId = await getCurrentUserId();
    const { data: contact, error } = await supabase
      .from('contacts')
      .insert({
        user_id: userId,
        name: data.name,
        email: data.email,
        phone: data.phone,
        organization: data.organization,
        job_title: data.job_title,
        department: data.department,
        tags: data.tags || [],
        categories: data.categories || ['personal'],
        notes: data.notes,
        social_profiles: data.social_profiles || {},
        address: data.address || {},
      })
      .select()
      .single();
    
    if (error) throw error;
    return contact as Contact;
  }

  async update(id: string, data: Partial<ContactFormData>): Promise<Contact> {
    const { data: contact, error } = await supabase
      .from('contacts')
      .update(data)
      .eq('id', id)
      .select()
      .single();
    
    if (error) throw error;
    return contact as Contact;
  }

  async delete(id: string): Promise<boolean> {
    const { error } = await supabase
      .from('contacts')
      .delete()
      .eq('id', id);
    
    if (error) throw error;
    return true;
  }

  async getByEmail(email: string): Promise<Contact | null> {
    const { data, error } = await supabase
      .from('contacts')
      .select('*')
      .eq('email', email)
      .maybeSingle();
    
    if (error) throw error;
    return data as Contact | null;
  }

  async getByCategory(category: string): Promise<Contact[]> {
    const { data, error } = await supabase
      .from('contacts')
      .select('*')
      .contains('categories', [category as ContactCategory])
      .order('name');
    
    if (error) throw error;
    return (data || []) as Contact[];
  }

  async getFavorites(): Promise<Contact[]> {
    const { data, error } = await supabase
      .from('contacts')
      .select('*')
      .eq('is_favorite', true)
      .order('name');
    
    if (error) throw error;
    return (data || []) as Contact[];
  }

  async getRecent(limit = 10): Promise<Contact[]> {
    const { data, error } = await supabase
      .from('contacts')
      .select('*')
      .order('updated_at', { ascending: false })
      .limit(limit);
    
    if (error) throw error;
    return (data || []) as Contact[];
  }

  async addTag(id: string, tag: string): Promise<Contact> {
    const contact = await this.getById(id);
    if (!contact) throw new Error('Contact not found');
    
    const tags = [...new Set([...contact.tags, tag])];
    return this.update(id, { tags } as Partial<ContactFormData>);
  }

  async removeTag(id: string, tag: string): Promise<Contact> {
    const contact = await this.getById(id);
    if (!contact) throw new Error('Contact not found');
    
    const tags = contact.tags.filter(t => t !== tag);
    return this.update(id, { tags } as Partial<ContactFormData>);
  }

  async exportAll(): Promise<Contact[]> {
    const { data, error } = await supabase
      .from('contacts')
      .select('*');
    
    if (error) throw error;
    return (data || []) as Contact[];
  }

  async importAll(contacts: Contact[]): Promise<{ success: number; failed: number }> {
    const userId = await getCurrentUserId();
    let success = 0;
    let failed = 0;

    for (const contact of contacts) {
      try {
        await supabase.from('contacts').insert({
          user_id: userId,
          name: contact.name,
          email: contact.email,
          phone: contact.phone,
          organization: contact.organization,
          job_title: contact.job_title,
          department: contact.department,
          tags: contact.tags || [],
          categories: contact.categories || ['personal'],
          notes: contact.notes,
          social_profiles: contact.social_profiles || {},
          address: contact.address || {},
          external_id: contact.id,
          external_provider: 'custom_api',
        });
        success++;
      } catch {
        failed++;
      }
    }

    return { success, failed };
  }
}

// Tasks Provider
class LovableCloudTasksProvider implements TasksProvider {
  async getById(id: string): Promise<Task | null> {
    const { data, error } = await supabase
      .from('tasks')
      .select('*')
      .eq('id', id)
      .maybeSingle();
    
    if (error) throw error;
    return data as Task | null;
  }

  async getAll(filters?: Record<string, unknown>): Promise<Task[]> {
    let query = supabase.from('tasks').select('*');
    
    if (filters?.status && typeof filters.status === 'string' && isValidTaskStatus(filters.status)) {
      query = query.eq('status', filters.status);
    }
    if (filters?.priority && typeof filters.priority === 'string' && isValidTaskPriority(filters.priority)) {
      query = query.eq('priority', filters.priority);
    }
    
    const { data, error } = await query.order('created_at', { ascending: false });
    if (error) throw error;
    return (data || []) as Task[];
  }

  async search(queryStr: string): Promise<Task[]> {
    const { data, error } = await supabase
      .from('tasks')
      .select('*')
      .or(`title.ilike.%${queryStr}%,description.ilike.%${queryStr}%`)
      .order('created_at', { ascending: false })
      .limit(50);
    
    if (error) throw error;
    return (data || []) as Task[];
  }

  async create(data: TaskFormData): Promise<Task> {
    const userId = await getCurrentUserId();
    const { data: task, error } = await supabase
      .from('tasks')
      .insert({
        user_id: userId,
        title: data.title,
        description: data.description,
        status: data.status || 'todo',
        priority: data.priority || 'medium',
        due_date: data.due_date,
        due_time: data.due_time,
        assignee_agent: data.assignee_agent,
        tags: data.tags || [],
        category: data.category,
        project: data.project,
      })
      .select()
      .single();
    
    if (error) throw error;
    return task as Task;
  }

  async update(id: string, data: Partial<TaskFormData>): Promise<Task> {
    const { data: task, error } = await supabase
      .from('tasks')
      .update(data)
      .eq('id', id)
      .select()
      .single();
    
    if (error) throw error;
    return task as Task;
  }

  async delete(id: string): Promise<boolean> {
    const { error } = await supabase
      .from('tasks')
      .delete()
      .eq('id', id);
    
    if (error) throw error;
    return true;
  }

  async getByStatus(status: string): Promise<Task[]> {
    if (!isValidTaskStatus(status)) {
      throw new Error(`Invalid task status: ${status}`);
    }
    
    const { data, error } = await supabase
      .from('tasks')
      .select('*')
      .eq('status', status)
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    return (data || []) as Task[];
  }

  async getByAssignee(agentId: string): Promise<Task[]> {
    const { data, error } = await supabase
      .from('tasks')
      .select('*')
      .eq('assignee_agent', agentId)
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    return (data || []) as Task[];
  }

  async getDueToday(): Promise<Task[]> {
    const today = new Date().toISOString().split('T')[0];
    const { data, error } = await supabase
      .from('tasks')
      .select('*')
      .eq('due_date', today)
      .neq('status', 'done')
      .order('due_time');
    
    if (error) throw error;
    return (data || []) as Task[];
  }

  async getOverdue(): Promise<Task[]> {
    const today = new Date().toISOString().split('T')[0];
    const { data, error } = await supabase
      .from('tasks')
      .select('*')
      .lt('due_date', today)
      .neq('status', 'done')
      .neq('status', 'cancelled')
      .order('due_date');
    
    if (error) throw error;
    return (data || []) as Task[];
  }

  async complete(id: string): Promise<Task> {
    const { data: task, error } = await supabase
      .from('tasks')
      .update({
        status: 'done' as TaskStatus,
        completed_at: new Date().toISOString(),
        completed_by: 'user',
      })
      .eq('id', id)
      .select()
      .single();
    
    if (error) throw error;
    return task as Task;
  }

  async updateStatus(id: string, status: string): Promise<Task> {
    if (!isValidTaskStatus(status)) {
      throw new Error(`Invalid task status: ${status}`);
    }
    
    const updateData: { status: TaskStatus; completed_at?: string; completed_by?: string } = { status };
    if (status === 'done') {
      updateData.completed_at = new Date().toISOString();
      updateData.completed_by = 'user';
    }
    
    const { data: task, error } = await supabase
      .from('tasks')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();
    
    if (error) throw error;
    return task as Task;
  }
}

// Documents Provider
class LovableCloudDocumentsProvider implements DocumentsProvider {
  async getById(id: string): Promise<Document | null> {
    const { data, error } = await supabase
      .from('documents')
      .select('*')
      .eq('id', id)
      .maybeSingle();
    
    if (error) throw error;
    return data as Document | null;
  }

  async getAll(filters?: Record<string, unknown>): Promise<Document[]> {
    let query = supabase.from('documents').select('*');
    
    if (filters?.folder_id !== undefined) {
      if (filters.folder_id === null) {
        query = query.is('folder_id', null);
      } else if (typeof filters.folder_id === 'string') {
        query = query.eq('folder_id', filters.folder_id);
      }
    }
    if (filters?.is_archived !== undefined) {
      query = query.eq('is_archived', Boolean(filters.is_archived));
    }
    
    const { data, error } = await query.order('name');
    if (error) throw error;
    return (data || []) as Document[];
  }

  async search(queryStr: string): Promise<Document[]> {
    const { data, error } = await supabase
      .from('documents')
      .select('*')
      .or(`name.ilike.%${queryStr}%,summary.ilike.%${queryStr}%`)
      .order('name')
      .limit(50);
    
    if (error) throw error;
    return (data || []) as Document[];
  }

  async create(data: DocumentFormData): Promise<Document> {
    return this.uploadFile(data.file, data.folder_id);
  }

  async update(id: string, data: Partial<DocumentFormData>): Promise<Document> {
    const { data: doc, error } = await supabase
      .from('documents')
      .update({ name: data.name, tags: data.tags })
      .eq('id', id)
      .select()
      .single();
    
    if (error) throw error;
    return doc as Document;
  }

  async delete(id: string): Promise<boolean> {
    return this.deleteFile(id);
  }

  async getByFolder(folderId: string | null): Promise<Document[]> {
    let query = supabase.from('documents').select('*');
    
    if (folderId === null) {
      query = query.is('folder_id', null);
    } else {
      query = query.eq('folder_id', folderId);
    }
    
    const { data, error } = await query.order('name');
    if (error) throw error;
    return (data || []) as Document[];
  }

  async getByType(type: string): Promise<Document[]> {
    if (!isValidDocumentType(type)) {
      throw new Error(`Invalid document type: ${type}`);
    }
    
    const { data, error } = await supabase
      .from('documents')
      .select('*')
      .eq('file_type', type)
      .order('name');
    
    if (error) throw error;
    return (data || []) as Document[];
  }

  async uploadFile(file: File, folderId?: string): Promise<Document> {
    const userId = await getCurrentUserId();
    const fileExt = file.name.split('.').pop()?.toLowerCase() || 'other';
    const filePath = `${userId}/${Date.now()}_${file.name}`;
    const fileType: DocumentType = isValidDocumentType(fileExt) ? fileExt : 'other';
    
    // Placeholder URL - actual storage integration needed
    const fileUrl = `https://placeholder.storage/${filePath}`;
    
    const { data: doc, error } = await supabase
      .from('documents')
      .insert({
        user_id: userId,
        name: file.name,
        file_type: fileType,
        mime_type: file.type,
        size_bytes: file.size,
        file_url: fileUrl,
        storage_path: filePath,
        folder_id: folderId,
        storage_provider: 'lovable_cloud',
      })
      .select()
      .single();
    
    if (error) throw error;
    return doc as Document;
  }

  async deleteFile(id: string): Promise<boolean> {
    const { error } = await supabase
      .from('documents')
      .delete()
      .eq('id', id);
    
    if (error) throw error;
    return true;
  }

  async getDownloadUrl(id: string): Promise<string> {
    const doc = await this.getById(id);
    if (!doc) throw new Error('Document not found');
    return doc.file_url;
  }
}

// Memory Provider
class LovableCloudMemoryProvider implements MemoryProvider {
  async getById(id: string): Promise<AgentMemory | null> {
    const { data, error } = await supabase
      .from('agent_memory')
      .select('*')
      .eq('id', id)
      .maybeSingle();
    
    if (error) throw error;
    return data as AgentMemory | null;
  }

  async getAll(): Promise<AgentMemory[]> {
    const { data, error } = await supabase
      .from('agent_memory')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    return (data || []) as AgentMemory[];
  }

  async search(queryStr: string): Promise<AgentMemory[]> {
    const { data, error } = await supabase
      .from('agent_memory')
      .select('*')
      .or(`key.ilike.%${queryStr}%,value.ilike.%${queryStr}%`)
      .limit(50);
    
    if (error) throw error;
    return (data || []) as AgentMemory[];
  }

  async create(input: Partial<AgentMemory>): Promise<AgentMemory> {
    const userId = await getCurrentUserId();
    
    if (!input.key || !input.value) {
      throw new Error('Key and value are required');
    }
    
    const { data: memory, error } = await supabase
      .from('agent_memory')
      .insert({
        user_id: userId,
        key: input.key,
        value: input.value,
        scope: input.scope || 'global',
        memory_type: input.memory_type || 'fact',
        agent_id: input.agent_id,
        task_id: input.task_id,
        conversation_id: input.conversation_id,
        metadata: input.metadata ? JSON.parse(JSON.stringify(input.metadata)) : {},
        expires_at: input.expires_at,
        is_permanent: input.is_permanent || false,
        source: input.source,
        source_reference: input.source_reference,
      } as never)
      .select()
      .single();
    
    if (error) throw error;
    return memory as AgentMemory;
  }

  async update(id: string, data: Partial<AgentMemory>): Promise<AgentMemory> {
    const updateData: Record<string, unknown> = {};
    
    if (data.key !== undefined) updateData.key = data.key;
    if (data.value !== undefined) updateData.value = data.value;
    if (data.scope !== undefined) updateData.scope = data.scope;
    if (data.memory_type !== undefined) updateData.memory_type = data.memory_type;
    if (data.agent_id !== undefined) updateData.agent_id = data.agent_id;
    if (data.metadata !== undefined) updateData.metadata = data.metadata;
    if (data.expires_at !== undefined) updateData.expires_at = data.expires_at;
    if (data.is_permanent !== undefined) updateData.is_permanent = data.is_permanent;
    
    const { data: memory, error } = await supabase
      .from('agent_memory')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();
    
    if (error) throw error;
    return memory as AgentMemory;
  }

  async delete(id: string): Promise<boolean> {
    const { error } = await supabase
      .from('agent_memory')
      .delete()
      .eq('id', id);
    
    if (error) throw error;
    return true;
  }

  async getByAgent(agentId: string): Promise<AgentMemory[]> {
    const { data, error } = await supabase
      .from('agent_memory')
      .select('*')
      .eq('agent_id', agentId)
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    return (data || []) as AgentMemory[];
  }

  async getByScope(scope: string): Promise<AgentMemory[]> {
    if (!isValidMemoryScope(scope)) {
      throw new Error(`Invalid memory scope: ${scope}`);
    }
    
    const { data, error } = await supabase
      .from('agent_memory')
      .select('*')
      .eq('scope', scope)
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    return (data || []) as AgentMemory[];
  }

  async getByKey(key: string): Promise<AgentMemory | null> {
    const { data, error } = await supabase
      .from('agent_memory')
      .select('*')
      .eq('key', key)
      .maybeSingle();
    
    if (error) throw error;
    return data as AgentMemory | null;
  }

  async setMemory(
    key: string, 
    value: string, 
    options?: { scope?: string; agentId?: string; expiresAt?: string }
  ): Promise<AgentMemory> {
    const userId = await getCurrentUserId();
    const scope: MemoryScope = options?.scope && isValidMemoryScope(options.scope) 
      ? options.scope 
      : 'global';
    
    // Check if memory exists
    const existing = await this.getByKey(key);
    
    if (existing) {
      return this.update(existing.id, { value, scope, agent_id: options?.agentId, expires_at: options?.expiresAt });
    }
    
    const { data: memory, error } = await supabase
      .from('agent_memory')
      .insert({
        user_id: userId,
        key,
        value,
        scope,
        agent_id: options?.agentId,
        expires_at: options?.expiresAt,
      })
      .select()
      .single();
    
    if (error) throw error;
    return memory as AgentMemory;
  }

  async clearExpired(): Promise<number> {
    const { data, error } = await supabase
      .from('agent_memory')
      .delete()
      .lt('expires_at', new Date().toISOString())
      .select('id');
    
    if (error) throw error;
    return data?.length || 0;
  }
}

// Provider Factory
export class LovableCloudProviderFactory implements ProviderFactory {
  private contactsProvider: LovableCloudContactsProvider;
  private documentsProvider: LovableCloudDocumentsProvider;
  private tasksProvider: LovableCloudTasksProvider;
  private memoryProvider: LovableCloudMemoryProvider;

  constructor() {
    this.contactsProvider = new LovableCloudContactsProvider();
    this.documentsProvider = new LovableCloudDocumentsProvider();
    this.tasksProvider = new LovableCloudTasksProvider();
    this.memoryProvider = new LovableCloudMemoryProvider();
  }

  getContactsProvider(): ContactsProvider {
    return this.contactsProvider;
  }

  getDocumentsProvider(): DocumentsProvider {
    return this.documentsProvider;
  }

  getTasksProvider(): TasksProvider {
    return this.tasksProvider;
  }

  getMemoryProvider(): MemoryProvider {
    return this.memoryProvider;
  }
}

// Default instance
export const lovableCloudProvider = new LovableCloudProviderFactory();
