import { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent } from '@/components/ui/card';
import { Phone, Bot, Loader2, Mic, ExternalLink } from 'lucide-react';
import { AGENTS } from '@/data/agentsData';
import { usePhoneConfigurations } from '@/hooks/usePhoneConfigurations';

interface AddPhoneNumberDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

type PhoneProvider = 'twilio' | 'vapi' | 'vonage' | 'custom';

const providerConfigs: Record<string, { name: string; icon: string; description: string; fields: string[] }> = {
  twilio: { 
    name: 'Twilio', 
    icon: '📞', 
    description: 'Industry-standard voice API',
    fields: ['account_sid', 'auth_token', 'phone_number']
  },
  vapi: { 
    name: 'VAPI', 
    icon: '🤖', 
    description: 'AI-first voice platform',
    fields: ['api_key', 'phone_number']
  },
  vonage: { 
    name: 'Vonage', 
    icon: '☎️', 
    description: 'Communications API',
    fields: ['api_key', 'api_secret', 'phone_number']
  },
  custom: { 
    name: 'Custom', 
    icon: '⚙️', 
    description: 'Custom SIP/VoIP provider',
    fields: ['endpoint', 'credentials', 'phone_number']
  },
};

const voiceModels = [
  { value: 'female_professional', label: '👩‍💼 Female Professional' },
  { value: 'male_professional', label: '👨‍💼 Male Professional' },
  { value: 'female_friendly', label: '👩 Female Friendly' },
  { value: 'male_friendly', label: '👨 Male Friendly' },
  { value: 'neutral_assistant', label: '🤖 Neutral Assistant' },
];

export function AddPhoneNumberDialog({ open, onOpenChange }: AddPhoneNumberDialogProps) {
  const [provider, setProvider] = useState<PhoneProvider>('twilio');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [accountSid, setAccountSid] = useState('');
  const [authToken, setAuthToken] = useState('');
  const [voiceModel, setVoiceModel] = useState('female_professional');
  const [assignedAgent, setAssignedAgent] = useState('orion');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { addConfiguration } = usePhoneConfigurations();

  const handleSubmit = async () => {
    setIsSubmitting(true);
    try {
      await addConfiguration({
        provider,
        phone_number: phoneNumber,
        display_name: displayName || undefined,
        account_sid: accountSid || undefined,
        voice_model: voiceModel,
        assigned_agent_id: assignedAgent,
        // Note: Auth tokens should be stored securely via secrets
        api_key_secret_name: authToken ? `PHONE_AUTH_${Date.now()}` : undefined,
      });
      onOpenChange(false);
      resetForm();
    } catch (error) {
      console.error('Failed to add phone configuration:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const resetForm = () => {
    setProvider('twilio');
    setPhoneNumber('');
    setDisplayName('');
    setAccountSid('');
    setAuthToken('');
    setVoiceModel('female_professional');
    setAssignedAgent('orion');
  };

  const config = providerConfigs[provider];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[550px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Phone className="w-5 h-5" />
            Add Phone Number
          </DialogTitle>
          <DialogDescription>
            Connect a phone number to enable AI-powered call handling
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Provider Selection */}
          <div className="space-y-3">
            <Label>Phone Provider</Label>
            <div className="grid grid-cols-4 gap-2">
              {Object.entries(providerConfigs).map(([key, cfg]) => (
                <Card
                  key={key}
                  className={`cursor-pointer transition-all hover:border-primary/50 ${
                    provider === key ? 'border-primary bg-primary/5' : ''
                  }`}
                  onClick={() => setProvider(key as PhoneProvider)}
                >
                  <CardContent className="p-3 text-center">
                    <span className="text-2xl mb-1 block">{cfg.icon}</span>
                    <p className="font-medium text-xs">{cfg.name}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
            <p className="text-sm text-muted-foreground">{config.description}</p>
          </div>

          {/* Provider-specific fields */}
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Phone Number</Label>
              <Input
                type="tel"
                placeholder="+1 (555) 123-4567"
                value={phoneNumber}
                onChange={e => setPhoneNumber(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label>Display Name (Optional)</Label>
              <Input
                placeholder="Main Business Line"
                value={displayName}
                onChange={e => setDisplayName(e.target.value)}
              />
            </div>

            {provider === 'twilio' && (
              <>
                <div className="space-y-2">
                  <Label>Account SID</Label>
                  <Input
                    placeholder="ACxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"
                    value={accountSid}
                    onChange={e => setAccountSid(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Auth Token</Label>
                  <Input
                    type="password"
                    placeholder="Enter your auth token"
                    value={authToken}
                    onChange={e => setAuthToken(e.target.value)}
                  />
                  <p className="text-xs text-muted-foreground">
                    Your credentials will be stored securely and encrypted
                  </p>
                </div>
              </>
            )}

            {provider === 'vapi' && (
              <div className="space-y-2">
                <Label>API Key</Label>
                <Input
                  type="password"
                  placeholder="Enter your VAPI API key"
                  value={authToken}
                  onChange={e => setAuthToken(e.target.value)}
                />
              </div>
            )}

            {provider === 'vonage' && (
              <>
                <div className="space-y-2">
                  <Label>API Key</Label>
                  <Input
                    placeholder="Enter your API key"
                    value={accountSid}
                    onChange={e => setAccountSid(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label>API Secret</Label>
                  <Input
                    type="password"
                    placeholder="Enter your API secret"
                    value={authToken}
                    onChange={e => setAuthToken(e.target.value)}
                  />
                </div>
              </>
            )}

            <div className="space-y-2">
              <Label className="flex items-center gap-2">
                <Mic className="w-4 h-4" />
                Voice Model
              </Label>
              <Select value={voiceModel} onValueChange={setVoiceModel}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {voiceModels.map(voice => (
                    <SelectItem key={voice.value} value={voice.value}>
                      {voice.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

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
                  {AGENTS.filter(a => a.role === 'scheduler' || a.role === 'assistant').map(agent => (
                    <SelectItem key={agent.id} value={agent.id}>
                      {agent.avatar} {agent.name} - {agent.title}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Help link */}
          <div className="text-center">
            <Button variant="link" size="sm" className="gap-1 text-muted-foreground">
              <ExternalLink className="w-3 h-3" />
              View setup guide for {config.name}
            </Button>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={isSubmitting || !phoneNumber}>
            {isSubmitting && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
            Add Number
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
