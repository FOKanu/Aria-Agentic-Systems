import { useState } from 'react';
import { Workflow, Plus, Play, Clock, Zap, Search, Filter } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { toast } from 'sonner';
import { WorkflowCard, WorkflowItem } from '@/components/workflows/WorkflowCard';
import { WorkflowFormDialog, WorkflowFormData } from '@/components/workflows/WorkflowFormDialog';
import { ConfirmDialog } from '@/components/ConfirmDialog';

const initialWorkflows: WorkflowItem[] = [
  { id: '1', name: 'Daily Report Generator', description: 'Generate and email daily summary reports', trigger: 'Every day at 8:00 AM', triggerType: 'schedule', actions: ['Collect metrics', 'Generate PDF', 'Send email'], isActive: true, lastRun: '2 hours ago', runCount: 45, status: 'success' },
  { id: '2', name: 'New Lead Notification', description: 'Alert team when new leads come in', trigger: 'When new contact is added', triggerType: 'event', actions: ['Filter by source', 'Send Slack message', 'Create task'], isActive: true, lastRun: 'Yesterday', runCount: 127, status: 'success' },
  { id: '3', name: 'File Backup Automation', description: 'Backup important files to cloud storage', trigger: 'Weekly on Sunday', triggerType: 'schedule', actions: ['Scan folders', 'Compress files', 'Upload to S3'], isActive: false, lastRun: '5 days ago', runCount: 23, status: 'idle' },
  { id: '4', name: 'Meeting Notes Processor', description: 'Transcribe and summarize meeting recordings', trigger: 'When recording is uploaded', triggerType: 'event', actions: ['Transcribe audio', 'Summarize with AI', 'Share notes'], isActive: true, lastRun: '3 hours ago', runCount: 89, status: 'warning' },
  { id: '5', name: 'Invoice Reminder', description: 'Send payment reminders for overdue invoices', trigger: '3 days before due date', triggerType: 'schedule', actions: ['Check invoice status', 'Draft reminder', 'Send email'], isActive: true, lastRun: '1 day ago', runCount: 34, status: 'success' },
];

type FilterType = 'all' | 'active' | 'paused';

