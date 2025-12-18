import { Activity, Eye, CheckCircle, Clock } from 'lucide-react';
import { cn } from '@/lib/utils';
import { mockAgents, mockAgentStats, AgentStats } from '@/data/agentsData';
import { Agent } from '@/components/AgentRail';

interface FleetCommandPageProps {
  onSelectAgent: (agentId: string) => void;
}

const statusConfig = {
  idle: { label: 'Idle', class: 'bg-muted text-muted-foreground' },
  thinking: { label: 'Processing', class: 'bg-primary/10 text-primary' },
  executing: { label: 'Active', class: 'bg-success/10 text-success' },
  waiting: { label: 'Waiting', class: 'bg-warning/10 text-warning' },
  error: { label: 'Error', class: 'bg-destructive/10 text-destructive' },
  stunned: { label: 'Offline', class: 'bg-destructive/10 text-destructive' },
};


function AgentCard({ agent, stats, onSelect }: { 
  agent: Agent; 
  stats: AgentStats; 
  onSelect: () => void;
}) {
  const status = statusConfig[agent.status];
  
  return (
    <button
      onClick={onSelect}
      className={cn(
        "glass-card p-4 rounded-lg text-left transition-all hover:border-primary/50",
        agent.status === 'executing' && "border-success/30"
      )}
    >
      {/* Header */}
      <div className="flex items-start gap-3 mb-3">
        <div className="w-10 h-10 rounded-lg bg-secondary flex items-center justify-center text-xl border border-border">
          {agent.avatar}
        </div>
        
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <span className="font-medium truncate">{agent.name}</span>
          </div>
          <div className="flex items-center gap-2 mt-1">
            <span className="text-xs text-muted-foreground">{agent.title || agent.role}</span>
            <span className={cn("text-xs px-2 py-0.5 rounded-full font-medium", status.class)}>
              {status.label}
            </span>
          </div>
        </div>
      </div>

      {/* Preview */}
      <div className="relative aspect-video bg-secondary/50 rounded-md mb-3 overflow-hidden border border-border">
        <div className="absolute inset-0 flex items-center justify-center">
          <Eye className="w-5 h-5 text-muted-foreground/30" />
        </div>
        {agent.status === 'executing' && (
          <div className="absolute bottom-1 right-1 flex items-center gap-1 px-1.5 py-0.5 rounded bg-success/80 text-[10px] text-success-foreground">
            <Activity className="w-3 h-3" />
            LIVE
          </div>
        )}
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-2 text-xs">
        <div className="flex items-center gap-1.5 text-muted-foreground">
          <CheckCircle className="w-3 h-3" />
          <span>{stats.tasksCompleted} tasks</span>
        </div>
        <div className="flex items-center gap-1.5 text-muted-foreground">
          <Clock className="w-3 h-3" />
          <span>{stats.avgResponseTime}s avg</span>
        </div>
      </div>
    </button>
  );
}

export function FleetCommandPage({ onSelectAgent }: FleetCommandPageProps) {
  const activeCount = mockAgents.filter(a => a.status === 'executing' || a.status === 'thinking').length;
  const totalTasks = Object.values(mockAgentStats).reduce((acc, s) => acc + s.tasksCompleted, 0);
  const avgSuccessRate = Math.round(
    Object.values(mockAgentStats).reduce((acc, s) => acc + s.successRate, 0) / Object.values(mockAgentStats).length
  );

  return (
    <div className="space-y-6 animate-slide-up">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold">Fleet Overview</h1>
          <p className="text-sm text-muted-foreground">Monitor all agents</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-md bg-success/10">
            <Activity className="w-4 h-4 text-success" />
            <span className="text-sm text-success">{activeCount} Active</span>
          </div>
        </div>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-3 gap-4">
        <div className="glass-card p-4 rounded-lg">
          <p className="text-sm text-muted-foreground">Total Agents</p>
          <p className="text-2xl font-semibold">{mockAgents.length}</p>
        </div>
        <div className="glass-card p-4 rounded-lg">
          <p className="text-sm text-muted-foreground">Tasks Completed</p>
          <p className="text-2xl font-semibold">{totalTasks}</p>
        </div>
        <div className="glass-card p-4 rounded-lg">
          <p className="text-sm text-muted-foreground">Avg Success Rate</p>
          <p className="text-2xl font-semibold text-success">{avgSuccessRate}%</p>
        </div>
      </div>

      {/* Agent Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {mockAgents.map((agent) => (
          <AgentCard 
            key={agent.id}
            agent={agent}
            stats={mockAgentStats[agent.id]}
            onSelect={() => onSelectAgent(agent.id)}
          />
        ))}
      </div>
    </div>
  );
}
