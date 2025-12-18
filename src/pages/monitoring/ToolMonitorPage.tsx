import { useState, useEffect } from 'react';
import { Wrench, Clock, CheckCircle, XCircle, ChevronDown, ChevronRight, Activity, Zap, Database, Globe, FileText, Code } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { ScrollArea } from '@/components/ui/scroll-area';
import { mockAgents } from '@/data/agentsData';

type ToolCategory = 'api' | 'file' | 'browser' | 'database' | 'compute' | 'utility';

interface ToolInvocation {
  id: string;
  agentId: string;
  agentName: string;
  agentAvatar: string;
  toolName: string;
  category: ToolCategory;
  status: 'pending' | 'running' | 'success' | 'failed';
  startTime: Date;
  endTime?: Date;
  latency?: number;
  request: {
    method?: string;
    endpoint?: string;
    params?: Record<string, string>;
  };
  response?: {
    status?: number;
    size?: string;
    data?: string;
  };
  error?: string;
}

interface ToolStats {
  name: string;
  category: ToolCategory;
  calls: number;
  avgLatency: number;
  successRate: number;
}

const categoryConfig: Record<ToolCategory, { icon: React.ElementType; color: string; label: string }> = {
  api: { icon: Globe, color: 'text-primary', label: 'API' },
  file: { icon: FileText, color: 'text-success', label: 'File' },
  browser: { icon: Globe, color: 'text-holo', label: 'Browser' },
  database: { icon: Database, color: 'text-warning', label: 'Database' },
  compute: { icon: Zap, color: 'text-info', label: 'Compute' },
  utility: { icon: Wrench, color: 'text-muted-foreground', label: 'Utility' },
};

const generateMockInvocations = (): ToolInvocation[] => {
  const tools: { name: string; category: ToolCategory }[] = [
    { name: 'http_request', category: 'api' },
    { name: 'file_read', category: 'file' },
    { name: 'file_write', category: 'file' },
    { name: 'browser_navigate', category: 'browser' },
    { name: 'browser_click', category: 'browser' },
    { name: 'db_query', category: 'database' },
    { name: 'code_execute', category: 'compute' },
    { name: 'json_parse', category: 'utility' },
  ];

  return Array.from({ length: 30 }, (_, i) => {
    const agent = mockAgents[Math.floor(Math.random() * mockAgents.length)];
    const tool = tools[Math.floor(Math.random() * tools.length)];
    const statuses: ('pending' | 'running' | 'success' | 'failed')[] = ['pending', 'running', 'success', 'failed'];
    const status: 'pending' | 'running' | 'success' | 'failed' = Math.random() > 0.9 ? 'failed' : Math.random() > 0.1 ? 'success' : 'running';
    const latency = Math.floor(Math.random() * 800) + 50;

    return {
      id: `inv-${i}`,
      agentId: agent.id,
      agentName: agent.name,
      agentAvatar: agent.avatar,
      toolName: tool.name,
      category: tool.category,
      status,
      startTime: new Date(Date.now() - Math.random() * 1000 * 60 * 30),
      endTime: status !== 'running' ? new Date(Date.now() - Math.random() * 1000 * 60 * 5) : undefined,
      latency: status !== 'running' ? latency : undefined,
      request: {
        method: tool.category === 'api' ? 'POST' : undefined,
        endpoint: tool.category === 'api' ? '/api/v1/data' : tool.name,
        params: { input: 'sample_data', format: 'json' },
      },
      response: status === 'success' ? {
        status: 200,
        size: `${Math.floor(Math.random() * 10) + 1}.${Math.floor(Math.random() * 9)}KB`,
        data: '{"result": "success", "data": [...]}',
      } : undefined,
      error: status === 'failed' ? 'Connection timeout after 5000ms' : undefined,
    };
  }).sort((a, b) => b.startTime.getTime() - a.startTime.getTime());
};

