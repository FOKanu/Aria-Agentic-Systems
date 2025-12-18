import { cn } from '@/lib/utils';

interface TypingIndicatorProps {
  agentName?: string;
  agentAvatar?: string;
  className?: string;
}

export function TypingIndicator({ agentName, agentAvatar, className }: TypingIndicatorProps) {
  return (
    <div className={cn("flex items-start gap-3", className)}>
      {agentAvatar && (
        <div className="w-8 h-8 rounded-full bg-secondary flex items-center justify-center flex-shrink-0">
          <span className="text-sm">{agentAvatar}</span>
        </div>
      )}
      <div className="flex flex-col gap-1">
        {agentName && (
          <span className="text-xs text-muted-foreground">{agentName} is typing...</span>
        )}
        <div className="flex items-center gap-1 px-4 py-3 rounded-2xl rounded-tl-sm bg-secondary">
          <span className="w-2 h-2 rounded-full bg-muted-foreground/60 animate-bounce [animation-delay:-0.3s]" />
          <span className="w-2 h-2 rounded-full bg-muted-foreground/60 animate-bounce [animation-delay:-0.15s]" />
          <span className="w-2 h-2 rounded-full bg-muted-foreground/60 animate-bounce" />
        </div>
      </div>
    </div>
  );
}

// Processing indicator for when agent is working on a task
export function ProcessingIndicator({ 
  agentName, 
  agentAvatar,
  task,
  className 
}: TypingIndicatorProps & { task?: string }) {
  return (
    <div className={cn("flex items-start gap-3", className)}>
      {agentAvatar && (
        <div className="w-8 h-8 rounded-full bg-secondary flex items-center justify-center flex-shrink-0 relative">
          <span className="text-sm">{agentAvatar}</span>
          <span className="absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full bg-primary animate-pulse" />
        </div>
      )}
      <div className="flex flex-col gap-1.5 max-w-[280px]">
        <div className="flex items-center gap-2">
          {agentName && (
            <span className="text-xs font-medium">{agentName}</span>
          )}
          <span className="text-xs text-muted-foreground">is processing</span>
        </div>
        <div className="px-4 py-3 rounded-2xl rounded-tl-sm bg-secondary/80 border border-border">
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded-full border-2 border-primary border-t-transparent animate-spin" />
            <span className="text-sm text-muted-foreground">
              {task || 'Working on it...'}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
