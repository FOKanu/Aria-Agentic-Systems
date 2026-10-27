import { useState } from 'react';
import { GitBranch, ChevronRight, Brain, Zap, AlertTriangle, CheckCircle, Clock, ArrowRight, Eye } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { ScrollArea } from '@/components/ui/scroll-area';
import { mockAgents } from '@/data/agentsData';

interface DecisionNode {
  id: string;
  type: 'observation' | 'reasoning' | 'decision' | 'action' | 'result';
  content: string;
  confidence: number;
  timestamp: Date;
  children?: DecisionNode[];
  alternatives?: { option: string; score: number }[];
  metadata?: Record<string, string>;
}

interface ExecutionTrace {
  id: string;
  agentId: string;
  agentName: string;
  agentAvatar: string;
  taskName: string;
  status: 'running' | 'completed' | 'failed';
  startTime: Date;
  endTime?: Date;
  nodes: DecisionNode[];
  overallConfidence: number;
}

// Generate mock execution traces
const generateMockTraces = (): ExecutionTrace[] => {
  return mockAgents.slice(0, 4).map((agent, idx) => ({
    id: `trace-${idx}`,
    agentId: agent.id,
    agentName: agent.name,
    agentAvatar: agent.avatar,
    taskName: ['Process Sales Report', 'Schedule Meeting', 'Analyze Data', 'Generate Summary'][idx],
    status: idx === 0 ? 'running' : idx === 3 ? 'failed' : 'completed',
    startTime: new Date(Date.now() - Math.random() * 1000 * 60 * 30),
    endTime: idx !== 0 ? new Date(Date.now() - Math.random() * 1000 * 60 * 5) : undefined,
    overallConfidence: Math.random() * 0.3 + 0.65,
    nodes: [
      {
        id: `node-${idx}-1`,
        type: 'observation',
        content: 'Analyzed current screen state and identified actionable elements',
        confidence: 0.92,
        timestamp: new Date(Date.now() - 1000 * 60 * 10),
        metadata: { elements_found: '12', screen_type: 'dashboard' },
      },
      {
        id: `node-${idx}-2`,
        type: 'reasoning',
        content: 'Evaluated multiple approaches to accomplish the task objective',
        confidence: 0.85,
        timestamp: new Date(Date.now() - 1000 * 60 * 8),
        alternatives: [
          { option: 'Direct API call', score: 0.85 },
          { option: 'UI automation', score: 0.72 },
          { option: 'File-based approach', score: 0.58 },
        ],
      },
      {
        id: `node-${idx}-3`,
        type: 'decision',
        content: 'Selected optimal path: Direct API call with fallback to UI automation',
        confidence: 0.88,
        timestamp: new Date(Date.now() - 1000 * 60 * 6),
      },
      {
        id: `node-${idx}-4`,
        type: 'action',
        content: 'Executing API request to /api/data endpoint',
        confidence: 0.90,
        timestamp: new Date(Date.now() - 1000 * 60 * 4),
        metadata: { method: 'POST', endpoint: '/api/data', payload_size: '2.4KB' },
      },
      {
        id: `node-${idx}-5`,
        type: 'result',
        content: idx === 3 ? 'Action failed: API returned 403 Forbidden' : 'Successfully completed action with expected outcome',
        confidence: idx === 3 ? 0.15 : 0.94,
        timestamp: new Date(Date.now() - 1000 * 60 * 2),
      },
    ],
  }));
};

const nodeTypeConfig: Record<string, { icon: React.ElementType; color: string; bg: string }> = {
  observation: { icon: Eye, color: 'text-info', bg: 'bg-info/20' },
  reasoning: { icon: Brain, color: 'text-holo', bg: 'bg-holo/20' },
  decision: { icon: GitBranch, color: 'text-primary', bg: 'bg-primary/20' },
  action: { icon: Zap, color: 'text-warning', bg: 'bg-warning/20' },
  result: { icon: CheckCircle, color: 'text-success', bg: 'bg-success/20' },
};

