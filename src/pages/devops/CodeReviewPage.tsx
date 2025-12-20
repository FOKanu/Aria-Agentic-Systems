/**
 * Code Review Page - DevOps Module
 * Created by Francis Okorie Iyeke-Kanu
 */

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  GitPullRequest,
  GitMerge,
  MessageSquare,
  CheckCircle2,
  XCircle,
  Clock,
  Search,
  Filter,
  Plus,
  Minus,
  Eye,
  ThumbsUp,
  AlertTriangle
} from 'lucide-react';

interface PullRequest {
  id: string;
  title: string;
  number: number;
  author: string;
  authorInitials: string;
  repository: string;
  sourceBranch: string;
  targetBranch: string;
  status: 'open' | 'merged' | 'closed' | 'draft';
  reviewStatus: 'approved' | 'changes_requested' | 'pending' | 'reviewing';
  additions: number;
  deletions: number;
  comments: number;
  reviewers: { name: string; initials: string; status: 'approved' | 'pending' | 'changes_requested' }[];
  createdAt: string;
  labels: string[];
}

const mockPRs: PullRequest[] = [
  {
    id: '1',
    title: 'feat: implement real-time notifications',
    number: 234,
    author: 'Francis Okorie',
    authorInitials: 'FO',
    repository: 'agent-fleet/web-app',
    sourceBranch: 'feature/notifications',
    targetBranch: 'main',
    status: 'open',
    reviewStatus: 'reviewing',
    additions: 342,
    deletions: 45,
    comments: 8,
    reviewers: [
      { name: 'Alex Chen', initials: 'AC', status: 'approved' },
      { name: 'Sarah Kim', initials: 'SK', status: 'pending' }
    ],
    createdAt: '2 hours ago',
    labels: ['enhancement', 'priority-high']
  },
  {
    id: '2',
    title: 'fix: resolve memory leak in dashboard',
    number: 233,
    author: 'Alex Chen',
    authorInitials: 'AC',
    repository: 'agent-fleet/web-app',
    sourceBranch: 'fix/memory-leak',
    targetBranch: 'main',
    status: 'open',
    reviewStatus: 'approved',
    additions: 23,
    deletions: 15,
    comments: 3,
    reviewers: [
      { name: 'Francis Okorie', initials: 'FO', status: 'approved' }
    ],
    createdAt: '5 hours ago',
    labels: ['bug', 'critical']
  },
  {
    id: '3',
    title: 'chore: update dependencies',
    number: 232,
    author: 'Dependabot',
    authorInitials: 'DB',
    repository: 'agent-fleet/api',
    sourceBranch: 'deps/update',
    targetBranch: 'main',
    status: 'open',
    reviewStatus: 'changes_requested',
    additions: 156,
    deletions: 134,
    comments: 2,
    reviewers: [
      { name: 'Francis Okorie', initials: 'FO', status: 'changes_requested' }
    ],
    createdAt: '1 day ago',
    labels: ['dependencies']
  },
  {
    id: '4',
    title: 'docs: add API documentation',
    number: 231,
    author: 'Sarah Kim',
    authorInitials: 'SK',
    repository: 'agent-fleet/docs',
    sourceBranch: 'docs/api',
    targetBranch: 'main',
    status: 'merged',
    reviewStatus: 'approved',
    additions: 450,
    deletions: 12,
    comments: 5,
    reviewers: [
      { name: 'Francis Okorie', initials: 'FO', status: 'approved' },
      { name: 'Alex Chen', initials: 'AC', status: 'approved' }
    ],
    createdAt: '2 days ago',
    labels: ['documentation']
  }
];

const getStatusBadge = (status: PullRequest['status']) => {
  switch (status) {
    case 'open': return <Badge className="bg-emerald-500/20 text-emerald-400 border-emerald-500/30">Open</Badge>;
    case 'merged': return <Badge className="bg-purple-500/20 text-purple-400 border-purple-500/30">Merged</Badge>;
    case 'closed': return <Badge className="bg-red-500/20 text-red-400 border-red-500/30">Closed</Badge>;
    case 'draft': return <Badge className="bg-muted text-muted-foreground border-border">Draft</Badge>;
  }
};

const getReviewStatusIcon = (status: PullRequest['reviewStatus']) => {
  switch (status) {
    case 'approved': return <CheckCircle2 className="h-4 w-4 text-emerald-400" />;
    case 'changes_requested': return <AlertTriangle className="h-4 w-4 text-yellow-400" />;
    case 'reviewing': return <Eye className="h-4 w-4 text-blue-400" />;
    default: return <Clock className="h-4 w-4 text-muted-foreground" />;
  }
};

