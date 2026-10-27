/**
 * Deployment Page - DevOps Module
 * Created by Francis Okorie Iyeke-Kanu
 */

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Progress } from '@/components/ui/progress';
import {
  Rocket,
  Globe,
  Server,
  CheckCircle2,
  XCircle,
  Clock,
  Search,
  RotateCcw,
  ExternalLink,
  Activity,
  ArrowUpRight,
  History,
  Loader2
} from 'lucide-react';

interface Deployment {
  id: string;
  environment: 'production' | 'staging' | 'development' | 'preview';
  service: string;
  version: string;
  status: 'deployed' | 'deploying' | 'failed' | 'rolling_back';
  url: string;
  deployedBy: string;
  deployedAt: string;
  commit: string;
  health: 'healthy' | 'degraded' | 'unhealthy';
  instances: number;
  region: string;
}

const mockDeployments: Deployment[] = [
  {
    id: '1',
    environment: 'production',
    service: 'Web Application',
    version: 'v2.4.1',
    status: 'deployed',
    url: 'https://app.agentfleet.io',
    deployedBy: 'Francis Okorie',
    deployedAt: '2 hours ago',
    commit: 'feat: dashboard improvements',
    health: 'healthy',
    instances: 4,
    region: 'us-east-1'
  },
  {
    id: '2',
    environment: 'staging',
    service: 'Web Application',
    version: 'v2.5.0-beta',
    status: 'deploying',
    url: 'https://staging.agentfleet.io',
    deployedBy: 'CI Bot',
    deployedAt: 'In progress',
    commit: 'feat: new notifications',
    health: 'healthy',
    instances: 2,
    region: 'us-east-1'
  },
  {
    id: '3',
    environment: 'production',
    service: 'API Server',
    version: 'v3.1.2',
    status: 'deployed',
    url: 'https://api.agentfleet.io',
    deployedBy: 'Francis Okorie',
    deployedAt: '1 day ago',
    commit: 'fix: rate limiting',
    health: 'healthy',
    instances: 6,
    region: 'us-east-1, eu-west-1'
  },
  {
    id: '4',
    environment: 'development',
    service: 'API Server',
    version: 'v3.2.0-dev',
    status: 'failed',
    url: 'https://dev-api.agentfleet.io',
    deployedBy: 'Alex Chen',
    deployedAt: '3 hours ago',
    commit: 'wip: graphql integration',
    health: 'unhealthy',
    instances: 1,
    region: 'us-east-1'
  },
  {
    id: '5',
    environment: 'preview',
    service: 'Web Application',
    version: 'pr-234',
    status: 'deployed',
    url: 'https://pr-234.preview.agentfleet.io',
    deployedBy: 'GitHub Actions',
    deployedAt: '30 min ago',
    commit: 'feat: notifications',
    health: 'healthy',
    instances: 1,
    region: 'us-east-1'
  }
];

const getEnvColor = (env: Deployment['environment']) => {
  switch (env) {
    case 'production': return 'bg-red-500/20 text-red-400 border-red-500/30';
    case 'staging': return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30';
    case 'development': return 'bg-blue-500/20 text-blue-400 border-blue-500/30';
    case 'preview': return 'bg-purple-500/20 text-purple-400 border-purple-500/30';
  }
};

const getStatusIcon = (status: Deployment['status']) => {
  switch (status) {
    case 'deployed': return <CheckCircle2 className="h-4 w-4 text-emerald-400" />;
    case 'deploying': return <Loader2 className="h-4 w-4 text-blue-400 animate-spin" />;
    case 'failed': return <XCircle className="h-4 w-4 text-red-400" />;
    case 'rolling_back': return <RotateCcw className="h-4 w-4 text-yellow-400 animate-spin" />;
  }
};

const getHealthColor = (health: Deployment['health']) => {
  switch (health) {
    case 'healthy': return 'text-emerald-400';
    case 'degraded': return 'text-yellow-400';
    case 'unhealthy': return 'text-red-400';
  }
};

