// XP Bar Component - Francis Okorie Iyeke-Kanu
import { cn } from '@/lib/utils';

interface XPBarProps {
  current: number;
  max: number;
  label?: string;
  showValues?: boolean;
  variant?: 'primary' | 'health' | 'gold';
  size?: 'sm' | 'md' | 'lg';
}

/* Developed by Francis Okorie Iyeke-Kanu */
export function XPBar({ 
  current, 
  max, 
  label, 
  showValues = true,
  variant = 'primary',
  size = 'md'
}: XPBarProps) {
  const percentage = Math.min((current / max) * 100, 100);
  
  const variantStyles = {
    primary: {
      bg: 'bg-primary/20',
      fill: 'bg-gradient-to-r from-primary to-accent',
      glow: 'shadow-[0_0_10px_hsl(var(--primary)/0.5)]',
    },
    health: {
      bg: 'bg-destructive/20',
      fill: percentage > 50 ? 'bg-gradient-to-r from-success to-success' : 
            percentage > 25 ? 'bg-gradient-to-r from-warning to-warning' : 
            'bg-gradient-to-r from-destructive to-destructive',
      glow: percentage > 50 ? 'shadow-[0_0_10px_hsl(var(--success)/0.5)]' :
            percentage > 25 ? 'shadow-[0_0_10px_hsl(var(--warning)/0.5)]' :
            'shadow-[0_0_10px_hsl(var(--destructive)/0.5)]',
    },
    gold: {
      bg: 'bg-gold/20',
      fill: 'bg-gradient-to-r from-gold to-warning',
      glow: 'shadow-[0_0_10px_hsl(var(--gold)/0.5)]',
    },
  };

  const sizeStyles = {
    sm: 'h-1.5',
    md: 'h-2.5',
    lg: 'h-4',
  };

  const styles = variantStyles[variant];

  return (
    <div className="space-y-1">
      {(label || showValues) && (
        <div className="flex justify-between items-center text-xs">
          {label && <span className="text-muted-foreground font-display">{label}</span>}
          {showValues && (
            <span className="font-mono text-foreground">
              {current.toLocaleString()}/{max.toLocaleString()}
            </span>
          )}
        </div>
      )}
      <div className={cn("w-full rounded-full overflow-hidden", styles.bg, sizeStyles[size])}>
        <div 
          className={cn(
            "h-full rounded-full transition-all duration-700 ease-out",
            styles.fill,
            styles.glow
          )}
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
}
