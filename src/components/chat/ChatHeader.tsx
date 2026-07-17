import { Volume2, VolumeX, Users } from 'lucide-react';
import { cn } from '@/lib/utils';
import { ChatStatus } from '@/types/chat';
import { Button } from '@/components/ui/button';

interface ChatHeaderProps {
  status: ChatStatus;
  selectedAgentCount: number;
  audioEnabled: boolean;
  onToggleAudio: () => void;
  onOpenAgentSelector: () => void;
  /** e.g. "Local AI · Qwen3 8B" */
  routingLabel?: string;
  primaryAgentName?: string;
}

const statusConfig: Record<ChatStatus, { label: string; className: string }> = {
  idle: { label: 'Idle', className: 'bg-muted text-muted-foreground' },
  listening: { label: 'Listening...', className: 'bg-primary/20 text-primary animate-pulse' },
  thinking: { label: 'Thinking...', className: 'bg-warning/20 text-warning animate-pulse' },
  executing: { label: 'Executing...', className: 'bg-success/20 text-success animate-pulse' },
};

export function ChatHeader({
  status,
  selectedAgentCount,
  audioEnabled,
  onToggleAudio,
  onOpenAgentSelector,
  routingLabel,
  primaryAgentName,
}: ChatHeaderProps) {
  const statusInfo = statusConfig[status];

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-card/95 backdrop-blur-xl border-b border-border lg:left-20">
      <div className="flex items-center justify-between h-14 px-4 max-w-4xl mx-auto gap-2">
        <div className="flex items-center gap-3 min-w-0">
          <h1 className="text-lg font-semibold font-display shrink-0">Agent Chat</h1>
          <span className={cn('px-2 py-1 rounded-full text-xs font-medium shrink-0', statusInfo.className)}>
            {statusInfo.label}
          </span>
          {(primaryAgentName || routingLabel) && (
            <span className="hidden sm:inline text-xs text-muted-foreground truncate">
              {primaryAgentName}
              {primaryAgentName && routingLabel ? ' · ' : ''}
              {routingLabel}
            </span>
          )}
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <Button
            variant="ghost"
            size="sm"
            onClick={onOpenAgentSelector}
            className="flex items-center gap-2"
          >
            <Users className="w-4 h-4" />
            <span className="text-sm">{selectedAgentCount}</span>
          </Button>

          <Button
            variant="ghost"
            size="icon"
            onClick={onToggleAudio}
            className={cn(audioEnabled && 'text-primary')}
          >
            {audioEnabled ? <Volume2 className="w-5 h-5" /> : <VolumeX className="w-5 h-5" />}
          </Button>
        </div>
      </div>
    </header>
  );
}
