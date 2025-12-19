// File Manager Hook - State management for files and folders

import { useState, useCallback, useMemo } from 'react';
import {
  UserFile,
  FileFolder,
  FileType,
  FileSearchFilters,
  FileSortBy,
  FileSortOrder,
  FileViewMode,
} from '../types';
import {
  mockFiles,
  mockFolders,
  getFilesInFolder,
  getSubfolders,
} from '../data/mockFiles';
import {
  sortFiles,
  filterFilesByQuery,
  getFileTypeFromExtension,
  getFolderPath,
} from '../lib/fileUtils';

export interface UseFileManagerReturn {
  // State
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

  // Computed
  filteredFiles: UserFile[];
  currentFolderFiles: UserFile[];
  currentSubfolders: FileFolder[];
  folderBreadcrumb: { id: string; name: string }[];
  recentFiles: UserFile[];
  selectedFiles: UserFile[];

  // File Actions
  addFile: (file: Omit<UserFile, 'id' | 'uploadedAt'>) => UserFile;
  updateFile: (id: string, updates: Partial<UserFile>) => void;
  deleteFile: (id: string) => void;
  deleteFiles: (ids: string[]) => void;
  moveFile: (fileId: string, targetFolderId: string | null) => void;
  moveFiles: (fileIds: string[], targetFolderId: string | null) => void;

  // Folder Actions
  createFolder: (name: string, parentId?: string | null) => FileFolder;
  updateFolder: (id: string, updates: Partial<FileFolder>) => void;
  deleteFolder: (id: string) => void;
  navigateToFolder: (folderId: string | null) => void;

  // Selection Actions
  selectFile: (id: string) => void;
  deselectFile: (id: string) => void;
  toggleFileSelection: (id: string) => void;
  selectAllFiles: () => void;
  clearSelection: () => void;

  // Filter/Sort Actions
  setSearchQuery: (query: string) => void;
  setFilters: (filters: FileSearchFilters) => void;
  setSortBy: (sortBy: FileSortBy) => void;
  setSortOrder: (order: FileSortOrder) => void;
  setViewMode: (mode: FileViewMode) => void;

  // Utilities
  getFileById: (id: string) => UserFile | undefined;
  getFolderById: (id: string) => FileFolder | undefined;
}

