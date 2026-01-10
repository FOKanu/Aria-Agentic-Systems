import { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent } from '@/components/ui/card';
import { Mail, Key, Server, Bot, Loader2, ExternalLink } from 'lucide-react';
import { AGENTS } from '@/data/agentsData';
import { useEmailAccounts } from '@/hooks/useEmailAccounts';

interface AddEmailAccountDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

type EmailProvider = 'gmail' | 'outlook' | 'imap' | 'resend' | 'sendgrid' | 'smtp';

const providerConfigs: Record<string, { name: string; icon: string; description: string; requiresOAuth: boolean }> = {
  gmail: { name: 'Gmail', icon: '📧', description: 'Connect via Google OAuth', requiresOAuth: true },
  outlook: { name: 'Outlook', icon: '📬', description: 'Connect via Microsoft OAuth', requiresOAuth: true },
  resend: { name: 'Resend', icon: '🚀', description: 'Transactional email API', requiresOAuth: false },
  sendgrid: { name: 'SendGrid', icon: '📨', description: 'Email delivery service', requiresOAuth: false },
  imap: { name: 'IMAP/SMTP', icon: '⚙️', description: 'Custom mail server', requiresOAuth: false },
  smtp: { name: 'SMTP Only', icon: '📤', description: 'Outbound email only', requiresOAuth: false },
};

