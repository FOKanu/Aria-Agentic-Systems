import { cn } from '@/lib/utils';
import { CheckCircle, AlertTriangle, XCircle, Clock } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

export type ComplianceStatus = 'compliant' | 'partial' | 'non-compliant' | 'pending';

interface ComplianceTrafficLightProps {
  status: ComplianceStatus;
  size?: 'sm' | 'md' | 'lg';
  showLabel?: boolean;
  label?: string;
}

const statusConfig = {
  compliant: {
    color: 'bg-green-500',
    icon: CheckCircle,
    label: 'Compliant',
    description: 'All requirements met',
  },
  partial: {
    color: 'bg-yellow-500',
    icon: AlertTriangle,
    label: 'Partial',
    description: 'Some requirements pending',
  },
  'non-compliant': {
    color: 'bg-red-500',
    icon: XCircle,
    label: 'Non-Compliant',
    description: 'Immediate action required',
  },
  pending: {
    color: 'bg-blue-500',
    icon: Clock,
    label: 'Pending',
    description: 'Under review',
  },
};

const sizeConfig = {
  sm: 'w-3 h-3',
  md: 'w-4 h-4',
  lg: 'w-5 h-5',
};

export function ComplianceTrafficLight({ 
  status, 
  size = 'md', 
  showLabel = false,
  label 
}: ComplianceTrafficLightProps) {
  const config = statusConfig[status];
  const Icon = config.icon;

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <div className="flex items-center gap-2">
            <div className={cn(
              "rounded-full flex items-center justify-center",
              config.color,
              sizeConfig[size]
            )}>
              <Icon className={cn("text-white", size === 'sm' ? 'w-2 h-2' : size === 'md' ? 'w-2.5 h-2.5' : 'w-3 h-3')} />
            </div>
            {showLabel && (
              <span className="text-xs text-muted-foreground">
                {label || config.label}
              </span>
            )}
          </div>
        </TooltipTrigger>
        <TooltipContent>
          <p className="font-medium">{config.label}</p>
          <p className="text-xs text-muted-foreground">{config.description}</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}

// Traffic light group for multiple statuses
interface TrafficLightGroupProps {
  statuses: { status: ComplianceStatus; label: string }[];
}

export function ComplianceTrafficLightGroup({ statuses }: TrafficLightGroupProps) {
  return (
    <div className="flex items-center gap-3">
      {statuses.map((item, i) => (
        <ComplianceTrafficLight 
          key={i} 
          status={item.status} 
          showLabel 
          label={item.label} 
        />
      ))}
    </div>
  );
}
