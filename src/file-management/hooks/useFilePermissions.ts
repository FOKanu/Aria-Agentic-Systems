// File Permissions Hook - Manage agent file access permissions

import { useState, useCallback, useMemo } from 'react';
import {
  FilePermission,
  FileAccessRequest,
  AgentFileAccess,
  PermissionScope,
  FileAccessAction,
  UserFile,
} from '../types';
import {
  mockPermissions,
  mockPendingRequests,
  mockAccessHistory,
} from '../data/mockFiles';
import {
  createAccessRequest,
  createFileAccessLog,
  checkFilePermissions,
  summarizeAccessHistory,
} from '../lib/contextBuilder';

export interface UseFilePermissionsReturn {
  // State
  permissions: FilePermission[];
  pendingRequests: FileAccessRequest[];
  accessHistory: AgentFileAccess[];

  // Permission Checks
  hasPermission: (agentId: string, fileId: string) => boolean;
  getAgentPermissions: (agentId: string) => FilePermission[];
  getFilePermissions: (fileId: string) => FilePermission[];
  checkPermissions: (agentId: string, files: UserFile[]) => ReturnType<typeof checkFilePermissions>;

  // Permission Actions
  grantPermission: (agentId: string, fileId: string, scope: PermissionScope, taskId?: string) => void;
  revokePermission: (agentId: string, fileId: string) => void;
  revokeAllAgentPermissions: (agentId: string) => void;
  updatePermissionScope: (agentId: string, fileId: string, scope: PermissionScope) => void;

  // Request Actions
  createRequest: (
    agentId: string,
    agentName: string,
    agentAvatar: string | undefined,
    files: UserFile[],
    reason: string,
    taskContext?: string,
    scope?: PermissionScope
  ) => FileAccessRequest;
  approveRequest: (requestId: string, scope?: PermissionScope) => void;
  denyRequest: (requestId: string) => void;
  getPendingRequestsForAgent: (agentId: string) => FileAccessRequest[];

  // Access Logging
  logAccess: (agentId: string, fileId: string, action: FileAccessAction, taskId?: string, context?: string) => void;
  getAccessHistoryForFile: (fileId: string) => AgentFileAccess[];
  getAccessHistoryForAgent: (agentId: string) => AgentFileAccess[];
  getAccessSummary: (files: UserFile[], limit?: number) => ReturnType<typeof summarizeAccessHistory>;
}

