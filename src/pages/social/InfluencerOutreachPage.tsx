// Influencer Outreach Page - Social Media Module
import { useState } from 'react';
import {
  Search, Filter, Users, Bot, Plus, Sparkles,
  MoreVertical, Edit, Trash2,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { ConfirmDialog } from '@/components/ConfirmDialog';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import { askAgent } from '@/lib/agentActions';
import {
  mockInfluencerProspects, PLATFORM_LABELS,
  type InfluencerProspect, type OutreachStage,
} from './mockData';

const stages: { id: OutreachStage; label: string }[] = [
  { id: 'identified', label: 'Identified' },
  { id: 'contacted', label: 'Contacted' },
  { id: 'negotiating', label: 'Negotiating' },
  { id: 'active', label: 'Active' },
];

const stageColor: Record<OutreachStage, string> = {
  identified: 'bg-muted text-muted-foreground border-border',
  contacted: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
  negotiating: 'bg-amber-500/20 text-amber-400 border-amber-500/30',
  active: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30',
};

export default function InfluencerOutreachPage() {
  const [prospects, setProspects] = useState<InfluencerProspect[]>(mockInfluencerProspects);
  const [searchQuery, setSearchQuery] = useState('');
  const [platformFilter, setPlatformFilter] = useState<string>('all');
  const [deleteConfirm, setDeleteConfirm] = useState<{ open: boolean; id: string | null }>({ open: false, id: null });

  const filtered = prospects.filter((p) => {
    const matchesSearch = p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.handle.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.campaignTags.some((t) => t.toLowerCase().includes(searchQuery.toLowerCase()));
    const matchesPlatform = platformFilter === 'all' || p.platform === platformFilter;
    return matchesSearch && matchesPlatform;
  });

  const grouped = stages.map((stage) => ({
    ...stage,
    prospects: filtered.filter((p) => p.stage === stage.id),
  }));

  const advanceStage = (id: string) => {
    setProspects((prev) => prev.map((p) => {
      if (p.id !== id) return p;
      const idx = stages.findIndex((s) => s.id === p.stage);
      const next = stages[Math.min(idx + 1, stages.length - 1)];
      return { ...p, stage: next.id, lastContact: new Date().toISOString().split('T')[0] };
    }));
    toast.success('Moved to next stage');
  };

  const handleDelete = (id: string) => {
    setProspects((prev) => prev.filter((p) => p.id !== id));
    setDeleteConfirm({ open: false, id: null });
    toast.success('Prospect removed');
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold font-display text-foreground">Influencer Outreach</h1>
          <p className="text-muted-foreground text-sm">Track creator partnerships from first contact to active campaign</p>
        </div>
        <Button className="gap-2" onClick={() => toast.success('New prospect added to Identified')}>
          <Plus className="h-4 w-4" />
          Add Prospect
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {stages.map((stage) => (
          <Card key={stage.id} className="bg-card/50 border-border/50">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-primary/10">
                  <Users className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-foreground">
                    {prospects.filter((p) => p.stage === stage.id).length}
                  </p>
                  <p className="text-xs text-muted-foreground">{stage.label}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search by name, handle, or campaign tag..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
        <Select value={platformFilter} onValueChange={setPlatformFilter}>
          <SelectTrigger className="w-full sm:w-[160px]">
            <Filter className="h-4 w-4 mr-2" />
            <SelectValue placeholder="Platform" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Platforms</SelectItem>
            {Object.entries(PLATFORM_LABELS).map(([id, label]) => (
              <SelectItem key={id} value={id}>{label}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Pipeline */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
        {grouped.map((stage) => (
          <div key={stage.id} className="space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">{stage.label}</h3>
              <Badge variant="secondary" className="text-xs">{stage.prospects.length}</Badge>
            </div>
            <div className="space-y-3">
              {stage.prospects.length === 0 ? (
                <Card className="bg-card/30 border-dashed border-border">
                  <CardContent className="p-4 text-center text-xs text-muted-foreground">
                    No prospects
                  </CardContent>
                </Card>
              ) : (
                stage.prospects.map((prospect) => (
                  <Card key={prospect.id} className="bg-card/50 border-border/50">
                    <CardContent className="p-4 space-y-2">
                      <div className="flex items-start justify-between gap-2">
                        <div className="min-w-0">
                          <p className="font-medium text-sm text-foreground truncate">{prospect.name}</p>
                          <p className="text-xs text-muted-foreground truncate">{prospect.handle}</p>
                        </div>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-7 w-7 shrink-0">
                              <MoreVertical className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            {stage.id !== 'active' && (
                              <DropdownMenuItem onClick={() => advanceStage(prospect.id)}>
                                <Edit className="h-4 w-4 mr-2" />
                                Advance Stage
                              </DropdownMenuItem>
                            )}
                            <DropdownMenuItem
                              onClick={() => askAgent(prospect.assignedAgent || 'Orion', `Follow up with ${prospect.name} (${prospect.handle})`)}
                            >
                              <Sparkles className="h-4 w-4 mr-2" />
                              Ask {prospect.assignedAgent || 'Orion'}
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem
                              className="text-destructive focus:text-destructive"
                              onClick={() => setDeleteConfirm({ open: true, id: prospect.id })}
                            >
                              <Trash2 className="h-4 w-4 mr-2" />
                              Remove
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>

                      <div className="flex items-center gap-2 flex-wrap">
                        <Badge variant="secondary" className="text-xs">{PLATFORM_LABELS[prospect.platform]}</Badge>
                        <Badge variant="outline" className={cn('text-xs', stageColor[prospect.stage])}>
                          {(prospect.followers / 1000).toFixed(0)}k · {prospect.engagementRate}%
                        </Badge>
                      </div>

                      <p className="text-xs text-muted-foreground line-clamp-2">{prospect.notes}</p>

                      <div className="flex items-center gap-1 flex-wrap">
                        {prospect.campaignTags.map((tag) => (
                          <Badge key={tag} variant="outline" className="text-[10px]">{tag}</Badge>
                        ))}
                      </div>

                      <div className="flex items-center justify-between pt-1 text-xs text-muted-foreground">
                        {prospect.lastContact ? (
                          <span>Last: {new Date(prospect.lastContact).toLocaleDateString()}</span>
                        ) : (
                          <span>No contact yet</span>
                        )}
                        {prospect.assignedAgent && (
                          <span className="flex items-center gap-1 text-primary">
                            <Bot className="w-3 h-3" />
                            {prospect.assignedAgent}
                          </span>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                ))
              )}
            </div>
          </div>
        ))}
      </div>

      <ConfirmDialog
        open={deleteConfirm.open}
        onOpenChange={(open) => setDeleteConfirm({ open, id: null })}
        title="Remove Prospect"
        description="Are you sure you want to remove this influencer from your pipeline? This action cannot be undone."
        confirmLabel="Remove"
        variant="destructive"
        onConfirm={() => deleteConfirm.id && handleDelete(deleteConfirm.id)}
      />
    </div>
  );
}
