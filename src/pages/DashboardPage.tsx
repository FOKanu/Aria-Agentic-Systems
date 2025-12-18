import { Activity, ChevronRight, Clock, CheckCircle, TrendingUp } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { QuickActionsMenu } from '@/components/QuickActionsMenu';
import { AgentState } from '@/types/agent';
import { mockActiveTask } from '@/data/mockData';
import { Agent } from '@/components/AgentRail';
import { AgentStats } from '@/data/agentsData';
import { cn } from '@/lib/utils';

interface DashboardPageProps {
  agentState: AgentState;
  isPaused: boolean;
  onPause: () => void;
  onResume: () => void;
  onStop: () => void;
  onApprove: () => void;
  selectedAgent?: Agent;
  agentStats?: AgentStats;
  onViewDetails: () => void;
  onNewMission: () => void;
  onExportLogs: () => void;
}


export function DashboardPage({ 
  agentState, 
  isPaused, 
  onPause, 
  onResume, 
  onStop,
  onApprove, 
  selectedAgent,
  agentStats,
  onViewDetails,
  onNewMission,
  onExportLogs,
}: DashboardPageProps) {
  const completedSteps = mockActiveTask.steps.filter(s => s.status === 'completed').length;
  const totalSteps = mockActiveTask.steps.length;
  const progress = (completedSteps / totalSteps) * 100;

  return (
    <div className="space-y-6 animate-slide-up">
      {/* Header with Agent Info */}
      {selectedAgent && agentStats && (
        <div className="flex items-center justify-between">
          <button 
            onClick={onViewDetails}
            className="flex items-center gap-4 hover:bg-secondary/50 rounded-lg p-2 -ml-2 transition-colors group"
          >
            <div className="w-12 h-12 rounded-lg bg-secondary flex items-center justify-center border border-border">
              <span className="text-xl">{selectedAgent.avatar}</span>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-semibold">{selectedAgent.name}</h2>
                <span className="text-xs px-2 py-0.5 rounded bg-secondary text-muted-foreground">
                  {selectedAgent.title || selectedAgent.role}
                </span>
              </div>
              <p className="text-sm text-muted-foreground">
                {agentStats.tasksCompleted} tasks completed • {agentStats.successRate}% success rate
              </p>
            </div>
            <ChevronRight className="w-5 h-5 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
          </button>

          <QuickActionsMenu
            isPaused={isPaused}
            onPause={onPause}
            onResume={onResume}
            onStop={onStop}
            onApprove={onApprove}
            onViewDetails={onViewDetails}
            onNewMission={onNewMission}
            onExportLogs={onExportLogs}
          />
        </div>
      )}

      {/* Status Banner */}
      <div className={cn(
        "glass-card p-4 flex items-center justify-between",
        agentState === 'executing' && "border-success/30",
        agentState === 'waiting' && "border-warning/30",
        agentState === 'error' && "border-destructive/30"
      )}>
        <div className="flex items-center gap-3">
          <div className={cn(
            "w-10 h-10 rounded-lg flex items-center justify-center",
            agentState === 'executing' ? "bg-success/10" :
            agentState === 'waiting' ? "bg-warning/10" :
            agentState === 'error' ? "bg-destructive/10" : "bg-muted"
          )}>
            <Activity className={cn(
              "w-5 h-5",
              agentState === 'executing' ? "text-success" :
              agentState === 'waiting' ? "text-warning" :
              agentState === 'error' ? "text-destructive" : "text-muted-foreground"
            )} />
          </div>
          <div>
            <p className="font-medium capitalize">{agentState}</p>
            <p className="text-sm text-muted-foreground">
              {agentState === 'executing' ? 'Processing task...' :
               agentState === 'waiting' ? 'Awaiting input' :
               agentState === 'error' ? 'Error occurred' : 'Ready for tasks'}
            </p>
          </div>
        </div>
        
        <div className={cn(
          "px-3 py-1.5 rounded-md text-xs font-medium",
          agentState === 'executing' ? "bg-success/10 text-success" :
          agentState === 'waiting' ? "bg-warning/10 text-warning" :
          agentState === 'error' ? "bg-destructive/10 text-destructive" : "bg-muted text-muted-foreground"
        )}>
          {isPaused ? 'Paused' : 'Active'}
        </div>
      </div>

      {/* Current Task */}
      <div className="glass-card p-5 space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wider">
            Current Task
          </h3>
          <span className="text-xs px-2 py-1 rounded bg-success/10 text-success font-medium">
            In Progress
          </span>
        </div>
        
        <div>
          <p className="font-semibold text-lg mb-3">{mockActiveTask.name}</p>
          
          {/* Progress */}
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Progress</span>
              <span>{completedSteps}/{totalSteps} steps</span>
            </div>
            <div className="h-2 bg-secondary rounded-full overflow-hidden">
              <div 
                className="h-full bg-primary transition-all duration-500 rounded-full"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>
        </div>

        {/* Current Step */}
        <div className="p-3 rounded-lg bg-secondary/50 border border-border">
          <p className="text-xs text-muted-foreground mb-1">Current Step</p>
          <p className="text-sm">
            {mockActiveTask.steps.find(s => s.status === 'running')?.plan || 'Waiting...'}
          </p>
        </div>

        {/* Actions */}
        <div className="flex gap-2 pt-2">
          <Button 
            variant={isPaused ? "default" : "secondary"} 
            size="sm"
            onClick={isPaused ? onResume : onPause}
            className="flex-1"
          >
            {isPaused ? 'Resume' : 'Pause'}
          </Button>
          <Button variant="outline" size="sm" onClick={onApprove} className="flex-1">
            Approve Next
          </Button>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-3 gap-3">
        <div className="glass-card p-4 rounded-lg">
          <div className="flex items-center gap-2 text-muted-foreground mb-1">
            <CheckCircle className="w-4 h-4" />
            <span className="text-xs">Tasks Today</span>
          </div>
          <p className="text-2xl font-semibold">3</p>
        </div>
        <div className="glass-card p-4 rounded-lg">
          <div className="flex items-center gap-2 text-muted-foreground mb-1">
            <TrendingUp className="w-4 h-4" />
            <span className="text-xs">Success Rate</span>
          </div>
          <p className="text-2xl font-semibold text-success">94%</p>
        </div>
        <div className="glass-card p-4 rounded-lg">
          <div className="flex items-center gap-2 text-muted-foreground mb-1">
            <Clock className="w-4 h-4" />
            <span className="text-xs">Avg Time</span>
          </div>
          <p className="text-2xl font-semibold">2.4s</p>
        </div>
      </div>
    </div>
  );
}
