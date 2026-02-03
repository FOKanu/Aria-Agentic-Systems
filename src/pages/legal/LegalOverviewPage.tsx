// Legal Overview Page - Landing dashboard for Legal module
import { useState } from 'react';
import { Scale, FileText, Shield, Lightbulb, AlertTriangle, Clock, CheckCircle, Plus, Search, ArrowRight, Bot, Calendar, BookOpen, FileCheck } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { useNavigate } from 'react-router-dom';
import { cn } from '@/lib/utils';

interface LegalDraft {
  id: string;
  title: string;
  type: string;
  status: 'draft' | 'review' | 'pending_approval';
  lastModified: string;
  assignedAgent?: string;
}

interface RiskAlert {
  id: string;
  severity: 'high' | 'medium' | 'low';
  title: string;
  description: string;
  category: string;
}

const activeDrafts: LegalDraft[] = [
  { id: '1', title: 'Software Development Agreement', type: 'Service Contract', status: 'review', lastModified: '2 hours ago', assignedAgent: 'Aria' },
  { id: '2', title: 'Employee NDA - Marketing', type: 'NDA', status: 'pending_approval', lastModified: '1 day ago', assignedAgent: 'Sage' },
  { id: '3', title: 'Vendor Terms Update', type: 'License', status: 'draft', lastModified: '3 days ago' },
];

const riskAlerts: RiskAlert[] = [
  { id: '1', severity: 'high', title: 'Missing limitation of liability', category: 'Contracts', description: 'Software Development Agreement lacks liability cap clause' },
  { id: '2', severity: 'medium', title: 'Jurisdiction conflict', category: 'Compliance', description: 'EU GDPR clause missing in customer agreement' },
  { id: '3', severity: 'low', title: 'Contract expiring soon', category: 'Renewal', description: 'Office Lease expires in 30 days' },
];

const quickStats = {
  activeContracts: 12,
  pendingReview: 4,
  complianceScore: 87,
  expiringContracts: 2,
};

