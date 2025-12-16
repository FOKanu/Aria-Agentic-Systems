import { ArrowLeft, CheckCircle, Clock, TrendingUp, Activity } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Agent } from '@/components/AgentRail';
import { AgentStats } from '@/data/agentsData';
import { cn } from '@/lib/utils';

interface AgentDetailsPageProps {
  agent: Agent;
  stats: AgentStats;
  onBack: () => void;
}

const typeLabels: Record<string, string> = {
  assistant: 'Assistant',
  developer: 'Developer',
  researcher: 'Researcher',
};

const statusConfig = {
  idle: { label: 'Idle', class: 'bg-muted text-muted-foreground' },
  thinking: { label: 'Processing', class: 'bg-primary/10 text-primary' },
  executing: { label: 'Active', class: 'bg-success/10 text-success' },
  waiting: { label: 'Waiting', class: 'bg-warning/10 text-warning' },
  error: { label: 'Error', class: 'bg-destructive/10 text-destructive' },
  stunned: { label: 'Offline', class: 'bg-destructive/10 text-destructive' },
};

export function AgentDetailsPage({ agent, stats, onBack }: AgentDetailsPageProps) {
  const status = statusConfig[agent.status];

  return (
    <div className="space-y-6 animate-slide-up">
      {/* Back Button */}
      <Button variant="ghost" size="sm" onClick={onBack} className="gap-2">
        <ArrowLeft className="w-4 h-4" />
        Back to Dashboard
      </Button>

      {/* Agent Header */}
      <div className="glass-card p-6 rounded-lg">
        <div className="flex items-start gap-4">
          <div className="w-16 h-16 rounded-lg bg-secondary flex items-center justify-center text-3xl border border-border">
            {agent.avatar}
          </div>
          
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-2">
              <h1 className="text-2xl font-semibold">{agent.name}</h1>
              <span className={cn("text-sm px-3 py-1 rounded-full font-medium", status.class)}>
                {status.label}
              </span>
            </div>
            <p className="text-muted-foreground">{typeLabels[agent.type]}</p>
          </div>
        </div>
      </div>

      {/* Performance Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="glass-card p-4 rounded-lg">
          <div className="flex items-center gap-2 text-muted-foreground mb-2">
            <CheckCircle className="w-4 h-4" />
            <span className="text-sm">Tasks Completed</span>
          </div>
          <p className="text-3xl font-semibold">{stats.tasksCompleted}</p>
        </div>
        
        <div className="glass-card p-4 rounded-lg">
          <div className="flex items-center gap-2 text-muted-foreground mb-2">
            <TrendingUp className="w-4 h-4" />
            <span className="text-sm">Success Rate</span>
          </div>
          <p className="text-3xl font-semibold text-success">{stats.successRate}%</p>
        </div>
        
        <div className="glass-card p-4 rounded-lg">
          <div className="flex items-center gap-2 text-muted-foreground mb-2">
            <Clock className="w-4 h-4" />
            <span className="text-sm">Avg Response</span>
          </div>
          <p className="text-3xl font-semibold">{stats.avgResponseTime}s</p>
        </div>
        
        <div className="glass-card p-4 rounded-lg">
          <div className="flex items-center gap-2 text-muted-foreground mb-2">
            <Activity className="w-4 h-4" />
            <span className="text-sm">Active Hours</span>
          </div>
          <p className="text-3xl font-semibold">{stats.activeHours}h</p>
        </div>
      </div>

      {/* Activity Overview */}
      <div className="glass-card p-5 rounded-lg">
        <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wider mb-4">
          Recent Activity
        </h3>
        <div className="space-y-3">
          {[
            { action: 'Completed research task', time: '2 minutes ago', status: 'success' },
            { action: 'Started new analysis', time: '15 minutes ago', status: 'active' },
            { action: 'Generated report', time: '1 hour ago', status: 'success' },
            { action: 'Updated knowledge base', time: '3 hours ago', status: 'success' },
          ].map((activity, index) => (
            <div key={index} className="flex items-center justify-between py-2 border-b border-border last:border-0">
              <div className="flex items-center gap-3">
                <div className={cn(
                  "w-2 h-2 rounded-full",
                  activity.status === 'success' ? "bg-success" : "bg-primary animate-pulse"
                )} />
                <span className="text-sm">{activity.action}</span>
              </div>
              <span className="text-xs text-muted-foreground">{activity.time}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
