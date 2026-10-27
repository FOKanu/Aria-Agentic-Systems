import { Star } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { useFavorites } from '@/hooks/useFavorites';
import { cn } from '@/lib/utils';

interface FavoriteButtonProps {
  agentId: string;
  size?: 'sm' | 'default';
  showLabel?: boolean;
  className?: string;
}

export function FavoriteButton({ 
  agentId, 
  size = 'default',
  showLabel = false,
  className 
}: FavoriteButtonProps) {
  const { isFavorite, toggleFavorite } = useFavorites();
  const favorited = isFavorite(agentId);

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <Button
          variant="ghost"
          size={size === 'sm' ? 'icon' : 'sm'}
          className={cn(
            size === 'sm' ? "h-7 w-7" : "h-8",
            className
          )}
          onClick={(e) => {
            e.stopPropagation();
            toggleFavorite(agentId);
          }}
        >
          <Star 
            className={cn(
              size === 'sm' ? "h-3.5 w-3.5" : "h-4 w-4",
              favorited && "fill-yellow-500 text-yellow-500"
            )} 
          />
          {showLabel && (
            <span className="ml-1.5">
              {favorited ? 'Favorited' : 'Favorite'}
            </span>
          )}
        </Button>
      </TooltipTrigger>
      <TooltipContent>
        {favorited ? 'Remove from favorites' : 'Add to favorites'}
      </TooltipContent>
    </Tooltip>
  );
}

// Quick access bar for favorite agents
interface FavoriteAgentsBarProps {
  agents: Array<{ id: string; name: string; avatar: string; status: string }>;
  onSelectAgent: (agentId: string) => void;
  className?: string;
}

export function FavoriteAgentsBar({ agents, onSelectAgent, className }: FavoriteAgentsBarProps) {
  const { favoriteAgentIds } = useFavorites();
  const favoriteAgents = agents.filter(a => favoriteAgentIds.includes(a.id));

  if (favoriteAgents.length === 0) return null;

  return (
    <div className={cn("flex items-center gap-2", className)}>
      <span className="text-xs text-muted-foreground flex items-center gap-1">
        <Star className="h-3 w-3 fill-yellow-500 text-yellow-500" />
        Favorites
      </span>
      <div className="flex items-center gap-1">
        {favoriteAgents.map(agent => (
          <Tooltip key={agent.id}>
            <TooltipTrigger asChild>
              <button
                onClick={() => onSelectAgent(agent.id)}
                className="w-8 h-8 rounded-full bg-secondary flex items-center justify-center hover:ring-2 ring-primary transition-all"
              >
                <span className="text-sm">{agent.avatar}</span>
              </button>
            </TooltipTrigger>
            <TooltipContent>{agent.name}</TooltipContent>
          </Tooltip>
        ))}
      </div>
    </div>
  );
}
