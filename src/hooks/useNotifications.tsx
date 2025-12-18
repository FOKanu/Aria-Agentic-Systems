import { useState, createContext, useContext, useCallback, ReactNode } from 'react';

export type NotificationType = 'info' | 'success' | 'warning' | 'error';

export interface Notification {
  id: string;
  type: NotificationType;
  title: string;
  message: string;
  timestamp: Date;
  read: boolean;
  agentId?: string;
  agentName?: string;
  actionLabel?: string;
  onAction?: () => void;
}

interface NotificationContextType {
  notifications: Notification[];
  unreadCount: number;
  addNotification: (notification: Omit<Notification, 'id' | 'timestamp' | 'read'>) => void;
  markAsRead: (id: string) => void;
  markAllAsRead: () => void;
  clearAll: () => void;
  removeNotification: (id: string) => void;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export function NotificationProvider({ children }: { children: ReactNode }) {
  const [notifications, setNotifications] = useState<Notification[]>([
    // Sample notifications
    {
      id: '1',
      type: 'success',
      title: 'Task Completed',
      message: 'Nova finished building the login page',
      timestamp: new Date(Date.now() - 5 * 60 * 1000),
      read: false,
      agentId: 'nova',
      agentName: 'Nova',
    },
    {
      id: '2',
      type: 'info',
      title: 'Agent Started',
      message: 'Flux began deployment pipeline',
      timestamp: new Date(Date.now() - 15 * 60 * 1000),
      read: false,
      agentId: 'flux',
      agentName: 'Flux',
    },
    {
      id: '3',
      type: 'warning',
      title: 'Approval Required',
      message: 'Atlas needs approval for database migration',
      timestamp: new Date(Date.now() - 30 * 60 * 1000),
      read: true,
      agentId: 'atlas',
      agentName: 'Atlas',
      actionLabel: 'Review',
    },
  ]);

  const unreadCount = notifications.filter(n => !n.read).length;

  const addNotification = useCallback((notification: Omit<Notification, 'id' | 'timestamp' | 'read'>) => {
    const newNotification: Notification = {
      ...notification,
      id: Date.now().toString(),
      timestamp: new Date(),
      read: false,
    };
    setNotifications(prev => [newNotification, ...prev]);
  }, []);

  const markAsRead = useCallback((id: string) => {
    setNotifications(prev => 
      prev.map(n => n.id === id ? { ...n, read: true } : n)
    );
  }, []);

  const markAllAsRead = useCallback(() => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
  }, []);

  const clearAll = useCallback(() => {
    setNotifications([]);
  }, []);

  const removeNotification = useCallback((id: string) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  }, []);

  return (
    <NotificationContext.Provider value={{
      notifications,
      unreadCount,
      addNotification,
      markAsRead,
      markAllAsRead,
      clearAll,
      removeNotification,
    }}>
      {children}
    </NotificationContext.Provider>
  );
}

export function useNotifications() {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotifications must be used within NotificationProvider');
  }
  return context;
}
