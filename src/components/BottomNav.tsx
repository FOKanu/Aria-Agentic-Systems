import { useState } from 'react';
import { LayoutDashboard, ListTodo, Eye, Brain, Settings, Rocket, ChevronLeft, ChevronRight } from 'lucide-react';
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
  const [isCollapsed, setIsCollapsed] = useState(true);

  if (isDesktop) {
    const handleTabClick = (tabId: TabId) => {
      onTabChange(tabId);
      setIsCollapsed(true);
    };

    return (
      <>
        {/* Collapsed state - just a toggle button */}
        <button
          onClick={() => setIsCollapsed(false)}
          className={cn(
            "fixed top-20 left-20 z-40 p-2 rounded-lg bg-card/80 backdrop-blur border border-border hover:bg-secondary transition-all",
            !isCollapsed && "opacity-0 pointer-events-none"
          )}
        >
          <ChevronRight className="w-5 h-5 text-muted-foreground" />
        </button>

        {/* Expanded sidebar */}
        <nav 
          className={cn(
            "fixed top-14 left-20 h-[calc(100vh-3.5rem)] w-48 bg-card/95 backdrop-blur-xl border-r border-border z-30 transition-transform duration-200",
            isCollapsed && "-translate-x-full opacity-0 pointer-events-none"
          )}
        >
          <div className="flex flex-col gap-1 p-3 pt-6">
            <button
              onClick={() => setIsCollapsed(true)}
              className="self-end p-2 rounded-lg hover:bg-secondary transition-colors mb-2"
            >
              <ChevronLeft className="w-5 h-5 text-muted-foreground" />
            </button>
            {tabs.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              
              return (
                <button
                  key={tab.id}
                  onClick={() => handleTabClick(tab.id)}
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
      </>
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
