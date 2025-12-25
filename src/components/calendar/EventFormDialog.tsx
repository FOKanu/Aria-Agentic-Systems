import { useState } from 'react';
import { format, addHours } from 'date-fns';
import { Clock, MapPin, Bot, Palette, Zap, FileText } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Separator } from '@/components/ui/separator';
import { AGENTS } from '@/data/agentsData';
import type { CreateEventData, CalendarEvent } from '@/hooks/useCalendarEvents';

interface EventFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  initialDate?: Date;
  event?: CalendarEvent | null;
  onSave: (data: CreateEventData) => Promise<void>;
  onDelete?: () => Promise<void>;
}

const colorOptions = [
  { value: '#3b82f6', label: 'Blue' },
  { value: '#10b981', label: 'Green' },
  { value: '#f59e0b', label: 'Orange' },
  { value: '#ef4444', label: 'Red' },
  { value: '#8b5cf6', label: 'Purple' },
  { value: '#ec4899', label: 'Pink' },
  { value: '#6366f1', label: 'Indigo' },
  { value: '#14b8a6', label: 'Teal' },
];

export function EventFormDialog({
  open,
  onOpenChange,
  initialDate,
  event,
  onSave,
  onDelete,
}: EventFormDialogProps) {
  const isEditing = !!event;
  
  const getDefaultStartTime = () => {
    if (event) return format(new Date(event.start_time), "yyyy-MM-dd'T'HH:mm");
    if (initialDate) return format(initialDate, "yyyy-MM-dd'T'HH:mm");
    return format(new Date(), "yyyy-MM-dd'T'HH:mm");
  };

  const getDefaultEndTime = () => {
    if (event) return format(new Date(event.end_time), "yyyy-MM-dd'T'HH:mm");
    if (initialDate) return format(addHours(initialDate, 1), "yyyy-MM-dd'T'HH:mm");
    return format(addHours(new Date(), 1), "yyyy-MM-dd'T'HH:mm");
  };

  const [title, setTitle] = useState(event?.title || '');
  const [description, setDescription] = useState(event?.description || '');
  const [location, setLocation] = useState(event?.location || '');
  const [startTime, setStartTime] = useState(getDefaultStartTime());
  const [endTime, setEndTime] = useState(getDefaultEndTime());
  const [allDay, setAllDay] = useState(event?.all_day || false);
  const [color, setColor] = useState(event?.color || '#3b82f6');
  const [status, setStatus] = useState<'confirmed' | 'tentative' | 'cancelled'>(
    event?.status || 'confirmed'
  );
  const [assignedAgent, setAssignedAgent] = useState(event?.assigned_agent || 'none');
  const [instructions, setInstructions] = useState(event?.instructions || '');
  const [autoStart, setAutoStart] = useState(event?.auto_start || false);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    setSaving(true);
    try {
      await onSave({
        title: title.trim(),
        description: description.trim() || undefined,
        location: location.trim() || undefined,
        start_time: new Date(startTime).toISOString(),
        end_time: new Date(endTime).toISOString(),
        all_day: allDay,
        color,
        status,
        assigned_agent: assignedAgent !== 'none' ? assignedAgent : undefined,
        instructions: instructions.trim() || undefined,
        auto_start: autoStart,
      });
      onOpenChange(false);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!onDelete) return;
    setDeleting(true);
    try {
      await onDelete();
      onOpenChange(false);
    } finally {
      setDeleting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{isEditing ? 'Edit Event' : 'New Event'}</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Title */}
          <div className="space-y-1.5">
            <Label htmlFor="title">Title</Label>
            <Input
              id="title"
              value={title}
              onChange={e => setTitle(e.target.value)}
              placeholder="Event title"
              required
            />
          </div>

          {/* Date/Time */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Label className="flex items-center gap-2">
                <Clock className="w-4 h-4" />
                All Day
              </Label>
              <Switch checked={allDay} onCheckedChange={setAllDay} />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label htmlFor="start">Start</Label>
                <Input
                  id="start"
                  type={allDay ? 'date' : 'datetime-local'}
                  value={allDay ? startTime.split('T')[0] : startTime}
                  onChange={e => setStartTime(allDay ? `${e.target.value}T00:00` : e.target.value)}
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="end">End</Label>
                <Input
                  id="end"
                  type={allDay ? 'date' : 'datetime-local'}
                  value={allDay ? endTime.split('T')[0] : endTime}
                  onChange={e => setEndTime(allDay ? `${e.target.value}T23:59` : e.target.value)}
                />
              </div>
            </div>
          </div>

          {/* Location */}
          <div className="space-y-1.5">
            <Label htmlFor="location" className="flex items-center gap-2">
              <MapPin className="w-4 h-4" />
              Location
            </Label>
            <Input
              id="location"
              value={location}
              onChange={e => setLocation(e.target.value)}
              placeholder="Add location"
            />
          </div>

          {/* Description */}
          <div className="space-y-1.5">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={description}
              onChange={e => setDescription(e.target.value)}
              placeholder="Add description"
              rows={3}
            />
          </div>

          {/* Color & Status */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label className="flex items-center gap-2">
                <Palette className="w-4 h-4" />
                Color
              </Label>
              <Select value={color} onValueChange={setColor}>
                <SelectTrigger>
                  <SelectValue>
                    <div className="flex items-center gap-2">
                      <div
                        className="w-3 h-3 rounded-full"
                        style={{ backgroundColor: color }}
                      />
                      {colorOptions.find(c => c.value === color)?.label}
                    </div>
                  </SelectValue>
                </SelectTrigger>
                <SelectContent>
                  {colorOptions.map(opt => (
                    <SelectItem key={opt.value} value={opt.value}>
                      <div className="flex items-center gap-2">
                        <div
                          className="w-3 h-3 rounded-full"
                          style={{ backgroundColor: opt.value }}
                        />
                        {opt.label}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1.5">
              <Label>Status</Label>
              <Select value={status} onValueChange={(v: 'confirmed' | 'tentative' | 'cancelled') => setStatus(v)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="confirmed">Confirmed</SelectItem>
                  <SelectItem value="tentative">Tentative</SelectItem>
                  <SelectItem value="cancelled">Cancelled</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <Separator className="my-4" />

          {/* Automation Section */}
          <div className="space-y-4">
            <h3 className="text-sm font-medium flex items-center gap-2">
              <Zap className="w-4 h-4 text-amber-500" />
              Automation
            </h3>

            {/* Assign Agent */}
            <div className="space-y-1.5">
              <Label className="flex items-center gap-2">
                <Bot className="w-4 h-4" />
                Assign Agent
              </Label>
              <Select value={assignedAgent} onValueChange={setAssignedAgent}>
                <SelectTrigger>
                  <SelectValue placeholder="Select an agent" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">None</SelectItem>
                  {AGENTS.map(agent => (
                    <SelectItem key={agent.id} value={agent.id}>
                      {agent.name} - {agent.title}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Agent Instructions */}
            <div className="space-y-1.5">
              <Label htmlFor="instructions" className="flex items-center gap-2">
                <FileText className="w-4 h-4" />
                Agent Instructions
              </Label>
              <Textarea
                id="instructions"
                value={instructions}
                onChange={e => setInstructions(e.target.value)}
                placeholder="Enter detailed instructions for the agent (e.g., 'Draft the Q3 financial report using the data from the Finance module...')"
                rows={4}
                className="text-sm"
              />
              <p className="text-xs text-muted-foreground">
                Provide specific instructions or prompts for the assigned agent to execute.
              </p>
            </div>

            {/* Auto-Execute Toggle */}
            <div className="flex items-center justify-between rounded-lg border p-3 bg-muted/30">
              <div className="space-y-0.5">
                <Label className="flex items-center gap-2 cursor-pointer">
                  <Zap className="w-4 h-4 text-amber-500" />
                  Auto-Execute
                </Label>
                <p className="text-xs text-muted-foreground">
                  Agent will automatically start the task at the scheduled time
                </p>
              </div>
              <Switch 
                checked={autoStart} 
                onCheckedChange={setAutoStart}
                disabled={assignedAgent === 'none'}
              />
            </div>
          </div>

          {/* Actions */}
          <div className="flex justify-between pt-2">
            {isEditing && onDelete ? (
              <Button
                type="button"
                variant="destructive"
                onClick={handleDelete}
                disabled={deleting}
              >
                {deleting ? 'Deleting...' : 'Delete'}
              </Button>
            ) : (
              <div />
            )}

            <div className="flex gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={saving || !title.trim()}>
                {saving ? 'Saving...' : isEditing ? 'Update' : 'Create'}
              </Button>
            </div>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
