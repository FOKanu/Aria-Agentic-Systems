// FileUploadDialog Component
// Drag-and-drop file upload interface

import { useState, useCallback, useRef } from 'react';
import { 
  Upload, 
  X, 
  FileText, 
  Image, 
  FileSpreadsheet,
  File,
  Check,
  AlertCircle
} from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { ScrollArea } from '@/components/ui/scroll-area';
import { FileFolder, FileUploadProgress } from '../types';
import { getFileTypeFromExtension, formatFileSize } from '../lib/fileUtils';
import { cn } from '@/lib/utils';

export interface FileUploadDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  folders: FileFolder[];
  onUpload: (files: File[], folderId: string | null, tags: string[]) => void;
}

interface PendingFile {
  id: string;
  file: File;
  preview?: string;
  status: 'pending' | 'uploading' | 'complete' | 'error';
  progress: number;
  error?: string;
}

export function FileUploadDialog({
  open,
  onOpenChange,
  folders,
  onUpload,
}: FileUploadDialogProps) {
  const [pendingFiles, setPendingFiles] = useState<PendingFile[]>([]);
  const [selectedFolder, setSelectedFolder] = useState<string | null>(null);
  const [tags, setTags] = useState<string[]>([]);
  const [newTag, setNewTag] = useState('');
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  // Handle file selection
  const handleFileSelect = useCallback((files: FileList | null) => {
    if (!files) return;
    
    const newPendingFiles: PendingFile[] = Array.from(files).map((file) => {
      const id = `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
      let preview: string | undefined;
      
      // Create preview for images
      if (file.type.startsWith('image/')) {
        preview = URL.createObjectURL(file);
      }
      
      return {
        id,
        file,
        preview,
        status: 'pending',
        progress: 0,
      };
    });
    
    setPendingFiles(prev => [...prev, ...newPendingFiles]);
  }, []);
  
  // Handle drag events
  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);
  
  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);
  
  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    handleFileSelect(e.dataTransfer.files);
  }, [handleFileSelect]);
  
  // Remove pending file
  const removePendingFile = (id: string) => {
    setPendingFiles(prev => {
      const file = prev.find(f => f.id === id);
      if (file?.preview) {
        URL.revokeObjectURL(file.preview);
      }
      return prev.filter(f => f.id !== id);
    });
  };
  
  // Add tag
  const handleAddTag = () => {
    if (newTag.trim() && !tags.includes(newTag.trim())) {
      setTags(prev => [...prev, newTag.trim()]);
      setNewTag('');
    }
  };
  
  // Remove tag
  const handleRemoveTag = (tag: string) => {
    setTags(prev => prev.filter(t => t !== tag));
  };
  
  // Handle upload
  const handleUpload = () => {
    const files = pendingFiles.map(pf => pf.file);
    onUpload(files, selectedFolder, tags);
    
    // Clean up previews
    pendingFiles.forEach(pf => {
      if (pf.preview) URL.revokeObjectURL(pf.preview);
    });
    
    // Reset state
    setPendingFiles([]);
    setSelectedFolder(null);
    setTags([]);
    onOpenChange(false);
  };
  
  // Get icon for file type
  const getFileIcon = (file: File) => {
    const type = getFileTypeFromExtension(file.name);
    if (type.startsWith('image') || ['png', 'jpg', 'jpeg', 'gif', 'webp', 'svg'].includes(type)) {
      return Image;
    }
    if (['xlsx', 'xls', 'csv'].includes(type)) {
      return FileSpreadsheet;
    }
    if (['pdf', 'docx', 'doc', 'txt', 'md'].includes(type)) {
      return FileText;
    }
    return File;
  };
  
  // Reset on close
  const handleClose = (isOpen: boolean) => {
    if (!isOpen) {
      pendingFiles.forEach(pf => {
        if (pf.preview) URL.revokeObjectURL(pf.preview);
      });
      setPendingFiles([]);
      setSelectedFolder(null);
      setTags([]);
    }
    onOpenChange(isOpen);
  };
  
  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Upload Files</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          {/* Drop Zone */}
          <div
            className={cn(
              'border-2 border-dashed rounded-lg p-8 text-center transition-colors',
              'hover:border-primary/50 hover:bg-primary/5',
              isDragging && 'border-primary bg-primary/10'
            )}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
          >
            <input
              ref={fileInputRef}
              type="file"
              multiple
              className="hidden"
              onChange={(e) => handleFileSelect(e.target.files)}
            />
            <Upload className="h-10 w-10 mx-auto mb-4 text-muted-foreground" />
            <p className="text-sm font-medium">
              Drop files here or click to browse
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              Supports images, documents, spreadsheets, and more
            </p>
          </div>
          
          {/* Pending Files */}
          {pendingFiles.length > 0 && (
            <ScrollArea className="h-48 border rounded-lg">
              <div className="p-2 space-y-2">
                {pendingFiles.map((pf) => {
                  const Icon = getFileIcon(pf.file);
                  return (
                    <div 
                      key={pf.id}
                      className="flex items-center gap-3 p-2 rounded-lg bg-muted/50"
                    >
                      {pf.preview ? (
                        <img 
                          src={pf.preview} 
                          alt="" 
                          className="w-10 h-10 rounded object-cover"
                        />
                      ) : (
                        <div className="w-10 h-10 rounded bg-muted flex items-center justify-center">
                          <Icon className="h-5 w-5 text-muted-foreground" />
                        </div>
                      )}
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">{pf.file.name}</p>
                        <p className="text-xs text-muted-foreground">
                          {formatFileSize(pf.file.size)}
                        </p>
                        {pf.status === 'uploading' && (
                          <Progress value={pf.progress} className="h-1 mt-1" />
                        )}
                      </div>
                      {pf.status === 'complete' && (
                        <Check className="h-5 w-5 text-green-500" />
                      )}
                      {pf.status === 'error' && (
                        <AlertCircle className="h-5 w-5 text-destructive" />
                      )}
                      {pf.status === 'pending' && (
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8"
                          onClick={() => removePendingFile(pf.id)}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  );
                })}
              </div>
            </ScrollArea>
          )}
          
          {/* Folder Selection */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Destination Folder</label>
            <Select 
              value={selectedFolder || 'root'} 
              onValueChange={(v) => setSelectedFolder(v === 'root' ? null : v)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select folder" />
              </SelectTrigger>
              <SelectContent className="bg-popover z-50">
                <SelectItem value="root">Root (No folder)</SelectItem>
                {folders.map((folder) => (
                  <SelectItem key={folder.id} value={folder.id}>
                    {folder.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          {/* Tags */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Tags (optional)</label>
            <div className="flex flex-wrap gap-2 mb-2">
              {tags.map((tag) => (
                <Badge 
                  key={tag} 
                  variant="secondary"
                  className="gap-1 cursor-pointer"
                  onClick={() => handleRemoveTag(tag)}
                >
                  {tag}
                  <X className="h-3 w-3" />
                </Badge>
              ))}
            </div>
            <div className="flex gap-2">
              <Input
                placeholder="Add tag..."
                value={newTag}
                onChange={(e) => setNewTag(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleAddTag()}
              />
              <Button variant="outline" onClick={handleAddTag}>Add</Button>
            </div>
          </div>
        </div>
        
        <DialogFooter>
          <Button variant="outline" onClick={() => handleClose(false)}>
            Cancel
          </Button>
          <Button 
            onClick={handleUpload}
            disabled={pendingFiles.length === 0}
          >
            Upload {pendingFiles.length > 0 && `(${pendingFiles.length})`}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
