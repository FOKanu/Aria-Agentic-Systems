/**
 * Log Analysis Page - DevOps Module
 * Created by Francis Okorie Iyeke-Kanu
 */

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  FileText,
  Search,
  Filter,
  Download,
  RefreshCw,
  AlertCircle,
  AlertTriangle,
  Info,
  Bug,
  Clock,
  Server,
  ChevronDown,
  Play,
  Pause,
  Trash2
} from 'lucide-react';

interface LogEntry {
  id: string;
  timestamp: string;
  level: 'error' | 'warn' | 'info' | 'debug';
  service: string;
  message: string;
  metadata?: Record<string, string>;
}

const mockLogs: LogEntry[] = [
  {
    id: '1',
    timestamp: '2024-01-15T10:23:45.123Z',
    level: 'error',
    service: 'api-server',
    message: 'Database connection failed: ECONNREFUSED 127.0.0.1:5432',
    metadata: { requestId: 'req-abc123', userId: 'user-456' }
  },
  {
    id: '2',
    timestamp: '2024-01-15T10:23:44.892Z',
    level: 'warn',
    service: 'api-server',
    message: 'Rate limit exceeded for IP 192.168.1.100',
    metadata: { endpoint: '/api/users', rateLimit: '100/min' }
  },
  {
    id: '3',
    timestamp: '2024-01-15T10:23:44.567Z',
    level: 'info',
    service: 'web-app',
    message: 'User authentication successful',
    metadata: { userId: 'user-789', method: 'oauth' }
  },
  {
    id: '4',
    timestamp: '2024-01-15T10:23:44.234Z',
    level: 'debug',
    service: 'worker',
    message: 'Processing job queue: 15 pending tasks',
    metadata: { queueName: 'email-notifications' }
  },
  {
    id: '5',
    timestamp: '2024-01-15T10:23:43.901Z',
    level: 'info',
    service: 'api-server',
    message: 'Request completed: GET /api/agents',
    metadata: { duration: '45ms', status: '200' }
  },
  {
    id: '6',
    timestamp: '2024-01-15T10:23:43.678Z',
    level: 'error',
    service: 'worker',
    message: 'Failed to send email notification: SMTP timeout',
    metadata: { recipientCount: '1', retryAttempt: '3' }
  },
  {
    id: '7',
    timestamp: '2024-01-15T10:23:43.345Z',
    level: 'warn',
    service: 'web-app',
    message: 'Slow query detected: SELECT * FROM tasks WHERE...',
    metadata: { duration: '2.3s', table: 'tasks' }
  },
  {
    id: '8',
    timestamp: '2024-01-15T10:23:43.012Z',
    level: 'info',
    service: 'api-server',
    message: 'Health check passed',
    metadata: { uptime: '72h 15m', memoryUsage: '68%' }
  },
  {
    id: '9',
    timestamp: '2024-01-15T10:23:42.789Z',
    level: 'debug',
    service: 'api-server',
    message: 'Cache hit for key: user:preferences:123',
    metadata: { cacheType: 'redis', ttl: '3600s' }
  },
  {
    id: '10',
    timestamp: '2024-01-15T10:23:42.456Z',
    level: 'info',
    service: 'worker',
    message: 'Scheduled job completed: daily-report-generation',
    metadata: { duration: '12.5s', recordsProcessed: '1542' }
  }
];

const getLevelIcon = (level: LogEntry['level']) => {
  switch (level) {
    case 'error': return <AlertCircle className="h-4 w-4 text-red-400" />;
    case 'warn': return <AlertTriangle className="h-4 w-4 text-yellow-400" />;
    case 'info': return <Info className="h-4 w-4 text-blue-400" />;
    case 'debug': return <Bug className="h-4 w-4 text-muted-foreground" />;
  }
};

const getLevelBadge = (level: LogEntry['level']) => {
  const colors = {
    error: 'bg-red-500/20 text-red-400 border-red-500/30',
    warn: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
    info: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
    debug: 'bg-muted text-muted-foreground border-border'
  };
  return <Badge className={`${colors[level]} text-xs uppercase`}>{level}</Badge>;
};

const formatTimestamp = (timestamp: string) => {
  const date = new Date(timestamp);
  const time = date.toLocaleTimeString('en-US', { 
    hour: '2-digit', 
    minute: '2-digit', 
    second: '2-digit'
  });
  const ms = date.getMilliseconds().toString().padStart(3, '0');
  return `${time}.${ms}`;
};