export default function CodeReviewPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState('open');

  const filteredPRs = mockPRs.filter(pr => {
    const matchesSearch = pr.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         pr.repository.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesTab = activeTab === 'all' || pr.status === activeTab;
    return matchesSearch && matchesTab;
  });

  const stats = {
    open: mockPRs.filter(pr => pr.status === 'open').length,
    needsReview: mockPRs.filter(pr => pr.reviewStatus === 'pending').length,
    approved: mockPRs.filter(pr => pr.reviewStatus === 'approved' && pr.status === 'open').length,
    merged: mockPRs.filter(pr => pr.status === 'merged').length
  };

  return (
    <div className="min-h-screen bg-background p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-foreground flex items-center gap-3">
            <GitPullRequest className="h-8 w-8 text-primary" />
            Code Review
          </h1>
          <p className="text-muted-foreground mt-1">Review and manage pull requests</p>
        </div>
        <Button className="gap-2">
          <GitPullRequest className="h-4 w-4" />
          New Pull Request
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="bg-card/50 border-emerald-500/20">
          <CardContent className="p-4 flex items-center gap-3">
            <div className="p-2 rounded-lg bg-emerald-500/20">
              <GitPullRequest className="h-5 w-5 text-emerald-400" />
            </div>
            <div>
              <p className="text-2xl font-bold text-foreground">{stats.open}</p>
              <p className="text-xs text-muted-foreground">Open PRs</p>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-card/50 border-yellow-500/20">
          <CardContent className="p-4 flex items-center gap-3">
            <div className="p-2 rounded-lg bg-yellow-500/20">
              <Eye className="h-5 w-5 text-yellow-400" />
            </div>
            <div>
              <p className="text-2xl font-bold text-foreground">{stats.needsReview}</p>
              <p className="text-xs text-muted-foreground">Needs Review</p>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-card/50 border-blue-500/20">
          <CardContent className="p-4 flex items-center gap-3">
            <div className="p-2 rounded-lg bg-blue-500/20">
              <ThumbsUp className="h-5 w-5 text-blue-400" />
            </div>
            <div>
              <p className="text-2xl font-bold text-foreground">{stats.approved}</p>
              <p className="text-xs text-muted-foreground">Approved</p>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-card/50 border-purple-500/20">
          <CardContent className="p-4 flex items-center gap-3">
            <div className="p-2 rounded-lg bg-purple-500/20">
              <GitMerge className="h-5 w-5 text-purple-400" />
            </div>
            <div>
              <p className="text-2xl font-bold text-foreground">{stats.merged}</p>
              <p className="text-xs text-muted-foreground">Merged</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Search and Tabs */}
      <div className="flex flex-col md:flex-row gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search pull requests..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 bg-card/50"
          />
        </div>
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="bg-card/50">
            <TabsTrigger value="open">Open</TabsTrigger>
            <TabsTrigger value="merged">Merged</TabsTrigger>
            <TabsTrigger value="closed">Closed</TabsTrigger>
            <TabsTrigger value="all">All</TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      {/* PR List */}
      <div className="space-y-4">
        {filteredPRs.map((pr) => (
          <Card key={pr.id} className="bg-card/50 hover:bg-card/70 transition-colors cursor-pointer">
            <CardContent className="p-6">
              <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-4">
                <div className="flex-1 space-y-3">
                  <div className="flex items-start gap-3">
                    <Avatar className="h-8 w-8">
                      <AvatarFallback className="bg-primary/20 text-primary text-xs">
                        {pr.authorInitials}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h3 className="font-semibold text-foreground hover:text-primary transition-colors">
                          {pr.title}
                        </h3>
                        {getStatusBadge(pr.status)}
                        {getReviewStatusIcon(pr.reviewStatus)}
                      </div>
                      <p className="text-sm text-muted-foreground mt-1">
                        #{pr.number} opened {pr.createdAt} by {pr.author}
                      </p>
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center gap-3 text-sm">
                    <span className="text-muted-foreground">{pr.repository}</span>
                    <span className="text-muted-foreground">
                      {pr.sourceBranch} → {pr.targetBranch}
                    </span>
                    <div className="flex items-center gap-2">
                      <span className="flex items-center gap-1 text-emerald-400">
                        <Plus className="h-3 w-3" />
                        {pr.additions}
                      </span>
                      <span className="flex items-center gap-1 text-red-400">
                        <Minus className="h-3 w-3" />
                        {pr.deletions}
                      </span>
                    </div>
                    <span className="flex items-center gap-1 text-muted-foreground">
                      <MessageSquare className="h-3 w-3" />
                      {pr.comments}
                    </span>
                  </div>

                  <div className="flex flex-wrap gap-2">
                    {pr.labels.map((label, idx) => (
                      <Badge key={idx} variant="outline" className="text-xs">
                        {label}
                      </Badge>
                    ))}
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <div className="flex -space-x-2">
                    {pr.reviewers.map((reviewer, idx) => (
                      <Avatar key={idx} className="h-7 w-7 border-2 border-background">
                        <AvatarFallback className={`text-xs ${
                          reviewer.status === 'approved' ? 'bg-emerald-500/20 text-emerald-400' :
                          reviewer.status === 'changes_requested' ? 'bg-yellow-500/20 text-yellow-400' :
                          'bg-muted text-muted-foreground'
                        }`}>
                          {reviewer.initials}
                        </AvatarFallback>
                      </Avatar>
                    ))}
                  </div>
                  {pr.status === 'open' && pr.reviewStatus === 'approved' && (
                    <Button size="sm" className="gap-1">
                      <GitMerge className="h-3 w-3" />
                      Merge
                    </Button>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
