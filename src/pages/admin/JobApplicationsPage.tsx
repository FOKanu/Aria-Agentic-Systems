import { useState } from 'react';
import { Briefcase, User, FileText, Search, Mail, Linkedin, Plus, Filter, MoreVertical, Edit, Trash2, Eye, Send, Clock, CheckCircle, XCircle, Bot, Target, MapPin, DollarSign, Building, GripVertical } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { ScrollArea } from '@/components/ui/scroll-area';
import { ConfirmDialog } from '@/components/ConfirmDialog';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

// Types
interface JobApplication {
  id: string;
  company: string;
  role: string;
  location: string;
  salary?: string;
  matchScore: number;
  status: 'discovered' | 'ready' | 'applied' | 'interview' | 'offer' | 'rejected';
  appliedDate?: string;
  source: string;
  riskFlags: string[];
  notes?: string;
}

interface UserProfile {
  name: string;
  email: string;
  phone: string;
  location: string;
  summary: string;
  targetRoles: string[];
  salaryMin: number;
  salaryMax: number;
  visaStatus: string;
  remotePreference: 'remote' | 'hybrid' | 'onsite' | 'any';
  workHistory: { company: string; role: string; duration: string }[];
  skills: string[];
}

interface OutreachMessage {
  id: string;
  type: 'email' | 'linkedin';
  recipient: string;
  company: string;
  subject?: string;
  status: 'draft' | 'scheduled' | 'sent' | 'replied';
  scheduledFor?: string;
}

// Mock Data
const mockApplications: JobApplication[] = [
  { id: '1', company: 'TechCorp', role: 'Senior Software Engineer', location: 'San Francisco, CA', salary: '$180k-$220k', matchScore: 92, status: 'interview', appliedDate: '2024-12-15', source: 'LinkedIn', riskFlags: [] },
  { id: '2', company: 'StartupXYZ', role: 'Full Stack Developer', location: 'Remote', salary: '$150k-$180k', matchScore: 88, status: 'applied', appliedDate: '2024-12-18', source: 'Indeed', riskFlags: ['Non-compete clause'] },
  { id: '3', company: 'MegaCorp', role: 'Engineering Manager', location: 'New York, NY', salary: '$200k-$250k', matchScore: 75, status: 'ready', source: 'Glassdoor', riskFlags: [] },
  { id: '4', company: 'DataInc', role: 'ML Engineer', location: 'Seattle, WA', salary: '$170k-$200k', matchScore: 85, status: 'discovered', source: 'Company Site', riskFlags: ['Arbitration clause'] },
  { id: '5', company: 'CloudBase', role: 'Platform Engineer', location: 'Austin, TX', salary: '$160k-$190k', matchScore: 90, status: 'offer', source: 'Referral', riskFlags: [] },
  { id: '6', company: 'FinTech Pro', role: 'Backend Developer', location: 'Chicago, IL', salary: '$140k-$170k', matchScore: 70, status: 'rejected', appliedDate: '2024-12-10', source: 'LinkedIn', riskFlags: [] },
];

const mockProfile: UserProfile = {
  name: 'Francis Okorie',
  email: 'francis@example.com',
  phone: '+1 (555) 123-4567',
  location: 'San Francisco, CA',
  summary: 'Experienced software engineer with 8+ years in full-stack development...',
  targetRoles: ['Senior Software Engineer', 'Staff Engineer', 'Engineering Manager'],
  salaryMin: 150000,
  salaryMax: 250000,
  visaStatus: 'US Citizen',
  remotePreference: 'hybrid',
  workHistory: [
    { company: 'Previous Corp', role: 'Senior Engineer', duration: '2020-2024' },
    { company: 'StartupABC', role: 'Software Engineer', duration: '2017-2020' },
  ],
  skills: ['TypeScript', 'React', 'Node.js', 'Python', 'AWS', 'PostgreSQL', 'GraphQL'],
};

const mockOutreach: OutreachMessage[] = [
  { id: '1', type: 'email', recipient: 'recruiter@techcorp.com', company: 'TechCorp', subject: 'Following up on my application', status: 'sent' },
  { id: '2', type: 'linkedin', recipient: 'Jane Smith (Hiring Manager)', company: 'MegaCorp', status: 'draft' },
  { id: '3', type: 'email', recipient: 'hr@cloudbase.com', company: 'CloudBase', subject: 'Thank you for the offer', status: 'scheduled', scheduledFor: '2024-12-22 09:00' },
];

