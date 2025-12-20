/**
 * CI/CD Pipelines Page - DevOps Module
 * Created by Francis Okorie Iyeke-Kanu
 */

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Progress } from '@/components/ui/progress';
import {
  GitBranch,
  Play,
  Pause,
  RotateCcw,
  CheckCircle2,
  XCircle,
  Clock,
  Search,
  Plus,
  Settings,
  Terminal,
  Box,
  Loader2
} from 'lucide-react';

interface Pipeline {
  id: string;
  name: string;
  repository: string;
  branch: string;
  status: 'running' | 'success' | 'failed' | 'pending' | 'cancelled';
  stages: { name: string; status: 'success' | 'failed' | 'running' | 'pending' }[];
  duration: string;
  triggeredBy: string;
  triggeredAt: string;
  commit: string;
}

const mockPipelines: Pipeline[] = [
  {
    id: '1',
    name: 'Frontend Deploy',
    repository: 'agent-fleet/web-app',
    branch: 'main',
    status: 'running',
    stages: [
      { name: 'Build', status: 'success' },
      { name: 'Test', status: 'success' },
      { name: 'Deploy', status: 'running' },
      { name: 'Verify', status: 'pending' }
    ],
    duration: '4m 32s',
    triggeredBy: 'Francis Okorie',
    triggeredAt: '2 min ago',
    commit: 'feat: add dashboard widgets'
  },
  {
    id: '2',
    name: 'API Build',
    repository: 'agent-fleet/api',
    branch: 'develop',
    status: 'success',
    stages: [
      { name: 'Build', status: 'success' },
      { name: 'Test', status: 'success' },
      { name: 'Deploy', status: 'success' }
    ],
    duration: '3m 15s',
    triggeredBy: 'CI Bot',
    triggeredAt: '15 min ago',
    commit: 'fix: resolve auth issue'
  },
  {
    id: '3',
    name: 'Infrastructure',
    repository: 'agent-fleet/infra',
    branch: 'main',
    status: 'failed',
    stages: [
      { name: 'Plan', status: 'success' },
      { name: 'Apply', status: 'failed' }
    ],
    duration: '1m 45s',
    triggeredBy: 'Francis Okorie',
    triggeredAt: '1 hour ago',
    commit: 'chore: update terraform'
  },
  {
    id: '4',
    name: 'Mobile App',
    repository: 'agent-fleet/mobile',
    branch: 'feature/auth',
    status: 'pending',
    stages: [
      { name: 'Build', status: 'pending' },
      { name: 'Test', status: 'pending' },
      { name: 'Deploy', status: 'pending' }
    ],
    duration: '-',
    triggeredBy: 'Scheduled',
    triggeredAt: 'Queued',
    commit: 'feat: biometric login'
  }
];

const getStatusColor = (status: Pipeline['status']) => {
  switch (status) {
    case 'running': return 'bg-blue-500/20 text-blue-400 border-blue-500/30';
    case 'success': return 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30';
    case 'failed': return 'bg-red-500/20 text-red-400 border-red-500/30';
    case 'pending': return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30';
    case 'cancelled': return 'bg-muted text-muted-foreground border-border';
    default: return 'bg-muted text-muted-foreground border-border';
  }
};

const getStageIcon = (status: string) => {
  switch (status) {
    case 'success': return <CheckCircle2 className="h-4 w-4 text-emerald-400" />;
    case 'failed': return <XCircle className="h-4 w-4 text-red-400" />;
    case 'running': return <Loader2 className="h-4 w-4 text-blue-400 animate-spin" />;
    default: return <Clock className="h-4 w-4 text-muted-foreground" />;
  }
};

