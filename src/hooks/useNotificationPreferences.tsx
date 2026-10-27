import { useState, useEffect, createContext, useContext, ReactNode, useCallback } from 'react';

export interface NotificationPreferences {
  // Global settings
  enabled: boolean;
  sound: boolean;
  
  // Category settings
  taskCompletions: boolean;
  taskFailures: boolean;
  agentStatus: boolean;
  approvalRequests: boolean;
  systemAlerts: boolean;
  
  // Delivery preferences
  showInApp: boolean;
  showBadge: boolean;
}

const DEFAULT_PREFERENCES: NotificationPreferences = {
  enabled: true,
  sound: false,
  taskCompletions: true,
  taskFailures: true,
  agentStatus: true,
  approvalRequests: true,
  systemAlerts: true,
  showInApp: true,
  showBadge: true,
};

const STORAGE_KEY = 'agent-command-notification-prefs';

interface NotificationPreferencesContextType {
  preferences: NotificationPreferences;
  updatePreference: <K extends keyof NotificationPreferences>(key: K, value: NotificationPreferences[K]) => void;
  resetToDefault: () => void;
  shouldShowNotification: (type: 'task_complete' | 'task_fail' | 'agent_status' | 'approval' | 'system') => boolean;
}

const NotificationPreferencesContext = createContext<NotificationPreferencesContextType | undefined>(undefined);

export function NotificationPreferencesProvider({ children }: { children: ReactNode }) {
  const [preferences, setPreferences] = useState<NotificationPreferences>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      return stored ? { ...DEFAULT_PREFERENCES, ...JSON.parse(stored) } : DEFAULT_PREFERENCES;
    } catch {
      return DEFAULT_PREFERENCES;
    }
  });

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(preferences));
  }, [preferences]);

  const updatePreference = useCallback(<K extends keyof NotificationPreferences>(
    key: K, 
    value: NotificationPreferences[K]
  ) => {
    setPreferences(prev => ({ ...prev, [key]: value }));
  }, []);

  const resetToDefault = useCallback(() => {
    setPreferences(DEFAULT_PREFERENCES);
  }, []);

  const shouldShowNotification = useCallback((type: 'task_complete' | 'task_fail' | 'agent_status' | 'approval' | 'system') => {
    if (!preferences.enabled || !preferences.showInApp) return false;
    
    switch (type) {
      case 'task_complete': return preferences.taskCompletions;
      case 'task_fail': return preferences.taskFailures;
      case 'agent_status': return preferences.agentStatus;
      case 'approval': return preferences.approvalRequests;
      case 'system': return preferences.systemAlerts;
      default: return true;
    }
  }, [preferences]);

  return (
    <NotificationPreferencesContext.Provider value={{
      preferences,
      updatePreference,
      resetToDefault,
      shouldShowNotification,
    }}>
      {children}
    </NotificationPreferencesContext.Provider>
  );
}

export function useNotificationPreferences() {
  const context = useContext(NotificationPreferencesContext);
  if (!context) {
    throw new Error('useNotificationPreferences must be used within NotificationPreferencesProvider');
  }
  return context;
}
