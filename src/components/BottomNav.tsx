import { LayoutDashboard, ListTodo, Eye, Brain, Settings, Rocket } from 'lucide-react';
import { cn } from '@/lib/utils';

export type TabId = 'dashboard' | 'tasks' | 'vision' | 'memory' | 'settings' | 'fleet';

interface BottomNavProps {
  activeTab: TabId;
  onTabChange: (tab: TabId) => void;
  isDesktop?: boolean;
}

const tabs: { id: TabId; label: string; icon: React.ElementType }[] = [
  { id: 'fleet', label: 'Fleet', icon: Rocket },
  { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { id: 'tasks', label: 'Missions', icon: ListTodo },
  { id: 'vision', label: 'Vision', icon: Eye },
  { id: 'memory', label: 'Memory', icon: Brain },
  { id: 'settings', label: 'Skills', icon: Settings },
];

export function BottomNav({ activeTab, onTabChange, isDesktop }: BottomNavProps) {
  if (isDesktop) {
    return (
      <nav className="fixed top-14 left-20 h-[calc(100vh-3.5rem)] w-48 bg-card/60 backdrop-blur-xl border-r border-border z-30">
        <div className="flex flex-col gap-1 p-3 pt-6">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            
            return (
              <button
                key={tab.id}
                onClick={() => onTabChange(tab.id)}
                className={cn(
                  'flex items-center gap-3 px-4 py-3 rounded-xl transition-all font-display font-medium',
                  isActive 
                    ? 'bg-primary/20 text-primary glow-primary' 
                    : 'text-muted-foreground hover:text-foreground hover:bg-secondary/50'
                )}
              >
                <Icon className={cn('w-5 h-5', isActive && 'drop-shadow-[0_0_8px_hsl(var(--primary))]')} />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>
      </nav>
    );
  }

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-card/95 backdrop-blur-xl border-t border-border">
      <div className="flex items-center justify-around max-w-lg mx-auto">
        {tabs.map((tab) => {
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
