import { useEffect, useRef } from 'react';
import { ChatAgent } from '@/types/chat';
import { cn } from '@/lib/utils';

interface AgentMentionPopoverProps {
  suggestions: ChatAgent[];
  selectedIndex: number;
  onSelect: (agent: ChatAgent) => void;
  position?: 'above' | 'below';
}

export function AgentMentionPopover({
  suggestions,
  selectedIndex,
  onSelect,
  position = 'above',
}: AgentMentionPopoverProps) {
  const listRef = useRef<HTMLDivElement>(null);

  // Scroll selected item into view
  useEffect(() => {
    if (listRef.current) {
      const selectedEl = listRef.current.querySelector(`[data-index="${selectedIndex}"]`);
      selectedEl?.scrollIntoView({ block: 'nearest' });
    }
  }, [selectedIndex]);

  if (suggestions.length === 0) return null;

  return (
    <div
      ref={listRef}
      className={cn(
        'absolute left-0 right-0 mx-4 bg-popover border border-border rounded-lg shadow-lg overflow-hidden z-50',
        position === 'above' ? 'bottom-full mb-2' : 'top-full mt-2'
      )}
    >
      <div className="p-1 max-h-48 overflow-y-auto">
        <p className="px-2 py-1 text-xs text-muted-foreground font-medium">
          Mention an agent
        </p>
        {suggestions.map((agent, index) => (
          <button
            key={agent.id}
            data-index={index}
            onClick={() => onSelect(agent)}
            className={cn(
              'w-full flex items-center gap-3 px-2 py-2 rounded-md text-left transition-colors',
              index === selectedIndex
                ? 'bg-primary/10 text-primary'
                : 'hover:bg-secondary'
            )}
          >
            <div className="w-8 h-8 rounded-full bg-secondary flex items-center justify-center text-base">
              {agent.avatar}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <span className="font-medium text-sm">{agent.name}</span>
                <span className="text-xs text-muted-foreground">- {agent.title}</span>
              </div>
              <div className="flex gap-1 mt-0.5">
                {agent.capabilities.slice(0, 2).map((cap) => (
                  <span
                    key={cap}
                    className="text-[10px] bg-muted px-1.5 py-0.5 rounded"
                  >
                    {cap}
                  </span>
                ))}
              </div>
            </div>
            <span
              className={cn(
                'w-2 h-2 rounded-full',
                agent.status === 'available' && 'bg-success',
                agent.status === 'busy' && 'bg-warning',
                agent.status === 'offline' && 'bg-muted-foreground'
              )}
            />
          </button>
        ))}
      </div>
      <div className="px-3 py-1.5 border-t border-border bg-muted/50">
        <p className="text-[10px] text-muted-foreground">
          ↑↓ navigate • Enter select • Esc close
        </p>
      </div>
    </div>
  );
}
