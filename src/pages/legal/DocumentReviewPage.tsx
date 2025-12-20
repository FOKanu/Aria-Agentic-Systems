// Document Review Page - Developed by Francis Okorie Iyeke-Kanu
import { useState } from 'react';
import { FileSearch, Upload, AlertTriangle, CheckCircle, Clock, Shield, Eye, Download, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';

interface ReviewItem {
  id: string;
  documentName: string;
  documentType: string;
  uploadedAt: string;
  status: 'queued' | 'analyzing' | 'completed' | 'flagged';
  riskLevel?: 'low' | 'medium' | 'high' | 'critical';
  issues?: number;
  recommendations?: number;
  assignedAgent?: string;
  progress?: number;
}

interface RiskFinding {
  id: string;
  category: string;
  severity: 'info' | 'warning' | 'critical';
  clause: string;
  issue: string;
  recommendation: string;
  pageNumber: number;
}

const mockReviews: ReviewItem[] = [
  {
    id: '1',
    documentName: 'Vendor Agreement - TechSupply.pdf',
    documentType: 'Service Agreement',
    uploadedAt: '2024-12-19T10:30:00',
    status: 'completed',
    riskLevel: 'medium',
    issues: 3,
    recommendations: 5,
    assignedAgent: 'Sage',
  },
  {
    id: '2',
    documentName: 'Employee Contract - J.Smith.docx',
    documentType: 'Employment Contract',
    uploadedAt: '2024-12-19T14:15:00',
    status: 'analyzing',
    progress: 65,
    assignedAgent: 'Pixel',
  },
  {
    id: '3',
    documentName: 'Lease Amendment 2024.pdf',
    documentType: 'Lease Agreement',
    uploadedAt: '2024-12-18T09:00:00',
    status: 'flagged',
    riskLevel: 'high',
    issues: 7,
    recommendations: 4,
    assignedAgent: 'Sage',
  },
  {
    id: '4',
    documentName: 'Software License - Enterprise.pdf',
    documentType: 'License Agreement',
    uploadedAt: '2024-12-20T08:00:00',
    status: 'queued',
  },
];

const mockFindings: RiskFinding[] = [
  {
    id: '1',
    category: 'Liability',
    severity: 'critical',
    clause: '7.2 Limitation of Liability',
    issue: 'Unlimited liability exposure for indirect damages',
    recommendation: 'Add cap on liability equal to 12 months of fees paid',
    pageNumber: 12,
  },
  {
    id: '2',
    category: 'Termination',
    severity: 'warning',
    clause: '9.1 Termination for Convenience',
    issue: 'No cure period before termination for material breach',
    recommendation: 'Include 30-day cure period for material breach',
    pageNumber: 15,
  },
  {
    id: '3',
    category: 'IP Rights',
    severity: 'critical',
    clause: '5.3 Intellectual Property',
    issue: 'Broad IP assignment clause includes pre-existing IP',
    recommendation: 'Exclude pre-existing IP and limit to work product only',
    pageNumber: 8,
  },
  {
    id: '4',
    category: 'Confidentiality',
    severity: 'info',
    clause: '6.1 Confidential Information',
    issue: 'Standard confidentiality period of 2 years',
    recommendation: 'Consider extending to 5 years for trade secrets',
    pageNumber: 10,
  },
];

export default function DocumentReviewPage() {
  const [reviews] = useState<ReviewItem[]>(mockReviews);
  const [selectedReview, setSelectedReview] = useState<ReviewItem | null>(mockReviews[0]);
  const [findings] = useState<RiskFinding[]>(mockFindings);

  const getStatusColor = (status: ReviewItem['status']) => {
    switch (status) {
      case 'completed': return 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30';
      case 'analyzing': return 'bg-blue-500/20 text-blue-400 border-blue-500/30';
      case 'flagged': return 'bg-red-500/20 text-red-400 border-red-500/30';
      case 'queued': return 'bg-muted text-muted-foreground border-border';
      default: return 'bg-muted text-muted-foreground border-border';
    }
  };

  const getRiskColor = (risk?: ReviewItem['riskLevel']) => {
    switch (risk) {
      case 'critical': return 'bg-red-500/20 text-red-400';
      case 'high': return 'bg-orange-500/20 text-orange-400';
      case 'medium': return 'bg-amber-500/20 text-amber-400';
      case 'low': return 'bg-emerald-500/20 text-emerald-400';
      default: return 'bg-muted text-muted-foreground';
    }
  };

  const getSeverityColor = (severity: RiskFinding['severity']) => {
    switch (severity) {
      case 'critical': return 'bg-red-500/20 text-red-400 border-red-500/30';
      case 'warning': return 'bg-amber-500/20 text-amber-400 border-amber-500/30';
      case 'info': return 'bg-blue-500/20 text-blue-400 border-blue-500/30';
      default: return 'bg-muted text-muted-foreground border-border';
    }
  };

  const stats = {
    totalReviewed: reviews.filter(r => r.status === 'completed').length,
    inProgress: reviews.filter(r => r.status === 'analyzing').length,
    flagged: reviews.filter(r => r.status === 'flagged').length,
    queued: reviews.filter(r => r.status === 'queued').length,
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold font-display text-foreground">Document Review</h1>
          <p className="text-muted-foreground text-sm">AI-powered contract analysis and risk detection</p>
        </div>
        <Button className="gap-2">
          <Upload className="h-4 w-4" />
          Upload Document
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
                <p className="text-2xl font-bold text-foreground">{stats.totalReviewed}</p>
                <p className="text-xs text-muted-foreground">Reviewed</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-card/50 border-border/50">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-blue-500/20">
                <Sparkles className="h-5 w-5 text-blue-400" />
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">{stats.inProgress}</p>
                <p className="text-xs text-muted-foreground">Analyzing</p>
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
                <p className="text-2xl font-bold text-foreground">{stats.flagged}</p>
                <p className="text-xs text-muted-foreground">Flagged</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-card/50 border-border/50">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-muted">
                <Clock className="h-5 w-5 text-muted-foreground" />
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">{stats.queued}</p>
                <p className="text-xs text-muted-foreground">In Queue</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Document List */}
        <Card className="bg-card/50 border-border/50 lg:col-span-1">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg flex items-center gap-2">
              <FileSearch className="h-5 w-5 text-primary" />
              Review Queue
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <ScrollArea className="h-[500px]">
              <div className="space-y-1 p-3">
                {reviews.map(review => (
                  <div
                    key={review.id}
                    onClick={() => setSelectedReview(review)}
                    className={`p-3 rounded-lg cursor-pointer transition-colors ${
                      selectedReview?.id === review.id 
                        ? 'bg-primary/10 border border-primary/30' 
                        : 'hover:bg-muted/50'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-sm text-foreground truncate">
                          {review.documentName}
                        </p>
                        <p className="text-xs text-muted-foreground">{review.documentType}</p>
                      </div>
                      <Badge variant="outline" className={`${getStatusColor(review.status)} text-xs shrink-0`}>
                        {review.status}
                      </Badge>
                    </div>
                    {review.status === 'analyzing' && review.progress && (
                      <div className="mt-2">
                        <Progress value={review.progress} className="h-1" />
                        <p className="text-xs text-muted-foreground mt-1">{review.progress}% complete</p>
                      </div>
                    )}
                    {review.riskLevel && (
                      <div className="flex items-center gap-2 mt-2">
                        <Badge className={`${getRiskColor(review.riskLevel)} text-xs`}>
                          {review.riskLevel} risk
                        </Badge>
                        {review.issues && (
                          <span className="text-xs text-muted-foreground">{review.issues} issues</span>
                        )}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </ScrollArea>
          </CardContent>
        </Card>

        {/* Review Details */}
        <Card className="bg-card/50 border-border/50 lg:col-span-2">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg">Analysis Results</CardTitle>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" className="gap-2">
                  <Eye className="h-4 w-4" />
                  View Document
                </Button>
                <Button variant="outline" size="sm" className="gap-2">
                  <Download className="h-4 w-4" />
                  Export Report
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {selectedReview ? (
              <Tabs defaultValue="findings" className="space-y-4">
                <TabsList>
                  <TabsTrigger value="findings">Risk Findings</TabsTrigger>
                  <TabsTrigger value="summary">Summary</TabsTrigger>
                  <TabsTrigger value="clauses">Key Clauses</TabsTrigger>
                </TabsList>
                
                <TabsContent value="findings" className="space-y-3">
                  {findings.map(finding => (
                    <Card key={finding.id} className="bg-muted/30 border-border/50">
                      <CardContent className="p-4">
                        <div className="flex items-start justify-between gap-4">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                              <Badge variant="outline" className={getSeverityColor(finding.severity)}>
                                {finding.severity === 'critical' && <AlertTriangle className="h-3 w-3 mr-1" />}
                                {finding.severity}
                              </Badge>
                              <Badge variant="secondary">{finding.category}</Badge>
                              <span className="text-xs text-muted-foreground">Page {finding.pageNumber}</span>
                            </div>
                            <p className="font-medium text-foreground text-sm">{finding.clause}</p>
                            <p className="text-sm text-muted-foreground mt-1">{finding.issue}</p>
                            <div className="mt-3 p-3 rounded-lg bg-primary/5 border border-primary/20">
                              <p className="text-xs text-primary font-medium mb-1">Recommendation</p>
                              <p className="text-sm text-foreground">{finding.recommendation}</p>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </TabsContent>

                <TabsContent value="summary" className="space-y-4">
                  <Card className="bg-muted/30 border-border/50">
                    <CardContent className="p-4">
                      <h4 className="font-medium text-foreground mb-3">Document Overview</h4>
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <p className="text-muted-foreground">Document Type</p>
                          <p className="font-medium text-foreground">{selectedReview.documentType}</p>
                        </div>
                        <div>
                          <p className="text-muted-foreground">Risk Level</p>
                          <Badge className={getRiskColor(selectedReview.riskLevel)}>
                            {selectedReview.riskLevel || 'Pending'}
                          </Badge>
                        </div>
                        <div>
                          <p className="text-muted-foreground">Issues Found</p>
                          <p className="font-medium text-foreground">{selectedReview.issues || 0}</p>
                        </div>
                        <div>
                          <p className="text-muted-foreground">Recommendations</p>
                          <p className="font-medium text-foreground">{selectedReview.recommendations || 0}</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                  <Card className="bg-muted/30 border-border/50">
                    <CardContent className="p-4">
                      <h4 className="font-medium text-foreground mb-3">AI Summary</h4>
                      <p className="text-sm text-muted-foreground">
                        This service agreement contains several clauses that require attention before signing. 
                        The liability provisions are particularly concerning with unlimited exposure for indirect damages. 
                        The IP assignment clause is overly broad and may affect pre-existing intellectual property. 
                        Recommend negotiating these terms before execution.
                      </p>
                    </CardContent>
                  </Card>
                </TabsContent>

                <TabsContent value="clauses" className="space-y-3">
                  <div className="grid gap-3">
                    {['Term & Renewal', 'Payment Terms', 'Confidentiality', 'Warranties', 'Indemnification'].map((clause, i) => (
                      <Card key={i} className="bg-muted/30 border-border/50">
                        <CardContent className="p-4">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                              <Shield className="h-5 w-5 text-primary" />
                              <div>
                                <p className="font-medium text-foreground">{clause}</p>
                                <p className="text-xs text-muted-foreground">Standard terms identified</p>
                              </div>
                            </div>
                            <Button variant="ghost" size="sm">View</Button>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </TabsContent>
              </Tabs>
            ) : (
              <div className="flex flex-col items-center justify-center h-64 text-muted-foreground">
                <FileSearch className="h-12 w-12 mb-4 opacity-50" />
                <p>Select a document to view analysis</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}