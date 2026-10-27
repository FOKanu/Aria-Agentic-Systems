import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Plus, Zap, Trash2, Pencil, Loader2, Mail, Tag, Forward, Archive, CheckSquare } from 'lucide-react';
import { useEmailAutomationRules } from '@/hooks/useEmailAutomationRules';
import { AGENTS } from '@/data/agentsData';

const triggerTypes = [
  { value: 'keyword', label: 'Contains Keyword', icon: '🔤' },
  { value: 'sender', label: 'From Sender', icon: '👤' },
  { value: 'time_based', label: 'Time-Based', icon: '⏰' },
  { value: 'all_incoming', label: 'All Incoming', icon: '📥' },
];

const actionTypes = [
  { value: 'auto_reply', label: 'Auto-Reply', icon: Mail },
  { value: 'forward_to_agent', label: 'Forward to Agent', icon: Forward },
  { value: 'label', label: 'Apply Label', icon: Tag },
  { value: 'archive', label: 'Archive', icon: Archive },
  { value: 'create_task', label: 'Create Task', icon: CheckSquare },
];

export function EmailAutomationRules() {
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [newRule, setNewRule] = useState<{
    name: string;
    trigger_type: 'keyword' | 'sender' | 'time_based' | 'all_incoming';
    trigger_value: string;
    action_type: 'auto_reply' | 'forward_to_agent' | 'label' | 'archive' | 'create_task';
    assigned_agent_id: string;
    action_config: Record<string, string>;
  }>({
    name: '',
    trigger_type: 'keyword',
    trigger_value: '',
    action_type: 'auto_reply',
    assigned_agent_id: 'aria',
    action_config: {},
  });

  const { rules, isLoading, addRule, toggleRuleActive, deleteRule } = useEmailAutomationRules();

  const handleAddRule = async () => {
    await addRule(newRule);
    setIsAddDialogOpen(false);
    setNewRule({
      name: '',
      trigger_type: 'keyword',
      trigger_value: '',
      action_type: 'auto_reply',
      assigned_agent_id: 'aria',
      action_config: {},
    });
  };

  const getTriggerLabel = (type: string) => {
    return triggerTypes.find(t => t.value === type)?.label || type;
  };

  const getActionLabel = (type: string) => {
    return actionTypes.find(a => a.value === type)?.label || type;
  };

  const getAgentName = (agentId: string | null) => {
    if (!agentId) return 'Unassigned';
    const agent = AGENTS.find(a => a.id === agentId);
    return agent ? `${agent.avatar} ${agent.name}` : 'Unknown';
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <div>
          <CardTitle className="text-lg flex items-center gap-2">
            <Zap className="w-5 h-5" />
            Automation Rules
          </CardTitle>
          <CardDescription>Set up automatic email handling rules</CardDescription>
        </div>
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <Button size="sm" className="gap-2">
              <Plus className="w-4 h-4" />
              Create Rule
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle>Create Automation Rule</DialogTitle>
              <DialogDescription>
                Set up automatic actions for incoming emails
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label>Rule Name</Label>
                <Input
                  placeholder="e.g., Auto-reply to support emails"
                  value={newRule.name}
                  onChange={e => setNewRule({ ...newRule, name: e.target.value })}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Trigger Type</Label>
                  <Select
                    value={newRule.trigger_type}
                    onValueChange={(value: 'keyword' | 'sender' | 'time_based' | 'all_incoming') =>
                      setNewRule({ ...newRule, trigger_type: value })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {triggerTypes.map(trigger => (
                        <SelectItem key={trigger.value} value={trigger.value}>
                          {trigger.icon} {trigger.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Action</Label>
                  <Select
                    value={newRule.action_type}
                    onValueChange={(value: 'auto_reply' | 'forward_to_agent' | 'label' | 'archive' | 'create_task') =>
                      setNewRule({ ...newRule, action_type: value })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {actionTypes.map(action => (
                        <SelectItem key={action.value} value={action.value}>
                          {action.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {newRule.trigger_type !== 'all_incoming' && (
                <div className="space-y-2">
                  <Label>
                    {newRule.trigger_type === 'keyword' && 'Keywords (comma-separated)'}
                    {newRule.trigger_type === 'sender' && 'Sender Email/Domain'}
                    {newRule.trigger_type === 'time_based' && 'Schedule (cron expression)'}
                  </Label>
                  <Input
                    placeholder={
                      newRule.trigger_type === 'keyword'
                        ? 'support, help, urgent'
                        : newRule.trigger_type === 'sender'
                        ? '@company.com'
                        : '0 9 * * 1-5'
                    }
                    value={newRule.trigger_value}
                    onChange={e => setNewRule({ ...newRule, trigger_value: e.target.value })}
                  />
                </div>
              )}

              {newRule.action_type === 'auto_reply' && (
                <div className="space-y-2">
                  <Label>Reply Template</Label>
                  <Textarea
                    placeholder="Thank you for your email. We'll get back to you shortly..."
                    rows={3}
                    onChange={e =>
                      setNewRule({
                        ...newRule,
                        action_config: { ...newRule.action_config, template: e.target.value },
                      })
                    }
                  />
                </div>
              )}

              {newRule.action_type === 'label' && (
                <div className="space-y-2">
                  <Label>Label Name</Label>
                  <Input
                    placeholder="e.g., important, follow-up"
                    onChange={e =>
                      setNewRule({
                        ...newRule,
                        action_config: { ...newRule.action_config, label: e.target.value },
                      })
                    }
                  />
                </div>
              )}

              <div className="space-y-2">
                <Label>Assign to Agent</Label>
                <Select
                  value={newRule.assigned_agent_id}
                  onValueChange={value => setNewRule({ ...newRule, assigned_agent_id: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {AGENTS.filter(a => a.role === 'communications' || a.role === 'assistant').map(
                      agent => (
                        <SelectItem key={agent.id} value={agent.id}>
                          {agent.avatar} {agent.name} - {agent.title}
                        </SelectItem>
                      )
                    )}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleAddRule} disabled={!newRule.name}>
                Create Rule
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
          </div>
        ) : rules.length === 0 ? (
          <div className="text-center py-8 border-2 border-dashed rounded-lg">
            <Zap className="w-10 h-10 text-muted-foreground/50 mx-auto mb-3" />
            <h4 className="font-medium mb-1">No automation rules</h4>
            <p className="text-sm text-muted-foreground mb-4">
              Create rules to automate email handling
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {rules.map(rule => {
              const ActionIcon = actionTypes.find(a => a.value === rule.action_type)?.icon || Zap;
              return (
                <div
                  key={rule.id}
                  className="flex items-center justify-between p-4 rounded-lg border bg-card"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                      <ActionIcon className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-medium">{rule.name}</span>
                        <Badge variant="outline" className="text-xs">
                          {getTriggerLabel(rule.trigger_type)}
                        </Badge>
                        <Badge variant="secondary" className="text-xs">
                          {getActionLabel(rule.action_type)}
                        </Badge>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground mt-1">
                        <span>Agent: {getAgentName(rule.assigned_agent_id)}</span>
                        {rule.execution_count > 0 && (
                          <>
                            <span>•</span>
                            <span>Executed {rule.execution_count} times</span>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Switch
                      checked={rule.is_active}
                      onCheckedChange={() => toggleRuleActive(rule.id, !rule.is_active)}
                    />
                    <Button variant="ghost" size="icon">
                      <Pencil className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="text-destructive hover:text-destructive"
                      onClick={() => deleteRule(rule.id)}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
