import { useState, useEffect } from 'react';
import { Check, X, Loader2, Clock, Zap, Heart, Trophy } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Task, TaskStep } from '@/types/agent';

interface QuestTimelineProps {
  task: Task;
  onStepComplete?: (stepId: string, xp: number) => void;
}

const stepStatusConfig = {
  pending: {
    icon: Clock,
    containerClass: 'opacity-50',
    nodeClass: 'bg-muted border-muted-foreground/30',
    lineClass: 'bg-muted-foreground/20',
  },
  running: {
    icon: Loader2,
    containerClass: '',
    nodeClass: 'bg-primary/20 border-primary glow-primary',
    lineClass: 'bg-primary/50',
  },
  completed: {
    icon: Check,
    containerClass: '',
    nodeClass: 'bg-success/20 border-success glow-success',
    lineClass: 'bg-success',
  },
  failed: {
    icon: X,
    containerClass: '',
    nodeClass: 'bg-destructive/20 border-destructive animate-pulse',
    lineClass: 'bg-destructive/50',
  },
};

function ConfettiParticle({ delay }: { delay: number }) {
  const colors = ['bg-gold', 'bg-primary', 'bg-accent', 'bg-success', 'bg-holo'];
  const randomColor = colors[Math.floor(Math.random() * colors.length)];
  const randomX = Math.random() * 60 - 30;
  const randomRotate = Math.random() * 360;
  
  return (
    <div
      className={cn(
        "absolute w-2 h-2 rounded-sm",
        randomColor
      )}
      style={{
        animation: `confetti-fall 1s ease-out ${delay}ms forwards`,
        transform: `translateX(${randomX}px) rotate(${randomRotate}deg)`,
        opacity: 0,
      }}
    />
  );
}

function FloatingReward({ type, value, show }: { type: 'xp' | 'hp'; value: number; show: boolean }) {
  if (!show) return null;
  
  return (
    <div 
      className={cn(
        "absolute -right-2 top-0 font-mono font-bold text-sm animate-float-up",
        type === 'xp' ? 'text-gold' : 'text-destructive'
      )}
    >
      {type === 'xp' ? '+' : ''}{value} {type.toUpperCase()}
    </div>
  );
}

export function QuestTimeline({ task, onStepComplete }: QuestTimelineProps) {
  const [completedSteps, setCompletedSteps] = useState<Set<string>>(new Set());
  const [showConfetti, setShowConfetti] = useState<string | null>(null);

  // Simulate confetti on completed steps
  useEffect(() => {
    task.steps.forEach(step => {
      if (step.status === 'completed' && !completedSteps.has(step.id)) {
        setCompletedSteps(prev => new Set([...prev, step.id]));
        setShowConfetti(step.id);
        setTimeout(() => setShowConfetti(null), 1000);
      }
    });
  }, [task.steps, completedSteps]);

  return (
    <div className="relative">
      {/* Timeline */}
      <div className="space-y-0">
        {task.steps.map((step, index) => {
          const config = stepStatusConfig[step.status];
          const Icon = config.icon;
          const isLast = index === task.steps.length - 1;
          const xpReward = step.status === 'completed' ? 50 : 0;
          const hpLoss = step.status === 'failed' ? -20 : 0;

          return (
            <div key={step.id} className={cn("relative flex gap-4", config.containerClass)}>
              {/* Node and Line */}
              <div className="flex flex-col items-center">
                {/* Node */}
                <div className={cn(
                  "relative w-10 h-10 rounded-full border-2 flex items-center justify-center transition-all",
                  config.nodeClass
                )}>
                  <Icon className={cn(
                    "w-5 h-5",
                    step.status === 'running' && "animate-spin text-primary",
                    step.status === 'completed' && "text-success",
                    step.status === 'failed' && "text-destructive",
                    step.status === 'pending' && "text-muted-foreground"
                  )} />
                  
                  {/* Confetti */}
                  {showConfetti === step.id && (
                    <div className="absolute inset-0 flex items-center justify-center overflow-visible pointer-events-none">
                      {[...Array(12)].map((_, i) => (
                        <ConfettiParticle key={i} delay={i * 50} />
                      ))}
                    </div>
                  )}
                  
                  {/* Floating Rewards */}
                  <FloatingReward type="xp" value={xpReward} show={showConfetti === step.id && step.status === 'completed'} />
                  <FloatingReward type="hp" value={hpLoss} show={step.status === 'failed'} />
                </div>
                
                {/* Connecting Line */}
                {!isLast && (
                  <div className={cn(
                    "w-0.5 h-16 transition-all",
                    config.lineClass
                  )} />
                )}
              </div>

              {/* Content */}
              <div className={cn(
                "flex-1 pb-6 pt-1",
                isLast && "pb-0"
              )}>
                <div className={cn(
                  "glass-card p-3 rounded-xl transition-all",
                  step.status === 'running' && "border-primary/50",
                  step.status === 'completed' && "border-success/30",
                  step.status === 'failed' && "border-destructive/50 animate-pulse"
                )}>
                  {/* Header */}
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <p className="font-display font-medium text-sm">{step.plan}</p>
                    {step.status === 'completed' && (
                      <span className="flex items-center gap-1 text-xs font-mono text-gold bg-gold/20 px-2 py-0.5 rounded-full">
                        <Trophy className="w-3 h-3" />
                        +50 XP
                      </span>
                    )}
                  </div>

                  {/* Tool & Result */}
                  {step.tool && (
                    <p className="text-xs text-muted-foreground mb-1">
                      <span className="text-primary font-mono">{step.tool}</span>
                    </p>
                  )}
                  
                  {step.result && (
                    <p className="text-xs text-muted-foreground line-clamp-2">
                      {step.result}
                    </p>
                  )}

                  {/* Confidence */}
                  {step.confidence !== undefined && (
                    <div className="flex items-center gap-2 mt-2">
                      <div className="flex-1 h-1 bg-secondary rounded-full overflow-hidden">
                        <div 
                          className={cn(
                            "h-full rounded-full transition-all",
                            step.confidence >= 80 ? "bg-success" :
                            step.confidence >= 50 ? "bg-warning" : "bg-destructive"
                          )}
                          style={{ width: `${step.confidence}%` }}
                        />
                      </div>
                      <span className="text-[10px] font-mono text-muted-foreground">
                        {step.confidence}%
                      </span>
                    </div>
                  )}

                  {/* Error */}
                  {step.error && (
                    <div className="mt-2 p-2 rounded bg-destructive/10 border border-destructive/30">
                      <p className="text-xs text-destructive font-mono">{step.error}</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
