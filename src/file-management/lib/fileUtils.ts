// File Management Utilities

import { FileType, UserFile } from '../types';
import {
  FileText,
  FileSpreadsheet,
  FileImage,
  File,
  FileCode,
  FileArchive,
  FileType2,
  LucideIcon,
} from 'lucide-react';

// File type detection from extension
export function getFileTypeFromExtension(filename: string): FileType {
  const extension = filename.split('.').pop()?.toLowerCase() || '';
  
  const typeMap: Record<string, FileType> = {
    csv: 'csv',
    pdf: 'pdf',
    docx: 'docx',
    doc: 'doc',
    txt: 'txt',
    xlsx: 'xlsx',
    xls: 'xls',
    png: 'png',
    jpg: 'jpg',
    jpeg: 'jpeg',
    gif: 'gif',
    webp: 'webp',
    svg: 'svg',
    json: 'json',
    md: 'md',
    html: 'html',
    zip: 'zip',
  };

  return typeMap[extension] || 'unknown';
}

// Get appropriate icon for file type
export function getFileIcon(type: FileType): LucideIcon {
  const iconMap: Record<FileType, LucideIcon> = {
    csv: FileSpreadsheet,
    xlsx: FileSpreadsheet,
    xls: FileSpreadsheet,
    pdf: FileType2,
    docx: FileText,
    doc: FileText,
    txt: FileText,
    md: FileText,
    png: FileImage,
    jpg: FileImage,
    jpeg: FileImage,
    gif: FileImage,
    webp: FileImage,
    svg: FileImage,
    json: FileCode,
    html: FileCode,
    zip: FileArchive,
    unknown: File,
  };

  return iconMap[type] || File;
}

// Get file type category for grouping
export function getFileCategory(type: FileType): 'document' | 'spreadsheet' | 'image' | 'code' | 'archive' | 'other' {
  const categories: Record<FileType, 'document' | 'spreadsheet' | 'image' | 'code' | 'archive' | 'other'> = {
    csv: 'spreadsheet',
    xlsx: 'spreadsheet',
    xls: 'spreadsheet',
    pdf: 'document',
    docx: 'document',
    doc: 'document',
    txt: 'document',
    md: 'document',
    png: 'image',
    jpg: 'image',
    jpeg: 'image',
    gif: 'image',
    webp: 'image',
    svg: 'image',
    json: 'code',
    html: 'code',
    zip: 'archive',
    unknown: 'other',
  };

  return categories[type] || 'other';
}

