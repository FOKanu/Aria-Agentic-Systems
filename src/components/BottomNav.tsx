import { LayoutDashboard, ListTodo, Monitor, Brain, Settings, Bot, MessageSquare, Home, BarChart3, FolderOpen } from 'lucide-react';
import { cn } from '@/lib/utils';

export type TabId = 'home' | 'dashboard' | 'tasks' | 'monitoring' | 'memory' | 'settings' | 'agents' | 'chat' | 'analytics' | 'files' | 'calendar' | 'contacts' | 'email' | 'workflows' | 'phone' | 'reservations' | 'invoices' | 'expenses' | 'budget' | 'reports' | 'payments' | 'tax' | 'documents' | 'devops-pipelines' | 'devops-code-review' | 'devops-deployment' | 'devops-infrastructure' | 'devops-security' | 'devops-logs';

interface BottomNavProps {
  activeTab: TabId;
  onTabChange: (tab: TabId) => void;
}

const tabs: { id: TabId; label: string; icon: React.ElementType }[] = [
  { id: 'home', label: 'Home', icon: Home },
  { id: 'chat', label: 'Chat', icon: MessageSquare },
  { id: 'files', label: 'Files', icon: FolderOpen },
  { id: 'agents', label: 'Agents', icon: Bot },
  { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { id: 'tasks', label: 'Tasks', icon: ListTodo },
  { id: 'monitoring', label: 'Monitor', icon: Monitor },
  { id: 'memory', label: 'Memory', icon: Brain },
  { id: 'settings', label: 'Settings', icon: Settings },
];

export function BottomNav({ activeTab, onTabChange }: BottomNavProps) {
  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-card/95 backdrop-blur-xl border-t border-border">
      <div className="flex items-center justify-around max-w-lg mx-auto">
        {tabs.slice(0, 5).map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          
          return (
            <button
              key={tab.id}
              onClick={() => onTabChange(tab.id)}
              className={cn(
                'flex flex-col items-center gap-1 py-3 px-4 transition-all min-w-[64px]',
                isActive 
                  ? 'text-primary' 
                  : 'text-muted-foreground hover:text-foreground'
              )}
            >
              <Icon className={cn('w-5 h-5', isActive && 'drop-shadow-[0_0_8px_hsl(var(--primary))]')} />
              <span className="text-[10px] font-medium font-display">{tab.label}</span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}
