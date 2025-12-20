// Expenses Page - © Francis Okorie Iyeke-Kanu
import { useState } from 'react';
import { CreditCard, Plus, Search, Filter, Upload, Camera, Receipt, Tag, Calendar, DollarSign, TrendingUp, TrendingDown, PieChart, Bot, MoreVertical, FileText, CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Progress } from '@/components/ui/progress';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';

interface Expense {
  id: string;
  description: string;
  amount: number;
  currency: string;
  category: string;
  date: Date;
  vendor: string;
  status: 'pending' | 'approved' | 'rejected' | 'reimbursed';
  receipt?: boolean;
  agent?: string;
  notes?: string;
}

const mockExpenses: Expense[] = [
  { id: '1', description: 'Client Dinner', amount: 245.50, currency: 'USD', category: 'Meals', date: new Date(), vendor: 'Le Restaurant', status: 'approved', receipt: true, agent: 'Pixel' },
  { id: '2', description: 'Software License', amount: 99, currency: 'USD', category: 'Software', date: new Date(Date.now() - 86400000), vendor: 'Adobe', status: 'reimbursed', receipt: true },
  { id: '3', description: 'Office Supplies', amount: 67.30, currency: 'USD', category: 'Supplies', date: new Date(Date.now() - 172800000), vendor: 'Staples', status: 'pending', receipt: true, agent: 'Sage' },
  { id: '4', description: 'Uber to Airport', amount: 45, currency: 'USD', category: 'Travel', date: new Date(Date.now() - 259200000), vendor: 'Uber', status: 'approved', receipt: true },
  { id: '5', description: 'Conference Ticket', amount: 599, currency: 'USD', category: 'Events', date: new Date(Date.now() - 604800000), vendor: 'TechConf 2024', status: 'pending' },
];

const categories = [
  { name: 'Meals', color: 'bg-orange-500', spent: 1250, budget: 2000 },
  { name: 'Travel', color: 'bg-blue-500', spent: 3400, budget: 5000 },
  { name: 'Software', color: 'bg-purple-500', spent: 890, budget: 1500 },
  { name: 'Supplies', color: 'bg-green-500', spent: 340, budget: 500 },
  { name: 'Events', color: 'bg-pink-500', spent: 1200, budget: 2000 },
];

const statusColors = {
  pending: 'bg-warning/20 text-warning',
  approved: 'bg-blue-500/20 text-blue-500',
  rejected: 'bg-destructive/20 text-destructive',
  reimbursed: 'bg-success/20 text-success',
};

