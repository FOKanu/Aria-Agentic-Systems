import { Agent } from '@/components/AgentRail';
import { AgentStats } from '@/data/agentsData';
import { XPBar } from '@/components/XPBar';
import { RadialStat } from '@/components/RadialStat';
import { ArrowLeft, Zap, Heart, Sparkles, Trophy, Target, Clock } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';

interface AgentDetailsPageProps {
  agent: Agent;
  stats: AgentStats;
  onBack: () => void;
}

const classLabels: Record<Agent['class'], string> = {
  assistant: 'Digital Assistant',
  coder: 'Code Architect',
  researcher: 'Data Scientist',
};

export function AgentDetailsPage({ agent, stats, onBack }: AgentDetailsPageProps) {
  const totalMissions = 47;
  const successRate = 94;
  const avgTime = '12m 34s';

  return (
    <div className="space-y-6 animate-slide-up">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="icon" onClick={onBack}>
          <ArrowLeft className="w-5 h-5" />
        </Button>
        <h1 className="text-xl font-display font-bold">Agent Details</h1>
      </div>

      {/* Profile Card */}
      <div className="glass-card p-6 rounded-xl">
        <div className="flex items-center gap-6">
          {/* Large Avatar */}
          <div className={cn(
            "relative w-24 h-24 rounded-2xl bg-gradient-to-br from-primary/30 to-accent/30 flex items-center justify-center",
            "border-2 border-primary/50",
            agent.status === 'executing' && "glow-primary animate-float"
          )}>
            <span className="text-5xl">{agent.avatar}</span>
          </div>

          {/* Info */}
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-2">
              <h2 className="text-2xl font-display font-bold">{agent.name}</h2>
              <span className="px-3 py-1 rounded-full bg-gold/20 text-gold text-sm font-bold font-mono border border-gold/30">
                LVL {agent.level}
              </span>
            </div>
            <p className="text-muted-foreground font-display mb-2">
              {classLabels[agent.class]}
            </p>
            <p className={cn(
              "text-sm font-medium capitalize inline-flex items-center gap-2 px-2 py-1 rounded-full",
              agent.status === 'executing' && "bg-success/20 text-success",
              agent.status === 'thinking' && "bg-primary/20 text-primary",
              agent.status === 'waiting' && "bg-warning/20 text-warning",
              agent.status === 'idle' && "bg-muted text-muted-foreground"
            )}>
              <span className={cn(
                "w-2 h-2 rounded-full",
                agent.status === 'executing' && "bg-success animate-pulse",
                agent.status === 'thinking' && "bg-primary animate-pulse",
                agent.status === 'waiting' && "bg-warning",
                agent.status === 'idle' && "bg-muted-foreground"
              )} />
              {agent.status}
            </p>
          </div>
        </div>
      </div>

      {/* Progress Bars */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="glass-card p-4 rounded-xl">
          <div className="flex items-center gap-2 mb-3">
            <Zap className="w-5 h-5 text-gold" />
            <span className="font-display font-semibold">Neural Density</span>
          </div>
          <XPBar 
            current={stats.xp} 
            max={stats.xpToNextLevel} 
            variant="gold"
            size="lg"
          />
          <p className="text-xs text-muted-foreground mt-2">
            {stats.xpToNextLevel - stats.xp} XP to next level
          </p>
        </div>

        <div className="glass-card p-4 rounded-xl">
          <div className="flex items-center gap-2 mb-3">
            <Heart className="w-5 h-5 text-destructive" />
            <span className="font-display font-semibold">System Integrity</span>
          </div>
          <XPBar 
            current={stats.health} 
            max={stats.maxHealth} 
            variant="health"
            size="lg"
          />
          <p className="text-xs text-muted-foreground mt-2">
            {stats.health >= 80 ? 'Optimal condition' : stats.health >= 50 ? 'Minor issues detected' : 'Needs attention'}
          </p>
        </div>
      </div>

      {/* Core Stats */}
      <div className="glass-card p-6 rounded-xl">
        <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wider mb-6 flex items-center gap-2 font-display">
          <Sparkles className="w-4 h-4" />
          Core Attributes
        </h3>
        <div className="flex justify-around">
          <RadialStat 
            value={stats.accuracy} 
            label="Accuracy" 
            color="success"
            size="lg"
          />
          <RadialStat 
            value={stats.speed} 
            label="Speed" 
            color="holo"
            size="lg"
          />
          <RadialStat 
            value={stats.creativity} 
            label="Creativity" 
            color="accent"
            size="lg"
          />
        </div>
      </div>

      {/* Performance Stats */}
      <div className="grid grid-cols-3 gap-4">
        <div className="glass-card p-4 rounded-xl text-center">
          <Trophy className="w-6 h-6 text-gold mx-auto mb-2" />
          <p className="text-2xl font-mono font-bold">{totalMissions}</p>
          <p className="text-xs text-muted-foreground">Total Missions</p>
        </div>
        <div className="glass-card p-4 rounded-xl text-center">
          <Target className="w-6 h-6 text-success mx-auto mb-2" />
          <p className="text-2xl font-mono font-bold">{successRate}%</p>
          <p className="text-xs text-muted-foreground">Success Rate</p>
        </div>
        <div className="glass-card p-4 rounded-xl text-center">
          <Clock className="w-6 h-6 text-holo mx-auto mb-2" />
          <p className="text-2xl font-mono font-bold">{avgTime}</p>
          <p className="text-xs text-muted-foreground">Avg. Time</p>
        </div>
      </div>
    </div>
  );
}
