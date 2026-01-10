import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Plus, Mail, Settings2, Zap, Trash2, Pencil, CheckCircle2, AlertCircle, Loader2 } from 'lucide-react';
import { AddEmailAccountDialog } from './AddEmailAccountDialog';
import { EmailAutomationRules } from './EmailAutomationRules';
import { useEmailAccounts } from '@/hooks/useEmailAccounts';
import { AGENTS } from '@/data/agentsData';

export function EmailSettingsPanel() {
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const { accounts, isLoading, toggleAccountActive, deleteAccount, setPrimaryAccount } = useEmailAccounts();

  const getProviderLabel = (provider: string) => {
    const labels: Record<string, string> = {
      gmail: 'Gmail',
      outlook: 'Outlook',
      imap: 'IMAP/SMTP',
      resend: 'Resend API',
      sendgrid: 'SendGrid',
      smtp: 'Custom SMTP',
    };
    return labels[provider] || provider;
  };

  const getAgentName = (agentId: string | null) => {
    if (!agentId) return 'Unassigned';
    const agent = AGENTS.find(a => a.id === agentId);
    return agent ? `${agent.avatar} ${agent.name}` : 'Unknown';
  };

  return (
    <div className="space-y-6">
      <Tabs defaultValue="accounts" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="accounts" className="gap-2">
            <Mail className="w-4 h-4" />
            Email Accounts
          </TabsTrigger>
          <TabsTrigger value="automation" className="gap-2">
            <Zap className="w-4 h-4" />
            Automation Rules
          </TabsTrigger>
        </TabsList>

        <TabsContent value="accounts" className="space-y-4 mt-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <div>
                <CardTitle className="text-lg">Connected Accounts</CardTitle>
                <CardDescription>Manage your email accounts for AI access</CardDescription>
              </div>
              <Button onClick={() => setIsAddDialogOpen(true)} size="sm" className="gap-2">
                <Plus className="w-4 h-4" />
                Add Account
              </Button>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
                </div>
              ) : accounts.length === 0 ? (
                <div className="text-center py-8 border-2 border-dashed rounded-lg">
                  <Mail className="w-10 h-10 text-muted-foreground/50 mx-auto mb-3" />
                  <h4 className="font-medium mb-1">No email accounts connected</h4>
                  <p className="text-sm text-muted-foreground mb-4">
                    Connect an email account to enable AI-powered email features
                  </p>
                  <Button onClick={() => setIsAddDialogOpen(true)} variant="outline" size="sm">
                    <Plus className="w-4 h-4 mr-2" />
                    Add Your First Account
                  </Button>
                </div>
              ) : (
                <div className="space-y-3">
                  {accounts.map(account => (
                    <div
                      key={account.id}
                      className="flex items-center justify-between p-4 rounded-lg border bg-card hover:bg-secondary/30 transition-colors"
                    >
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                          <Mail className="w-5 h-5 text-primary" />
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-medium">{account.email_address}</span>
                            {account.is_primary && (
                              <Badge variant="default" className="text-xs">Primary</Badge>
                            )}
                            <Badge variant="outline" className="text-xs">
                              {getProviderLabel(account.provider)}
                            </Badge>
                          </div>
                          <div className="flex items-center gap-3 text-sm text-muted-foreground mt-1">
                            <span className="flex items-center gap-1">
                              {account.is_active ? (
                                <CheckCircle2 className="w-3 h-3 text-success" />
                              ) : (
                                <AlertCircle className="w-3 h-3 text-warning" />
                              )}
                              {account.is_active ? 'Active' : 'Inactive'}
                            </span>
                            <span>•</span>
                            <span>Agent: {getAgentName(account.assigned_agent_id)}</span>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Switch
                          checked={account.is_active}
                          onCheckedChange={() => toggleAccountActive(account.id, !account.is_active)}
                        />
                        {!account.is_primary && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setPrimaryAccount(account.id)}
                          >
                            Set Primary
                          </Button>
                        )}
                        <Button variant="ghost" size="icon">
                          <Pencil className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="text-destructive hover:text-destructive"
                          onClick={() => deleteAccount(account.id)}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Agent Settings */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Settings2 className="w-5 h-5" />
                Agent Email Settings
              </CardTitle>
              <CardDescription>Configure how AI agents handle your emails</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between p-3 rounded-lg border">
                <div>
                  <p className="font-medium">Auto-reply for missed messages</p>
                  <p className="text-sm text-muted-foreground">
                    AI will respond to emails when you're unavailable
                  </p>
                </div>
                <Switch />
              </div>
              <div className="flex items-center justify-between p-3 rounded-lg border">
                <div>
                  <p className="font-medium">Smart email categorization</p>
                  <p className="text-sm text-muted-foreground">
                    Automatically label and organize incoming emails
                  </p>
                </div>
                <Switch defaultChecked />
              </div>
              <div className="flex items-center justify-between p-3 rounded-lg border">
                <div>
                  <p className="font-medium">Draft suggestions</p>
                  <p className="text-sm text-muted-foreground">
                    AI will suggest reply drafts for incoming emails
                  </p>
                </div>
                <Switch defaultChecked />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="automation" className="mt-4">
          <EmailAutomationRules />
        </TabsContent>
      </Tabs>

      <AddEmailAccountDialog 
        open={isAddDialogOpen} 
        onOpenChange={setIsAddDialogOpen} 
      />
    </div>
  );
}
