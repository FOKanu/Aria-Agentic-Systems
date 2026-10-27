import { useState, useEffect } from 'react';
import { Activity, Filter, Clock, MousePointer, Keyboard, Globe, Database, ChevronDown, ChevronRight, AlertCircle, CheckCircle, XCircle, Info } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { mockAgents } from '@/data/agentsData';

type ActionType = 'click' | 'type' | 'navigate' | 'api_call' | 'file_access' | 'decision' | 'error' | 'success';
type SeverityLevel = 'info' | 'warning' | 'error' | 'success';

interface AgentAction {
  id: string;
  agentId: string;
  agentName: string;
  agentAvatar: string;
  type: ActionType;
  action: string;
  details: string;
  target?: string;
  timestamp: Date;
  severity: SeverityLevel;
  duration?: number;
  metadata?: Record<string, string>;
}

// Generate mock activity data
const generateMockActions = (): AgentAction[] => {
  const actions: AgentAction[] = [];
  const actionTypes: { type: ActionType; actions: string[] }[] = [
    { type: 'click', actions: ['Clicked button', 'Selected element', 'Opened dropdown', 'Submitted form'] },
    { type: 'type', actions: ['Entered text', 'Typed search query', 'Filled input field', 'Edited content'] },
    { type: 'navigate', actions: ['Navigated to page', 'Scrolled to section', 'Switched tab', 'Opened modal'] },
    { type: 'api_call', actions: ['Called API endpoint', 'Fetched data', 'Posted request', 'Updated resource'] },
    { type: 'file_access', actions: ['Opened file', 'Saved document', 'Downloaded asset', 'Uploaded file'] },
    { type: 'decision', actions: ['Made decision', 'Evaluated condition', 'Selected path', 'Determined action'] },
  ];

  const targets = ['Submit Button', '/api/users', 'search-input', 'document.xlsx', 'Settings Modal', 'Navigation Menu', 'Data Table', 'Form Field'];
  const severities: SeverityLevel[] = ['info', 'info', 'info', 'warning', 'success', 'info'];

  for (let i = 0; i < 50; i++) {
    const agent = mockAgents[Math.floor(Math.random() * mockAgents.length)];
    const actionGroup = actionTypes[Math.floor(Math.random() * actionTypes.length)];
    const action = actionGroup.actions[Math.floor(Math.random() * actionGroup.actions.length)];
    const severity = Math.random() > 0.95 ? 'error' : severities[Math.floor(Math.random() * severities.length)];

    actions.push({
      id: `action-${i}`,
      agentId: agent.id,
      agentName: agent.name,
      agentAvatar: agent.avatar,
      type: actionGroup.type,
      action,
      details: `${action} on ${targets[Math.floor(Math.random() * targets.length)]}`,
      target: targets[Math.floor(Math.random() * targets.length)],
      timestamp: new Date(Date.now() - Math.random() * 1000 * 60 * 60),
      severity,
      duration: Math.floor(Math.random() * 500) + 50,
      metadata: {
        confidence: `${Math.floor(Math.random() * 30) + 70}%`,
        retries: `${Math.floor(Math.random() * 3)}`,
      },
    });
  }

  return actions.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
};

const actionTypeConfig: Record<ActionType, { icon: React.ElementType; color: string }> = {
  click: { icon: MousePointer, color: 'text-primary' },
  type: { icon: Keyboard, color: 'text-holo' },
  navigate: { icon: Globe, color: 'text-success' },
  api_call: { icon: Database, color: 'text-warning' },
  file_access: { icon: Database, color: 'text-info' },
  decision: { icon: Activity, color: 'text-muted-foreground' },
  error: { icon: XCircle, color: 'text-destructive' },
  success: { icon: CheckCircle, color: 'text-success' },
};

const severityConfig: Record<SeverityLevel, { icon: React.ElementType; bg: string; text: string }> = {
  info: { icon: Info, bg: 'bg-muted', text: 'text-muted-foreground' },
  warning: { icon: AlertCircle, bg: 'bg-warning/20', text: 'text-warning' },
  error: { icon: XCircle, bg: 'bg-destructive/20', text: 'text-destructive' },
  success: { icon: CheckCircle, bg: 'bg-success/20', text: 'text-success' },
};

