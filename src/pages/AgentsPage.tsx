/**
 * Agents Page - Francis Okorie Iyeke-Kanu
 */
import { Activity, Eye, CheckCircle, Clock, TrendingUp, Bot, MoreHorizontal } from 'lucide-react';
import { cn } from '@/lib/utils';
import { mockAgents, mockAgentStats, AgentStats } from '@/data/agentsData';
import { mockTasks } from '@/data/mockData';
import { Agent } from '@/components/AgentRail';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface AgentsPageProps {
  onSelectAgent: (agentId: string) => void;
}

const statusConfig = {
  idle: { label: 'Idle', class: 'bg-muted text-muted-foreground', dot: 'bg-muted-foreground' },
  thinking: { label: 'Processing', class: 'bg-primary/10 text-primary', dot: 'bg-primary' },
  executing: { label: 'Active', class: 'bg-success/10 text-success', dot: 'bg-success' },
  waiting: { label: 'Waiting', class: 'bg-warning/10 text-warning', dot: 'bg-warning' },
  error: { label: 'Error', class: 'bg-destructive/10 text-destructive', dot: 'bg-destructive' },
  stunned: { label: 'Offline', class: 'bg-destructive/10 text-destructive', dot: 'bg-destructive' },
};


// Created by Francis Okorie Iyeke-Kanu
function AgentCard({ agent, stats, onSelect }: { 
  agent: Agent; 
  stats: AgentStats; 
  onSelect: () => void;
}) {
  const status = statusConfig[agent.status as keyof typeof statusConfig] || statusConfig.idle;
  const agentTasks = mockTasks.filter(t => t.status === 'running');
  
  return (
    <div className={cn(
      "glass-card rounded-xl border border-border overflow-hidden transition-all hover:border-primary/50",
      agent.status === 'executing' && "border-success/30"
    )}>
      {/* Header */}
      <div className="p-4 border-b border-border/50">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-secondary flex items-center justify-center text-2xl border border-border">
              {agent.avatar}
            </div>
            <div>
              <h3 className="font-semibold">{agent.name}</h3>
              <div className="flex items-center gap-2 mt-1">
                <span className="text-xs text-muted-foreground">{agent.title || agent.role}</span>
                <span className={cn("text-xs px-2 py-0.5 rounded-full font-medium", status.class)}>
                  {status.label}
                </span>
              </div>
            </div>
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="h-8 w-8">
                <MoreHorizontal className="w-4 h-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={onSelect}>View Details</DropdownMenuItem>
              <DropdownMenuItem>Assign Task</DropdownMenuItem>
              <DropdownMenuItem>Pause Agent</DropdownMenuItem>
              <DropdownMenuItem className="text-destructive">Stop Agent</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* Preview/Status Area */}
      <div className="relative aspect-video bg-secondary/30 flex items-center justify-center">
        <Eye className="w-8 h-8 text-muted-foreground/20" />
        {agent.status === 'executing' && (
          <div className="absolute bottom-2 right-2 flex items-center gap-1 px-2 py-1 rounded bg-success/80 text-xs text-success-foreground font-medium">
            <Activity className="w-3 h-3" />
            LIVE
          </div>
        )}
        {agent.status === 'thinking' && (
          <div className="absolute bottom-2 right-2 flex items-center gap-1 px-2 py-1 rounded bg-primary/80 text-xs text-primary-foreground font-medium">
            <div className="w-2 h-2 bg-current rounded-full animate-pulse" />
            PROCESSING
          </div>
        )}
      </div>

      {/* Current Task */}
      {agent.status !== 'idle' && agentTasks.length > 0 && (
        <div className="p-3 border-t border-border/50 bg-secondary/20">
          <p className="text-xs text-muted-foreground mb-1">Current Task</p>
          <p className="text-sm font-medium truncate">{agentTasks[0].name}</p>
          <div className="flex items-center gap-2 mt-2">
            <div className="flex-1 h-1 bg-muted rounded-full overflow-hidden">
              <div 
                className="h-full bg-primary rounded-full"
                style={{ width: `${(agentTasks[0].steps.filter(s => s.status === 'completed').length / agentTasks[0].steps.length) * 100}%` }}
              />
            </div>
            <span className="text-xs text-muted-foreground">
              {Math.round((agentTasks[0].steps.filter(s => s.status === 'completed').length / agentTasks[0].steps.length) * 100)}%
            </span>
          </div>
        </div>
      )}

      {/* Stats */}
      <div className="p-4 grid grid-cols-2 gap-3 border-t border-border/50">
        <div className="flex items-center gap-2">
          <CheckCircle className="w-4 h-4 text-muted-foreground" />
          <div>
            <p className="text-xs text-muted-foreground">Completed</p>
            <p className="font-semibold text-sm">{stats.tasksCompleted}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <TrendingUp className="w-4 h-4 text-muted-foreground" />
          <div>
            <p className="text-xs text-muted-foreground">Success Rate</p>
            <p className="font-semibold text-sm text-success">{stats.successRate}%</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Clock className="w-4 h-4 text-muted-foreground" />
          <div>
            <p className="text-xs text-muted-foreground">Avg Response</p>
            <p className="font-semibold text-sm">{stats.avgResponseTime}s</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Activity className="w-4 h-4 text-muted-foreground" />
          <div>
            <p className="text-xs text-muted-foreground">Active Hours</p>
            <p className="font-semibold text-sm">{stats.activeHours}h</p>
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="p-3 border-t border-border/50">
        <Button 
          onClick={onSelect}
          variant="secondary" 
          size="sm" 
          className="w-full"
        >
          View Full Details
        </Button>
      </div>
    </div>
  );
}

/* Francis Okorie Iyeke-Kanu */
export function AgentsPage({ onSelectAgent }: AgentsPageProps) {
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
          <h1 className="text-2xl font-semibold">AI Agents</h1>
          <p className="text-sm text-muted-foreground">Manage and monitor all agents</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-success/10 border border-success/20">
            <div className="w-2 h-2 rounded-full bg-success animate-pulse" />
            <span className="text-sm font-medium text-success">{activeCount} Active</span>
          </div>
          <Button size="sm" className="gap-2">
            <Bot className="w-4 h-4" />
            Add Agent
          </Button>
        </div>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="glass-card p-4 rounded-xl">
          <p className="text-sm text-muted-foreground">Total Agents</p>
          <p className="text-2xl font-semibold">{mockAgents.length}</p>
        </div>
        <div className="glass-card p-4 rounded-xl">
          <p className="text-sm text-muted-foreground">Active Now</p>
          <p className="text-2xl font-semibold text-success">{activeCount}</p>
        </div>
        <div className="glass-card p-4 rounded-xl">
          <p className="text-sm text-muted-foreground">Tasks Completed</p>
          <p className="text-2xl font-semibold">{totalTasks}</p>
        </div>
        <div className="glass-card p-4 rounded-xl">
          <p className="text-sm text-muted-foreground">Avg Success Rate</p>
          <p className="text-2xl font-semibold text-primary">{avgSuccessRate}%</p>
        </div>
      </div>

      {/* Agent Grid */}
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
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
