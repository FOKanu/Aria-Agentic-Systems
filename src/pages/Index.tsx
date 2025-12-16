import { useState, useEffect } from 'react';
import { StatusBar } from '@/components/StatusBar';
import { BottomNav, TabId } from '@/components/BottomNav';
import { DashboardPage } from '@/pages/DashboardPage';
import { TasksPage } from '@/pages/TasksPage';
import { VisionPage } from '@/pages/VisionPage';
import { MemoryPage } from '@/pages/MemoryPage';
import { SettingsPage } from '@/pages/SettingsPage';
import { AgentState, AutonomyLevel } from '@/types/agent';
import { useToast } from '@/hooks/use-toast';

const Index = () => {
  const [activeTab, setActiveTab] = useState<TabId>('dashboard');
  const [agentState, setAgentState] = useState<AgentState>('executing');
  const [autonomyLevel, setAutonomyLevel] = useState<AutonomyLevel>('assisted');
  const [isPaused, setIsPaused] = useState(false);
  const [taskTime, setTaskTime] = useState(720); // 12 minutes in seconds
  const { toast } = useToast();

  // Simulate task timer
  useEffect(() => {
    if (!isPaused && agentState === 'executing') {
      const timer = setInterval(() => {
        setTaskTime(prev => prev + 1);
      }, 1000);
      return () => clearInterval(timer);
    }
  }, [isPaused, agentState]);

  const handleStop = () => {
    setAgentState('idle');
    setIsPaused(false);
    toast({
      title: "Agent Stopped",
      description: "Emergency stop activated. All operations halted.",
      variant: "destructive",
    });
  };

  const handlePause = () => {
    setIsPaused(true);
    setAgentState('waiting');
    toast({
      title: "Agent Paused",
      description: "Operations paused. Click Resume to continue.",
    });
  };

  const handleResume = () => {
    setIsPaused(false);
    setAgentState('executing');
    toast({
      title: "Agent Resumed",
      description: "Operations resumed.",
    });
  };

  const handleApprove = () => {
    toast({
      title: "Action Approved",
      description: "Next action has been approved for execution.",
    });
  };

  const renderPage = () => {
    switch (activeTab) {
      case 'dashboard':
        return (
          <DashboardPage
            agentState={agentState}
            isPaused={isPaused}
            onPause={handlePause}
            onResume={handleResume}
            onApprove={handleApprove}
          />
        );
      case 'tasks':
        return <TasksPage />;
      case 'vision':
        return <VisionPage />;
      case 'memory':
        return <MemoryPage />;
      case 'settings':
        return (
          <SettingsPage
            autonomyLevel={autonomyLevel}
            onAutonomyChange={setAutonomyLevel}
          />
        );
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <StatusBar
        state={agentState}
        activeTaskTime={taskTime}
        autonomyLevel={autonomyLevel}
        onStop={handleStop}
      />
      
      <main className="pt-14 pb-16 px-4 max-w-4xl mx-auto">
        {renderPage()}
      </main>
      
      <BottomNav activeTab={activeTab} onTabChange={setActiveTab} />
    </div>
  );
};

export default Index;