export default function DeploymentPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedEnv, setSelectedEnv] = useState<string>('all');

  const filteredDeployments = mockDeployments.filter(d => {
    const matchesSearch = d.service.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         d.version.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesEnv = selectedEnv === 'all' || d.environment === selectedEnv;
    return matchesSearch && matchesEnv;
  });

  const environments = ['all', 'production', 'staging', 'development', 'preview'];

  return (
    <div className="min-h-screen bg-background p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-foreground flex items-center gap-3">
            <Rocket className="h-8 w-8 text-primary" />
            Deployments
          </h1>
          <p className="text-muted-foreground mt-1">Monitor and manage service deployments</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" className="gap-2">
            <History className="h-4 w-4" />
            History
          </Button>
          <Button className="gap-2">
            <Rocket className="h-4 w-4" />
            Deploy
          </Button>
        </div>
      </div>

      {/* Environment Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {['production', 'staging', 'development', 'preview'].map((env) => {
          const count = mockDeployments.filter(d => d.environment === env).length;
          const healthy = mockDeployments.filter(d => d.environment === env && d.health === 'healthy').length;
          return (
            <Card key={env} className="bg-card/50">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs text-muted-foreground capitalize">{env}</p>
                    <p className="text-2xl font-bold text-foreground">{count}</p>
                  </div>
                  <Badge className={getEnvColor(env as Deployment['environment'])}>
                    {healthy}/{count} healthy
                  </Badge>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Filters */}
      <div className="flex flex-col md:flex-row gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search deployments..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 bg-card/50"
          />
        </div>
        <div className="flex gap-2 flex-wrap">
          {environments.map((env) => (
            <Button
              key={env}
              variant={selectedEnv === env ? 'default' : 'outline'}
              size="sm"
              onClick={() => setSelectedEnv(env)}
              className="capitalize"
            >
              {env}
            </Button>
          ))}
        </div>
      </div>

      {/* Deployments List */}
      <div className="grid gap-4">
        {filteredDeployments.map((deployment) => (
          <Card key={deployment.id} className="bg-card/50 hover:bg-card/70 transition-colors">
            <CardContent className="p-6">
              <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                <div className="flex-1 space-y-3">
                  <div className="flex items-center gap-3 flex-wrap">
                    <Server className="h-5 w-5 text-primary" />
                    <h3 className="font-semibold text-foreground">{deployment.service}</h3>
                    <Badge className={getEnvColor(deployment.environment)}>
                      {deployment.environment}
                    </Badge>
                    <div className="flex items-center gap-1">
                      {getStatusIcon(deployment.status)}
                      <span className="text-sm text-muted-foreground capitalize">
                        {deployment.status.replace('_', ' ')}
                      </span>
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
                    <span className="flex items-center gap-1 font-mono">
                      {deployment.version}
                    </span>
                    <span>{deployment.commit}</span>
                    <span>{deployment.deployedBy} • {deployment.deployedAt}</span>
                  </div>

                  <div className="flex flex-wrap items-center gap-4 text-sm">
                    <span className="flex items-center gap-1">
                      <Globe className="h-3 w-3 text-muted-foreground" />
                      <a 
                        href={deployment.url} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-primary hover:underline flex items-center gap-1"
                      >
                        {deployment.url.replace('https://', '')}
                        <ExternalLink className="h-3 w-3" />
                      </a>
                    </span>
                    <span className={`flex items-center gap-1 ${getHealthColor(deployment.health)}`}>
                      <Activity className="h-3 w-3" />
                      {deployment.health}
                    </span>
                    <span className="text-muted-foreground">
                      {deployment.instances} instance{deployment.instances > 1 ? 's' : ''} • {deployment.region}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  {deployment.status === 'deploying' && (
                    <Progress value={65} className="w-24 h-2" />
                  )}
                  <Button size="sm" variant="outline" className="gap-1">
                    <ArrowUpRight className="h-3 w-3" />
                    Promote
                  </Button>
                  <Button size="sm" variant="ghost">
                    <RotateCcw className="h-4 w-4" />
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
