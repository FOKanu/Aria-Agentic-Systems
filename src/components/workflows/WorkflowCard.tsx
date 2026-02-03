import { MoreHorizontal, Play, Pause, Trash2, Edit, Copy, Zap, Clock, CheckCircle2, AlertCircle, ArrowRight } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { cn } from '@/lib/utils';

export interface WorkflowItem {
  id: string;
  name: string;
  description: string;
  trigger: string;
  triggerType: 'schedule' | 'event' | 'manual';
  actions: string[];
  isActive: boolean;
  lastRun?: string;
  runCount: number;
  status: 'success' | 'warning' | 'error' | 'idle';
}

interface WorkflowCardProps {
  workflow: WorkflowItem;
  onToggle: (id: string) => void;
  onEdit: (workflow: WorkflowItem) => void;
  onDelete: (id: string) => void;
  onDuplicate: (workflow: WorkflowItem) => void;
  onRunNow: (id: string) => void;
}

const statusConfig = {
  success: { icon: CheckCircle2, color: 'text-green-500', bg: 'bg-green-500/10' },
  warning: { icon: AlertCircle, color: 'text-yellow-500', bg: 'bg-yellow-500/10' },
  error: { icon: AlertCircle, color: 'text-red-500', bg: 'bg-red-500/10' },
  idle: { icon: Pause, color: 'text-muted-foreground', bg: 'bg-secondary' },
};

export function WorkflowCard({ workflow, onToggle, onEdit, onDelete, onDuplicate, onRunNow }: WorkflowCardProps) {
  const StatusIcon = statusConfig[workflow.status].icon;

  return (
    <Card className={cn("transition-all", workflow.isActive && "border-primary/30")}>
      <CardContent className="p-4">
        <div className="flex items-start justify-between">
          <div className="flex items-start gap-4 flex-1">
            <div className={cn("w-10 h-10 rounded-lg flex items-center justify-center", statusConfig[workflow.status].bg)}>
              <StatusIcon className={cn("w-5 h-5", statusConfig[workflow.status].color)} />
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <h3 className="font-semibold">{workflow.name}</h3>
                <Badge variant={workflow.isActive ? "default" : "secondary"} className="text-xs">
                  {workflow.isActive ? 'Active' : 'Paused'}
                </Badge>
              </div>
              <p className="text-sm text-muted-foreground mb-3">{workflow.description}</p>
              
              {/* Trigger & Actions */}
              <div className="flex flex-wrap items-center gap-2 text-xs">
                <Badge variant="outline" className="gap-1">
                  <Clock className="w-3 h-3" />
                  {workflow.trigger}
                </Badge>
                <ArrowRight className="w-3 h-3 text-muted-foreground" />
                {workflow.actions.slice(0, 2).map((action, i) => (
                  <Badge key={i} variant="secondary" className="bg-secondary/50">
                    {action}
                  </Badge>
                ))}
                {workflow.actions.length > 2 && (
                  <Badge variant="secondary" className="bg-secondary/50">
                    +{workflow.actions.length - 2} more
                  </Badge>
                )}
              </div>

              {/* Stats */}
              <div className="flex items-center gap-4 mt-3 text-xs text-muted-foreground">
                <span>{workflow.runCount} runs</span>
                {workflow.lastRun && <span>Last run: {workflow.lastRun}</span>}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Actions Dropdown */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon">
                  <MoreHorizontal className="w-4 h-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => onRunNow(workflow.id)}>
                  <Zap className="w-4 h-4 mr-2" />
                  Run Now
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => onEdit(workflow)}>
                  <Edit className="w-4 h-4 mr-2" />
                  Edit
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => onDuplicate(workflow)}>
                  <Copy className="w-4 h-4 mr-2" />
                  Duplicate
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem 
                  onClick={() => onDelete(workflow.id)}
                  className="text-destructive focus:text-destructive"
                >
                  <Trash2 className="w-4 h-4 mr-2" />
                  Delete
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            {/* Toggle Switch */}
            <Switch
              checked={workflow.isActive}
              onCheckedChange={() => onToggle(workflow.id)}
            />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
