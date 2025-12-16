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
import { FleetCommandPage } from '@/pages/FleetCommandPage';
import { SkillTreePage } from '@/pages/SkillTreePage';
import { AgentCreationWizard } from '@/components/AgentCreationWizard';
import { AgentState, AutonomyLevel } from '@/types/agent';
import { useToast } from '@/hooks/use-toast';
import { mockAgents, globalCredits, fleetStatus } from '@/data/agentsData';
import { Agent } from '@/components/AgentRail';

const Index = () => {
  const [activeTab, setActiveTab] = useState<TabId>('dashboard');
  const [agents, setAgents] = useState<Agent[]>(mockAgents);
  const [selectedAgentId, setSelectedAgentId] = useState<string | null>(mockAgents[0]?.id || null);
  const [agentState, setAgentState] = useState<AgentState>('executing');
  const [autonomyLevel, setAutonomyLevel] = useState<AutonomyLevel>('assisted');
  const [isPaused, setIsPaused] = useState(false);
  const [taskTime, setTaskTime] = useState(720);
  const [showCreationWizard, setShowCreationWizard] = useState(false);
  const { toast } = useToast();

  const selectedAgent = agents.find(a => a.id === selectedAgentId);
  const activeAgentsCount = agents.filter(a => a.status !== 'idle' && a.status !== 'stunned').length;

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
    setActiveTab('fleet');
  };

  const handleCreateAgent = () => {
    setShowCreationWizard(true);
  };

  const handleAgentCreated = (newAgentData: { name: string; avatar: string; class: 'assistant' | 'coder' | 'researcher'; stats: { accuracy: number; speed: number; creativity: number } }) => {
    const newAgent: Agent = {
      id: `agent-${Date.now()}`,
      name: newAgentData.name,
      avatar: newAgentData.avatar,
      class: newAgentData.class,
      status: 'idle',
      level: 1,
    };
    setAgents(prev => [...prev, newAgent]);
    setSelectedAgentId(newAgent.id);
    setActiveTab('dashboard');
  };

  const handleSelectAgentFromFleet = (agentId: string) => {
    setSelectedAgentId(agentId);
    setActiveTab('dashboard');
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
        return <SkillTreePage />;
      case 'fleet':
        return <FleetCommandPage onSelectAgent={handleSelectAgentFromFleet} />;
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-background corner-glow">
      {/* Left Agent Rail - Desktop */}
      <div className="hidden lg:block">
        <AgentRail
          agents={agents}
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
          totalAgents={agents.length}
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

      {/* Agent Creation Wizard */}
      <AgentCreationWizard
        open={showCreationWizard}
        onClose={() => setShowCreationWizard(false)}
        onComplete={handleAgentCreated}
      />
    </div>
  );
};

export default Index;
