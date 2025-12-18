// Unified agent data - single source of truth for all agents across the app
export type AgentRole = 'planner' | 'developer' | 'researcher' | 'assistant' | 'vision' | 'admin' | 'security' | 'devops' | 'communications' | 'scheduler';

export type AgentStatus = 'idle' | 'thinking' | 'executing' | 'waiting' | 'error' | 'stunned' | 'available' | 'busy' | 'offline';

export interface UnifiedAgent {
  id: string;
  name: string;
  title: string; // Specialty/responsibility
  avatar: string;
  status: AgentStatus;
  role: AgentRole;
  capabilities: string[];
}

// 10 unique named agents with specialties
export const AGENTS: UnifiedAgent[] = [
  {
    id: 'atlas',
    name: 'Atlas',
    title: 'Planner',
    avatar: '🧠',
    status: 'available',
    role: 'planner',
    capabilities: ['coordination', 'task breakdown', 'delegation', 'strategy'],
  },
  {
    id: 'nova',
    name: 'Nova',
    title: 'Developer',
    avatar: '💻',
    status: 'executing',
    role: 'developer',
    capabilities: ['coding', 'debugging', 'refactoring', 'code review'],
  },
  {
    id: 'sage',
    name: 'Sage',
    title: 'Researcher',
    avatar: '🔬',
    status: 'idle',
    role: 'researcher',
    capabilities: ['web search', 'analysis', 'summarization', 'fact-checking'],
  },
  {
    id: 'echo',
    name: 'Echo',
    title: 'Assistant',
    avatar: '🎯',
    status: 'available',
    role: 'assistant',
    capabilities: ['general tasks', 'Q&A', 'note-taking', 'reminders'],
  },
  {
    id: 'pixel',
    name: 'Pixel',
    title: 'Vision',
    avatar: '👁️',
    status: 'thinking',
    role: 'vision',
    capabilities: ['image analysis', 'document reading', 'OCR', 'visual inspection'],
  },
  {
    id: 'nexus',
    name: 'Nexus',
    title: 'Admin',
    avatar: '⚙️',
    status: 'available',
    role: 'admin',
    capabilities: ['system tasks', 'file management', 'settings', 'permissions'],
  },
  {
    id: 'cipher',
    name: 'Cipher',
    title: 'Security',
    avatar: '🔐',
    status: 'idle',
    role: 'security',
    capabilities: ['access control', 'monitoring', 'threat detection', 'auditing'],
  },
  {
    id: 'flux',
    name: 'Flux',
    title: 'DevOps',
    avatar: '🚀',
    status: 'busy',
    role: 'devops',
    capabilities: ['deployment', 'infrastructure', 'CI/CD', 'monitoring'],
  },
  {
    id: 'aria',
    name: 'Aria',
    title: 'Communications',
    avatar: '✉️',
    status: 'available',
    role: 'communications',
    capabilities: ['email drafting', 'proposals', 'messaging', 'templates'],
  },
  {
    id: 'orion',
    name: 'Orion',
    title: 'Scheduler',
    avatar: '📞',
    status: 'waiting',
    role: 'scheduler',
    capabilities: ['phone calls', 'calendar', 'reservations', 'appointments'],
  },
];

// Helper to get agent by ID
export const getAgentById = (id: string): UnifiedAgent | undefined => 
  AGENTS.find(agent => agent.id === id);

// Helper to get display name (Name - Title)
export const getAgentDisplayName = (agent: UnifiedAgent): string => 
  `${agent.name} - ${agent.title}`;

// Stats for each agent
export interface AgentStats {
  tasksCompleted: number;
  successRate: number;
  avgResponseTime: number;
  activeHours: number;
}

export const agentStats: Record<string, AgentStats> = {
  'atlas': { tasksCompleted: 312, successRate: 95, avgResponseTime: 1.2, activeHours: 120 },
  'nova': { tasksCompleted: 234, successRate: 88, avgResponseTime: 3.1, activeHours: 72 },
  'sage': { tasksCompleted: 189, successRate: 96, avgResponseTime: 4.2, activeHours: 48 },
  'echo': { tasksCompleted: 456, successRate: 92, avgResponseTime: 1.5, activeHours: 156 },
  'pixel': { tasksCompleted: 178, successRate: 90, avgResponseTime: 2.8, activeHours: 64 },
  'nexus': { tasksCompleted: 267, successRate: 94, avgResponseTime: 2.0, activeHours: 96 },
  'cipher': { tasksCompleted: 145, successRate: 98, avgResponseTime: 3.5, activeHours: 36 },
  'flux': { tasksCompleted: 198, successRate: 86, avgResponseTime: 4.8, activeHours: 84 },
  'aria': { tasksCompleted: 389, successRate: 91, avgResponseTime: 2.2, activeHours: 112 },
  'orion': { tasksCompleted: 234, successRate: 89, avgResponseTime: 1.8, activeHours: 78 },
};

export const fleetStatus: 'online' | 'partial' | 'offline' = 'online';

// Legacy exports for backward compatibility
export const mockAgents = AGENTS;
export const mockAgentStats = agentStats;
