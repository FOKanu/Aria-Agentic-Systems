/**
 * Security Scanning Page - DevOps Module
 * Created by Francis Okorie Iyeke-Kanu
 */

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Progress } from '@/components/ui/progress';
import {
  Shield,
  ShieldAlert,
  ShieldCheck,
  ShieldX,
  Search,
  Play,
  Clock,
  AlertTriangle,
  Bug,
  Lock,
  Key,
  FileWarning,
  ExternalLink,
  ChevronRight
} from 'lucide-react';

interface Vulnerability {
  id: string;
  title: string;
  severity: 'critical' | 'high' | 'medium' | 'low' | 'info';
  category: string;
  component: string;
  version: string;
  fixedIn: string | null;
  description: string;
  cve: string | null;
  discoveredAt: string;
  status: 'open' | 'fixed' | 'ignored' | 'in_progress';
}

interface Scan {
  id: string;
  name: string;
  type: 'dependency' | 'sast' | 'dast' | 'container' | 'secrets';
  target: string;
  status: 'completed' | 'running' | 'scheduled' | 'failed';
  lastRun: string;
  findings: { critical: number; high: number; medium: number; low: number };
  duration: string;
}

const mockScans: Scan[] = [
  {
    id: '1',
    name: 'Dependency Scan',
    type: 'dependency',
    target: 'agent-fleet/web-app',
    status: 'completed',
    lastRun: '2 hours ago',
    findings: { critical: 1, high: 3, medium: 8, low: 12 },
    duration: '45s'
  },
  {
    id: '2',
    name: 'SAST Analysis',
    type: 'sast',
    target: 'agent-fleet/api',
    status: 'running',
    lastRun: 'In progress',
    findings: { critical: 0, high: 2, medium: 5, low: 7 },
    duration: '-'
  },
  {
    id: '3',
    name: 'Container Scan',
    type: 'container',
    target: 'prod-images/*',
    status: 'completed',
    lastRun: '1 day ago',
    findings: { critical: 0, high: 1, medium: 4, low: 9 },
    duration: '2m 15s'
  },
  {
    id: '4',
    name: 'Secrets Detection',
    type: 'secrets',
    target: 'agent-fleet/*',
    status: 'completed',
    lastRun: '3 hours ago',
    findings: { critical: 2, high: 0, medium: 1, low: 0 },
    duration: '1m 30s'
  }
];

const mockVulnerabilities: Vulnerability[] = [
  {
    id: '1',
    title: 'Prototype Pollution in lodash',
    severity: 'critical',
    category: 'Dependency',
    component: 'lodash',
    version: '4.17.15',
    fixedIn: '4.17.21',
    description: 'Prototype pollution vulnerability allowing attackers to modify object prototypes.',
    cve: 'CVE-2020-8203',
    discoveredAt: '2 hours ago',
    status: 'open'
  },
  {
    id: '2',
    title: 'Hardcoded API Key Detected',
    severity: 'critical',
    category: 'Secrets',
    component: 'src/config/api.ts',
    version: '-',
    fixedIn: null,
    description: 'API key found hardcoded in source code. Should be moved to environment variables.',
    cve: null,
    discoveredAt: '3 hours ago',
    status: 'in_progress'
  },
  {
    id: '3',
    title: 'SQL Injection Risk',
    severity: 'high',
    category: 'SAST',
    component: 'src/db/queries.ts',
    version: '-',
    fixedIn: null,
    description: 'Potential SQL injection vulnerability in dynamic query construction.',
    cve: null,
    discoveredAt: '1 day ago',
    status: 'open'
  },
  {
    id: '4',
    title: 'Outdated Base Image',
    severity: 'medium',
    category: 'Container',
    component: 'node:16-alpine',
    version: '16.14.0',
    fixedIn: '16.20.0',
    description: 'Container base image contains known vulnerabilities.',
    cve: 'CVE-2023-1234',
    discoveredAt: '1 day ago',
    status: 'open'
  }
];

const getSeverityBadge = (severity: Vulnerability['severity']) => {
  const colors = {
    critical: 'bg-red-500/20 text-red-400 border-red-500/30',
    high: 'bg-orange-500/20 text-orange-400 border-orange-500/30',
    medium: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
    low: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
    info: 'bg-muted text-muted-foreground border-border'
  };
  return <Badge className={colors[severity]}>{severity}</Badge>;
};

const getScanTypeIcon = (type: Scan['type']) => {
  switch (type) {
    case 'dependency': return <Bug className="h-4 w-4" />;
    case 'sast': return <FileWarning className="h-4 w-4" />;
    case 'dast': return <ShieldAlert className="h-4 w-4" />;
    case 'container': return <Shield className="h-4 w-4" />;
    case 'secrets': return <Key className="h-4 w-4" />;
  }
};

