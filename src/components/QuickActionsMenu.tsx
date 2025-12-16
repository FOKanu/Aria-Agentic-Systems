import { useState } from 'react';
import { 
  MoreVertical, Pause, Play, CheckCircle, StopCircle, 
  Settings, User, Target, FileText, RefreshCw, LogOut
} from 'lucide-react';
import { cn } from '@/lib/utils';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';

interface QuickActionsMenuProps {
  isPaused: boolean;
  onPause: () => void;
  onResume: () => void;
  onStop: () => void;
  onApprove: () => void;
  onViewDetails: () => void;
  onNewMission: () => void;
  onExportLogs: () => void;
}

export function QuickActionsMenu({
  isPaused,
  onPause,
  onResume,
  onStop,
  onApprove,
  onViewDetails,
  onNewMission,
  onExportLogs,
}: QuickActionsMenuProps) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="icon" className="h-9 w-9">
          <MoreVertical className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent 
        align="end" 
        className="w-56 bg-card border-border z-50"
      >
        <DropdownMenuLabel className="font-display">Quick Actions</DropdownMenuLabel>
        <DropdownMenuSeparator />
        
        {/* Control Actions */}
        <DropdownMenuItem 
          onClick={isPaused ? onResume : onPause}
          className="cursor-pointer"
        >
          {isPaused ? (
            <>
              <Play className="mr-2 h-4 w-4 text-success" />
              <span>Resume Agent</span>
            </>
          ) : (
            <>
              <Pause className="mr-2 h-4 w-4 text-warning" />
              <span>Pause Agent</span>
            </>
          )}
        </DropdownMenuItem>
        
        <DropdownMenuItem onClick={onApprove} className="cursor-pointer">
          <CheckCircle className="mr-2 h-4 w-4 text-primary" />
          <span>Approve Next Action</span>
        </DropdownMenuItem>
        
        <DropdownMenuItem onClick={onStop} className="cursor-pointer text-destructive focus:text-destructive">
          <StopCircle className="mr-2 h-4 w-4" />
          <span>Emergency Stop</span>
        </DropdownMenuItem>
        
        <DropdownMenuSeparator />
        
        {/* Navigation Actions */}
        <DropdownMenuItem onClick={onViewDetails} className="cursor-pointer">
          <User className="mr-2 h-4 w-4" />
          <span>Agent Details</span>
        </DropdownMenuItem>
        
        <DropdownMenuItem onClick={onNewMission} className="cursor-pointer">
          <Target className="mr-2 h-4 w-4" />
          <span>New Mission</span>
        </DropdownMenuItem>
        
        <DropdownMenuSeparator />
        
        {/* Utility Actions */}
        <DropdownMenuItem onClick={onExportLogs} className="cursor-pointer">
          <FileText className="mr-2 h-4 w-4" />
          <span>Export Logs</span>
        </DropdownMenuItem>
        
        <DropdownMenuItem className="cursor-pointer">
          <RefreshCw className="mr-2 h-4 w-4" />
          <span>Refresh Status</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
