import { useState } from 'react';
import { ArrowLeft, CheckCircle, Clock, TrendingUp, Activity, Send, Users, ListTodo, Target, MessageSquare } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Agent } from '@/components/AgentRail';
import { AgentStats, mockAgents } from '@/data/agentsData';
import { mockTasks } from '@/data/mockData';
import { cn } from '@/lib/utils';

interface AgentDetailsPageProps {
  agent: Agent;
  stats: AgentStats;
  onBack: () => void;
}


const statusConfig = {
  idle: { label: 'Idle', class: 'bg-muted text-muted-foreground', dot: 'bg-muted-foreground' },
  thinking: { label: 'Processing', class: 'bg-primary/10 text-primary', dot: 'bg-primary' },
  executing: { label: 'Active', class: 'bg-success/10 text-success', dot: 'bg-success' },
  waiting: { label: 'Waiting', class: 'bg-warning/10 text-warning', dot: 'bg-warning' },
  error: { label: 'Error', class: 'bg-destructive/10 text-destructive', dot: 'bg-destructive' },
  stunned: { label: 'Offline', class: 'bg-destructive/10 text-destructive', dot: 'bg-destructive' },
};

// Mock data for agent-specific tasks
const agentTasks = {
  running: [
    { id: 't1', name: 'Process Q4 Sales Report', progress: 60, priority: 'high' },
    { id: 't2', name: 'Analyze customer feedback', progress: 25, priority: 'medium' },
  ],
  completed: [
    { id: 't3', name: 'Generate weekly summary', completedAt: '2 hours ago' },
    { id: 't4', name: 'Update documentation', completedAt: '5 hours ago' },
    { id: 't5', name: 'Research competitor pricing', completedAt: '1 day ago' },
  ],
  shared: [
    { id: 's1', name: 'Multi-agent data analysis', agents: ['Atlas', 'Nova'], status: 'running' },
    { id: 's2', name: 'Cross-reference reports', agents: ['Atlas', 'Sage'], status: 'completed' },
  ],
};

const implementationPlans = [
  { id: 'p1', name: 'Implement new reporting pipeline', steps: 5, completed: 2, eta: '2 hours' },
  { id: 'p2', name: 'Optimize data processing', steps: 3, completed: 0, eta: '4 hours' },
];

