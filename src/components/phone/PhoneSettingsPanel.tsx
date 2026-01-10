import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Plus, Phone, Settings2, Mic, Voicemail, Trash2, Pencil, CheckCircle2, AlertCircle, Loader2, Clock } from 'lucide-react';
import { AddPhoneNumberDialog } from './AddPhoneNumberDialog';
import { usePhoneConfigurations } from '@/hooks/usePhoneConfigurations';
import { AGENTS } from '@/data/agentsData';

const voiceModels = [
  { value: 'female_professional', label: '👩‍💼 Female Professional' },
  { value: 'male_professional', label: '👨‍💼 Male Professional' },
  { value: 'female_friendly', label: '👩 Female Friendly' },
  { value: 'male_friendly', label: '👨 Male Friendly' },
  { value: 'neutral_assistant', label: '🤖 Neutral Assistant' },
];

const workingDays = [
  { value: 1, label: 'Mon' },
  { value: 2, label: 'Tue' },
  { value: 3, label: 'Wed' },
  { value: 4, label: 'Thu' },
  { value: 5, label: 'Fri' },
  { value: 6, label: 'Sat' },
  { value: 0, label: 'Sun' },
];

export function PhoneSettingsPanel() {
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const { configurations, isLoading, toggleActive, deleteConfiguration, setPrimary, updateConfiguration } = usePhoneConfigurations();

  const getProviderLabel = (provider: string) => {
    const labels: Record<string, string> = {
      twilio: 'Twilio',
      vapi: 'VAPI',
      vonage: 'Vonage',
      custom: 'Custom',
    };
    return labels[provider] || provider;
  };

  const getAgentName = (agentId: string | null) => {
    if (!agentId) return 'Unassigned';
    const agent = AGENTS.find(a => a.id === agentId);
    return agent ? `${agent.avatar} ${agent.name}` : 'Unknown';
  };

  const getVoiceLabel = (model: string | null) => {
    if (!model) return 'Default';
    return voiceModels.find(v => v.value === model)?.label || model;
  };

  return (
    <div className="space-y-6">
      <Tabs defaultValue="numbers" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="numbers" className="gap-2">
            <Phone className="w-4 h-4" />
            Phone Numbers
          </TabsTrigger>
          <TabsTrigger value="voice" className="gap-2">
            <Mic className="w-4 h-4" />
            Voice Assistant
          </TabsTrigger>
          <TabsTrigger value="voicemail" className="gap-2">
            <Voicemail className="w-4 h-4" />
            Voicemail
          </TabsTrigger>
        </TabsList>

        <TabsContent value="numbers" className="space-y-4 mt-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <div>
                <CardTitle className="text-lg">Phone Numbers</CardTitle>
                <CardDescription>Manage your phone numbers for AI call handling</CardDescription>
              </div>
              <Button onClick={() => setIsAddDialogOpen(true)} size="sm" className="gap-2">
                <Plus className="w-4 h-4" />
                Add Number
              </Button>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
                </div>
              ) : configurations.length === 0 ? (
                <div className="text-center py-8 border-2 border-dashed rounded-lg">
                  <Phone className="w-10 h-10 text-muted-foreground/50 mx-auto mb-3" />
                  <h4 className="font-medium mb-1">No phone numbers configured</h4>
                  <p className="text-sm text-muted-foreground mb-4">
                    Add a phone number to enable AI-powered call handling
                  </p>
                  <Button onClick={() => setIsAddDialogOpen(true)} variant="outline" size="sm">
                    <Plus className="w-4 h-4 mr-2" />
                    Add Your First Number
                  </Button>
                </div>
              ) : (
                <div className="space-y-3">
                  {configurations.map(config => (
                    <div
                      key={config.id}
                      className="flex items-center justify-between p-4 rounded-lg border bg-card hover:bg-secondary/30 transition-colors"
                    >
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                          <Phone className="w-5 h-5 text-primary" />
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-medium font-mono">{config.phone_number}</span>
                            {config.is_primary && (
                              <Badge variant="default" className="text-xs">Primary</Badge>
                            )}
                            <Badge variant="outline" className="text-xs">
                              {getProviderLabel(config.provider)}
                            </Badge>
                          </div>
                          <div className="flex items-center gap-3 text-sm text-muted-foreground mt-1">
                            <span className="flex items-center gap-1">
                              {config.is_active ? (
                                <CheckCircle2 className="w-3 h-3 text-success" />
                              ) : (
                                <AlertCircle className="w-3 h-3 text-warning" />
                              )}
                              {config.is_active ? 'Active' : 'Inactive'}
                            </span>
                            <span>•</span>
                            <span>Agent: {getAgentName(config.assigned_agent_id)}</span>
                            <span>•</span>
                            <span>Voice: {getVoiceLabel(config.voice_model)}</span>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Switch
                          checked={config.is_active}
                          onCheckedChange={() => toggleActive(config.id, !config.is_active)}
                        />
                        {!config.is_primary && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setPrimary(config.id)}
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
                          onClick={() => deleteConfiguration(config.id)}
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
        </TabsContent>

        <TabsContent value="voice" className="space-y-4 mt-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Mic className="w-5 h-5" />
                Voice Assistant Configuration
              </CardTitle>
              <CardDescription>Configure the AI voice for phone interactions</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Default Voice Model</Label>
                <Select defaultValue="female_professional">
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
                <Label>Default Call Handler Agent</Label>
                <Select defaultValue="orion">
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

              <div className="space-y-2">
                <Label>Call Greeting</Label>
                <Textarea
                  placeholder="Hello, thank you for calling. How can I help you today?"
                  defaultValue="Hello, thank you for calling. How can I help you today?"
                  rows={2}
                />
              </div>

              <div className="flex items-center justify-between p-3 rounded-lg border">
                <div>
                  <p className="font-medium">Real-time transcription</p>
                  <p className="text-sm text-muted-foreground">
                    Transcribe calls in real-time for agent context
                  </p>
                </div>
                <Switch defaultChecked />
              </div>

              <div className="flex items-center justify-between p-3 rounded-lg border">
                <div>
                  <p className="font-medium">Call recording</p>
                  <p className="text-sm text-muted-foreground">
                    Record calls for quality assurance and training
                  </p>
                </div>
                <Switch />
              </div>
            </CardContent>
          </Card>

          {/* Working Hours */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Clock className="w-5 h-5" />
                Working Hours
              </CardTitle>
              <CardDescription>Set when AI should handle calls</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Start Time</Label>
                  <Select defaultValue="09:00">
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {Array.from({ length: 24 }, (_, i) => (
                        <SelectItem key={i} value={`${i.toString().padStart(2, '0')}:00`}>
                          {i.toString().padStart(2, '0')}:00
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>End Time</Label>
                  <Select defaultValue="18:00">
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {Array.from({ length: 24 }, (_, i) => (
                        <SelectItem key={i} value={`${i.toString().padStart(2, '0')}:00`}>
                          {i.toString().padStart(2, '0')}:00
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label>Working Days</Label>
                <div className="flex gap-2">
                  {workingDays.map(day => (
                    <Button
                      key={day.value}
                      variant={[1, 2, 3, 4, 5].includes(day.value) ? 'default' : 'outline'}
                      size="sm"
                      className="w-12"
                    >
                      {day.label}
                    </Button>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="voicemail" className="space-y-4 mt-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Voicemail className="w-5 h-5" />
                Voicemail Settings
              </CardTitle>
              <CardDescription>Configure voicemail handling</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between p-3 rounded-lg border">
                <div>
                  <p className="font-medium">Enable voicemail</p>
                  <p className="text-sm text-muted-foreground">
                    Allow callers to leave messages when unavailable
                  </p>
                </div>
                <Switch defaultChecked />
              </div>

              <div className="flex items-center justify-between p-3 rounded-lg border">
                <div>
                  <p className="font-medium">Auto-transcription</p>
                  <p className="text-sm text-muted-foreground">
                    Automatically transcribe voicemail messages
                  </p>
                </div>
                <Switch defaultChecked />
              </div>

              <div className="flex items-center justify-between p-3 rounded-lg border">
                <div>
                  <p className="font-medium">Email notifications</p>
                  <p className="text-sm text-muted-foreground">
                    Send voicemail notifications to your email
                  </p>
                </div>
                <Switch defaultChecked />
              </div>

              <div className="space-y-2">
                <Label>Voicemail Greeting</Label>
                <Textarea
                  placeholder="You've reached our voicemail. Please leave a message after the tone..."
                  defaultValue="You've reached our voicemail. Please leave a message after the tone and we'll get back to you as soon as possible."
                  rows={3}
                />
              </div>

              <div className="space-y-2">
                <Label>Maximum message duration</Label>
                <Select defaultValue="120">
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="30">30 seconds</SelectItem>
                    <SelectItem value="60">1 minute</SelectItem>
                    <SelectItem value="120">2 minutes</SelectItem>
                    <SelectItem value="300">5 minutes</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <AddPhoneNumberDialog 
        open={isAddDialogOpen} 
        onOpenChange={setIsAddDialogOpen} 
      />
    </div>
  );
}