export default function LegalOverviewPage() {
  const navigate = useNavigate();

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'high': return 'bg-destructive/20 text-destructive border-destructive/30';
      case 'medium': return 'bg-warning/20 text-warning border-warning/30';
      case 'low': return 'bg-blue-500/20 text-blue-500 border-blue-500/30';
      default: return 'bg-muted text-muted-foreground';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'draft': return 'bg-muted text-muted-foreground';
      case 'review': return 'bg-blue-500/20 text-blue-500';
      case 'pending_approval': return 'bg-warning/20 text-warning';
      default: return 'bg-muted text-muted-foreground';
    }
  };

  return (
    <div className="space-y-6 animate-slide-up">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
            <Scale className="w-5 h-5 text-primary" />
          </div>
          <div>
            <h1 className="text-xl font-bold font-display">Legal Command Center</h1>
            <p className="text-sm text-muted-foreground">Contracts, compliance, and IP management</p>
          </div>
        </div>
      </div>

      {/* 3-Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column - Active Work */}
        <div className="space-y-4">
          <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">Active Work</h2>
          
          {/* Active Drafts */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <FileText className="w-4 h-4" />
                Active Drafts
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {activeDrafts.map(draft => (
                <div 
                  key={draft.id} 
                  className="p-3 rounded-lg border border-border hover:bg-secondary/50 transition-colors cursor-pointer"
                  onClick={() => navigate('/legal/contracts')}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-sm truncate">{draft.title}</p>
                      <p className="text-xs text-muted-foreground">{draft.type}</p>
                    </div>
                    <Badge variant="outline" className={cn('text-xs', getStatusColor(draft.status))}>
                      {draft.status.replace('_', ' ')}
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between mt-2 text-xs text-muted-foreground">
                    <span>{draft.lastModified}</span>
                    {draft.assignedAgent && (
                      <span className="flex items-center gap-1 text-primary">
                        <Bot className="w-3 h-3" />
                        {draft.assignedAgent}
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Pending Approvals */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <Clock className="w-4 h-4" />
                Pending Approvals
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center py-4 text-muted-foreground">
                <CheckCircle className="w-8 h-8 mx-auto mb-2 opacity-50" />
                <p className="text-sm">No pending approvals</p>
              </div>
            </CardContent>
          </Card>

          {/* External Reviews */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <FileCheck className="w-4 h-4" />
                External Reviews Required
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="p-3 rounded-lg border border-warning/30 bg-warning/10">
                <p className="text-sm font-medium">Partnership Agreement</p>
                <p className="text-xs text-muted-foreground">Awaiting external counsel review</p>
                <p className="text-xs text-warning mt-1">Due in 3 days</p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Center Column - Primary Actions */}
        <div className="space-y-4">
          <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">Quick Actions</h2>
          
          <div className="grid grid-cols-2 gap-3">
            <Button 
              variant="outline" 
              className="h-24 flex-col gap-2 hover:bg-primary/10 hover:border-primary"
              onClick={() => navigate('/legal/contracts')}
            >
              <FileText className="w-6 h-6 text-primary" />
              <span className="text-sm">Draft Contract</span>
            </Button>
            <Button 
              variant="outline" 
              className="h-24 flex-col gap-2 hover:bg-primary/10 hover:border-primary"
              onClick={() => navigate('/legal/document-review')}
            >
              <Search className="w-6 h-6 text-primary" />
              <span className="text-sm">Review Document</span>
            </Button>
            <Button 
              variant="outline" 
              className="h-24 flex-col gap-2 hover:bg-primary/10 hover:border-primary"
              onClick={() => navigate('/legal/nda-generator')}
            >
              <Shield className="w-6 h-6 text-primary" />
              <span className="text-sm">Generate NDA</span>
            </Button>
            <Button 
              variant="outline" 
              className="h-24 flex-col gap-2 hover:bg-primary/10 hover:border-primary"
              onClick={() => navigate('/legal/compliance')}
            >
              <CheckCircle className="w-6 h-6 text-primary" />
              <span className="text-sm">Compliance Check</span>
            </Button>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-2 gap-3">
            <Card>
              <CardContent className="pt-4">
                <div className="text-center">
                  <p className="text-2xl font-bold">{quickStats.activeContracts}</p>
                  <p className="text-xs text-muted-foreground">Active Contracts</p>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-4">
                <div className="text-center">
                  <p className="text-2xl font-bold text-warning">{quickStats.pendingReview}</p>
                  <p className="text-xs text-muted-foreground">Pending Review</p>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-4">
                <div className="text-center">
                  <p className="text-2xl font-bold text-success">{quickStats.complianceScore}%</p>
                  <p className="text-xs text-muted-foreground">Compliance Score</p>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-4">
                <div className="text-center">
                  <p className="text-2xl font-bold text-destructive">{quickStats.expiringContracts}</p>
                  <p className="text-xs text-muted-foreground">Expiring Soon</p>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Quick Navigation */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Explore Legal</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {[
                { label: 'Contract Library', path: '/legal/contracts', icon: BookOpen },
                { label: 'Compliance Monitor', path: '/legal/compliance', icon: Shield },
                { label: 'IP Registry', path: '/legal/ip-management', icon: Lightbulb },
                { label: 'Case Research', path: '/legal/case-research', icon: Search },
              ].map(item => (
                <Button 
                  key={item.path}
                  variant="ghost" 
                  className="w-full justify-between"
                  onClick={() => navigate(item.path)}
                >
                  <span className="flex items-center gap-2">
                    <item.icon className="w-4 h-4" />
                    {item.label}
                  </span>
                  <ArrowRight className="w-4 h-4" />
                </Button>
              ))}
            </CardContent>
          </Card>
        </div>

        {/* Right Column - Alerts & Intelligence */}
        <div className="space-y-4">
          <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">Risk & Alerts</h2>
          
          {/* Risk Alerts */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <AlertTriangle className="w-4 h-4" />
                Risk Alerts
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {riskAlerts.map(alert => (
                <div 
                  key={alert.id} 
                  className={cn(
                    'p-3 rounded-lg border',
                    getSeverityColor(alert.severity)
                  )}
                >
                  <div className="flex items-start gap-2">
                    <AlertTriangle className="w-4 h-4 mt-0.5 flex-shrink-0" />
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-sm">{alert.title}</p>
                      <p className="text-xs opacity-80">{alert.description}</p>
                      <Badge variant="secondary" className="mt-1 text-xs">
                        {alert.category}
                      </Badge>
                    </div>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Jurisdiction Updates */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <Scale className="w-4 h-4" />
                Regulation Updates
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <div className="p-3 rounded-lg border border-border">
                <p className="text-sm font-medium">GDPR Amendment</p>
                <p className="text-xs text-muted-foreground">New data transfer rules effective Q2 2025</p>
                <div className="flex items-center gap-2 mt-2">
                  <Badge variant="outline" className="text-xs">EU</Badge>
                  <span className="text-xs text-muted-foreground">Impact: Medium</span>
                </div>
              </div>
              <div className="p-3 rounded-lg border border-border">
                <p className="text-sm font-medium">California Privacy Rights Act</p>
                <p className="text-xs text-muted-foreground">Updated consent requirements</p>
                <div className="flex items-center gap-2 mt-2">
                  <Badge variant="outline" className="text-xs">US-CA</Badge>
                  <span className="text-xs text-muted-foreground">Impact: High</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Contract Expirations */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <Calendar className="w-4 h-4" />
                Upcoming Expirations
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <div className="p-3 rounded-lg border border-warning/30 bg-warning/5">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-medium">Office Lease Agreement</p>
                  <Badge variant="outline" className="bg-warning/20 text-warning border-warning/30 text-xs">
                    30 days
                  </Badge>
                </div>
                <p className="text-xs text-muted-foreground mt-1">Property Holdings LLC</p>
              </div>
              <div className="p-3 rounded-lg border border-blue-500/30 bg-blue-500/5">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-medium">Software License</p>
                  <Badge variant="outline" className="bg-blue-500/20 text-blue-500 border-blue-500/30 text-xs">
                    60 days
                  </Badge>
                </div>
                <p className="text-xs text-muted-foreground mt-1">Tech Vendor Inc</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
