// FileAccessRequest Component
// In-chat permission request from agents

import { 
  Shield, 
  FileText, 
  Check, 
  X,
  Clock,
  Lock
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Card, CardContent } from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useState } from 'react';
import { FileAccessRequest as FileAccessRequestType, PermissionScope, UserFile } from '../types';
import { getFileIcon, formatFileSize } from '../lib/fileUtils';
import { cn } from '@/lib/utils';

export interface FileAccessRequestProps {
  request: FileAccessRequestType;
  files: UserFile[];
  onApprove: (requestId: string, scope: PermissionScope) => void;
  onDeny: (requestId: string) => void;
  className?: string;
}

export function FileAccessRequest({
  request,
  files,
  onApprove,
  onDeny,
  className,
}: FileAccessRequestProps) {
  const [selectedScope, setSelectedScope] = useState<PermissionScope>(request.requestedScope);
  
  // Get files for this request
  const requestedFiles = files.filter(f => request.fileIds.includes(f.id));
  
  // If already responded, show status
  if (request.status !== 'pending') {
    return (
      <Card className={cn('border-l-4', 
        request.status === 'approved' && 'border-l-green-500',
        request.status === 'denied' && 'border-l-destructive',
        request.status === 'expired' && 'border-l-muted-foreground',
        className
      )}>
        <CardContent className="p-4">
          <div className="flex items-center gap-3">
            <Avatar className="h-10 w-10">
              <AvatarImage src={request.agentAvatar} />
              <AvatarFallback>{request.agentName.slice(0, 2)}</AvatarFallback>
            </Avatar>
            <div className="flex-1">
              <p className="text-sm">
                <span className="font-medium">{request.agentName}</span>
                {' '}requested access to{' '}
                <span className="font-medium">{requestedFiles.length} file{requestedFiles.length !== 1 ? 's' : ''}</span>
              </p>
              <p className="text-xs text-muted-foreground flex items-center gap-1 mt-0.5">
                {request.status === 'approved' && (
                  <>
                    <Check className="h-3 w-3 text-green-500" />
                    Approved
                  </>
                )}
                {request.status === 'denied' && (
                  <>
                    <X className="h-3 w-3 text-destructive" />
                    Denied
                  </>
                )}
                {request.status === 'expired' && (
                  <>
                    <Clock className="h-3 w-3" />
                    Expired
                  </>
                )}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }
  
  return (
    <Card className={cn('border-l-4 border-l-primary animate-fade-in', className)}>
      <CardContent className="p-4 space-y-4">
        {/* Agent Info */}
        <div className="flex items-start gap-3">
          <Avatar className="h-10 w-10 ring-2 ring-primary/20">
            <AvatarImage src={request.agentAvatar} />
            <AvatarFallback className="bg-primary/10 text-primary">
              {request.agentName.slice(0, 2)}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1">
            <div className="flex items-center gap-2">
              <span className="font-medium">{request.agentName}</span>
              <Badge variant="outline" className="text-xs">
                <Lock className="h-3 w-3 mr-1" />
                Access Request
              </Badge>
            </div>
            <p className="text-sm text-muted-foreground mt-1">
              {request.reason}
            </p>
          </div>
        </div>
        
        {/* Task Context */}
        {request.taskContext && (
          <div className="text-xs text-muted-foreground bg-muted/50 rounded-md p-2">
            <span className="font-medium">Task:</span> {request.taskContext}
          </div>
        )}
        
        {/* Requested Files */}
        <div className="space-y-2">
          <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
            Requested Files ({requestedFiles.length})
          </p>
          <div className="space-y-1">
            {requestedFiles.map((file) => {
              const Icon = getFileIcon(file.type);
              return (
                <div 
                  key={file.id}
                  className="flex items-center gap-2 p-2 rounded-md bg-muted/30"
                >
                  {file.thumbnail ? (
                    <img 
                      src={file.thumbnail} 
                      alt="" 
                      className="w-8 h-8 rounded object-cover"
                    />
                  ) : (
                    <div className="w-8 h-8 rounded bg-muted flex items-center justify-center">
                      <Icon className="h-4 w-4 text-muted-foreground" />
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm truncate">{file.name}</p>
                    <p className="text-xs text-muted-foreground">{formatFileSize(file.size)}</p>
                  </div>
                  <Badge variant="secondary" className="text-[10px]">
                    {file.type.toUpperCase()}
                  </Badge>
                </div>
              );
            })}
          </div>
        </div>
        
        {/* Scope Selection */}
        <div className="space-y-2">
          <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
            Access Duration
          </p>
          <Select value={selectedScope} onValueChange={(v) => setSelectedScope(v as PermissionScope)}>
            <SelectTrigger className="w-full">
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="bg-popover z-50">
              <SelectItem value="session">
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4" />
                  <span>This session only</span>
                </div>
              </SelectItem>
              <SelectItem value="task-scoped">
                <div className="flex items-center gap-2">
                  <FileText className="h-4 w-4" />
                  <span>Until task completes</span>
                </div>
              </SelectItem>
              <SelectItem value="permanent">
                <div className="flex items-center gap-2">
                  <Shield className="h-4 w-4" />
                  <span>Permanent access</span>
                </div>
              </SelectItem>
            </SelectContent>
          </Select>
        </div>
        
        {/* Actions */}
        <div className="flex gap-2">
          <Button 
            className="flex-1" 
            onClick={() => onApprove(request.id, selectedScope)}
          >
            <Check className="mr-2 h-4 w-4" />
            Approve
          </Button>
          <Button 
            variant="outline" 
            className="flex-1"
            onClick={() => onDeny(request.id)}
          >
            <X className="mr-2 h-4 w-4" />
            Deny
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

// Compact version for inline use
export function FileAccessRequestCompact({
  request,
  files,
  onApprove,
  onDeny,
}: FileAccessRequestProps) {
  const requestedFiles = files.filter(f => request.fileIds.includes(f.id));
  
  if (request.status !== 'pending') return null;
  
  return (
    <div className="flex items-center gap-3 p-3 rounded-lg bg-primary/5 border border-primary/20">
      <Avatar className="h-8 w-8">
        <AvatarImage src={request.agentAvatar} />
        <AvatarFallback>{request.agentName.slice(0, 2)}</AvatarFallback>
      </Avatar>
      <div className="flex-1 min-w-0">
        <p className="text-sm">
          <span className="font-medium">{request.agentName}</span>
          {' '}needs access to{' '}
          <span className="font-medium">{requestedFiles.length} file{requestedFiles.length !== 1 ? 's' : ''}</span>
        </p>
      </div>
      <div className="flex gap-1">
        <Button size="sm" onClick={() => onApprove(request.id, request.requestedScope)}>
          Allow
        </Button>
        <Button size="sm" variant="ghost" onClick={() => onDeny(request.id)}>
          Deny
        </Button>
      </div>
    </div>
  );
}
