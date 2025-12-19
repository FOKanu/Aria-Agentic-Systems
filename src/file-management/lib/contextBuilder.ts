// Context Builder for Agent File Access

import { 
  UserFile, 
  FilePermission, 
  FileAccessRequest, 
  PermissionScope,
  FileAccessRequestStatus,
  AgentFileAccess,
  FileAccessAction
} from '../types';
import { findRelevantFiles, analyzeTaskFileNeeds } from './relevanceScoring';
import { formatFileSize, getFileCategory } from './fileUtils';
import { AgentRoleId, FileContext } from '../../agent-engine/types';

// Permission check result
export interface PermissionCheckResult {
  granted: UserFile[];
  denied: UserFile[];
  pending: UserFile[];
  needsRequest: UserFile[];
}

// Check permissions for an agent against a list of files
export function checkFilePermissions(
  agentId: string,
  files: UserFile[],
  permissions: FilePermission[],
  pendingRequests: FileAccessRequest[]
): PermissionCheckResult {
  const result: PermissionCheckResult = {
    granted: [],
    denied: [],
    pending: [],
    needsRequest: [],
  };

  const agentPermissions = permissions.filter(p => p.agentId === agentId);
  const agentPendingRequests = pendingRequests.filter(
    r => r.agentId === agentId && r.status === 'pending'
  );

  files.forEach(file => {
    const permission = agentPermissions.find(p => p.fileId === file.id);
    const pendingRequest = agentPendingRequests.find(r => r.fileIds.includes(file.id));

    if (permission) {
      // Check if permission is still valid
      if (permission.expiresAt && new Date(permission.expiresAt) < new Date()) {
        result.needsRequest.push(file);
      } else {
        result.granted.push(file);
      }
    } else if (pendingRequest) {
      result.pending.push(file);
    } else {
      result.needsRequest.push(file);
    }
  });

  return result;
}

// Create an access request for files the agent needs
export function createAccessRequest(
  agentId: string,
  agentName: string,
  agentAvatar: string | undefined,
  files: UserFile[],
  reason: string,
  taskContext?: string,
  requestedScope: PermissionScope = 'session'
): FileAccessRequest {
  return {
    id: `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    agentId,
    agentName,
    agentAvatar,
    fileIds: files.map(f => f.id),
    reason,
    taskContext,
    status: 'pending' as FileAccessRequestStatus,
    requestedAt: new Date().toISOString(),
    requestedScope,
  };
}

// Build file context string for agent prompt injection
export function buildFileContextString(files: UserFile[]): string {
  if (files.length === 0) {
    return 'No files are available for this task.';
  }

  const contextParts = files.map(file => {
    const category = getFileCategory(file.type);
    const summary = file.summary || 'No summary available';
    const tags = file.tags.length > 0 ? `Tags: ${file.tags.join(', ')}` : '';

    return `
📄 ${file.name} (${file.type.toUpperCase()}, ${formatFileSize(file.size)})
   Category: ${category}
   ${summary}
   ${tags}
   Relevance: ${((file.relevanceScore || 0) * 100).toFixed(0)}%
`.trim();
  });

  return `
Available Files:
${contextParts.join('\n\n')}
`.trim();
}

// Build structured file context for agent execution
export function buildFileContext(
  files: UserFile[],
  permissionResult: PermissionCheckResult
): FileContext {
  return {
    availableFiles: permissionResult.granted.map(f => ({
      id: f.id,
      name: f.name,
      type: f.type,
      summary: f.summary,
      relevance: f.relevanceScore || 0,
    })),
    pendingAccessFiles: permissionResult.pending.map(f => f.id),
    deniedFiles: permissionResult.denied.map(f => f.id),
  };
}

// Main context building function for agent tasks
export function buildAgentTaskContext(
  agentId: string,
  agentRole: AgentRoleId,
  taskDescription: string,
  allFiles: UserFile[],
  permissions: FilePermission[],
  pendingRequests: FileAccessRequest[],
  previouslyAccessedIds: string[] = []
): {
  context: FileContext;
  contextString: string;
  needsPermission: boolean;
  accessRequest?: FileAccessRequest;
  relevantFiles: UserFile[];
} {
  // Find relevant files for this task
  const relevantFiles = findRelevantFiles(allFiles, taskDescription, agentRole, {
    threshold: 0.15,
    maxResults: 8,
    previouslyAccessedIds,
  });

  // Check permissions
  const permissionResult = checkFilePermissions(
    agentId,
    relevantFiles,
    permissions,
    pendingRequests
  );

  // Build context
  const context = buildFileContext(relevantFiles, permissionResult);
  const contextString = buildFileContextString(permissionResult.granted);

  return {
    context,
    contextString,
    needsPermission: permissionResult.needsRequest.length > 0,
    relevantFiles,
  };
}

// Generate a reason for file access request based on task analysis
export function generateAccessReason(
  taskDescription: string,
  files: UserFile[],
  agentRole: AgentRoleId
): string {
  const needs = analyzeTaskFileNeeds(taskDescription);
  const fileNames = files.map(f => f.name).slice(0, 3);
  const moreFiles = files.length > 3 ? ` and ${files.length - 3} more` : '';

  const roleActions: Record<AgentRoleId, string> = {
    atlas: 'planning and coordinating',
    nova: 'implementing and coding',
    sage: 'researching and analyzing',
    echo: 'assisting with',
    pixel: 'visually analyzing',
    nexus: 'managing',
    cipher: 'security auditing',
    flux: 'deploying',
    aria: 'drafting communications for',
    orion: 'scheduling',
  };

  const action = roleActions[agentRole] || 'completing';

  return `I need to review ${fileNames.join(', ')}${moreFiles} for ${action} this task: "${taskDescription.slice(0, 100)}${taskDescription.length > 100 ? '...' : ''}"`;
}

// Log file access for audit trail
export function createFileAccessLog(
  agentId: string,
  fileId: string,
  action: FileAccessAction,
  taskId?: string,
  contextUsed?: string
): AgentFileAccess {
  return {
    id: `access_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    agentId,
    fileId,
    action,
    timestamp: new Date().toISOString(),
    taskId,
    contextUsed,
  };
}

// Summarize file access history for display
export function summarizeAccessHistory(
  accessHistory: AgentFileAccess[],
  files: UserFile[],
  limit: number = 5
): {
  fileId: string;
  fileName: string;
  lastAccess: string;
  accessCount: number;
  actions: FileAccessAction[];
}[] {
  const fileAccessMap = new Map<string, {
    count: number;
    lastAccess: string;
    actions: Set<FileAccessAction>;
  }>();

  accessHistory.forEach(access => {
    const existing = fileAccessMap.get(access.fileId);
    if (existing) {
      existing.count++;
      if (new Date(access.timestamp) > new Date(existing.lastAccess)) {
        existing.lastAccess = access.timestamp;
      }
      existing.actions.add(access.action);
    } else {
      fileAccessMap.set(access.fileId, {
        count: 1,
        lastAccess: access.timestamp,
        actions: new Set([access.action]),
      });
    }
  });

  return Array.from(fileAccessMap.entries())
    .map(([fileId, data]) => {
      const file = files.find(f => f.id === fileId);
      return {
        fileId,
        fileName: file?.name || 'Unknown file',
        lastAccess: data.lastAccess,
        accessCount: data.count,
        actions: Array.from(data.actions),
      };
    })
    .sort((a, b) => new Date(b.lastAccess).getTime() - new Date(a.lastAccess).getTime())
    .slice(0, limit);
}
