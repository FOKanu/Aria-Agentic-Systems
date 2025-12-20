/**
 * Infrastructure Page - DevOps Module
 * Created by Francis Okorie Iyeke-Kanu
 */

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Progress } from '@/components/ui/progress';
import {
  Server,
  Database,
  Cloud,
  HardDrive,
  Cpu,
  MemoryStick,
  Network,
  Search,
  Plus,
  Settings,
  Activity,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  RefreshCw
} from 'lucide-react';

interface Resource {
  id: string;
  name: string;
  type: 'server' | 'database' | 'storage' | 'network' | 'container';
  provider: 'aws' | 'gcp' | 'azure' | 'on-prem';
  status: 'running' | 'stopped' | 'warning' | 'error';
  region: string;
  specs: {
    cpu?: { used: number; total: number };
    memory?: { used: number; total: number };
    storage?: { used: number; total: number };
  };
  cost: string;
  uptime: string;
  tags: string[];
}

const mockResources: Resource[] = [
  {
    id: '1',
    name: 'prod-api-server-1',
    type: 'server',
    provider: 'aws',
    status: 'running',
    region: 'us-east-1',
    specs: {
      cpu: { used: 45, total: 100 },
      memory: { used: 12, total: 32 },
      storage: { used: 120, total: 500 }
    },
    cost: '$145/mo',
    uptime: '99.99%',
    tags: ['production', 'api', 'critical']
  },
  {
    id: '2',
    name: 'prod-db-primary',
    type: 'database',
    provider: 'aws',
    status: 'running',
    region: 'us-east-1',
    specs: {
      cpu: { used: 30, total: 100 },
      memory: { used: 48, total: 64 },
      storage: { used: 850, total: 1000 }
    },
    cost: '$420/mo',
    uptime: '99.99%',
    tags: ['production', 'database', 'postgresql']
  },
  {
    id: '3',
    name: 'staging-cluster',
    type: 'container',
    provider: 'gcp',
    status: 'running',
    region: 'us-central1',
    specs: {
      cpu: { used: 25, total: 100 },
      memory: { used: 8, total: 16 }
    },
    cost: '$89/mo',
    uptime: '99.95%',
    tags: ['staging', 'kubernetes']
  },
  {
    id: '4',
    name: 'cdn-storage',
    type: 'storage',
    provider: 'aws',
    status: 'running',
    region: 'global',
    specs: {
      storage: { used: 2400, total: 5000 }
    },
    cost: '$56/mo',
    uptime: '99.99%',
    tags: ['cdn', 'static-assets']
  },
  {
    id: '5',
    name: 'dev-server-1',
    type: 'server',
    provider: 'azure',
    status: 'warning',
    region: 'westus2',
    specs: {
      cpu: { used: 85, total: 100 },
      memory: { used: 7, total: 8 }
    },
    cost: '$45/mo',
    uptime: '98.50%',
    tags: ['development', 'testing']
  },
  {
    id: '6',
    name: 'backup-db',
    type: 'database',
    provider: 'on-prem',
    status: 'stopped',
    region: 'datacenter-1',
    specs: {
      storage: { used: 500, total: 2000 }
    },
    cost: '$0/mo',
    uptime: '-',
    tags: ['backup', 'archive']
  }
];

const getTypeIcon = (type: Resource['type']) => {
  switch (type) {
    case 'server': return <Server className="h-5 w-5" />;
    case 'database': return <Database className="h-5 w-5" />;
    case 'storage': return <HardDrive className="h-5 w-5" />;
    case 'network': return <Network className="h-5 w-5" />;
    case 'container': return <Cloud className="h-5 w-5" />;
  }
};

const getStatusBadge = (status: Resource['status']) => {
  switch (status) {
    case 'running': return <Badge className="bg-emerald-500/20 text-emerald-400 border-emerald-500/30">Running</Badge>;
    case 'stopped': return <Badge className="bg-muted text-muted-foreground border-border">Stopped</Badge>;
    case 'warning': return <Badge className="bg-yellow-500/20 text-yellow-400 border-yellow-500/30">Warning</Badge>;
    case 'error': return <Badge className="bg-red-500/20 text-red-400 border-red-500/30">Error</Badge>;
  }
};

const getProviderBadge = (provider: Resource['provider']) => {
  const colors = {
    aws: 'bg-orange-500/20 text-orange-400 border-orange-500/30',
    gcp: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
    azure: 'bg-cyan-500/20 text-cyan-400 border-cyan-500/30',
    'on-prem': 'bg-purple-500/20 text-purple-400 border-purple-500/30'
  };
  return <Badge className={colors[provider]}>{provider.toUpperCase()}</Badge>;
};

