// Trend Monitoring Page - Social Media Module
import { useState } from 'react';
import { useCapabilityNav } from '@/hooks/useCapabilityNav';
import {
  TrendingUp, Flame, Search, Filter, ArrowUpRight, ArrowDownRight, Minus,
  Sparkles, Wand2,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Progress } from '@/components/ui/progress';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import { askAgent } from '@/lib/agentActions';
import { mockTrends, PLATFORM_LABELS, type Trend, type TrendVelocity } from './mockData';

const velocityConfig: Record<TrendVelocity, { color: string; icon: typeof ArrowUpRight; label: string }> = {
  hot: { color: 'bg-red-500/20 text-red-400 border-red-500/30', icon: Flame, label: 'Hot' },
  rising: { color: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30', icon: ArrowUpRight, label: 'Rising' },
  steady: { color: 'bg-blue-500/20 text-blue-400 border-blue-500/30', icon: Minus, label: 'Steady' },
  declining: { color: 'bg-muted text-muted-foreground border-border', icon: ArrowDownRight, label: 'Declining' },
};

export default function TrendMonitoringPage() {
  const nav = useCapabilityNav();
  const [trends] = useState<Trend[]>(mockTrends);
  const [searchQuery, setSearchQuery] = useState('');
  const [velocityFilter, setVelocityFilter] = useState<string>('all');

  const filtered = trends
    .filter((t) => {
      const matchesSearch = t.topic.toLowerCase().includes(searchQuery.toLowerCase()) ||
        t.hashtag.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesVelocity = velocityFilter === 'all' || t.velocity === velocityFilter;
      return matchesSearch && matchesVelocity;
    })
    .sort((a, b) => b.relevanceScore - a.relevanceScore);

  const stats = {
    hot: trends.filter((t) => t.velocity === 'hot').length,
    rising: trends.filter((t) => t.velocity === 'rising').length,
    avgRelevance: Math.round(trends.reduce((sum, t) => sum + t.relevanceScore, 0) / trends.length),
    totalVolume: trends.reduce((sum, t) => sum + t.volume, 0),
  };

  const handleCreatePost = (trend: Trend) => {
    toast.success('Sent to Post Generation', { description: `Brief pre-filled from "${trend.topic}"` });
    nav('social-posts');
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold font-display text-foreground">Trend Monitoring</h1>
          <p className="text-muted-foreground text-sm">Track velocity and relevance across platforms in real time</p>
        </div>
        <Button variant="outline" className="gap-2" onClick={() => askAgent('Sage', 'Scan for new trends relevant to our product this week')}>
          <Sparkles className="h-4 w-4" />
          Ask Sage to Scan
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="bg-card/50 border-border/50">
          <CardContent className="p-4 flex items-center gap-3">
            <div className="p-2 rounded-lg bg-red-500/20">
              <Flame className="h-5 w-5 text-red-400" />
            </div>
            <div>
              <p className="text-2xl font-bold text-foreground">{stats.hot}</p>
              <p className="text-xs text-muted-foreground">Hot Trends</p>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-card/50 border-border/50">
          <CardContent className="p-4 flex items-center gap-3">
            <div className="p-2 rounded-lg bg-emerald-500/20">
              <TrendingUp className="h-5 w-5 text-emerald-400" />
            </div>
            <div>
              <p className="text-2xl font-bold text-foreground">{stats.rising}</p>
              <p className="text-xs text-muted-foreground">Rising</p>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-card/50 border-border/50">
          <CardContent className="p-4 flex items-center gap-3">
            <div className="p-2 rounded-lg bg-primary/20">
              <Sparkles className="h-5 w-5 text-primary" />
            </div>
            <div>
              <p className="text-2xl font-bold text-foreground">{stats.avgRelevance}%</p>
              <p className="text-xs text-muted-foreground">Avg Relevance</p>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-card/50 border-border/50">
          <CardContent className="p-4 flex items-center gap-3">
            <div className="p-2 rounded-lg bg-amber-500/20">
              <TrendingUp className="h-5 w-5 text-amber-400" />
            </div>
            <div>
              <p className="text-2xl font-bold text-foreground">{(stats.totalVolume / 1000).toFixed(1)}k</p>
              <p className="text-xs text-muted-foreground">Mentions (24h)</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search topics or hashtags..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
        <Select value={velocityFilter} onValueChange={setVelocityFilter}>
          <SelectTrigger className="w-full sm:w-[160px]">
            <Filter className="h-4 w-4 mr-2" />
            <SelectValue placeholder="Velocity" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Velocity</SelectItem>
            <SelectItem value="hot">Hot</SelectItem>
            <SelectItem value="rising">Rising</SelectItem>
            <SelectItem value="steady">Steady</SelectItem>
            <SelectItem value="declining">Declining</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Trend List */}
      <div className="grid gap-4">
        {filtered.map((trend) => {
          const config = velocityConfig[trend.velocity];
          const VelocityIcon = config.icon;
          return (
            <Card key={trend.id} className="bg-card/50 border-border/50">
              <CardContent className="p-4">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3 className="font-semibold text-foreground">{trend.hashtag}</h3>
                      <Badge variant="outline" className={cn('text-xs', config.color)}>
                        <VelocityIcon className="h-3 w-3 mr-1" />
                        {config.label}
                      </Badge>
                      <Badge variant="secondary" className="text-xs">{PLATFORM_LABELS[trend.platform]}</Badge>
                      <Badge variant="outline" className="text-xs">{trend.category}</Badge>
                    </div>
                    <p className="text-sm text-muted-foreground mt-1">{trend.topic}</p>
                    <div className="flex items-center gap-4 mt-3 text-xs text-muted-foreground">
                      <span>{trend.volume.toLocaleString()} mentions / 24h</span>
                    </div>
                    <div className="mt-3 max-w-xs">
                      <div className="flex items-center justify-between text-xs mb-1">
                        <span className="text-muted-foreground">Relevance to us</span>
                        <span className="font-medium text-foreground">{trend.relevanceScore}%</span>
                      </div>
                      <Progress value={trend.relevanceScore} className="h-2" />
                    </div>
                  </div>
                  <Button size="sm" className="gap-2 shrink-0" onClick={() => handleCreatePost(trend)}>
                    <Wand2 className="h-4 w-4" />
                    Create Post
                  </Button>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
