// Contracts Page - Francis Okorie Iyeke-Kanu
import { useState } from 'react';
import { FileText, Plus, Search, Filter, Download, Send, Clock, CheckCircle, AlertTriangle, MoreVertical } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';

interface Contract {
  id: string;
  title: string;
  type: 'service' | 'employment' | 'nda' | 'license' | 'partnership';
  status: 'draft' | 'pending' | 'active' | 'expired' | 'terminated';
  parties: string[];
  value?: number;
  startDate: string;
  endDate?: string;
  lastModified: string;
  assignedAgent?: string;
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
  const [contracts] = useState<Contract[]>(mockContracts);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [isCreateOpen, setIsCreateOpen] = useState(false);

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

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold font-display text-foreground">Contract Management</h1>
          <p className="text-muted-foreground text-sm">Generate, track, and manage all your contracts</p>
        </div>
        <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
          <DialogTrigger asChild>
            <Button className="gap-2">
              <Plus className="h-4 w-4" />
              New Contract
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Create New Contract</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Contract Title</Label>
                  <Input placeholder="Enter contract title" />
                </div>
                <div className="space-y-2">
                  <Label>Template</Label>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="Select template" />
                    </SelectTrigger>
                    <SelectContent>
                      {contractTemplates.map(template => (
                        <SelectItem key={template.id} value={template.id}>
                          {template.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Party 1</Label>
                  <Input placeholder="First party name" />
                </div>
                <div className="space-y-2">
                  <Label>Party 2</Label>
                  <Input placeholder="Second party name" />
                </div>
              </div>
              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label>Start Date</Label>
                  <Input type="date" />
                </div>
                <div className="space-y-2">
                  <Label>End Date</Label>
                  <Input type="date" />
                </div>
                <div className="space-y-2">
                  <Label>Contract Value</Label>
                  <Input type="number" placeholder="0.00" />
                </div>
              </div>
              <div className="space-y-2">
                <Label>Special Terms</Label>
                <Textarea placeholder="Enter any special terms or conditions..." rows={3} />
              </div>
              <div className="space-y-2">
                <Label>Assign Agent</Label>
                <Select>
                  <SelectTrigger>
                    <SelectValue placeholder="Select agent" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="aria">Aria (Communications)</SelectItem>
                    <SelectItem value="sage">Sage (Researcher)</SelectItem>
                    <SelectItem value="atlas">Atlas (Planner)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="flex justify-end gap-2 pt-4">
                <Button variant="outline" onClick={() => setIsCreateOpen(false)}>Cancel</Button>
                <Button onClick={() => setIsCreateOpen(false)}>Generate Contract</Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
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
        {filteredContracts.map(contract => (
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
                    <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground">
                      <span>Started: {new Date(contract.startDate).toLocaleDateString()}</span>
                      {contract.endDate && (
                        <span>Ends: {new Date(contract.endDate).toLocaleDateString()}</span>
                      )}
                      {contract.value && (
                        <span className="text-primary font-medium">${contract.value.toLocaleString()}</span>
                      )}
                      {contract.assignedAgent && (
                        <Badge variant="secondary" className="text-xs">{contract.assignedAgent}</Badge>
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
                      <FileText className="h-4 w-4 mr-2" />
                      View Details
                    </DropdownMenuItem>
                    <DropdownMenuItem>
                      <Download className="h-4 w-4 mr-2" />
                      Download PDF
                    </DropdownMenuItem>
                    <DropdownMenuItem>
                      <Send className="h-4 w-4 mr-2" />
                      Send for Signature
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </CardContent>
          </Card>
        ))}
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
              >
                <FileText className="h-6 w-6 text-primary" />
                <span className="text-sm font-medium">{template.name}</span>
              </Button>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}