const generateToolStats = (invocations: ToolInvocation[]): ToolStats[] => {
  const statsMap = new Map<string, { calls: number; totalLatency: number; successes: number; category: ToolCategory }>();

  invocations.forEach(inv => {
    const existing = statsMap.get(inv.toolName) || { calls: 0, totalLatency: 0, successes: 0, category: inv.category };
    existing.calls++;
    if (inv.latency) existing.totalLatency += inv.latency;
    if (inv.status === 'success') existing.successes++;
    statsMap.set(inv.toolName, existing);
  });

  return Array.from(statsMap.entries()).map(([name, data]) => ({
    name,
    category: data.category,
    calls: data.calls,
    avgLatency: Math.round(data.totalLatency / data.calls),
    successRate: (data.successes / data.calls) * 100,
  })).sort((a, b) => b.calls - a.calls);
};

export function ToolMonitorPage() {
  const [invocations, setInvocations] = useState<ToolInvocation[]>([]);
  const [toolStats, setToolStats] = useState<ToolStats[]>([]);
  const [expandedIds, setExpandedIds] = useState<Set<string>>(new Set());
  const [filterCategory, setFilterCategory] = useState<ToolCategory | 'all'>('all');
  const [isLive, setIsLive] = useState(true);

  useEffect(() => {
    const data = generateMockInvocations();
    setInvocations(data);
    setToolStats(generateToolStats(data));
  }, []);

  // Simulate live updates
  useEffect(() => {
    if (!isLive) return;

    const interval = setInterval(() => {
      const agent = mockAgents[Math.floor(Math.random() * mockAgents.length)];
      const tools: { name: string; category: ToolCategory }[] = [
        { name: 'http_request', category: 'api' },
        { name: 'browser_click', category: 'browser' },
        { name: 'db_query', category: 'database' },
      ];
      const tool = tools[Math.floor(Math.random() * tools.length)];

      const newInvocation: ToolInvocation = {
        id: `inv-live-${Date.now()}`,
        agentId: agent.id,
        agentName: agent.name,
        agentAvatar: agent.avatar,
        toolName: tool.name,
        category: tool.category,
        status: 'success',
        startTime: new Date(),
        endTime: new Date(),
        latency: Math.floor(Math.random() * 300) + 50,
        request: { endpoint: tool.name },
        response: { status: 200, size: '1.2KB' },
      };

      setInvocations(prev => {
        const updated = [newInvocation, ...prev.slice(0, 49)];
        setToolStats(generateToolStats(updated));
        return updated;
      });
    }, 4000);

    return () => clearInterval(interval);
  }, [isLive]);

  const toggleExpand = (id: string) => {
    setExpandedIds(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const filteredInvocations = invocations.filter(inv =>
    filterCategory === 'all' || inv.category === filterCategory
  );

  return (
    <div className="space-y-4">
      {/* Controls */}
      <div className="flex items-center gap-2">
        <Button
          variant={isLive ? "default" : "outline"}
          size="sm"
          onClick={() => setIsLive(!isLive)}
          className="gap-2"
        >
          <div className={cn("w-2 h-2 rounded-full", isLive ? "bg-success animate-pulse" : "bg-muted-foreground")} />
          {isLive ? 'Live' : 'Paused'}
        </Button>

        <div className="flex gap-1 ml-auto">
          {(['all', ...Object.keys(categoryConfig)] as (ToolCategory | 'all')[]).map(cat => (
            <Button
              key={cat}
              variant={filterCategory === cat ? "default" : "ghost"}
              size="sm"
              onClick={() => setFilterCategory(cat)}
              className="text-[10px] h-7 px-2"
            >
              {cat === 'all' ? 'All' : categoryConfig[cat].label}
            </Button>
          ))}
        </div>
      </div>

      {/* Tool Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-2">
        {toolStats.slice(0, 4).map(stat => {
          const config = categoryConfig[stat.category];
          const Icon = config.icon;

          return (
            <div key={stat.name} className="p-3 rounded-xl bg-card border border-border">
              <div className="flex items-center gap-2 mb-2">
                <Icon className={cn("w-4 h-4", config.color)} />
                <span className="text-xs font-medium truncate">{stat.name}</span>
              </div>
              <div className="grid grid-cols-3 gap-2 text-center">
                <div>
                  <p className="text-lg font-mono font-bold">{stat.calls}</p>
                  <p className="text-[9px] text-muted-foreground">Calls</p>
                </div>
                <div>
                  <p className="text-lg font-mono font-bold">{stat.avgLatency}<span className="text-[10px]">ms</span></p>
                  <p className="text-[9px] text-muted-foreground">Avg</p>
                </div>
                <div>
                  <p className={cn("text-lg font-mono font-bold", stat.successRate > 90 ? "text-success" : "text-warning")}>
                    {Math.round(stat.successRate)}%
                  </p>
                  <p className="text-[9px] text-muted-foreground">Success</p>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Invocations List */}
      <ScrollArea className="h-[450px] rounded-xl border border-border bg-card/50">
        <div className="p-2 space-y-1">
          {filteredInvocations.map((inv, index) => {
            const config = categoryConfig[inv.category];
            const Icon = config.icon;
            const isExpanded = expandedIds.has(inv.id);

            return (
              <div
                key={inv.id}
                className={cn(
                  "p-2 rounded-lg border transition-all cursor-pointer hover:bg-secondary/50",
                  index === 0 && isLive ? "animate-fade-in border-primary/50 bg-primary/5" : "border-border",
                  isExpanded && "bg-secondary/30"
                )}
                onClick={() => toggleExpand(inv.id)}
              >
                <div className="flex items-start gap-2">
                  {/* Tool Icon */}
                  <div className={cn("w-8 h-8 rounded-lg flex items-center justify-center shrink-0", `bg-${config.color.split('-')[1]}/20`)}>
                    <Icon className={cn("w-4 h-4", config.color)} />
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-medium font-mono">{inv.toolName}</span>
                      <Badge variant="outline" className={cn(
                        "text-[9px] px-1 py-0",
                        inv.status === 'success' ? "bg-success/20 text-success" :
                        inv.status === 'failed' ? "bg-destructive/20 text-destructive" :
                        inv.status === 'running' ? "bg-warning/20 text-warning" : ""
                      )}>
                        {inv.status === 'running' && <Activity className="w-2 h-2 mr-1 animate-spin" />}
                        {inv.status}
                      </Badge>
                    </div>
                    <p className="text-[10px] text-muted-foreground truncate mt-0.5">
                      {inv.agentName} • {inv.request.endpoint}
                    </p>
                  </div>

                  {/* Latency & Expand */}
                  <div className="flex items-center gap-2 shrink-0">
                    {inv.latency && (
                      <span className={cn(
                        "text-[10px] font-mono",
                        inv.latency < 200 ? "text-success" :
                        inv.latency < 500 ? "text-warning" : "text-destructive"
                      )}>
                        {inv.latency}ms
                      </span>
                    )}
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
                    {/* Request */}
                    <div>
                      <p className="text-[10px] text-muted-foreground mb-1">Request:</p>
                      <pre className="text-[10px] font-mono bg-secondary/50 p-2 rounded overflow-x-auto">
                        {JSON.stringify(inv.request, null, 2)}
                      </pre>
                    </div>

                    {/* Response */}
                    {inv.response && (
                      <div>
                        <p className="text-[10px] text-muted-foreground mb-1">Response:</p>
                        <pre className="text-[10px] font-mono bg-secondary/50 p-2 rounded overflow-x-auto">
                          {JSON.stringify(inv.response, null, 2)}
                        </pre>
                      </div>
                    )}

                    {/* Error */}
                    {inv.error && (
                      <div className="p-2 rounded bg-destructive/10 border border-destructive/30">
                        <p className="text-[10px] text-destructive font-mono">{inv.error}</p>
                      </div>
                    )}

                    <div className="flex gap-2">
                      <Button variant="outline" size="sm" className="text-[10px] h-6 px-2">
                        <Code className="w-3 h-3 mr-1" />
                        Copy cURL
                      </Button>
                      <Button variant="outline" size="sm" className="text-[10px] h-6 px-2">
                        Retry
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
