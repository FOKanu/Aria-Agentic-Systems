import { Agent } from '@/components/AgentRail';
import { AgentStats } from '@/data/agentsData';
import { CheckCircle, Clock, TrendingUp, Activity, Cpu } from 'lucide-react';
import { cn } from '@/lib/utils';

interface AgentProfileProps {
  agent: Agent;
  stats: AgentStats;
}

const typeLabels: Record<Agent['type'], string> = {
  assistant: 'Assistant',
  developer: 'Developer',
  researcher: 'Researcher',
};

export function AgentProfile({ agent, stats }: AgentProfileProps) {
  return (
    <div className="glass-card p-4 rounded-lg space-y-4 animate-slide-up">
      {/* Header with Avatar */}
      <div className="flex items-center gap-4">
        <div className={cn(
          "relative w-16 h-16 rounded-lg bg-secondary flex items-center justify-center",
          "border border-border"
        )}>
          <span className="text-3xl">{agent.avatar}</span>
          
          {/* Status indicator */}
          <div className={cn(
            "absolute -bottom-1 -right-1 w-5 h-5 rounded-full flex items-center justify-center",
            "bg-card border-2",
            agent.status === 'executing' ? "border-success" : 
            agent.status === 'thinking' ? "border-primary" :
            agent.status === 'waiting' ? "border-warning" :
            agent.status === 'error' ? "border-destructive" : "border-muted"
          )}>
            <Cpu className={cn(
              "w-2.5 h-2.5",
              agent.status === 'executing' && "text-success",
              agent.status === 'thinking' && "text-primary",
              agent.status === 'waiting' && "text-warning",
              agent.status === 'error' && "text-destructive",
              agent.status === 'idle' && "text-muted-foreground"
            )} />
          </div>
        </div>

        {/* Name and Type */}
        <div className="flex-1">
          <h2 className="text-lg font-semibold">{agent.name}</h2>
          <p className="text-sm text-muted-foreground">
            {typeLabels[agent.type]}
          </p>
          
          {/* Status text */}
          <p className={cn(
            "text-xs font-medium mt-1 capitalize",
            agent.status === 'executing' && "text-success",
            agent.status === 'thinking' && "text-primary",
            agent.status === 'waiting' && "text-warning",
            agent.status === 'error' && "text-destructive",
            agent.status === 'idle' && "text-muted-foreground"
          )}>
            {agent.status === 'executing' ? 'Active' :
             agent.status === 'thinking' ? 'Processing...' :
             agent.status === 'waiting' ? 'Awaiting Input' :
             agent.status === 'error' ? 'Error' :
             agent.status === 'stunned' ? 'Offline' : 'Idle'}
          </p>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 gap-3">
        <div className="p-3 rounded-lg bg-secondary/50">
          <div className="flex items-center gap-2 text-muted-foreground mb-1">
            <CheckCircle className="w-3.5 h-3.5" />
            <span className="text-xs">Tasks</span>
          </div>
          <p className="text-lg font-semibold">{stats.tasksCompleted}</p>
        </div>
        
        <div className="p-3 rounded-lg bg-secondary/50">
          <div className="flex items-center gap-2 text-muted-foreground mb-1">
            <TrendingUp className="w-3.5 h-3.5" />
            <span className="text-xs">Success</span>
          </div>
          <p className="text-lg font-semibold text-success">{stats.successRate}%</p>
        </div>
        
        <div className="p-3 rounded-lg bg-secondary/50">
          <div className="flex items-center gap-2 text-muted-foreground mb-1">
            <Clock className="w-3.5 h-3.5" />
            <span className="text-xs">Avg Time</span>
          </div>
          <p className="text-lg font-semibold">{stats.avgResponseTime}s</p>
        </div>
        
        <div className="p-3 rounded-lg bg-secondary/50">
          <div className="flex items-center gap-2 text-muted-foreground mb-1">
            <Activity className="w-3.5 h-3.5" />
            <span className="text-xs">Active</span>
          </div>
          <p className="text-lg font-semibold">{stats.activeHours}h</p>
        </div>
      </div>
    </div>
  );
}
