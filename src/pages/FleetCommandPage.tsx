import { useState } from 'react';
import { Trophy, Activity, Eye, Heart, Zap, Crown } from 'lucide-react';
import { cn } from '@/lib/utils';
import { mockAgents, mockAgentStats, AgentStats } from '@/data/agentsData';
import { Agent } from '@/components/AgentRail';
import { XPBar } from '@/components/XPBar';

interface FleetCommandPageProps {
  onSelectAgent: (agentId: string) => void;
}

const statusConfig = {
  idle: { label: 'Idle', class: 'bg-muted text-muted-foreground' },
  thinking: { label: 'Thinking', class: 'bg-primary/20 text-primary' },
  executing: { label: 'On Mission', class: 'bg-success/20 text-success animate-pulse' },
  waiting: { label: 'Waiting', class: 'bg-warning/20 text-warning' },
  error: { label: 'Error', class: 'bg-destructive/20 text-destructive' },
  stunned: { label: 'Stunned', class: 'bg-destructive/30 text-destructive' },
};

function AgentCard({ agent, stats, rank, onSelect }: { 
  agent: Agent; 
  stats: AgentStats; 
  rank?: number;
  onSelect: () => void;
}) {
  const status = statusConfig[agent.status];
  
  return (
    <button
      onClick={onSelect}
      className={cn(
        "glass-card p-4 rounded-xl text-left transition-all hover:scale-[1.02] hover:ring-1 hover:ring-primary/50",
        agent.status === 'executing' && "ring-1 ring-success/30"
      )}
    >
      {/* Header */}
      <div className="flex items-start gap-3 mb-3">
        <div className={cn(
          "relative w-12 h-12 rounded-xl flex items-center justify-center text-2xl",
          "bg-gradient-to-br from-primary/20 to-accent/20 border border-border",
          agent.status === 'executing' && "glow-primary"
        )}>
          {agent.avatar}
          {rank && rank <= 3 && (
            <div className={cn(
              "absolute -top-1 -right-1 w-5 h-5 rounded-full flex items-center justify-center",
              rank === 1 ? "bg-gold text-gold-foreground" :
              rank === 2 ? "bg-muted-foreground text-background" :
              "bg-warning/70 text-warning-foreground"
            )}>
              <Crown className="w-3 h-3" />
            </div>
          )}
        </div>
        
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <span className="font-display font-bold truncate">{agent.name}</span>
            <span className="text-[10px] px-1.5 py-0.5 rounded bg-gold/20 text-gold font-mono font-bold">
              {agent.level}
            </span>
          </div>
          <span className={cn("text-[10px] px-2 py-0.5 rounded-full font-medium inline-block mt-1", status.class)}>
            {status.label}
          </span>
        </div>
      </div>

      {/* Vision Thumbnail Placeholder */}
      <div className="relative aspect-video bg-secondary/50 rounded-lg mb-3 overflow-hidden border border-border/50">
        <div className="absolute inset-0 flex items-center justify-center">
          <Eye className="w-6 h-6 text-muted-foreground/30" />
        </div>
        {agent.status === 'executing' && (
          <div className="absolute bottom-1 right-1 flex items-center gap-1 px-1.5 py-0.5 rounded bg-success/80 text-[10px] font-mono text-success-foreground">
            <Activity className="w-3 h-3" />
            LIVE
          </div>
        )}
      </div>

      {/* Mini Health Bar */}
      <div className="flex items-center gap-2">
        <Heart className="w-3 h-3 text-destructive" />
        <div className="flex-1">
          <XPBar 
            current={stats.health} 
            max={stats.maxHealth} 
            variant="health" 
            size="sm"
            showValues={false}
          />
        </div>
        <span className="text-[10px] font-mono text-muted-foreground">{stats.health}%</span>
      </div>
    </button>
  );
}

function Leaderboard({ agents, stats }: { agents: Agent[]; stats: Record<string, AgentStats> }) {
  const sortedAgents = [...agents].sort((a, b) => {
    const xpA = stats[a.id]?.xp || 0;
    const xpB = stats[b.id]?.xp || 0;
    return xpB - xpA;
  });

  return (
    <div className="glass-card rounded-xl p-4">
      <div className="flex items-center gap-2 mb-4">
        <Trophy className="w-5 h-5 text-gold" />
        <h3 className="font-display font-bold">Top Performers</h3>
      </div>
      
      <div className="space-y-2">
        {sortedAgents.slice(0, 5).map((agent, index) => {
          const agentStats = stats[agent.id];
          return (
            <div 
              key={agent.id}
              className={cn(
                "flex items-center gap-3 p-2 rounded-lg transition-colors",
                index === 0 && "bg-gold/10 border border-gold/20"
              )}
            >
              <span className={cn(
                "w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold",
                index === 0 ? "bg-gold text-gold-foreground" :
                index === 1 ? "bg-muted-foreground text-background" :
                index === 2 ? "bg-warning/70 text-warning-foreground" :
                "bg-secondary text-muted-foreground"
              )}>
                {index + 1}
              </span>
              
              <div className="w-8 h-8 rounded-lg bg-secondary flex items-center justify-center text-lg">
                {agent.avatar}
              </div>
              
              <div className="flex-1 min-w-0">
                <p className="font-display font-medium text-sm truncate">{agent.name}</p>
                <p className="text-[10px] text-muted-foreground">Lvl {agent.level}</p>
              </div>
              
              <div className="flex items-center gap-1">
                <Zap className="w-3 h-3 text-gold" />
                <span className="font-mono text-sm text-gold">{agentStats?.xp.toLocaleString()}</span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export function FleetCommandPage({ onSelectAgent }: FleetCommandPageProps) {
  const activeCount = mockAgents.filter(a => a.status === 'executing' || a.status === 'thinking').length;
  const totalXP = Object.values(mockAgentStats).reduce((acc, s) => acc + s.xp, 0);

  return (
    <div className="space-y-6 animate-slide-up">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-display font-bold">Fleet Command</h1>
          <p className="text-sm text-muted-foreground">Monitor all agents at a glance</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-success/20 border border-success/30">
            <Activity className="w-4 h-4 text-success" />
            <span className="font-mono text-sm text-success">{activeCount} Active</span>
          </div>
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-gold/20 border border-gold/30">
            <Zap className="w-4 h-4 text-gold" />
            <span className="font-mono text-sm text-gold">{totalXP.toLocaleString()} XP</span>
          </div>
        </div>
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Agent Grid */}
        <div className="lg:col-span-2">
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {mockAgents.map((agent, index) => (
              <AgentCard 
                key={agent.id}
                agent={agent}
                stats={mockAgentStats[agent.id]}
                rank={index + 1}
                onSelect={() => onSelectAgent(agent.id)}
              />
            ))}
          </div>
        </div>

        {/* Leaderboard */}
        <div className="lg:col-span-1">
          <Leaderboard agents={mockAgents} stats={mockAgentStats} />
        </div>
      </div>
    </div>
  );
}