export function ActivityStreamPage() {
  const [actions, setActions] = useState<AgentAction[]>([]);
  const [expandedIds, setExpandedIds] = useState<Set<string>>(new Set());
  const [filterType, setFilterType] = useState<ActionType | 'all'>('all');
  const [filterAgent, setFilterAgent] = useState<string | 'all'>('all');
  const [isLive, setIsLive] = useState(true);

  useEffect(() => {
    setActions(generateMockActions());
  }, []);

  // Simulate live updates
  useEffect(() => {
    if (!isLive) return;

    const interval = setInterval(() => {
      const agent = mockAgents[Math.floor(Math.random() * mockAgents.length)];
      const types: ActionType[] = ['click', 'type', 'navigate', 'api_call', 'decision'];
      const type = types[Math.floor(Math.random() * types.length)];
      
      const newAction: AgentAction = {
        id: `action-live-${Date.now()}`,
        agentId: agent.id,
        agentName: agent.name,
        agentAvatar: agent.avatar,
        type,
        action: `Performed ${type}`,
        details: `Live action from ${agent.name}`,
        timestamp: new Date(),
        severity: 'info',
        duration: Math.floor(Math.random() * 200) + 50,
      };

      setActions(prev => [newAction, ...prev.slice(0, 99)]);
    }, 3000);

    return () => clearInterval(interval);
  }, [isLive]);

  const toggleExpand = (id: string) => {
    setExpandedIds(prev => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  const filteredActions = actions.filter(action => {
    if (filterType !== 'all' && action.type !== filterType) return false;
    if (filterAgent !== 'all' && action.agentId !== filterAgent) return false;
    return true;
  });

  const formatTime = (date: Date) => {
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    
    if (diff < 60000) return `${Math.floor(diff / 1000)}s ago`;
    if (diff < 3600000) return `${Math.floor(diff / 60000)}m ago`;
    return date.toLocaleTimeString();
  };

  return (
    <div className="space-y-4">
      {/* Controls */}
      <div className="flex flex-wrap items-center gap-2">
        <Button
          variant={isLive ? "default" : "outline"}
          size="sm"
          onClick={() => setIsLive(!isLive)}
          className="gap-2"
        >
          <div className={cn("w-2 h-2 rounded-full", isLive ? "bg-success animate-pulse" : "bg-muted-foreground")} />
          {isLive ? 'Live' : 'Paused'}
        </Button>

        <div className="flex items-center gap-1 ml-auto">
          <Filter className="w-4 h-4 text-muted-foreground" />
          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value as ActionType | 'all')}
            className="text-xs bg-secondary border border-border rounded-lg px-2 py-1.5"
          >
            <option value="all">All Types</option>
            <option value="click">Clicks</option>
            <option value="type">Typing</option>
            <option value="navigate">Navigation</option>
            <option value="api_call">API Calls</option>
            <option value="file_access">File Access</option>
            <option value="decision">Decisions</option>
          </select>

          <select
            value={filterAgent}
            onChange={(e) => setFilterAgent(e.target.value)}
            className="text-xs bg-secondary border border-border rounded-lg px-2 py-1.5"
          >
            <option value="all">All Agents</option>
            {mockAgents.map(agent => (
              <option key={agent.id} value={agent.id}>{agent.name}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Stats Bar */}
      <div className="grid grid-cols-4 gap-2">
        {(['click', 'api_call', 'navigate', 'decision'] as ActionType[]).map(type => {
          const config = actionTypeConfig[type];
          const Icon = config.icon;
          const count = actions.filter(a => a.type === type).length;
          
          return (
            <div key={type} className="p-2 rounded-lg bg-secondary/50 border border-border">
              <div className="flex items-center gap-2">
                <Icon className={cn("w-3 h-3", config.color)} />
                <span className="text-[10px] text-muted-foreground capitalize">{type.replace('_', ' ')}</span>
              </div>
              <p className="text-lg font-mono font-bold mt-1">{count}</p>
            </div>
          );
        })}
      </div>

      {/* Activity Stream */}
      <ScrollArea className="h-[500px] rounded-xl border border-border bg-card/50">
        <div className="p-2 space-y-1">
          {filteredActions.map((action, index) => {
            const typeConfig = actionTypeConfig[action.type];
            const sevConfig = severityConfig[action.severity];
            const TypeIcon = typeConfig.icon;
            const isExpanded = expandedIds.has(action.id);

            return (
              <div
                key={action.id}
                className={cn(
                  "p-2 rounded-lg border transition-all cursor-pointer hover:bg-secondary/50",
                  index === 0 && isLive ? "animate-fade-in border-primary/50 bg-primary/5" : "border-border",
                  isExpanded && "bg-secondary/30"
                )}
                onClick={() => toggleExpand(action.id)}
              >
                <div className="flex items-start gap-2">
                  {/* Agent Avatar */}
                  <div className="w-7 h-7 rounded-lg bg-secondary flex items-center justify-center text-sm shrink-0">
                    {action.agentAvatar}
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <TypeIcon className={cn("w-3 h-3 shrink-0", typeConfig.color)} />
                      <span className="text-xs font-medium truncate">{action.action}</span>
                      <Badge variant="outline" className={cn("text-[9px] px-1 py-0", sevConfig.bg, sevConfig.text)}>
                        {action.severity}
                      </Badge>
                    </div>
                    <p className="text-[10px] text-muted-foreground truncate mt-0.5">
                      {action.agentName} • {action.details}
                    </p>
                  </div>

                  {/* Time & Expand */}
                  <div className="flex items-center gap-1 shrink-0">
                    <span className="text-[10px] text-muted-foreground">{formatTime(action.timestamp)}</span>
                    {isExpanded ? (
                      <ChevronDown className="w-3 h-3 text-muted-foreground" />
                    ) : (
                      <ChevronRight className="w-3 h-3 text-muted-foreground" />
                    )}
                  </div>
                </div>

                {/* Expanded Details */}
                {isExpanded && (
                  <div className="mt-2 pt-2 border-t border-border/50 space-y-2 animate-fade-in">
                    <div className="grid grid-cols-2 gap-2 text-[10px]">
                      <div>
                        <span className="text-muted-foreground">Target:</span>
                        <span className="ml-1 font-mono">{action.target || 'N/A'}</span>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Duration:</span>
                        <span className="ml-1 font-mono">{action.duration}ms</span>
                      </div>
                      {action.metadata && Object.entries(action.metadata).map(([key, value]) => (
                        <div key={key}>
                          <span className="text-muted-foreground capitalize">{key}:</span>
                          <span className="ml-1 font-mono">{value}</span>
                        </div>
                      ))}
                    </div>
                    <div className="flex gap-2">
                      <Button variant="outline" size="sm" className="text-[10px] h-6 px-2">
                        View Context
                      </Button>
                      <Button variant="outline" size="sm" className="text-[10px] h-6 px-2">
                        Replay
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </ScrollArea>
    </div>
  );
}