export function WorkflowsPage() {
  const [workflows, setWorkflows] = useState<WorkflowItem[]>(initialWorkflows);
  const [filter, setFilter] = useState<FilterType>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [formOpen, setFormOpen] = useState(false);
  const [editingWorkflow, setEditingWorkflow] = useState<WorkflowItem | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<{ open: boolean; id: string | null }>({ open: false, id: null });

  // Filter and search workflows
  const filteredWorkflows = workflows.filter(w => {
    const matchesFilter = filter === 'all' || (filter === 'active' && w.isActive) || (filter === 'paused' && !w.isActive);
    const matchesSearch = !searchQuery || 
      w.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      w.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  const toggleWorkflow = (id: string) => {
    setWorkflows(prev => prev.map(w => 
      w.id === id ? { ...w, isActive: !w.isActive, status: !w.isActive ? w.status : 'idle' } as WorkflowItem : w
    ));
    const workflow = workflows.find(w => w.id === id);
    toast.success(workflow?.isActive ? 'Workflow paused' : 'Workflow activated');
  };

  const handleSave = (data: WorkflowFormData) => {
    if (data.id) {
      // Update existing
      setWorkflows(prev => prev.map(w => 
        w.id === data.id ? { ...w, ...data } : w
      ));
      toast.success('Workflow updated');
    } else {
      // Create new
      const newWorkflow: WorkflowItem = {
        id: crypto.randomUUID(),
        name: data.name,
        description: data.description,
        trigger: data.trigger,
        triggerType: data.triggerType,
        actions: data.actions,
        isActive: true,
        runCount: 0,
        status: 'idle',
      };
      setWorkflows(prev => [newWorkflow, ...prev]);
      toast.success('Workflow created');
    }
    setEditingWorkflow(null);
  };

  const handleEdit = (workflow: WorkflowItem) => {
    setEditingWorkflow(workflow);
    setFormOpen(true);
  };

  const handleDelete = (id: string) => {
    setWorkflows(prev => prev.filter(w => w.id !== id));
    setDeleteConfirm({ open: false, id: null });
    toast.success('Workflow deleted');
  };

  const handleDuplicate = (workflow: WorkflowItem) => {
    const duplicate: WorkflowItem = {
      ...workflow,
      id: crypto.randomUUID(),
      name: `${workflow.name} (Copy)`,
      runCount: 0,
      lastRun: undefined,
      status: 'idle',
    };
    setWorkflows(prev => [duplicate, ...prev]);
    toast.success('Workflow duplicated');
  };

  const handleRunNow = (id: string) => {
    const workflow = workflows.find(w => w.id === id);
    if (workflow) {
      toast.success(`Running "${workflow.name}"...`);
      // Simulate run
      setTimeout(() => {
        setWorkflows(prev => prev.map(w => 
          w.id === id ? { ...w, runCount: w.runCount + 1, lastRun: 'Just now', status: 'success' as const } : w
        ));
        toast.success(`"${workflow.name}" completed successfully`);
      }, 2000);
    }
  };

  const handleCreateNew = () => {
    setEditingWorkflow(null);
    setFormOpen(true);
  };

  const activeCount = workflows.filter(w => w.isActive).length;
  const totalRuns = workflows.reduce((acc, w) => acc + w.runCount, 0);

  return (
    <div className="space-y-6 animate-slide-up">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
            <Workflow className="w-5 h-5 text-primary" />
          </div>
          <div>
            <h1 className="text-xl font-bold font-display">Workflows</h1>
            <p className="text-sm text-muted-foreground">Automate repetitive tasks</p>
          </div>
        </div>
        <Button className="gap-2" onClick={handleCreateNew}>
          <Plus className="w-4 h-4" />
          Create Workflow
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-green-500/10 flex items-center justify-center">
                <Play className="w-5 h-5 text-green-500" />
              </div>
              <div>
                <p className="text-2xl font-bold">{activeCount}</p>
                <p className="text-xs text-muted-foreground">Active Workflows</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                <Zap className="w-5 h-5 text-primary" />
              </div>
              <div>
                <p className="text-2xl font-bold">{totalRuns}</p>
                <p className="text-xs text-muted-foreground">Total Runs</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-blue-500/10 flex items-center justify-center">
                <Clock className="w-5 h-5 text-blue-500" />
              </div>
              <div>
                <p className="text-2xl font-bold">{workflows.length}</p>
                <p className="text-xs text-muted-foreground">Total Workflows</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filter & Search */}
      <div className="flex items-center justify-between gap-4">
        <Tabs value={filter} onValueChange={(v) => setFilter(v as FilterType)}>
          <TabsList>
            <TabsTrigger value="all">All ({workflows.length})</TabsTrigger>
            <TabsTrigger value="active">Active ({activeCount})</TabsTrigger>
            <TabsTrigger value="paused">Paused ({workflows.length - activeCount})</TabsTrigger>
          </TabsList>
        </Tabs>
        
        <div className="relative w-64">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search workflows..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9"
          />
        </div>
      </div>

      {/* Workflows List */}
      <div className="space-y-4">
        {filteredWorkflows.length === 0 ? (
          <Card>
            <CardContent className="p-8 text-center">
              <Workflow className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
              <h3 className="font-semibold mb-2">No workflows found</h3>
              <p className="text-sm text-muted-foreground mb-4">
                {searchQuery ? 'Try a different search term' : 'Create your first workflow to get started'}
              </p>
              {!searchQuery && (
                <Button onClick={handleCreateNew}>
                  <Plus className="w-4 h-4 mr-2" />
                  Create Workflow
                </Button>
              )}
            </CardContent>
          </Card>
        ) : (
          filteredWorkflows.map(workflow => (
            <WorkflowCard
              key={workflow.id}
              workflow={workflow}
              onToggle={toggleWorkflow}
              onEdit={handleEdit}
              onDelete={(id) => setDeleteConfirm({ open: true, id })}
              onDuplicate={handleDuplicate}
              onRunNow={handleRunNow}
            />
          ))
        )}
      </div>

      {/* Form Dialog */}
      <WorkflowFormDialog
        open={formOpen}
        onOpenChange={setFormOpen}
        workflow={editingWorkflow}
        onSave={handleSave}
      />

      {/* Delete Confirmation */}
      <ConfirmDialog
        open={deleteConfirm.open}
        onOpenChange={(open) => setDeleteConfirm({ open, id: null })}
        title="Delete Workflow"
        description="Are you sure you want to delete this workflow? This action cannot be undone."
        confirmLabel="Delete"
        variant="destructive"
        onConfirm={() => deleteConfirm.id && handleDelete(deleteConfirm.id)}
      />
    </div>
  );
}
