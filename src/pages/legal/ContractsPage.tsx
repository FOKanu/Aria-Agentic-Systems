// Contracts Page - Francis Okorie Iyeke-Kanu
import { useState } from 'react';
import { FileText, Plus, Search, Filter, Download, Send, Clock, CheckCircle, AlertTriangle, MoreVertical, Edit, Trash2, Copy, Eye, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { ContractWizard, ContractDraft } from '@/components/legal';
import { ConfirmDialog } from '@/components/ConfirmDialog';
import { askAgent } from '@/lib/agentActions';
import { toast } from 'sonner';

interface Contract {
  id: string;
  title: string;
  type: 'service' | 'employment' | 'nda' | 'license' | 'partnership' | 'consulting';
  status: 'draft' | 'pending' | 'active' | 'expired' | 'terminated';
  parties: string[];
  value?: number;
  startDate: string;
  endDate?: string;
  lastModified: string;
  assignedAgent?: string;
  jurisdiction?: string;
}

const mockContracts: Contract[] = [
  {
    id: '1',
    title: 'Software Development Agreement',
    type: 'service',
    status: 'active',
    parties: ['Acme Corp', 'TechStart Inc'],
    value: 150000,
    startDate: '2024-01-15',
    endDate: '2024-12-31',
    lastModified: '2024-12-15',
    assignedAgent: 'Aria',
    jurisdiction: 'Delaware, USA',
  },
  {
    id: '2',
    title: 'Employee NDA - Marketing Team',
    type: 'nda',
    status: 'pending',
    parties: ['Company', 'New Hire'],
    startDate: '2024-12-20',
    lastModified: '2024-12-18',
    assignedAgent: 'Sage',
    jurisdiction: 'California, USA',
  },
  {
    id: '3',
    title: 'Office Lease Agreement',
    type: 'license',
    status: 'active',
    parties: ['Property Holdings LLC', 'Our Company'],
    value: 48000,
    startDate: '2024-06-01',
    endDate: '2027-05-31',
    lastModified: '2024-06-01',
    jurisdiction: 'New York, USA',
  },
  {
    id: '4',
    title: 'Strategic Partnership MOU',
    type: 'partnership',
    status: 'draft',
    parties: ['Our Company', 'Partner Co'],
    startDate: '2025-01-01',
    lastModified: '2024-12-19',
    assignedAgent: 'Atlas',
  },
];

const contractTemplates = [
  { id: 'service', name: 'Service Agreement', description: 'Standard service contract template' },
  { id: 'employment', name: 'Employment Contract', description: 'Full-time employment agreement' },
  { id: 'nda', name: 'Non-Disclosure Agreement', description: 'Mutual or one-way NDA' },
  { id: 'license', name: 'License Agreement', description: 'Software or IP licensing terms' },
  { id: 'partnership', name: 'Partnership Agreement', description: 'Business partnership terms' },
];

export default function ContractsPage() {
  const [contracts, setContracts] = useState<Contract[]>(mockContracts);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [wizardOpen, setWizardOpen] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState<{ open: boolean; id: string | null }>({ open: false, id: null });

  const getStatusColor = (status: Contract['status']) => {
    switch (status) {
      case 'active': return 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30';
      case 'pending': return 'bg-amber-500/20 text-amber-400 border-amber-500/30';
      case 'draft': return 'bg-blue-500/20 text-blue-400 border-blue-500/30';
      case 'expired': return 'bg-red-500/20 text-red-400 border-red-500/30';
      case 'terminated': return 'bg-muted text-muted-foreground border-border';
      default: return 'bg-muted text-muted-foreground border-border';
    }
  };

  const getStatusIcon = (status: Contract['status']) => {
    switch (status) {
      case 'active': return <CheckCircle className="h-3 w-3" />;
      case 'pending': return <Clock className="h-3 w-3" />;
      case 'expired': return <AlertTriangle className="h-3 w-3" />;
      default: return null;
    }
  };

  const filteredContracts = contracts.filter(contract => {
    const matchesSearch = contract.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      contract.parties.some(p => p.toLowerCase().includes(searchQuery.toLowerCase()));
    const matchesStatus = statusFilter === 'all' || contract.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const stats = {
    active: contracts.filter(c => c.status === 'active').length,
    pending: contracts.filter(c => c.status === 'pending').length,
    expiringSoon: contracts.filter(c => c.endDate && new Date(c.endDate) <= new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)).length,
    totalValue: contracts.reduce((sum, c) => sum + (c.value || 0), 0),
  };

  const handleWizardComplete = (draft: ContractDraft) => {
    const newContract: Contract = {
      id: draft.id,
      title: draft.title,
      type: draft.type as Contract['type'],
      status: 'draft',
      parties: [draft.party1, draft.party2],
      value: draft.value,
      startDate: draft.startDate,
      endDate: draft.endDate,
      lastModified: new Date().toISOString().split('T')[0],
      assignedAgent: draft.selectedAgents[0] ? draft.selectedAgents[0].charAt(0).toUpperCase() + draft.selectedAgents[0].slice(1) : undefined,
      jurisdiction: draft.jurisdiction,
    };
    setContracts(prev => [newContract, ...prev]);
    setWizardOpen(false);
  };

  const handleDelete = (id: string) => {
    setContracts(prev => prev.filter(c => c.id !== id));
    setDeleteConfirm({ open: false, id: null });
    toast.success('Contract deleted');
  };

  const handleDuplicate = (contract: Contract) => {
    const duplicate: Contract = {
      ...contract,
      id: crypto.randomUUID(),
      title: `${contract.title} (Copy)`,
      status: 'draft',
      lastModified: new Date().toISOString().split('T')[0],
    };
    setContracts(prev => [duplicate, ...prev]);
    toast.success('Contract duplicated');
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold font-display text-foreground">Contract Management</h1>
          <p className="text-muted-foreground text-sm">Generate, track, and manage all your contracts</p>
        </div>
        <Button className="gap-2" onClick={() => setWizardOpen(true)}>
          <Plus className="h-4 w-4" />
          New Contract
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="bg-card/50 border-border/50">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-emerald-500/20">
                <CheckCircle className="h-5 w-5 text-emerald-400" />
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">{stats.active}</p>
                <p className="text-xs text-muted-foreground">Active Contracts</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-card/50 border-border/50">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-amber-500/20">
                <Clock className="h-5 w-5 text-amber-400" />
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">{stats.pending}</p>
                <p className="text-xs text-muted-foreground">Pending Review</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-card/50 border-border/50">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-red-500/20">
                <AlertTriangle className="h-5 w-5 text-red-400" />
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">{stats.expiringSoon}</p>
                <p className="text-xs text-muted-foreground">Expiring Soon</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-card/50 border-border/50">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-primary/20">
                <FileText className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">${(stats.totalValue / 1000).toFixed(0)}k</p>
                <p className="text-xs text-muted-foreground">Total Value</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search contracts..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-[150px]">
            <Filter className="h-4 w-4 mr-2" />
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="active">Active</SelectItem>
            <SelectItem value="pending">Pending</SelectItem>
            <SelectItem value="draft">Draft</SelectItem>
            <SelectItem value="expired">Expired</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Contract List */}
      <div className="space-y-3">
        {filteredContracts.length === 0 ? (
          <Card className="bg-card/50">
            <CardContent className="p-8 text-center">
              <FileText className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
              <h3 className="font-semibold mb-2">No contracts found</h3>
              <p className="text-sm text-muted-foreground mb-4">
                {searchQuery ? 'Try a different search term' : 'Create your first contract to get started'}
              </p>
              {!searchQuery && (
                <Button onClick={() => setWizardOpen(true)}>
                  <Plus className="w-4 h-4 mr-2" />
                  Create Contract
                </Button>
              )}
            </CardContent>
          </Card>
        ) : (
          filteredContracts.map(contract => (
            <Card key={contract.id} className="bg-card/50 border-border/50 hover:bg-card/80 transition-colors">
              <CardContent className="p-4">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-start gap-3 flex-1">
                    <div className="p-2 rounded-lg bg-primary/10">
                      <FileText className="h-5 w-5 text-primary" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h3 className="font-semibold text-foreground">{contract.title}</h3>
                        <Badge variant="outline" className={getStatusColor(contract.status)}>
                          {getStatusIcon(contract.status)}
                          <span className="ml-1 capitalize">{contract.status}</span>
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground mt-1">
                        {contract.parties.join(' ↔ ')}
                      </p>
                      <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground flex-wrap">
                        <span>Started: {new Date(contract.startDate).toLocaleDateString()}</span>
                        {contract.endDate && (
                          <span>Ends: {new Date(contract.endDate).toLocaleDateString()}</span>
                        )}
                        {contract.value && (
                          <span className="text-primary font-medium">${contract.value.toLocaleString()}</span>
                        )}
                        {contract.jurisdiction && (
                          <Badge variant="secondary" className="text-xs">{contract.jurisdiction}</Badge>
                        )}
                        {contract.assignedAgent && (
                          <Badge variant="outline" className="text-xs">{contract.assignedAgent}</Badge>
                        )}
                      </div>
                    </div>
                  </div>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon" className="h-8 w-8">
                        <MoreVertical className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem>
                        <Eye className="h-4 w-4 mr-2" />
                        View Details
                      </DropdownMenuItem>
                      <DropdownMenuItem>
                        <Edit className="h-4 w-4 mr-2" />
                        Edit
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => handleDuplicate(contract)}>
                        <Copy className="h-4 w-4 mr-2" />
                        Duplicate
                      </DropdownMenuItem>
                      <DropdownMenuItem>
                        <Download className="h-4 w-4 mr-2" />
                        Download PDF
                      </DropdownMenuItem>
                      <DropdownMenuItem>
                        <Send className="h-4 w-4 mr-2" />
                        Send for Signature
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={() => askAgent(contract.assignedAgent || 'Aria', `Review "${contract.title}" and flag any risk before it moves to the next status`)}
                      >
                        <Sparkles className="h-4 w-4 mr-2" />
                        Ask {contract.assignedAgent || 'Aria'}
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem 
                        className="text-destructive focus:text-destructive"
                        onClick={() => setDeleteConfirm({ open: true, id: contract.id })}
                      >
                        <Trash2 className="h-4 w-4 mr-2" />
                        Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      {/* Templates Section */}
      <Card className="bg-card/50 border-border/50">
        <CardHeader>
          <CardTitle className="text-lg">Quick Templates</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
            {contractTemplates.map(template => (
              <Button
                key={template.id}
                variant="outline"
                className="h-auto py-4 flex-col gap-2"
                onClick={() => setWizardOpen(true)}
              >
                <FileText className="h-6 w-6 text-primary" />
                <span className="text-sm font-medium">{template.name}</span>
              </Button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Contract Wizard */}
      <ContractWizard
        open={wizardOpen}
        onOpenChange={setWizardOpen}
        onComplete={handleWizardComplete}
      />

      {/* Delete Confirmation */}
      <ConfirmDialog
        open={deleteConfirm.open}
        onOpenChange={(open) => setDeleteConfirm({ open, id: null })}
        title="Delete Contract"
        description="Are you sure you want to delete this contract? This action cannot be undone."
        confirmLabel="Delete"
        variant="destructive"
        onConfirm={() => deleteConfirm.id && handleDelete(deleteConfirm.id)}
      />
    </div>
  );
}
