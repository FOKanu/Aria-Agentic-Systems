// FileListItem Component
// List view row for files

import { 
  Download, 
  Eye, 
  MoreVertical, 
  Shield, 
  Trash2 
} from 'lucide-react';
import { Checkbox } from '@/components/ui/checkbox';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { UserFile, FilePermission } from '../types';
import { getFileIcon, formatFileSize, getFileTypeColor } from '../lib/fileUtils';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';

export interface FileListItemProps {
  file: UserFile;
  isSelected?: boolean;
  onSelect?: (fileId: string, selected: boolean) => void;
  onPreview?: (file: UserFile) => void;
  onDownload?: (file: UserFile) => void;
  onDelete?: (file: UserFile) => void;
  onManagePermissions?: (file: UserFile) => void;
  permissions?: FilePermission[];
  agentAvatars?: Record<string, string>;
}

export function FileListItem({
  file,
  isSelected = false,
  onSelect,
  onPreview,
  onDownload,
  onDelete,
  onManagePermissions,
  permissions = [],
  agentAvatars = {},
}: FileListItemProps) {
  const Icon = getFileIcon(file.type);
  const typeColor = getFileTypeColor(file.type);
  const agentsWithAccess = [...new Set(permissions.map(p => p.agentId))];
  
  return (
    <div
      className={cn(
        'flex items-center gap-4 px-4 py-3 hover:bg-muted/50 cursor-pointer transition-colors',
        isSelected && 'bg-primary/5'
      )}
      onClick={() => onPreview?.(file)}
    >
      {/* Selection */}
      {onSelect && (
        <div onClick={(e) => e.stopPropagation()}>
          <Checkbox
            checked={isSelected}
            onCheckedChange={(checked) => onSelect(file.id, !!checked)}
          />
        </div>
      )}
      
      {/* Icon */}
      <div className="flex-shrink-0">
        {file.thumbnail ? (
          <img 
            src={file.thumbnail} 
            alt={file.name}
            className="w-10 h-10 rounded object-cover"
          />
        ) : (
          <div className="w-10 h-10 rounded bg-muted flex items-center justify-center">
            <Icon className="h-5 w-5 text-muted-foreground" />
          </div>
        )}
      </div>
      
      {/* File Info */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <span className="font-medium truncate">{file.name}</span>
          <Badge variant="secondary" className={cn('text-[10px] shrink-0', typeColor)}>
            {file.type.toUpperCase()}
          </Badge>
        </div>
        <div className="flex items-center gap-3 text-xs text-muted-foreground mt-0.5">
          <span>{formatFileSize(file.size)}</span>
          <span>•</span>
          <span>{format(new Date(file.uploadedAt), 'MMM d, yyyy')}</span>
          {file.tags.length > 0 && (
            <>
              <span>•</span>
              <span>{file.tags.slice(0, 2).join(', ')}</span>
            </>
          )}
        </div>
      </div>
      
      {/* Agent Access */}
      {agentsWithAccess.length > 0 && (
        <div className="flex -space-x-1">
          {agentsWithAccess.slice(0, 3).map((agentId) => (
            <Avatar key={agentId} className="h-6 w-6 border-2 border-background">
              <AvatarImage src={agentAvatars[agentId]} />
              <AvatarFallback className="text-[10px]">
                {agentId.slice(0, 2).toUpperCase()}
              </AvatarFallback>
            </Avatar>
          ))}
          {agentsWithAccess.length > 3 && (
            <div className="h-6 w-6 rounded-full bg-muted flex items-center justify-center text-[10px] border-2 border-background">
              +{agentsWithAccess.length - 3}
            </div>
          )}
        </div>
      )}
      
      {/* Actions */}
      <div className="flex items-center gap-1" onClick={(e) => e.stopPropagation()}>
        <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => onPreview?.(file)}>
          <Eye className="h-4 w-4" />
        </Button>
        <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => onDownload?.(file)}>
          <Download className="h-4 w-4" />
        </Button>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="h-8 w-8">
              <MoreVertical className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="bg-popover z-50">
            <DropdownMenuItem onClick={() => onManagePermissions?.(file)}>
              <Shield className="mr-2 h-4 w-4" />
              Manage Access
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem 
              onClick={() => onDelete?.(file)}
              className="text-destructive focus:text-destructive"
            >
              <Trash2 className="mr-2 h-4 w-4" />
              Delete
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  );
}
