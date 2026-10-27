// Invoices Page - Francis Okorie Iyeke-Kanu
import { useState } from 'react';
import { Receipt, Plus, Search, Filter, Download, Send, Calendar, DollarSign, Clock, CheckCircle, AlertCircle, XCircle, MoreVertical, Bot, Eye, FileText, TrendingUp, Edit, Trash2, Copy } from 'lucide-react';
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
import { InvoiceFormDialog, InvoiceFormData } from '@/components/finance';
import { ConfirmDialog } from '@/components/ConfirmDialog';

interface Invoice {
  id: string;
  invoiceNumber: string;
  client: string;
  amount: number;
  currency: string;
  status: 'draft' | 'sent' | 'paid' | 'overdue' | 'cancelled';
  issueDate: Date;
  dueDate: Date;
  paidDate?: Date;
  items: { description: string; quantity: number; rate: number }[];
  agent?: string;
  notes?: string;
}

const initialInvoices: Invoice[] = [
  { id: '1', invoiceNumber: 'INV-2024-001', client: 'Acme Corp', amount: 5000, currency: 'USD', status: 'paid', issueDate: new Date(Date.now() - 604800000), dueDate: new Date(Date.now() - 86400000), paidDate: new Date(Date.now() - 172800000), items: [{ description: 'Consulting Services', quantity: 10, rate: 500 }], agent: 'Aria' },
  { id: '2', invoiceNumber: 'INV-2024-002', client: 'TechStart Inc', amount: 2500, currency: 'USD', status: 'sent', issueDate: new Date(), dueDate: new Date(Date.now() + 1209600000), items: [{ description: 'Development Work', quantity: 25, rate: 100 }], agent: 'Aria' },
  { id: '3', invoiceNumber: 'INV-2024-003', client: 'Global Services', amount: 8750, currency: 'USD', status: 'overdue', issueDate: new Date(Date.now() - 2592000000), dueDate: new Date(Date.now() - 604800000), items: [{ description: 'Annual Support', quantity: 1, rate: 8750 }] },
  { id: '4', invoiceNumber: 'INV-2024-004', client: 'StartupXYZ', amount: 1200, currency: 'USD', status: 'draft', issueDate: new Date(), dueDate: new Date(Date.now() + 2592000000), items: [{ description: 'Design Services', quantity: 4, rate: 300 }] },
  { id: '5', invoiceNumber: 'INV-2024-005', client: 'Enterprise Ltd', amount: 15000, currency: 'USD', status: 'sent', issueDate: new Date(Date.now() - 259200000), dueDate: new Date(Date.now() + 1814400000), items: [{ description: 'Platform License', quantity: 1, rate: 15000 }], agent: 'Aria' },
];

const statusIcons = {
  draft: FileText,
  sent: Send,
  paid: CheckCircle,
  overdue: AlertCircle,
  cancelled: XCircle,
};

const statusColors = {
  draft: 'bg-muted text-muted-foreground',
  sent: 'bg-blue-500/20 text-blue-500',
  paid: 'bg-success/20 text-success',
  overdue: 'bg-destructive/20 text-destructive',
  cancelled: 'bg-muted text-muted-foreground line-through',
};

