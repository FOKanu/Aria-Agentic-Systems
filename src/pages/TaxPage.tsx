import { useState } from 'react';
import { FileCheck, Upload, Calendar, Clock, CheckCircle, AlertTriangle, XCircle, Folder, FileText, Bot, Search, Filter, Plus, Download, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { ScrollArea } from '@/components/ui/scroll-area';
import { cn } from '@/lib/utils';
import { format, differenceInDays } from 'date-fns';

interface TaxDocument {
  id: string;
  name: string;
  type: string;
  status: 'collected' | 'pending' | 'missing';
  dueDate?: Date;
  agent?: string;
}

interface TaxDeadline {
  id: string;
  name: string;
  type: string;
  dueDate: Date;
  status: 'upcoming' | 'due_soon' | 'overdue' | 'completed';
  description?: string;
}

const taxDocuments: TaxDocument[] = [
  { id: '1', name: 'W-2 Forms', type: 'Income', status: 'collected', agent: 'Nexus' },
  { id: '2', name: '1099-INT', type: 'Interest Income', status: 'collected' },
  { id: '3', name: '1099-DIV', type: 'Dividends', status: 'pending', dueDate: new Date(Date.now() + 604800000) },
  { id: '4', name: 'Mortgage Interest Statement', type: 'Deductions', status: 'collected' },
  { id: '5', name: 'Charitable Donations', type: 'Deductions', status: 'pending', agent: 'Nexus' },
  { id: '6', name: 'Business Expenses', type: 'Deductions', status: 'missing' },
  { id: '7', name: 'Health Insurance Forms', type: 'Healthcare', status: 'collected' },
  { id: '8', name: 'Estimated Tax Payments', type: 'Payments', status: 'collected' },
];

const taxDeadlines: TaxDeadline[] = [
  { id: '1', name: 'Q1 Estimated Tax', type: 'Quarterly', dueDate: new Date(2024, 3, 15), status: 'completed', description: 'First quarter estimated tax payment' },
  { id: '2', name: 'Q2 Estimated Tax', type: 'Quarterly', dueDate: new Date(2024, 5, 17), status: 'completed', description: 'Second quarter estimated tax payment' },
  { id: '3', name: 'Q3 Estimated Tax', type: 'Quarterly', dueDate: new Date(2024, 8, 16), status: 'due_soon', description: 'Third quarter estimated tax payment' },
  { id: '4', name: 'Q4 Estimated Tax', type: 'Quarterly', dueDate: new Date(2025, 0, 15), status: 'upcoming', description: 'Fourth quarter estimated tax payment' },
  { id: '5', name: 'Annual Tax Return', type: 'Annual', dueDate: new Date(2025, 3, 15), status: 'upcoming', description: 'Federal and state income tax returns' },
];

const categories = [
  { name: 'Income', icon: '💰', count: 2, collected: 2 },
  { name: 'Deductions', icon: '📝', count: 3, collected: 1 },
  { name: 'Healthcare', icon: '🏥', count: 1, collected: 1 },
  { name: 'Payments', icon: '💳', count: 1, collected: 1 },
];

const statusIcons = {
  collected: CheckCircle,
  pending: Clock,
  missing: XCircle,
};

const statusColors = {
  collected: 'bg-success/20 text-success',
  pending: 'bg-warning/20 text-warning',
  missing: 'bg-destructive/20 text-destructive',
};

const deadlineColors = {
  upcoming: 'bg-blue-500/20 text-blue-500',
  due_soon: 'bg-warning/20 text-warning',
  overdue: 'bg-destructive/20 text-destructive',
  completed: 'bg-success/20 text-success',
};

export function TaxPage() {
  const [searchQuery, setSearchQuery] = useState('');

  const collectedCount = taxDocuments.filter(d => d.status === 'collected').length;
  const totalCount = taxDocuments.length;
  const progress = (collectedCount / totalCount) * 100;

  const filteredDocuments = taxDocuments.filter(doc =>
    doc.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    doc.type.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const getDeadlineUrgency = (deadline: TaxDeadline) => {
    if (deadline.status === 'completed') return 'completed';
    const daysUntil = differenceInDays(deadline.dueDate, new Date());
    if (daysUntil < 0) return 'overdue';
    if (daysUntil <= 14) return 'due_soon';
    return 'upcoming';
  };

  return (
    <div className="space-y-6 animate-slide-up">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
            <FileCheck className="w-5 h-5 text-primary" />
          </div>
          <div>
            <h1 className="text-xl font-bold font-display">Tax Preparation</h1>
            <p className="text-sm text-muted-foreground">Document organization & deadline tracking</p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" className="gap-2">
            <Download className="w-4 h-4" />
            Export
          </Button>
          <Button className="gap-2">
            <Upload className="w-4 h-4" />
            Upload Document
          </Button>
        </div>
      </div>

      {/* Progress Overview */}
      <Card>
        <CardContent className="pt-4">
          <div className="flex items-center justify-between mb-2">
            <span className="font-medium">Document Collection Progress</span>
            <span className="text-sm text-muted-foreground">{collectedCount} of {totalCount} documents</span>
          </div>
          <Progress value={progress} className="h-3" />
          <div className="flex justify-between mt-2 text-xs text-muted-foreground">
            <span>{progress.toFixed(0)}% complete</span>
            <span>{totalCount - collectedCount} remaining</span>
          </div>
        </CardContent>
      </Card>

      {/* Category Summary */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {categories.map(cat => (
          <Card key={cat.name} className="cursor-pointer hover:border-primary/50 transition-colors">
            <CardContent className="pt-4">
              <div className="flex items-center gap-3">
                <div className="text-2xl">{cat.icon}</div>
                <div className="flex-1">
                  <p className="font-medium text-sm">{cat.name}</p>
                  <p className="text-xs text-muted-foreground">
                    {cat.collected}/{cat.count} collected
                  </p>
                </div>
                <ChevronRight className="w-4 h-4 text-muted-foreground" />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Documents */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-medium">Tax Documents</CardTitle>
              <div className="relative w-48">
                <Search className="absolute left-2 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  placeholder="Search..."
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  className="h-8 pl-8 text-xs"
                />
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-[300px]">
              <div className="space-y-2">
                {filteredDocuments.map(doc => {
                  const StatusIcon = statusIcons[doc.status];
                  return (
                    <div key={doc.id} className="flex items-center gap-3 p-2 rounded-lg hover:bg-secondary/50 transition-colors">
                      <div className={cn(
                        'w-8 h-8 rounded flex items-center justify-center',
                        statusColors[doc.status]
                      )}>
                        <StatusIcon className="w-4 h-4" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">{doc.name}</p>
                        <p className="text-xs text-muted-foreground">{doc.type}</p>
                      </div>
                      {doc.agent && (
                        <Badge variant="outline" className="text-xs gap-1">
                          <Bot className="w-3 h-3" />
                          {doc.agent}
                        </Badge>
                      )}
                      <Badge variant="outline" className={cn('text-xs capitalize', statusColors[doc.status])}>
                        {doc.status}
                      </Badge>
                    </div>
                  );
                })}
              </div>
            </ScrollArea>
          </CardContent>
        </Card>

        {/* Deadlines */}
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Calendar className="w-4 h-4" />
              Tax Deadlines
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-[300px]">
              <div className="space-y-3">
                {taxDeadlines.map(deadline => {
                  const urgency = getDeadlineUrgency(deadline);
                  const daysUntil = differenceInDays(deadline.dueDate, new Date());
                  return (
                    <div key={deadline.id} className="p-3 rounded-lg border border-border">
                      <div className="flex items-center justify-between mb-1">
                        <span className="font-medium text-sm">{deadline.name}</span>
                        <Badge variant="outline" className={cn('text-xs capitalize', deadlineColors[urgency])}>
                          {urgency === 'completed' ? 'Completed' : 
                           urgency === 'overdue' ? 'Overdue' :
                           urgency === 'due_soon' ? `${daysUntil} days` :
                           format(deadline.dueDate, 'MMM d')}
                        </Badge>
                      </div>
                      <p className="text-xs text-muted-foreground">{deadline.description}</p>
                      <div className="flex items-center gap-2 mt-2 text-xs text-muted-foreground">
                        <Calendar className="w-3 h-3" />
                        <span>{format(deadline.dueDate, 'MMMM d, yyyy')}</span>
                        <Badge variant="outline" className="text-xs">{deadline.type}</Badge>
                      </div>
                    </div>
                  );
                })}
              </div>
            </ScrollArea>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
