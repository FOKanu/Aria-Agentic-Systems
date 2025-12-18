import { useState, ReactNode } from 'react';
import { HelpCircle, X, Lightbulb } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { cn } from '@/lib/utils';

interface HelpTooltipProps {
  content: string | ReactNode;
  title?: string;
  side?: 'top' | 'right' | 'bottom' | 'left';
  className?: string;
}

export function HelpTooltip({ content, title, side = 'top', className }: HelpTooltipProps) {
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <button className={cn("text-muted-foreground hover:text-foreground transition-colors", className)}>
          <HelpCircle className="h-4 w-4" />
        </button>
      </TooltipTrigger>
      <TooltipContent side={side} className="max-w-xs">
        {title && <p className="font-medium mb-1">{title}</p>}
        <p className="text-sm">{content}</p>
      </TooltipContent>
    </Tooltip>
  );
}

// More detailed help popover for complex features
interface HelpPopoverProps {
  title: string;
  content: string | ReactNode;
  learnMoreUrl?: string;
  side?: 'top' | 'right' | 'bottom' | 'left';
  className?: string;
}

export function HelpPopover({ title, content, learnMoreUrl, side = 'right', className }: HelpPopoverProps) {
  return (
    <Popover>
      <PopoverTrigger asChild>
        <button className={cn("text-muted-foreground hover:text-foreground transition-colors", className)}>
          <HelpCircle className="h-4 w-4" />
        </button>
      </PopoverTrigger>
      <PopoverContent side={side} className="w-72 bg-popover border border-border">
        <div className="space-y-2">
          <h4 className="font-medium">{title}</h4>
          <div className="text-sm text-muted-foreground">{content}</div>
          {learnMoreUrl && (
            <a
              href={learnMoreUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs text-primary hover:underline inline-block mt-2"
            >
              Learn more →
            </a>
          )}
        </div>
      </PopoverContent>
    </Popover>
  );
}

// Contextual hint that can be dismissed
interface ContextualHintProps {
  id: string;
  title: string;
  content: string;
  className?: string;
}

export function ContextualHint({ id, title, content, className }: ContextualHintProps) {
  const storageKey = `hint-dismissed-${id}`;
  const [dismissed, setDismissed] = useState(() => {
    return localStorage.getItem(storageKey) === 'true';
  });

  const dismiss = () => {
    localStorage.setItem(storageKey, 'true');
    setDismissed(true);
  };

  if (dismissed) return null;

  return (
    <div className={cn(
      "relative flex items-start gap-3 p-3 rounded-lg bg-primary/5 border border-primary/20",
      className
    )}>
      <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
        <Lightbulb className="h-4 w-4 text-primary" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium">{title}</p>
        <p className="text-xs text-muted-foreground mt-0.5">{content}</p>
      </div>
      <Button
        variant="ghost"
        size="icon"
        className="h-6 w-6 flex-shrink-0"
        onClick={dismiss}
      >
        <X className="h-3 w-3" />
      </Button>
    </div>
  );
}

// Feature hint badge that appears on first use
interface FeatureBadgeProps {
  id: string;
  label: string;
  className?: string;
}

export function FeatureBadge({ id, label, className }: FeatureBadgeProps) {
  const storageKey = `feature-seen-${id}`;
  const [seen, setSeen] = useState(() => {
    return localStorage.getItem(storageKey) === 'true';
  });

  const markSeen = () => {
    localStorage.setItem(storageKey, 'true');
    setSeen(true);
  };

  if (seen) return null;

  return (
    <span
      onClick={markSeen}
      className={cn(
        "absolute -top-1 -right-1 px-1.5 py-0.5 text-[10px] font-medium rounded bg-primary text-primary-foreground cursor-pointer animate-pulse",
        className
      )}
    >
      {label}
    </span>
  );
}

// Predefined help content
export const HELP_CONTENT = {
  mentioning: {
    title: '@mention Agents',
    content: 'Type @ followed by an agent name to direct your message to that agent. For example: @Nova build a login page',
  },
  commandPalette: {
    title: 'Command Palette',
    content: 'Press Cmd+K (or Ctrl+K) to quickly search for pages, agents, and actions.',
  },
  agentStatus: {
    title: 'Agent Status',
    content: 'Green = executing, Yellow = thinking, Blue = waiting, Gray = idle. Click an agent to see details.',
  },
  multiAgent: {
    title: 'Multi-Agent Selection',
    content: 'Select multiple agents to assign coordinated tasks. The Planner agent will delegate work to specialists.',
  },
};
