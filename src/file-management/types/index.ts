// File Management Types

export type FileType = 
  | 'csv' 
  | 'pdf' 
  | 'docx' 
  | 'doc'
  | 'txt' 
  | 'xlsx' 
  | 'xls'
  | 'png' 
  | 'jpg' 
  | 'jpeg'
  | 'gif'
  | 'webp'
  | 'svg'
  | 'json'
  | 'md'
  | 'html'
  | 'zip'
  | 'unknown';

export interface UserFile {
  id: string;
  name: string;
  type: FileType;
  size: number; // bytes
  url: string;
  thumbnail?: string;
  summary?: string;
  tags: string[];
  folderId: string | null;
  uploadedAt: string;
  analyzedAt?: string;
  relevanceScore?: number;
  metadata?: Record<string, unknown>;
}

export interface FileFolder {
  id: string;
  name: string;
  parentId: string | null;
  color?: string;
  icon?: string;
  createdAt: string;
  fileCount?: number;
}

export type PermissionScope = 'session' | 'permanent' | 'task-scoped';

export interface FilePermission {
  id: string;
  agentId: string;
  fileId: string;
  scope: PermissionScope;
  grantedAt: string;
  expiresAt?: string;
  grantedBy: 'user' | 'system';
  taskId?: string; // For task-scoped permissions
}

export type FileAccessRequestStatus = 'pending' | 'approved' | 'denied' | 'expired';

export interface FileAccessRequest {
  id: string;
  agentId: string;
  agentName: string;
  agentAvatar?: string;
  fileIds: string[];
  reason: string;
  taskContext?: string;
  status: FileAccessRequestStatus;
  requestedAt: string;
  respondedAt?: string;
  requestedScope: PermissionScope;
}

export type FileAccessAction = 'view' | 'read' | 'analyze' | 'reference' | 'download';

export interface AgentFileAccess {
  id: string;
  agentId: string;
  fileId: string;
  action: FileAccessAction;
  timestamp: string;
  taskId?: string;
  contextUsed?: string; // How the file was used
}

export interface FileUploadProgress {
  fileId: string;
  fileName: string;
  progress: number; // 0-100
  status: 'pending' | 'uploading' | 'processing' | 'complete' | 'error';
  error?: string;
}

export interface FileSearchFilters {
  query?: string;
  types?: FileType[];
  folderId?: string | null;
  tags?: string[];
  dateRange?: {
    start: string;
    end: string;
  };
  hasAgentAccess?: string; // agentId
}

export type FileSortBy = 'name' | 'date' | 'size' | 'type' | 'relevance';
export type FileSortOrder = 'asc' | 'desc';
export type FileViewMode = 'grid' | 'list';

export interface FileManagerState {
  files: UserFile[];
  folders: FileFolder[];
  selectedFileIds: string[];
  currentFolderId: string | null;
  searchQuery: string;
  filters: FileSearchFilters;
  sortBy: FileSortBy;
  sortOrder: FileSortOrder;
  viewMode: FileViewMode;
  isLoading: boolean;
}

export interface FilePermissionsState {
  permissions: FilePermission[];
  pendingRequests: FileAccessRequest[];
  accessHistory: AgentFileAccess[];
}
