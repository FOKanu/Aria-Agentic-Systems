import { useEffect, useState, useCallback } from 'react';
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from '@/components/ui/command';
import { 
  Home, 
  MessageSquare, 
  LayoutDashboard, 
  ListTodo, 
  Eye, 
  Brain, 
  Settings, 
  Users,
  Search,
  Play,
  Pause,
  Square,
  User,
  FolderOpen
} from 'lucide-react';
import { AGENTS, UnifiedAgent } from '@/data/agentsData';
import { TabId } from '@/components/BottomNav';

interface CommandPaletteProps {
  onNavigate: (tab: TabId) => void;
  onSelectAgent: (agentId: string) => void;
  onPauseAgent?: (agentId: string) => void;
  onResumeAgent?: (agentId: string) => void;
  onStopAgent?: (agentId: string) => void;
  onViewProfile?: () => void;
}

const pages = [
  { id: 'home', label: 'Home', icon: Home, keywords: ['home', 'main', 'start'] },
  { id: 'chat', label: 'Chat', icon: MessageSquare, keywords: ['chat', 'message', 'talk', 'conversation'] },
  { id: 'files', label: 'Files', icon: FolderOpen, keywords: ['files', 'documents', 'folders', 'upload', 'storage'] },
  { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard, keywords: ['dashboard', 'overview', 'stats'] },
  { id: 'tasks', label: 'Tasks', icon: ListTodo, keywords: ['tasks', 'todo', 'missions', 'work'] },
  { id: 'vision', label: 'Vision', icon: Eye, keywords: ['vision', 'view', 'monitor', 'watch'] },
  { id: 'memory', label: 'Memory', icon: Brain, keywords: ['memory', 'knowledge', 'history'] },
  { id: 'agents', label: 'Fleet Command', icon: Users, keywords: ['agents', 'fleet', 'team', 'command'] },
  { id: 'settings', label: 'Settings', icon: Settings, keywords: ['settings', 'preferences', 'config'] },
];

export function CommandPalette({
  onNavigate,
  onSelectAgent,
  onPauseAgent,
  onResumeAgent,
  onStopAgent,
  onViewProfile,
}: CommandPaletteProps) {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === 'k' && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setOpen((open) => !open);
      }
    };

    document.addEventListener('keydown', down);
    return () => document.removeEventListener('keydown', down);
  }, []);

  const handleSelectPage = useCallback((pageId: string) => {
    onNavigate(pageId as TabId);
    setOpen(false);
  }, [onNavigate]);

  const handleSelectAgent = useCallback((agentId: string) => {
    onSelectAgent(agentId);
    setOpen(false);
  }, [onSelectAgent]);

  const handleAgentAction = useCallback((action: 'pause' | 'resume' | 'stop', agentId: string) => {
    if (action === 'pause' && onPauseAgent) onPauseAgent(agentId);
    if (action === 'resume' && onResumeAgent) onResumeAgent(agentId);
    if (action === 'stop' && onStopAgent) onStopAgent(agentId);
    setOpen(false);
  }, [onPauseAgent, onResumeAgent, onStopAgent]);

  const handleViewProfile = useCallback(() => {
    if (onViewProfile) onViewProfile();
    setOpen(false);
  }, [onViewProfile]);

  const getStatusColor = (status: UnifiedAgent['status']) => {
    switch (status) {
      case 'executing':
      case 'busy':
        return 'bg-green-500';
      case 'thinking':
        return 'bg-yellow-500';
      case 'waiting':
        return 'bg-blue-500';
      case 'error':
      case 'stunned':
        return 'bg-red-500';
      case 'available':
        return 'bg-emerald-500';
      default:
        return 'bg-muted-foreground/50';
    }
  };

  return (
    <CommandDialog open={open} onOpenChange={setOpen}>
      <CommandInput placeholder="Search pages, agents, or actions..." />
      <CommandList>
        <CommandEmpty>No results found.</CommandEmpty>
        
        <CommandGroup heading="Pages">
          {pages.map((page) => (
            <CommandItem
              key={page.id}
              value={`${page.label} ${page.keywords.join(' ')}`}
              onSelect={() => handleSelectPage(page.id)}
              className="cursor-pointer"
            >
              <page.icon className="mr-2 h-4 w-4" />
              <span>{page.label}</span>
            </CommandItem>
          ))}
        </CommandGroup>

        <CommandSeparator />

        <CommandGroup heading="Agents">
          {AGENTS.map((agent) => (
            <CommandItem
              key={agent.id}
              value={`${agent.name} ${agent.title} ${agent.role}`}
              onSelect={() => handleSelectAgent(agent.id)}
              className="cursor-pointer"
            >
              <span className="mr-2 text-lg">{agent.avatar}</span>
              <div className="flex flex-col flex-1">
                <span className="font-medium">{agent.name}</span>
                <span className="text-xs text-muted-foreground">{agent.title}</span>
              </div>
              <div className={`w-2 h-2 rounded-full ${getStatusColor(agent.status)}`} />
            </CommandItem>
          ))}
        </CommandGroup>

        <CommandSeparator />

        <CommandGroup heading="Quick Actions">
          {onViewProfile && (
            <CommandItem onSelect={handleViewProfile} className="cursor-pointer">
              <User className="mr-2 h-4 w-4" />
              <span>View Profile</span>
            </CommandItem>
          )}
          {AGENTS.filter(a => a.status === 'executing' || a.status === 'busy').map((agent) => (
            <CommandItem
              key={`pause-${agent.id}`}
              value={`pause ${agent.name}`}
              onSelect={() => handleAgentAction('pause', agent.id)}
              className="cursor-pointer"
            >
              <Pause className="mr-2 h-4 w-4" />
              <span>Pause {agent.name}</span>
            </CommandItem>
          ))}
          {AGENTS.filter(a => a.status === 'waiting' || a.status === 'idle').map((agent) => (
            <CommandItem
              key={`resume-${agent.id}`}
              value={`resume ${agent.name}`}
              onSelect={() => handleAgentAction('resume', agent.id)}
              className="cursor-pointer"
            >
              <Play className="mr-2 h-4 w-4" />
              <span>Resume {agent.name}</span>
            </CommandItem>
          ))}
        </CommandGroup>
      </CommandList>
    </CommandDialog>
  );
}
