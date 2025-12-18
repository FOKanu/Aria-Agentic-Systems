import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { AlertTriangle, Trash2, Square, XCircle } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ConfirmDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: () => void;
  title: string;
  description: string;
  confirmLabel?: string;
  cancelLabel?: string;
  variant?: 'default' | 'destructive';
  icon?: 'warning' | 'delete' | 'stop' | 'error';
}

const iconMap = {
  warning: AlertTriangle,
  delete: Trash2,
  stop: Square,
  error: XCircle,
};

export function ConfirmDialog({
  open,
  onOpenChange,
  onConfirm,
  title,
  description,
  confirmLabel = 'Confirm',
  cancelLabel = 'Cancel',
  variant = 'default',
  icon = 'warning',
}: ConfirmDialogProps) {
  const Icon = iconMap[icon];

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <div className="flex items-center gap-3">
            <div className={cn(
              "w-10 h-10 rounded-full flex items-center justify-center",
              variant === 'destructive' ? "bg-destructive/10" : "bg-warning/10"
            )}>
              <Icon className={cn(
                "w-5 h-5",
                variant === 'destructive' ? "text-destructive" : "text-warning"
              )} />
            </div>
            <AlertDialogTitle>{title}</AlertDialogTitle>
          </div>
          <AlertDialogDescription className="pl-[52px]">
            {description}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>{cancelLabel}</AlertDialogCancel>
          <AlertDialogAction
            onClick={onConfirm}
            className={cn(
              variant === 'destructive' && "bg-destructive text-destructive-foreground hover:bg-destructive/90"
            )}
          >
            {confirmLabel}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}

// Preset dialogs
export function StopAgentDialog({
  open,
  onOpenChange,
  onConfirm,
  agentName,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: () => void;
  agentName: string;
}) {
  return (
    <ConfirmDialog
      open={open}
      onOpenChange={onOpenChange}
      onConfirm={onConfirm}
      title={`Stop ${agentName}?`}
      description={`This will immediately halt all operations for ${agentName}. Any in-progress tasks will be interrupted and may need to be restarted.`}
      confirmLabel="Stop Agent"
      variant="destructive"
      icon="stop"
    />
  );
}

export function DeleteTaskDialog({
  open,
  onOpenChange,
  onConfirm,
  taskName,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: () => void;
  taskName: string;
}) {
  return (
    <ConfirmDialog
      open={open}
      onOpenChange={onOpenChange}
      onConfirm={onConfirm}
      title="Delete Task?"
      description={`Are you sure you want to delete "${taskName}"? This action cannot be undone.`}
      confirmLabel="Delete"
      variant="destructive"
      icon="delete"
    />
  );
}

export function PauseAllAgentsDialog({
  open,
  onOpenChange,
  onConfirm,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: () => void;
}) {
  return (
    <ConfirmDialog
      open={open}
      onOpenChange={onOpenChange}
      onConfirm={onConfirm}
      title="Pause All Agents?"
      description="This will pause all currently running agents. You can resume them individually or all at once later."
      confirmLabel="Pause All"
      icon="warning"
    />
  );
}
