import { cn } from '@/lib/utils';

interface RadialStatProps {
  value: number;
  maxValue?: number;
  label: string;
  icon?: React.ReactNode;
  color?: 'primary' | 'accent' | 'holo' | 'success' | 'warning';
  size?: 'sm' | 'md' | 'lg';
}

export function RadialStat({ 
  value, 
  maxValue = 100, 
  label, 
  icon,
  color = 'primary',
  size = 'md'
}: RadialStatProps) {
  const percentage = (value / maxValue) * 100;
  const circumference = 2 * Math.PI * 36; // radius = 36
  const strokeDashoffset = circumference - (percentage / 100) * circumference;

  const colorStyles = {
    primary: { stroke: 'stroke-primary', text: 'text-primary', glow: 'drop-shadow-[0_0_8px_hsl(var(--primary))]' },
    accent: { stroke: 'stroke-accent', text: 'text-accent', glow: 'drop-shadow-[0_0_8px_hsl(var(--accent))]' },
    holo: { stroke: 'stroke-holo', text: 'text-holo', glow: 'drop-shadow-[0_0_8px_hsl(var(--holo))]' },
    success: { stroke: 'stroke-success', text: 'text-success', glow: 'drop-shadow-[0_0_8px_hsl(var(--success))]' },
    warning: { stroke: 'stroke-warning', text: 'text-warning', glow: 'drop-shadow-[0_0_8px_hsl(var(--warning))]' },
  };

  const sizeStyles = {
    sm: { container: 'w-20 h-20', text: 'text-lg', label: 'text-[10px]' },
    md: { container: 'w-24 h-24', text: 'text-xl', label: 'text-xs' },
    lg: { container: 'w-32 h-32', text: 'text-2xl', label: 'text-sm' },
  };

  const styles = colorStyles[color];
  const sizes = sizeStyles[size];

  return (
    <div className={cn("relative flex items-center justify-center", sizes.container)}>
      <svg className="w-full h-full -rotate-90" viewBox="0 0 80 80">
        {/* Background circle */}
        <circle
          cx="40"
          cy="40"
          r="36"
          fill="none"
          stroke="currentColor"
          strokeWidth="6"
          className="text-secondary"
        />
        {/* Progress circle */}
        <circle
          cx="40"
          cy="40"
          r="36"
          fill="none"
          strokeWidth="6"
          strokeLinecap="round"
          className={cn(styles.stroke, styles.glow, "transition-all duration-1000 ease-out")}
          style={{
            strokeDasharray: circumference,
            strokeDashoffset: strokeDashoffset,
          }}
        />
      </svg>
      
      {/* Center content */}
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className={cn("font-mono font-bold", sizes.text, styles.text)}>
          {value}%
        </span>
        <span className={cn("text-muted-foreground font-display uppercase tracking-wide", sizes.label)}>
          {label}
        </span>
      </div>
    </div>
  );
}
