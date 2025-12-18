import { useState } from 'react';
import { MessageSquare, CheckCircle, Clock, Activity, Send, Bot } from 'lucide-react';
import { cn } from '@/lib/utils';
import { mockTasks } from '@/data/mockData';
import { mockAgents, mockAgentStats } from '@/data/agentsData';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

interface HomePageProps {
  onNavigateToAgents: () => void;
  onNavigateToTasks: () => void;
  onNavigateToChat: () => void;
}

export function HomePage({ onNavigateToAgents, onNavigateToTasks, onNavigateToChat }: HomePageProps) {
  const [miniChatInput, setMiniChatInput] = useState('');
  const [miniChatOpen, setMiniChatOpen] = useState(false);
  
  const runningTasks = mockTasks.filter(t => t.status === 'running');
  const completedTasks = mockTasks.filter(t => t.status === 'completed');
  const activeAgents = mockAgents.filter(a => a.status === 'executing' || a.status === 'thinking');
  const totalTasksCompleted = Object.values(mockAgentStats).reduce((acc, s) => acc + s.tasksCompleted, 0);

  const handleMiniChatSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (miniChatInput.trim()) {
      onNavigateToChat();
    }
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
              onClick={onNavigateToChat}
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

      {/* Quick Stats Row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
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
      </div>

      {/* Content Cards */}
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
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

        {/* Completed Tasks Card */}
        <div className="glass-card rounded-xl p-5 border border-border">
          <div className="flex items-center gap-2 mb-4">
            <CheckCircle className="w-5 h-5 text-success" />
            <h2 className="font-semibold">Recently Completed</h2>
          </div>
          <div className="space-y-3">
            {completedTasks.length > 0 ? (
              completedTasks.slice(0, 3).map((task) => (
                <div 
                  key={task.id} 
                  className="p-3 rounded-lg bg-secondary/50 border border-border/50"
                >
                  <div className="flex items-center justify-between">
                    <p className="font-medium text-sm">{task.name}</p>
                    <CheckCircle className="w-4 h-4 text-success" />
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">
                    {task.steps.length} steps completed
                  </p>
                </div>
              ))
            ) : (
              <p className="text-sm text-muted-foreground">No completed tasks yet</p>
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

        {/* Active Agents Card */}
        <div className="glass-card rounded-xl p-5 border border-border">
          <div className="flex items-center gap-2 mb-4">
            <Activity className="w-5 h-5 text-primary" />
            <h2 className="font-semibold">Active Agents</h2>
          </div>
          <div className="space-y-3">
            {activeAgents.length > 0 ? (
              activeAgents.map((agent) => (
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
                How can I help you today? Type a message to start.
              </p>
            </div>
            <form onSubmit={handleMiniChatSubmit} className="p-3 border-t border-border">
              <div className="flex gap-2">
                <Input
                  value={miniChatInput}
                  onChange={(e) => setMiniChatInput(e.target.value)}
                  placeholder="Ask anything..."
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
