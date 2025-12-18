import { useState } from 'react';
import { AlertTriangle, Bell, Shield, Hand, Play, Pause, StopCircle, SkipForward, RotateCcw, Settings, CheckCircle, XCircle, Clock, Zap } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Progress } from '@/components/ui/progress';
import { mockAgents } from '@/data/agentsData';

type AlertSeverity = 'info' | 'warning' | 'critical';
type AlertStatus = 'active' | 'acknowledged' | 'resolved';

interface Alert {
  id: string;
  agentId: string;
  agentName: string;
  agentAvatar: string;
  title: string;
  description: string;
  severity: AlertSeverity;
  status: AlertStatus;
  timestamp: Date;
  category: string;
}

interface AlertRule {
  id: string;
  name: string;
  description: string;
  enabled: boolean;
  severity: AlertSeverity;
  triggers: number;
}

interface PendingApproval {
  id: string;
  agentId: string;
  agentName: string;
  agentAvatar: string;
  action: string;
  risk: 'low' | 'medium' | 'high';
  timestamp: Date;
  details: string;
}

const severityConfig: Record<AlertSeverity, { color: string; bg: string; icon: React.ElementType }> = {
  info: { color: 'text-info', bg: 'bg-info/20', icon: Bell },
  warning: { color: 'text-warning', bg: 'bg-warning/20', icon: AlertTriangle },
  critical: { color: 'text-destructive', bg: 'bg-destructive/20', icon: AlertTriangle },
};

const riskConfig: Record<string, { color: string; bg: string }> = {
  low: { color: 'text-success', bg: 'bg-success/20' },
  medium: { color: 'text-warning', bg: 'bg-warning/20' },
  high: { color: 'text-destructive', bg: 'bg-destructive/20' },
};

const generateMockAlerts = (): Alert[] => {
  const alertTypes = [
    { title: 'High Error Rate', description: 'Error rate exceeded 5% threshold', severity: 'critical' as AlertSeverity, category: 'Performance' },
    { title: 'Slow Response Time', description: 'Average latency above 2000ms', severity: 'warning' as AlertSeverity, category: 'Performance' },
    { title: 'Repeated Action', description: 'Agent stuck in retry loop', severity: 'warning' as AlertSeverity, category: 'Behavior' },
    { title: 'Unusual Activity', description: 'Detected anomalous behavior pattern', severity: 'info' as AlertSeverity, category: 'Security' },
    { title: 'Resource Limit', description: 'Approaching token budget limit', severity: 'warning' as AlertSeverity, category: 'Resources' },
    { title: 'Authentication Failed', description: 'Multiple failed auth attempts', severity: 'critical' as AlertSeverity, category: 'Security' },
  ];

  return Array.from({ length: 8 }, (_, i) => {
    const agent = mockAgents[Math.floor(Math.random() * mockAgents.length)];
    const alertType = alertTypes[Math.floor(Math.random() * alertTypes.length)];
    const statuses: AlertStatus[] = ['active', 'acknowledged', 'resolved'];
    const status: AlertStatus = i < 2 ? 'active' : i < 5 ? 'acknowledged' : 'resolved';

    return {
      id: `alert-${i}`,
      agentId: agent.id,
      agentName: agent.name,
      agentAvatar: agent.avatar,
      ...alertType,
      status,
      timestamp: new Date(Date.now() - Math.random() * 1000 * 60 * 60 * 2),
    };
  }).sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
};

const generateMockRules = (): AlertRule[] => [
  { id: 'rule-1', name: 'High Error Rate', description: 'Alert when error rate exceeds 5%', enabled: true, severity: 'critical', triggers: 12 },
  { id: 'rule-2', name: 'Slow Response', description: 'Alert when avg latency > 2000ms', enabled: true, severity: 'warning', triggers: 8 },
  { id: 'rule-3', name: 'Stuck Agent', description: 'Alert when agent repeats action 5+ times', enabled: true, severity: 'warning', triggers: 3 },
  { id: 'rule-4', name: 'Token Budget', description: 'Alert at 80% token usage', enabled: false, severity: 'info', triggers: 0 },
  { id: 'rule-5', name: 'Anomaly Detection', description: 'ML-based unusual behavior detection', enabled: true, severity: 'info', triggers: 5 },
];

const generateMockApprovals = (): PendingApproval[] => {
  return mockAgents.slice(0, 3).map((agent, i) => ({
    id: `approval-${i}`,
    agentId: agent.id,
    agentName: agent.name,
    agentAvatar: agent.avatar,
    action: ['Delete file permanently', 'Send external API request', 'Modify database record'][i],
    risk: (['high', 'medium', 'low'] as const)[i],
    timestamp: new Date(Date.now() - Math.random() * 1000 * 60 * 10),
    details: 'Requires human approval before execution',
  }));
};

