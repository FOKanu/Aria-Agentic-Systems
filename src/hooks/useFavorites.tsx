import { useState, useEffect, createContext, useContext, ReactNode, useCallback } from 'react';

interface FavoritesContextType {
  favoriteAgentIds: string[];
  toggleFavorite: (agentId: string) => void;
  isFavorite: (agentId: string) => boolean;
  reorderFavorites: (agentIds: string[]) => void;
}

const FavoritesContext = createContext<FavoritesContextType | undefined>(undefined);

const STORAGE_KEY = 'agent-command-favorites';

export function FavoritesProvider({ children }: { children: ReactNode }) {
  const [favoriteAgentIds, setFavoriteAgentIds] = useState<string[]>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  });

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(favoriteAgentIds));
  }, [favoriteAgentIds]);

  const toggleFavorite = useCallback((agentId: string) => {
    setFavoriteAgentIds(prev => {
      if (prev.includes(agentId)) {
        return prev.filter(id => id !== agentId);
      }
      return [...prev, agentId];
    });
  }, []);

  const isFavorite = useCallback((agentId: string) => {
    return favoriteAgentIds.includes(agentId);
  }, [favoriteAgentIds]);

  const reorderFavorites = useCallback((agentIds: string[]) => {
    setFavoriteAgentIds(agentIds);
  }, []);

  return (
    <FavoritesContext.Provider value={{
      favoriteAgentIds,
      toggleFavorite,
      isFavorite,
      reorderFavorites,
    }}>
      {children}
    </FavoritesContext.Provider>
  );
}

export function useFavorites() {
  const context = useContext(FavoritesContext);
  if (!context) {
    throw new Error('useFavorites must be used within FavoritesProvider');
  }
  return context;
}
