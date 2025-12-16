import { Agent } from '@/components/AgentRail';

export const mockAgents: Agent[] = [
  {
    id: 'agent-1',
    name: 'Atlas',
    avatar: '🤖',
    status: 'executing',
    level: 5,
    class: 'assistant',
  },
  {
    id: 'agent-2',
    name: 'Nova',
    avatar: '💻',
    status: 'thinking',
    level: 8,
    class: 'coder',
  },
  {
    id: 'agent-3',
    name: 'Sage',
    avatar: '🔬',
    status: 'idle',
    level: 3,
    class: 'researcher',
  },
  {
    id: 'agent-4',
    name: 'Echo',
    avatar: '🎯',
    status: 'waiting',
    level: 6,
    class: 'assistant',
  },
  {
    id: 'agent-5',
    name: 'Pixel',
    avatar: '🎨',
    status: 'idle',
    level: 4,
    class: 'coder',
  },
];

export interface AgentStats {
  xp: number;
  xpToNextLevel: number;
  health: number;
  maxHealth: number;
  accuracy: number;
  speed: number;
  creativity: number;
}

export const mockAgentStats: Record<string, AgentStats> = {
  'agent-1': {
    xp: 2400,
    xpToNextLevel: 3000,
    health: 85,
    maxHealth: 100,
    accuracy: 92,
    speed: 75,
    creativity: 60,
  },
  'agent-2': {
    xp: 7200,
    xpToNextLevel: 8000,
    health: 100,
    maxHealth: 100,
    accuracy: 88,
    speed: 95,
    creativity: 78,
  },
  'agent-3': {
    xp: 1800,
    xpToNextLevel: 2500,
    health: 70,
    maxHealth: 100,
    accuracy: 96,
    speed: 45,
    creativity: 90,
  },
  'agent-4': {
    xp: 4500,
    xpToNextLevel: 5000,
    health: 55,
    maxHealth: 100,
    accuracy: 80,
    speed: 88,
    creativity: 65,
  },
  'agent-5': {
    xp: 3200,
    xpToNextLevel: 4000,
    health: 95,
    maxHealth: 100,
    accuracy: 85,
    speed: 70,
    creativity: 95,
  },
};

export const globalCredits = 15750;

export const fleetStatus: 'online' | 'partial' | 'offline' = 'online';
