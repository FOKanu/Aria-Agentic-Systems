/**
 * Agent Rail Component
 * Created by Francis Okorie Iyeke-Kanu
 */
import { useState, useRef } from 'react';
import { Plus, LayoutGrid, Home, MessageSquare, Bot, LayoutDashboard, ListTodo, Eye, Brain, Settings, X, Pause, Play, Square, Edit, ChevronRight, Calendar, Mail, FileText, Phone, Code, Bookmark, GripVertical, Monitor, Activity, GitBranch, Wrench, AlertTriangle, FolderOpen, Scale, DollarSign, Share2, Users, Receipt, Gavel, GitMerge, TrendingUp, CreditCard, PieChart, FileCheck, Shield, Search, Megaphone, BarChart3, Heart, Workflow, Contact } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuLabel,
  DropdownMenuSub,
  DropdownMenuSubTrigger,
  DropdownMenuSubContent,
} from "@/components/ui/dropdown-menu";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Button } from "@/components/ui/button";

// Francis Okorie Iyeke-Kanu - Agent Interface
export interface Agent {
  id: string;
  name: string;
  title?: string;
  avatar?: string;
  status: 'idle' | 'thinking' | 'executing' | 'waiting' | 'error' | 'stunned' | 'available' | 'busy' | 'offline';
  role?: string;
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
  onReorderAgents?: (agentIds: string[]) => void;
}

const statusColors: Record<string, string> = {
  idle: 'bg-muted-foreground',
  thinking: 'bg-primary animate-pulse',
  executing: 'bg-success animate-pulse',
  waiting: 'bg-warning',
  error: 'bg-destructive',
  stunned: 'bg-destructive/50',
  available: 'bg-success',
  busy: 'bg-warning',
  offline: 'bg-muted-foreground',
};

