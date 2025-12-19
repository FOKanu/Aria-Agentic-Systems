// FileDetailSheet Component
// Detailed view and editing panel for files

import { useState } from 'react';
import { 
  Download, 
  Edit2, 
  Save, 
  Shield, 
  Tag, 
  Trash2, 
  X,
  Clock,
  FileText,
  Users
} from 'lucide-react';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { UserFile, FilePermission, AgentFileAccess, PermissionScope } from '../types';
import { getFileIcon, formatFileSize, getFileTypeColor } from '../lib/fileUtils';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';

export interface FileDetailSheetProps {
  file: UserFile | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  permissions?: FilePermission[];
  accessHistory?: AgentFileAccess[];
  agentInfo?: Record<string, { name: string; avatar?: string }>;
  onUpdateFile?: (file: UserFile, updates: Partial<UserFile>) => void;
  onDeleteFile?: (file: UserFile) => void;
  onDownloadFile?: (file: UserFile) => void;
  onGrantPermission?: (fileId: string, agentId: string, scope: PermissionScope) => void;
  onRevokePermission?: (permissionId: string) => void;
}

export function FileDetailSheet({
  file,
  open,
  onOpenChange,
  permissions = [],
  accessHistory = [],
  agentInfo = {},
  onUpdateFile,
  onDeleteFile,
  onDownloadFile,
  onGrantPermission,
  onRevokePermission,
}: FileDetailSheetProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editedName, setEditedName] = useState('');
  const [newTag, setNewTag] = useState('');
  
  if (!file) return null;
  
  const Icon = getFileIcon(file.type);
  const typeColor = getFileTypeColor(file.type);
  const filePermissions = permissions.filter(p => p.fileId === file.id);
  const fileAccessHistory = accessHistory.filter(a => a.fileId === file.id);
  
  const handleStartEdit = () => {
    setEditedName(file.name);
    setIsEditing(true);
  };
  
  const handleSaveEdit = () => {
    if (editedName.trim() && editedName !== file.name) {
      onUpdateFile?.(file, { name: editedName.trim() });
    }
    setIsEditing(false);
  };
  
  const handleAddTag = () => {
    if (newTag.trim() && !file.tags.includes(newTag.trim())) {
      onUpdateFile?.(file, { tags: [...file.tags, newTag.trim()] });
      setNewTag('');
    }
  };
  
  const handleRemoveTag = (tag: string) => {
    onUpdateFile?.(file, { tags: file.tags.filter(t => t !== tag) });
  };
  
  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-full sm:max-w-lg">
        <SheetHeader>
          <SheetTitle className="flex items-center gap-2">
            <Icon className="h-5 w-5" />
            File Details
          </SheetTitle>
        </SheetHeader>
        
        <ScrollArea className="h-[calc(100vh-8rem)] pr-4">
          <div className="space-y-6 py-4">
            {/* Preview Area */}
            <div className="aspect-video rounded-lg bg-muted/50 flex items-center justify-center overflow-hidden">
              {file.thumbnail ? (
                <img 
                  src={file.thumbnail} 
                  alt={file.name}
                  className="w-full h-full object-contain"
                />
              ) : (
                <Icon className="h-16 w-16 text-muted-foreground" />
              )}
            </div>
            
            {/* File Name */}
            <div className="space-y-2">
              <label className="text-sm font-medium flex items-center gap-2">
                <FileText className="h-4 w-4" />
                Name
              </label>
              {isEditing ? (
                <div className="flex gap-2">
                  <Input
                    value={editedName}
                    onChange={(e) => setEditedName(e.target.value)}
                    className="flex-1"
                  />
                  <Button size="icon" onClick={handleSaveEdit}>
                    <Save className="h-4 w-4" />
                  </Button>
                  <Button size="icon" variant="ghost" onClick={() => setIsEditing(false)}>
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <span className="flex-1 truncate">{file.name}</span>
                  <Button size="icon" variant="ghost" onClick={handleStartEdit}>
                    <Edit2 className="h-4 w-4" />
                  </Button>
                </div>
              )}
            </div>
            
            {/* Metadata */}
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-muted-foreground">Type</span>
                <div className="mt-1">
                  <Badge variant="secondary" className={typeColor}>
                    {file.type.toUpperCase()}
                  </Badge>
                </div>
              </div>
              <div>
                <span className="text-muted-foreground">Size</span>
                <p className="mt-1 font-medium">{formatFileSize(file.size)}</p>
              </div>
              <div>
                <span className="text-muted-foreground">Uploaded</span>
                <p className="mt-1">{format(new Date(file.uploadedAt), 'MMM d, yyyy h:mm a')}</p>
              </div>
              {file.analyzedAt && (
                <div>
                  <span className="text-muted-foreground">Analyzed</span>
                  <p className="mt-1">{format(new Date(file.analyzedAt), 'MMM d, yyyy')}</p>
                </div>
              )}
            </div>
            
            {/* Tags */}
            <div className="space-y-2">
              <label className="text-sm font-medium flex items-center gap-2">
                <Tag className="h-4 w-4" />
                Tags
              </label>
              <div className="flex flex-wrap gap-2">
                {file.tags.map((tag) => (
                  <Badge 
                    key={tag} 
                    variant="outline"
                    className="gap-1 cursor-pointer hover:bg-destructive/10"
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
                  className="flex-1"
                />
                <Button size="sm" onClick={handleAddTag}>Add</Button>
              </div>
            </div>
            
            <Separator />
            
            {/* Agent Access */}
            <div className="space-y-3">
              <label className="text-sm font-medium flex items-center gap-2">
                <Shield className="h-4 w-4" />
                Agent Access ({filePermissions.length})
              </label>
              
              {filePermissions.length === 0 ? (
                <p className="text-sm text-muted-foreground">No agents have access to this file.</p>
              ) : (
                <div className="space-y-2">
                  {filePermissions.map((permission) => {
                    const agent = agentInfo[permission.agentId];
                    return (
                      <div 
                        key={permission.id}
                        className="flex items-center justify-between p-2 rounded-lg bg-muted/50"
                      >
                        <div className="flex items-center gap-2">
                          <Avatar className="h-8 w-8">
                            <AvatarImage src={agent?.avatar} />
                            <AvatarFallback>
                              {agent?.name?.slice(0, 2) || permission.agentId.slice(0, 2)}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <p className="text-sm font-medium">{agent?.name || permission.agentId}</p>
                            <p className="text-xs text-muted-foreground capitalize">{permission.scope}</p>
                          </div>
                        </div>
                        <Button 
                          size="sm" 
                          variant="ghost"
                          className="text-destructive hover:text-destructive"
                          onClick={() => onRevokePermission?.(permission.id)}
                        >
                          Revoke
                        </Button>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
            
            {/* Access History */}
            {fileAccessHistory.length > 0 && (
              <>
                <Separator />
                <div className="space-y-3">
                  <label className="text-sm font-medium flex items-center gap-2">
                    <Clock className="h-4 w-4" />
                    Recent Activity
                  </label>
                  <div className="space-y-2">
                    {fileAccessHistory.slice(0, 5).map((access) => {
                      const agent = agentInfo[access.agentId];
                      return (
                        <div 
                          key={access.id}
                          className="flex items-center gap-2 text-sm"
                        >
                          <Avatar className="h-6 w-6">
                            <AvatarImage src={agent?.avatar} />
                            <AvatarFallback className="text-[10px]">
                              {agent?.name?.slice(0, 2) || access.agentId.slice(0, 2)}
                            </AvatarFallback>
                          </Avatar>
                          <span className="text-muted-foreground">
                            {agent?.name || access.agentId}
                          </span>
                          <span className="capitalize">{access.action}</span>
                          <span className="text-muted-foreground ml-auto text-xs">
                            {format(new Date(access.timestamp), 'MMM d, h:mm a')}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </>
            )}
            
            <Separator />
            
            {/* Actions */}
            <div className="flex gap-2">
              <Button className="flex-1" onClick={() => onDownloadFile?.(file)}>
                <Download className="mr-2 h-4 w-4" />
                Download
              </Button>
              <Button 
                variant="destructive" 
                onClick={() => {
                  onDeleteFile?.(file);
                  onOpenChange(false);
                }}
              >
                <Trash2 className="mr-2 h-4 w-4" />
                Delete
              </Button>
            </div>
          </div>
        </ScrollArea>
      </SheetContent>
    </Sheet>
  );
}