export function useFileManager(): UseFileManagerReturn {
  // Core state
  const [files, setFiles] = useState<UserFile[]>(mockFiles);
  const [folders, setFolders] = useState<FileFolder[]>(mockFolders);
  const [selectedFileIds, setSelectedFileIds] = useState<string[]>([]);
  const [currentFolderId, setCurrentFolderId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [filters, setFilters] = useState<FileSearchFilters>({});
  const [sortBy, setSortBy] = useState<FileSortBy>('date');
  const [sortOrder, setSortOrder] = useState<FileSortOrder>('desc');
  const [viewMode, setViewMode] = useState<FileViewMode>('grid');
  const [isLoading] = useState(false);

  // Computed: Filter and sort files
  const filteredFiles = useMemo(() => {
    let result = [...files];

    // Apply search query
    if (searchQuery) {
      result = filterFilesByQuery(result, searchQuery);
    }

    // Apply type filter
    if (filters.types && filters.types.length > 0) {
      result = result.filter(f => filters.types!.includes(f.type));
    }

    // Apply tag filter
    if (filters.tags && filters.tags.length > 0) {
      result = result.filter(f =>
        filters.tags!.some(tag => f.tags.includes(tag))
      );
    }

    // Apply date range filter
    if (filters.dateRange) {
      const startDate = new Date(filters.dateRange.start);
      const endDate = new Date(filters.dateRange.end);
      result = result.filter(f => {
        const uploadDate = new Date(f.uploadedAt);
        return uploadDate >= startDate && uploadDate <= endDate;
      });
    }

    // Apply sorting
    result = sortFiles(result, sortBy, sortOrder);

    return result;
  }, [files, searchQuery, filters, sortBy, sortOrder]);

  // Computed: Files in current folder
  const currentFolderFiles = useMemo(() => {
    return filteredFiles.filter(f => f.folderId === currentFolderId);
  }, [filteredFiles, currentFolderId]);

  // Computed: Subfolders of current folder
  const currentSubfolders = useMemo(() => {
    return folders.filter(f => f.parentId === currentFolderId);
  }, [folders, currentFolderId]);

  // Computed: Breadcrumb path
  const folderBreadcrumb = useMemo(() => {
    return getFolderPath(currentFolderId, folders);
  }, [currentFolderId, folders]);

  // Computed: Recent files (last 10 by upload date)
  const recentFiles = useMemo(() => {
    return [...files]
      .sort((a, b) => new Date(b.uploadedAt).getTime() - new Date(a.uploadedAt).getTime())
      .slice(0, 10);
  }, [files]);

  // Computed: Selected file objects
  const selectedFiles = useMemo(() => {
    return files.filter(f => selectedFileIds.includes(f.id));
  }, [files, selectedFileIds]);

  // File Actions
  const addFile = useCallback((fileData: Omit<UserFile, 'id' | 'uploadedAt'>): UserFile => {
    const newFile: UserFile = {
      ...fileData,
      id: `file_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      uploadedAt: new Date().toISOString(),
    };
    setFiles(prev => [...prev, newFile]);
    return newFile;
  }, []);

  const updateFile = useCallback((id: string, updates: Partial<UserFile>) => {
    setFiles(prev =>
      prev.map(f => (f.id === id ? { ...f, ...updates } : f))
    );
  }, []);

  const deleteFile = useCallback((id: string) => {
    setFiles(prev => prev.filter(f => f.id !== id));
    setSelectedFileIds(prev => prev.filter(fid => fid !== id));
  }, []);

  const deleteFiles = useCallback((ids: string[]) => {
    setFiles(prev => prev.filter(f => !ids.includes(f.id)));
    setSelectedFileIds(prev => prev.filter(fid => !ids.includes(fid)));
  }, []);

  const moveFile = useCallback((fileId: string, targetFolderId: string | null) => {
    updateFile(fileId, { folderId: targetFolderId });
  }, [updateFile]);

  const moveFiles = useCallback((fileIds: string[], targetFolderId: string | null) => {
    setFiles(prev =>
      prev.map(f =>
        fileIds.includes(f.id) ? { ...f, folderId: targetFolderId } : f
      )
    );
  }, []);

  // Folder Actions
  const createFolder = useCallback((name: string, parentId: string | null = null): FileFolder => {
    const newFolder: FileFolder = {
      id: `folder_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      name,
      parentId,
      createdAt: new Date().toISOString(),
    };
    setFolders(prev => [...prev, newFolder]);
    return newFolder;
  }, []);

  const updateFolder = useCallback((id: string, updates: Partial<FileFolder>) => {
    setFolders(prev =>
      prev.map(f => (f.id === id ? { ...f, ...updates } : f))
    );
  }, []);

  const deleteFolder = useCallback((id: string) => {
    // Move files in this folder to parent or root
    const folder = folders.find(f => f.id === id);
    if (folder) {
      setFiles(prev =>
        prev.map(f =>
          f.folderId === id ? { ...f, folderId: folder.parentId } : f
        )
      );
    }
    // Delete subfolders recursively
    const subfoldersToDelete = folders.filter(f => f.parentId === id);
    subfoldersToDelete.forEach(sf => deleteFolder(sf.id));
    
    setFolders(prev => prev.filter(f => f.id !== id));
    
    // Navigate up if we're in the deleted folder
    if (currentFolderId === id) {
      setCurrentFolderId(folder?.parentId || null);
    }
  }, [folders, currentFolderId]);

  const navigateToFolder = useCallback((folderId: string | null) => {
    setCurrentFolderId(folderId);
    setSelectedFileIds([]);
  }, []);

  // Selection Actions
  const selectFile = useCallback((id: string) => {
    setSelectedFileIds(prev => [...prev, id]);
  }, []);

  const deselectFile = useCallback((id: string) => {
    setSelectedFileIds(prev => prev.filter(fid => fid !== id));
  }, []);

  const toggleFileSelection = useCallback((id: string) => {
    setSelectedFileIds(prev =>
      prev.includes(id) ? prev.filter(fid => fid !== id) : [...prev, id]
    );
  }, []);

  const selectAllFiles = useCallback(() => {
    setSelectedFileIds(currentFolderFiles.map(f => f.id));
  }, [currentFolderFiles]);

  const clearSelection = useCallback(() => {
    setSelectedFileIds([]);
  }, []);

  // Utilities
  const getFileById = useCallback(
    (id: string) => files.find(f => f.id === id),
    [files]
  );

  const getFolderById = useCallback(
    (id: string) => folders.find(f => f.id === id),
    [folders]
  );

  return {
    // State
    files,
    folders,
    selectedFileIds,
    currentFolderId,
    searchQuery,
    filters,
    sortBy,
    sortOrder,
    viewMode,
    isLoading,

    // Computed
    filteredFiles,
    currentFolderFiles,
    currentSubfolders,
    folderBreadcrumb,
    recentFiles,
    selectedFiles,

    // File Actions
    addFile,
    updateFile,
    deleteFile,
    deleteFiles,
    moveFile,
    moveFiles,

    // Folder Actions
    createFolder,
    updateFolder,
    deleteFolder,
    navigateToFolder,

    // Selection Actions
    selectFile,
    deselectFile,
    toggleFileSelection,
    selectAllFiles,
    clearSelection,

    // Filter/Sort Actions
    setSearchQuery,
    setFilters,
    setSortBy,
    setSortOrder,
    setViewMode,

    // Utilities
    getFileById,
    getFolderById,
  };
}