const pipelineColumns = [
  { id: 'discovered', label: 'Discovered', color: 'bg-muted' },
  { id: 'ready', label: 'Ready to Apply', color: 'bg-blue-500/20' },
  { id: 'applied', label: 'Applied', color: 'bg-yellow-500/20' },
  { id: 'interview', label: 'Interview', color: 'bg-purple-500/20' },
  { id: 'offer', label: 'Offer', color: 'bg-green-500/20' },
  { id: 'rejected', label: 'Rejected', color: 'bg-red-500/20' },
];

export default function JobApplicationsPage() {
  const [applications, setApplications] = useState<JobApplication[]>(mockApplications);
  const [profile, setProfile] = useState<UserProfile>(mockProfile);
  const [outreach, setOutreach] = useState<OutreachMessage[]>(mockOutreach);
  const [activeTab, setActiveTab] = useState('pipeline');
  const [searchQuery, setSearchQuery] = useState('');
  const [profileDialogOpen, setProfileDialogOpen] = useState(false);
  const [applicationMode, setApplicationMode] = useState<'auto' | 'review' | 'manual'>('review');
  const [deleteConfirm, setDeleteConfirm] = useState<{ open: boolean; id: string | null }>({ open: false, id: null });

  const getStatusColor = (status: JobApplication['status']) => {
    const col = pipelineColumns.find(c => c.id === status);
    return col?.color || 'bg-muted';
  };

  const filteredApplications = applications.filter(app =>
    app.company.toLowerCase().includes(searchQuery.toLowerCase()) ||
    app.role.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const pipelineStats = pipelineColumns.map(col => ({
    ...col,
    count: applications.filter(a => a.status === col.id).length,
  }));

  const handleMoveApplication = (id: string, newStatus: JobApplication['status']) => {
    setApplications(prev => prev.map(app =>
      app.id === id ? { ...app, status: newStatus, appliedDate: newStatus === 'applied' ? new Date().toISOString().split('T')[0] : app.appliedDate } : app
    ));
    toast.success(`Application moved to ${pipelineColumns.find(c => c.id === newStatus)?.label}`);
  };

  const handleDeleteApplication = (id: string) => {
    setApplications(prev => prev.filter(app => app.id !== id));
    setDeleteConfirm({ open: false, id: null });
    toast.success('Application removed');
  };

  const handleApplyNow = (id: string) => {
    if (applicationMode === 'auto') {
      handleMoveApplication(id, 'applied');
      toast.success('Application submitted automatically');
    } else {
      toast.info('Please review before submitting');
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold font-display text-foreground">Job Applications</h1>
          <p className="text-muted-foreground text-sm">Automated job discovery and application pipeline</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => setProfileDialogOpen(true)}>
            <User className="h-4 w-4 mr-2" />
            Edit Profile
          </Button>
          <Button className="gap-2">
            <Search className="h-4 w-4" />
            Scan Jobs
          </Button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 md:grid-cols-6 gap-2">
        {pipelineStats.map(stat => (
          <Card key={stat.id} className={cn("bg-card/50 border-border/50", stat.color)}>
            <CardContent className="p-3 text-center">
              <p className="text-2xl font-bold">{stat.count}</p>
              <p className="text-xs text-muted-foreground">{stat.label}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Application Mode */}
      <Card className="bg-card/50 border-border/50">
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Bot className="w-5 h-5 text-primary" />
              <div>
                <p className="font-medium">Application Mode</p>
                <p className="text-xs text-muted-foreground">Control how applications are submitted</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <Label className={cn("text-sm cursor-pointer", applicationMode === 'manual' && "text-primary font-medium")} onClick={() => setApplicationMode('manual')}>
                Manual Only
              </Label>
              <Label className={cn("text-sm cursor-pointer", applicationMode === 'review' && "text-primary font-medium")} onClick={() => setApplicationMode('review')}>
                Review Required
              </Label>
              <Label className={cn("text-sm cursor-pointer", applicationMode === 'auto' && "text-primary font-medium")} onClick={() => setApplicationMode('auto')}>
                Fully Automated
              </Label>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Main Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="pipeline">Application Pipeline</TabsTrigger>
          <TabsTrigger value="discovery">Job Discovery</TabsTrigger>
          <TabsTrigger value="documents">Documents</TabsTrigger>
          <TabsTrigger value="outreach">Outreach & Follow-ups</TabsTrigger>
        </TabsList>

        {/* Pipeline Tab - Kanban View */}
        <TabsContent value="pipeline" className="space-y-4">
          <div className="flex gap-2 mb-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search applications..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>

          <ScrollArea className="w-full">
            <div className="flex gap-4 pb-4 min-w-max">
              {pipelineColumns.map(column => (
                <div key={column.id} className="w-72 flex-shrink-0">
                  <div className={cn("p-2 rounded-t-lg", column.color)}>
                    <h3 className="font-semibold text-sm flex items-center justify-between">
                      {column.label}
                      <Badge variant="secondary" className="text-xs">
                        {applications.filter(a => a.status === column.id).length}
                      </Badge>
                    </h3>
                  </div>
                  <div className="bg-muted/20 rounded-b-lg p-2 min-h-[400px] space-y-2">
                    {filteredApplications
                      .filter(app => app.status === column.id)
                      .map(app => (
                        <Card key={app.id} className="bg-card border-border/50 cursor-grab active:cursor-grabbing">
                          <CardContent className="p-3">
                            <div className="flex items-start justify-between">
                              <div className="flex-1">
                                <div className="flex items-center gap-2">
                                  <Building className="w-4 h-4 text-muted-foreground" />
                                  <span className="font-medium text-sm">{app.company}</span>
                                </div>
                                <p className="text-sm mt-1">{app.role}</p>
                                <div className="flex items-center gap-2 mt-2 text-xs text-muted-foreground">
                                  <MapPin className="w-3 h-3" />
                                  {app.location}
                                </div>
                                {app.salary && (
                                  <div className="flex items-center gap-2 mt-1 text-xs text-muted-foreground">
                                    <DollarSign className="w-3 h-3" />
                                    {app.salary}
                                  </div>
                                )}
                              </div>
                              <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                  <Button variant="ghost" size="icon" className="h-6 w-6">
                                    <MoreVertical className="h-3 w-3" />
                                  </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end">
                                  <DropdownMenuItem>
                                    <Eye className="h-4 w-4 mr-2" />
                                    View Details
                                  </DropdownMenuItem>
                                  {column.id === 'ready' && (
                                    <DropdownMenuItem onClick={() => handleApplyNow(app.id)}>
                                      <Send className="h-4 w-4 mr-2" />
                                      Apply Now
                                    </DropdownMenuItem>
                                  )}
                                  <DropdownMenuSeparator />
                                  {pipelineColumns.filter(c => c.id !== column.id).map(c => (
                                    <DropdownMenuItem key={c.id} onClick={() => handleMoveApplication(app.id, c.id as JobApplication['status'])}>
                                      Move to {c.label}
                                    </DropdownMenuItem>
                                  ))}
                                  <DropdownMenuSeparator />
                                  <DropdownMenuItem 
                                    className="text-destructive"
                                    onClick={() => setDeleteConfirm({ open: true, id: app.id })}
                                  >
                                    <Trash2 className="h-4 w-4 mr-2" />
                                    Remove
                                  </DropdownMenuItem>
                                </DropdownMenuContent>
                              </DropdownMenu>
                            </div>
                            
                            {/* Match Score */}
                            <div className="mt-3">
                              <div className="flex items-center justify-between text-xs mb-1">
                                <span className="flex items-center gap-1">
                                  <Target className="w-3 h-3" />
                                  Match
                                </span>
                                <span className={cn(
                                  "font-medium",
                                  app.matchScore >= 85 ? "text-green-500" :
                                  app.matchScore >= 70 ? "text-yellow-500" : "text-red-500"
                                )}>{app.matchScore}%</span>
                              </div>
                              <Progress value={app.matchScore} className="h-1" />
                            </div>

                            {/* Risk Flags */}
                            {app.riskFlags.length > 0 && (
                              <div className="mt-2 flex flex-wrap gap-1">
                                {app.riskFlags.map((flag, i) => (
                                  <Badge key={i} variant="outline" className="text-xs bg-red-500/10 text-red-500 border-red-500/30">
                                    ⚠️ {flag}
                                  </Badge>
                                ))}
                              </div>
                            )}

                            <div className="flex items-center justify-between mt-2 text-xs text-muted-foreground">
                              <span>{app.source}</span>
                              {app.appliedDate && <span>{app.appliedDate}</span>}
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                  </div>
                </div>
              ))}
            </div>
          </ScrollArea>
        </TabsContent>

        {/* Job Discovery Tab */}
        <TabsContent value="discovery" className="space-y-4">
          <Card className="bg-card/50 border-border/50">
            <CardHeader>
              <CardTitle className="text-lg">Job Discovery Settings</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Target Roles</Label>
                  <Input placeholder="Senior Engineer, Staff Engineer..." defaultValue={profile.targetRoles.join(', ')} />
                </div>
                <div className="space-y-2">
                  <Label>Locations</Label>
                  <Input placeholder="San Francisco, Remote..." defaultValue={profile.location} />
                </div>
                <div className="space-y-2">
                  <Label>Salary Range</Label>
                  <Input placeholder="$150k - $250k" defaultValue={`$${profile.salaryMin/1000}k - $${profile.salaryMax/1000}k`} />
                </div>
                <div className="space-y-2">
                  <Label>Work Preference</Label>
                  <Select defaultValue={profile.remotePreference}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="remote">Remote Only</SelectItem>
                      <SelectItem value="hybrid">Hybrid</SelectItem>
                      <SelectItem value="onsite">On-site</SelectItem>
                      <SelectItem value="any">Any</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="flex items-center justify-between pt-4">
                <div className="flex items-center gap-2">
                  <Switch id="auto-scan" />
                  <Label htmlFor="auto-scan">Auto-scan daily for new jobs</Label>
                </div>
                <Button>
                  <Search className="h-4 w-4 mr-2" />
                  Scan Now
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-card/50 border-border/50">
            <CardHeader>
              <CardTitle className="text-lg">Recently Discovered</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {applications.filter(a => a.status === 'discovered').map(app => (
                  <div key={app.id} className="flex items-center justify-between p-3 rounded-lg bg-muted/30 border border-border/50">
                    <div className="flex items-center gap-4">
                      <div className={cn(
                        "w-12 h-12 rounded-lg flex items-center justify-center text-lg font-bold",
                        app.matchScore >= 85 ? "bg-green-500/20 text-green-500" :
                        app.matchScore >= 70 ? "bg-yellow-500/20 text-yellow-500" : "bg-red-500/20 text-red-500"
                      )}>
                        {app.matchScore}%
                      </div>
                      <div>
                        <p className="font-medium">{app.role}</p>
                        <p className="text-sm text-muted-foreground">{app.company} • {app.location}</p>
                        {app.salary && <p className="text-sm text-primary">{app.salary}</p>}
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {app.riskFlags.length > 0 && (
                        <Badge variant="outline" className="text-xs bg-red-500/10 text-red-500">
                          {app.riskFlags.length} risk(s)
                        </Badge>
                      )}
                      <Button size="sm" variant="outline" onClick={() => handleMoveApplication(app.id, 'ready')}>
                        Add to Pipeline
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Documents Tab */}
        <TabsContent value="documents" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card className="bg-card/50 border-border/50">
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <FileText className="w-5 h-5 text-primary" />
                  Resume / CV
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="p-4 rounded-lg border-2 border-dashed border-border text-center">
                  <p className="text-sm text-muted-foreground mb-2">Current: resume_francis_2024.pdf</p>
                  <Button variant="outline" size="sm">
                    <Plus className="w-4 h-4 mr-2" />
                    Upload New
                  </Button>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Bot className="w-4 h-4 text-primary" />
                    <span className="text-sm">AI Optimization</span>
                  </div>
                  <Button size="sm" variant="outline">Optimize</Button>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-card/50 border-border/50">
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Mail className="w-5 h-5 text-primary" />
                  Cover Letter Templates
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {['General', 'Technical', 'Leadership'].map(template => (
                  <div key={template} className="flex items-center justify-between p-3 rounded-lg bg-muted/30">
                    <span className="text-sm font-medium">{template} Template</span>
                    <div className="flex gap-2">
                      <Button size="sm" variant="ghost">
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button size="sm" variant="ghost">
                        <Bot className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                ))}
                <Button variant="outline" className="w-full">
                  <Plus className="w-4 h-4 mr-2" />
                  Create Template
                </Button>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Outreach Tab */}
        <TabsContent value="outreach" className="space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="font-semibold">Outreach Messages</h3>
            <Button className="gap-2">
              <Plus className="w-4 h-4" />
              New Message
            </Button>
          </div>

          <div className="space-y-3">
            {outreach.map(msg => (
              <Card key={msg.id} className="bg-card/50 border-border/50">
                <CardContent className="p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      {msg.type === 'email' ? (
                        <Mail className="w-5 h-5 text-blue-500" />
                      ) : (
                        <Linkedin className="w-5 h-5 text-blue-600" />
                      )}
                      <div>
                        <p className="font-medium">{msg.recipient}</p>
                        <p className="text-sm text-muted-foreground">{msg.company}</p>
                        {msg.subject && <p className="text-sm text-muted-foreground mt-1">"{msg.subject}"</p>}
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant={
                        msg.status === 'sent' ? 'default' :
                        msg.status === 'replied' ? 'default' :
                        msg.status === 'scheduled' ? 'secondary' : 'outline'
                      } className={cn(
                        msg.status === 'replied' && 'bg-green-500/20 text-green-500'
                      )}>
                        {msg.status === 'scheduled' && msg.scheduledFor && (
                          <Clock className="w-3 h-3 mr-1" />
                        )}
                        {msg.status}
                      </Badge>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon">
                            <MoreVertical className="w-4 h-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem>
                            <Edit className="w-4 h-4 mr-2" />
                            Edit
                          </DropdownMenuItem>
                          {msg.status === 'draft' && (
                            <DropdownMenuItem>
                              <Send className="w-4 h-4 mr-2" />
                              Send Now
                            </DropdownMenuItem>
                          )}
                          <DropdownMenuItem className="text-destructive">
                            <Trash2 className="w-4 h-4 mr-2" />
                            Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          <Card className="bg-card/50 border-border/50">
            <CardHeader>
              <CardTitle className="text-lg">Follow-up Settings</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">Auto Follow-ups</p>
                  <p className="text-sm text-muted-foreground">Send automatic follow-up after 5 days</p>
                </div>
                <Switch />
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">Require Approval</p>
                  <p className="text-sm text-muted-foreground">Review messages before sending</p>
                </div>
                <Switch defaultChecked />
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Profile Dialog */}
      <Dialog open={profileDialogOpen} onOpenChange={setProfileDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Profile</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Full Name</Label>
                <Input defaultValue={profile.name} />
              </div>
              <div className="space-y-2">
                <Label>Email</Label>
                <Input defaultValue={profile.email} />
              </div>
              <div className="space-y-2">
                <Label>Phone</Label>
                <Input defaultValue={profile.phone} />
              </div>
              <div className="space-y-2">
                <Label>Location</Label>
                <Input defaultValue={profile.location} />
              </div>
            </div>
            <div className="space-y-2">
              <Label>Professional Summary</Label>
              <Textarea defaultValue={profile.summary} rows={3} />
            </div>
            <div className="space-y-2">
              <Label>Skills</Label>
              <Input defaultValue={profile.skills.join(', ')} />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Visa Status</Label>
                <Select defaultValue={profile.visaStatus}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="US Citizen">US Citizen</SelectItem>
                    <SelectItem value="Green Card">Green Card</SelectItem>
                    <SelectItem value="H1B">H1B Visa</SelectItem>
                    <SelectItem value="OPT">OPT</SelectItem>
                    <SelectItem value="Other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Remote Preference</Label>
                <Select defaultValue={profile.remotePreference}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="remote">Remote Only</SelectItem>
                    <SelectItem value="hybrid">Hybrid</SelectItem>
                    <SelectItem value="onsite">On-site</SelectItem>
                    <SelectItem value="any">Any</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setProfileDialogOpen(false)}>Cancel</Button>
            <Button onClick={() => { setProfileDialogOpen(false); toast.success('Profile updated'); }}>Save Changes</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <ConfirmDialog
        open={deleteConfirm.open}
        onOpenChange={(open) => setDeleteConfirm({ open, id: null })}
        title="Remove Application"
        description="Are you sure you want to remove this application from your pipeline?"
        confirmLabel="Remove"
        variant="destructive"
        onConfirm={() => deleteConfirm.id && handleDeleteApplication(deleteConfirm.id)}
      />
    </div>
  );
}