export function ExecutionTracePage() {
  const [traces] = useState<ExecutionTrace[]>(generateMockTraces);
  const [selectedTrace, setSelectedTrace] = useState<ExecutionTrace | null>(traces[0]);
  const [expandedNodes, setExpandedNodes] = useState<Set<string>>(new Set());

  const toggleNode = (nodeId: string) => {
    setExpandedNodes(prev => {
      const next = new Set(prev);
      if (next.has(nodeId)) {
        next.delete(nodeId);
      } else {
        next.add(nodeId);
      }
      return next;
    });
  };

  const formatDuration = (start: Date, end?: Date) => {
    const endTime = end || new Date();
    const diff = endTime.getTime() - start.getTime();
    const minutes = Math.floor(diff / 60000);
    const seconds = Math.floor((diff % 60000) / 1000);
    return `${minutes}m ${seconds}s`;
  };

  return (
    <div className="space-y-4">
      {/* Trace Selector */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-2">
        {traces.map(trace => (
          <button
            key={trace.id}
            onClick={() => setSelectedTrace(trace)}
            className={cn(
              "p-3 rounded-xl border-2 transition-all text-left",
              selectedTrace?.id === trace.id
                ? "border-primary bg-primary/10"
                : "border-border bg-secondary/30 hover:bg-secondary/50"
            )}
          >
            <div className="flex items-center gap-2">
              <span className="text-lg">{trace.agentAvatar}</span>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-medium truncate">{trace.agentName}</p>
                <p className="text-[10px] text-muted-foreground truncate">{trace.taskName}</p>
              </div>
              <div className={cn(
                "w-2 h-2 rounded-full",
                trace.status === 'running' ? "bg-success animate-pulse" :
                trace.status === 'completed' ? "bg-success" : "bg-destructive"
              )} />
            </div>
          </button>
        ))}
      </div>

      {selectedTrace && (
        <>
          {/* Trace Overview */}
          <div className="p-4 rounded-xl bg-card border border-border">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-secondary flex items-center justify-center text-2xl">
                  {selectedTrace.agentAvatar}
                </div>
                <div>
                  <h3 className="font-display font-bold">{selectedTrace.taskName}</h3>
                  <p className="text-xs text-muted-foreground">
                    {selectedTrace.agentName} • Started {selectedTrace.startTime.toLocaleTimeString()}
                  </p>
                </div>
              </div>
              <div className="text-right">
                <Badge variant={
                  selectedTrace.status === 'running' ? 'default' :
                  selectedTrace.status === 'completed' ? 'secondary' : 'destructive'
                }>
                  {selectedTrace.status}
                </Badge>
                <p className="text-xs text-muted-foreground mt-1">
                  <Clock className="w-3 h-3 inline mr-1" />
                  {formatDuration(selectedTrace.startTime, selectedTrace.endTime)}
                </p>
              </div>
            </div>

            {/* Confidence Bar */}
            <div className="mt-4 space-y-1">
              <div className="flex items-center justify-between text-xs">
                <span className="text-muted-foreground">Overall Confidence</span>
                <span className="font-mono font-bold">{Math.round(selectedTrace.overallConfidence * 100)}%</span>
              </div>
              <Progress value={selectedTrace.overallConfidence * 100} className="h-2" />
            </div>
          </div>

          {/* Decision Tree */}
          <div className="p-4 rounded-xl bg-card border border-border">
            <h3 className="text-sm font-display font-bold mb-4 flex items-center gap-2">
              <GitBranch className="w-4 h-4 text-primary" />
              Execution Path
            </h3>

            <ScrollArea className="h-[400px]">
              <div className="space-y-2 pr-4">
                {selectedTrace.nodes.map((node, index) => {
                  const config = nodeTypeConfig[node.type];
                  const Icon = config.icon;
                  const isExpanded = expandedNodes.has(node.id);
                  const isLast = index === selectedTrace.nodes.length - 1;

                  return (
                    <div key={node.id} className="relative">
                      {/* Connecting Line */}
                      {!isLast && (
                        <div className="absolute left-4 top-10 bottom-0 w-0.5 bg-border" />
                      )}

                      <div
                        className={cn(
                          "relative p-3 rounded-xl border transition-all cursor-pointer",
                          isExpanded ? "bg-secondary/50 border-primary/50" : "bg-secondary/20 border-border hover:bg-secondary/40"
                        )}
                        onClick={() => toggleNode(node.id)}
                      >
                        {/* Node Header */}
                        <div className="flex items-start gap-3">
                          <div className={cn("w-8 h-8 rounded-lg flex items-center justify-center shrink-0", config.bg)}>
                            <Icon className={cn("w-4 h-4", config.color)} />
                          </div>

                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2">
                              <Badge variant="outline" className="text-[9px] capitalize">
                                {node.type}
                              </Badge>
                              <span className="text-[10px] text-muted-foreground">
                                {node.timestamp.toLocaleTimeString()}
                              </span>
                            </div>
                            <p className="text-sm mt-1">{node.content}</p>

                            {/* Confidence Indicator */}
                            <div className="flex items-center gap-2 mt-2">
                              <div className="flex-1 h-1.5 bg-secondary rounded-full overflow-hidden">
                                <div
                                  className={cn(
                                    "h-full rounded-full transition-all",
                                    node.confidence > 0.8 ? "bg-success" :
                                    node.confidence > 0.5 ? "bg-warning" : "bg-destructive"
                                  )}
                                  style={{ width: `${node.confidence * 100}%` }}
                                />
                              </div>
                              <span className="text-[10px] font-mono">
                                {Math.round(node.confidence * 100)}%
                              </span>
                            </div>
                          </div>

                          <ChevronRight className={cn(
                            "w-4 h-4 text-muted-foreground transition-transform shrink-0",
                            isExpanded && "rotate-90"
                          )} />
                        </div>

                        {/* Expanded Content */}
                        {isExpanded && (
                          <div className="mt-3 pt-3 border-t border-border/50 space-y-3 animate-fade-in">
                            {/* Alternatives */}
                            {node.alternatives && (
                              <div>
                                <p className="text-[10px] text-muted-foreground mb-2">Alternatives Considered:</p>
                                <div className="space-y-1">
                                  {node.alternatives.map((alt, i) => (
                                    <div key={i} className="flex items-center gap-2 text-xs">
                                      <ArrowRight className="w-3 h-3 text-muted-foreground" />
                                      <span>{alt.option}</span>
                                      <span className={cn(
                                        "font-mono text-[10px]",
                                        alt.score > 0.8 ? "text-success" : "text-muted-foreground"
                                      )}>
                                        {Math.round(alt.score * 100)}%
                                      </span>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            )}

                            {/* Metadata */}
                            {node.metadata && (
                              <div>
                                <p className="text-[10px] text-muted-foreground mb-2">Metadata:</p>
                                <div className="grid grid-cols-2 gap-2">
                                  {Object.entries(node.metadata).map(([key, value]) => (
                                    <div key={key} className="text-[10px]">
                                      <span className="text-muted-foreground">{key}:</span>
                                      <span className="ml-1 font-mono">{value}</span>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            )}

                            <div className="flex gap-2">
                              <Button variant="outline" size="sm" className="text-[10px] h-6 px-2">
                                View Raw
                              </Button>
                              <Button variant="outline" size="sm" className="text-[10px] h-6 px-2">
                                Explain
                              </Button>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </ScrollArea>
          </div>
        </>
      )}
    </div>
  );
}
