import { useState } from 'react';
import { FileText, Plus, Trash2, Send, Zap } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { ScrollArea } from '@/components/ui/scroll-area';
import { cn } from '@/lib/utils';

export interface MessageTemplate {
  id: string;
  name: string;
  content: string;
  category?: string;
}

const DEFAULT_TEMPLATES: MessageTemplate[] = [
  { id: '1', name: 'Code Review', content: '@Nova please review the latest code changes and suggest improvements', category: 'Development' },
  { id: '2', name: 'Deploy to Staging', content: '@Flux deploy the current branch to staging environment', category: 'DevOps' },
  { id: '3', name: 'Research Topic', content: '@Sage research and summarize: ', category: 'Research' },
  { id: '4', name: 'Schedule Meeting', content: '@Orion schedule a meeting for ', category: 'Scheduling' },
  { id: '5', name: 'Send Email', content: '@Aria draft an email to ', category: 'Communications' },
  { id: '6', name: 'Status Update', content: '@Atlas provide a status update on all running tasks', category: 'General' },
];

interface MessageTemplatesProps {
  onSelectTemplate: (content: string) => void;
  className?: string;
}

export function MessageTemplates({ onSelectTemplate, className }: MessageTemplatesProps) {
  const [templates, setTemplates] = useState<MessageTemplate[]>(() => {
    try {
      const stored = localStorage.getItem('agent-command-templates');
      return stored ? JSON.parse(stored) : DEFAULT_TEMPLATES;
    } catch {
      return DEFAULT_TEMPLATES;
    }
  });
  const [dialogOpen, setDialogOpen] = useState(false);
  const [newTemplate, setNewTemplate] = useState({ name: '', content: '' });

  const saveTemplates = (updated: MessageTemplate[]) => {
    setTemplates(updated);
    localStorage.setItem('agent-command-templates', JSON.stringify(updated));
  };

  const addTemplate = () => {
    if (!newTemplate.name || !newTemplate.content) return;
    const template: MessageTemplate = {
      id: Date.now().toString(),
      name: newTemplate.name,
      content: newTemplate.content,
    };
    saveTemplates([...templates, template]);
    setNewTemplate({ name: '', content: '' });
    setDialogOpen(false);
  };

  const deleteTemplate = (id: string) => {
    saveTemplates(templates.filter(t => t.id !== id));
  };

  const groupedTemplates = templates.reduce((acc, template) => {
    const category = template.category || 'Custom';
    if (!acc[category]) acc[category] = [];
    acc[category].push(template);
    return acc;
  }, {} as Record<string, MessageTemplate[]>);

  return (
    <div className={className}>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="icon" className="h-8 w-8">
            <Zap className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="start" className="w-64 bg-popover border border-border">
          <DropdownMenuLabel className="flex items-center justify-between">
            <span className="text-xs">Quick Commands</span>
            <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
              <DialogTrigger asChild>
                <Button variant="ghost" size="icon" className="h-6 w-6">
                  <Plus className="h-3 w-3" />
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Create Template</DialogTitle>
                </DialogHeader>
                <div className="space-y-4 py-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Name</label>
                    <Input
                      placeholder="Template name"
                      value={newTemplate.name}
                      onChange={(e) => setNewTemplate(prev => ({ ...prev, name: e.target.value }))}
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Content</label>
                    <Textarea
                      placeholder="Message content (use @AgentName to mention agents)"
                      value={newTemplate.content}
                      onChange={(e) => setNewTemplate(prev => ({ ...prev, content: e.target.value }))}
                      rows={3}
                    />
                  </div>
                  <Button onClick={addTemplate} className="w-full">
                    Save Template
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </DropdownMenuLabel>
          <DropdownMenuSeparator />
          <ScrollArea className="h-[300px]">
            {Object.entries(groupedTemplates).map(([category, categoryTemplates]) => (
              <div key={category}>
                <DropdownMenuLabel className="text-[10px] text-muted-foreground uppercase tracking-wider">
                  {category}
                </DropdownMenuLabel>
                {categoryTemplates.map((template) => (
                  <DropdownMenuItem
                    key={template.id}
                    className="flex items-center justify-between group"
                    onSelect={() => onSelectTemplate(template.content)}
                  >
                    <div className="flex items-center gap-2 flex-1 min-w-0">
                      <FileText className="h-3.5 w-3.5 flex-shrink-0 text-muted-foreground" />
                      <span className="truncate">{template.name}</span>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-6 w-6 opacity-0 group-hover:opacity-100"
                      onClick={(e) => {
                        e.stopPropagation();
                        deleteTemplate(template.id);
                      }}
                    >
                      <Trash2 className="h-3 w-3 text-muted-foreground hover:text-destructive" />
                    </Button>
                  </DropdownMenuItem>
                ))}
              </div>
            ))}
          </ScrollArea>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}