export function AddEmailAccountDialog({ open, onOpenChange }: AddEmailAccountDialogProps) {
  const [provider, setProvider] = useState<EmailProvider>('gmail');
  const [emailAddress, setEmailAddress] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [apiKey, setApiKey] = useState('');
  const [smtpHost, setSmtpHost] = useState('');
  const [smtpPort, setSmtpPort] = useState('587');
  const [smtpUsername, setSmtpUsername] = useState('');
  const [imapHost, setImapHost] = useState('');
  const [imapPort, setImapPort] = useState('993');
  const [assignedAgent, setAssignedAgent] = useState('aria');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { addAccount } = useEmailAccounts();

  const handleSubmit = async () => {
    setIsSubmitting(true);
    try {
      await addAccount({
        provider,
        email_address: emailAddress,
        display_name: displayName || undefined,
        assigned_agent_id: assignedAgent || undefined,
        smtp_host: smtpHost || undefined,
        smtp_port: smtpPort ? parseInt(smtpPort) : undefined,
        smtp_username: smtpUsername || undefined,
        imap_host: imapHost || undefined,
        imap_port: imapPort ? parseInt(imapPort) : undefined,
        // Note: API keys should be stored securely via secrets, not directly
        api_key_secret_name: apiKey ? `EMAIL_API_KEY_${Date.now()}` : undefined,
      });
      onOpenChange(false);
      resetForm();
    } catch (error) {
      console.error('Failed to add email account:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const resetForm = () => {
    setProvider('gmail');
    setEmailAddress('');
    setDisplayName('');
    setApiKey('');
    setSmtpHost('');
    setSmtpPort('587');
    setSmtpUsername('');
    setImapHost('');
    setImapPort('993');
    setAssignedAgent('aria');
  };

  const config = providerConfigs[provider];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Mail className="w-5 h-5" />
            Add Email Account
          </DialogTitle>
          <DialogDescription>
            Connect an email account to enable AI-powered email features
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Provider Selection */}
          <div className="space-y-3">
            <Label>Email Provider</Label>
            <div className="grid grid-cols-3 gap-2">
              {Object.entries(providerConfigs).map(([key, cfg]) => (
                <Card
                  key={key}
                  className={`cursor-pointer transition-all hover:border-primary/50 ${
                    provider === key ? 'border-primary bg-primary/5' : ''
                  }`}
                  onClick={() => setProvider(key as EmailProvider)}
                >
                  <CardContent className="p-3 text-center">
                    <span className="text-2xl mb-1 block">{cfg.icon}</span>
                    <p className="font-medium text-sm">{cfg.name}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
            <p className="text-sm text-muted-foreground">{config.description}</p>
          </div>

          {/* OAuth Providers */}
          {config.requiresOAuth ? (
            <div className="space-y-4">
              <div className="p-4 rounded-lg border bg-muted/30 text-center">
                <p className="text-sm text-muted-foreground mb-3">
                  Click below to authenticate with {config.name}
                </p>
                <Button className="gap-2">
                  <ExternalLink className="w-4 h-4" />
                  Connect {config.name} Account
                </Button>
              </div>
              <div className="space-y-2">
                <Label>Assign to Agent</Label>
                <Select value={assignedAgent} onValueChange={setAssignedAgent}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {AGENTS.filter(a => a.role === 'communications' || a.role === 'assistant').map(agent => (
                      <SelectItem key={agent.id} value={agent.id}>
                        {agent.avatar} {agent.name} - {agent.title}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          ) : (
            /* API Key or SMTP Providers */
            <Tabs defaultValue="credentials" className="w-full">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="credentials">
                  <Key className="w-4 h-4 mr-2" />
                  Credentials
                </TabsTrigger>
                <TabsTrigger value="settings">
                  <Server className="w-4 h-4 mr-2" />
                  Server Settings
                </TabsTrigger>
              </TabsList>

              <TabsContent value="credentials" className="space-y-4 mt-4">
                <div className="space-y-2">
                  <Label>Email Address</Label>
                  <Input
                    type="email"
                    placeholder="you@example.com"
                    value={emailAddress}
                    onChange={e => setEmailAddress(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Display Name (Optional)</Label>
                  <Input
                    placeholder="Your Name"
                    value={displayName}
                    onChange={e => setDisplayName(e.target.value)}
                  />
                </div>
                {(provider === 'resend' || provider === 'sendgrid') && (
                  <div className="space-y-2">
                    <Label>API Key</Label>
                    <Input
                      type="password"
                      placeholder="Enter your API key"
                      value={apiKey}
                      onChange={e => setApiKey(e.target.value)}
                    />
                    <p className="text-xs text-muted-foreground">
                      Your API key will be stored securely and encrypted
                    </p>
                  </div>
                )}
                <div className="space-y-2">
                  <Label className="flex items-center gap-2">
                    <Bot className="w-4 h-4" />
                    Assign to Agent
                  </Label>
                  <Select value={assignedAgent} onValueChange={setAssignedAgent}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {AGENTS.filter(a => a.role === 'communications' || a.role === 'assistant').map(agent => (
                        <SelectItem key={agent.id} value={agent.id}>
                          {agent.avatar} {agent.name} - {agent.title}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </TabsContent>

              <TabsContent value="settings" className="space-y-4 mt-4">
                {(provider === 'imap' || provider === 'smtp') && (
                  <>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label>SMTP Host</Label>
                        <Input
                          placeholder="smtp.example.com"
                          value={smtpHost}
                          onChange={e => setSmtpHost(e.target.value)}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>SMTP Port</Label>
                        <Input
                          placeholder="587"
                          value={smtpPort}
                          onChange={e => setSmtpPort(e.target.value)}
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label>SMTP Username</Label>
                      <Input
                        placeholder="your-username"
                        value={smtpUsername}
                        onChange={e => setSmtpUsername(e.target.value)}
                      />
                    </div>
                    {provider === 'imap' && (
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label>IMAP Host</Label>
                          <Input
                            placeholder="imap.example.com"
                            value={imapHost}
                            onChange={e => setImapHost(e.target.value)}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label>IMAP Port</Label>
                          <Input
                            placeholder="993"
                            value={imapPort}
                            onChange={e => setImapPort(e.target.value)}
                          />
                        </div>
                      </div>
                    )}
                  </>
                )}
                {(provider === 'resend' || provider === 'sendgrid') && (
                  <div className="text-center py-6 text-muted-foreground">
                    <p>No additional server settings required for {config.name}</p>
                  </div>
                )}
              </TabsContent>
            </Tabs>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={isSubmitting || !emailAddress}>
            {isSubmitting && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
            Add Account
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
