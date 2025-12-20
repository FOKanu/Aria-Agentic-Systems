// Financial Reports Page - Created by Francis Okorie Iyeke-Kanu
import { useState } from 'react';
import { BarChart3, Download, Calendar, TrendingUp, TrendingDown, DollarSign, ArrowUpRight, ArrowDownRight, PieChart, LineChart, Filter, RefreshCw, Bot } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { cn } from '@/lib/utils';

interface ReportMetric {
  label: string;
  value: number;
  change: number;
  trend: 'up' | 'down';
}

interface IncomeStatement {
  category: string;
  current: number;
  previous: number;
}

const metrics: ReportMetric[] = [
  { label: 'Revenue', value: 485000, change: 12.5, trend: 'up' },
  { label: 'Expenses', value: 310000, change: 8.2, trend: 'up' },
  { label: 'Net Income', value: 175000, change: 18.3, trend: 'up' },
  { label: 'Cash Flow', value: 125000, change: -5.2, trend: 'down' },
];

const incomeStatement: IncomeStatement[] = [
  { category: 'Product Sales', current: 350000, previous: 310000 },
  { category: 'Service Revenue', current: 135000, previous: 125000 },
  { category: 'Cost of Goods', current: -150000, previous: -140000 },
  { category: 'Operating Expenses', current: -120000, previous: -110000 },
  { category: 'Salaries', current: -85000, previous: -80000 },
  { category: 'Marketing', current: -28000, previous: -25000 },
  { category: 'Other Expenses', current: -27000, previous: -22000 },
];

const cashFlowItems = [
  { category: 'Operating Activities', amount: 185000 },
  { category: 'Investing Activities', amount: -45000 },
  { category: 'Financing Activities', amount: -15000 },
];