export function AgentDetailsPage({ agent, stats, onBack }: AgentDetailsPageProps) {
  const status = statusConfig[agent.status];
  const [chatInput, setChatInput] = useState('');
  const [messages, setMessages] = useState<{ role: 'user' | 'agent'; content: string }[]>([
    { role: 'agent', content: `Hello! I'm ${agent.name}. How can I assist you today?` },
  ]);

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatInput.trim()) return;
    
    setMessages(prev => [...prev, { role: 'user', content: chatInput }]);
    setChatInput('');
    
    // Simulate agent response
    setTimeout(() => {
      setMessages(prev => [...prev, { 
        role: 'agent', 
        content: `I've received your message. I'm currently ${agent.status === 'executing' ? 'working on a task' : 'available'} and will process this shortly.` 
      }]);
    }, 1000);
  };

  return (
    <div className="space-y-6 animate-slide-up">
      {/* Back Button */}
      <Button variant="ghost" size="sm" onClick={onBack} className="gap-2">
        <ArrowLeft className="w-4 h-4" />
        Back
      </Button>

      {/* Agent Header */}
      <div className="glass-card p-6 rounded-xl">
        <div className="flex items-start gap-4">
          <div className="relative">
            <div className="w-16 h-16 rounded-xl bg-secondary flex items-center justify-center text-3xl border border-border">
              {agent.avatar}
            </div>
            <div className={cn(
              "absolute -top-1 -right-1 w-4 h-4 rounded-full border-2 border-card",
              status.dot,
              agent.status === 'executing' && "animate-pulse"
            )} />
          </div>
          
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-2">
              <h1 className="text-2xl font-semibold">{agent.name}</h1>
              <span className={cn("text-sm px-3 py-1 rounded-full font-medium", status.class)}>
                {status.label}
              </span>
            </div>
            <p className="text-muted-foreground">{agent.title || agent.role}</p>
          </div>
        </div>
      </div>

      {/* Performance Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="glass-card p-4 rounded-xl">
          <div className="flex items-center gap-2 text-muted-foreground mb-2">
            <CheckCircle className="w-4 h-4" />
            <span className="text-sm">Tasks Completed</span>
          </div>
          <p className="text-3xl font-semibold">{stats.tasksCompleted}</p>
        </div>
        
        <div className="glass-card p-4 rounded-xl">
          <div className="flex items-center gap-2 text-muted-foreground mb-2">
            <TrendingUp className="w-4 h-4" />
            <span className="text-sm">Success Rate</span>
          </div>
          <p className="text-3xl font-semibold text-success">{stats.successRate}%</p>
        </div>
        
        <div className="glass-card p-4 rounded-xl">
          <div className="flex items-center gap-2 text-muted-foreground mb-2">
            <Clock className="w-4 h-4" />
            <span className="text-sm">Avg Response</span>
          </div>
          <p className="text-3xl font-semibold">{stats.avgResponseTime}s</p>
        </div>
        
        <div className="glass-card p-4 rounded-xl">
          <div className="flex items-center gap-2 text-muted-foreground mb-2">
            <Activity className="w-4 h-4" />
            <span className="text-sm">Active Hours</span>
          </div>
          <p className="text-3xl font-semibold">{stats.activeHours}h</p>
        </div>
      </div>

      {/* Main Content Tabs */}
      <Tabs defaultValue="tasks" className="space-y-4">
        <TabsList className="grid w-full grid-cols-4 lg:w-auto lg:inline-flex">
          <TabsTrigger value="tasks" className="gap-2">
            <ListTodo className="w-4 h-4" />
            <span className="hidden sm:inline">Tasks</span>
          </TabsTrigger>
          <TabsTrigger value="shared" className="gap-2">
            <Users className="w-4 h-4" />
            <span className="hidden sm:inline">Shared</span>
          </TabsTrigger>
          <TabsTrigger value="plans" className="gap-2">
            <Target className="w-4 h-4" />
            <span className="hidden sm:inline">Plans</span>
          </TabsTrigger>
          <TabsTrigger value="chat" className="gap-2">
            <MessageSquare className="w-4 h-4" />
            <span className="hidden sm:inline">Chat</span>
          </TabsTrigger>
        </TabsList>

        {/* Tasks Tab */}
        <TabsContent value="tasks" className="space-y-4">
          {/* Running Tasks */}
          <div className="glass-card p-5 rounded-xl">
            <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wider mb-4 flex items-center gap-2">
              <Activity className="w-4 h-4 text-warning" />
              Running Operations
            </h3>
            <div className="space-y-3">
              {agentTasks.running.length > 0 ? (
                agentTasks.running.map((task) => (
                  <div key={task.id} className="p-3 rounded-lg bg-secondary/50 border border-border/50">
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-medium text-sm">{task.name}</span>
                      <span className={cn(
                        "text-xs px-2 py-0.5 rounded-full",
                        task.priority === 'high' ? "bg-destructive/10 text-destructive" : "bg-warning/10 text-warning"
                      )}>
                        {task.priority}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="flex-1 h-1.5 bg-muted rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-primary rounded-full transition-all"
                          style={{ width: `${task.progress}%` }}
                        />
                      </div>
                      <span className="text-xs text-muted-foreground">{task.progress}%</span>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-sm text-muted-foreground">No running tasks</p>
              )}
            </div>
          </div>

          {/* Completed Tasks */}
          <div className="glass-card p-5 rounded-xl">
            <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wider mb-4 flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-success" />
              Completed Tasks
            </h3>
            <div className="space-y-2">
              {agentTasks.completed.map((task) => (
                <div key={task.id} className="flex items-center justify-between py-2 border-b border-border/50 last:border-0">
                  <div className="flex items-center gap-3">
                    <CheckCircle className="w-4 h-4 text-success" />
                    <span className="text-sm">{task.name}</span>
                  </div>
                  <span className="text-xs text-muted-foreground">{task.completedAt}</span>
                </div>
              ))}
            </div>
          </div>
        </TabsContent>

        {/* Shared Tasks Tab */}
        <TabsContent value="shared" className="space-y-4">
          <div className="glass-card p-5 rounded-xl">
            <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wider mb-4 flex items-center gap-2">
              <Users className="w-4 h-4" />
              Collaborative Tasks
            </h3>
            <div className="space-y-3">
              {agentTasks.shared.map((task) => (
                <div key={task.id} className="p-4 rounded-lg bg-secondary/50 border border-border/50">
                  <div className="flex items-center justify-between mb-3">
                    <span className="font-medium">{task.name}</span>
                    <span className={cn(
                      "text-xs px-2 py-0.5 rounded-full",
                      task.status === 'running' ? "bg-primary/10 text-primary" : "bg-success/10 text-success"
                    )}>
                      {task.status}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-muted-foreground">Collaborating with:</span>
                    <div className="flex -space-x-2">
                      {task.agents.filter(a => a !== agent.name).map((agentName, idx) => {
                        const otherAgent = mockAgents.find(a => a.name === agentName);
                        return (
                          <div 
                            key={idx}
                            className="w-6 h-6 rounded-full bg-secondary border-2 border-card flex items-center justify-center text-xs"
                            title={agentName}
                          >
                            {otherAgent?.avatar || '🤖'}
                          </div>
                        );
                      })}
                    </div>
                    <span className="text-xs text-muted-foreground">
                      {task.agents.filter(a => a !== agent.name).join(', ')}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </TabsContent>

        {/* Plans Tab */}
        <TabsContent value="plans" className="space-y-4">
          <div className="glass-card p-5 rounded-xl">
            <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wider mb-4 flex items-center gap-2">
              <Target className="w-4 h-4" />
              Implementation Plans
            </h3>
            <div className="space-y-4">
              {implementationPlans.map((plan) => (
                <div key={plan.id} className="p-4 rounded-lg bg-secondary/50 border border-border/50">
                  <div className="flex items-center justify-between mb-3">
                    <span className="font-medium">{plan.name}</span>
                    <span className="text-xs text-muted-foreground">ETA: {plan.eta}</span>
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">Progress</span>
                      <span>{plan.completed}/{plan.steps} steps</span>
                    </div>
                    <div className="flex gap-1">
                      {Array.from({ length: plan.steps }).map((_, idx) => (
                        <div 
                          key={idx}
                          className={cn(
                            "h-2 flex-1 rounded-full",
                            idx < plan.completed ? "bg-success" : "bg-muted"
                          )}
                        />
                      ))}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </TabsContent>

        {/* Chat Tab */}
        <TabsContent value="chat" className="space-y-4">
          <div className="glass-card rounded-xl overflow-hidden flex flex-col h-[400px]">
            {/* Chat Header */}
            <div className="p-4 border-b border-border bg-secondary/30">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-secondary flex items-center justify-center text-lg border border-border">
                  {agent.avatar}
                </div>
                <div>
                  <p className="font-medium text-sm">{agent.name}</p>
                  <p className="text-xs text-muted-foreground">{status.label}</p>
                </div>
              </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {messages.map((msg, idx) => (
                <div 
                  key={idx}
                  className={cn(
                    "flex",
                    msg.role === 'user' ? "justify-end" : "justify-start"
                  )}
                >
                  <div className={cn(
                    "max-w-[80%] p-3 rounded-xl text-sm",
                    msg.role === 'user' 
                      ? "bg-primary text-primary-foreground" 
                      : "bg-secondary border border-border"
                  )}>
                    {msg.content}
                  </div>
                </div>
              ))}
            </div>

            {/* Input */}
            <form onSubmit={handleSendMessage} className="p-4 border-t border-border">
              <div className="flex gap-2">
                <Input
                  value={chatInput}
                  onChange={(e) => setChatInput(e.target.value)}
                  placeholder={`Message ${agent.name}...`}
                  className="flex-1"
                />
                <Button type="submit" size="icon">
                  <Send className="w-4 h-4" />
                </Button>
              </div>
            </form>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
