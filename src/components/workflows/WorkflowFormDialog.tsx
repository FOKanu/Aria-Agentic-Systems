import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { X, Plus } from 'lucide-react';

export interface WorkflowFormData {
  id?: string;
  name: string;
  description: string;
  trigger: string;
  triggerType: 'schedule' | 'event' | 'manual';
  actions: string[];
  isActive: boolean;
}

interface WorkflowFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  workflow?: WorkflowFormData | null;
  onSave: (workflow: WorkflowFormData) => void;
}

const triggerOptions = {
  schedule: [
    'Every hour',
    'Every day at 8:00 AM',
    'Every day at 9:00 AM',
    'Every Monday at 9:00 AM',
    'Weekly on Sunday',
    'Monthly on the 1st',
  ],
  event: [
    'When new contact is added',
    'When task is completed',
    'When file is uploaded',
    'When email is received',
    'When recording is uploaded',
  ],
  manual: ['Manual trigger only'],
};

const actionSuggestions = [
  'Send email',
  'Create task',
  'Send Slack message',
  'Generate PDF',
  'Upload to S3',
  'Transcribe audio',
  'Summarize with AI',
  'Filter by source',
  'Compress files',
  'Share notes',
  'Draft reminder',
  'Collect metrics',
];

export function WorkflowFormDialog({ open, onOpenChange, workflow, onSave }: WorkflowFormDialogProps) {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [triggerType, setTriggerType] = useState<'schedule' | 'event' | 'manual'>('schedule');
  const [trigger, setTrigger] = useState('');
  const [actions, setActions] = useState<string[]>([]);
  const [newAction, setNewAction] = useState('');

  useEffect(() => {
    if (workflow) {
      setName(workflow.name);
      setDescription(workflow.description);
      setTriggerType(workflow.triggerType);
      setTrigger(workflow.trigger);
      setActions(workflow.actions);
    } else {
      setName('');
      setDescription('');
      setTriggerType('schedule');
      setTrigger('');
      setActions([]);
    }
  }, [workflow, open]);

  const handleAddAction = () => {
    if (newAction.trim() && !actions.includes(newAction.trim())) {
      setActions([...actions, newAction.trim()]);
      setNewAction('');
    }
  };

  const handleRemoveAction = (action: string) => {
    setActions(actions.filter(a => a !== action));
  };

  const handleSave = () => {
    if (!name.trim() || !trigger) return;
    
    onSave({
      id: workflow?.id,
      name: name.trim(),
      description: description.trim(),
      trigger,
      triggerType,
      actions,
      isActive: workflow?.isActive ?? true,
    });
    onOpenChange(false);
  };

  const isEditing = !!workflow?.id;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>{isEditing ? 'Edit Workflow' : 'Create Workflow'}</DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* Name */}
          <div className="space-y-2">
            <Label htmlFor="name">Workflow Name</Label>
            <Input
              id="name"
              placeholder="e.g., Daily Report Generator"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>

          {/* Description */}
          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              placeholder="What does this workflow do?"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={2}
            />
          </div>

          {/* Trigger Type */}
          <div className="space-y-2">
            <Label>Trigger Type</Label>
            <Select value={triggerType} onValueChange={(v) => {
              setTriggerType(v as 'schedule' | 'event' | 'manual');
              setTrigger('');
            }}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="schedule">Schedule-based</SelectItem>
                <SelectItem value="event">Event-based</SelectItem>
                <SelectItem value="manual">Manual</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Trigger */}
          <div className="space-y-2">
            <Label>Trigger</Label>
            <Select value={trigger} onValueChange={setTrigger}>
              <SelectTrigger>
                <SelectValue placeholder="Select a trigger..." />
              </SelectTrigger>
              <SelectContent>
                {triggerOptions[triggerType].map((t) => (
                  <SelectItem key={t} value={t}>{t}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Actions */}
          <div className="space-y-2">
            <Label>Actions</Label>
            <div className="flex gap-2">
              <Select value={newAction} onValueChange={setNewAction}>
                <SelectTrigger className="flex-1">
                  <SelectValue placeholder="Add an action..." />
                </SelectTrigger>
                <SelectContent>
                  {actionSuggestions.filter(a => !actions.includes(a)).map((a) => (
                    <SelectItem key={a} value={a}>{a}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Button type="button" size="icon" onClick={handleAddAction} disabled={!newAction}>
                <Plus className="w-4 h-4" />
              </Button>
            </div>
            
            {actions.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-2">
                {actions.map((action, i) => (
                  <Badge key={i} variant="secondary" className="gap-1 pr-1">
                    {action}
                    <button
                      type="button"
                      onClick={() => handleRemoveAction(action)}
                      className="ml-1 hover:bg-muted rounded-full p-0.5"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </Badge>
                ))}
              </div>
            )}
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={!name.trim() || !trigger}>
            {isEditing ? 'Save Changes' : 'Create Workflow'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
