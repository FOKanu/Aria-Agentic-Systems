// IP Management Page - Created by Francis Okorie Iyeke-Kanu
import { useState } from 'react';
import { Lightbulb, Plus, Search, Filter, Calendar, AlertTriangle, CheckCircle, Clock, FileText, Globe, Shield } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';

interface IPAsset {
  id: string;
  name: string;
  type: 'patent' | 'trademark' | 'copyright' | 'trade-secret';
  status: 'active' | 'pending' | 'expired' | 'abandoned';
  filingDate?: string;
  registrationDate?: string;
  expirationDate?: string;
  jurisdiction: string[];
  registrationNumber?: string;
  assignee: string;
  renewalDue?: string;
  value?: number;
}

const mockAssets: IPAsset[] = [
  {
    id: '1',
    name: 'AI-Powered Document Analysis System',
    type: 'patent',
    status: 'active',
    filingDate: '2022-03-15',
    registrationDate: '2023-09-20',
    expirationDate: '2042-03-15',
    jurisdiction: ['US', 'EU', 'JP'],
    registrationNumber: 'US11,234,567',
    assignee: 'Our Company',
    renewalDue: '2025-03-15',
    value: 500000,
  },
  {
    id: '2',
    name: 'AgentFlow™',
    type: 'trademark',
    status: 'active',
    filingDate: '2023-01-10',
    registrationDate: '2023-07-15',
    jurisdiction: ['US', 'EU'],
    registrationNumber: 'TM-87654321',
    assignee: 'Our Company',
    renewalDue: '2033-07-15',
  },
  {
    id: '3',
    name: 'Neural Network Optimization Method',
    type: 'patent',
    status: 'pending',
    filingDate: '2024-06-01',
    jurisdiction: ['US'],
    assignee: 'Our Company',
  },
  {
    id: '4',
    name: 'Platform Source Code',
    type: 'copyright',
    status: 'active',
    registrationDate: '2022-01-01',
    jurisdiction: ['US'],
    registrationNumber: 'TX-0002345678',
    assignee: 'Our Company',
  },
  {
    id: '5',
    name: 'Proprietary Training Dataset',
    type: 'trade-secret',
    status: 'active',
    jurisdiction: ['US'],
    assignee: 'Our Company',
  },
];

const upcomingRenewals = [
  { asset: 'AI-Powered Document Analysis System', type: 'patent', dueDate: '2025-03-15', cost: 1500 },
  { asset: 'AgentFlow™ (EU)', type: 'trademark', dueDate: '2025-07-15', cost: 800 },
  { asset: 'Mobile App Design Patent', type: 'patent', dueDate: '2025-09-01', cost: 1200 },
];

