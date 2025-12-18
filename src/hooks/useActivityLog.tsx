import { useState, createContext, useContext, useCallback, ReactNode } from 'react';

export type ActivityType = 'agent_start' | 'agent_stop' | 'agent_pause' | 'task_complete' | 'task_fail' | 'approval' | 'system' | 'user_action';

export interface ActivityEvent {
  id: string;
  type: ActivityType;
  title: string;
  description?: string;
  timestamp: Date;
  agentId?: string;
  agentName?: string;
  metadata?: Record<string, unknown>;
}

interface ActivityLogContextType {
  activities: ActivityEvent[];
  addActivity: (activity: Omit<ActivityEvent, 'id' | 'timestamp'>) => void;
  clearActivities: () => void;
}

const ActivityLogContext = createContext<ActivityLogContextType | undefined>(undefined);

export function ActivityLogProvider({ children }: { children: ReactNode }) {
  const [activities, setActivities] = useState<ActivityEvent[]>([
    {
      id: '1',
      type: 'task_complete',
      title: 'Task completed',
      description: 'Nova finished "Build login page"',
      timestamp: new Date(Date.now() - 2 * 60 * 1000),
      agentId: 'nova',
      agentName: 'Nova',
    },
    {
      id: '2',
      type: 'agent_start',
      title: 'Agent started',
      description: 'Flux began deployment pipeline',
      timestamp: new Date(Date.now() - 8 * 60 * 1000),
      agentId: 'flux',
      agentName: 'Flux',
    },
    {
      id: '3',
      type: 'approval',
      title: 'Approval requested',
      description: 'Atlas requested approval for database migration',
      timestamp: new Date(Date.now() - 15 * 60 * 1000),
      agentId: 'atlas',
      agentName: 'Atlas',
    },
    {
      id: '4',
      type: 'user_action',
      title: 'User logged in',
      description: 'Session started',
      timestamp: new Date(Date.now() - 45 * 60 * 1000),
    },
    {
      id: '5',
      type: 'system',
      title: 'System check',
      description: 'All agents operational',
      timestamp: new Date(Date.now() - 60 * 60 * 1000),
    },
  ]);

  const addActivity = useCallback((activity: Omit<ActivityEvent, 'id' | 'timestamp'>) => {
    const newActivity: ActivityEvent = {
      ...activity,
      id: Date.now().toString(),
      timestamp: new Date(),
    };
    setActivities(prev => [newActivity, ...prev].slice(0, 100)); // Keep last 100
  }, []);

  const clearActivities = useCallback(() => {
    setActivities([]);
  }, []);

  return (
    <ActivityLogContext.Provider value={{ activities, addActivity, clearActivities }}>
      {children}
    </ActivityLogContext.Provider>
  );
}

export function useActivityLog() {
  const context = useContext(ActivityLogContext);
  if (!context) {
    throw new Error('useActivityLog must be used within ActivityLogProvider');
  }
  return context;
}
