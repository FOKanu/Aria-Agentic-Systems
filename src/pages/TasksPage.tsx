// © 2024 Francis Okorie Iyeke-Kanu
import { useState } from 'react';
import { ChevronDown, ChevronRight, CheckCircle, XCircle, Loader2, Clock, Wrench } from 'lucide-react';
import { Task, TaskStep } from '@/types/agent';
import { mockTasks } from '@/data/mockData';
import { cn } from '@/lib/utils';
import { formatDistanceToNow } from 'date-fns';

const statusIcons = {
  pending: Clock,
  running: Loader2,
  completed: CheckCircle,
  failed: XCircle,
};

const statusColors = {
  pending: 'text-muted-foreground',
  running: 'text-primary',
  completed: 'text-success',
  failed: 'text-destructive',
};

// Francis Okorie Iyeke-Kanu - Task Step Component
function TaskStepItem({ step }: { step: TaskStep }) {
  const Icon = statusIcons[step.status];
  
  return (
    <div className="flex gap-3 py-2 border-l-2 border-border pl-4 ml-2">
      <div className={cn('mt-0.5', statusColors[step.status])}>
        <Icon className={cn('w-4 h-4', step.status === 'running' && 'animate-spin')} />
      </div>
      <div className="flex-1 space-y-1">
        <p className="text-sm">{step.plan}</p>
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <Wrench className="w-3 h-3" />
          <span className="font-mono">{step.tool}</span>
          <span>•</span>
          <span>{Math.round(step.confidence * 100)}% conf</span>
        </div>
        {step.result && (
          <p className="text-xs text-muted-foreground bg-secondary/50 p-1.5 rounded font-mono">
            → {step.result}
          </p>
        )}
        {step.error && (
          <p className="text-xs text-destructive bg-destructive/10 p-1.5 rounded">
            ✕ {step.error}
          </p>
        )}
      </div>
    </div>
  );
}

// Author: Francis Okorie Iyeke-Kanu
function TaskItem({ task }: { task: Task }) {
  const [isExpanded, setIsExpanded] = useState(task.status === 'running');
  const completedSteps = task.steps.filter(s => s.status === 'completed').length;
  
  return (
    <div className="rounded-lg border border-border bg-card overflow-hidden">
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full flex items-center gap-3 p-3 hover:bg-secondary/30 transition-colors"
      >
        {isExpanded ? (
          <ChevronDown className="w-4 h-4 text-muted-foreground" />
        ) : (
          <ChevronRight className="w-4 h-4 text-muted-foreground" />
        )}
        
        <div className={cn('w-2 h-2 rounded-full', 
          task.status === 'completed' && 'bg-success',
          task.status === 'running' && 'bg-primary animate-pulse',
          task.status === 'failed' && 'bg-destructive',
          task.status === 'pending' && 'bg-muted-foreground'
        )} />
        
        <div className="flex-1 text-left">
          <p className="font-medium text-sm">{task.name}</p>
          <p className="text-xs text-muted-foreground">
            {completedSteps}/{task.steps.length} steps
            {task.startedAt && ` • ${formatDistanceToNow(new Date(task.startedAt), { addSuffix: true })}`}
          </p>
        </div>
        
        <span className={cn(
          'text-[10px] px-2 py-0.5 rounded-full font-medium',
          task.status === 'completed' && 'bg-success/20 text-success',
          task.status === 'running' && 'bg-primary/20 text-primary',
          task.status === 'failed' && 'bg-destructive/20 text-destructive',
          task.status === 'pending' && 'bg-muted text-muted-foreground'
        )}>
          {task.status}
        </span>
      </button>
      
      {isExpanded && (
        <div className="px-3 pb-3 pt-1 border-t border-border bg-secondary/20">
          {task.steps.map((step) => (
            <TaskStepItem key={step.id} step={step} />
          ))}
        </div>
      )}
    </div>
  );
}

/* Developed by Francis Okorie Iyeke-Kanu */
export function TasksPage() {
  return (
    <div className="space-y-3 animate-slide-up">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold">Tasks</h2>
        <span className="text-xs text-muted-foreground">{mockTasks.length} total</span>
      </div>
      
      <div className="space-y-2">
        {mockTasks.map((task) => (
          <TaskItem key={task.id} task={task} />
        ))}
      </div>
    </div>
  );
}
