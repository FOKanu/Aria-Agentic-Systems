import { CheckCircle, XCircle, AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface ApprovalInlineProps {
  taskId: string;
  taskDescription: string;
  onApprove: (taskId: string) => void;
  onReject: (taskId: string) => void;
}

export function ApprovalInline({
  taskId,
  taskDescription,
  onApprove,
  onReject,
}: ApprovalInlineProps) {
  return (
    <div className="my-4 mx-auto max-w-md">
      <div className="rounded-xl border border-warning/50 bg-warning/10 p-4 space-y-3">
        <div className="flex items-start gap-3">
          <AlertTriangle className="w-5 h-5 text-warning flex-shrink-0 mt-0.5" />
          <div>
            <p className="font-medium text-sm">Approval Required</p>
            <p className="text-sm text-muted-foreground mt-1">{taskDescription}</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            className="flex-1 gap-2 border-destructive/50 text-destructive hover:bg-destructive/10"
            onClick={() => onReject(taskId)}
          >
            <XCircle className="w-4 h-4" />
            Reject
          </Button>
          <Button
            size="sm"
            className="flex-1 gap-2 bg-success hover:bg-success/90"
            onClick={() => onApprove(taskId)}
          >
            <CheckCircle className="w-4 h-4" />
            Approve
          </Button>
        </div>
      </div>
    </div>
  );
}
