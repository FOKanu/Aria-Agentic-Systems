import { Activity, Zap, Heart, ChevronRight } from 'lucide-react';
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
      {/* Header with Agent Quick View */}
      {selectedAgent && agentStats && (
        <div className="flex items-center justify-between">
          <button 
            onClick={onViewDetails}
            className="flex items-center gap-4 hover:bg-secondary/50 rounded-xl p-2 -ml-2 transition-colors group"
          >
            <div className={cn(
              "w-14 h-14 rounded-xl bg-gradient-to-br from-primary/30 to-accent/30 flex items-center justify-center border border-primary/30",
              selectedAgent.status === 'executing' && "glow-primary"
            )}>
              <span className="text-2xl">{selectedAgent.avatar}</span>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-display font-bold">{selectedAgent.name}</h2>
                <span className="text-xs px-2 py-0.5 rounded-full bg-gold/20 text-gold font-mono font-bold">
                  LVL {selectedAgent.level}
                </span>
              </div>
              <div className="flex items-center gap-3 text-sm text-muted-foreground">
                <span className="flex items-center gap-1">
                  <Zap className="w-3 h-3 text-gold" />
                  {agentStats.xp.toLocaleString()} XP
                </span>
                <span className="flex items-center gap-1">
                  <Heart className="w-3 h-3 text-destructive" />
                  {agentStats.health}%
                </span>
              </div>
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
        "glass-card rounded-xl p-4 flex items-center justify-between",
        agentState === 'executing' && "border-success/30",
        agentState === 'waiting' && "border-warning/30",
        agentState === 'error' && "border-destructive/30"
      )}>
        <div className="flex items-center gap-3">
          <div className={cn(
            "w-10 h-10 rounded-lg flex items-center justify-center",
            agentState === 'executing' ? "bg-success/20" :
            agentState === 'waiting' ? "bg-warning/20" :
            agentState === 'error' ? "bg-destructive/20" : "bg-muted"
          )}>
            <Activity className={cn(
              "w-5 h-5",
              agentState === 'executing' ? "text-success animate-pulse" :
              agentState === 'waiting' ? "text-warning" :
              agentState === 'error' ? "text-destructive" : "text-muted-foreground"
            )} />
          </div>
          <div>
            <p className="font-display font-semibold capitalize">{agentState}</p>
            <p className="text-xs text-muted-foreground">
              {agentState === 'executing' ? 'Processing mission...' :
               agentState === 'waiting' ? 'Awaiting input' :
               agentState === 'error' ? 'Error occurred' : 'Ready for tasks'}
            </p>
          </div>
        </div>
        
        <div className={cn(
          "px-3 py-1.5 rounded-full text-xs font-medium",
          agentState === 'executing' ? "bg-success/20 text-success" :
          agentState === 'waiting' ? "bg-warning/20 text-warning" :
          agentState === 'error' ? "bg-destructive/20 text-destructive" : "bg-muted text-muted-foreground"
        )}>
          {isPaused ? 'Paused' : 'Active'}
        </div>
      </div>

      {/* Current Mission */}
      <div className="glass-card rounded-xl p-5 space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wider font-display">
            Current Mission
          </h3>
          <span className="text-xs px-2 py-1 rounded-full bg-success/20 text-success font-medium">
            In Progress
          </span>
        </div>
        
        <div>
          <p className="font-display font-semibold text-lg mb-3">{mockActiveTask.name}</p>
          
          {/* Progress */}
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Progress</span>
              <span className="font-mono">{completedSteps}/{totalSteps} steps</span>
            </div>
            <div className="h-2.5 bg-secondary rounded-full overflow-hidden">
              <div 
                className="h-full bg-gradient-to-r from-primary to-accent transition-all duration-500 rounded-full"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>
        </div>

        {/* Current Step */}
        <div className="p-3 rounded-lg bg-secondary/50 border border-border">
          <p className="text-xs text-muted-foreground mb-1">Current Step</p>
          <p className="font-mono text-sm">
            {mockActiveTask.steps.find(s => s.status === 'running')?.plan || 'Waiting...'}
          </p>
        </div>

        {/* Quick Actions */}
        <div className="flex gap-2 pt-2">
          <Button 
            variant={isPaused ? "success" : "warning"} 
            size="sm"
            onClick={isPaused ? onResume : onPause}
            className="flex-1"
          >
            {isPaused ? 'Resume' : 'Pause'}
          </Button>
          <Button variant="control" size="sm" onClick={onApprove} className="flex-1">
            Approve Next
          </Button>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-3 gap-3">
        <div className="glass-card p-3 rounded-xl text-center">
          <p className="text-2xl font-mono font-bold text-primary">3</p>
          <p className="text-xs text-muted-foreground">Tasks Today</p>
        </div>
        <div className="glass-card p-3 rounded-xl text-center">
          <p className="text-2xl font-mono font-bold text-success">94%</p>
          <p className="text-xs text-muted-foreground">Success Rate</p>
        </div>
        <div className="glass-card p-3 rounded-xl text-center">
          <p className="text-2xl font-mono font-bold text-gold">+150</p>
          <p className="text-xs text-muted-foreground">XP Today</p>
        </div>
      </div>
    </div>
  );
}
