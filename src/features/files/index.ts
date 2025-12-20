/**
 * Files Feature Module
 * 
 * File management, uploads, permissions, and document viewing.
 */

// Components
export { FileCard } from '@/file-management/components/FileCard';
export { FileGrid } from '@/file-management/components/FileGrid';
export { FileListItem } from '@/file-management/components/FileListItem';
export { FileDetailSheet } from '@/file-management/components/FileDetailSheet';
export { FileUploadDialog } from '@/file-management/components/FileUploadDialog';
export { FileAccessRequest } from '@/file-management/components/FileAccessRequest';
export { FolderTree } from '@/file-management/components/FolderTree';

// Hooks
export { useFileManager } from '@/file-management/hooks/useFileManager';
export { useFilePermissions } from '@/file-management/hooks/useFilePermissions';

// Utils
export { checkFilePermissions, buildAgentTaskContext } from '@/file-management/lib/contextBuilder';
export { findRelevantFiles, analyzeTaskFileNeeds } from '@/file-management/lib/relevanceScoring';
export * from '@/file-management/lib/fileUtils';

// Pages
export { FilesPage } from '@/pages/FilesPage';

// Types
export type * from '@/file-management/types';
