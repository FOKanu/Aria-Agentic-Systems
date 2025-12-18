import { ListTodo, MessageSquare, FileText, Mic } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface QuickActionsProps {
  onAction: (action: string) => void;
  hasActiveTask?: boolean;
}

export function QuickActions({ onAction, hasActiveTask }: QuickActionsProps) {
  const actions = [
    { id: 'task', label: 'Assign as Task', icon: ListTodo },
    { id: 'followup', label: 'Ask Follow-up', icon: MessageSquare },
    { id: 'summary', label: 'Request Summary', icon: FileText },
    { id: 'voice', label: 'Switch to Voice', icon: Mic },
  ];

  // Filter based on context
  const visibleActions = hasActiveTask
    ? actions
    : actions.filter((a) => a.id !== 'followup');

  return (
    <div className="flex items-center gap-2 overflow-x-auto pb-2 px-4 -mx-4 scrollbar-thin">
      {visibleActions.map((action) => {
        const Icon = action.icon;
        return (
          <Button
            key={action.id}
            variant="outline"
            size="sm"
            className="flex-shrink-0 gap-2 rounded-full"
            onClick={() => onAction(action.id)}
          >
            <Icon className="w-4 h-4" />
            <span className="whitespace-nowrap">{action.label}</span>
          </Button>
        );
      })}
    </div>
  );
}
