/**
 * Main Application Index
 * Created by Francis Okorie Iyeke-Kanu
 */
import { useState, useEffect, useCallback } from 'react';
import { useLocation } from 'react-router-dom';
import { StatusBar } from '@/components/StatusBar';
import { BottomNav, TabId } from '@/components/BottomNav';
import { FloatingModuleNav } from '@/components/FloatingModuleNav';
import { AgentRail, Agent } from '@/components/AgentRail';
import { TopBar } from '@/components/TopBar';
import { CommandPalette } from '@/components/CommandPalette';
import { OnboardingDialog } from '@/components/OnboardingDialog';
import { FloatingChatPanel } from '@/components/chat/FloatingChatPanel';
import { FloatingVoiceButton } from '@/components/chat/FloatingVoiceButton';
import { ChatProvider, useChatContext } from '@/hooks/useChatContext';
import { HomePage } from '@/pages/HomePage';
import { DashboardPage } from '@/pages/DashboardPage';
import { TasksPage } from '@/pages/TasksPage';
import { MonitoringPage, MonitoringTab } from '@/pages/MonitoringPage';
import { MemoryPage } from '@/pages/MemoryPage';
import { AgentsPage } from '@/pages/AgentsPage';
import { SettingsPage } from '@/pages/SettingsPage';
import { AgentDetailsPage } from '@/pages/AgentDetailsPage';
import { AuthPage, MockUser } from '@/pages/AuthPage';
import { ProfilePage } from '@/pages/ProfilePage';
import { ChatPage } from '@/pages/ChatPage';
import { AnalyticsPage } from '@/pages/AnalyticsPage';
import { FilesPage } from '@/pages/FilesPage';
import { CalendarPage } from '@/pages/CalendarPage';
import { ContactsPage } from '@/pages/ContactsPage';
import { EmailPage } from '@/pages/EmailPage';
import { WorkflowsPage } from '@/pages/WorkflowsPage';
import { PhonePage } from '@/pages/PhonePage';
import { ReservationsPage } from '@/pages/ReservationsPage';
import { InvoicesPage } from '@/pages/InvoicesPage';
import { ExpensesPage } from '@/pages/ExpensesPage';
import { BudgetPage } from '@/pages/BudgetPage';
import { FinancialReportsPage } from '@/pages/FinancialReportsPage';
import { PaymentsPage } from '@/pages/PaymentsPage';
import { TaxPage } from '@/pages/TaxPage';
// DevOps Module
import CICDPipelinesPage from '@/pages/devops/CICDPipelinesPage';
import CodeReviewPage from '@/pages/devops/CodeReviewPage';
import DeploymentPage from '@/pages/devops/DeploymentPage';
import InfrastructurePage from '@/pages/devops/InfrastructurePage';
import SecurityScanningPage from '@/pages/devops/SecurityScanningPage';
import LogAnalysisPage from '@/pages/devops/LogAnalysisPage';
import { AgentState, AutonomyLevel } from '@/types/agent';
import { useToast } from '@/hooks/use-toast';
import { useKeyboardShortcuts } from '@/hooks/useKeyboardShortcuts';
import { mockAgents as initialAgents, mockAgentStats, fleetStatus } from '@/data/agentsData';

type ViewMode = 'main' | 'details' | 'profile';

// Francis Okorie Iyeke-Kanu - Main Index Component