// Francis Okorie Iyeke-Kanu - Navigation items
const navItems = [
  { id: 'home', label: 'Home', icon: Home },
  { id: 'chat', label: 'Chat', icon: MessageSquare },
  { id: 'files', label: 'Files', icon: FolderOpen },
  { id: 'agents', label: 'Agents', icon: Bot },
  { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { id: 'settings', label: 'Settings', icon: Settings },
];

// Monitoring items - dedicated section for monitoring features
const monitoringItems = [
  { id: 'monitoring', label: 'Monitoring Hub', icon: Monitor },
];

// Agent capability categories with sub-items.
// All sub-item ids map to a TabId handled inside Index.tsx's renderPage()
// switch, so navigating here keeps the AgentRail/TopBar/floating chat chrome
// mounted instead of jumping to a bare standalone route.
const capabilityCategories = [
  {
    id: 'admin',
    label: 'Admin',
    icon: Settings,
    subItems: [
      { id: 'calendar', label: 'Calendar Management', icon: Calendar },
      { id: 'email', label: 'Email Automation', icon: Mail },
      { id: 'phone', label: 'Phone & Calls', icon: Phone },
      { id: 'reservations', label: 'Reservations & Booking', icon: Bookmark },
      { id: 'contacts', label: 'Contact Management', icon: Contact },
      { id: 'workflows', label: 'Workflow Automation', icon: Workflow },
    ],
  },
  {
    id: 'finance',
    label: 'Finance',
    icon: DollarSign,
    subItems: [
      { id: 'invoices', label: 'Invoice Generation', icon: Receipt },
      { id: 'expenses', label: 'Expense Tracking', icon: CreditCard },
      { id: 'budget', label: 'Budget Planning', icon: PieChart },
      { id: 'reports', label: 'Financial Reports', icon: BarChart3 },
      { id: 'payments', label: 'Payment Processing', icon: DollarSign },
      { id: 'tax', label: 'Tax Preparation', icon: FileCheck },
    ],
  },
  {
    id: 'legal',
    label: 'Legal',
    icon: Scale,
    subItems: [
      { id: 'contracts', label: 'Contract Drafting', icon: FileText },
      { id: 'review', label: 'Document Review', icon: FileCheck },
      { id: 'compliance', label: 'Compliance Monitoring', icon: Shield },
      { id: 'nda', label: 'NDA Generator', icon: Gavel },
      { id: 'ip', label: 'IP Management', icon: Scale },
      { id: 'research', label: 'Case Research', icon: Search },
    ],
  },
  {
    id: 'devops',
    label: 'DevOps',
    icon: Code,
    subItems: [
      { id: 'devops-pipelines', label: 'CI/CD Pipelines', icon: GitMerge },
      { id: 'devops-code-review', label: 'Code Review', icon: Code },
      { id: 'devops-deployment', label: 'Deployment Automation', icon: GitBranch },
      { id: 'devops-infrastructure', label: 'Infrastructure Monitoring', icon: Monitor },
      { id: 'devops-security', label: 'Security Scanning', icon: Shield },
      { id: 'devops-logs', label: 'Log Analysis', icon: Activity },
    ],
  },
  {
    id: 'social',
    label: 'Social Media',
    icon: Share2,
    subItems: [
      { id: 'social-scheduling', label: 'Content Scheduling', icon: Calendar },
      { id: 'social-posts', label: 'Post Generation', icon: Megaphone },
      { id: 'social-analytics', label: 'Analytics Dashboard', icon: TrendingUp },
      { id: 'social-community', label: 'Community Management', icon: Users },
      { id: 'social-outreach', label: 'Influencer Outreach', icon: Heart },
      { id: 'social-trends', label: 'Trend Monitoring', icon: BarChart3 },
    ],
  },
];

// Standalone capability items
const standaloneCapabilities = [
  { id: 'documents', label: 'Documents', icon: FileText },
  { id: 'memory', label: 'Memory', icon: Brain },
  { id: 'tasks', label: 'Tasks', icon: ListTodo },
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
  onReorderAgents,
}: AgentRailProps) {
  const [showAddMenu, setShowAddMenu] = useState(false);
  const [openAgentPopover, setOpenAgentPopover] = useState<string | null>(null);
  const [draggedAgentId, setDraggedAgentId] = useState<string | null>(null);
  const [dragOverAgentId, setDragOverAgentId] = useState<string | null>(null);
  const dragNodeRef = useRef<HTMLDivElement | null>(null);
  
  const visibleAgents = visibleAgentIds
    .map(id => agents.find(a => a.id === id))
    .filter((a): a is Agent => a !== undefined);
  const hiddenAgents = agents.filter(a => !visibleAgentIds.includes(a.id));

  const isAgentActive = (status: Agent['status']) => 
    status === 'thinking' || status === 'executing' || status === 'waiting';

  const handleDragStart = (e: React.DragEvent, agentId: string) => {
    setDraggedAgentId(agentId);
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/plain', agentId);
    
    // Add a slight delay to allow the drag image to be set
    setTimeout(() => {
      if (dragNodeRef.current) {
        dragNodeRef.current.style.opacity = '0.5';
      }
    }, 0);
  };

  const handleDragEnd = () => {
    setDraggedAgentId(null);
    setDragOverAgentId(null);
    if (dragNodeRef.current) {
      dragNodeRef.current.style.opacity = '1';
    }
  };

  const handleDragOver = (e: React.DragEvent, agentId: string) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    if (agentId !== draggedAgentId) {
      setDragOverAgentId(agentId);
    }
  };

  const handleDragLeave = () => {
    setDragOverAgentId(null);
  };

  const handleDrop = (e: React.DragEvent, targetAgentId: string) => {
    e.preventDefault();
    
    if (!draggedAgentId || draggedAgentId === targetAgentId) {
      setDraggedAgentId(null);
      setDragOverAgentId(null);
      return;
    }

    const currentOrder = [...visibleAgentIds];
    const draggedIndex = currentOrder.indexOf(draggedAgentId);
    const targetIndex = currentOrder.indexOf(targetAgentId);

    if (draggedIndex !== -1 && targetIndex !== -1) {
      // Remove dragged item and insert at new position
      currentOrder.splice(draggedIndex, 1);
      currentOrder.splice(targetIndex, 0, draggedAgentId);
      
      onReorderAgents?.(currentOrder);
    }

    setDraggedAgentId(null);
    setDragOverAgentId(null);
  };

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
            className="w-52 bg-popover border border-border z-[100] max-h-[80vh] overflow-y-auto"
          >
            <DropdownMenuLabel className="text-xs text-muted-foreground">Navigation</DropdownMenuLabel>
            {navItems.map((item) => {
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
            <DropdownMenuSeparator />
            <DropdownMenuLabel className="text-xs text-muted-foreground">Monitoring</DropdownMenuLabel>
            {monitoringItems.map((item) => {
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
            <DropdownMenuSeparator />
            <DropdownMenuLabel className="text-xs text-muted-foreground">Agent Capabilities</DropdownMenuLabel>
            {capabilityCategories.map((category) => {
              const CategoryIcon = category.icon;
              return (
                <DropdownMenuSub key={category.id}>
                  <DropdownMenuSubTrigger className="flex items-center gap-3 cursor-pointer">
                    <CategoryIcon className="w-4 h-4" />
                    <span>{category.label}</span>
                  </DropdownMenuSubTrigger>
                  <DropdownMenuSubContent className="bg-popover border border-border z-[110]">
                    {category.subItems.map((subItem) => {
                      const SubIcon = subItem.icon;
                      return (
                        <DropdownMenuItem
                          key={subItem.id}
                          onClick={() => onNavigate?.(subItem.id)}
                          className="flex items-center gap-3 cursor-pointer"
                        >
                          <SubIcon className="w-4 h-4" />
                          <span>{subItem.label}</span>
                        </DropdownMenuItem>
                      );
                    })}
                  </DropdownMenuSubContent>
                </DropdownMenuSub>
              );
            })}
            <DropdownMenuSeparator />
            {standaloneCapabilities.map((item) => {
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
            <div
              key={agent.id}
              ref={draggedAgentId === agent.id ? dragNodeRef : null}
              draggable
              onDragStart={(e) => handleDragStart(e, agent.id)}
              onDragEnd={handleDragEnd}
              onDragOver={(e) => handleDragOver(e, agent.id)}
              onDragLeave={handleDragLeave}
              onDrop={(e) => handleDrop(e, agent.id)}
              className={cn(
                "relative transition-all duration-200",
                draggedAgentId === agent.id && "opacity-50",
                dragOverAgentId === agent.id && "transform scale-110",
                dragOverAgentId === agent.id && draggedAgentId && "before:absolute before:inset-x-0 before:-top-1 before:h-0.5 before:bg-primary before:rounded"
              )}
            >
              <Popover 
                open={openAgentPopover === agent.id}
                onOpenChange={(open) => setOpenAgentPopover(open ? agent.id : null)}
              >
                <PopoverTrigger asChild>
                  <button
                    className={cn(
                      "relative w-10 h-10 rounded-lg transition-all group cursor-grab active:cursor-grabbing",
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
                    
                    {/* Drag handle indicator on hover */}
                    <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-black/40 rounded-lg">
                      <GripVertical className="w-4 h-4 text-white" />
                    </div>
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
                      <p className="text-xs text-muted-foreground">{agent.title || agent.role}</p>
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
            </div>
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
                          <p className="text-xs text-muted-foreground">{agent.title || agent.role}</p>
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