export default function CICDPipelinesPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [pipelines] = useState<Pipeline[]>(mockPipelines);

  const filteredPipelines = pipelines.filter(p =>
    p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    p.repository.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const stats = {
    running: pipelines.filter(p => p.status === 'running').length,
    success: pipelines.filter(p => p.status === 'success').length,
    failed: pipelines.filter(p => p.status === 'failed').length,
    pending: pipelines.filter(p => p.status === 'pending').length
  };

  return (
    <div className="min-h-screen bg-background p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-foreground flex items-center gap-3">
            <GitBranch className="h-8 w-8 text-primary" />
            CI/CD Pipelines
          </h1>
          <p className="text-muted-foreground mt-1">Manage and monitor your deployment pipelines</p>
        </div>
        <Button className="gap-2">
          <Plus className="h-4 w-4" />
          New Pipeline
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="bg-card/50 border-blue-500/20">
          <CardContent className="p-4 flex items-center gap-3">
            <div className="p-2 rounded-lg bg-blue-500/20">
              <Loader2 className="h-5 w-5 text-blue-400 animate-spin" />
            </div>
            <div>
              <p className="text-2xl font-bold text-foreground">{stats.running}</p>
              <p className="text-xs text-muted-foreground">Running</p>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-card/50 border-emerald-500/20">
          <CardContent className="p-4 flex items-center gap-3">
            <div className="p-2 rounded-lg bg-emerald-500/20">
              <CheckCircle2 className="h-5 w-5 text-emerald-400" />
            </div>
            <div>
              <p className="text-2xl font-bold text-foreground">{stats.success}</p>
              <p className="text-xs text-muted-foreground">Successful</p>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-card/50 border-red-500/20">
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
        <Card className="bg-card/50 border-yellow-500/20">
          <CardContent className="p-4 flex items-center gap-3">
            <div className="p-2 rounded-lg bg-yellow-500/20">
              <Clock className="h-5 w-5 text-yellow-400" />
            </div>
            <div>
              <p className="text-2xl font-bold text-foreground">{stats.pending}</p>
              <p className="text-xs text-muted-foreground">Pending</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Search */}
      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search pipelines..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-10 bg-card/50"
        />
      </div>

      {/* Pipelines List */}
      <div className="space-y-4">
        {filteredPipelines.map((pipeline) => (
          <Card key={pipeline.id} className="bg-card/50 hover:bg-card/70 transition-colors">
            <CardContent className="p-6">
              <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                <div className="flex-1 space-y-3">
                  <div className="flex items-center gap-3">
                    <Box className="h-5 w-5 text-primary" />
                    <h3 className="font-semibold text-foreground">{pipeline.name}</h3>
                    <Badge className={getStatusColor(pipeline.status)}>
                      {pipeline.status}
                    </Badge>
                  </div>
                  
                  <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <GitBranch className="h-3 w-3" />
                      {pipeline.repository} / {pipeline.branch}
                    </span>
                    <span className="flex items-center gap-1">
                      <Terminal className="h-3 w-3" />
                      {pipeline.commit}
                    </span>
                    <span>{pipeline.triggeredBy} • {pipeline.triggeredAt}</span>
                  </div>

                  {/* Pipeline Stages */}
                  <div className="flex items-center gap-2">
                    {pipeline.stages.map((stage, idx) => (
                      <div key={idx} className="flex items-center gap-1">
                        <div className="flex items-center gap-1.5 px-2 py-1 rounded bg-muted/50">
                          {getStageIcon(stage.status)}
                          <span className="text-xs text-muted-foreground">{stage.name}</span>
                        </div>
                        {idx < pipeline.stages.length - 1 && (
                          <div className="w-4 h-0.5 bg-border" />
                        )}
                      </div>
                    ))}
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <span className="text-sm text-muted-foreground">{pipeline.duration}</span>
                  {pipeline.status === 'running' ? (
                    <Button size="sm" variant="outline" className="gap-1">
                      <Pause className="h-3 w-3" />
                      Stop
                    </Button>
                  ) : (
                    <Button size="sm" variant="outline" className="gap-1">
                      <Play className="h-3 w-3" />
                      Run
                    </Button>
                  )}
                  <Button size="sm" variant="ghost">
                    <RotateCcw className="h-4 w-4" />
                  </Button>
                  <Button size="sm" variant="ghost">
                    <Settings className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
