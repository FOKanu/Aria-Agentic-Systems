// Content Scheduling Page - Social Media Module
import { useState } from 'react';
import { useCapabilityNav } from '@/hooks/useCapabilityNav';
import {
  Calendar, Plus, Search, Filter, Clock, CheckCircle2, XCircle,
  RotateCcw, MoreVertical, Trash2, Bot, Sparkles,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { ConfirmDialog } from '@/components/ConfirmDialog';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import { askAgent } from '@/lib/agentActions';
import { mockScheduledPosts, PLATFORM_LABELS, type ScheduledPost, type PostStatus } from './mockData';

const getStatusColor = (status: PostStatus) => {
  switch (status) {
    case 'published': return 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30';
    case 'scheduled': return 'bg-blue-500/20 text-blue-400 border-blue-500/30';
    case 'failed': return 'bg-red-500/20 text-red-400 border-red-500/30';
    case 'draft': return 'bg-muted text-muted-foreground border-border';
    default: return 'bg-muted text-muted-foreground border-border';
  }
};

const getStatusIcon = (status: PostStatus) => {
  switch (status) {
    case 'published': return <CheckCircle2 className="h-3 w-3" />;
    case 'scheduled': return <Clock className="h-3 w-3" />;
    case 'failed': return <XCircle className="h-3 w-3" />;
    default: return null;
  }
};

export default function ContentSchedulingPage() {
  const nav = useCapabilityNav();
  const [posts, setPosts] = useState<ScheduledPost[]>(mockScheduledPosts);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [platformFilter, setPlatformFilter] = useState<string>('all');
  const [deleteConfirm, setDeleteConfirm] = useState<{ open: boolean; id: string | null }>({ open: false, id: null });

  const filteredPosts = posts
    .filter((p) => {
      const matchesSearch = p.content.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesStatus = statusFilter === 'all' || p.status === statusFilter;
      const matchesPlatform = platformFilter === 'all' || p.platform === platformFilter;
      return matchesSearch && matchesStatus && matchesPlatform;
    })
    .sort((a, b) => new Date(a.scheduledFor).getTime() - new Date(b.scheduledFor).getTime());

  const stats = {
    scheduled: posts.filter((p) => p.status === 'scheduled').length,
    published: posts.filter((p) => p.status === 'published').length,
    failed: posts.filter((p) => p.status === 'failed').length,
    draft: posts.filter((p) => p.status === 'draft').length,
  };

  const handleReschedule = (id: string) => {
    setPosts((prev) => prev.map((p) =>
      p.id === id
        ? { ...p, status: 'scheduled', scheduledFor: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(), failureReason: undefined }
        : p
    ));
    toast.success('Post rescheduled for tomorrow');
  };

  const handleDelete = (id: string) => {
    setPosts((prev) => prev.filter((p) => p.id !== id));
    setDeleteConfirm({ open: false, id: null });
    toast.success('Post removed from schedule');
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold font-display text-foreground">Content Scheduling</h1>
          <p className="text-muted-foreground text-sm">Plan and publish across X, LinkedIn, Instagram, TikTok, and YouTube</p>
        </div>
        <Button className="gap-2" onClick={() => nav('social-posts')}>
          <Plus className="h-4 w-4" />
          New Post
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="bg-card/50 border-border/50">
          <CardContent className="p-4 flex items-center gap-3">
            <div className="p-2 rounded-lg bg-blue-500/20">
              <Clock className="h-5 w-5 text-blue-400" />
            </div>
            <div>
              <p className="text-2xl font-bold text-foreground">{stats.scheduled}</p>
              <p className="text-xs text-muted-foreground">Scheduled</p>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-card/50 border-border/50">
          <CardContent className="p-4 flex items-center gap-3">
            <div className="p-2 rounded-lg bg-emerald-500/20">
              <CheckCircle2 className="h-5 w-5 text-emerald-400" />
            </div>
            <div>
              <p className="text-2xl font-bold text-foreground">{stats.published}</p>
              <p className="text-xs text-muted-foreground">Published</p>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-card/50 border-border/50">
          <CardContent className="p-4 flex items-center gap-3">
            <div className="p-2 rounded-lg bg-red-500/20">
              <XCircle className="h-5 w-5 text-red-400" />
            </div>
            <div>
              <p className="text-2xl font-bold text-foreground">{stats.failed}</p>
              <p className="text-xs text-muted-foreground">Failed</p>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-card/50 border-border/50">
          <CardContent className="p-4 flex items-center gap-3">
            <div className="p-2 rounded-lg bg-muted">
              <Calendar className="h-5 w-5 text-muted-foreground" />
            </div>
            <div>
              <p className="text-2xl font-bold text-foreground">{stats.draft}</p>
              <p className="text-xs text-muted-foreground">Drafts</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search scheduled content..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
        <Select value={platformFilter} onValueChange={setPlatformFilter}>
          <SelectTrigger className="w-full sm:w-[160px]">
            <SelectValue placeholder="Platform" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Platforms</SelectItem>
            {Object.entries(PLATFORM_LABELS).map(([id, label]) => (
              <SelectItem key={id} value={id}>{label}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-full sm:w-[150px]">
            <Filter className="h-4 w-4 mr-2" />
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="scheduled">Scheduled</SelectItem>
            <SelectItem value="published">Published</SelectItem>
            <SelectItem value="draft">Draft</SelectItem>
            <SelectItem value="failed">Failed</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Post List */}
      <div className="space-y-3">
        {filteredPosts.length === 0 ? (
          <Card className="bg-card/50">
            <CardContent className="p-8 text-center">
              <Calendar className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
              <h3 className="font-semibold mb-2">No posts found</h3>
              <p className="text-sm text-muted-foreground mb-4">
                {searchQuery ? 'Try a different search term' : 'Schedule your first post to get started'}
              </p>
              {!searchQuery && (
                <Button onClick={() => nav('social-posts')}>
                  <Plus className="w-4 h-4 mr-2" />
                  Generate a Post
                </Button>
              )}
            </CardContent>
          </Card>
        ) : (
          filteredPosts.map((post) => (
            <Card key={post.id} className="bg-card/50 border-border/50 hover:bg-card/80 transition-colors">
              <CardContent className="p-4">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <Badge variant="secondary" className="text-xs">{PLATFORM_LABELS[post.platform]}</Badge>
                      <Badge variant="outline" className={getStatusColor(post.status)}>
                        {getStatusIcon(post.status)}
                        <span className="ml-1 capitalize">{post.status}</span>
                      </Badge>
                      {post.campaign && (
                        <Badge variant="outline" className="text-xs">{post.campaign}</Badge>
                      )}
                    </div>
                    <p className="text-sm text-foreground mt-2">{post.content}</p>
                    {post.status === 'failed' && post.failureReason && (
                      <p className="text-xs text-destructive mt-1">Failed: {post.failureReason}</p>
                    )}
                    <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground flex-wrap">
                      <span>
                        {post.status === 'published' ? 'Published' : 'Scheduled for'}: {new Date(post.scheduledFor).toLocaleString(undefined, { month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' })}
                      </span>
                      <span className="capitalize">{post.mediaType}</span>
                      {post.hashtags.slice(0, 3).map((tag) => (
                        <span key={tag} className="text-primary">{tag}</span>
                      ))}
                      {post.assignedAgent && (
                        <span className="flex items-center gap-1">
                          <Bot className="w-3 h-3" />
                          {post.assignedAgent}
                        </span>
                      )}
                    </div>
                  </div>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon" className="h-8 w-8">
                        <MoreVertical className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      {post.status === 'failed' && (
                        <DropdownMenuItem onClick={() => handleReschedule(post.id)}>
                          <RotateCcw className="h-4 w-4 mr-2" />
                          Reschedule
                        </DropdownMenuItem>
                      )}
                      <DropdownMenuItem
                        onClick={() => askAgent(post.assignedAgent || 'Orion', `Follow up on "${post.content.slice(0, 60)}..."`)}
                      >
                        <Sparkles className="h-4 w-4 mr-2" />
                        Ask {post.assignedAgent || 'Orion'}
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem
                        className="text-destructive focus:text-destructive"
                        onClick={() => setDeleteConfirm({ open: true, id: post.id })}
                      >
                        <Trash2 className="h-4 w-4 mr-2" />
                        Remove
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      <ConfirmDialog
        open={deleteConfirm.open}
        onOpenChange={(open) => setDeleteConfirm({ open, id: null })}
        title="Remove Post"
        description="Are you sure you want to remove this post from the schedule? This action cannot be undone."
        confirmLabel="Remove"
        variant="destructive"
        onConfirm={() => deleteConfirm.id && handleDelete(deleteConfirm.id)}
      />
    </div>
  );
}