export default function SecurityScanningPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSeverity, setSelectedSeverity] = useState<string>('all');

  const filteredVulnerabilities = mockVulnerabilities.filter(v => {
    const matchesSearch = v.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         v.component.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesSeverity = selectedSeverity === 'all' || v.severity === selectedSeverity;
    return matchesSearch && matchesSeverity;
  });

  const totalFindings = mockScans.reduce((acc, scan) => ({
    critical: acc.critical + scan.findings.critical,
    high: acc.high + scan.findings.high,
    medium: acc.medium + scan.findings.medium,
    low: acc.low + scan.findings.low
  }), { critical: 0, high: 0, medium: 0, low: 0 });

  return (
    <div className="min-h-screen bg-background p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-foreground flex items-center gap-3">
            <Shield className="h-8 w-8 text-primary" />
            Security Scanning
          </h1>
          <p className="text-muted-foreground mt-1">Monitor vulnerabilities and security issues</p>
        </div>
        <Button className="gap-2">
          <Play className="h-4 w-4" />
          Run All Scans
        </Button>
      </div>

      {/* Security Score */}
      <Card className="bg-card/50">
        <CardContent className="p-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="flex items-center gap-4">
              <div className="relative">
                <div className="w-20 h-20 rounded-full border-4 border-yellow-500/30 flex items-center justify-center">
                  <span className="text-2xl font-bold text-foreground">72</span>
                </div>
                <ShieldAlert className="absolute -bottom-1 -right-1 h-6 w-6 text-yellow-400" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-foreground">Security Score</h3>
                <p className="text-sm text-muted-foreground">Needs attention - {totalFindings.critical + totalFindings.high} critical/high issues</p>
              </div>
            </div>
            <div className="flex gap-6">
              <div className="text-center">
                <p className="text-2xl font-bold text-red-400">{totalFindings.critical}</p>
                <p className="text-xs text-muted-foreground">Critical</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-orange-400">{totalFindings.high}</p>
                <p className="text-xs text-muted-foreground">High</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-yellow-400">{totalFindings.medium}</p>
                <p className="text-xs text-muted-foreground">Medium</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-blue-400">{totalFindings.low}</p>
                <p className="text-xs text-muted-foreground">Low</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Scans Overview */}
      <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
        {mockScans.map((scan) => (
          <Card key={scan.id} className="bg-card/50 hover:bg-card/70 transition-colors cursor-pointer">
            <CardContent className="p-4 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-primary">
                  {getScanTypeIcon(scan.type)}
                  <span className="font-medium text-foreground">{scan.name}</span>
                </div>
                <Badge className={
                  scan.status === 'completed' ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30' :
                  scan.status === 'running' ? 'bg-blue-500/20 text-blue-400 border-blue-500/30' :
                  'bg-muted text-muted-foreground border-border'
                }>
                  {scan.status}
                </Badge>
              </div>
              <p className="text-sm text-muted-foreground truncate">{scan.target}</p>
              <div className="flex items-center gap-2 text-xs">
                <span className="text-red-400">{scan.findings.critical}C</span>
                <span className="text-orange-400">{scan.findings.high}H</span>
                <span className="text-yellow-400">{scan.findings.medium}M</span>
                <span className="text-blue-400">{scan.findings.low}L</span>
              </div>
              <div className="flex items-center justify-between text-xs text-muted-foreground">
                <span>{scan.lastRun}</span>
                <span>{scan.duration}</span>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Filters */}
      <div className="flex flex-col md:flex-row gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search vulnerabilities..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 bg-card/50"
          />
        </div>
        <div className="flex gap-2 flex-wrap">
          {['all', 'critical', 'high', 'medium', 'low'].map((severity) => (
            <Button
              key={severity}
              variant={selectedSeverity === severity ? 'default' : 'outline'}
              size="sm"
              onClick={() => setSelectedSeverity(severity)}
              className="capitalize"
            >
              {severity}
            </Button>
          ))}
        </div>
      </div>

      {/* Vulnerabilities List */}
      <Card className="bg-card/50">
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-yellow-400" />
            Open Vulnerabilities
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {filteredVulnerabilities.map((vuln) => (
            <div 
              key={vuln.id} 
              className="p-4 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors cursor-pointer"
            >
              <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-4">
                <div className="flex-1 space-y-2">
                  <div className="flex items-center gap-3 flex-wrap">
                    <h4 className="font-medium text-foreground">{vuln.title}</h4>
                    {getSeverityBadge(vuln.severity)}
                    <Badge variant="outline">{vuln.category}</Badge>
                    {vuln.status === 'in_progress' && (
                      <Badge className="bg-blue-500/20 text-blue-400 border-blue-500/30">In Progress</Badge>
                    )}
                  </div>
                  <p className="text-sm text-muted-foreground">{vuln.description}</p>
                  <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
                    <span className="font-mono">{vuln.component}</span>
                    {vuln.cve && (
                      <a href="#" className="flex items-center gap-1 text-primary hover:underline">
                        {vuln.cve}
                        <ExternalLink className="h-3 w-3" />
                      </a>
                    )}
                    {vuln.fixedIn && (
                      <span>Fix available: <span className="text-emerald-400">{vuln.fixedIn}</span></span>
                    )}
                    <span>{vuln.discoveredAt}</span>
                  </div>
                </div>
                <Button size="sm" variant="outline" className="gap-1">
                  Details
                  <ChevronRight className="h-3 w-3" />
                </Button>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
