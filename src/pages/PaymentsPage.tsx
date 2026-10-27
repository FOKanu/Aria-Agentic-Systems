// Payments Page - Author: Francis Okorie Iyeke-Kanu
import { useState } from 'react';
import { DollarSign, Search, Filter, Send, Clock, CheckCircle, AlertCircle, XCircle, Plus, Calendar, User, MoreVertical, ArrowDownLeft, ArrowUpRight, Bot, RefreshCw, Edit, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import { toast } from 'sonner';
import { PaymentFormDialog, PaymentFormData } from '@/components/finance';
import { ConfirmDialog } from '@/components/ConfirmDialog';

interface Payment {
  id: string;
  type: 'incoming' | 'outgoing';
  description: string;
  amount: number;
  currency: string;
  status: 'pending' | 'completed' | 'failed' | 'scheduled';
  date: Date;
  counterparty: string;
  method: string;
  reference?: string;
  agent?: string;
}

const initialPayments: Payment[] = [
  { id: '1', type: 'incoming', description: 'Invoice Payment', amount: 5000, currency: 'USD', status: 'completed', date: new Date(), counterparty: 'Acme Corp', method: 'Wire Transfer', reference: 'INV-2024-001' },
  { id: '2', type: 'outgoing', description: 'Supplier Payment', amount: 2500, currency: 'USD', status: 'pending', date: new Date(Date.now() + 86400000), counterparty: 'Tech Supplies Inc', method: 'ACH', agent: 'Echo' },
  { id: '3', type: 'incoming', description: 'Service Fee', amount: 1500, currency: 'USD', status: 'completed', date: new Date(Date.now() - 86400000), counterparty: 'Client XYZ', method: 'Credit Card' },
  { id: '4', type: 'outgoing', description: 'Rent Payment', amount: 3500, currency: 'USD', status: 'scheduled', date: new Date(Date.now() + 604800000), counterparty: 'Property Management', method: 'ACH' },
  { id: '5', type: 'outgoing', description: 'Subscription', amount: 99, currency: 'USD', status: 'failed', date: new Date(Date.now() - 172800000), counterparty: 'SaaS Platform', method: 'Credit Card' },
  { id: '6', type: 'incoming', description: 'Refund', amount: 250, currency: 'USD', status: 'completed', date: new Date(Date.now() - 259200000), counterparty: 'Vendor ABC', method: 'Wire Transfer' },
];

const statusIcons = {
  pending: Clock,
  completed: CheckCircle,
  failed: XCircle,
  scheduled: Calendar,
};

const statusColors = {
  pending: 'bg-warning/20 text-warning',
  completed: 'bg-success/20 text-success',
  failed: 'bg-destructive/20 text-destructive',
  scheduled: 'bg-blue-500/20 text-blue-500',
};

export function PaymentsPage() {
  const [payments, setPayments] = useState<Payment[]>(initialPayments);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState('all');
  const [formOpen, setFormOpen] = useState(false);
  const [editingPayment, setEditingPayment] = useState<Payment | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<{ open: boolean; id: string | null }>({ open: false, id: null });

  const filteredPayments = payments.filter(payment => {
    const matchesSearch = payment.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      payment.counterparty.toLowerCase().includes(searchQuery.toLowerCase());
    if (activeTab === 'all') return matchesSearch;
    if (activeTab === 'incoming') return matchesSearch && payment.type === 'incoming';
    if (activeTab === 'outgoing') return matchesSearch && payment.type === 'outgoing';
    return matchesSearch && payment.status === activeTab;
  });

  const stats = {
    incoming: payments.filter(p => p.type === 'incoming' && p.status === 'completed').reduce((sum, p) => sum + p.amount, 0),
    outgoing: payments.filter(p => p.type === 'outgoing' && p.status === 'completed').reduce((sum, p) => sum + p.amount, 0),
    pending: payments.filter(p => p.status === 'pending').reduce((sum, p) => sum + p.amount, 0),
    scheduled: payments.filter(p => p.status === 'scheduled').reduce((sum, p) => sum + p.amount, 0),
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(amount);
  };

  const handleCreateNew = () => {
    setEditingPayment(null);
    setFormOpen(true);
  };

  const handleEdit = (payment: Payment) => {
    setEditingPayment(payment);
    setFormOpen(true);
  };

  const handleSave = (data: PaymentFormData) => {
    if (data.id) {
      setPayments(prev => prev.map(p => 
        p.id === data.id ? {
          ...p,
          type: data.type,
          description: data.description,
          amount: data.amount,
          currency: data.currency,
          counterparty: data.counterparty,
          method: data.method,
          date: new Date(data.date),
          reference: data.reference,
        } : p
      ));
      toast.success('Payment updated');
    } else {
      const newPayment: Payment = {
        id: crypto.randomUUID(),
        type: data.type,
        description: data.description,
        amount: data.amount,
        currency: data.currency,
        status: 'pending',
        date: new Date(data.date),
        counterparty: data.counterparty,
        method: data.method,
        reference: data.reference,
      };
      setPayments(prev => [newPayment, ...prev]);
      toast.success('Payment created');
    }
    setEditingPayment(null);
  };

  const handleDelete = (id: string) => {
    setPayments(prev => prev.filter(p => p.id !== id));
    setDeleteConfirm({ open: false, id: null });
    toast.success('Payment deleted');
  };

  const handleSendReminder = () => {
    toast.success('Payment reminder sent');
  };

  const handleRetry = (id: string) => {
    setPayments(prev => prev.map(p => 
      p.id === id ? { ...p, status: 'pending' as const } : p
    ));
    toast.success('Payment retry initiated');
  };

  return (
    <div className="space-y-6 animate-slide-up">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
            <DollarSign className="w-5 h-5 text-primary" />
          </div>
          <div>
            <h1 className="text-xl font-bold font-display">Payment Processing</h1>
            <p className="text-sm text-muted-foreground">Track payments & send reminders</p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" className="gap-2" onClick={handleSendReminder}>
            <Send className="w-4 h-4" />
            Send Reminder
          </Button>
          <Button className="gap-2" onClick={handleCreateNew}>
            <Plus className="w-4 h-4" />
            New Payment
          </Button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-muted-foreground">Received</p>
                <p className="text-xl font-bold text-success">{formatCurrency(stats.incoming)}</p>
              </div>
              <ArrowDownLeft className="w-8 h-8 text-success/50" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-muted-foreground">Sent</p>
                <p className="text-xl font-bold text-primary">{formatCurrency(stats.outgoing)}</p>
              </div>
              <ArrowUpRight className="w-8 h-8 text-primary/50" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-muted-foreground">Pending</p>
                <p className="text-xl font-bold text-warning">{formatCurrency(stats.pending)}</p>
              </div>
              <Clock className="w-8 h-8 text-warning/50" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-muted-foreground">Scheduled</p>
                <p className="text-xl font-bold text-blue-500">{formatCurrency(stats.scheduled)}</p>
              </div>
              <Calendar className="w-8 h-8 text-blue-500/50" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Search */}
      <div className="flex items-center gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search payments..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="pl-9"
          />
        </div>
        <Button variant="outline" size="icon">
          <Filter className="w-4 h-4" />
        </Button>
        <Button variant="outline" size="icon">
          <RefreshCw className="w-4 h-4" />
        </Button>
      </div>

      {/* Tabs and Payments */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="all">All</TabsTrigger>
          <TabsTrigger value="incoming">Incoming</TabsTrigger>
          <TabsTrigger value="outgoing">Outgoing</TabsTrigger>
          <TabsTrigger value="pending">Pending</TabsTrigger>
          <TabsTrigger value="scheduled">Scheduled</TabsTrigger>
        </TabsList>

        <TabsContent value={activeTab} className="mt-4">
          <Card>
            <ScrollArea className="h-[400px]">
              <div className="divide-y divide-border">
                {filteredPayments.length === 0 ? (
                  <div className="p-8 text-center text-muted-foreground">
                    <DollarSign className="w-10 h-10 mx-auto mb-2 opacity-50" />
                    <p>No payments found</p>
                    <Button variant="outline" className="mt-4" onClick={handleCreateNew}>
                      <Plus className="w-4 h-4 mr-2" />
                      Create Your First Payment
                    </Button>
                  </div>
                ) : (
                  filteredPayments.map(payment => {
                    const StatusIcon = statusIcons[payment.status];
                    return (
                      <div key={payment.id} className="p-4 hover:bg-secondary/30 transition-colors">
                        <div className="flex items-start gap-4">
                          <div className={cn(
                            'w-10 h-10 rounded-full flex items-center justify-center',
                            payment.type === 'incoming' ? 'bg-success/20' : 'bg-primary/20'
                          )}>
                            {payment.type === 'incoming' ? (
                              <ArrowDownLeft className="w-5 h-5 text-success" />
                            ) : (
                              <ArrowUpRight className="w-5 h-5 text-primary" />
                            )}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between mb-1">
                              <div className="flex items-center gap-2">
                                <span className="font-medium">{payment.description}</span>
                                <Badge variant="outline" className={cn('text-xs', statusColors[payment.status])}>
                                  <StatusIcon className="w-3 h-3 mr-1" />
                                  {payment.status}
                                </Badge>
                              </div>
                              <span className={cn(
                                'text-lg font-bold',
                                payment.type === 'incoming' ? 'text-success' : ''
                              )}>
                                {payment.type === 'incoming' ? '+' : '-'}{formatCurrency(payment.amount)}
                              </span>
                            </div>
                            <div className="flex items-center gap-3 text-xs text-muted-foreground">
                              <span className="flex items-center gap-1">
                                <User className="w-3 h-3" />
                                {payment.counterparty}
                              </span>
                              <span>{payment.method}</span>
                              <span className="flex items-center gap-1">
                                <Calendar className="w-3 h-3" />
                                {format(payment.date, 'MMM d, yyyy')}
                              </span>
                              {payment.agent && (
                                <span className="flex items-center gap-1 text-primary">
                                  <Bot className="w-3 h-3" />
                                  {payment.agent}
                                </span>
                              )}
                            </div>
                            {payment.reference && (
                              <p className="mt-1 text-xs text-muted-foreground">
                                Ref: <span className="font-mono">{payment.reference}</span>
                              </p>
                            )}
                          </div>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon" className="h-8 w-8">
                                <MoreVertical className="w-4 h-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              {payment.status === 'failed' && (
                                <DropdownMenuItem onClick={() => handleRetry(payment.id)}>
                                  <RefreshCw className="w-4 h-4 mr-2" />
                                  Retry Payment
                                </DropdownMenuItem>
                              )}
                              <DropdownMenuItem onClick={() => handleEdit(payment)}>
                                <Edit className="w-4 h-4 mr-2" />
                                Edit
                              </DropdownMenuItem>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem 
                                onClick={() => setDeleteConfirm({ open: true, id: payment.id })}
                                className="text-destructive focus:text-destructive"
                              >
                                <Trash2 className="w-4 h-4 mr-2" />
                                Delete
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </ScrollArea>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Form Dialog */}
      <PaymentFormDialog
        open={formOpen}
        onOpenChange={setFormOpen}
        payment={editingPayment ? {
          id: editingPayment.id,
          type: editingPayment.type,
          description: editingPayment.description,
          amount: editingPayment.amount,
          currency: editingPayment.currency,
          counterparty: editingPayment.counterparty,
          method: editingPayment.method,
          date: editingPayment.date.toISOString().split('T')[0],
          reference: editingPayment.reference,
        } : null}
        onSave={handleSave}
      />

      {/* Delete Confirmation */}
      <ConfirmDialog
        open={deleteConfirm.open}
        onOpenChange={(open) => setDeleteConfirm({ open, id: null })}
        title="Delete Payment"
        description="Are you sure you want to delete this payment record? This action cannot be undone."
        confirmLabel="Delete"
        variant="destructive"
        onConfirm={() => deleteConfirm.id && handleDelete(deleteConfirm.id)}
      />
    </div>
  );
}
