import { StopCircle, Clock, Gauge } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { AgentState, AutonomyLevel } from '@/types/agent';
import { cn } from '@/lib/utils';

interface StatusBarProps {
  state: AgentState;
  activeTaskTime?: number;
  autonomyLevel: AutonomyLevel;
  onStop: () => void;
}

const stateLabels: Record<AgentState, string> = {
  idle: 'Idle',
  thinking: 'Thinking',
  executing: 'Executing',
  waiting: 'Waiting',
  error: 'Error',
};

const stateColors: Record<AgentState, string> = {
  idle: 'bg-muted-foreground',
  thinking: 'bg-primary animate-pulse',
  executing: 'bg-success animate-pulse',
  waiting: 'bg-warning animate-pulse',
  error: 'bg-destructive animate-pulse',
};

const autonomyLabels: Record<AutonomyLevel, string> = {
  manual: 'Manual',
  assisted: 'Assisted',
  autonomous: 'Auto',
};

export function StatusBar({ state, activeTaskTime = 0, autonomyLevel, onStop }: StatusBarProps) {
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-card/95 backdrop-blur-sm border-b border-border px-4 py-2">
      <div className="flex items-center justify-between max-w-4xl mx-auto">
        <div className="flex items-center gap-4">
          {/* Agent State */}
          <div className="flex items-center gap-2">
            <div className={cn('w-2.5 h-2.5 rounded-full', stateColors[state])} />
            <span className="text-sm font-medium">{stateLabels[state]}</span>
          </div>

          {/* Active Task Timer */}
          {activeTaskTime > 0 && (
            <div className="flex items-center gap-1.5 text-muted-foreground">
              <Clock className="w-3.5 h-3.5" />
              <span className="text-xs font-mono">{formatTime(activeTaskTime)}</span>
            </div>
          )}

          {/* Autonomy Level */}
          <div className="flex items-center gap-1.5 text-muted-foreground">
            <Gauge className="w-3.5 h-3.5" />
            <span className="text-xs">{autonomyLabels[autonomyLevel]}</span>
          </div>
        </div>

        {/* Emergency Stop */}
        <Button variant="stop" size="sm" onClick={onStop} className="gap-1.5">
          <StopCircle className="w-4 h-4" />
          STOP
        </Button>
      </div>
    </header>
  );
}