export default function LogAnalysisPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedLevel, setSelectedLevel] = useState<string>('all');
  const [selectedService, setSelectedService] = useState<string>('all');
  const [isLive, setIsLive] = useState(true);
  const [expandedLog, setExpandedLog] = useState<string | null>(null);

  const services = ['all', ...new Set(mockLogs.map(l => l.service))];
  const levels = ['all', 'error', 'warn', 'info', 'debug'];

  const filteredLogs = mockLogs.filter(log => {
    const matchesSearch = log.message.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         log.service.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesLevel = selectedLevel === 'all' || log.level === selectedLevel;
    const matchesService = selectedService === 'all' || log.service === selectedService;
    return matchesSearch && matchesLevel && matchesService;
  });

  const stats = {
    error: mockLogs.filter(l => l.level === 'error').length,
    warn: mockLogs.filter(l => l.level === 'warn').length,
    info: mockLogs.filter(l => l.level === 'info').length,
    debug: mockLogs.filter(l => l.level === 'debug').length
  };

  return (
    <div className="min-h-screen bg-background p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-foreground flex items-center gap-3">
            <FileText className="h-8 w-8 text-primary" />
            Log Analysis
          </h1>
          <p className="text-muted-foreground mt-1">Monitor and analyze application logs</p>
        </div>
        <div className="flex gap-2">
          <Button
            variant={isLive ? 'default' : 'outline'}
            className="gap-2"
            onClick={() => setIsLive(!isLive)}
          >
            {isLive ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
            {isLive ? 'Pause' : 'Live'}
          </Button>
          <Button variant="outline" className="gap-2">
            <Download className="h-4 w-4" />
            Export
          </Button>
          <Button variant="outline" className="gap-2">
            <RefreshCw className="h-4 w-4" />
            Refresh
          </Button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="bg-card/50 border-red-500/20">
          <CardContent className="p-4 flex items-center gap-3">
            <div className="p-2 rounded-lg bg-red-500/20">
              <AlertCircle className="h-5 w-5 text-red-400" />
            </div>
            <div>
              <p className="text-2xl font-bold text-foreground">{stats.error}</p>
              <p className="text-xs text-muted-foreground">Errors</p>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-card/50 border-yellow-500/20">
          <CardContent className="p-4 flex items-center gap-3">
            <div className="p-2 rounded-lg bg-yellow-500/20">
              <AlertTriangle className="h-5 w-5 text-yellow-400" />
            </div>
            <div>
              <p className="text-2xl font-bold text-foreground">{stats.warn}</p>
              <p className="text-xs text-muted-foreground">Warnings</p>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-card/50 border-blue-500/20">
          <CardContent className="p-4 flex items-center gap-3">
            <div className="p-2 rounded-lg bg-blue-500/20">
              <Info className="h-5 w-5 text-blue-400" />
            </div>
            <div>
              <p className="text-2xl font-bold text-foreground">{stats.info}</p>
              <p className="text-xs text-muted-foreground">Info</p>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-card/50">
          <CardContent className="p-4 flex items-center gap-3">
            <div className="p-2 rounded-lg bg-muted">
              <Bug className="h-5 w-5 text-muted-foreground" />
            </div>
            <div>
              <p className="text-2xl font-bold text-foreground">{stats.debug}</p>
              <p className="text-xs text-muted-foreground">Debug</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <div className="flex flex-col md:flex-row gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search logs..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 bg-card/50 font-mono text-sm"
          />
        </div>
        <div className="flex gap-2 flex-wrap">
          {levels.map((level) => (
            <Button
              key={level}
              variant={selectedLevel === level ? 'default' : 'outline'}
              size="sm"
              onClick={() => setSelectedLevel(level)}
              className="capitalize"
            >
              {level}
            </Button>
          ))}
        </div>
        <div className="flex gap-2 flex-wrap">
          {services.map((service) => (
            <Button
              key={service}
              variant={selectedService === service ? 'default' : 'outline'}
              size="sm"
              onClick={() => setSelectedService(service)}
            >
              {service === 'all' ? 'All Services' : service}
            </Button>
          ))}
        </div>
      </div>

      {/* Log Stream */}
      <Card className="bg-card/50">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg flex items-center gap-2">
              <Server className="h-5 w-5 text-primary" />
              Log Stream
              {isLive && (
                <span className="flex items-center gap-1 text-sm text-emerald-400">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                  Live
                </span>
              )}
            </CardTitle>
            <span className="text-sm text-muted-foreground">
              {filteredLogs.length} entries
            </span>
          </div>
        </CardHeader>
        <CardContent>
          <ScrollArea className="h-[500px]">
            <div className="space-y-1 font-mono text-sm">
              {filteredLogs.map((log) => (
                <div key={log.id}>
                  <div 
                    className={`p-3 rounded-lg hover:bg-muted/50 cursor-pointer transition-colors ${
                      expandedLog === log.id ? 'bg-muted/50' : ''
                    }`}
                    onClick={() => setExpandedLog(expandedLog === log.id ? null : log.id)}
                  >
                    <div className="flex items-start gap-3">
                      {getLevelIcon(log.level)}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="text-muted-foreground text-xs">
                            {formatTimestamp(log.timestamp)}
                          </span>
                          {getLevelBadge(log.level)}
                          <Badge variant="outline" className="text-xs">
                            {log.service}
                          </Badge>
                        </div>
                        <p className={`mt-1 ${
                          log.level === 'error' ? 'text-red-400' :
                          log.level === 'warn' ? 'text-yellow-400' :
                          'text-foreground'
                        }`}>
                          {log.message}
                        </p>
                      </div>
                      <ChevronDown className={`h-4 w-4 text-muted-foreground transition-transform ${
                        expandedLog === log.id ? 'rotate-180' : ''
                      }`} />
                    </div>
                  </div>
                  
                  {/* Expanded Metadata */}
                  {expandedLog === log.id && log.metadata && (
                    <div className="ml-10 p-3 bg-muted/30 rounded-lg mb-2">
                      <p className="text-xs text-muted-foreground mb-2">Metadata:</p>
                      <div className="grid grid-cols-2 gap-2">
                        {Object.entries(log.metadata).map(([key, value]) => (
                          <div key={key} className="text-xs">
                            <span className="text-muted-foreground">{key}:</span>{' '}
                            <span className="text-foreground">{value}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </ScrollArea>
        </CardContent>
      </Card>
    </div>
  );
}