const Index = () => {
  // Auth state
  const [user, setUser] = useState<MockUser | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  // App state
  const [activeTab, setActiveTab] = useState<TabId>('home');
  const [monitoringTab, setMonitoringTab] = useState<MonitoringTab>('vision');
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

  const handleReorderAgents = (newOrder: string[]) => {
    setVisibleAgentIds(newOrder);
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

  const handleTabChange = (tab: TabId | string) => {
    // Handle monitoring sub-tabs
    if (tab.startsWith('monitoring-')) {
      const subTab = tab.replace('monitoring-', '') as MonitoringTab;
      setActiveTab('monitoring');
      setMonitoringTab(subTab);
      setViewMode('main');
      return;
    }
    
    // Handle vision separately (legacy from Agent Capabilities)
    if (tab === 'vision') {
      setActiveTab('monitoring');
      setMonitoringTab('vision');
      setViewMode('main');
      return;
    }
    
    setActiveTab(tab as TabId);
    setViewMode('main');
  };

  const handleTogglePause = useCallback(() => {
    if (isPaused) {
      handleResume();
    } else {
      handlePause();
    }
  }, [isPaused]);

  // Keyboard shortcuts
  useKeyboardShortcuts({
    onNavigate: handleTabChange,
    onTogglePause: handleTogglePause,
    onStop: handleStop,
    isAuthenticated,
  });

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
      case 'monitoring':
        return <MonitoringPage initialTab={monitoringTab} />;
      case 'memory':
        return <MemoryPage />;
      case 'settings':
        return <SettingsPage autonomyLevel={autonomyLevel} onAutonomyChange={setAutonomyLevel} />;
      case 'agents':
        return <AgentsPage onSelectAgent={handleSelectAgentFromFleet} />;
      case 'analytics':
        return <AnalyticsPage />;
      case 'files':
        return <FilesPage />;
      case 'calendar':
        return <CalendarPage />;
      case 'contacts':
        return <ContactsPage />;
      case 'email':
        return <EmailPage />;
      case 'workflows':
        return <WorkflowsPage />;
      case 'phone':
        return <PhonePage />;
      case 'reservations':
        return <ReservationsPage />;
      case 'invoices':
        return <InvoicesPage />;
      case 'expenses':
        return <ExpensesPage />;
      case 'budget':
        return <BudgetPage />;
      case 'reports':
        return <FinancialReportsPage />;
      case 'payments':
        return <PaymentsPage />;
      case 'tax':
        return <TaxPage />;
      case 'documents':
        return <FilesPage />;
      // DevOps Module
      case 'devops-pipelines':
        return <CICDPipelinesPage />;
      case 'devops-code-review':
        return <CodeReviewPage />;
      case 'devops-deployment':
        return <DeploymentPage />;
      case 'devops-infrastructure':
        return <InfrastructurePage />;
      case 'devops-security':
        return <SecurityScanningPage />;
      case 'devops-logs':
        return <LogAnalysisPage />;
      default:
        return null;
    }
  };

  // Chat page has its own full-screen layout
  if (activeTab === 'chat' && isAuthenticated) {
    return (
      <ChatProvider>
        <div className="min-h-screen bg-background">
          {/* Global Command Palette */}
          <CommandPalette
            onNavigate={handleTabChange}
            onSelectAgent={handleSelectAgentAndViewDetails}
            onPauseAgent={handlePauseAgent}
            onResumeAgent={handleResumeAgent}
            onStopAgent={handleStopAgent}
            onViewProfile={handleViewProfile}
          />

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
              onReorderAgents={handleReorderAgents}
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
      </ChatProvider>
    );
  }

  return (
    <ChatProvider>
      <PageContextSetter activeTab={activeTab} />
      <div className="min-h-screen bg-background">
        {/* Onboarding Dialog */}
        <OnboardingDialog />

        {/* Global Command Palette */}
        <CommandPalette
          onNavigate={handleTabChange}
          onSelectAgent={handleSelectAgentAndViewDetails}
          onPauseAgent={handlePauseAgent}
          onResumeAgent={handleResumeAgent}
          onStopAgent={handleStopAgent}
          onViewProfile={handleViewProfile}
        />

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
            onReorderAgents={handleReorderAgents}
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
            activeTab={activeTab}
            viewMode={viewMode}
            agentName={selectedAgent?.name}
            onNavigate={handleTabChange}
            onBackToMain={handleBackFromDetails}
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

        {/* Floating Voice & Chat Buttons - Available on all pages except chat */}
        {activeTab !== 'chat' && (
          <>
            <FloatingVoiceButton />
            <FloatingModuleNav activeTab={activeTab} onNavigate={handleTabChange} />
            <FloatingChatPanel />
          </>
        )}
      </div>
    </ChatProvider>
  );
};

// Component to set page context based on active tab
function PageContextSetter({ activeTab }: { activeTab: TabId }) {
  const { setPageContext } = useChatContext();
  
  useEffect(() => {
    const pageContextMap: Record<string, { name: string; category?: string }> = {
      'home': { name: 'Home', category: 'general' },
      'dashboard': { name: 'Dashboard', category: 'general' },
      'tasks': { name: 'Tasks', category: 'productivity' },
      'monitoring': { name: 'Monitoring', category: 'system' },
      'memory': { name: 'Memory', category: 'system' },
      'settings': { name: 'Settings', category: 'system' },
      'agents': { name: 'Agents', category: 'system' },
      'analytics': { name: 'Analytics', category: 'data' },
      'files': { name: 'Files', category: 'productivity' },
      'calendar': { name: 'Calendar', category: 'productivity' },
      'contacts': { name: 'Contacts', category: 'productivity' },
      'email': { name: 'Email', category: 'communication' },
      'workflows': { name: 'Workflows', category: 'automation' },
      'phone': { name: 'Phone', category: 'communication' },
      'reservations': { name: 'Reservations', category: 'scheduling' },
      'invoices': { name: 'Invoices', category: 'finance' },
      'expenses': { name: 'Expenses', category: 'finance' },
      'budget': { name: 'Budget', category: 'finance' },
      'reports': { name: 'Financial Reports', category: 'finance' },
      'payments': { name: 'Payments', category: 'finance' },
      'tax': { name: 'Tax', category: 'finance' },
      'documents': { name: 'Documents', category: 'productivity' },
      'devops-pipelines': { name: 'CI/CD Pipelines', category: 'devops' },
      'devops-code-review': { name: 'Code Review', category: 'devops' },
      'devops-deployment': { name: 'Deployment', category: 'devops' },
      'devops-infrastructure': { name: 'Infrastructure', category: 'devops' },
      'devops-security': { name: 'Security Scanning', category: 'devops' },
      'devops-logs': { name: 'Log Analysis', category: 'devops' },
    };
    
    const context = pageContextMap[activeTab];
    if (context) {
      setPageContext({
        pageId: activeTab,
        pageName: context.name,
        pageCategory: context.category,
      });
    }
  }, [activeTab, setPageContext]);
  
  return null;
}

export default Index;
