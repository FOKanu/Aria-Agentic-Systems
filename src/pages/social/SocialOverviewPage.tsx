// Social Media Overview Page - Landing dashboard for the Social Media module
import {
  Share2, Calendar, Megaphone, TrendingUp, Users, Heart, BarChart3,
  ArrowRight, Bot, AlertTriangle, CheckCircle, Clock, Flame,
} from 'lucide-react';
import { useCapabilityNav } from '@/hooks/useCapabilityNav';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import {
  mockScheduledPosts,
  mockCommunityItems,
  mockTrends,
  analyticsKpis,
  PLATFORM_LABELS,
} from './mockData';

export default function SocialOverviewPage() {
  const nav = useCapabilityNav();

  const upcomingPosts = mockScheduledPosts
    .filter((p) => p.status === 'scheduled')
    .sort((a, b) => new Date(a.scheduledFor).getTime() - new Date(b.scheduledFor).getTime())
    .slice(0, 3);

  const failedPosts = mockScheduledPosts.filter((p) => p.status === 'failed');
  const needsAttention = mockCommunityItems.filter((c) => c.status === 'unread' || c.status === 'escalated');
  const hotTrends = mockTrends.filter((t) => t.velocity === 'hot' || t.velocity === 'rising').slice(0, 3);

  const quickStats = {
    scheduled: mockScheduledPosts.filter((p) => p.status === 'scheduled').length,
    engagementRate: analyticsKpis.avgEngagementRate,
    unread: mockCommunityItems.filter((c) => c.status === 'unread').length,
    followerGrowth: analyticsKpis.followerGrowth,
  };

  const getSentimentColor = (sentiment: string) => {
    switch (sentiment) {
      case 'positive': return 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30';
      case 'negative': return 'bg-red-500/20 text-red-400 border-red-500/30';
      default: return 'bg-muted text-muted-foreground border-border';
    }
  };

  return (
    <div className="space-y-6 animate-slide-up">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
            <Share2 className="w-5 h-5 text-primary" />
          </div>
          <div>
            <h1 className="text-xl font-bold font-display">Social Media Command Center</h1>
            <p className="text-sm text-muted-foreground">Scheduling, content, analytics, community, and outreach</p>
          </div>
        </div>
      </div>

      {/* 3-Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column - Active Work */}
        <div className="space-y-4">
          <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">Up Next</h2>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <Calendar className="w-4 h-4" />
                Upcoming Posts
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {upcomingPosts.map((post) => (
                <div
                  key={post.id}
                  className="p-3 rounded-lg border border-border hover:bg-secondary/50 transition-colors cursor-pointer"
                  onClick={() => nav('social-scheduling')}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1 min-w-0">
                      <p className="text-sm truncate">{post.content}</p>
                      <p className="text-xs text-muted-foreground mt-1">{PLATFORM_LABELS[post.platform]}</p>
                    </div>
                    <Badge variant="outline" className="text-xs shrink-0">
                      {new Date(post.scheduledFor).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                    </Badge>
                  </div>
                  {post.assignedAgent && (
                    <span className="flex items-center gap-1 text-primary text-xs mt-2">
                      <Bot className="w-3 h-3" />
                      {post.assignedAgent}
                    </span>
                  )}
                </div>
              ))}
            </CardContent>
          </Card>

          {failedPosts.length > 0 && (
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 text-destructive" />
                  Needs Attention
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {failedPosts.map((post) => (
                  <div key={post.id} className="p-3 rounded-lg border border-destructive/30 bg-destructive/5">
                    <p className="text-sm font-medium truncate">{post.content}</p>
                    <p className="text-xs text-destructive mt-1">{post.failureReason}</p>
                  </div>
                ))}
              </CardContent>
            </Card>
          )}

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <Users className="w-4 h-4" />
                Community Queue
              </CardTitle>
            </CardHeader>
            <CardContent>
              {needsAttention.length === 0 ? (
                <div className="text-center py-4 text-muted-foreground">
                  <CheckCircle className="w-8 h-8 mx-auto mb-2 opacity-50" />
                  <p className="text-sm">All caught up</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {needsAttention.slice(0, 3).map((item) => (
                    <div
                      key={item.id}
                      className="p-3 rounded-lg border border-border hover:bg-secondary/50 transition-colors cursor-pointer"
                      onClick={() => nav('social-community')}
                    >
                      <div className="flex items-center justify-between gap-2">
                        <p className="text-sm font-medium truncate">{item.author}</p>
                        <Badge variant="outline" className={cn('text-xs', getSentimentColor(item.sentiment))}>
                          {item.sentiment}
                        </Badge>
                      </div>
                      <p className="text-xs text-muted-foreground truncate mt-1">{item.content}</p>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Center Column - Primary Actions */}
        <div className="space-y-4">
          <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">Quick Actions</h2>

          <div className="grid grid-cols-2 gap-3">
            <Button
              variant="outline"
              className="h-24 flex-col gap-2 hover:bg-primary/10 hover:border-primary"
              onClick={() => nav('social-posts')}
            >
              <Megaphone className="w-6 h-6 text-primary" />
              <span className="text-sm">Generate Post</span>
            </Button>
            <Button
              variant="outline"
              className="h-24 flex-col gap-2 hover:bg-primary/10 hover:border-primary"
              onClick={() => nav('social-scheduling')}
            >
              <Calendar className="w-6 h-6 text-primary" />
              <span className="text-sm">Schedule Content</span>
            </Button>
            <Button
              variant="outline"
              className="h-24 flex-col gap-2 hover:bg-primary/10 hover:border-primary"
              onClick={() => nav('social-community')}
            >
              <Users className="w-6 h-6 text-primary" />
              <span className="text-sm">Community Inbox</span>
            </Button>
            <Button
              variant="outline"
              className="h-24 flex-col gap-2 hover:bg-primary/10 hover:border-primary"
              onClick={() => nav('social-trends')}
            >
              <TrendingUp className="w-6 h-6 text-primary" />
              <span className="text-sm">Trend Monitor</span>
            </Button>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-2 gap-3">
            <Card>
              <CardContent className="pt-4">
                <div className="text-center">
                  <p className="text-2xl font-bold">{quickStats.scheduled}</p>
                  <p className="text-xs text-muted-foreground">Scheduled Posts</p>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-4">
                <div className="text-center">
                  <p className="text-2xl font-bold text-success">{quickStats.engagementRate}%</p>
                  <p className="text-xs text-muted-foreground">Avg Engagement</p>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-4">
                <div className="text-center">
                  <p className="text-2xl font-bold text-warning">{quickStats.unread}</p>
                  <p className="text-xs text-muted-foreground">Unread Mentions</p>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-4">
                <div className="text-center">
                  <p className="text-2xl font-bold text-primary">+{quickStats.followerGrowth}</p>
                  <p className="text-xs text-muted-foreground">Followers (7d)</p>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Quick Navigation */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Explore Social</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {[
                { label: 'Analytics Dashboard', tabId: 'social-analytics', icon: BarChart3 },
                { label: 'Influencer Outreach', tabId: 'social-outreach', icon: Heart },
                { label: 'Content Scheduling', tabId: 'social-scheduling', icon: Calendar },
              ].map((item) => (
                <Button
                  key={item.tabId}
                  variant="ghost"
                  className="w-full justify-between"
                  onClick={() => nav(item.tabId)}
                >
                  <span className="flex items-center gap-2">
                    <item.icon className="w-4 h-4" />
                    {item.label}
                  </span>
                  <ArrowRight className="w-4 h-4" />
                </Button>
              ))}
            </CardContent>
          </Card>
        </div>

        {/* Right Column - Trends & Intelligence */}
        <div className="space-y-4">
          <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">Trends & Intelligence</h2>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <Flame className="w-4 h-4 text-orange-500" />
                Trending Now
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {hotTrends.map((trend) => (
                <div
                  key={trend.id}
                  className="p-3 rounded-lg border border-border hover:bg-secondary/50 transition-colors cursor-pointer"
                  onClick={() => nav('social-trends')}
                >
                  <div className="flex items-center justify-between gap-2">
                    <p className="text-sm font-medium">{trend.hashtag}</p>
                    <Badge
                      variant="outline"
                      className={cn(
                        'text-xs',
                        trend.velocity === 'hot' && 'bg-red-500/20 text-red-400 border-red-500/30',
                        trend.velocity === 'rising' && 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30'
                      )}
                    >
                      {trend.velocity}
                    </Badge>
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">{trend.topic}</p>
                  <p className="text-xs text-primary mt-1">{trend.relevanceScore}% relevant</p>
                </div>
              ))}
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <Clock className="w-4 h-4" />
                Platform Snapshot
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <div className="p-3 rounded-lg border border-border">
                <p className="text-sm font-medium">Best performer this week</p>
                <p className="text-xs text-muted-foreground mt-1">Instagram — 9.4% engagement on the Legal module demo</p>
              </div>
              <div className="p-3 rounded-lg border border-border">
                <p className="text-sm font-medium">Fastest growing</p>
                <p className="text-xs text-muted-foreground mt-1">TikTok — 8.9% engagement rate, 3 posts this week</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
