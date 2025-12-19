// FileCard Component
// Displays a file with thumbnail, metadata, and actions

import { useState } from 'react';
import { 
  Download, 
  Eye, 
  MoreVertical, 
  Shield, 
  Trash2,
  Users
} from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { UserFile, FilePermission } from '../types';
import { getFileIcon, formatFileSize, getFileTypeColor } from '../lib/fileUtils';
import { cn } from '@/lib/utils';

export interface FileCardProps {
  file: UserFile;
  isSelected?: boolean;
  onSelect?: (fileId: string, selected: boolean) => void;
  onPreview?: (file: UserFile) => void;
  onDownload?: (file: UserFile) => void;
  onDelete?: (file: UserFile) => void;
  onManagePermissions?: (file: UserFile) => void;
  permissions?: FilePermission[];
  agentAvatars?: Record<string, string>;
  className?: string;
}

export function FileCard({
  file,
  isSelected = false,
  onSelect,
  onPreview,
  onDownload,
  onDelete,
  onManagePermissions,
  permissions = [],
  agentAvatars = {},
  className,
}: FileCardProps) {
  const [isHovered, setIsHovered] = useState(false);
  const Icon = getFileIcon(file.type);
  const typeColor = getFileTypeColor(file.type);
  
  // Get unique agent IDs with access
  const agentsWithAccess = [...new Set(permissions.map(p => p.agentId))];
  
  return (
    <Card
      className={cn(
        'group relative transition-all duration-200 cursor-pointer',
        'hover:shadow-lg hover:border-primary/30',
        isSelected && 'ring-2 ring-primary border-primary',
        className
      )}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={() => onPreview?.(file)}
    >
      {/* Selection Checkbox */}
      {onSelect && (
        <div 
          className={cn(
            'absolute top-2 left-2 z-10 transition-opacity',
            isHovered || isSelected ? 'opacity-100' : 'opacity-0'
          )}
          onClick={(e) => e.stopPropagation()}
        >
          <Checkbox
            checked={isSelected}
            onCheckedChange={(checked) => onSelect(file.id, !!checked)}
            className="bg-background/80 backdrop-blur-sm"
          />
        </div>
      )}
      
      {/* Actions Menu */}
      <div 
        className={cn(
          'absolute top-2 right-2 z-10 transition-opacity',
          isHovered ? 'opacity-100' : 'opacity-0'
        )}
        onClick={(e) => e.stopPropagation()}
      >
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="h-8 w-8 bg-background/80 backdrop-blur-sm">
              <MoreVertical className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="bg-popover z-50">
            <DropdownMenuItem onClick={() => onPreview?.(file)}>
              <Eye className="mr-2 h-4 w-4" />
              Preview
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => onDownload?.(file)}>
              <Download className="mr-2 h-4 w-4" />
              Download
            </DropdownMenuItem>
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
      
      <CardContent className="p-4">
        {/* Thumbnail/Icon Area */}
        <div className="relative aspect-square mb-3 rounded-lg bg-muted/50 flex items-center justify-center overflow-hidden">
          {file.thumbnail ? (
            <img 
              src={file.thumbnail} 
              alt={file.name}
              className="w-full h-full object-cover"
            />
          ) : (
            <Icon className="h-12 w-12 text-muted-foreground" />
          )}
          
          {/* Type Badge */}
          <Badge 
            variant="secondary" 
            className={cn('absolute bottom-2 right-2 text-xs', typeColor)}
          >
            {file.type.toUpperCase()}
          </Badge>
        </div>
        
        {/* File Info */}
        <div className="space-y-1">
          <h3 className="font-medium text-sm truncate" title={file.name}>
            {file.name}
          </h3>
          <p className="text-xs text-muted-foreground">
            {formatFileSize(file.size)}
          </p>
        </div>
        
        {/* Agent Access Indicators */}
        {agentsWithAccess.length > 0 && (
          <div className="mt-3 flex items-center gap-1">
            <Tooltip>
              <TooltipTrigger asChild>
                <div className="flex items-center">
                  <Users className="h-3 w-3 text-muted-foreground mr-1" />
                  <div className="flex -space-x-1">
                    {agentsWithAccess.slice(0, 3).map((agentId) => (
                      <Avatar key={agentId} className="h-5 w-5 border border-background">
                        <AvatarImage src={agentAvatars[agentId]} />
                        <AvatarFallback className="text-[8px]">
                          {agentId.slice(0, 2).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                    ))}
                    {agentsWithAccess.length > 3 && (
                      <div className="h-5 w-5 rounded-full bg-muted flex items-center justify-center text-[8px] border border-background">
                        +{agentsWithAccess.length - 3}
                      </div>
                    )}
                  </div>
                </div>
              </TooltipTrigger>
              <TooltipContent>
                {agentsWithAccess.length} agent{agentsWithAccess.length !== 1 ? 's' : ''} with access
              </TooltipContent>
            </Tooltip>
          </div>
        )}
        
        {/* Tags */}
        {file.tags.length > 0 && (
          <div className="mt-2 flex flex-wrap gap-1">
            {file.tags.slice(0, 2).map((tag) => (
              <Badge key={tag} variant="outline" className="text-[10px] px-1.5 py-0">
                {tag}
              </Badge>
            ))}
            {file.tags.length > 2 && (
              <Badge variant="outline" className="text-[10px] px-1.5 py-0">
                +{file.tags.length - 2}
              </Badge>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
