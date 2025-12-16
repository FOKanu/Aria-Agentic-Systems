import { useState, useEffect } from 'react';
import { StatusBar } from '@/components/StatusBar';
import { BottomNav, TabId } from '@/components/BottomNav';
import { AgentRail } from '@/components/AgentRail';
import { TopBar } from '@/components/TopBar';
import { DashboardPage } from '@/pages/DashboardPage';
import { TasksPage } from '@/pages/TasksPage';
import { VisionPage } from '@/pages/VisionPage';
import { MemoryPage } from '@/pages/MemoryPage';
import { SettingsPage } from '@/pages/SettingsPage';
import { AgentState, AutonomyLevel } from '@/types/agent';
import { useToast } from '@/hooks/use-toast';
import { mockAgents, globalCredits, fleetStatus } from '@/data/agentsData';

const Index = () => {
  const [activeTab, setActiveTab] = useState<TabId>('dashboard');
  const [selectedAgentId, setSelectedAgentId] = useState<string | null>(mockAgents[0]?.id || null);
  const [agentState, setAgentState] = useState<AgentState>('executing');
  const [autonomyLevel, setAutonomyLevel] = useState<AutonomyLevel>('assisted');
  const [isPaused, setIsPaused] = useState(false);
  const [taskTime, setTaskTime] = useState(720);
  const { toast } = useToast();

  const selectedAgent = mockAgents.find(a => a.id === selectedAgentId);
  const activeAgentsCount = mockAgents.filter(a => a.status !== 'idle' && a.status !== 'stunned').length;

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

  const handleOpenFleetCommand = () => {
    toast({
      title: "Fleet Command",
      description: "Fleet Command view coming in Phase 4!",
    });
  };

  const handleCreateAgent = () => {
    toast({
      title: "The Hangar",
      description: "Agent creation wizard coming in Phase 6!",
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
            selectedAgent={selectedAgent}
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
    <div className="min-h-screen bg-background corner-glow">
      {/* Left Agent Rail - Desktop */}
      <div className="hidden lg:block">
        <AgentRail
          agents={mockAgents}
          selectedAgentId={selectedAgentId}
          onSelectAgent={setSelectedAgentId}
          onOpenFleetCommand={handleOpenFleetCommand}
          onCreateAgent={handleCreateAgent}
        />
      </div>

      {/* Top Bar - Desktop */}
      <div className="hidden lg:block">
        <TopBar
          credits={globalCredits}
          fleetStatus={fleetStatus}
          activeAgents={activeAgentsCount}
          totalAgents={mockAgents.length}
        />
      </div>

      {/* Mobile Status Bar */}
      <div className="lg:hidden">
        <StatusBar
          state={agentState}
          activeTaskTime={taskTime}
          autonomyLevel={autonomyLevel}
          onStop={handleStop}
        />
      </div>
      
      {/* Main Content */}
      <main className="pt-14 pb-20 px-4 lg:pl-72 lg:pt-18 lg:pb-4 max-w-6xl relative z-10">
        {renderPage()}
      </main>
      
      {/* Bottom Nav - Mobile */}
      <div className="lg:hidden">
        <BottomNav activeTab={activeTab} onTabChange={setActiveTab} />
      </div>

      {/* Desktop Tab Bar */}
      <div className="hidden lg:block">
        <BottomNav activeTab={activeTab} onTabChange={setActiveTab} isDesktop />
      </div>
    </div>
  );
};

export default Index;
