/**
 * Home Page Component
 * Author: Francis Okorie Iyeke-Kanu
 */
import { useState, useRef, useEffect } from 'react';
import { MessageSquare, CheckCircle, Clock, Activity, Send, Bot, AlertTriangle, ShieldCheck, Calendar, TrendingUp, Users, XCircle } from 'lucide-react';
import { cn } from '@/lib/utils';
import { mockTasks, mockEvents } from '@/data/mockData';
import { mockAgents, mockAgentStats } from '@/data/agentsData';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useAgentMention } from '@/hooks/useAgentMention';
import { AgentMentionPopover } from '@/components/chat/AgentMentionPopover';
import { ChatAgent, CHAT_AGENTS } from '@/types/chat';

interface HomePageProps {
  onNavigateToAgents: () => void;
  onNavigateToTasks: () => void;
  onNavigateToChat: (mentionedAgentIds?: string[]) => void;
}

// Mock data for new cards
const pendingApprovals = [
  { id: 'apr-1', task: 'Export report to PDF', agent: 'Atlas-Planner', priority: 'high' },
  { id: 'apr-2', task: 'Send email to team', agent: 'Aria-Communications', priority: 'medium' },
];

const scheduledTasks = [
  { id: 'sch-1', name: 'Daily backup', scheduledFor: '2:00 PM', agent: 'Flux-DevOps' },
  { id: 'sch-2', name: 'Weekly report generation', scheduledFor: 'Tomorrow 9:00 AM', agent: 'Atlas-Planner' },
  { id: 'sch-3', name: 'Database cleanup', scheduledFor: 'Dec 20, 3:00 PM', agent: 'Nexus-Admin' },
];

const successRateTrend = [85, 88, 82, 91, 87, 94, 92]; // Last 7 days