export function useFilePermissions(): UseFilePermissionsReturn {
  const [permissions, setPermissions] = useState<FilePermission[]>(mockPermissions);
  const [pendingRequests, setPendingRequests] = useState<FileAccessRequest[]>(mockPendingRequests);
  const [accessHistory, setAccessHistory] = useState<AgentFileAccess[]>(mockAccessHistory);

  // Permission Checks
  const hasPermission = useCallback(
    (agentId: string, fileId: string): boolean => {
      const permission = permissions.find(
        p => p.agentId === agentId && p.fileId === fileId
      );
      if (!permission) return false;

      // Check expiration
      if (permission.expiresAt && new Date(permission.expiresAt) < new Date()) {
        return false;
      }

      return true;
    },
    [permissions]
  );

  const getAgentPermissions = useCallback(
    (agentId: string): FilePermission[] => {
      return permissions.filter(p => p.agentId === agentId);
    },
    [permissions]
  );

  const getFilePermissions = useCallback(
    (fileId: string): FilePermission[] => {
      return permissions.filter(p => p.fileId === fileId);
    },
    [permissions]
  );

  const checkPermissionsCallback = useCallback(
    (agentId: string, files: UserFile[]) => {
      return checkFilePermissions(agentId, files, permissions, pendingRequests);
    },
    [permissions, pendingRequests]
  );

  // Permission Actions
  const grantPermission = useCallback(
    (agentId: string, fileId: string, scope: PermissionScope, taskId?: string) => {
      // Remove any existing permission for this agent-file pair
      setPermissions(prev => prev.filter(
        p => !(p.agentId === agentId && p.fileId === fileId)
      ));

      const newPermission: FilePermission = {
        id: `perm_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        agentId,
        fileId,
        scope,
        grantedAt: new Date().toISOString(),
        grantedBy: 'user',
        taskId: scope === 'task-scoped' ? taskId : undefined,
        expiresAt: scope === 'session' 
          ? new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString() // 24 hours
          : undefined,
      };

      setPermissions(prev => [...prev, newPermission]);
    },
    []
  );

  const revokePermission = useCallback((agentId: string, fileId: string) => {
    setPermissions(prev =>
      prev.filter(p => !(p.agentId === agentId && p.fileId === fileId))
    );
  }, []);

  const revokeAllAgentPermissions = useCallback((agentId: string) => {
    setPermissions(prev => prev.filter(p => p.agentId !== agentId));
  }, []);

  const updatePermissionScope = useCallback(
    (agentId: string, fileId: string, scope: PermissionScope) => {
      setPermissions(prev =>
        prev.map(p =>
          p.agentId === agentId && p.fileId === fileId
            ? {
                ...p,
                scope,
                expiresAt: scope === 'session'
                  ? new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString()
                  : scope === 'permanent'
                  ? undefined
                  : p.expiresAt,
              }
            : p
        )
      );
    },
    []
  );

  // Request Actions
  const createRequestCallback = useCallback(
    (
      agentId: string,
      agentName: string,
      agentAvatar: string | undefined,
      files: UserFile[],
      reason: string,
      taskContext?: string,
      scope: PermissionScope = 'session'
    ): FileAccessRequest => {
      const request = createAccessRequest(
        agentId,
        agentName,
        agentAvatar,
        files,
        reason,
        taskContext,
        scope
      );
      setPendingRequests(prev => [...prev, request]);
      return request;
    },
    []
  );

  const approveRequest = useCallback(
    (requestId: string, scope?: PermissionScope) => {
      const request = pendingRequests.find(r => r.id === requestId);
      if (!request) return;

      const finalScope = scope || request.requestedScope;

      // Grant permission for each file
      request.fileIds.forEach(fileId => {
        grantPermission(request.agentId, fileId, finalScope);
      });

      // Update request status
      setPendingRequests(prev =>
        prev.map(r =>
          r.id === requestId
            ? { ...r, status: 'approved' as const, respondedAt: new Date().toISOString() }
            : r
        )
      );
    },
    [pendingRequests, grantPermission]
  );

  const denyRequest = useCallback((requestId: string) => {
    setPendingRequests(prev =>
      prev.map(r =>
        r.id === requestId
          ? { ...r, status: 'denied' as const, respondedAt: new Date().toISOString() }
          : r
      )
    );
  }, []);

  const getPendingRequestsForAgent = useCallback(
    (agentId: string): FileAccessRequest[] => {
      return pendingRequests.filter(
        r => r.agentId === agentId && r.status === 'pending'
      );
    },
    [pendingRequests]
  );

  // Access Logging
  const logAccess = useCallback(
    (
      agentId: string,
      fileId: string,
      action: FileAccessAction,
      taskId?: string,
      context?: string
    ) => {
      const log = createFileAccessLog(agentId, fileId, action, taskId, context);
      setAccessHistory(prev => [...prev, log]);
    },
    []
  );

  const getAccessHistoryForFile = useCallback(
    (fileId: string): AgentFileAccess[] => {
      return accessHistory
        .filter(a => a.fileId === fileId)
        .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
    },
    [accessHistory]
  );

  const getAccessHistoryForAgent = useCallback(
    (agentId: string): AgentFileAccess[] => {
      return accessHistory
        .filter(a => a.agentId === agentId)
        .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
    },
    [accessHistory]
  );

  const getAccessSummary = useCallback(
    (files: UserFile[], limit: number = 5) => {
      return summarizeAccessHistory(accessHistory, files, limit);
    },
    [accessHistory]
  );

  return {
    // State
    permissions,
    pendingRequests,
    accessHistory,

    // Permission Checks
    hasPermission,
    getAgentPermissions,
    getFilePermissions,
    checkPermissions: checkPermissionsCallback,

    // Permission Actions
    grantPermission,
    revokePermission,
    revokeAllAgentPermissions,
    updatePermissionScope,

    // Request Actions
    createRequest: createRequestCallback,
    approveRequest,
    denyRequest,
    getPendingRequestsForAgent,

    // Access Logging
    logAccess,
    getAccessHistoryForFile,
    getAccessHistoryForAgent,
    getAccessSummary,
  };
}
