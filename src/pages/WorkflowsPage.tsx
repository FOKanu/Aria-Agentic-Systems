import { useState } from 'react';
import { Workflow, Plus, Play, Pause, Settings2, Clock, CheckCircle2, AlertCircle, Zap, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { cn } from '@/lib/utils';

interface WorkflowItem {
  id: string;
  name: string;
  description: string;
  trigger: string;
  actions: string[];
  isActive: boolean;
  lastRun?: string;
  runCount: number;
  status: 'success' | 'warning' | 'error' | 'idle';
}

const mockWorkflows: WorkflowItem[] = [
  { id: '1', name: 'Daily Report Generator', description: 'Generate and email daily summary reports', trigger: 'Every day at 8:00 AM', actions: ['Collect metrics', 'Generate PDF', 'Send email'], isActive: true, lastRun: '2 hours ago', runCount: 45, status: 'success' },
  { id: '2', name: 'New Lead Notification', description: 'Alert team when new leads come in', trigger: 'When new contact is added', actions: ['Filter by source', 'Send Slack message', 'Create task'], isActive: true, lastRun: 'Yesterday', runCount: 127, status: 'success' },
  { id: '3', name: 'File Backup Automation', description: 'Backup important files to cloud storage', trigger: 'Weekly on Sunday', actions: ['Scan folders', 'Compress files', 'Upload to S3'], isActive: false, lastRun: '5 days ago', runCount: 23, status: 'idle' },
  { id: '4', name: 'Meeting Notes Processor', description: 'Transcribe and summarize meeting recordings', trigger: 'When recording is uploaded', actions: ['Transcribe audio', 'Summarize with AI', 'Share notes'], isActive: true, lastRun: '3 hours ago', runCount: 89, status: 'warning' },
  { id: '5', name: 'Invoice Reminder', description: 'Send payment reminders for overdue invoices', trigger: '3 days before due date', actions: ['Check invoice status', 'Draft reminder', 'Send email'], isActive: true, lastRun: '1 day ago', runCount: 34, status: 'success' },
];

const statusConfig = {
  success: { icon: CheckCircle2, color: 'text-green-500', bg: 'bg-green-500/10' },
  warning: { icon: AlertCircle, color: 'text-yellow-500', bg: 'bg-yellow-500/10' },
  error: { icon: AlertCircle, color: 'text-red-500', bg: 'bg-red-500/10' },
  idle: { icon: Pause, color: 'text-muted-foreground', bg: 'bg-secondary' },
};

export function WorkflowsPage() {
  const [workflows, setWorkflows] = useState(mockWorkflows);

  const toggleWorkflow = (id: string) => {
    setWorkflows(prev => prev.map(w => 
      w.id === id ? { ...w, isActive: !w.isActive, status: !w.isActive ? 'idle' : w.status } as WorkflowItem : w
    ));
  };

  const activeCount = workflows.filter(w => w.isActive).length;
  const totalRuns = workflows.reduce((acc, w) => acc + w.runCount, 0);

  return (
    <div className="space-y-6 animate-slide-up">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
            <Workflow className="w-5 h-5 text-primary" />
          </div>
          <div>
            <h1 className="text-xl font-bold font-display">Workflows</h1>
            <p className="text-sm text-muted-foreground">Automate repetitive tasks</p>
          </div>
        </div>
        <Button className="gap-2">
          <Plus className="w-4 h-4" />
          Create Workflow
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-green-500/10 flex items-center justify-center">
                <Play className="w-5 h-5 text-green-500" />
              </div>
              <div>
                <p className="text-2xl font-bold">{activeCount}</p>
                <p className="text-xs text-muted-foreground">Active Workflows</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                <Zap className="w-5 h-5 text-primary" />
              </div>
              <div>
                <p className="text-2xl font-bold">{totalRuns}</p>
                <p className="text-xs text-muted-foreground">Total Runs</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-blue-500/10 flex items-center justify-center">
                <Clock className="w-5 h-5 text-blue-500" />
              </div>
              <div>
                <p className="text-2xl font-bold">{workflows.length}</p>
                <p className="text-xs text-muted-foreground">Total Workflows</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Workflows List */}
      <div className="space-y-4">
        {workflows.map(workflow => {
          const StatusIcon = statusConfig[workflow.status].icon;
          return (
            <Card key={workflow.id} className={cn("transition-all", workflow.isActive && "border-primary/30")}>
              <CardContent className="p-4">
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-4 flex-1">
                    <div className={cn("w-10 h-10 rounded-lg flex items-center justify-center", statusConfig[workflow.status].bg)}>
                      <StatusIcon className={cn("w-5 h-5", statusConfig[workflow.status].color)} />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-semibold">{workflow.name}</h3>
                        <Badge variant={workflow.isActive ? "default" : "secondary"} className="text-xs">
                          {workflow.isActive ? 'Active' : 'Paused'}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground mb-3">{workflow.description}</p>
                      
                      {/* Trigger & Actions */}
                      <div className="flex flex-wrap items-center gap-2 text-xs">
                        <Badge variant="outline" className="gap-1">
                          <Clock className="w-3 h-3" />
                          {workflow.trigger}
                        </Badge>
                        <ArrowRight className="w-3 h-3 text-muted-foreground" />
                        {workflow.actions.slice(0, 2).map((action, i) => (
                          <Badge key={i} variant="secondary" className="bg-secondary/50">
                            {action}
                          </Badge>
                        ))}
                        {workflow.actions.length > 2 && (
                          <Badge variant="secondary" className="bg-secondary/50">
                            +{workflow.actions.length - 2} more
                          </Badge>
                        )}
                      </div>

                      {/* Stats */}
                      <div className="flex items-center gap-4 mt-3 text-xs text-muted-foreground">
                        <span>{workflow.runCount} runs</span>
                        {workflow.lastRun && <span>Last run: {workflow.lastRun}</span>}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <Button variant="ghost" size="icon">
                      <Settings2 className="w-4 h-4" />
                    </Button>
                    <Switch
                      checked={workflow.isActive}
                      onCheckedChange={() => toggleWorkflow(workflow.id)}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
