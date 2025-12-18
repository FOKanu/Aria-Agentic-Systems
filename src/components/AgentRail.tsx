import { useState } from 'react';
import { Plus, LayoutGrid, Home, MessageSquare, Bot, LayoutDashboard, ListTodo, Eye, Brain, Settings, X, Pause, Play, Square, Edit, ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Button } from "@/components/ui/button";

export interface Agent {
  id: string;
  name: string;
  avatar?: string;
  status: 'idle' | 'thinking' | 'executing' | 'waiting' | 'error' | 'stunned';
  type: 'assistant' | 'developer' | 'researcher';
}

interface AgentRailProps {
  agents: Agent[];
  visibleAgentIds: string[];
  selectedAgentId: string | null;
  onSelectAgent: (agentId: string) => void;
  onOpenFleetCommand: () => void;
  onCreateAgent: () => void;
  onNavigate?: (tab: string) => void;
  onRemoveFromPanel?: (agentId: string) => void;
  onAddToPanel?: (agentId: string) => void;
  onPauseAgent?: (agentId: string) => void;
  onResumeAgent?: (agentId: string) => void;
  onStopAgent?: (agentId: string) => void;
  onModifyTask?: (agentId: string) => void;
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

const menuItems = [
  { id: 'home', label: 'Home', icon: Home },
  { id: 'chat', label: 'Chat', icon: MessageSquare },
  { id: 'agents', label: 'Agents', icon: Bot },
  { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { id: 'tasks', label: 'Tasks', icon: ListTodo },
  { id: 'vision', label: 'Vision', icon: Eye },
  { id: 'memory', label: 'Memory', icon: Brain },
  { id: 'settings', label: 'Settings', icon: Settings },
];

export function AgentRail({
  agents,
  visibleAgentIds,
  selectedAgentId,
  onSelectAgent,
  onOpenFleetCommand,
  onCreateAgent,
  onNavigate,
  onRemoveFromPanel,
  onAddToPanel,
  onPauseAgent,
  onResumeAgent,
  onStopAgent,
  onModifyTask,
}: AgentRailProps) {
  const [showAddMenu, setShowAddMenu] = useState(false);
  const [openAgentPopover, setOpenAgentPopover] = useState<string | null>(null);
  
  const visibleAgents = agents.filter(a => visibleAgentIds.includes(a.id));
  const hiddenAgents = agents.filter(a => !visibleAgentIds.includes(a.id));

  const isAgentActive = (status: Agent['status']) => 
    status === 'thinking' || status === 'executing' || status === 'waiting';

  return (
    <TooltipProvider delayDuration={200}>
      <div className="fixed left-0 top-0 h-full w-16 bg-sidebar border-r border-sidebar-border flex flex-col items-center py-4 z-50">
        {/* Main Menu Button */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button
              className="w-10 h-10 rounded-lg bg-primary/10 border border-border flex items-center justify-center mb-4 hover:bg-primary/20 transition-colors focus:outline-none focus:ring-2 focus:ring-primary/50"
            >
              <LayoutGrid className="w-5 h-5 text-primary" />
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent 
            side="right" 
            align="start" 
            className="w-48 bg-popover border border-border z-[100]"
          >
            {menuItems.map((item) => {
              const Icon = item.icon;
              return (
                <DropdownMenuItem
                  key={item.id}
                  onClick={() => onNavigate?.(item.id)}
                  className="flex items-center gap-3 cursor-pointer"
                >
                  <Icon className="w-4 h-4" />
                  <span>{item.label}</span>
                </DropdownMenuItem>
              );
            })}
          </DropdownMenuContent>
        </DropdownMenu>

        <div className="w-8 h-px bg-border mb-4" />

        {/* Agent Avatars */}
        <div className="flex-1 flex flex-col items-center gap-2 overflow-y-auto scrollbar-thin">
          {visibleAgents.map((agent) => (
            <Popover 
              key={agent.id} 
              open={openAgentPopover === agent.id}
              onOpenChange={(open) => setOpenAgentPopover(open ? agent.id : null)}
            >
              <PopoverTrigger asChild>
                <button
                  className={cn(
                    "relative w-10 h-10 rounded-lg transition-all group",
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
              </PopoverTrigger>
              <PopoverContent 
                side="right" 
                align="start"
                className="w-64 p-3 bg-popover border border-border z-[100]"
              >
                {/* Agent Header */}
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 rounded-lg bg-secondary flex items-center justify-center text-xl">
                    {agent.avatar || '🤖'}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-foreground truncate">{agent.name}</p>
                    <p className="text-xs text-muted-foreground">{typeLabels[agent.type]}</p>
                  </div>
                  <div className={cn(
                    "px-2 py-0.5 rounded text-xs font-medium",
                    agent.status === 'executing' && "bg-success/20 text-success",
                    agent.status === 'thinking' && "bg-primary/20 text-primary",
                    agent.status === 'waiting' && "bg-warning/20 text-warning",
                    agent.status === 'idle' && "bg-muted text-muted-foreground",
                    agent.status === 'error' && "bg-destructive/20 text-destructive",
                    agent.status === 'stunned' && "bg-destructive/20 text-destructive",
                  )}>
                    {agent.status}
                  </div>
                </div>

                {/* Quick Stats */}
                <div className="grid grid-cols-2 gap-2 mb-3 text-xs">
                  <div className="bg-secondary/50 rounded p-2">
                    <p className="text-muted-foreground">Success Rate</p>
                    <p className="font-medium text-foreground">94%</p>
                  </div>
                  <div className="bg-secondary/50 rounded p-2">
                    <p className="text-muted-foreground">Running Ops</p>
                    <p className="font-medium text-foreground">{isAgentActive(agent.status) ? '1' : '0'}</p>
                  </div>
                </div>

                {/* Agent Controls */}
                <div className="space-y-1.5">
                  <p className="text-xs text-muted-foreground font-medium mb-2">Agent Controls</p>
                  
                  {isAgentActive(agent.status) ? (
                    <Button
                      variant="outline"
                      size="sm"
                      className="w-full justify-start gap-2 text-warning hover:text-warning hover:bg-warning/10"
                      onClick={() => {
                        onPauseAgent?.(agent.id);
                        setOpenAgentPopover(null);
                      }}
                    >
                      <Pause className="w-4 h-4" />
                      Pause Agent
                    </Button>
                  ) : (
                    <Button
                      variant="outline"
                      size="sm"
                      className="w-full justify-start gap-2 text-success hover:text-success hover:bg-success/10"
                      onClick={() => {
                        onResumeAgent?.(agent.id);
                        setOpenAgentPopover(null);
                      }}
                    >
                      <Play className="w-4 h-4" />
                      Resume Agent
                    </Button>
                  )}

                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full justify-start gap-2"
                    onClick={() => {
                      onModifyTask?.(agent.id);
                      setOpenAgentPopover(null);
                    }}
                  >
                    <Edit className="w-4 h-4" />
                    Modify Task
                  </Button>

                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full justify-start gap-2 text-destructive hover:text-destructive hover:bg-destructive/10"
                    onClick={() => {
                      onStopAgent?.(agent.id);
                      setOpenAgentPopover(null);
                    }}
                  >
                    <Square className="w-4 h-4" />
                    Stop Agent
                  </Button>

                  <DropdownMenuSeparator className="my-2" />

                  <Button
                    variant="ghost"
                    size="sm"
                    className="w-full justify-start gap-2"
                    onClick={() => {
                      onSelectAgent(agent.id);
                      setOpenAgentPopover(null);
                    }}
                  >
                    <ChevronRight className="w-4 h-4" />
                    View Details
                  </Button>

                  <Button
                    variant="ghost"
                    size="sm"
                    className="w-full justify-start gap-2 text-destructive hover:text-destructive"
                    onClick={() => {
                      onRemoveFromPanel?.(agent.id);
                      setOpenAgentPopover(null);
                    }}
                  >
                    <X className="w-4 h-4" />
                    Remove from Panel
                  </Button>
                </div>
              </PopoverContent>
            </Popover>
          ))}

          {/* Add Agent Button */}
          {visibleAgents.length < 10 && (
            <DropdownMenu open={showAddMenu} onOpenChange={setShowAddMenu}>
              <DropdownMenuTrigger asChild>
                <button
                  className="w-10 h-10 rounded-lg border border-dashed border-border hover:border-primary/50 flex items-center justify-center transition-colors"
                >
                  <Plus className="w-4 h-4 text-muted-foreground" />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent 
                side="right" 
                align="start"
                className="w-56 bg-popover border border-border z-[100]"
              >
                {hiddenAgents.length > 0 && (
                  <>
                    <div className="px-2 py-1.5 text-xs text-muted-foreground font-medium">
                      Add to Panel
                    </div>
                    {hiddenAgents.map((agent) => (
                      <DropdownMenuItem
                        key={agent.id}
                        onClick={() => {
                          onAddToPanel?.(agent.id);
                          setShowAddMenu(false);
                        }}
                        className="flex items-center gap-3 cursor-pointer"
                      >
                        <div className="w-6 h-6 rounded bg-secondary flex items-center justify-center text-sm">
                          {agent.avatar || '🤖'}
                        </div>
                        <div className="flex-1">
                          <p className="text-sm">{agent.name}</p>
                          <p className="text-xs text-muted-foreground">{typeLabels[agent.type]}</p>
                        </div>
                      </DropdownMenuItem>
                    ))}
                    <DropdownMenuSeparator />
                  </>
                )}
                <DropdownMenuItem
                  onClick={() => {
                    onCreateAgent();
                    setShowAddMenu(false);
                  }}
                  className="flex items-center gap-3 cursor-pointer"
                >
                  <div className="w-6 h-6 rounded bg-primary/10 flex items-center justify-center">
                    <Plus className="w-4 h-4 text-primary" />
                  </div>
                  <span>Create New Agent</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </div>

        <div className="h-20 lg:h-4" />
      </div>
    </TooltipProvider>
  );
}
