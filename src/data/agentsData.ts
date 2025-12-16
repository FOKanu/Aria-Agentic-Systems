import { Agent } from '@/components/AgentRail';

export const mockAgents: Agent[] = [
  {
    id: 'agent-1',
    name: 'Atlas',
    avatar: '🤖',
    status: 'executing',
    type: 'assistant',
  },
  {
    id: 'agent-2',
    name: 'Nova',
    avatar: '💻',
    status: 'thinking',
    type: 'developer',
  },
  {
    id: 'agent-3',
    name: 'Sage',
    avatar: '🔬',
    status: 'idle',
    type: 'researcher',
  },
  {
    id: 'agent-4',
    name: 'Echo',
    avatar: '🎯',
    status: 'waiting',
    type: 'assistant',
  },
  {
    id: 'agent-5',
    name: 'Pixel',
    avatar: '🎨',
    status: 'idle',
    type: 'developer',
  },
];

export interface AgentStats {
  tasksCompleted: number;
  successRate: number;
  avgResponseTime: number;
  activeHours: number;
}

export const mockAgentStats: Record<string, AgentStats> = {
  'agent-1': {
    tasksCompleted: 156,
    successRate: 92,
    avgResponseTime: 2.4,
    activeHours: 48,
  },
  'agent-2': {
    tasksCompleted: 234,
    successRate: 88,
    avgResponseTime: 3.1,
    activeHours: 72,
  },
  'agent-3': {
    tasksCompleted: 89,
    successRate: 96,
    avgResponseTime: 4.2,
    activeHours: 24,
  },
  'agent-4': {
    tasksCompleted: 178,
    successRate: 80,
    avgResponseTime: 1.8,
    activeHours: 56,
  },
  'agent-5': {
    tasksCompleted: 112,
    successRate: 85,
    avgResponseTime: 2.9,
    activeHours: 36,
  },
};

export const fleetStatus: 'online' | 'partial' | 'offline' = 'online';
