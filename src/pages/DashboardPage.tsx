import { Pause, Play, CheckCircle, Activity, ListChecks } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { StatusCard } from '@/components/StatusCard';
import { EventsFeed } from '@/components/EventsFeed';
import { AgentProfile } from '@/components/AgentProfile';
import { AgentState } from '@/types/agent';
import { mockEvents, mockActiveTask, mockTasks } from '@/data/mockData';
import { mockAgentStats } from '@/data/agentsData';
import { Agent } from '@/components/AgentRail';

interface DashboardPageProps {
  agentState: AgentState;
  isPaused: boolean;
  onPause: () => void;
  onResume: () => void;
  onApprove: () => void;
  selectedAgent?: Agent;
}

export function DashboardPage({ agentState, isPaused, onPause, onResume, onApprove, selectedAgent }: DashboardPageProps) {
  const completedSteps = mockActiveTask.steps.filter(s => s.status === 'completed').length;
  const totalSteps = mockActiveTask.steps.length;
  const completedTasks = mockTasks.filter(t => t.status === 'completed').length;
  const stats = selectedAgent ? mockAgentStats[selectedAgent.id] : null;

  return (
    <div className="space-y-4 animate-slide-up">
      {/* Agent Profile - Phase 2 */}
      {selectedAgent && stats && (
        <AgentProfile agent={selectedAgent} stats={stats} />
      )}

      {/* Active Task Card */}
      <div className="glass-card rounded-xl p-4 space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-xs font-medium text-muted-foreground uppercase tracking-wider font-display">Current Mission</h3>
          <span className="text-[10px] px-2 py-0.5 rounded-full bg-success/20 text-success font-medium">
            Running
          </span>
        </div>
        <p className="font-medium font-display">{mockActiveTask.name}</p>
        
        <div className="space-y-1.5">
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>Progress</span>
            <span className="font-mono">{completedSteps}/{totalSteps} steps</span>
          </div>
          <div className="h-2 bg-secondary rounded-full overflow-hidden">
            <div 
              className="h-full bg-gradient-to-r from-primary to-accent transition-all duration-500"
              style={{ width: `${(completedSteps / totalSteps) * 100}%` }}
            />
          </div>
        </div>

        <div className="p-2 rounded-lg bg-secondary/50 border border-border">
          <p className="text-xs text-muted-foreground mb-1">Current Step</p>
          <p className="text-sm font-mono">
            {mockActiveTask.steps.find(s => s.status === 'running')?.plan || 'Waiting...'}
          </p>
        </div>
      </div>

      {/* Quick Controls */}
      <div className="space-y-2">
        <h3 className="text-xs font-medium text-muted-foreground uppercase tracking-wider font-display">Quick Controls</h3>
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
