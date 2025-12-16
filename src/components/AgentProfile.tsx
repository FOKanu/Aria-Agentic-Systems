import { Agent } from '@/components/AgentRail';
import { AgentStats } from '@/data/agentsData';
import { XPBar } from '@/components/XPBar';
import { RadialStat } from '@/components/RadialStat';
import { Zap, Heart, Target, Gauge, Sparkles, Cpu } from 'lucide-react';
import { cn } from '@/lib/utils';

interface AgentProfileProps {
  agent: Agent;
  stats: AgentStats;
}

const classLabels: Record<Agent['class'], string> = {
  assistant: 'Digital Assistant',
  coder: 'Code Architect',
  researcher: 'Data Scientist',
};

export function AgentProfile({ agent, stats }: AgentProfileProps) {
  return (
    <div className="glass-card p-4 rounded-xl space-y-4 animate-slide-up">
      {/* Header with Avatar and Level */}
      <div className="flex items-center gap-4">
        {/* Animated Avatar */}
        <div className={cn(
          "relative w-20 h-20 rounded-2xl bg-gradient-to-br from-primary/30 to-accent/30 flex items-center justify-center",
          "border-2 border-primary/50 animate-float",
          agent.status === 'executing' && "glow-primary"
        )}>
          <span className="text-4xl">{agent.avatar}</span>
          
          {/* Status ring */}
          <div className={cn(
            "absolute -bottom-1 -right-1 w-6 h-6 rounded-full flex items-center justify-center",
            "bg-card border-2",
            agent.status === 'executing' ? "border-success" : 
            agent.status === 'thinking' ? "border-primary" :
            agent.status === 'waiting' ? "border-warning" :
            agent.status === 'error' ? "border-destructive" : "border-muted"
          )}>
            <Cpu className={cn(
              "w-3 h-3",
              agent.status === 'executing' && "text-success animate-pulse",
              agent.status === 'thinking' && "text-primary animate-pulse",
              agent.status === 'waiting' && "text-warning",
              agent.status === 'error' && "text-destructive",
              agent.status === 'idle' && "text-muted-foreground"
            )} />
          </div>
        </div>

        {/* Name and Level */}
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-display font-bold">{agent.name}</h2>
            <span className="px-2 py-0.5 rounded-full bg-gold/20 text-gold text-xs font-bold font-mono border border-gold/30">
              LVL {agent.level}
            </span>
          </div>
          <p className="text-sm text-muted-foreground font-display">
            {classLabels[agent.class]}
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
            {agent.status === 'executing' ? '⚡ Executing Mission' :
             agent.status === 'thinking' ? '🧠 Processing...' :
             agent.status === 'waiting' ? '⏸ Awaiting Input' :
             agent.status === 'error' ? '⚠ Error State' :
             agent.status === 'stunned' ? '💫 Stunned' : '😴 Idle'}
          </p>
        </div>
      </div>

      {/* XP and Health Bars */}
      <div className="space-y-3">
        <div className="flex items-center gap-2">
          <Zap className="w-4 h-4 text-gold" />
          <div className="flex-1">
            <XPBar 
              current={stats.xp} 
              max={stats.xpToNextLevel} 
              label="Neural Density (XP)"
              variant="gold"
            />
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          <Heart className="w-4 h-4 text-destructive" />
          <div className="flex-1">
            <XPBar 
              current={stats.health} 
              max={stats.maxHealth} 
              label="System Integrity"
              variant="health"
            />
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="pt-2">
        <h3 className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-3 flex items-center gap-2">
          <Sparkles className="w-3 h-3" />
          Core Stats
        </h3>
        <div className="flex justify-around">
          <RadialStat 
            value={stats.accuracy} 
            label="Accuracy" 
            color="success"
            size="sm"
          />
          <RadialStat 
            value={stats.speed} 
            label="Speed" 
            color="holo"
            size="sm"
          />
          <RadialStat 
            value={stats.creativity} 
            label="Creativity" 
            color="accent"
            size="sm"
          />
        </div>
      </div>
    </div>
  );
}
