import { useState } from 'react';
import { Pause, Play, Square, Trash2, MoreHorizontal, CheckSquare, XSquare } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { cn } from '@/lib/utils';

interface BulkActionsBarProps {
  selectedCount: number;
  totalCount: number;
  onSelectAll: () => void;
  onDeselectAll: () => void;
  onPauseSelected?: () => void;
  onResumeSelected?: () => void;
  onStopSelected?: () => void;
  onDeleteSelected?: () => void;
  customActions?: Array<{
    label: string;
    icon: React.ReactNode;
    onClick: () => void;
    variant?: 'default' | 'destructive';
  }>;
  className?: string;
}

export function BulkActionsBar({
  selectedCount,
  totalCount,
  onSelectAll,
  onDeselectAll,
  onPauseSelected,
  onResumeSelected,
  onStopSelected,
  onDeleteSelected,
  customActions,
  className,
}: BulkActionsBarProps) {
  if (selectedCount === 0) return null;

  return (
    <div className={cn(
      "flex items-center gap-3 px-4 py-2 rounded-lg bg-primary/10 border border-primary/20",
      className
    )}>
      <div className="flex items-center gap-2">
        <span className="text-sm font-medium">
          {selectedCount} of {totalCount} selected
        </span>
        <Button
          variant="ghost"
          size="sm"
          className="h-7 text-xs"
          onClick={selectedCount === totalCount ? onDeselectAll : onSelectAll}
        >
          {selectedCount === totalCount ? (
            <>
              <XSquare className="h-3.5 w-3.5 mr-1" />
              Deselect All
            </>
          ) : (
            <>
              <CheckSquare className="h-3.5 w-3.5 mr-1" />
              Select All
            </>
          )}
        </Button>
      </div>

      <div className="h-4 w-px bg-border" />

      <div className="flex items-center gap-1">
        {onPauseSelected && (
          <Button variant="outline" size="sm" className="h-7" onClick={onPauseSelected}>
            <Pause className="h-3.5 w-3.5 mr-1" />
            Pause
          </Button>
        )}
        {onResumeSelected && (
          <Button variant="outline" size="sm" className="h-7" onClick={onResumeSelected}>
            <Play className="h-3.5 w-3.5 mr-1" />
            Resume
          </Button>
        )}
        {onStopSelected && (
          <Button variant="outline" size="sm" className="h-7 text-destructive hover:text-destructive" onClick={onStopSelected}>
            <Square className="h-3.5 w-3.5 mr-1" />
            Stop
          </Button>
        )}
        {onDeleteSelected && (
          <Button variant="outline" size="sm" className="h-7 text-destructive hover:text-destructive" onClick={onDeleteSelected}>
            <Trash2 className="h-3.5 w-3.5 mr-1" />
            Delete
          </Button>
        )}

        {customActions && customActions.length > 0 && (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm" className="h-7">
                <MoreHorizontal className="h-3.5 w-3.5" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="bg-popover border border-border">
              {customActions.map((action, i) => (
                <DropdownMenuItem
                  key={i}
                  onClick={action.onClick}
                  className={cn(
                    action.variant === 'destructive' && "text-destructive focus:text-destructive"
                  )}
                >
                  {action.icon}
                  <span className="ml-2">{action.label}</span>
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        )}
      </div>

      <Button
        variant="ghost"
        size="sm"
        className="h-7 ml-auto"
        onClick={onDeselectAll}
      >
        Cancel
      </Button>
    </div>
  );
}

// Hook for managing selection state
export function useSelectionState<T extends string>(items: T[]) {
  const [selectedIds, setSelectedIds] = useState<Set<T>>(new Set());

  const toggle = (id: T) => {
    setSelectedIds(prev => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  const selectAll = () => setSelectedIds(new Set(items));
  const deselectAll = () => setSelectedIds(new Set());
  const isSelected = (id: T) => selectedIds.has(id);

  return {
    selectedIds: Array.from(selectedIds),
    selectedCount: selectedIds.size,
    toggle,
    selectAll,
    deselectAll,
    isSelected,
  };
}