// Format file size to human-readable string
export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 B';
  
  const units = ['B', 'KB', 'MB', 'GB', 'TB'];
  const k = 1024;
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(1))} ${units[i]}`;
}

// Format date for display
export function formatFileDate(dateString: string): string {
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffDays === 0) {
    return 'Today';
  } else if (diffDays === 1) {
    return 'Yesterday';
  } else if (diffDays < 7) {
    return `${diffDays} days ago`;
  } else if (diffDays < 30) {
    const weeks = Math.floor(diffDays / 7);
    return `${weeks} week${weeks > 1 ? 's' : ''} ago`;
  } else {
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: date.getFullYear() !== now.getFullYear() ? 'numeric' : undefined,
    });
  }
}

// Extract keywords from filename for auto-tagging
export function extractKeywords(filename: string): string[] {
  // Remove extension
  const nameWithoutExt = filename.replace(/\.[^/.]+$/, '');
  
  // Split by common separators
  const parts = nameWithoutExt
    .split(/[-_.\s]+/)
    .map(part => part.toLowerCase())
    .filter(part => part.length > 2); // Filter out very short parts

  // Common words to exclude
  const stopWords = ['the', 'and', 'for', 'with', 'from', 'this', 'that', 'file', 'doc', 'document'];
  
  return parts.filter(part => !stopWords.includes(part));
}

// Generate suggested tags based on file properties
export function suggestTags(file: UserFile): string[] {
  const suggestions: string[] = [];
  
  // Add category-based tag
  const category = getFileCategory(file.type);
  suggestions.push(category);
  
  // Add type-specific tags
  if (file.type === 'csv' || file.type === 'xlsx' || file.type === 'xls') {
    suggestions.push('data', 'spreadsheet');
  } else if (file.type === 'pdf' || file.type === 'docx' || file.type === 'doc') {
    suggestions.push('document');
  } else if (['png', 'jpg', 'jpeg', 'gif', 'webp', 'svg'].includes(file.type)) {
    suggestions.push('visual', 'media');
  }
  
  // Extract keywords from filename
  const keywords = extractKeywords(file.name);
  suggestions.push(...keywords);
  
  // Deduplicate and limit
  return [...new Set(suggestions)].slice(0, 8);
}

// Check if file is an image
export function isImageFile(type: FileType): boolean {
  return ['png', 'jpg', 'jpeg', 'gif', 'webp', 'svg'].includes(type);
}

// Check if file is previewable
export function isPreviewable(type: FileType): boolean {
  return isImageFile(type) || type === 'pdf' || type === 'txt' || type === 'md' || type === 'json';
}

// Generate a color for file type badge
export function getFileTypeColor(type: FileType): string {
  const colorMap: Record<string, string> = {
    csv: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30',
    xlsx: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30',
    xls: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30',
    pdf: 'bg-red-500/20 text-red-400 border-red-500/30',
    docx: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
    doc: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
    txt: 'bg-slate-500/20 text-slate-400 border-slate-500/30',
    md: 'bg-purple-500/20 text-purple-400 border-purple-500/30',
    png: 'bg-pink-500/20 text-pink-400 border-pink-500/30',
    jpg: 'bg-pink-500/20 text-pink-400 border-pink-500/30',
    jpeg: 'bg-pink-500/20 text-pink-400 border-pink-500/30',
    gif: 'bg-pink-500/20 text-pink-400 border-pink-500/30',
    webp: 'bg-pink-500/20 text-pink-400 border-pink-500/30',
    svg: 'bg-orange-500/20 text-orange-400 border-orange-500/30',
    json: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
    html: 'bg-cyan-500/20 text-cyan-400 border-cyan-500/30',
    zip: 'bg-amber-500/20 text-amber-400 border-amber-500/30',
    unknown: 'bg-muted text-muted-foreground border-border',
  };

  return colorMap[type] || colorMap.unknown;
}

// Sort files by various criteria
export function sortFiles(
  files: UserFile[],
  sortBy: 'name' | 'date' | 'size' | 'type' | 'relevance',
  order: 'asc' | 'desc' = 'asc'
): UserFile[] {
  const sorted = [...files].sort((a, b) => {
    let comparison = 0;

    switch (sortBy) {
      case 'name':
        comparison = a.name.localeCompare(b.name);
        break;
      case 'date':
        comparison = new Date(a.uploadedAt).getTime() - new Date(b.uploadedAt).getTime();
        break;
      case 'size':
        comparison = a.size - b.size;
        break;
      case 'type':
        comparison = a.type.localeCompare(b.type);
        break;
      case 'relevance':
        comparison = (b.relevanceScore || 0) - (a.relevanceScore || 0);
        break;
    }

    return order === 'asc' ? comparison : -comparison;
  });

  return sorted;
}

// Filter files by search query
export function filterFilesByQuery(files: UserFile[], query: string): UserFile[] {
  if (!query.trim()) return files;

  const lowerQuery = query.toLowerCase();

  return files.filter(file => {
    return (
      file.name.toLowerCase().includes(lowerQuery) ||
      file.tags.some(tag => tag.toLowerCase().includes(lowerQuery)) ||
      file.summary?.toLowerCase().includes(lowerQuery) ||
      file.type.toLowerCase().includes(lowerQuery)
    );
  });
}

// Get folder breadcrumb path
export function getFolderPath(
  folderId: string | null,
  folders: { id: string; name: string; parentId: string | null }[]
): { id: string; name: string }[] {
  if (!folderId) return [];

  const path: { id: string; name: string }[] = [];
  let currentId: string | null = folderId;

  while (currentId) {
    const folder = folders.find(f => f.id === currentId);
    if (folder) {
      path.unshift({ id: folder.id, name: folder.name });
      currentId = folder.parentId;
    } else {
      break;
    }
  }

  return path;
}