export default function IPManagementPage() {
  const [assets] = useState<IPAsset[]>(mockAssets);
  const [searchQuery, setSearchQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [isAddOpen, setIsAddOpen] = useState(false);

  const getTypeIcon = (type: IPAsset['type']) => {
    switch (type) {
      case 'patent': return <Lightbulb className="h-5 w-5" />;
      case 'trademark': return <Shield className="h-5 w-5" />;
      case 'copyright': return <FileText className="h-5 w-5" />;
      case 'trade-secret': return <Globe className="h-5 w-5" />;
      default: return <FileText className="h-5 w-5" />;
    }
  };

  const getTypeColor = (type: IPAsset['type']) => {
    switch (type) {
      case 'patent': return 'bg-blue-500/20 text-blue-400';
      case 'trademark': return 'bg-purple-500/20 text-purple-400';
      case 'copyright': return 'bg-emerald-500/20 text-emerald-400';
      case 'trade-secret': return 'bg-amber-500/20 text-amber-400';
      default: return 'bg-muted text-muted-foreground';
    }
  };

  const getStatusColor = (status: IPAsset['status']) => {
    switch (status) {
      case 'active': return 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30';
      case 'pending': return 'bg-amber-500/20 text-amber-400 border-amber-500/30';
      case 'expired': return 'bg-red-500/20 text-red-400 border-red-500/30';
      case 'abandoned': return 'bg-muted text-muted-foreground border-border';
      default: return 'bg-muted text-muted-foreground border-border';
    }
  };

  const filteredAssets = assets.filter(asset => {
    const matchesSearch = asset.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesType = typeFilter === 'all' || asset.type === typeFilter;
    return matchesSearch && matchesType;
  });

  const stats = {
    patents: assets.filter(a => a.type === 'patent').length,
    trademarks: assets.filter(a => a.type === 'trademark').length,
    copyrights: assets.filter(a => a.type === 'copyright').length,
    tradeSecrets: assets.filter(a => a.type === 'trade-secret').length,
    totalValue: assets.reduce((sum, a) => sum + (a.value || 0), 0),
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold font-display text-foreground">IP Management</h1>
          <p className="text-muted-foreground text-sm">Track and manage intellectual property assets</p>
        </div>
        <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
          <DialogTrigger asChild>
            <Button className="gap-2">
              <Plus className="h-4 w-4" />
              Add IP Asset
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle>Register IP Asset</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label>Asset Name</Label>
                <Input placeholder="Enter asset name" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Type</Label>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="Select type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="patent">Patent</SelectItem>
                      <SelectItem value="trademark">Trademark</SelectItem>
                      <SelectItem value="copyright">Copyright</SelectItem>
                      <SelectItem value="trade-secret">Trade Secret</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Status</Label>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="Select status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="pending">Pending</SelectItem>
                      <SelectItem value="active">Active</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="space-y-2">
                <Label>Registration Number</Label>
                <Input placeholder="Enter registration number (if available)" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Filing Date</Label>
                  <Input type="date" />
                </div>
                <div className="space-y-2">
                  <Label>Registration Date</Label>
                  <Input type="date" />
                </div>
              </div>
              <div className="space-y-2">
                <Label>Description</Label>
                <Textarea placeholder="Brief description of the IP asset..." rows={3} />
              </div>
              <div className="flex justify-end gap-2 pt-4">
                <Button variant="outline" onClick={() => setIsAddOpen(false)}>Cancel</Button>
                <Button onClick={() => setIsAddOpen(false)}>Register Asset</Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <Card className="bg-card/50 border-border/50">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-blue-500/20">
                <Lightbulb className="h-5 w-5 text-blue-400" />
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">{stats.patents}</p>
                <p className="text-xs text-muted-foreground">Patents</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-card/50 border-border/50">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-purple-500/20">
                <Shield className="h-5 w-5 text-purple-400" />
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">{stats.trademarks}</p>
                <p className="text-xs text-muted-foreground">Trademarks</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-card/50 border-border/50">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-emerald-500/20">
                <FileText className="h-5 w-5 text-emerald-400" />
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">{stats.copyrights}</p>
                <p className="text-xs text-muted-foreground">Copyrights</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-card/50 border-border/50">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-amber-500/20">
                <Globe className="h-5 w-5 text-amber-400" />
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">{stats.tradeSecrets}</p>
                <p className="text-xs text-muted-foreground">Trade Secrets</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-card/50 border-border/50">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-primary/20">
                <Lightbulb className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">${(stats.totalValue / 1000).toFixed(0)}k</p>
                <p className="text-xs text-muted-foreground">Est. Value</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <Tabs defaultValue="assets" className="space-y-4">
        <div className="flex items-center justify-between">
          <TabsList>
            <TabsTrigger value="assets">IP Assets</TabsTrigger>
            <TabsTrigger value="renewals">Renewals</TabsTrigger>
            <TabsTrigger value="timeline">Timeline</TabsTrigger>
          </TabsList>
          <div className="flex gap-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search assets..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 w-[200px]"
              />
            </div>
            <Select value={typeFilter} onValueChange={setTypeFilter}>
              <SelectTrigger className="w-[150px]">
                <Filter className="h-4 w-4 mr-2" />
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="patent">Patents</SelectItem>
                <SelectItem value="trademark">Trademarks</SelectItem>
                <SelectItem value="copyright">Copyrights</SelectItem>
                <SelectItem value="trade-secret">Trade Secrets</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <TabsContent value="assets" className="space-y-4">
          <div className="grid gap-4">
            {filteredAssets.map(asset => (
              <Card key={asset.id} className="bg-card/50 border-border/50">
                <CardContent className="p-4">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex items-start gap-4 flex-1">
                      <div className={`p-2 rounded-lg ${getTypeColor(asset.type)}`}>
                        {getTypeIcon(asset.type)}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <h3 className="font-semibold text-foreground">{asset.name}</h3>
                          <Badge className={getTypeColor(asset.type)}>
                            {asset.type.replace('-', ' ')}
                          </Badge>
                          <Badge variant="outline" className={getStatusColor(asset.status)}>
                            {asset.status === 'active' && <CheckCircle className="h-3 w-3 mr-1" />}
                            {asset.status === 'pending' && <Clock className="h-3 w-3 mr-1" />}
                            {asset.status}
                          </Badge>
                        </div>
                        {asset.registrationNumber && (
                          <p className="text-sm text-muted-foreground mt-1">
                            Reg: {asset.registrationNumber}
                          </p>
                        )}
                        <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground flex-wrap">
                          {asset.jurisdiction && (
                            <span className="flex items-center gap-1">
                              <Globe className="h-3 w-3" />
                              {asset.jurisdiction.join(', ')}
                            </span>
                          )}
                          {asset.filingDate && (
                            <span>Filed: {new Date(asset.filingDate).toLocaleDateString()}</span>
                          )}
                          {asset.expirationDate && (
                            <span>Expires: {new Date(asset.expirationDate).toLocaleDateString()}</span>
                          )}
                          {asset.value && (
                            <span className="text-primary font-medium">${asset.value.toLocaleString()}</span>
                          )}
                        </div>
                      </div>
                    </div>
                    <Button variant="outline" size="sm">View Details</Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="renewals" className="space-y-4">
          <Card className="bg-card/50 border-border/50">
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Calendar className="h-5 w-5 text-primary" />
                Upcoming Renewals
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {upcomingRenewals.map((renewal, i) => (
                  <div key={i} className="flex items-center justify-between p-4 rounded-lg bg-muted/30 border border-border/50">
                    <div className="flex items-center gap-4">
                      <div className="text-center">
                        <p className="text-2xl font-bold text-primary">
                          {new Date(renewal.dueDate).getDate()}
                        </p>
                        <p className="text-xs text-muted-foreground uppercase">
                          {new Date(renewal.dueDate).toLocaleString('default', { month: 'short' })}
                        </p>
                      </div>
                      <div>
                        <p className="font-medium text-foreground">{renewal.asset}</p>
                        <div className="flex items-center gap-2 mt-1">
                          <Badge variant="secondary" className="text-xs capitalize">{renewal.type}</Badge>
                          <span className="text-sm text-muted-foreground">${renewal.cost} renewal fee</span>
                        </div>
                      </div>
                    </div>
                    <Button size="sm">Schedule Renewal</Button>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="timeline" className="space-y-4">
          <Card className="bg-card/50 border-border/50">
            <CardHeader>
              <CardTitle className="text-lg">IP Portfolio Timeline</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {assets
                  .filter(a => a.filingDate || a.registrationDate)
                  .sort((a, b) => new Date(b.filingDate || b.registrationDate || 0).getTime() - new Date(a.filingDate || a.registrationDate || 0).getTime())
                  .map(asset => (
                    <div key={asset.id} className="flex items-start gap-4">
                      <div className="flex flex-col items-center">
                        <div className={`w-3 h-3 rounded-full ${getTypeColor(asset.type).replace('bg-', 'bg-').replace('/20', '')}`} />
                        <div className="w-0.5 h-full bg-border" />
                      </div>
                      <div className="flex-1 pb-4">
                        <div className="flex items-center gap-2">
                          <p className="font-medium text-foreground">{asset.name}</p>
                          <Badge variant="outline" className={getStatusColor(asset.status)}>
                            {asset.status}
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground mt-1">
                          {asset.registrationDate 
                            ? `Registered ${new Date(asset.registrationDate).toLocaleDateString()}`
                            : `Filed ${new Date(asset.filingDate!).toLocaleDateString()}`
                          }
                        </p>
                      </div>
                    </div>
                  ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}