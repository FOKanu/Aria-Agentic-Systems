import { Bot, Plus, Zap } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

export interface Agent {
  id: string;
  name: string;
  avatar?: string;
  status: 'idle' | 'thinking' | 'executing' | 'waiting' | 'error' | 'stunned';
  level: number;
  class: 'assistant' | 'coder' | 'researcher';
}

interface AgentRailProps {
  agents: Agent[];
  selectedAgentId: string | null;
  onSelectAgent: (agentId: string) => void;
  onOpenFleetCommand: () => void;
  onCreateAgent: () => void;
}

const statusColors: Record<Agent['status'], string> = {
  idle: 'bg-muted-foreground',
  thinking: 'bg-primary animate-pulse',
  executing: 'bg-success animate-pulse',
  waiting: 'bg-warning',
  error: 'bg-destructive',
  stunned: 'bg-destructive/50',
};

const classIcons: Record<Agent['class'], string> = {
  assistant: '🤖',
  coder: '💻',
  researcher: '🔬',
};

export function AgentRail({
  agents,
  selectedAgentId,
  onSelectAgent,
  onOpenFleetCommand,
  onCreateAgent,
}: AgentRailProps) {
  return (
    <TooltipProvider delayDuration={200}>
      <div className="fixed left-0 top-0 h-full w-20 bg-sidebar border-r border-sidebar-border flex flex-col items-center py-4 z-50">
        {/* Fleet Command Button */}
        <Tooltip>
          <TooltipTrigger asChild>
            <button
              onClick={onOpenFleetCommand}
              className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary/20 to-accent/20 border border-border/50 flex items-center justify-center mb-4 hover:scale-105 transition-all hover:border-primary/50 group"
            >
              <Zap className="w-6 h-6 text-primary group-hover:text-primary-foreground transition-colors" />
            </button>
          </TooltipTrigger>
          <TooltipContent side="right" className="glass-card">
            <p className="font-display font-semibold">Fleet Command</p>
          </TooltipContent>
        </Tooltip>

        <div className="w-10 h-px bg-border mb-4" />

        {/* Agent Avatars */}
        <div className="flex-1 flex flex-col items-center gap-3 overflow-y-auto scrollbar-thin">
          {agents.map((agent) => (
            <Tooltip key={agent.id}>
              <TooltipTrigger asChild>
                <button
                  onClick={() => onSelectAgent(agent.id)}
                  className={cn(
                    "relative w-12 h-12 rounded-full transition-all duration-300",
                    "bg-secondary border-2 border-transparent",
                    "hover:scale-110 hover:border-primary/50",
                    selectedAgentId === agent.id && "agent-avatar-selected border-primary"
                  )}
                >
                  {/* Avatar Content */}
                  <div className="w-full h-full rounded-full flex items-center justify-center text-xl">
                    {agent.avatar || classIcons[agent.class]}
                  </div>

                  {/* Level Badge */}
                  <div className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-card border border-border flex items-center justify-center">
                    <span className="text-[10px] font-mono font-bold text-primary">
                      {agent.level}
                    </span>
                  </div>

                  {/* Status Indicator */}
                  <div
                    className={cn(
                      "absolute -top-0.5 -right-0.5 w-3 h-3 rounded-full border-2 border-sidebar",
                      statusColors[agent.status]
                    )}
                  />
                </button>
              </TooltipTrigger>
              <TooltipContent side="right" className="glass-card">
                <p className="font-display font-semibold">{agent.name}</p>
                <p className="text-xs text-muted-foreground capitalize">
                  Lvl {agent.level} {agent.class}
                </p>
              </TooltipContent>
            </Tooltip>
          ))}

          {/* Add Agent Button */}
          {agents.length < 10 && (
            <Tooltip>
              <TooltipTrigger asChild>
                <button
                  onClick={onCreateAgent}
                  className="w-12 h-12 rounded-full border-2 border-dashed border-border hover:border-primary/50 flex items-center justify-center transition-all hover:scale-105 group"
                >
                  <Plus className="w-5 h-5 text-muted-foreground group-hover:text-primary transition-colors" />
                </button>
              </TooltipTrigger>
              <TooltipContent side="right" className="glass-card">
                <p className="font-display font-semibold">Spawn New Agent</p>
              </TooltipContent>
            </Tooltip>
          )}
        </div>

        {/* Bottom Spacer for mobile nav */}
        <div className="h-20 lg:h-4" />
      </div>
    </TooltipProvider>
  );
}