export function ExpensesPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState('all');

  const filteredExpenses = mockExpenses.filter(exp => {
    const matchesSearch = exp.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      exp.vendor.toLowerCase().includes(searchQuery.toLowerCase());
    if (activeTab === 'all') return matchesSearch;
    return matchesSearch && exp.status === activeTab;
  });

  const totalSpent = mockExpenses.reduce((sum, exp) => sum + exp.amount, 0);
  const totalBudget = categories.reduce((sum, cat) => sum + cat.budget, 0);
  const pendingAmount = mockExpenses.filter(e => e.status === 'pending').reduce((sum, exp) => sum + exp.amount, 0);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(amount);
  };

  return (
    <div className="space-y-6 animate-slide-up">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
            <CreditCard className="w-5 h-5 text-primary" />
          </div>
          <div>
            <h1 className="text-xl font-bold font-display">Expense Tracking</h1>
            <p className="text-sm text-muted-foreground">Receipt OCR, categorization & reporting</p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" className="gap-2">
            <Camera className="w-4 h-4" />
            Scan Receipt
          </Button>
          <Button className="gap-2">
            <Plus className="w-4 h-4" />
            Add Expense
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-muted-foreground">Total Spent</p>
                <p className="text-xl font-bold">{formatCurrency(totalSpent)}</p>
              </div>
              <TrendingUp className="w-8 h-8 text-muted-foreground/50" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-muted-foreground">Monthly Budget</p>
                <p className="text-xl font-bold">{formatCurrency(totalBudget)}</p>
              </div>
              <PieChart className="w-8 h-8 text-muted-foreground/50" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-muted-foreground">Pending</p>
                <p className="text-xl font-bold text-warning">{formatCurrency(pendingAmount)}</p>
              </div>
              <Receipt className="w-8 h-8 text-warning/50" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-muted-foreground">Remaining</p>
                <p className="text-xl font-bold text-success">{formatCurrency(totalBudget - totalSpent)}</p>
              </div>
              <TrendingDown className="w-8 h-8 text-success/50" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Category Breakdown */}
      <Card>
        <CardHeader>
          <CardTitle className="text-sm font-medium">Budget by Category</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {categories.map(cat => {
              const percentage = (cat.spent / cat.budget) * 100;
              return (
                <div key={cat.name} className="space-y-1">
                  <div className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-2">
                      <div className={cn('w-2 h-2 rounded-full', cat.color)} />
                      <span>{cat.name}</span>
                    </div>
                    <span className="text-muted-foreground">
                      {formatCurrency(cat.spent)} / {formatCurrency(cat.budget)}
                    </span>
                  </div>
                  <Progress value={percentage} className="h-1.5" />
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Search and Filters */}
      <div className="flex items-center gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search expenses..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="pl-9"
          />
        </div>
        <Button variant="outline" size="icon">
          <Filter className="w-4 h-4" />
        </Button>
        <Button variant="outline" className="gap-2">
          <Upload className="w-4 h-4" />
          Import
        </Button>
      </div>

      {/* Tabs and Expense List */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="all">All</TabsTrigger>
          <TabsTrigger value="pending">Pending</TabsTrigger>
          <TabsTrigger value="approved">Approved</TabsTrigger>
          <TabsTrigger value="reimbursed">Reimbursed</TabsTrigger>
        </TabsList>

        <TabsContent value={activeTab} className="mt-4">
          <Card>
            <ScrollArea className="h-[350px]">
              <div className="divide-y divide-border">
                {filteredExpenses.length === 0 ? (
                  <div className="p-8 text-center text-muted-foreground">
                    <CreditCard className="w-10 h-10 mx-auto mb-2 opacity-50" />
                    <p>No expenses found</p>
                  </div>
                ) : (
                  filteredExpenses.map(expense => (
                    <div key={expense.id} className="p-4 hover:bg-secondary/30 transition-colors">
                      <div className="flex items-start gap-4">
                        <div className="w-10 h-10 rounded-lg bg-secondary flex items-center justify-center">
                          {expense.receipt ? (
                            <FileText className="w-5 h-5 text-primary" />
                          ) : (
                            <Receipt className="w-5 h-5 text-muted-foreground" />
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between mb-1">
                            <div className="flex items-center gap-2">
                              <span className="font-medium">{expense.description}</span>
                              <Badge variant="outline" className={cn('text-xs capitalize', statusColors[expense.status])}>
                                {expense.status}
                              </Badge>
                            </div>
                            <span className="font-bold">{formatCurrency(expense.amount)}</span>
                          </div>
                          <div className="flex items-center gap-3 text-xs text-muted-foreground">
                            <span>{expense.vendor}</span>
                            <span className="flex items-center gap-1">
                              <Tag className="w-3 h-3" />
                              {expense.category}
                            </span>
                            <span className="flex items-center gap-1">
                              <Calendar className="w-3 h-3" />
                              {format(expense.date, 'MMM d')}
                            </span>
                            {expense.agent && (
                              <span className="flex items-center gap-1 text-primary">
                                <Bot className="w-3 h-3" />
                                {expense.agent}
                              </span>
                            )}
                          </div>
                        </div>
                        <Button variant="ghost" size="icon" className="h-8 w-8">
                          <MoreVertical className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </ScrollArea>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
