// Analytics Dashboard Page - Social Media Module
import {
  AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend,
} from 'recharts';
import { useCapabilityNav } from '@/hooks/useCapabilityNav';
import {
  TrendingUp, Eye, Heart, Users, Download, RefreshCw, Sparkles,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { askAgent } from '@/lib/agentActions';
import {
  engagementHistory, platformBreakdown, topPosts, analyticsKpis, PLATFORM_LABELS,
} from './mockData';

export default function AnalyticsDashboardPage() {
  const nav = useCapabilityNav();

  const pieData = platformBreakdown.map((p) => ({
    name: PLATFORM_LABELS[p.platform],
    value: p.followers,
    color: p.color,
  }));

  const handleRefresh = () => {
    toast.success('Analytics refreshed', { description: 'Latest data pulled from connected platforms' });
  };

  const handleExport = () => {
    toast.success('Export queued', { description: 'Weekly analytics report will be ready shortly' });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold font-display text-foreground">Analytics Dashboard</h1>
          <p className="text-muted-foreground text-sm">Engagement, reach, and platform performance</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" className="gap-2" onClick={handleRefresh}>
            <RefreshCw className="h-4 w-4" />
            Refresh
          </Button>
          <Button variant="outline" className="gap-2" onClick={handleExport}>
            <Download className="h-4 w-4" />
            Export
          </Button>
          <Button className="gap-2" onClick={() => askAgent('Sage', 'Summarize this week\'s social performance and flag anomalies')}>
            <Sparkles className="h-4 w-4" />
            Ask Sage
          </Button>
        </div>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="bg-card/50 border-border/50">
          <CardContent className="p-4 flex items-center gap-3">
            <div className="p-2 rounded-lg bg-blue-500/20">
              <Eye className="h-5 w-5 text-blue-400" />
            </div>
            <div>
              <p className="text-2xl font-bold text-foreground">{(analyticsKpis.totalImpressions / 1000).toFixed(1)}k</p>
              <p className="text-xs text-muted-foreground">Impressions (7d)</p>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-card/50 border-border/50">
          <CardContent className="p-4 flex items-center gap-3">
            <div className="p-2 rounded-lg bg-emerald-500/20">
              <Heart className="h-5 w-5 text-emerald-400" />
            </div>
            <div>
              <p className="text-2xl font-bold text-foreground">{(analyticsKpis.totalEngagements / 1000).toFixed(1)}k</p>
              <p className="text-xs text-muted-foreground">Engagements (7d)</p>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-card/50 border-border/50">
          <CardContent className="p-4 flex items-center gap-3">
            <div className="p-2 rounded-lg bg-primary/20">
              <Users className="h-5 w-5 text-primary" />
            </div>
            <div>
              <p className="text-2xl font-bold text-foreground">+{analyticsKpis.followerGrowth}</p>
              <p className="text-xs text-muted-foreground">Follower Growth</p>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-card/50 border-border/50">
          <CardContent className="p-4 flex items-center gap-3">
            <div className="p-2 rounded-lg bg-amber-500/20">
              <TrendingUp className="h-5 w-5 text-amber-400" />
            </div>
            <div>
              <p className="text-2xl font-bold text-foreground">{analyticsKpis.avgEngagementRate}%</p>
              <p className="text-xs text-muted-foreground">Avg Engagement Rate</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Engagement Over Time */}
      <Card className="bg-card/50 border-border/50">
        <CardHeader className="pb-3">
          <CardTitle className="text-lg">Engagement Over Time</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={280}>
            <AreaChart data={engagementHistory}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis dataKey="date" stroke="hsl(var(--muted-foreground))" fontSize={12} />
              <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} />
              <Tooltip
                contentStyle={{ backgroundColor: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: '8px' }}
              />
              <Legend />
              <Area type="monotone" dataKey="impressions" stroke="hsl(var(--primary))" fill="hsl(var(--primary))" fillOpacity={0.15} name="Impressions" />
              <Area type="monotone" dataKey="engagements" stroke="hsl(var(--success))" fill="hsl(var(--success))" fillOpacity={0.2} name="Engagements" />
            </AreaChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Platform Breakdown */}
        <Card className="bg-card/50 border-border/50">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg">Followers by Platform</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={240}>
              <PieChart>
                <Pie data={pieData} dataKey="value" nameKey="name" innerRadius={55} outerRadius={90} paddingAngle={2}>
                  {pieData.map((entry, i) => (
                    <Cell key={i} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip contentStyle={{ backgroundColor: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: '8px' }} />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Engagement Rate by Platform */}
        <Card className="bg-card/50 border-border/50">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg">Engagement Rate by Platform</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={240}>
              <BarChart data={platformBreakdown.map((p) => ({ name: PLATFORM_LABELS[p.platform], rate: p.engagementRate }))}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis dataKey="name" stroke="hsl(var(--muted-foreground))" fontSize={11} />
                <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} unit="%" />
                <Tooltip contentStyle={{ backgroundColor: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: '8px' }} />
                <Bar dataKey="rate" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} name="Engagement Rate" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Top Posts */}
      <Card className="bg-card/50 border-border/50">
        <CardHeader className="pb-3">
          <CardTitle className="text-lg">Top Performing Posts</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {topPosts.map((post) => (
            <div
              key={post.id}
              className="flex items-start justify-between gap-4 p-3 rounded-lg bg-muted/30 border border-border/50 cursor-pointer hover:bg-muted/50 transition-colors"
              onClick={() => nav('social-scheduling')}
            >
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <Badge variant="secondary" className="text-xs">{PLATFORM_LABELS[post.platform]}</Badge>
                  <span className="text-xs text-muted-foreground">{new Date(post.publishedAt).toLocaleDateString()}</span>
                </div>
                <p className="text-sm text-foreground mt-1 truncate">{post.content}</p>
              </div>
              <div className="text-right shrink-0">
                <p className="text-sm font-medium text-foreground">{(post.impressions / 1000).toFixed(1)}k views</p>
                <p className="text-xs text-emerald-400">{post.engagementRate}% engagement</p>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
