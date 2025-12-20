// Provider Abstraction Types
// Enables switching between Lovable Cloud, Local Storage, External APIs, etc.

import type { 
  StorageProvider, 
  Contact, 
  Document, 
  Task, 
  AgentMemory,
  ContactFormData,
  TaskFormData,
  DocumentFormData
} from '../types/database';

// Generic CRUD operations interface
export interface DataProvider<T, CreateInput, UpdateInput = Partial<CreateInput>> {
  // Read operations
  getById(id: string): Promise<T | null>;
  getAll(filters?: Record<string, unknown>): Promise<T[]>;
  search(query: string, filters?: Record<string, unknown>): Promise<T[]>;
  
  // Write operations
  create(data: CreateInput): Promise<T>;
  update(id: string, data: UpdateInput): Promise<T>;
  delete(id: string): Promise<boolean>;
  
  // Batch operations
  createMany?(data: CreateInput[]): Promise<T[]>;
  updateMany?(ids: string[], data: UpdateInput): Promise<T[]>;
  deleteMany?(ids: string[]): Promise<boolean>;
  
  // Sync operations (for migration)
  exportAll?(): Promise<T[]>;
  importAll?(data: T[]): Promise<{ success: number; failed: number }>;
}

// Specific provider interfaces
export interface ContactsProvider extends DataProvider<Contact, ContactFormData> {
  getByEmail(email: string): Promise<Contact | null>;
  getByCategory(category: string): Promise<Contact[]>;
  getFavorites(): Promise<Contact[]>;
  getRecent(limit?: number): Promise<Contact[]>;
  addTag(id: string, tag: string): Promise<Contact>;
  removeTag(id: string, tag: string): Promise<Contact>;
}

export interface DocumentsProvider extends DataProvider<Document, DocumentFormData> {
  getByFolder(folderId: string | null): Promise<Document[]>;
  getByType(type: string): Promise<Document[]>;
  uploadFile(file: File, folderId?: string): Promise<Document>;
  deleteFile(id: string): Promise<boolean>;
  getDownloadUrl(id: string): Promise<string>;
}

export interface TasksProvider extends DataProvider<Task, TaskFormData> {
  getByStatus(status: string): Promise<Task[]>;
  getByAssignee(agentId: string): Promise<Task[]>;
  getDueToday(): Promise<Task[]>;
  getOverdue(): Promise<Task[]>;
  complete(id: string): Promise<Task>;
  updateStatus(id: string, status: string): Promise<Task>;
}

export interface MemoryProvider extends DataProvider<AgentMemory, Partial<AgentMemory>> {
  getByAgent(agentId: string): Promise<AgentMemory[]>;
  getByScope(scope: string): Promise<AgentMemory[]>;
  getByKey(key: string): Promise<AgentMemory | null>;
  setMemory(key: string, value: string, options?: { 
    scope?: string; 
    agentId?: string; 
    expiresAt?: string;
  }): Promise<AgentMemory>;
  clearExpired(): Promise<number>;
}

// Provider factory interface
export interface ProviderFactory {
  getContactsProvider(): ContactsProvider;
  getDocumentsProvider(): DocumentsProvider;
  getTasksProvider(): TasksProvider;
  getMemoryProvider(): MemoryProvider;
}

// Provider configuration for switching
export interface ProviderConfiguration {
  contacts: StorageProvider;
  documents: StorageProvider;
  tasks: StorageProvider;
  memory: StorageProvider;
  files: StorageProvider;
}

// Sync status for migration
export interface SyncStatus {
  dataType: string;
  sourceProvider: StorageProvider;
  targetProvider: StorageProvider;
  totalRecords: number;
  syncedRecords: number;
  failedRecords: number;
  status: 'idle' | 'syncing' | 'completed' | 'failed';
  lastSyncAt?: string;
  error?: string;
}

