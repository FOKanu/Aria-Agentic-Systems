import { useState, useEffect, createContext, useContext, ReactNode, useCallback } from 'react';

export type WidgetId = 'stats' | 'activity' | 'tasks' | 'agents' | 'chat';

export interface DashboardWidget {
  id: WidgetId;
  name: string;
  description: string;
  enabled: boolean;
  order: number;
}

const DEFAULT_WIDGETS: DashboardWidget[] = [
  { id: 'stats', name: 'Quick Stats', description: 'Tasks completed, success rate, avg time', enabled: true, order: 0 },
  { id: 'activity', name: 'Activity Log', description: 'Recent platform events', enabled: true, order: 1 },
  { id: 'tasks', name: 'Current Task', description: 'Active task progress', enabled: true, order: 2 },
  { id: 'agents', name: 'Agent Overview', description: 'Active agents summary', enabled: true, order: 3 },
  { id: 'chat', name: 'Quick Chat', description: 'Mini chat widget', enabled: false, order: 4 },
];

const STORAGE_KEY = 'agent-command-dashboard-widgets';

interface DashboardCustomizationContextType {
  widgets: DashboardWidget[];
  toggleWidget: (id: WidgetId) => void;
  reorderWidgets: (widgets: DashboardWidget[]) => void;
  resetToDefault: () => void;
  isWidgetEnabled: (id: WidgetId) => boolean;
  getEnabledWidgets: () => DashboardWidget[];
}

const DashboardCustomizationContext = createContext<DashboardCustomizationContextType | undefined>(undefined);

export function DashboardCustomizationProvider({ children }: { children: ReactNode }) {
  const [widgets, setWidgets] = useState<DashboardWidget[]>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      return stored ? JSON.parse(stored) : DEFAULT_WIDGETS;
    } catch {
      return DEFAULT_WIDGETS;
    }
  });

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(widgets));
  }, [widgets]);

  const toggleWidget = useCallback((id: WidgetId) => {
    setWidgets(prev => prev.map(w => 
      w.id === id ? { ...w, enabled: !w.enabled } : w
    ));
  }, []);

  const reorderWidgets = useCallback((newWidgets: DashboardWidget[]) => {
    setWidgets(newWidgets.map((w, i) => ({ ...w, order: i })));
  }, []);

  const resetToDefault = useCallback(() => {
    setWidgets(DEFAULT_WIDGETS);
  }, []);

  const isWidgetEnabled = useCallback((id: WidgetId) => {
    return widgets.find(w => w.id === id)?.enabled ?? false;
  }, [widgets]);

  const getEnabledWidgets = useCallback(() => {
    return widgets.filter(w => w.enabled).sort((a, b) => a.order - b.order);
  }, [widgets]);

  return (
    <DashboardCustomizationContext.Provider value={{
      widgets,
      toggleWidget,
      reorderWidgets,
      resetToDefault,
      isWidgetEnabled,
      getEnabledWidgets,
    }}>
      {children}
    </DashboardCustomizationContext.Provider>
  );
}

export function useDashboardCustomization() {
  const context = useContext(DashboardCustomizationContext);
  if (!context) {
    throw new Error('useDashboardCustomization must be used within DashboardCustomizationProvider');
  }
  return context;
}
