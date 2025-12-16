import { Plus, LayoutGrid } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

export interface Agent {
  id: string;
  name: string;
  avatar?: string;
  status: 'idle' | 'thinking' | 'executing' | 'waiting' | 'error' | 'stunned';
  type: 'assistant' | 'developer' | 'researcher';
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

const typeLabels: Record<Agent['type'], string> = {
  assistant: 'Assistant',
  developer: 'Developer',
  researcher: 'Researcher',
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
      <div className="fixed left-0 top-0 h-full w-16 bg-sidebar border-r border-sidebar-border flex flex-col items-center py-4 z-50">
        {/* Fleet Overview Button */}
        <Tooltip>
          <TooltipTrigger asChild>
            <button
              onClick={onOpenFleetCommand}
              className="w-10 h-10 rounded-lg bg-primary/10 border border-border flex items-center justify-center mb-4 hover:bg-primary/20 transition-colors"
            >
              <LayoutGrid className="w-5 h-5 text-primary" />
            </button>
          </TooltipTrigger>
          <TooltipContent side="right">
            <p className="font-medium">Fleet Overview</p>
          </TooltipContent>
        </Tooltip>

        <div className="w-8 h-px bg-border mb-4" />

        {/* Agent Avatars */}
        <div className="flex-1 flex flex-col items-center gap-2 overflow-y-auto scrollbar-thin">
          {agents.map((agent) => (
            <Tooltip key={agent.id}>
              <TooltipTrigger asChild>
                <button
                  onClick={() => onSelectAgent(agent.id)}
                  className={cn(
                    "relative w-10 h-10 rounded-lg transition-all",
                    "bg-secondary border border-transparent",
                    "hover:border-primary/50",
                    selectedAgentId === agent.id && "border-primary bg-primary/10"
                  )}
                >
                  <div className="w-full h-full rounded-lg flex items-center justify-center text-lg">
                    {agent.avatar || '🤖'}
                  </div>

                  {/* Status Indicator */}
                  <div
                    className={cn(
                      "absolute -top-0.5 -right-0.5 w-2.5 h-2.5 rounded-full border-2 border-sidebar",
                      statusColors[agent.status]
                    )}
                  />
                </button>
              </TooltipTrigger>
              <TooltipContent side="right">
                <p className="font-medium">{agent.name}</p>
                <p className="text-xs text-muted-foreground">
                  {typeLabels[agent.type]}
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
                  className="w-10 h-10 rounded-lg border border-dashed border-border hover:border-primary/50 flex items-center justify-center transition-colors"
                >
                  <Plus className="w-4 h-4 text-muted-foreground" />
                </button>
              </TooltipTrigger>
              <TooltipContent side="right">
                <p className="font-medium">Add Agent</p>
              </TooltipContent>
            </Tooltip>
          )}
        </div>

        <div className="h-20 lg:h-4" />
      </div>
    </TooltipProvider>
  );
}