// Provider capabilities (what each provider supports)
export interface ProviderCapabilities {
  supportsRealtime: boolean;
  supportsOffline: boolean;
  supportsSearch: boolean;
  supportsFileStorage: boolean;
  maxFileSize?: number; // bytes
  supportedFileTypes?: string[];
  requiresAuth: boolean;
  syncInterval?: number; // minutes
}

// Provider registry entry
export interface ProviderRegistryEntry {
  id: StorageProvider;
  name: string;
  description: string;
  icon: string;
  capabilities: ProviderCapabilities;
  configFields: {
    name: string;
    type: 'text' | 'password' | 'url' | 'select';
    required: boolean;
    placeholder?: string;
    options?: string[];
  }[];
}

// Available providers registry
export const PROVIDER_REGISTRY: ProviderRegistryEntry[] = [
  {
    id: 'lovable_cloud',
    name: 'Lovable Cloud',
    description: 'Default cloud storage with real-time sync and full functionality',
    icon: 'Cloud',
    capabilities: {
      supportsRealtime: true,
      supportsOffline: false,
      supportsSearch: true,
      supportsFileStorage: true,
      maxFileSize: 50 * 1024 * 1024, // 50MB
      requiresAuth: true,
    },
    configFields: [],
  },
  {
    id: 'local_storage',
    name: 'Browser Local Storage',
    description: 'Store data locally in browser (IndexedDB). Works offline.',
    icon: 'HardDrive',
    capabilities: {
      supportsRealtime: false,
      supportsOffline: true,
      supportsSearch: true,
      supportsFileStorage: false,
      requiresAuth: false,
    },
    configFields: [],
  },
  {
    id: 'local_server',
    name: 'Local Server',
    description: 'Self-hosted server (Docker, local API). Full control.',
    icon: 'Server',
    capabilities: {
      supportsRealtime: true,
      supportsOffline: false,
      supportsSearch: true,
      supportsFileStorage: true,
      requiresAuth: true,
    },
    configFields: [
      { name: 'endpoint_url', type: 'url', required: true, placeholder: 'http://localhost:8080/api' },
      { name: 'api_key', type: 'password', required: false, placeholder: 'Optional API key' },
    ],
  },
  {
    id: 'aws_s3',
    name: 'AWS S3',
    description: 'Amazon S3 for file storage with high durability',
    icon: 'Cloud',
    capabilities: {
      supportsRealtime: false,
      supportsOffline: false,
      supportsSearch: false,
      supportsFileStorage: true,
      requiresAuth: true,
    },
    configFields: [
      { name: 'bucket_name', type: 'text', required: true, placeholder: 'my-bucket' },
      { name: 'region', type: 'text', required: true, placeholder: 'us-east-1' },
      { name: 'access_key', type: 'password', required: true },
      { name: 'secret_key', type: 'password', required: true },
    ],
  },
  {
    id: 'gcp_storage',
    name: 'Google Cloud Storage',
    description: 'Google Cloud Storage for files',
    icon: 'Cloud',
    capabilities: {
      supportsRealtime: false,
      supportsOffline: false,
      supportsSearch: false,
      supportsFileStorage: true,
      requiresAuth: true,
    },
    configFields: [
      { name: 'bucket_name', type: 'text', required: true, placeholder: 'my-bucket' },
      { name: 'project_id', type: 'text', required: true },
      { name: 'credentials_json', type: 'password', required: true },
    ],
  },
  {
    id: 'custom_api',
    name: 'Custom API',
    description: 'Connect to any REST API endpoint',
    icon: 'Globe',
    capabilities: {
      supportsRealtime: false,
      supportsOffline: false,
      supportsSearch: true,
      supportsFileStorage: true,
      requiresAuth: true,
    },
    configFields: [
      { name: 'endpoint_url', type: 'url', required: true, placeholder: 'https://api.example.com' },
      { name: 'api_key', type: 'password', required: true },
      { name: 'headers', type: 'text', required: false, placeholder: '{"Authorization": "Bearer ..."}' },
    ],
  },
];