export function FinancialReportsPage() {
  const [activeTab, setActiveTab] = useState('overview');
  const [period, setPeriod] = useState('month');

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(amount);
  };

  const totalRevenue = incomeStatement.filter(i => i.current > 0).reduce((sum, i) => sum + i.current, 0);
  const totalExpenses = Math.abs(incomeStatement.filter(i => i.current < 0).reduce((sum, i) => sum + i.current, 0));
  const netIncome = totalRevenue - totalExpenses;

  return (
    <div className="space-y-6 animate-slide-up">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
            <BarChart3 className="w-5 h-5 text-primary" />
          </div>
          <div>
            <h1 className="text-xl font-bold font-display">Financial Reports</h1>
            <p className="text-sm text-muted-foreground">P&L, cash flow & balance sheets</p>
          </div>
        </div>
        <div className="flex gap-2">
          <Select value={period} onValueChange={setPeriod}>
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="week">This Week</SelectItem>
              <SelectItem value="month">This Month</SelectItem>
              <SelectItem value="quarter">This Quarter</SelectItem>
              <SelectItem value="year">This Year</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline" className="gap-2">
            <Download className="w-4 h-4" />
            Export
          </Button>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {metrics.map(metric => (
          <Card key={metric.label}>
            <CardContent className="pt-4">
              <div className="flex items-center justify-between mb-1">
                <p className="text-xs text-muted-foreground">{metric.label}</p>
                <div className={cn(
                  'flex items-center text-xs font-medium',
                  metric.change > 0 ? 'text-success' : 'text-destructive'
                )}>
                  {metric.trend === 'up' ? (
                    <ArrowUpRight className="w-3 h-3" />
                  ) : (
                    <ArrowDownRight className="w-3 h-3" />
                  )}
                  {Math.abs(metric.change)}%
                </div>
              </div>
              <p className="text-xl font-bold">{formatCurrency(metric.value)}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Report Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="income">Income Statement</TabsTrigger>
          <TabsTrigger value="cashflow">Cash Flow</TabsTrigger>
          <TabsTrigger value="balance">Balance Sheet</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="mt-4">
          <div className="grid md:grid-cols-2 gap-4">
            {/* Revenue vs Expenses */}
            <Card>
              <CardHeader>
                <CardTitle className="text-sm font-medium flex items-center gap-2">
                  <PieChart className="w-4 h-4" />
                  Revenue vs Expenses
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-3 rounded-lg bg-success/10">
                    <div className="flex items-center gap-2">
                      <TrendingUp className="w-5 h-5 text-success" />
                      <span className="font-medium">Total Revenue</span>
                    </div>
                    <span className="text-lg font-bold text-success">{formatCurrency(totalRevenue)}</span>
                  </div>
                  <div className="flex items-center justify-between p-3 rounded-lg bg-destructive/10">
                    <div className="flex items-center gap-2">
                      <TrendingDown className="w-5 h-5 text-destructive" />
                      <span className="font-medium">Total Expenses</span>
                    </div>
                    <span className="text-lg font-bold text-destructive">{formatCurrency(totalExpenses)}</span>
                  </div>
                  <div className="flex items-center justify-between p-3 rounded-lg bg-primary/10 border-2 border-primary/30">
                    <div className="flex items-center gap-2">
                      <DollarSign className="w-5 h-5 text-primary" />
                      <span className="font-medium">Net Income</span>
                    </div>
                    <span className="text-lg font-bold text-primary">{formatCurrency(netIncome)}</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Cash Flow Summary */}
            <Card>
              <CardHeader>
                <CardTitle className="text-sm font-medium flex items-center gap-2">
                  <LineChart className="w-4 h-4" />
                  Cash Flow Summary
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {cashFlowItems.map(item => (
                    <div key={item.category} className="flex items-center justify-between p-3 rounded-lg border border-border">
                      <span className="text-sm">{item.category}</span>
                      <span className={cn(
                        'font-bold',
                        item.amount > 0 ? 'text-success' : 'text-destructive'
                      )}>
                        {item.amount > 0 ? '+' : ''}{formatCurrency(item.amount)}
                      </span>
                    </div>
                  ))}
                  <div className="flex items-center justify-between p-3 rounded-lg bg-secondary font-medium">
                    <span>Net Cash Flow</span>
                    <span className="text-lg font-bold">
                      {formatCurrency(cashFlowItems.reduce((sum, i) => sum + i.amount, 0))}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="income" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-sm font-medium">Income Statement</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-1">
                <div className="grid grid-cols-4 gap-4 p-2 text-xs font-medium text-muted-foreground border-b border-border">
                  <span>Category</span>
                  <span className="text-right">Current</span>
                  <span className="text-right">Previous</span>
                  <span className="text-right">Change</span>
                </div>
                {incomeStatement.map(item => {
                  const change = ((item.current - item.previous) / Math.abs(item.previous)) * 100;
                  return (
                    <div key={item.category} className="grid grid-cols-4 gap-4 p-2 hover:bg-secondary/50 rounded">
                      <span className="text-sm">{item.category}</span>
                      <span className={cn(
                        'text-right text-sm font-medium',
                        item.current < 0 && 'text-destructive'
                      )}>
                        {formatCurrency(item.current)}
                      </span>
                      <span className="text-right text-sm text-muted-foreground">
                        {formatCurrency(item.previous)}
                      </span>
                      <span className={cn(
                        'text-right text-sm',
                        change > 0 ? 'text-success' : 'text-destructive'
                      )}>
                        {change > 0 ? '+' : ''}{change.toFixed(1)}%
                      </span>
                    </div>
                  );
                })}
                <div className="grid grid-cols-4 gap-4 p-2 mt-2 border-t-2 border-border font-bold">
                  <span>Net Income</span>
                  <span className="text-right text-success">{formatCurrency(netIncome)}</span>
                  <span className="text-right text-muted-foreground">
                    {formatCurrency(incomeStatement.reduce((sum, i) => sum + i.previous, 0))}
                  </span>
                  <span className="text-right text-success">+18.3%</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="cashflow" className="mt-4">
          <Card>
            <CardContent className="pt-6 text-center text-muted-foreground">
              <LineChart className="w-12 h-12 mx-auto mb-3 opacity-50" />
              <p className="font-medium">Cash Flow Statement</p>
              <p className="text-sm">Detailed cash flow analysis coming soon</p>
              <Button variant="outline" className="mt-4 gap-2">
                <Bot className="w-4 h-4" />
                Generate with AI
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="balance" className="mt-4">
          <Card>
            <CardContent className="pt-6 text-center text-muted-foreground">
              <PieChart className="w-12 h-12 mx-auto mb-3 opacity-50" />
              <p className="font-medium">Balance Sheet</p>
              <p className="text-sm">Assets, liabilities & equity breakdown coming soon</p>
              <Button variant="outline" className="mt-4 gap-2">
                <Bot className="w-4 h-4" />
                Generate with AI
              </Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
