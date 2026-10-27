// Status Card Component - Francis Okorie Iyeke-Kanu
import { cn } from '@/lib/utils';
import { LucideIcon } from 'lucide-react';

interface StatusCardProps {
  title: string;
  value: string | number;
  icon?: LucideIcon;
  status?: 'default' | 'success' | 'warning' | 'error' | 'primary';
  subtitle?: string;
  className?: string;
}

const statusColors = {
  default: 'border-border',
  success: 'border-success/50 bg-success/5',
  warning: 'border-warning/50 bg-warning/5',
  error: 'border-destructive/50 bg-destructive/5',
  primary: 'border-primary/50 bg-primary/5',
};

/* Developed by Francis Okorie Iyeke-Kanu */
export function StatusCard({ title, value, icon: Icon, status = 'default', subtitle, className }: StatusCardProps) {
  return (
    <div className={cn(
      'rounded-lg border bg-card p-4 transition-all',
      statusColors[status],
      className
    )}>
      <div className="flex items-start justify-between">
        <div className="space-y-1">
          <p className="text-xs text-muted-foreground uppercase tracking-wider">{title}</p>
          <p className="text-xl font-semibold font-mono">{value}</p>
          {subtitle && <p className="text-xs text-muted-foreground">{subtitle}</p>}
        </div>
        {Icon && (
          <div className={cn(
            'p-2 rounded-md',
            status === 'success' && 'bg-success/10 text-success',
            status === 'warning' && 'bg-warning/10 text-warning',
            status === 'error' && 'bg-destructive/10 text-destructive',
            status === 'primary' && 'bg-primary/10 text-primary',
            status === 'default' && 'bg-muted text-muted-foreground',
          )}>
            <Icon className="w-4 h-4" />
          </div>
        )}
      </div>
    </div>
  );
}