export function AlertsControlsPage() {
  const [alerts, setAlerts] = useState<Alert[]>(generateMockAlerts);
  const [rules, setRules] = useState<AlertRule[]>(generateMockRules);
  const [approvals, setApprovals] = useState<PendingApproval[]>(generateMockApprovals);
  const [activeSection, setActiveSection] = useState<'alerts' | 'rules' | 'approvals'>('alerts');

  const activeAlerts = alerts.filter(a => a.status === 'active').length;
  const criticalAlerts = alerts.filter(a => a.severity === 'critical' && a.status === 'active').length;

  const toggleRule = (ruleId: string) => {
    setRules(prev => prev.map(r => r.id === ruleId ? { ...r, enabled: !r.enabled } : r));
  };

  const acknowledgeAlert = (alertId: string) => {
    setAlerts(prev => prev.map(a => a.id === alertId ? { ...a, status: 'acknowledged' } : a));
  };

  const resolveAlert = (alertId: string) => {
    setAlerts(prev => prev.map(a => a.id === alertId ? { ...a, status: 'resolved' } : a));
  };

  const approveAction = (approvalId: string) => {
    setApprovals(prev => prev.filter(a => a.id !== approvalId));
  };

  const rejectAction = (approvalId: string) => {
    setApprovals(prev => prev.filter(a => a.id !== approvalId));
  };

  return (
    <div className="space-y-4">
      {/* Summary Cards */}
      <div className="grid grid-cols-3 gap-2">
        <div className={cn(
          "p-3 rounded-xl border-2 transition-all cursor-pointer",
          activeSection === 'alerts' ? "border-primary bg-primary/10" : "border-border bg-card"
        )} onClick={() => setActiveSection('alerts')}>
          <div className="flex items-center gap-2">
            <AlertTriangle className={cn("w-4 h-4", criticalAlerts > 0 ? "text-destructive" : "text-warning")} />
            <span className="text-xs font-medium">Alerts</span>
          </div>
          <p className="text-2xl font-mono font-bold mt-1">{activeAlerts}</p>
          <p className="text-[10px] text-muted-foreground">{criticalAlerts} critical</p>
        </div>

        <div className={cn(
          "p-3 rounded-xl border-2 transition-all cursor-pointer",
          activeSection === 'approvals' ? "border-primary bg-primary/10" : "border-border bg-card"
        )} onClick={() => setActiveSection('approvals')}>
          <div className="flex items-center gap-2">
            <Hand className="w-4 h-4 text-warning" />
            <span className="text-xs font-medium">Pending</span>
          </div>
          <p className="text-2xl font-mono font-bold mt-1">{approvals.length}</p>
          <p className="text-[10px] text-muted-foreground">need approval</p>
        </div>

        <div className={cn(
          "p-3 rounded-xl border-2 transition-all cursor-pointer",
          activeSection === 'rules' ? "border-primary bg-primary/10" : "border-border bg-card"
        )} onClick={() => setActiveSection('rules')}>
          <div className="flex items-center gap-2">
            <Settings className="w-4 h-4 text-muted-foreground" />
            <span className="text-xs font-medium">Rules</span>
          </div>
          <p className="text-2xl font-mono font-bold mt-1">{rules.filter(r => r.enabled).length}</p>
          <p className="text-[10px] text-muted-foreground">active rules</p>
        </div>
      </div>

      {/* Quick Controls */}
      <div className="p-3 rounded-xl bg-card border border-border">
        <h3 className="text-xs font-display font-bold mb-3 flex items-center gap-2">
          <Shield className="w-4 h-4 text-primary" />
          Quick Controls
        </h3>
        <div className="grid grid-cols-4 gap-2">
          <Button variant="outline" size="sm" className="flex-col h-auto py-2 gap-1">
            <Pause className="w-4 h-4" />
            <span className="text-[10px]">Pause All</span>
          </Button>
          <Button variant="outline" size="sm" className="flex-col h-auto py-2 gap-1">
            <Play className="w-4 h-4 text-success" />
            <span className="text-[10px]">Resume</span>
          </Button>
          <Button variant="outline" size="sm" className="flex-col h-auto py-2 gap-1">
            <SkipForward className="w-4 h-4 text-warning" />
            <span className="text-[10px]">Skip Step</span>
          </Button>
          <Button variant="destructive" size="sm" className="flex-col h-auto py-2 gap-1">
            <StopCircle className="w-4 h-4" />
            <span className="text-[10px]">Stop All</span>
          </Button>
        </div>
      </div>

      {/* Main Content */}
      <ScrollArea className="h-[400px]">
        {activeSection === 'alerts' && (
          <div className="space-y-2 pr-4">
            {alerts.map(alert => {
              const config = severityConfig[alert.severity];
              const Icon = config.icon;

              return (
                <div
                  key={alert.id}
                  className={cn(
                    "p-3 rounded-xl border transition-all",
                    alert.status === 'active' ? `${config.bg} border-current ${config.color}` : "bg-secondary/30 border-border"
                  )}
                >
                  <div className="flex items-start gap-3">
                    <div className={cn("w-8 h-8 rounded-lg flex items-center justify-center shrink-0", config.bg)}>
                      <Icon className={cn("w-4 h-4", config.color)} />
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium">{alert.title}</span>
                        <Badge variant="outline" className="text-[9px]">
                          {alert.category}
                        </Badge>
                        <Badge variant={alert.status === 'active' ? 'destructive' : 'secondary'} className="text-[9px]">
                          {alert.status}
                        </Badge>
                      </div>
                      <p className="text-xs text-muted-foreground mt-0.5">{alert.description}</p>
                      <p className="text-[10px] text-muted-foreground mt-1">
                        {alert.agentAvatar} {alert.agentName} • {alert.timestamp.toLocaleTimeString()}
                      </p>
                    </div>

                    {alert.status === 'active' && (
                      <div className="flex gap-1 shrink-0">
                        <Button variant="ghost" size="sm" className="h-7 px-2 text-[10px]" onClick={() => acknowledgeAlert(alert.id)}>
                          Ack
                        </Button>
                        <Button variant="ghost" size="sm" className="h-7 px-2 text-[10px]" onClick={() => resolveAlert(alert.id)}>
                          Resolve
                        </Button>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {activeSection === 'approvals' && (
          <div className="space-y-2 pr-4">
            {approvals.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <CheckCircle className="w-8 h-8 mx-auto mb-2 opacity-50" />
                <p className="text-sm">No pending approvals</p>
              </div>
            ) : (
              approvals.map(approval => {
                const config = riskConfig[approval.risk];

                return (
                  <div
                    key={approval.id}
                    className={cn("p-3 rounded-xl border", config.bg, "border-current", config.color)}
                  >
                    <div className="flex items-start gap-3">
                      <div className="w-10 h-10 rounded-lg bg-secondary flex items-center justify-center text-lg shrink-0">
                        {approval.agentAvatar}
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-medium">{approval.action}</span>
                          <Badge className={cn("text-[9px]", config.bg, config.color)}>
                            {approval.risk} risk
                          </Badge>
                        </div>
                        <p className="text-xs text-muted-foreground mt-0.5">{approval.details}</p>
                        <p className="text-[10px] text-muted-foreground mt-1">
                          {approval.agentName} • {approval.timestamp.toLocaleTimeString()}
                        </p>
                      </div>

                      <div className="flex gap-1 shrink-0">
                        <Button
                          variant="default"
                          size="sm"
                          className="h-8 gap-1"
                          onClick={() => approveAction(approval.id)}
                        >
                          <CheckCircle className="w-3 h-3" />
                          Approve
                        </Button>
                        <Button
                          variant="destructive"
                          size="sm"
                          className="h-8 gap-1"
                          onClick={() => rejectAction(approval.id)}
                        >
                          <XCircle className="w-3 h-3" />
                          Reject
                        </Button>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        )}

        {activeSection === 'rules' && (
          <div className="space-y-2 pr-4">
            {rules.map(rule => {
              const config = severityConfig[rule.severity];

              return (
                <div
                  key={rule.id}
                  className="p-3 rounded-xl bg-secondary/30 border border-border"
                >
                  <div className="flex items-center gap-3">
                    <Switch
                      checked={rule.enabled}
                      onCheckedChange={() => toggleRule(rule.id)}
                    />

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium">{rule.name}</span>
                        <Badge variant="outline" className={cn("text-[9px]", config.color)}>
                          {rule.severity}
                        </Badge>
                      </div>
                      <p className="text-xs text-muted-foreground">{rule.description}</p>
                    </div>

                    <div className="text-right shrink-0">
                      <p className="text-sm font-mono font-bold">{rule.triggers}</p>
                      <p className="text-[10px] text-muted-foreground">triggers</p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </ScrollArea>
    </div>
  );
}
