// Community Management Page - Social Media Module
import { useState } from 'react';
import {
  Users, MessageCircle, Mail, AtSign, Send, UserPlus, AlertTriangle,
  CheckCircle, Smile, Meh, Frown, Bot, Search,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import { askAgent } from '@/lib/agentActions';
import {
  mockCommunityItems, PLATFORM_LABELS,
  type CommunityItem, type CommunityStatus, type Sentiment,
} from './mockData';

const typeIcon: Record<CommunityItem['type'], typeof MessageCircle> = {
  comment: MessageCircle,
  dm: Mail,
  mention: AtSign,
};

const getStatusColor = (status: CommunityStatus) => {
  switch (status) {
    case 'replied': return 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30';
    case 'assigned': return 'bg-blue-500/20 text-blue-400 border-blue-500/30';
    case 'escalated': return 'bg-red-500/20 text-red-400 border-red-500/30';
    case 'unread': return 'bg-amber-500/20 text-amber-400 border-amber-500/30';
    default: return 'bg-muted text-muted-foreground border-border';
  }
};

const getSentimentIcon = (sentiment: Sentiment) => {
  switch (sentiment) {
    case 'positive': return <Smile className="h-4 w-4 text-emerald-400" />;
    case 'negative': return <Frown className="h-4 w-4 text-red-400" />;
    default: return <Meh className="h-4 w-4 text-muted-foreground" />;
  }
};

const agentOptions = ['Aria', 'Sage', 'Cipher', 'Orion', 'Atlas'];

export default function CommunityManagementPage() {
  const [items, setItems] = useState<CommunityItem[]>(mockCommunityItems);
  const [selected, setSelected] = useState<CommunityItem | null>(mockCommunityItems[0]);
  const [reply, setReply] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [sentimentFilter, setSentimentFilter] = useState<string>('all');

  const filteredItems = items.filter((item) => {
    const matchesSearch = item.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.author.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesSentiment = sentimentFilter === 'all' || item.sentiment === sentimentFilter;
    return matchesSearch && matchesSentiment;
  });

  const stats = {
    unread: items.filter((i) => i.status === 'unread').length,
    escalated: items.filter((i) => i.status === 'escalated').length,
    positive: items.filter((i) => i.sentiment === 'positive').length,
    negative: items.filter((i) => i.sentiment === 'negative').length,
  };

  const updateItem = (id: string, changes: Partial<CommunityItem>) => {
    setItems((prev) => prev.map((i) => (i.id === id ? { ...i, ...changes } : i)));
    if (selected?.id === id) setSelected((prev) => (prev ? { ...prev, ...changes } : prev));
  };

  const handleReply = () => {
    if (!selected || !reply.trim()) return;
    updateItem(selected.id, { status: 'replied' });
    toast.success('Reply sent', { description: reply.slice(0, 80) });
    setReply('');
  };

  const handleAssign = (agent: string) => {
    if (!selected) return;
    updateItem(selected.id, { status: 'assigned', assignedAgent: agent });
    toast.success(`Assigned to ${agent}`);
  };

  const handleEscalate = () => {
    if (!selected) return;
    updateItem(selected.id, { status: 'escalated' });
    toast.warning('Escalated for human review');
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold font-display text-foreground">Community Management</h1>
          <p className="text-muted-foreground text-sm">Comments, DMs, and mentions across every platform</p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="bg-card/50 border-border/50">
          <CardContent className="p-4 flex items-center gap-3">
            <div className="p-2 rounded-lg bg-amber-500/20">
              <Mail className="h-5 w-5 text-amber-400" />
            </div>
            <div>
              <p className="text-2xl font-bold text-foreground">{stats.unread}</p>
              <p className="text-xs text-muted-foreground">Unread</p>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-card/50 border-border/50">
          <CardContent className="p-4 flex items-center gap-3">
            <div className="p-2 rounded-lg bg-red-500/20">
              <AlertTriangle className="h-5 w-5 text-red-400" />
            </div>
            <div>
              <p className="text-2xl font-bold text-foreground">{stats.escalated}</p>
              <p className="text-xs text-muted-foreground">Escalated</p>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-card/50 border-border/50">
          <CardContent className="p-4 flex items-center gap-3">
            <div className="p-2 rounded-lg bg-emerald-500/20">
              <Smile className="h-5 w-5 text-emerald-400" />
            </div>
            <div>
              <p className="text-2xl font-bold text-foreground">{stats.positive}</p>
              <p className="text-xs text-muted-foreground">Positive</p>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-card/50 border-border/50">
          <CardContent className="p-4 flex items-center gap-3">
            <div className="p-2 rounded-lg bg-red-500/20">
              <Frown className="h-5 w-5 text-red-400" />
            </div>
            <div>
              <p className="text-2xl font-bold text-foreground">{stats.negative}</p>
              <p className="text-xs text-muted-foreground">Negative</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Inbox */}
        <Card className="bg-card/50 border-border/50 lg:col-span-1">
          <CardHeader className="pb-3 space-y-3">
            <CardTitle className="text-lg flex items-center gap-2">
              <Users className="h-5 w-5 text-primary" />
              Inbox
            </CardTitle>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search inbox..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={sentimentFilter} onValueChange={setSentimentFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Sentiment" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Sentiment</SelectItem>
                <SelectItem value="positive">Positive</SelectItem>
                <SelectItem value="neutral">Neutral</SelectItem>
                <SelectItem value="negative">Negative</SelectItem>
              </SelectContent>
            </Select>
          </CardHeader>
          <CardContent className="p-0">
            <ScrollArea className="h-[520px]">
              <div className="space-y-1 p-3">
                {filteredItems.map((item) => {
                  const Icon = typeIcon[item.type];
                  return (
                    <div
                      key={item.id}
                      onClick={() => setSelected(item)}
                      className={cn(
                        'p-3 rounded-lg cursor-pointer transition-colors',
                        selected?.id === item.id ? 'bg-primary/10 border border-primary/30' : 'hover:bg-muted/50'
                      )}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex items-start gap-2 flex-1 min-w-0">
                          <Icon className="h-4 w-4 text-muted-foreground mt-0.5 shrink-0" />
                          <div className="min-w-0">
                            <p className="font-medium text-sm text-foreground truncate">{item.author}</p>
                            <p className="text-xs text-muted-foreground truncate">{item.content}</p>
                          </div>
                        </div>
                        {getSentimentIcon(item.sentiment)}
                      </div>
                      <div className="flex items-center gap-2 mt-2">
                        <Badge variant="secondary" className="text-xs">{PLATFORM_LABELS[item.platform]}</Badge>
                        <Badge variant="outline" className={cn('text-xs', getStatusColor(item.status))}>
                          {item.status}
                        </Badge>
                      </div>
                    </div>
                  );
                })}
              </div>
            </ScrollArea>
          </CardContent>
        </Card>

        {/* Detail / Reply */}
        <Card className="bg-card/50 border-border/50 lg:col-span-2">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg">Conversation</CardTitle>
          </CardHeader>
          <CardContent>
            {selected ? (
              <div className="space-y-4">
                <div className="p-4 rounded-lg bg-muted/30 border border-border/50">
                  <div className="flex items-center justify-between gap-2 flex-wrap">
                    <div className="flex items-center gap-2">
                      <p className="font-semibold text-foreground">{selected.author}</p>
                      <span className="text-xs text-muted-foreground">{selected.handle}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant="secondary" className="text-xs">{PLATFORM_LABELS[selected.platform]}</Badge>
                      <Badge variant="outline" className={cn('text-xs', getStatusColor(selected.status))}>
                        {selected.status}
                      </Badge>
                    </div>
                  </div>
                  <p className="text-sm text-foreground mt-3">{selected.content}</p>
                  <div className="flex items-center gap-3 mt-3 text-xs text-muted-foreground">
                    <span>{new Date(selected.receivedAt).toLocaleString()}</span>
                    <span className="flex items-center gap-1">
                      {getSentimentIcon(selected.sentiment)}
                      <span className="capitalize">{selected.sentiment}</span>
                    </span>
                    {selected.assignedAgent && (
                      <span className="flex items-center gap-1 text-primary">
                        <Bot className="w-3 h-3" />
                        {selected.assignedAgent}
                      </span>
                    )}
                  </div>
                </div>

                <div className="space-y-2">
                  <Textarea
                    placeholder="Write a reply..."
                    value={reply}
                    onChange={(e) => setReply(e.target.value)}
                    rows={3}
                  />
                  <div className="flex flex-wrap gap-2">
                    <Button className="gap-2" onClick={handleReply} disabled={!reply.trim()}>
                      <Send className="h-4 w-4" />
                      Send Reply
                    </Button>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="outline" className="gap-2">
                          <UserPlus className="h-4 w-4" />
                          Assign Agent
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent>
                        {agentOptions.map((agent) => (
                          <DropdownMenuItem key={agent} onClick={() => handleAssign(agent)}>
                            {agent}
                          </DropdownMenuItem>
                        ))}
                      </DropdownMenuContent>
                    </DropdownMenu>
                    <Button variant="outline" className="gap-2 text-destructive hover:text-destructive" onClick={handleEscalate}>
                      <AlertTriangle className="h-4 w-4" />
                      Escalate
                    </Button>
                    <Button
                      variant="ghost"
                      className="gap-2"
                      onClick={() => askAgent(selected.assignedAgent || 'Cipher', `Draft a reply to ${selected.author}: "${selected.content.slice(0, 80)}"`)}
                    >
                      <CheckCircle className="h-4 w-4" />
                      Draft with Agent
                    </Button>
                  </div>
                </div>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center h-64 text-muted-foreground">
                <Users className="h-12 w-12 mb-4 opacity-50" />
                <p>Select a conversation to respond</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
