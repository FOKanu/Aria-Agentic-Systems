import { useState } from 'react';
import { Eye, Activity, GitBranch, Wrench, AlertTriangle, Monitor } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { VisionPage } from './VisionPage';
import { ActivityStreamPage } from './monitoring/ActivityStreamPage';
import { ExecutionTracePage } from './monitoring/ExecutionTracePage';
import { ToolMonitorPage } from './monitoring/ToolMonitorPage';
import { AlertsControlsPage } from './monitoring/AlertsControlsPage';

type MonitoringTab = 'vision' | 'activity' | 'trace' | 'tools' | 'alerts';

const monitoringTabs: { id: MonitoringTab; label: string; icon: React.ElementType; description: string }[] = [
  { id: 'vision', label: 'Vision', icon: Eye, description: 'Live screen surveillance' },
  { id: 'activity', label: 'Activity', icon: Activity, description: 'Real-time action stream' },
  { id: 'trace', label: 'Trace', icon: GitBranch, description: 'Execution path analysis' },
  { id: 'tools', label: 'Tools', icon: Wrench, description: 'API & tool monitoring' },
  { id: 'alerts', label: 'Alerts', icon: AlertTriangle, description: 'Alerts & controls' },
];

export function MonitoringPage() {
  const [activeTab, setActiveTab] = useState<MonitoringTab>('vision');

  return (
    <div className="space-y-4 animate-slide-up">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary/20 to-holo/20 flex items-center justify-center border border-primary/30">
          <Monitor className="w-5 h-5 text-primary" />
        </div>
        <div>
          <h1 className="text-xl font-display font-bold">Monitoring Hub</h1>
          <p className="text-xs text-muted-foreground">Real-time agent surveillance & control</p>
        </div>
      </div>

      {/* Tab Navigation */}
      <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as MonitoringTab)} className="w-full">
        <TabsList className="w-full h-auto p-1 bg-secondary/50 border border-border grid grid-cols-5 gap-1">
          {monitoringTabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <TabsTrigger
                key={tab.id}
                value={tab.id}
                className={cn(
                  "flex flex-col items-center gap-1 py-2 px-1 rounded-lg transition-all data-[state=active]:bg-primary data-[state=active]:text-primary-foreground",
                  "text-muted-foreground hover:text-foreground"
                )}
              >
                <Icon className="w-4 h-4" />
                <span className="text-[10px] font-medium">{tab.label}</span>
              </TabsTrigger>
            );
          })}
        </TabsList>

        {/* Tab Content */}
        <TabsContent value="vision" className="mt-4">
          <VisionPage />
        </TabsContent>
        
        <TabsContent value="activity" className="mt-4">
          <ActivityStreamPage />
        </TabsContent>
        
        <TabsContent value="trace" className="mt-4">
          <ExecutionTracePage />
        </TabsContent>
        
        <TabsContent value="tools" className="mt-4">
          <ToolMonitorPage />
        </TabsContent>
        
        <TabsContent value="alerts" className="mt-4">
          <AlertsControlsPage />
        </TabsContent>
      </Tabs>
    </div>
  );
}
