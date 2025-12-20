/**
 * Agents Feature Module
 * 
 * Agent management, profiles, creation wizard, and fleet command.
 */

// Components
export { AgentProfile } from '@/components/AgentProfile';
export { AgentRail } from '@/components/AgentRail';
export { AgentCreationWizard } from '@/components/AgentCreationWizard';

// Pages
export { AgentsPage } from '@/pages/AgentsPage';
export { AgentDetailsPage } from '@/pages/AgentDetailsPage';
export { FleetCommandPage } from '@/pages/FleetCommandPage';

// Data
export { AGENTS, getAgentById } from '@/data/agentsData';
export type { UnifiedAgent, AgentRole, AgentStatus } from '@/data/agentsData';

// Types
export type { AgentState, AutonomyLevel, Task, TaskStep, AgentEvent } from '@/types/agent';