export default function InfrastructurePage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedType, setSelectedType] = useState<string>('all');

  const filteredResources = mockResources.filter(r => {
    const matchesSearch = r.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         r.tags.some(t => t.toLowerCase().includes(searchQuery.toLowerCase()));
    const matchesType = selectedType === 'all' || r.type === selectedType;
    return matchesSearch && matchesType;
  });

  const totalCost = mockResources.reduce((sum, r) => {
    const cost = parseFloat(r.cost.replace('$', '').replace('/mo', ''));
    return sum + cost;
  }, 0);

  const resourceTypes = ['all', 'server', 'database', 'storage', 'container', 'network'];

  return (
    <div className="min-h-screen bg-background p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-foreground flex items-center gap-3">
            <Cloud className="h-8 w-8 text-primary" />
            Infrastructure
          </h1>
          <p className="text-muted-foreground mt-1">Manage cloud resources and infrastructure</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" className="gap-2">
            <RefreshCw className="h-4 w-4" />
            Sync
          </Button>
          <Button className="gap-2">
            <Plus className="h-4 w-4" />
            Add Resource
          </Button>
        </div>
      </div>

      {/* Overview Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="bg-card/50">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-primary/20">
                <Server className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">{mockResources.length}</p>
                <p className="text-xs text-muted-foreground">Total Resources</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-card/50">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-emerald-500/20">
                <CheckCircle2 className="h-5 w-5 text-emerald-400" />
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">
                  {mockResources.filter(r => r.status === 'running').length}
                </p>
                <p className="text-xs text-muted-foreground">Running</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-card/50">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-yellow-500/20">
                <AlertTriangle className="h-5 w-5 text-yellow-400" />
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">
                  {mockResources.filter(r => r.status === 'warning').length}
                </p>
                <p className="text-xs text-muted-foreground">Warnings</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-card/50">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-blue-500/20">
                <Activity className="h-5 w-5 text-blue-400" />
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">${totalCost}</p>
                <p className="text-xs text-muted-foreground">Monthly Cost</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <div className="flex flex-col md:flex-row gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search resources..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 bg-card/50"
          />
        </div>
        <div className="flex gap-2 flex-wrap">
          {resourceTypes.map((type) => (
            <Button
              key={type}
              variant={selectedType === type ? 'default' : 'outline'}
              size="sm"
              onClick={() => setSelectedType(type)}
              className="capitalize"
            >
              {type}
            </Button>
          ))}
        </div>
      </div>

      {/* Resources Grid */}
      <div className="grid md:grid-cols-2 gap-4">
        {filteredResources.map((resource) => (
          <Card key={resource.id} className="bg-card/50 hover:bg-card/70 transition-colors">
            <CardContent className="p-6 space-y-4">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-primary/20 text-primary">
                    {getTypeIcon(resource.type)}
                  </div>
                  <div>
                    <h3 className="font-semibold text-foreground">{resource.name}</h3>
                    <p className="text-sm text-muted-foreground">{resource.region}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {getStatusBadge(resource.status)}
                  {getProviderBadge(resource.provider)}
                </div>
              </div>

              {/* Resource Metrics */}
              <div className="space-y-3">
                {resource.specs.cpu && (
                  <div className="space-y-1">
                    <div className="flex items-center justify-between text-sm">
                      <span className="flex items-center gap-1 text-muted-foreground">
                        <Cpu className="h-3 w-3" /> CPU
                      </span>
                      <span className="text-foreground">{resource.specs.cpu.used}%</span>
                    </div>
                    <Progress value={resource.specs.cpu.used} className="h-1.5" />
                  </div>
                )}
                {resource.specs.memory && (
                  <div className="space-y-1">
                    <div className="flex items-center justify-between text-sm">
                      <span className="flex items-center gap-1 text-muted-foreground">
                        <MemoryStick className="h-3 w-3" /> Memory
                      </span>
                      <span className="text-foreground">
                        {resource.specs.memory.used}GB / {resource.specs.memory.total}GB
                      </span>
                    </div>
                    <Progress 
                      value={(resource.specs.memory.used / resource.specs.memory.total) * 100} 
                      className="h-1.5" 
                    />
                  </div>
                )}
                {resource.specs.storage && (
                  <div className="space-y-1">
                    <div className="flex items-center justify-between text-sm">
                      <span className="flex items-center gap-1 text-muted-foreground">
                        <HardDrive className="h-3 w-3" /> Storage
                      </span>
                      <span className="text-foreground">
                        {resource.specs.storage.used}GB / {resource.specs.storage.total}GB
                      </span>
                    </div>
                    <Progress 
                      value={(resource.specs.storage.used / resource.specs.storage.total) * 100} 
                      className="h-1.5" 
                    />
                  </div>
                )}
              </div>

              {/* Footer */}
              <div className="flex items-center justify-between pt-2 border-t border-border">
                <div className="flex flex-wrap gap-1">
                  {resource.tags.slice(0, 3).map((tag, idx) => (
                    <Badge key={idx} variant="outline" className="text-xs">
                      {tag}
                    </Badge>
                  ))}
                </div>
                <div className="flex items-center gap-4 text-sm text-muted-foreground">
                  <span>{resource.cost}</span>
                  <span>↑ {resource.uptime}</span>
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