// Francis Okorie Iyeke-Kanu - Home Page
export function HomePage({ onNavigateToAgents, onNavigateToTasks, onNavigateToChat }: HomePageProps) {
  const [miniChatInput, setMiniChatInput] = useState('');
  const [miniChatOpen, setMiniChatOpen] = useState(false);
  const [selectedMentionIndex, setSelectedMentionIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  
  const { mentionState, handleInputChange, insertMention, parseMentions, closeMention } = useAgentMention();
  
  const runningTasks = mockTasks.filter(t => t.status === 'running');
  const completedTasks = mockTasks.filter(t => t.status === 'completed');
  const failedTasks = mockTasks.filter(t => t.status === 'failed');
  const activeAgents = mockAgents.filter(a => a.status === 'executing' || a.status === 'thinking');
  const idleAgents = mockAgents.filter(a => a.status === 'idle');
  const totalTasksCompleted = Object.values(mockAgentStats).reduce((acc, s) => acc + s.tasksCompleted, 0);
  const avgSuccessRate = Math.round(Object.values(mockAgentStats).reduce((acc, s) => acc + s.successRate, 0) / Object.values(mockAgentStats).length);
  
  // Filter approval events
  const approvalEvents = mockEvents.filter(e => e.type === 'approval');
  const warningEvents = mockEvents.filter(e => e.type === 'warning');

  // Reset selected index when suggestions change
  useEffect(() => {
    setSelectedMentionIndex(0);
  }, [mentionState.suggestions]);

  const handleSelectMention = (agent: ChatAgent) => {
    const newMessage = insertMention(agent, miniChatInput);
    setMiniChatInput(newMessage);
    inputRef.current?.focus();
  };

  const handleMiniChatSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (miniChatInput.trim()) {
      const mentions = parseMentions(miniChatInput);
      const mentionedIds = mentions.map(m => m.id);
      onNavigateToChat(mentionedIds.length > 0 ? mentionedIds : undefined);
    }
  };

  const handleInputChange2 = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    const cursorPosition = e.target.selectionStart || 0;
    setMiniChatInput(value);
    handleInputChange(value, cursorPosition);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (mentionState.isActive && mentionState.suggestions.length > 0) {
      if (e.key === 'ArrowDown') {
        e.preventDefault();
        setSelectedMentionIndex(prev => 
          prev < mentionState.suggestions.length - 1 ? prev + 1 : 0
        );
        return;
      }
      if (e.key === 'ArrowUp') {
        e.preventDefault();
        setSelectedMentionIndex(prev => 
          prev > 0 ? prev - 1 : mentionState.suggestions.length - 1
        );
        return;
      }
      if (e.key === 'Enter' || e.key === 'Tab') {
        e.preventDefault();
        handleSelectMention(mentionState.suggestions[selectedMentionIndex]);
        return;
      }
      if (e.key === 'Escape') {
        e.preventDefault();
        closeMention();
        return;
      }
    }
  };

  // Mini sparkline component
  const Sparkline = ({ data }: { data: number[] }) => {
    const max = Math.max(...data);
    const min = Math.min(...data);
    const range = max - min || 1;
    const height = 24;
    const width = 80;
    const points = data.map((val, i) => {
      const x = (i / (data.length - 1)) * width;
      const y = height - ((val - min) / range) * height;
      return `${x},${y}`;
    }).join(' ');

    return (
      <svg width={width} height={height} className="overflow-visible">
        <polyline
          fill="none"
          stroke="hsl(var(--primary))"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          points={points}
        />
      </svg>
    );
  };

  return (
    <div className="space-y-8 animate-slide-up">
      {/* Hero Section */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-primary/20 via-primary/10 to-transparent border border-primary/20 p-8 md:p-12">
        <div className="relative z-10 text-center max-w-2xl mx-auto">
          <h1 className="text-3xl md:text-4xl font-semibold text-foreground mb-4">
            Welcome to Your AI Command Center
          </h1>
          <p className="text-muted-foreground text-lg mb-8">
            Monitor your AI agents, track ongoing tasks, and manage operations in real-time.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button 
              onClick={() => onNavigateToChat()}
              className="gap-2"
              size="lg"
            >
              <MessageSquare className="w-5 h-5" />
              Start Conversation
            </Button>
            <Button 
              onClick={onNavigateToAgents}
              variant="outline"
              size="lg"
            >
              View All Agents
            </Button>
          </div>
        </div>
        {/* Background decoration */}
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,hsl(var(--primary)/0.15),transparent_50%)]" />
      </div>

      {/* Quick Stats Row - Extended */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
        <div className="glass-card p-4 rounded-xl">
          <div className="flex items-center gap-2 text-muted-foreground mb-1">
            <Activity className="w-4 h-4 text-success" />
            <span className="text-sm">Active Agents</span>
          </div>
          <p className="text-2xl font-semibold">{activeAgents.length}</p>
        </div>
        <div className="glass-card p-4 rounded-xl">
          <div className="flex items-center gap-2 text-muted-foreground mb-1">
            <Clock className="w-4 h-4 text-warning" />
            <span className="text-sm">Running Tasks</span>
          </div>
          <p className="text-2xl font-semibold">{runningTasks.length}</p>
        </div>
        <div className="glass-card p-4 rounded-xl">
          <div className="flex items-center gap-2 text-muted-foreground mb-1">
            <CheckCircle className="w-4 h-4 text-primary" />
            <span className="text-sm">Completed Today</span>
          </div>
          <p className="text-2xl font-semibold">{completedTasks.length}</p>
        </div>
        <div className="glass-card p-4 rounded-xl">
          <div className="flex items-center gap-2 text-muted-foreground mb-1">
            <Bot className="w-4 h-4" />
            <span className="text-sm">Total Completed</span>
          </div>
          <p className="text-2xl font-semibold">{totalTasksCompleted}</p>
        </div>
        <div className="glass-card p-4 rounded-xl">
          <div className="flex items-center gap-2 text-muted-foreground mb-1">
            <ShieldCheck className="w-4 h-4 text-warning" />
            <span className="text-sm">Pending Approvals</span>
          </div>
          <p className="text-2xl font-semibold">{pendingApprovals.length}</p>
        </div>
        <div className="glass-card p-4 rounded-xl">
          <div className="flex items-center gap-2 text-muted-foreground mb-1">
            <TrendingUp className="w-4 h-4 text-primary" />
            <span className="text-sm">Avg Success Rate</span>
          </div>
          <div className="flex items-center gap-2">
            <p className="text-2xl font-semibold">{avgSuccessRate}%</p>
            <Sparkline data={successRateTrend} />
          </div>
        </div>
      </div>

      {/* Priority Row - Pending Approvals & Errors */}
      <div className="grid md:grid-cols-2 gap-6">
        {/* Pending Approvals Card */}
        <div className="glass-card rounded-xl p-5 border border-warning/30 bg-warning/5">
          <div className="flex items-center gap-2 mb-4">
            <ShieldCheck className="w-5 h-5 text-warning" />
            <h2 className="font-semibold">Pending Approvals</h2>
            {pendingApprovals.length > 0 && (
              <span className="ml-auto px-2 py-0.5 text-xs font-medium bg-warning/20 text-warning rounded-full">
                {pendingApprovals.length} waiting
              </span>
            )}
          </div>
          <div className="space-y-3">
            {pendingApprovals.length > 0 ? (
              pendingApprovals.map((item) => (
                <div 
                  key={item.id} 
                  className="flex items-center justify-between p-3 rounded-lg bg-background/50 border border-border/50"
                >
                  <div>
                    <p className="font-medium text-sm">{item.task}</p>
                    <p className="text-xs text-muted-foreground">by {item.agent}</p>
                  </div>
                  <div className="flex gap-2">
                    <Button size="sm" variant="outline" className="h-7 px-2 text-xs">
                      Reject
                    </Button>
                    <Button size="sm" className="h-7 px-2 text-xs">
                      Approve
                    </Button>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-sm text-muted-foreground">No pending approvals</p>
            )}
          </div>
        </div>

        {/* Recent Errors Card */}
        <div className="glass-card rounded-xl p-5 border border-destructive/30 bg-destructive/5">
          <div className="flex items-center gap-2 mb-4">
            <AlertTriangle className="w-5 h-5 text-destructive" />
            <h2 className="font-semibold">Recent Errors & Alerts</h2>
            {failedTasks.length > 0 && (
              <span className="ml-auto px-2 py-0.5 text-xs font-medium bg-destructive/20 text-destructive rounded-full">
                {failedTasks.length} issues
              </span>
            )}
          </div>
          <div className="space-y-3">
            {failedTasks.length > 0 ? (
              failedTasks.map((task) => (
                <div 
                  key={task.id} 
                  className="p-3 rounded-lg bg-background/50 border border-border/50"
                >
                  <div className="flex items-start gap-2">
                    <XCircle className="w-4 h-4 text-destructive mt-0.5 shrink-0" />
                    <div className="flex-1">
                      <p className="font-medium text-sm">{task.name}</p>
                      <p className="text-xs text-muted-foreground">
                        {task.steps.find(s => s.status === 'failed')?.error || 'Task failed'}
                      </p>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-sm text-muted-foreground flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-success" />
                No errors - all systems operational
              </p>
            )}
            {warningEvents.length > 0 && (
              <div className="p-3 rounded-lg bg-background/50 border border-border/50">
                <div className="flex items-start gap-2">
                  <AlertTriangle className="w-4 h-4 text-warning mt-0.5 shrink-0" />
                  <div className="flex-1">
                    <p className="font-medium text-sm">Low confidence warning</p>
                    <p className="text-xs text-muted-foreground">{warningEvents[0].message}</p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Content Cards - 4 Columns */}
      <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Running Tasks Card */}
        <div className="glass-card rounded-xl p-5 border border-border">
          <div className="flex items-center gap-2 mb-4">
            <Clock className="w-5 h-5 text-warning" />
            <h2 className="font-semibold">Running Operations</h2>
          </div>
          <div className="space-y-3">
            {runningTasks.length > 0 ? (
              runningTasks.map((task) => (
                <div 
                  key={task.id} 
                  className="p-3 rounded-lg bg-secondary/50 border border-border/50"
                >
                  <p className="font-medium text-sm">{task.name}</p>
                  <div className="flex items-center gap-2 mt-2">
                    <div className="flex-1 h-1.5 bg-muted rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-primary rounded-full animate-pulse"
                        style={{ width: `${(task.steps.filter(s => s.status === 'completed').length / task.steps.length) * 100}%` }}
                      />
                    </div>
                    <span className="text-xs text-muted-foreground">
                      {task.steps.filter(s => s.status === 'completed').length}/{task.steps.length}
                    </span>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-sm text-muted-foreground">No running operations</p>
            )}
          </div>
          <Button 
            variant="ghost" 
            className="w-full mt-4 text-sm"
            onClick={onNavigateToTasks}
          >
            View All Tasks
          </Button>
        </div>

        {/* Scheduled Tasks Card */}
        <div className="glass-card rounded-xl p-5 border border-border">
          <div className="flex items-center gap-2 mb-4">
            <Calendar className="w-5 h-5 text-primary" />
            <h2 className="font-semibold">Scheduled Tasks</h2>
          </div>
          <div className="space-y-3">
            {scheduledTasks.slice(0, 3).map((task) => (
              <div 
                key={task.id} 
                className="p-3 rounded-lg bg-secondary/50 border border-border/50"
              >
                <p className="font-medium text-sm">{task.name}</p>
                <div className="flex items-center justify-between mt-1">
                  <p className="text-xs text-muted-foreground">{task.agent}</p>
                  <span className="text-xs text-primary">{task.scheduledFor}</span>
                </div>
              </div>
            ))}
          </div>
          <Button 
            variant="ghost" 
            className="w-full mt-4 text-sm"
            onClick={onNavigateToTasks}
          >
            View Schedule
          </Button>
        </div>

        {/* Agent Availability Card */}
        <div className="glass-card rounded-xl p-5 border border-border">
          <div className="flex items-center gap-2 mb-4">
            <Users className="w-5 h-5 text-success" />
            <h2 className="font-semibold">Agent Availability</h2>
          </div>
          <div className="space-y-3">
            <div className="flex items-center justify-between p-3 rounded-lg bg-success/10 border border-success/20">
              <span className="text-sm font-medium">Active</span>
              <span className="text-lg font-semibold text-success">{activeAgents.length}</span>
            </div>
            <div className="flex items-center justify-between p-3 rounded-lg bg-muted/50 border border-border/50">
              <span className="text-sm font-medium">Idle (Available)</span>
              <span className="text-lg font-semibold text-muted-foreground">{idleAgents.length}</span>
            </div>
            <div className="flex items-center justify-between p-3 rounded-lg bg-secondary/50 border border-border/50">
              <span className="text-sm font-medium">Total Fleet</span>
              <span className="text-lg font-semibold">{mockAgents.length}</span>
            </div>
          </div>
          <Button 
            variant="ghost" 
            className="w-full mt-4 text-sm"
            onClick={onNavigateToAgents}
          >
            Manage Fleet
          </Button>
        </div>

        {/* Active Agents Card */}
        <div className="glass-card rounded-xl p-5 border border-border">
          <div className="flex items-center gap-2 mb-4">
            <Activity className="w-5 h-5 text-primary" />
            <h2 className="font-semibold">Active Agents</h2>
          </div>
          <div className="space-y-3">
            {activeAgents.length > 0 ? (
              activeAgents.slice(0, 3).map((agent) => (
                <div 
                  key={agent.id} 
                  className="flex items-center gap-3 p-3 rounded-lg bg-secondary/50 border border-border/50"
                >
                  <div className="w-8 h-8 rounded-lg bg-card flex items-center justify-center text-lg border border-border">
                    {agent.avatar}
                  </div>
                  <div className="flex-1">
                    <p className="font-medium text-sm">{agent.name}</p>
                    <p className="text-xs text-muted-foreground capitalize">{agent.status}</p>
                  </div>
                  <div className={cn(
                    "w-2 h-2 rounded-full",
                    agent.status === 'executing' ? "bg-success animate-pulse" : "bg-primary"
                  )} />
                </div>
              ))
            ) : (
              <p className="text-sm text-muted-foreground">No active agents</p>
            )}
          </div>
          <Button 
            variant="ghost" 
            className="w-full mt-4 text-sm"
            onClick={onNavigateToAgents}
          >
            View All Agents
          </Button>
        </div>
      </div>

      {/* Mini AI Chat Widget */}
      <div className="fixed bottom-20 lg:bottom-6 right-4 z-40">
        {miniChatOpen ? (
          <div className="w-80 bg-card border border-border rounded-xl shadow-lg overflow-hidden animate-slide-up">
            <div className="flex items-center justify-between p-3 border-b border-border bg-secondary/50">
              <div className="flex items-center gap-2">
                <Bot className="w-5 h-5 text-primary" />
                <span className="font-medium text-sm">AI Assistant</span>
              </div>
              <button 
                onClick={() => setMiniChatOpen(false)}
                className="text-muted-foreground hover:text-foreground"
              >
                ×
              </button>
            </div>
            <div className="p-4 h-48 bg-background/50">
              <p className="text-sm text-muted-foreground">
                How can I help you today? Type <span className="text-primary font-medium">@</span> to mention an agent.
              </p>
            </div>
            <form onSubmit={handleMiniChatSubmit} className="p-3 border-t border-border relative">
              {/* @Mention Popover */}
              {mentionState.isActive && mentionState.suggestions.length > 0 && (
                <div className="absolute bottom-full left-0 right-0 mb-1">
                  <AgentMentionPopover
                    suggestions={mentionState.suggestions}
                    selectedIndex={selectedMentionIndex}
                    onSelect={handleSelectMention}
                    position="above"
                  />
                </div>
              )}
              <div className="flex gap-2">
                <Input
                  ref={inputRef}
                  value={miniChatInput}
                  onChange={handleInputChange2}
                  onKeyDown={handleKeyDown}
                  placeholder="Type @ to mention an agent..."
                  className="flex-1 h-9 text-sm"
                />
                <Button type="submit" size="sm" className="px-3">
                  <Send className="w-4 h-4" />
                </Button>
              </div>
            </form>
          </div>
        ) : (
          <button
            onClick={() => setMiniChatOpen(true)}
            className="w-14 h-14 rounded-full bg-primary text-primary-foreground flex items-center justify-center shadow-lg hover:scale-105 transition-transform"
          >
            <MessageSquare className="w-6 h-6" />
          </button>
        )}
      </div>
    </div>
  );
}
