// Phone Page - Francis Okorie Iyeke-Kanu
import { useState } from 'react';
import { Phone, Plus, Search, Clock, PhoneCall, PhoneIncoming, PhoneOutgoing, PhoneMissed, Voicemail, Mic, Calendar, User, Bot, Filter, MoreVertical } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';

interface CallRecord {
  id: string;
  contact: string;
  phone: string;
  type: 'incoming' | 'outgoing' | 'missed' | 'voicemail';
  duration?: string;
  timestamp: Date;
  notes?: string;
  agent?: string;
  transcription?: string;
}

const mockCalls: CallRecord[] = [
  { id: '1', contact: 'John Smith', phone: '+1 (555) 123-4567', type: 'incoming', duration: '12:34', timestamp: new Date(), notes: 'Discussed project timeline', agent: 'Orion' },
  { id: '2', contact: 'Sarah Johnson', phone: '+1 (555) 234-5678', type: 'outgoing', duration: '5:45', timestamp: new Date(Date.now() - 3600000), agent: 'Aria' },
  { id: '3', contact: 'Mike Wilson', phone: '+1 (555) 345-6789', type: 'missed', timestamp: new Date(Date.now() - 7200000) },
  { id: '4', contact: 'Emily Davis', phone: '+1 (555) 456-7890', type: 'voicemail', duration: '1:23', timestamp: new Date(Date.now() - 86400000), transcription: 'Hi, calling about the meeting tomorrow...' },
  { id: '5', contact: 'Robert Brown', phone: '+1 (555) 567-8901', type: 'incoming', duration: '8:12', timestamp: new Date(Date.now() - 172800000), agent: 'Echo' },
];

const callTypeIcons = {
  incoming: PhoneIncoming,
  outgoing: PhoneOutgoing,
  missed: PhoneMissed,
  voicemail: Voicemail,
};

const callTypeColors = {
  incoming: 'text-success',
  outgoing: 'text-primary',
  missed: 'text-destructive',
  voicemail: 'text-warning',
};

export function PhonePage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState('all');

  const filteredCalls = mockCalls.filter(call => {
    const matchesSearch = call.contact.toLowerCase().includes(searchQuery.toLowerCase()) ||
      call.phone.includes(searchQuery);
    const matchesTab = activeTab === 'all' || call.type === activeTab;
    return matchesSearch && matchesTab;
  });

  const stats = {
    total: mockCalls.length,
    incoming: mockCalls.filter(c => c.type === 'incoming').length,
    outgoing: mockCalls.filter(c => c.type === 'outgoing').length,
    missed: mockCalls.filter(c => c.type === 'missed').length,
  };

  return (
    <div className="space-y-6 animate-slide-up">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
            <Phone className="w-5 h-5 text-primary" />
          </div>
          <div>
            <h1 className="text-xl font-bold font-display">Phone & Calls</h1>
            <p className="text-sm text-muted-foreground">Call scheduling, transcription & voice tasks</p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" className="gap-2">
            <Calendar className="w-4 h-4" />
            Schedule Call
          </Button>
          <Button className="gap-2">
            <PhoneCall className="w-4 h-4" />
            New Call
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-muted-foreground">Total Calls</p>
                <p className="text-2xl font-bold">{stats.total}</p>
              </div>
              <Phone className="w-8 h-8 text-muted-foreground/50" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-muted-foreground">Incoming</p>
                <p className="text-2xl font-bold text-success">{stats.incoming}</p>
              </div>
              <PhoneIncoming className="w-8 h-8 text-success/50" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-muted-foreground">Outgoing</p>
                <p className="text-2xl font-bold text-primary">{stats.outgoing}</p>
              </div>
              <PhoneOutgoing className="w-8 h-8 text-primary/50" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-muted-foreground">Missed</p>
                <p className="text-2xl font-bold text-destructive">{stats.missed}</p>
              </div>
              <PhoneMissed className="w-8 h-8 text-destructive/50" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Search and Filters */}
      <div className="flex items-center gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search calls..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="pl-9"
          />
        </div>
        <Button variant="outline" size="icon">
          <Filter className="w-4 h-4" />
        </Button>
      </div>

      {/* Tabs and Call List */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="all">All</TabsTrigger>
          <TabsTrigger value="incoming">Incoming</TabsTrigger>
          <TabsTrigger value="outgoing">Outgoing</TabsTrigger>
          <TabsTrigger value="missed">Missed</TabsTrigger>
          <TabsTrigger value="voicemail">Voicemail</TabsTrigger>
        </TabsList>

        <TabsContent value={activeTab} className="mt-4">
          <Card>
            <ScrollArea className="h-[400px]">
              <div className="divide-y divide-border">
                {filteredCalls.length === 0 ? (
                  <div className="p-8 text-center text-muted-foreground">
                    <Phone className="w-10 h-10 mx-auto mb-2 opacity-50" />
                    <p>No calls found</p>
                  </div>
                ) : (
                  filteredCalls.map(call => {
                    const Icon = callTypeIcons[call.type];
                    return (
                      <div key={call.id} className="p-4 hover:bg-secondary/30 transition-colors">
                        <div className="flex items-start gap-4">
                          <div className={cn(
                            'w-10 h-10 rounded-full flex items-center justify-center',
                            'bg-secondary'
                          )}>
                            <Icon className={cn('w-5 h-5', callTypeColors[call.type])} />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between mb-1">
                              <div className="flex items-center gap-2">
                                <span className="font-medium">{call.contact}</span>
                                <Badge variant="outline" className="text-xs capitalize">
                                  {call.type}
                                </Badge>
                              </div>
                              <span className="text-xs text-muted-foreground">
                                {format(call.timestamp, 'MMM d, h:mm a')}
                              </span>
                            </div>
                            <p className="text-sm text-muted-foreground">{call.phone}</p>
                            <div className="flex items-center gap-3 mt-2 text-xs text-muted-foreground">
                              {call.duration && (
                                <span className="flex items-center gap-1">
                                  <Clock className="w-3 h-3" />
                                  {call.duration}
                                </span>
                              )}
                              {call.agent && (
                                <span className="flex items-center gap-1 text-primary">
                                  <Bot className="w-3 h-3" />
                                  {call.agent}
                                </span>
                              )}
                            </div>
                            {call.transcription && (
                              <div className="mt-2 p-2 bg-secondary/50 rounded text-xs">
                                <div className="flex items-center gap-1 mb-1 text-muted-foreground">
                                  <Mic className="w-3 h-3" />
                                  Transcription
                                </div>
                                <p className="text-foreground">{call.transcription}</p>
                              </div>
                            )}
                            {call.notes && (
                              <p className="mt-2 text-xs text-muted-foreground italic">
                                {call.notes}
                              </p>
                            )}
                          </div>
                          <Button variant="ghost" size="icon" className="h-8 w-8">
                            <MoreVertical className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </ScrollArea>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
