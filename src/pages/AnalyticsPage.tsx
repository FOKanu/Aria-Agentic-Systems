import { useState } from 'react';
import { 
  AreaChart, Area, BarChart, Bar, LineChart, Line, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend 
} from 'recharts';
import { 
  TrendingUp, AlertTriangle, CheckCircle, XCircle, Filter, 
  Calendar, Download, RefreshCw, Bot, Clock 
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { mockAgents, mockAgentStats } from '@/data/agentsData';
import { cn } from '@/lib/utils';

// Mock historical data
const performanceHistory = [
  { date: 'Dec 11', successRate: 85, tasksCompleted: 42, avgResponseTime: 2.3, errors: 3 },
  { date: 'Dec 12', successRate: 88, tasksCompleted: 51, avgResponseTime: 2.1, errors: 2 },
  { date: 'Dec 13', successRate: 82, tasksCompleted: 38, avgResponseTime: 2.8, errors: 5 },
  { date: 'Dec 14', successRate: 91, tasksCompleted: 67, avgResponseTime: 1.9, errors: 1 },
  { date: 'Dec 15', successRate: 87, tasksCompleted: 54, avgResponseTime: 2.2, errors: 4 },
  { date: 'Dec 16', successRate: 94, tasksCompleted: 72, avgResponseTime: 1.7, errors: 1 },
  { date: 'Dec 17', successRate: 92, tasksCompleted: 63, avgResponseTime: 1.8, errors: 2 },
];

const tasksByCategory = [
  { name: 'Data Processing', value: 35, color: 'hsl(var(--primary))' },
  { name: 'Communications', value: 25, color: 'hsl(var(--success))' },
  { name: 'Development', value: 20, color: 'hsl(var(--warning))' },
  { name: 'Research', value: 12, color: 'hsl(var(--info))' },
  { name: 'Other', value: 8, color: 'hsl(var(--muted-foreground))' },
];

const errorLogs = [
  { id: 'err-1', timestamp: '2024-12-17 14:32:15', agent: 'Sage-Researcher', type: 'TIMEOUT', message: 'Request timed out after 30s', severity: 'high' },
  { id: 'err-2', timestamp: '2024-12-17 13:15:42', agent: 'Nova-Developer', type: 'VALIDATION', message: 'Invalid response format from API', severity: 'medium' },
  { id: 'err-3', timestamp: '2024-12-17 11:48:33', agent: 'Pixel-Vision', type: 'ACCESS', message: 'CAPTCHA detected, cannot proceed', severity: 'high' },
  { id: 'err-4', timestamp: '2024-12-16 18:22:10', agent: 'Flux-DevOps', type: 'CONNECTION', message: 'Failed to connect to remote server', severity: 'high' },
  { id: 'err-5', timestamp: '2024-12-16 16:05:55', agent: 'Aria-Communications', type: 'RATE_LIMIT', message: 'Rate limit exceeded, retrying in 60s', severity: 'low' },
  { id: 'err-6', timestamp: '2024-12-16 09:33:28', agent: 'Atlas-Planner', type: 'MEMORY', message: 'Context window exceeded', severity: 'medium' },
];

const agentPerformanceData = mockAgents.map(agent => {
  const stats = mockAgentStats[agent.id] || { tasksCompleted: 0, successRate: 0, avgResponseTime: 0, activeHours: 0 };
  return {
    name: agent.name.split('-')[0],
    fullName: agent.name,
    tasksCompleted: stats.tasksCompleted,
    successRate: stats.successRate,
    avgResponseTime: stats.avgResponseTime,
    activeHours: stats.activeHours,
  };
});

export function AnalyticsPage() {
  const [dateRange, setDateRange] = useState('7d');
  const [errorFilter, setErrorFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');

  const filteredErrors = errorLogs.filter(error => {
    const matchesFilter = errorFilter === 'all' || error.severity === errorFilter;
    const matchesSearch = searchQuery === '' || 
      error.message.toLowerCase().includes(searchQuery.toLowerCase()) ||
      error.agent.toLowerCase().includes(searchQuery.toLowerCase()) ||
      error.type.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  const totalTasks = performanceHistory.reduce((acc, d) => acc + d.tasksCompleted, 0);
  const avgSuccessRate = Math.round(performanceHistory.reduce((acc, d) => acc + d.successRate, 0) / performanceHistory.length);
  const totalErrors = performanceHistory.reduce((acc, d) => acc + d.errors, 0);
  const avgResponseTime = (performanceHistory.reduce((acc, d) => acc + d.avgResponseTime, 0) / performanceHistory.length).toFixed(1);

  return (
    <div className="space-y-6 animate-slide-up">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold">Analytics</h1>
          <p className="text-muted-foreground">Monitor fleet performance and identify issues</p>
        </div>
        <div className="flex items-center gap-2">
          <Select value={dateRange} onValueChange={setDateRange}>
            <SelectTrigger className="w-32">
              <Calendar className="w-4 h-4 mr-2" />
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="24h">Last 24h</SelectItem>
              <SelectItem value="7d">Last 7 days</SelectItem>
              <SelectItem value="30d">Last 30 days</SelectItem>
              <SelectItem value="90d">Last 90 days</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline" size="icon">
            <RefreshCw className="w-4 h-4" />
          </Button>
          <Button variant="outline" size="icon">
            <Download className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="glass-card p-4 rounded-xl">
          <div className="flex items-center gap-2 text-muted-foreground mb-1">
            <CheckCircle className="w-4 h-4 text-success" />
            <span className="text-sm">Tasks Completed</span>
          </div>
          <p className="text-2xl font-semibold">{totalTasks}</p>
          <p className="text-xs text-success">+12% from last period</p>
        </div>
        <div className="glass-card p-4 rounded-xl">
          <div className="flex items-center gap-2 text-muted-foreground mb-1">
            <TrendingUp className="w-4 h-4 text-primary" />
            <span className="text-sm">Avg Success Rate</span>
          </div>
          <p className="text-2xl font-semibold">{avgSuccessRate}%</p>
          <p className="text-xs text-success">+3% from last period</p>
        </div>
        <div className="glass-card p-4 rounded-xl">
          <div className="flex items-center gap-2 text-muted-foreground mb-1">
            <Clock className="w-4 h-4 text-warning" />
            <span className="text-sm">Avg Response Time</span>
          </div>
          <p className="text-2xl font-semibold">{avgResponseTime}s</p>
          <p className="text-xs text-success">-0.3s from last period</p>
        </div>
        <div className="glass-card p-4 rounded-xl">
          <div className="flex items-center gap-2 text-muted-foreground mb-1">
            <AlertTriangle className="w-4 h-4 text-destructive" />
            <span className="text-sm">Total Errors</span>
          </div>
          <p className="text-2xl font-semibold">{totalErrors}</p>
          <p className="text-xs text-destructive">+2 from last period</p>
        </div>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="performance" className="space-y-4">
        <TabsList className="grid w-full md:w-auto md:inline-grid grid-cols-4 gap-1">
          <TabsTrigger value="performance">Performance</TabsTrigger>
          <TabsTrigger value="agents">Agents</TabsTrigger>
          <TabsTrigger value="tasks">Tasks</TabsTrigger>
          <TabsTrigger value="errors">Error Logs</TabsTrigger>
        </TabsList>

        {/* Performance Tab */}
        <TabsContent value="performance" className="space-y-6">
          {/* Success Rate & Tasks Chart */}
          <div className="glass-card rounded-xl p-5 border border-border">
            <h3 className="font-semibold mb-4">Performance Trends</h3>
            <div className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={performanceHistory}>
                  <defs>
                    <linearGradient id="successGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis dataKey="date" stroke="hsl(var(--muted-foreground))" fontSize={12} />
                  <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: 'hsl(var(--card))', 
                      border: '1px solid hsl(var(--border))',
                      borderRadius: '8px'
                    }} 
                  />
                  <Legend />
                  <Area 
                    type="monotone" 
                    dataKey="successRate" 
                    name="Success Rate (%)"
                    stroke="hsl(var(--primary))" 
                    fill="url(#successGradient)" 
                    strokeWidth={2}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="tasksCompleted" 
                    name="Tasks Completed"
                    stroke="hsl(var(--success))" 
                    strokeWidth={2}
                    dot={{ fill: 'hsl(var(--success))' }}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Response Time Chart */}
          <div className="glass-card rounded-xl p-5 border border-border">
            <h3 className="font-semibold mb-4">Response Time Trend</h3>
            <div className="h-48">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={performanceHistory}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis dataKey="date" stroke="hsl(var(--muted-foreground))" fontSize={12} />
                  <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} unit="s" />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: 'hsl(var(--card))', 
                      border: '1px solid hsl(var(--border))',
                      borderRadius: '8px'
                    }} 
                  />
                  <Line 
                    type="monotone" 
                    dataKey="avgResponseTime" 
                    name="Avg Response Time (s)"
                    stroke="hsl(var(--warning))" 
                    strokeWidth={2}
                    dot={{ fill: 'hsl(var(--warning))' }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        </TabsContent>

        {/* Agents Tab */}
        <TabsContent value="agents" className="space-y-6">
          {/* Agent Comparison Chart */}
          <div className="glass-card rounded-xl p-5 border border-border">
            <h3 className="font-semibold mb-4">Agent Performance Comparison</h3>
            <div className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={agentPerformanceData} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis type="number" stroke="hsl(var(--muted-foreground))" fontSize={12} />
                  <YAxis dataKey="name" type="category" stroke="hsl(var(--muted-foreground))" fontSize={12} width={60} />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: 'hsl(var(--card))', 
                      border: '1px solid hsl(var(--border))',
                      borderRadius: '8px'
                    }} 
                  />
                  <Legend />
                  <Bar dataKey="tasksCompleted" name="Tasks Completed" fill="hsl(var(--primary))" radius={[0, 4, 4, 0]} />
                  <Bar dataKey="successRate" name="Success Rate (%)" fill="hsl(var(--success))" radius={[0, 4, 4, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Agent Details Grid */}
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {agentPerformanceData.map((agent) => (
              <div key={agent.fullName} className="glass-card rounded-xl p-4 border border-border">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 rounded-lg bg-primary/20 flex items-center justify-center">
                    <Bot className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <p className="font-medium">{agent.fullName}</p>
                    <p className="text-xs text-muted-foreground">{agent.activeHours}h active</p>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div className="p-2 rounded-lg bg-secondary/50">
                    <p className="text-muted-foreground text-xs">Tasks</p>
                    <p className="font-semibold">{agent.tasksCompleted}</p>
                  </div>
                  <div className="p-2 rounded-lg bg-secondary/50">
                    <p className="text-muted-foreground text-xs">Success</p>
                    <p className="font-semibold">{agent.successRate}%</p>
                  </div>
                  <div className="p-2 rounded-lg bg-secondary/50">
                    <p className="text-muted-foreground text-xs">Avg Time</p>
                    <p className="font-semibold">{agent.avgResponseTime}s</p>
                  </div>
                  <div className="p-2 rounded-lg bg-secondary/50">
                    <p className="text-muted-foreground text-xs">Active</p>
                    <p className="font-semibold">{agent.activeHours}h</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </TabsContent>

        {/* Tasks Tab */}
        <TabsContent value="tasks" className="space-y-6">
          <div className="grid md:grid-cols-2 gap-6">
            {/* Task Distribution Pie Chart */}
            <div className="glass-card rounded-xl p-5 border border-border">
              <h3 className="font-semibold mb-4">Tasks by Category</h3>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={tasksByCategory}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={80}
                      paddingAngle={5}
                      dataKey="value"
                    >
                      {tasksByCategory.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: 'hsl(var(--card))', 
                        border: '1px solid hsl(var(--border))',
                        borderRadius: '8px'
                      }} 
                    />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Task Completion Over Time */}
            <div className="glass-card rounded-xl p-5 border border-border">
              <h3 className="font-semibold mb-4">Daily Task Completion</h3>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={performanceHistory}>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                    <XAxis dataKey="date" stroke="hsl(var(--muted-foreground))" fontSize={12} />
                    <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} />
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: 'hsl(var(--card))', 
                        border: '1px solid hsl(var(--border))',
                        borderRadius: '8px'
                      }} 
                    />
                    <Bar dataKey="tasksCompleted" name="Completed" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
                    <Bar dataKey="errors" name="Errors" fill="hsl(var(--destructive))" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        </TabsContent>

        {/* Error Logs Tab */}
        <TabsContent value="errors" className="space-y-4">
          {/* Filters */}
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Input
                placeholder="Search errors..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9"
              />
              <Filter className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
            </div>
            <Select value={errorFilter} onValueChange={setErrorFilter}>
              <SelectTrigger className="w-full sm:w-40">
                <SelectValue placeholder="Severity" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Severities</SelectItem>
                <SelectItem value="high">High</SelectItem>
                <SelectItem value="medium">Medium</SelectItem>
                <SelectItem value="low">Low</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Error List */}
          <div className="glass-card rounded-xl border border-border overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-border bg-secondary/50">
                    <th className="text-left p-3 text-sm font-medium text-muted-foreground">Timestamp</th>
                    <th className="text-left p-3 text-sm font-medium text-muted-foreground">Agent</th>
                    <th className="text-left p-3 text-sm font-medium text-muted-foreground">Type</th>
                    <th className="text-left p-3 text-sm font-medium text-muted-foreground">Message</th>
                    <th className="text-left p-3 text-sm font-medium text-muted-foreground">Severity</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredErrors.length > 0 ? (
                    filteredErrors.map((error) => (
                      <tr key={error.id} className="border-b border-border/50 hover:bg-secondary/30">
                        <td className="p-3 text-sm font-mono text-muted-foreground">{error.timestamp}</td>
                        <td className="p-3 text-sm">{error.agent}</td>
                        <td className="p-3">
                          <span className="px-2 py-1 rounded text-xs font-medium bg-secondary">
                            {error.type}
                          </span>
                        </td>
                        <td className="p-3 text-sm max-w-xs truncate">{error.message}</td>
                        <td className="p-3">
                          <span className={cn(
                            "px-2 py-1 rounded text-xs font-medium",
                            error.severity === 'high' && "bg-destructive/20 text-destructive",
                            error.severity === 'medium' && "bg-warning/20 text-warning",
                            error.severity === 'low' && "bg-muted text-muted-foreground"
                          )}>
                            {error.severity}
                          </span>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={5} className="p-8 text-center text-muted-foreground">
                        No errors found matching your filters
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
