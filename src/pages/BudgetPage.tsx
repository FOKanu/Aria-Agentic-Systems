// Budget Page - Created by Francis Okorie Iyeke-Kanu
import { useState } from 'react';
import { PieChart, Plus, TrendingUp, TrendingDown, DollarSign, Calendar, ArrowUpRight, ArrowDownRight, Target, AlertTriangle, CheckCircle, BarChart3 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { cn } from '@/lib/utils';

interface BudgetCategory {
  id: string;
  name: string;
  allocated: number;
  spent: number;
  color: string;
  icon: string;
}

interface Forecast {
  month: string;
  projected: number;
  actual?: number;
}

const budgetCategories: BudgetCategory[] = [
  { id: '1', name: 'Operations', allocated: 50000, spent: 42500, color: 'bg-blue-500', icon: '⚙️' },
  { id: '2', name: 'Marketing', allocated: 25000, spent: 28000, color: 'bg-purple-500', icon: '📢' },
  { id: '3', name: 'Development', allocated: 75000, spent: 65000, color: 'bg-green-500', icon: '💻' },
  { id: '4', name: 'Sales', allocated: 30000, spent: 22000, color: 'bg-orange-500', icon: '📈' },
  { id: '5', name: 'HR', allocated: 20000, spent: 18500, color: 'bg-pink-500', icon: '👥' },
];

const forecasts: Forecast[] = [
  { month: 'Jan', projected: 180000, actual: 175000 },
  { month: 'Feb', projected: 185000, actual: 190000 },
  { month: 'Mar', projected: 190000, actual: 188000 },
  { month: 'Apr', projected: 195000, actual: 200000 },
  { month: 'May', projected: 200000, actual: 195000 },
  { month: 'Jun', projected: 205000 },
  { month: 'Jul', projected: 210000 },
  { month: 'Aug', projected: 215000 },
];

export function BudgetPage() {
  const [activeTab, setActiveTab] = useState('overview');

  const totalAllocated = budgetCategories.reduce((sum, cat) => sum + cat.allocated, 0);
  const totalSpent = budgetCategories.reduce((sum, cat) => sum + cat.spent, 0);
  const overBudgetCategories = budgetCategories.filter(cat => cat.spent > cat.allocated);
  const underBudgetCategories = budgetCategories.filter(cat => cat.spent <= cat.allocated * 0.8);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(amount);
  };

  const getStatusColor = (spent: number, allocated: number) => {
    const ratio = spent / allocated;
    if (ratio > 1) return 'text-destructive';
    if (ratio > 0.9) return 'text-warning';
    return 'text-success';
  };

  return (
    <div className="space-y-6 animate-slide-up">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
            <PieChart className="w-5 h-5 text-primary" />
          </div>
          <div>
            <h1 className="text-xl font-bold font-display">Budget Planning</h1>
            <p className="text-sm text-muted-foreground">Forecasting, allocations & projections</p>
          </div>
        </div>
        <Button className="gap-2">
          <Plus className="w-4 h-4" />
          New Budget
        </Button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-muted-foreground">Total Budget</p>
                <p className="text-xl font-bold">{formatCurrency(totalAllocated)}</p>
              </div>
              <Target className="w-8 h-8 text-muted-foreground/50" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-muted-foreground">Total Spent</p>
                <p className="text-xl font-bold">{formatCurrency(totalSpent)}</p>
                <p className="text-xs text-muted-foreground">
                  {((totalSpent / totalAllocated) * 100).toFixed(1)}% used
                </p>
              </div>
              <DollarSign className="w-8 h-8 text-muted-foreground/50" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-muted-foreground">Over Budget</p>
                <p className="text-xl font-bold text-destructive">{overBudgetCategories.length}</p>
                <p className="text-xs text-muted-foreground">categories</p>
              </div>
              <AlertTriangle className="w-8 h-8 text-destructive/50" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-muted-foreground">Under Budget</p>
                <p className="text-xl font-bold text-success">{underBudgetCategories.length}</p>
                <p className="text-xs text-muted-foreground">categories</p>
              </div>
              <CheckCircle className="w-8 h-8 text-success/50" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="categories">Categories</TabsTrigger>
          <TabsTrigger value="forecast">Forecast</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="mt-4 space-y-4">
          {/* Budget Progress */}
          <Card>
            <CardHeader>
              <CardTitle className="text-sm font-medium">Overall Budget Progress</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Spent: {formatCurrency(totalSpent)}</span>
                  <span>Budget: {formatCurrency(totalAllocated)}</span>
                </div>
                <Progress value={(totalSpent / totalAllocated) * 100} className="h-3" />
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>{((totalSpent / totalAllocated) * 100).toFixed(1)}% used</span>
                  <span>{formatCurrency(totalAllocated - totalSpent)} remaining</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Category Summary */}
          <div className="grid md:grid-cols-2 gap-4">
            {budgetCategories.map(category => {
              const percentage = (category.spent / category.allocated) * 100;
              const isOverBudget = category.spent > category.allocated;
              return (
                <Card key={category.id}>
                  <CardContent className="pt-4">
                    <div className="flex items-center gap-3 mb-3">
                      <div className={cn('w-10 h-10 rounded-lg flex items-center justify-center text-lg', category.color + '/20')}>
                        {category.icon}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center justify-between">
                          <span className="font-medium">{category.name}</span>
                          <div className="flex items-center gap-1">
                            {isOverBudget ? (
                              <ArrowUpRight className="w-4 h-4 text-destructive" />
                            ) : (
                              <ArrowDownRight className="w-4 h-4 text-success" />
                            )}
                            <span className={getStatusColor(category.spent, category.allocated)}>
                              {percentage.toFixed(0)}%
                            </span>
                          </div>
                        </div>
                        <p className="text-xs text-muted-foreground">
                          {formatCurrency(category.spent)} / {formatCurrency(category.allocated)}
                        </p>
                      </div>
                    </div>
                    <Progress 
                      value={Math.min(percentage, 100)} 
                      className={cn('h-2', isOverBudget && '[&>div]:bg-destructive')} 
                    />
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </TabsContent>

        <TabsContent value="categories" className="mt-4">
          <Card>
            <CardContent className="pt-4">
              <div className="space-y-4">
                {budgetCategories.map(category => {
                  const percentage = (category.spent / category.allocated) * 100;
                  const isOverBudget = category.spent > category.allocated;
                  const variance = category.spent - category.allocated;
                  return (
                    <div key={category.id} className="flex items-center gap-4 p-3 rounded-lg border border-border">
                      <div className={cn('w-12 h-12 rounded-lg flex items-center justify-center text-xl', category.color + '/20')}>
                        {category.icon}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center justify-between mb-1">
                          <span className="font-medium">{category.name}</span>
                          <span className={cn('font-bold', getStatusColor(category.spent, category.allocated))}>
                            {formatCurrency(category.spent)}
                          </span>
                        </div>
                        <Progress value={Math.min(percentage, 100)} className="h-2 mb-1" />
                        <div className="flex justify-between text-xs text-muted-foreground">
                          <span>Allocated: {formatCurrency(category.allocated)}</span>
                          <span className={isOverBudget ? 'text-destructive' : 'text-success'}>
                            {isOverBudget ? '+' : ''}{formatCurrency(variance)}
                          </span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="forecast" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <BarChart3 className="w-4 h-4" />
                Monthly Forecast vs Actual
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {forecasts.map(month => (
                  <div key={month.month} className="flex items-center gap-4">
                    <span className="w-10 text-sm font-medium">{month.month}</span>
                    <div className="flex-1 space-y-1">
                      <div className="flex items-center gap-2">
                        <div className="flex-1 h-3 bg-secondary rounded-full overflow-hidden">
                          <div 
                            className="h-full bg-primary/50" 
                            style={{ width: `${(month.projected / 220000) * 100}%` }} 
                          />
                        </div>
                        <span className="text-xs text-muted-foreground w-16 text-right">
                          {formatCurrency(month.projected)}
                        </span>
                      </div>
                      {month.actual !== undefined && (
                        <div className="flex items-center gap-2">
                          <div className="flex-1 h-3 bg-secondary rounded-full overflow-hidden">
                            <div 
                              className={cn(
                                'h-full',
                                month.actual > month.projected ? 'bg-destructive' : 'bg-success'
                              )} 
                              style={{ width: `${(month.actual / 220000) * 100}%` }} 
                            />
                          </div>
                          <span className="text-xs w-16 text-right">
                            {formatCurrency(month.actual)}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
              <div className="flex items-center gap-4 mt-4 text-xs text-muted-foreground">
                <div className="flex items-center gap-1">
                  <div className="w-3 h-3 bg-primary/50 rounded" />
                  Projected
                </div>
                <div className="flex items-center gap-1">
                  <div className="w-3 h-3 bg-success rounded" />
                  Under Budget
                </div>
                <div className="flex items-center gap-1">
                  <div className="w-3 h-3 bg-destructive rounded" />
                  Over Budget
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