export function InvoicesPage() {
  const [invoices, setInvoices] = useState<Invoice[]>(initialInvoices);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState('all');
  const [formOpen, setFormOpen] = useState(false);
  const [editingInvoice, setEditingInvoice] = useState<Invoice | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<{ open: boolean; id: string | null }>({ open: false, id: null });

  const filteredInvoices = invoices.filter(inv => {
    const matchesSearch = inv.client.toLowerCase().includes(searchQuery.toLowerCase()) ||
      inv.invoiceNumber.toLowerCase().includes(searchQuery.toLowerCase());
    if (activeTab === 'all') return matchesSearch;
    return matchesSearch && inv.status === activeTab;
  });

  const stats = {
    total: invoices.reduce((sum, inv) => sum + inv.amount, 0),
    paid: invoices.filter(i => i.status === 'paid').reduce((sum, inv) => sum + inv.amount, 0),
    pending: invoices.filter(i => i.status === 'sent').reduce((sum, inv) => sum + inv.amount, 0),
    overdue: invoices.filter(i => i.status === 'overdue').reduce((sum, inv) => sum + inv.amount, 0),
  };

  const formatCurrency = (amount: number, currency: string) => {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency }).format(amount);
  };

  const handleCreateNew = () => {
    setEditingInvoice(null);
    setFormOpen(true);
  };

  const handleEdit = (invoice: Invoice) => {
    setEditingInvoice(invoice);
    setFormOpen(true);
  };

  const handleSave = (data: InvoiceFormData) => {
    if (data.id) {
      setInvoices(prev => prev.map(inv => 
        inv.id === data.id ? {
          ...inv,
          client: data.client,
          currency: data.currency,
          dueDate: new Date(data.dueDate),
          items: data.items,
          amount: data.items.reduce((sum, item) => sum + item.quantity * item.rate, 0),
          notes: data.notes,
        } : inv
      ));
      toast.success('Invoice updated');
    } else {
      const newInvoice: Invoice = {
        id: crypto.randomUUID(),
        invoiceNumber: `INV-2024-${String(invoices.length + 1).padStart(3, '0')}`,
        client: data.client,
        amount: data.items.reduce((sum, item) => sum + item.quantity * item.rate, 0),
        currency: data.currency,
        status: 'draft',
        issueDate: new Date(),
        dueDate: new Date(data.dueDate),
        items: data.items,
        notes: data.notes,
      };
      setInvoices(prev => [newInvoice, ...prev]);
      toast.success('Invoice created');
    }
    setEditingInvoice(null);
  };

  const handleDelete = (id: string) => {
    setInvoices(prev => prev.filter(inv => inv.id !== id));
    setDeleteConfirm({ open: false, id: null });
    toast.success('Invoice deleted');
  };

  const handleSendInvoice = (invoice: Invoice) => {
    setInvoices(prev => prev.map(inv => 
      inv.id === invoice.id ? { ...inv, status: 'sent' as const } : inv
    ));
    toast.success(`Invoice sent to ${invoice.client}`);
  };

  const handleDuplicate = (invoice: Invoice) => {
    const duplicate: Invoice = {
      ...invoice,
      id: crypto.randomUUID(),
      invoiceNumber: `INV-2024-${String(invoices.length + 1).padStart(3, '0')}`,
      status: 'draft',
      issueDate: new Date(),
      dueDate: new Date(Date.now() + 2592000000),
      paidDate: undefined,
    };
    setInvoices(prev => [duplicate, ...prev]);
    toast.success('Invoice duplicated');
  };

  return (
    <div className="space-y-6 animate-slide-up">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
            <Receipt className="w-5 h-5 text-primary" />
          </div>
          <div>
            <h1 className="text-xl font-bold font-display">Invoice Generation</h1>
            <p className="text-sm text-muted-foreground">Create & send professional invoices</p>
          </div>
        </div>
        <Button className="gap-2" onClick={handleCreateNew}>
          <Plus className="w-4 h-4" />
          Create Invoice
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-muted-foreground">Total Invoiced</p>
                <p className="text-xl font-bold">{formatCurrency(stats.total, 'USD')}</p>
              </div>
              <TrendingUp className="w-8 h-8 text-muted-foreground/50" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-muted-foreground">Paid</p>
                <p className="text-xl font-bold text-success">{formatCurrency(stats.paid, 'USD')}</p>
              </div>
              <CheckCircle className="w-8 h-8 text-success/50" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-muted-foreground">Pending</p>
                <p className="text-xl font-bold text-blue-500">{formatCurrency(stats.pending, 'USD')}</p>
              </div>
              <Clock className="w-8 h-8 text-blue-500/50" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-muted-foreground">Overdue</p>
                <p className="text-xl font-bold text-destructive">{formatCurrency(stats.overdue, 'USD')}</p>
              </div>
              <AlertCircle className="w-8 h-8 text-destructive/50" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Search and Filters */}
      <div className="flex items-center gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search invoices..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="pl-9"
          />
        </div>
        <Button variant="outline" size="icon">
          <Filter className="w-4 h-4" />
        </Button>
        <Button variant="outline" className="gap-2">
          <Download className="w-4 h-4" />
          Export
        </Button>
      </div>

      {/* Tabs and Invoice List */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="all">All</TabsTrigger>
          <TabsTrigger value="draft">Drafts</TabsTrigger>
          <TabsTrigger value="sent">Sent</TabsTrigger>
          <TabsTrigger value="paid">Paid</TabsTrigger>
          <TabsTrigger value="overdue">Overdue</TabsTrigger>
        </TabsList>

        <TabsContent value={activeTab} className="mt-4">
          <Card>
            <ScrollArea className="h-[400px]">
              <div className="divide-y divide-border">
                {filteredInvoices.length === 0 ? (
                  <div className="p-8 text-center text-muted-foreground">
                    <Receipt className="w-10 h-10 mx-auto mb-2 opacity-50" />
                    <p>No invoices found</p>
                    <Button variant="outline" className="mt-4" onClick={handleCreateNew}>
                      <Plus className="w-4 h-4 mr-2" />
                      Create Your First Invoice
                    </Button>
                  </div>
                ) : (
                  filteredInvoices.map(invoice => {
                    const StatusIcon = statusIcons[invoice.status];
                    return (
                      <div key={invoice.id} className="p-4 hover:bg-secondary/30 transition-colors">
                        <div className="flex items-start gap-4">
                          <div className={cn(
                            'w-10 h-10 rounded-lg flex items-center justify-center',
                            statusColors[invoice.status]
                          )}>
                            <StatusIcon className="w-5 h-5" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between mb-1">
                              <div className="flex items-center gap-2">
                                <span className="font-mono text-sm font-medium">{invoice.invoiceNumber}</span>
                                <Badge variant="outline" className={cn('text-xs capitalize', statusColors[invoice.status])}>
                                  {invoice.status}
                                </Badge>
                              </div>
                              <span className="text-lg font-bold">
                                {formatCurrency(invoice.amount, invoice.currency)}
                              </span>
                            </div>
                            <p className="font-medium">{invoice.client}</p>
                            <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground">
                              <span className="flex items-center gap-1">
                                <Calendar className="w-3 h-3" />
                                Issued: {format(invoice.issueDate, 'MMM d, yyyy')}
                              </span>
                              <span className="flex items-center gap-1">
                                <Clock className="w-3 h-3" />
                                Due: {format(invoice.dueDate, 'MMM d, yyyy')}
                              </span>
                              {invoice.agent && (
                                <span className="flex items-center gap-1 text-primary">
                                  <Bot className="w-3 h-3" />
                                  {invoice.agent}
                                </span>
                              )}
                            </div>
                          </div>
                          <div className="flex gap-1">
                            <Button variant="ghost" size="icon" className="h-8 w-8">
                              <Eye className="w-4 h-4" />
                            </Button>
                            {invoice.status === 'draft' && (
                              <Button 
                                variant="ghost" 
                                size="icon" 
                                className="h-8 w-8"
                                onClick={() => handleSendInvoice(invoice)}
                              >
                                <Send className="w-4 h-4" />
                              </Button>
                            )}
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="icon" className="h-8 w-8">
                                  <MoreVertical className="w-4 h-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                <DropdownMenuItem onClick={() => handleEdit(invoice)}>
                                  <Edit className="w-4 h-4 mr-2" />
                                  Edit
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={() => handleDuplicate(invoice)}>
                                  <Copy className="w-4 h-4 mr-2" />
                                  Duplicate
                                </DropdownMenuItem>
                                <DropdownMenuItem>
                                  <Download className="w-4 h-4 mr-2" />
                                  Download PDF
                                </DropdownMenuItem>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem 
                                  onClick={() => setDeleteConfirm({ open: true, id: invoice.id })}
                                  className="text-destructive focus:text-destructive"
                                >
                                  <Trash2 className="w-4 h-4 mr-2" />
                                  Delete
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </div>
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
      <InvoiceFormDialog
        open={formOpen}
        onOpenChange={setFormOpen}
        invoice={editingInvoice ? {
          id: editingInvoice.id,
          client: editingInvoice.client,
          currency: editingInvoice.currency,
          dueDate: editingInvoice.dueDate.toISOString().split('T')[0],
          items: editingInvoice.items,
          notes: editingInvoice.notes,
        } : null}
        onSave={handleSave}
      />

      {/* Delete Confirmation */}
      <ConfirmDialog
        open={deleteConfirm.open}
        onOpenChange={(open) => setDeleteConfirm({ open, id: null })}
        title="Delete Invoice"
        description="Are you sure you want to delete this invoice? This action cannot be undone."
        confirmLabel="Delete"
        variant="destructive"
        onConfirm={() => deleteConfirm.id && handleDelete(deleteConfirm.id)}
      />
    </div>
  );
}
