import { useState, useEffect } from 'react';
import { StatusBar } from '@/components/StatusBar';
import { BottomNav, TabId } from '@/components/BottomNav';
import { AgentRail, Agent } from '@/components/AgentRail';
import { TopBar } from '@/components/TopBar';
import { HomePage } from '@/pages/HomePage';
import { DashboardPage } from '@/pages/DashboardPage';
import { TasksPage } from '@/pages/TasksPage';
import { VisionPage } from '@/pages/VisionPage';
import { MemoryPage } from '@/pages/MemoryPage';
import { AgentsPage } from '@/pages/AgentsPage';
import { SettingsPage } from '@/pages/SettingsPage';
import { AgentDetailsPage } from '@/pages/AgentDetailsPage';
import { AuthPage, MockUser } from '@/pages/AuthPage';
import { ProfilePage } from '@/pages/ProfilePage';
import { ChatPage } from '@/pages/ChatPage';
import { AgentState, AutonomyLevel } from '@/types/agent';
import { useToast } from '@/hooks/use-toast';
import { mockAgents as initialAgents, mockAgentStats, fleetStatus } from '@/data/agentsData';

type ViewMode = 'main' | 'details' | 'profile';

const Index = () => {
  // Auth state
  const [user, setUser] = useState<MockUser | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  // App state
  const [activeTab, setActiveTab] = useState<TabId>('home');
  const [viewMode, setViewMode] = useState<ViewMode>('main');
  const [agents, setAgents] = useState<Agent[]>(initialAgents);
  const [visibleAgentIds, setVisibleAgentIds] = useState<string[]>(initialAgents.map(a => a.id));
  const [selectedAgentId, setSelectedAgentId] = useState<string | null>(initialAgents[0]?.id || null);
  const [agentState, setAgentState] = useState<AgentState>('executing');
  const [autonomyLevel, setAutonomyLevel] = useState<AutonomyLevel>('assisted');
  const [isPaused, setIsPaused] = useState(false);
  const [taskTime, setTaskTime] = useState(720);
  const { toast } = useToast();

  const selectedAgent = agents.find(a => a.id === selectedAgentId);
  const selectedAgentStats = selectedAgentId ? mockAgentStats[selectedAgentId] : undefined;
  const activeAgentsCount = agents.filter(a => a.status !== 'idle' && a.status !== 'stunned').length;

  // Check for existing session on mount
  useEffect(() => {
    const savedUser = localStorage.getItem('fleet-commander-user');
    if (savedUser) {
      try {
        const parsedUser = JSON.parse(savedUser);
        parsedUser.createdAt = new Date(parsedUser.createdAt);
        setUser(parsedUser);
        setIsAuthenticated(true);
      } catch {
        localStorage.removeItem('fleet-commander-user');
      }
    }
  }, []);

  // Timer effect
  useEffect(() => {
    if (!isPaused && agentState === 'executing') {
      const timer = setInterval(() => {
        setTaskTime(prev => prev + 1);
      }, 1000);
      return () => clearInterval(timer);
    }
  }, [isPaused, agentState]);

  const handleLogin = (newUser: MockUser) => {
    setUser(newUser);
    setIsAuthenticated(true);
    localStorage.setItem('fleet-commander-user', JSON.stringify(newUser));
    toast({
      title: "Welcome",
      description: `Signed in as ${newUser.name}`,
    });
  };

  const handleLogout = () => {
    setUser(null);
    setIsAuthenticated(false);
    setViewMode('main');
    localStorage.removeItem('fleet-commander-user');
    toast({
      title: "Signed Out",
      description: "You have been logged out successfully.",
    });
  };

  const handleUpdateUser = (updatedUser: MockUser) => {
    setUser(updatedUser);
    localStorage.setItem('fleet-commander-user', JSON.stringify(updatedUser));
    toast({
      title: "Profile Updated",
      description: "Your profile has been updated.",
    });
  };

  const handleStop = () => {
    setAgentState('idle');
    setIsPaused(false);
    toast({
      title: "Agent Stopped",
      description: "All operations halted.",
      variant: "destructive",
    });
  };

  const handlePause = () => {
    setIsPaused(true);
    setAgentState('waiting');
    toast({
      title: "Agent Paused",
      description: "Operations paused.",
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
      description: "Next action approved for execution.",
    });
  };

  const handleOpenFleetCommand = () => {
    setActiveTab('agents');
    setViewMode('main');
  };

  const handleCreateAgent = () => {
    const newAgent: Agent = {
      id: `agent-${Date.now()}`,
      name: `Agent ${agents.length + 1}`,
      avatar: '🤖',
      title: 'Assistant',
      status: 'idle',
    };
    setAgents(prev => [...prev, newAgent]);
    setVisibleAgentIds(prev => [...prev, newAgent.id]);
    setSelectedAgentId(newAgent.id);
    toast({
      title: "Agent Created",
      description: `${newAgent.name} has been added to your fleet.`,
    });
  };

  const handleRemoveFromPanel = (agentId: string) => {
    setVisibleAgentIds(prev => prev.filter(id => id !== agentId));
    const agent = agents.find(a => a.id === agentId);
    toast({
      title: "Agent Hidden",
      description: `${agent?.name || 'Agent'} removed from panel. Task continues running.`,
    });
  };

  const handleAddToPanel = (agentId: string) => {
    setVisibleAgentIds(prev => [...prev, agentId]);
    const agent = agents.find(a => a.id === agentId);
    toast({
      title: "Agent Added",
      description: `${agent?.name || 'Agent'} added to panel.`,
    });
  };

  const handlePauseAgent = (agentId: string) => {
    setAgents(prev => prev.map(a => 
      a.id === agentId ? { ...a, status: 'waiting' as const } : a
    ));
    const agent = agents.find(a => a.id === agentId);
    toast({
      title: "Agent Paused",
      description: `${agent?.name || 'Agent'} has been paused.`,
    });
  };

  const handleResumeAgent = (agentId: string) => {
    setAgents(prev => prev.map(a => 
      a.id === agentId ? { ...a, status: 'executing' as const } : a
    ));
    const agent = agents.find(a => a.id === agentId);
    toast({
      title: "Agent Resumed",
      description: `${agent?.name || 'Agent'} has resumed.`,
    });
  };

  const handleStopAgent = (agentId: string) => {
    setAgents(prev => prev.map(a => 
      a.id === agentId ? { ...a, status: 'idle' as const } : a
    ));
    const agent = agents.find(a => a.id === agentId);
    toast({
      title: "Agent Stopped",
      description: `${agent?.name || 'Agent'} has been stopped.`,
      variant: "destructive",
    });
  };

  const handleModifyTask = (agentId: string) => {
    const agent = agents.find(a => a.id === agentId);
    toast({
      title: "Modify Task",
      description: `Opening task editor for ${agent?.name || 'Agent'}.`,
    });
    // Navigate to tasks page for modification
    setSelectedAgentId(agentId);
    setActiveTab('tasks');
  };

  const handleViewDetails = () => {
    setViewMode('details');
  };

  const handleSelectAgentAndViewDetails = (agentId: string) => {
    setSelectedAgentId(agentId);
    setViewMode('details');
  };

  const handleViewProfile = () => {
    setViewMode('profile');
  };

  const handleBackFromDetails = () => {
    setViewMode('main');
  };

  const handleNewMission = () => {
    setActiveTab('tasks');
    toast({
      title: "New Task",
      description: "Navigate to Tasks to create a new task.",
    });
  };

  const handleExportLogs = () => {
    toast({
      title: "Logs Exported",
      description: "Agent logs have been exported.",
    });
  };

  const handleSelectAgentFromFleet = (agentId: string) => {
    setSelectedAgentId(agentId);
    setActiveTab('dashboard');
    setViewMode('main');
  };

  const handleTabChange = (tab: TabId) => {
    setActiveTab(tab);
    setViewMode('main');
  };

  // Show auth page if not authenticated
  if (!isAuthenticated) {
    return <AuthPage onLogin={handleLogin} />;
  }

  const renderPage = () => {
    // Handle profile view
    if (viewMode === 'profile' && user) {
      return (
        <ProfilePage 
          user={user}
          onBack={handleBackFromDetails}
          onLogout={handleLogout}
          onUpdateUser={handleUpdateUser}
        />
      );
    }

    // Handle detail views
    if (viewMode === 'details' && selectedAgent && selectedAgentStats) {
      return (
        <AgentDetailsPage 
          agent={selectedAgent} 
          stats={selectedAgentStats}
          onBack={handleBackFromDetails}
        />
      );
    }

    // Main tab views
    switch (activeTab) {
      case 'home':
        return (
          <HomePage
            onNavigateToAgents={() => setActiveTab('agents')}
            onNavigateToTasks={() => setActiveTab('tasks')}
            onNavigateToChat={() => setActiveTab('chat')}
          />
        );
      case 'chat':
        return <ChatPage />;
      case 'dashboard':
        return (
          <DashboardPage
            agentState={agentState}
            isPaused={isPaused}
            onPause={handlePause}
            onResume={handleResume}
            onStop={handleStop}
            onApprove={handleApprove}
            selectedAgent={selectedAgent}
            agentStats={selectedAgentStats}
            onViewDetails={handleViewDetails}
            onNewMission={handleNewMission}
            onExportLogs={handleExportLogs}
          />
        );
      case 'tasks':
        return <TasksPage />;
      case 'vision':
        return <VisionPage />;
      case 'memory':
        return <MemoryPage />;
      case 'settings':
        return <SettingsPage autonomyLevel={autonomyLevel} onAutonomyChange={setAutonomyLevel} />;
      case 'agents':
        return <AgentsPage onSelectAgent={handleSelectAgentFromFleet} />;
      default:
        return null;
    }
  };

  // Chat page has its own full-screen layout
  if (activeTab === 'chat' && isAuthenticated) {
    return (
      <div className="min-h-screen bg-background">
        {/* Left Agent Rail - Desktop */}
        <div className="hidden lg:block">
          <AgentRail
            agents={agents}
            visibleAgentIds={visibleAgentIds}
            selectedAgentId={selectedAgentId}
            onSelectAgent={handleSelectAgentAndViewDetails}
            onOpenFleetCommand={handleOpenFleetCommand}
            onCreateAgent={handleCreateAgent}
            onNavigate={(tab) => handleTabChange(tab as TabId)}
            onRemoveFromPanel={handleRemoveFromPanel}
            onAddToPanel={handleAddToPanel}
            onPauseAgent={handlePauseAgent}
            onResumeAgent={handleResumeAgent}
            onStopAgent={handleStopAgent}
            onModifyTask={handleModifyTask}
          />
        </div>

        <div className="lg:pl-20">
          <ChatPage />
        </div>

        {/* Bottom Nav - Mobile */}
        <div className="lg:hidden fixed bottom-0 left-0 right-0 z-50">
          <BottomNav activeTab={activeTab} onTabChange={handleTabChange} />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Left Agent Rail - Desktop */}
      <div className="hidden lg:block">
        <AgentRail
          agents={agents}
          visibleAgentIds={visibleAgentIds}
          selectedAgentId={selectedAgentId}
          onSelectAgent={handleSelectAgentAndViewDetails}
          onOpenFleetCommand={handleOpenFleetCommand}
          onCreateAgent={handleCreateAgent}
          onNavigate={(tab) => handleTabChange(tab as TabId)}
          onRemoveFromPanel={handleRemoveFromPanel}
          onAddToPanel={handleAddToPanel}
          onPauseAgent={handlePauseAgent}
          onResumeAgent={handleResumeAgent}
          onStopAgent={handleStopAgent}
          onModifyTask={handleModifyTask}
        />
      </div>

      {/* Top Bar - Desktop */}
      <div className="hidden lg:block">
        <TopBar
          fleetStatus={fleetStatus}
          activeAgents={activeAgentsCount}
          totalAgents={agents.length}
          user={user || undefined}
          onViewProfile={handleViewProfile}
          onLogout={handleLogout}
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
      <main className="pt-14 pb-20 px-4 lg:pl-24 lg:pr-4 lg:pt-20 lg:pb-4">
        <div className="max-w-6xl mx-auto">
          {renderPage()}
        </div>
      </main>
      
      {/* Bottom Nav - Mobile */}
      <div className="lg:hidden">
        <BottomNav activeTab={activeTab} onTabChange={handleTabChange} />
      </div>
    </div>
  );
};

export default Index;
