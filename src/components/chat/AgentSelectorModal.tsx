import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { ChatAgent, AgentPreset, AGENT_PRESETS } from '@/types/chat';
import { cn } from '@/lib/utils';
import { Check, Circle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';

interface AgentSelectorModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  agents: ChatAgent[];
  selectedAgentIds: string[];
  onSelectAgents: (ids: string[]) => void;
  onSelectPreset: (preset: AgentPreset) => void;
}

export function AgentSelectorModal({
  open,
  onOpenChange,
  agents,
  selectedAgentIds,
  onSelectAgents,
  onSelectPreset,
}: AgentSelectorModalProps) {
  const toggleAgent = (agentId: string) => {
    if (selectedAgentIds.includes(agentId)) {
      onSelectAgents(selectedAgentIds.filter((id) => id !== agentId));
    } else {
      onSelectAgents([...selectedAgentIds, agentId]);
    }
  };

  const handlePresetSelect = (preset: AgentPreset) => {
    onSelectPreset(preset);
    onOpenChange(false);
  };

  const handleDone = () => {
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="font-display">Select Agents</DialogTitle>
        </DialogHeader>

        {/* Presets */}
        <div className="space-y-2">
          <p className="text-sm text-muted-foreground font-medium">Presets</p>
          <div className="grid grid-cols-2 gap-2">
            {AGENT_PRESETS.map((preset) => (
              <Button
                key={preset.id}
                variant="outline"
                size="sm"
                className="justify-start text-left h-auto py-2"
                onClick={() => handlePresetSelect(preset)}
              >
                <div>
                  <p className="font-medium text-sm">{preset.name}</p>
                  <p className="text-xs text-muted-foreground">{preset.description}</p>
                </div>
              </Button>
            ))}
          </div>
        </div>

        <Separator />

        {/* Individual Agents */}
        <div className="space-y-2">
          <p className="text-sm text-muted-foreground font-medium">Individual Agents</p>
          <div className="space-y-2 max-h-64 overflow-y-auto">
            {agents.map((agent) => {
              const isSelected = selectedAgentIds.includes(agent.id);
              const isBusy = agent.status === 'busy';
              const isOffline = agent.status === 'offline';

              return (
                <button
                  key={agent.id}
                  onClick={() => !isOffline && toggleAgent(agent.id)}
                  disabled={isOffline}
                  className={cn(
                    'w-full flex items-center gap-3 p-3 rounded-lg border transition-all text-left',
                    isSelected
                      ? 'border-primary bg-primary/10'
                      : 'border-border hover:border-primary/50 hover:bg-secondary/50',
                    isOffline && 'opacity-50 cursor-not-allowed'
                  )}
                >
                  {/* Selection Indicator */}
                  <div
                    className={cn(
                      'w-5 h-5 rounded-md border-2 flex items-center justify-center transition-colors',
                      isSelected ? 'bg-primary border-primary' : 'border-muted-foreground'
                    )}
                  >
                    {isSelected && <Check className="w-3 h-3 text-primary-foreground" />}
                  </div>

                  {/* Avatar */}
                  <div className="w-10 h-10 rounded-full bg-secondary flex items-center justify-center text-lg">
                    {agent.avatar}
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-medium">{agent.name}</span>
                      <span
                        className={cn(
                          'w-2 h-2 rounded-full',
                          agent.status === 'available' && 'bg-success',
                          agent.status === 'busy' && 'bg-warning',
                          agent.status === 'offline' && 'bg-muted-foreground'
                        )}
                      />
                    </div>
                    <div className="flex flex-wrap gap-1 mt-1">
                      {agent.capabilities.slice(0, 2).map((cap) => (
                        <span key={cap} className="text-xs bg-muted px-2 py-0.5 rounded-full">
                          {cap}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Status Badge */}
                  <span
                    className={cn(
                      'text-xs px-2 py-1 rounded-full',
                      agent.status === 'available' && 'bg-success/20 text-success',
                      agent.status === 'busy' && 'bg-warning/20 text-warning',
                      agent.status === 'offline' && 'bg-muted text-muted-foreground'
                    )}
                  >
                    {agent.status}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        <Button onClick={handleDone} className="w-full">
          Done ({selectedAgentIds.length} selected)
        </Button>
      </DialogContent>
    </Dialog>
  );
}
