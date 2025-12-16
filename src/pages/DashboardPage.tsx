import { Pause, Play, CheckCircle, Activity, ListChecks, Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { StatusCard } from '@/components/StatusCard';
import { EventsFeed } from '@/components/EventsFeed';
import { AgentState, Task } from '@/types/agent';
import { mockEvents, mockActiveTask, mockTasks } from '@/data/mockData';

interface DashboardPageProps {
  agentState: AgentState;
  isPaused: boolean;
  onPause: () => void;
  onResume: () => void;
  onApprove: () => void;
}

export function DashboardPage({ agentState, isPaused, onPause, onResume, onApprove }: DashboardPageProps) {
  const completedSteps = mockActiveTask.steps.filter(s => s.status === 'completed').length;
  const totalSteps = mockActiveTask.steps.length;
  const completedTasks = mockTasks.filter(t => t.status === 'completed').length;

  return (
    <div className="space-y-4 animate-slide-up">
      {/* Agent Status */}
      <div className="grid grid-cols-2 gap-3">
        <StatusCard
          title="Agent Status"
          value={agentState.charAt(0).toUpperCase() + agentState.slice(1)}
          icon={Activity}
          status={agentState === 'executing' ? 'success' : agentState === 'error' ? 'error' : 'primary'}
        />
        <StatusCard
          title="Tasks Today"
          value={`${completedTasks}/${mockTasks.length}`}
          icon={ListChecks}
          status="default"
        />
      </div>

      {/* Active Task Card */}
      <div className="rounded-lg border border-primary/30 bg-primary/5 p-4 space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Active Task</h3>
          <span className="text-[10px] px-2 py-0.5 rounded-full bg-primary/20 text-primary font-medium">
            Running
          </span>
        </div>
        <p className="font-medium">{mockActiveTask.name}</p>
        
        {/* Progress */}
        <div className="space-y-1.5">
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>Progress</span>
            <span>{completedSteps}/{totalSteps} steps</span>
          </div>
          <div className="h-1.5 bg-secondary rounded-full overflow-hidden">
            <div 
              className="h-full bg-primary transition-all duration-500"
              style={{ width: `${(completedSteps / totalSteps) * 100}%` }}
            />
          </div>
        </div>

        {/* Current Step */}
        <div className="p-2 rounded bg-secondary/50 border border-border">
          <p className="text-xs text-muted-foreground mb-1">Current Step</p>
          <p className="text-sm font-mono">
            {mockActiveTask.steps.find(s => s.status === 'running')?.plan || 'Waiting...'}
          </p>
        </div>
      </div>

      {/* Quick Controls */}
      <div className="space-y-2">
        <h3 className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Quick Controls</h3>
        <div className="grid grid-cols-2 gap-2">
          {isPaused ? (
            <Button variant="success" onClick={onResume} className="gap-2">
              <Play className="w-4 h-4" />
              Resume
            </Button>
          ) : (
            <Button variant="warning" onClick={onPause} className="gap-2">
              <Pause className="w-4 h-4" />
              Pause
            </Button>
          )}
          <Button variant="control" onClick={onApprove} className="gap-2">
            <CheckCircle className="w-4 h-4" />
            Approve Next
          </Button>
        </div>
      </div>

      {/* Events Feed */}
      <EventsFeed events={mockEvents} />
    </div>
  );
}
