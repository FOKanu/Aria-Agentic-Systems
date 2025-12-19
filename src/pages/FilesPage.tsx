// FilesPage - Main file management interface

import { useState } from 'react';
import { Upload } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { FileGrid } from '@/file-management/components/FileGrid';
import { FolderTree } from '@/file-management/components/FolderTree';
import { FileDetailSheet } from '@/file-management/components/FileDetailSheet';
import { FileUploadDialog } from '@/file-management/components/FileUploadDialog';
import { useFileManager } from '@/file-management/hooks/useFileManager';
import { useFilePermissions } from '@/file-management/hooks/useFilePermissions';
import { UserFile, FileType } from '@/file-management/types';
import { AGENTS } from '@/data/agentsData';
import { getFileTypeFromExtension } from '@/file-management/lib/fileUtils';

export function FilesPage() {
  const {
    files,
    folders,
    selectedFileIds,
    currentFolderId,
    navigateToFolder,
    clearSelection,
    toggleFileSelection,
    addFile,
    deleteFile,
    updateFile,
    createFolder,
    updateFolder,
    deleteFolder,
  } = useFileManager();
  
  const {
    permissions,
    accessHistory,
    revokePermission,
    getFilePermissions,
  } = useFilePermissions();
  
  const [selectedFile, setSelectedFile] = useState<UserFile | null>(null);
  const [isUploadOpen, setIsUploadOpen] = useState(false);
  
  // Create agent info map for display
  const agentInfo = AGENTS.reduce((acc, agent) => {
    acc[agent.id] = { name: agent.name, avatar: agent.avatar };
    return acc;
  }, {} as Record<string, { name: string; avatar?: string }>);
  
  // Create agent avatars map
  const agentAvatars = AGENTS.reduce((acc, agent) => {
    acc[agent.id] = agent.avatar;
    return acc;
  }, {} as Record<string, string>);
  
  // Calculate file counts per folder
  const fileCounts = files.reduce((acc, file) => {
    const key = file.folderId || 'root';
    acc[key] = (acc[key] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);
  
  // Filter files by current folder
  const displayedFiles = currentFolderId === null 
    ? files 
    : currentFolderId === 'root'
      ? files.filter(f => f.folderId === null)
      : files.filter(f => f.folderId === currentFolderId);
  
  const handleUpload = (uploadedFiles: File[], folderId: string | null, tags: string[]) => {
    uploadedFiles.forEach(file => {
      const type = getFileTypeFromExtension(file.name) as FileType;
      addFile({
        name: file.name,
        type,
        size: file.size,
        url: URL.createObjectURL(file),
        tags,
        folderId,
      });
    });
  };
  
  const handleDeleteFile = (file: UserFile) => {
    deleteFile(file.id);
    if (selectedFile?.id === file.id) {
      setSelectedFile(null);
    }
  };
  
  const handleDownloadFile = (file: UserFile) => {
    const link = document.createElement('a');
    link.href = file.url;
    link.download = file.name;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };
  
  const handleUpdateFile = (file: UserFile, updates: Partial<UserFile>) => {
    updateFile(file.id, updates);
  };
  
  const handleRevokePermission = (permissionId: string) => {
    // Find the permission to get agentId and fileId
    const permission = permissions.find(p => p.id === permissionId);
    if (permission) {
      revokePermission(permission.agentId, permission.fileId);
    }
  };
  
  const handleSelectionChange = (fileIds: string[]) => {
    clearSelection();
    fileIds.forEach(id => toggleFileSelection(id));
  };
  
  const handleRenameFolder = (folderId: string, newName: string) => {
    updateFolder(folderId, { name: newName });
  };
  
  return (
    <div className="space-y-4 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold font-display">Files</h1>
          <p className="text-muted-foreground text-sm">
            Manage files and control agent access
          </p>
        </div>
        <Button onClick={() => setIsUploadOpen(true)} className="gap-2">
          <Upload className="h-4 w-4" />
          Upload Files
        </Button>
      </div>
      
      {/* Main Content */}
      <div className="flex gap-4 h-[calc(100vh-220px)]">
        {/* Folder Tree - Sidebar */}
        <div className="w-64 shrink-0 border rounded-lg bg-card hidden md:block">
          <FolderTree
            folders={folders}
            selectedFolderId={currentFolderId}
            onSelectFolder={navigateToFolder}
            onCreateFolder={createFolder}
            onRenameFolder={handleRenameFolder}
            onDeleteFolder={deleteFolder}
            fileCounts={fileCounts}
          />
        </div>
        
        {/* File Grid - Main Area */}
        <div className="flex-1 border rounded-lg bg-card overflow-hidden">
          <FileGrid
            files={displayedFiles}
            permissions={permissions}
            agentAvatars={agentAvatars}
            selectedFileIds={selectedFileIds}
            onSelectionChange={handleSelectionChange}
            onFilePreview={setSelectedFile}
            onFileDownload={handleDownloadFile}
            onFileDelete={handleDeleteFile}
            onManagePermissions={setSelectedFile}
          />
        </div>
      </div>
      
      {/* File Detail Sheet */}
      <FileDetailSheet
        file={selectedFile}
        open={!!selectedFile}
        onOpenChange={(open) => !open && setSelectedFile(null)}
        permissions={permissions}
        accessHistory={accessHistory}
        agentInfo={agentInfo}
        onUpdateFile={handleUpdateFile}
        onDeleteFile={handleDeleteFile}
        onDownloadFile={handleDownloadFile}
        onRevokePermission={handleRevokePermission}
      />
      
      {/* Upload Dialog */}
      <FileUploadDialog
        open={isUploadOpen}
        onOpenChange={setIsUploadOpen}
        folders={folders}
        onUpload={handleUpload}
      />
    </div>
  );
}
