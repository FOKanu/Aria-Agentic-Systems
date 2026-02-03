// Compliance Page - Author: Francis Okorie Iyeke-Kanu
import { useState } from 'react';
import { Shield, AlertTriangle, CheckCircle, Clock, TrendingUp, FileCheck, Calendar, Settings, Plus, MoreVertical, Edit, Trash2, Eye, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { ComplianceTrafficLight, ComplianceStatus } from '@/components/legal';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

interface ComplianceRequirement {
  id: string;
  name: string;
  framework: string;
  status: ComplianceStatus;
  dueDate?: string;
  lastAudit?: string;
  progress: number;
  priority: 'high' | 'medium' | 'low';
  assignedAgent?: string;
  jurisdictions: string[];
}

interface ComplianceTask {
  id: string;
  title: string;
  requirement: string;
  dueDate: string;
  status: 'pending' | 'in_progress' | 'completed' | 'overdue';
  assignee?: string;
}

interface RiskAlert {
  id: string;
  severity: 'critical' | 'high' | 'medium' | 'low';
  title: string;
  description: string;
  framework: string;
  actionRequired: string;
}

const mockRequirements: ComplianceRequirement[] = [
  {
    id: '1',
    name: 'GDPR Data Protection',
    framework: 'GDPR',
    status: 'compliant',
    lastAudit: '2024-11-15',
    progress: 100,
    priority: 'high',
    assignedAgent: 'Cipher',
    jurisdictions: ['EU', 'UK'],
  },
  {
    id: '2',
    name: 'SOC 2 Type II',
    framework: 'SOC 2',
    status: 'partial',
    dueDate: '2025-03-15',
    progress: 72,
    priority: 'high',
    assignedAgent: 'Cipher',
    jurisdictions: ['US'],
  },
  {
    id: '3',
    name: 'HIPAA Security Rule',
    framework: 'HIPAA',
    status: 'pending',
    dueDate: '2025-06-01',
    progress: 35,
    priority: 'medium',
    jurisdictions: ['US'],
  },
  {
    id: '4',
    name: 'PCI DSS Compliance',
    framework: 'PCI DSS',
    status: 'non-compliant',
    dueDate: '2025-01-31',
    progress: 45,
    priority: 'high',
    assignedAgent: 'Cipher',
    jurisdictions: ['Global'],
  },
  {
    id: '5',
    name: 'ISO 27001 Certification',
    framework: 'ISO 27001',
    status: 'partial',
    dueDate: '2025-04-30',
    progress: 58,
    priority: 'medium',
    assignedAgent: 'Sage',
    jurisdictions: ['Global'],
  },
];

const mockTasks: ComplianceTask[] = [
  { id: '1', title: 'Complete risk assessment documentation', requirement: 'SOC 2 Type II', dueDate: '2024-12-25', status: 'in_progress', assignee: 'Sage' },
  { id: '2', title: 'Update data processing agreements', requirement: 'GDPR', dueDate: '2024-12-20', status: 'overdue', assignee: 'Aria' },
  { id: '3', title: 'Implement encryption at rest', requirement: 'PCI DSS', dueDate: '2024-12-30', status: 'pending', assignee: 'Flux' },
  { id: '4', title: 'Conduct security awareness training', requirement: 'ISO 27001', dueDate: '2025-01-15', status: 'pending' },
  { id: '5', title: 'Review access control policies', requirement: 'HIPAA', dueDate: '2025-01-10', status: 'pending', assignee: 'Cipher' },
];

const mockRiskAlerts: RiskAlert[] = [
  { id: '1', severity: 'critical', title: 'PCI DSS Deadline Approaching', description: 'Compliance deadline in 30 days with 45% progress', framework: 'PCI DSS', actionRequired: 'Prioritize encryption and access controls' },
  { id: '2', severity: 'high', title: 'Overdue Data Processing Agreement', description: 'GDPR DPA update is 2 days overdue', framework: 'GDPR', actionRequired: 'Complete DPA update immediately' },
  { id: '3', severity: 'medium', title: 'Missing Security Training Records', description: 'Q4 training not documented for 3 employees', framework: 'ISO 27001', actionRequired: 'Schedule and document training' },
];

export default function CompliancePage() {
  const [requirements, setRequirements] = useState<ComplianceRequirement[]>(mockRequirements);
  const [tasks] = useState<ComplianceTask[]>(mockTasks);
  const [riskAlerts] = useState<RiskAlert[]>(mockRiskAlerts);

  const getTaskStatusColor = (status: ComplianceTask['status']) => {
    switch (status) {
      case 'completed': return 'bg-emerald-500/20 text-emerald-400';
      case 'in_progress': return 'bg-blue-500/20 text-blue-400';
      case 'overdue': return 'bg-red-500/20 text-red-400';
      case 'pending': return 'bg-muted text-muted-foreground';
      default: return 'bg-muted text-muted-foreground';
    }
  };

  const getSeverityColor = (severity: RiskAlert['severity']) => {
    switch (severity) {
      case 'critical': return 'bg-red-500/20 text-red-500 border-red-500/30';
      case 'high': return 'bg-orange-500/20 text-orange-500 border-orange-500/30';
      case 'medium': return 'bg-yellow-500/20 text-yellow-500 border-yellow-500/30';
      case 'low': return 'bg-blue-500/20 text-blue-500 border-blue-500/30';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'bg-red-500/20 text-red-400';
      case 'medium': return 'bg-yellow-500/20 text-yellow-400';
      case 'low': return 'bg-blue-500/20 text-blue-400';
      default: return 'bg-muted text-muted-foreground';
    }
  };

  const stats = {
    compliant: requirements.filter(r => r.status === 'compliant').length,
    partial: requirements.filter(r => r.status === 'partial').length,
    nonCompliant: requirements.filter(r => r.status === 'non-compliant').length,
    overallScore: Math.round(requirements.reduce((sum, r) => sum + r.progress, 0) / requirements.length),
  };

  const handleRunAudit = () => {
    toast.success('Compliance audit started. Results will be available shortly.');
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold font-display text-foreground">Compliance Monitoring</h1>
          <p className="text-muted-foreground text-sm">Track regulatory requirements and certifications</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" className="gap-2" onClick={handleRunAudit}>
            <RefreshCw className="h-4 w-4" />
            Run Audit
          </Button>
          <Button className="gap-2">
            <Plus className="h-4 w-4" />
            Add Framework
          </Button>
        </div>
      </div>

      {/* Stats with Traffic Lights */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="bg-card/50 border-border/50">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-primary/20">
                <TrendingUp className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">{stats.overallScore}%</p>
                <p className="text-xs text-muted-foreground">Overall Score</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-card/50 border-border/50">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <ComplianceTrafficLight status="compliant" size="lg" />
              <div>
                <p className="text-2xl font-bold text-foreground">{stats.compliant}</p>
                <p className="text-xs text-muted-foreground">Compliant</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-card/50 border-border/50">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <ComplianceTrafficLight status="partial" size="lg" />
              <div>
                <p className="text-2xl font-bold text-foreground">{stats.partial}</p>
                <p className="text-xs text-muted-foreground">In Progress</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-card/50 border-border/50">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <ComplianceTrafficLight status="non-compliant" size="lg" />
              <div>
                <p className="text-2xl font-bold text-foreground">{stats.nonCompliant}</p>
                <p className="text-xs text-muted-foreground">Non-Compliant</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Risk Alerts Banner */}
      {riskAlerts.filter(a => a.severity === 'critical').length > 0 && (
        <Card className="bg-red-500/10 border-red-500/30">
          <CardContent className="p-4">
            <div className="flex items-start gap-3">
              <AlertTriangle className="w-5 h-5 text-red-500 mt-0.5" />
              <div className="flex-1">
                <h3 className="font-semibold text-red-500">Critical Compliance Alert</h3>
                <p className="text-sm text-muted-foreground mt-1">
                  {riskAlerts.find(a => a.severity === 'critical')?.description}
                </p>
                <Button size="sm" variant="outline" className="mt-2 border-red-500/30 text-red-500 hover:bg-red-500/10">
                  Take Action
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Main Content */}
      <Tabs defaultValue="frameworks" className="space-y-4">
        <TabsList>
          <TabsTrigger value="frameworks">Frameworks</TabsTrigger>
          <TabsTrigger value="tasks">Action Items</TabsTrigger>
          <TabsTrigger value="risks">Risk Alerts</TabsTrigger>
          <TabsTrigger value="calendar">Deadlines</TabsTrigger>
        </TabsList>

        <TabsContent value="frameworks" className="space-y-4">
          <div className="grid gap-4">
            {requirements.map(req => (
              <Card key={req.id} className="bg-card/50 border-border/50">
                <CardContent className="p-4">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex items-start gap-4 flex-1">
                      <ComplianceTrafficLight status={req.status} size="lg" />
                      <div className="flex-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <h3 className="font-semibold text-foreground">{req.name}</h3>
                          <Badge variant="secondary">{req.framework}</Badge>
                          <Badge className={cn("text-xs", getPriorityColor(req.priority))}>
                            {req.priority} priority
                          </Badge>
                        </div>
                        
                        {/* Jurisdiction Tags */}
                        <div className="flex items-center gap-2 mt-2">
                          {req.jurisdictions.map(j => (
                            <Badge key={j} variant="outline" className="text-xs">
                              {j}
                            </Badge>
                          ))}
                        </div>

                        <div className="mt-3">
                          <div className="flex items-center justify-between text-sm mb-1">
                            <span className="text-muted-foreground">Progress</span>
                            <span className="font-medium text-foreground">{req.progress}%</span>
                          </div>
                          <Progress value={req.progress} className="h-2" />
                        </div>
                        <div className="flex items-center gap-4 mt-3 text-xs text-muted-foreground">
                          {req.dueDate && (
                            <span className="flex items-center gap-1">
                              <Calendar className="h-3 w-3" />
                              Due: {new Date(req.dueDate).toLocaleDateString()}
                            </span>
                          )}
                          {req.lastAudit && (
                            <span>Last Audit: {new Date(req.lastAudit).toLocaleDateString()}</span>
                          )}
                          {req.assignedAgent && (
                            <Badge variant="secondary" className="text-xs">{req.assignedAgent}</Badge>
                          )}
                        </div>
                      </div>
                    </div>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon">
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem>
                          <Eye className="h-4 w-4 mr-2" />
                          View Details
                        </DropdownMenuItem>
                        <DropdownMenuItem>
                          <Edit className="h-4 w-4 mr-2" />
                          Edit
                        </DropdownMenuItem>
                        <DropdownMenuItem>
                          <RefreshCw className="h-4 w-4 mr-2" />
                          Run Audit
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem className="text-destructive">
                          <Trash2 className="h-4 w-4 mr-2" />
                          Remove
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="tasks" className="space-y-4">
          <Card className="bg-card/50 border-border/50">
            <CardHeader className="pb-3 flex flex-row items-center justify-between">
              <CardTitle className="text-lg">Compliance Tasks</CardTitle>
              <Button size="sm" className="gap-2">
                <Plus className="h-4 w-4" />
                Add Task
              </Button>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-[400px]">
                <div className="space-y-3">
                  {tasks.map(task => (
                    <div key={task.id} className="flex items-center justify-between p-3 rounded-lg bg-muted/30 border border-border/50">
                      <div className="flex items-center gap-3">
                        <div className={`w-2 h-2 rounded-full ${
                          task.status === 'overdue' ? 'bg-red-400' :
                          task.status === 'in_progress' ? 'bg-blue-400' :
                          task.status === 'completed' ? 'bg-emerald-400' : 'bg-muted-foreground'
                        }`} />
                        <div>
                          <p className="font-medium text-foreground text-sm">{task.title}</p>
                          <div className="flex items-center gap-2 mt-1">
                            <Badge variant="secondary" className="text-xs">{task.requirement}</Badge>
                            <span className="text-xs text-muted-foreground">
                              Due: {new Date(task.dueDate).toLocaleDateString()}
                            </span>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        {task.assignee && (
                          <Badge variant="outline" className="text-xs">{task.assignee}</Badge>
                        )}
                        <Badge className={`${getTaskStatusColor(task.status)} text-xs`}>
                          {task.status.replace('_', ' ')}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="risks" className="space-y-4">
          <div className="space-y-3">
            {riskAlerts.map(alert => (
              <Card key={alert.id} className={cn("border", getSeverityColor(alert.severity))}>
                <CardContent className="p-4">
                  <div className="flex items-start gap-3">
                    <AlertTriangle className={cn(
                      "w-5 h-5 mt-0.5",
                      alert.severity === 'critical' && "text-red-500",
                      alert.severity === 'high' && "text-orange-500",
                      alert.severity === 'medium' && "text-yellow-500",
                      alert.severity === 'low' && "text-blue-500"
                    )} />
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <h3 className="font-semibold">{alert.title}</h3>
                        <Badge variant="outline" className="text-xs">{alert.framework}</Badge>
                        <Badge className={cn("text-xs uppercase", getSeverityColor(alert.severity))}>
                          {alert.severity}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground mt-1">{alert.description}</p>
                      <div className="mt-2 p-2 rounded bg-muted/30">
                        <p className="text-xs"><strong>Action Required:</strong> {alert.actionRequired}</p>
                      </div>
                    </div>
                    <Button size="sm" variant="outline">Resolve</Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="calendar" className="space-y-4">
          <Card className="bg-card/50 border-border/50">
            <CardHeader>
              <CardTitle className="text-lg">Upcoming Deadlines</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {requirements
                  .filter(r => r.dueDate)
                  .sort((a, b) => new Date(a.dueDate!).getTime() - new Date(b.dueDate!).getTime())
                  .map(req => (
                    <div key={req.id} className="flex items-center justify-between p-4 rounded-lg bg-muted/30 border border-border/50">
                      <div className="flex items-center gap-4">
                        <div className="text-center min-w-[50px]">
                          <p className="text-2xl font-bold text-primary">
                            {new Date(req.dueDate!).getDate()}
                          </p>
                          <p className="text-xs text-muted-foreground uppercase">
                            {new Date(req.dueDate!).toLocaleString('default', { month: 'short' })}
                          </p>
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <ComplianceTrafficLight status={req.status} size="sm" />
                            <p className="font-medium text-foreground">{req.name}</p>
                          </div>
                          <div className="flex items-center gap-2 mt-1">
                            <Badge variant="secondary" className="text-xs">{req.framework}</Badge>
                            <span className="text-xs text-muted-foreground">{req.progress}% complete</span>
                          </div>
                        </div>
                      </div>
                      <Button variant="outline" size="sm">
                        View Requirements
                      </Button>
                    </div>
                  ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
