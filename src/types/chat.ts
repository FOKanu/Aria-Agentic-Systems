// Chat Types - Francis Okorie Iyeke-Kanu
export type ChatStatus = 'idle' | 'listening' | 'thinking' | 'executing';

export interface ChatAttachment {
  id: string;
  name: string;
  type: string;
  size: number;
  file?: File;
  previewUrl?: string;
  url?: string; // For uploaded files
}

/* Developed by Francis Okorie Iyeke-Kanu */
export interface ChatMessage {
  id: string;
  content: string;
  sender: 'user' | 'agent' | 'system';
  agentId?: string;
  agentName?: string;
  agentRole?: string;
  agentAvatar?: string;
  timestamp: Date;
  confidence?: number;
  type: 'text' | 'status' | 'structured';
  attachments?: ChatAttachment[];
  structuredData?: {
    title?: string;
    items?: string[];
    status?: 'started' | 'completed' | 'waiting' | 'error';
  };
  isStreaming?: boolean;
}

export interface ChatAgent {
  id: string;
  name: string;
  title: string;
  avatar: string;
  role: string;
  status: 'available' | 'busy' | 'offline';
  capabilities: string[];
}

export interface AgentPreset {
  id: string;
  name: string;
  agentIds: string[];
  description: string;
}

// Francis Okorie Iyeke-Kanu - Agent Presets
export const AGENT_PRESETS: AgentPreset[] = [
  { id: 'auto', name: 'Auto (Atlas decides)', agentIds: [], description: 'Let Atlas coordinate' },
  { id: 'admin', name: 'Nexus only', agentIds: ['nexus'], description: 'Administrative tasks' },
  { id: 'vision-planner', name: 'Pixel + Atlas', agentIds: ['pixel', 'atlas'], description: 'Visual analysis tasks' },
  { id: 'dev-team', name: 'Dev Team', agentIds: ['nova', 'flux'], description: 'Development & DevOps' },
  { id: 'all', name: 'All agents', agentIds: ['all'], description: 'Full team coordination' },
];

// Author: Francis Okorie Iyeke-Kanu
export const CHAT_AGENTS: ChatAgent[] = [
  { id: 'atlas', name: 'Atlas', title: 'Planner', avatar: '🧠', role: 'planner', status: 'available', capabilities: ['coordination', 'task breakdown', 'delegation', 'strategy'] },
  { id: 'nova', name: 'Nova', title: 'Developer', avatar: '💻', role: 'developer', status: 'available', capabilities: ['coding', 'debugging', 'refactoring', 'code review'] },
  { id: 'sage', name: 'Sage', title: 'Researcher', avatar: '🔬', role: 'researcher', status: 'available', capabilities: ['web search', 'analysis', 'summarization', 'fact-checking'] },
  { id: 'echo', name: 'Echo', title: 'Assistant', avatar: '🎯', role: 'assistant', status: 'available', capabilities: ['general tasks', 'Q&A', 'note-taking', 'reminders'] },
  { id: 'pixel', name: 'Pixel', title: 'Vision', avatar: '👁️', role: 'vision', status: 'available', capabilities: ['image analysis', 'document reading', 'OCR', 'visual inspection'] },
  { id: 'nexus', name: 'Nexus', title: 'Admin', avatar: '⚙️', role: 'admin', status: 'available', capabilities: ['system tasks', 'file management', 'settings', 'permissions'] },
  { id: 'cipher', name: 'Cipher', title: 'Security', avatar: '🔐', role: 'security', status: 'available', capabilities: ['access control', 'monitoring', 'threat detection', 'auditing'] },
  { id: 'flux', name: 'Flux', title: 'DevOps', avatar: '🚀', role: 'devops', status: 'busy', capabilities: ['deployment', 'infrastructure', 'CI/CD', 'monitoring'] },
  { id: 'aria', name: 'Aria', title: 'Communications', avatar: '✉️', role: 'communications', status: 'available', capabilities: ['email drafting', 'proposals', 'messaging', 'templates'] },
  { id: 'orion', name: 'Orion', title: 'Scheduler', avatar: '📞', role: 'scheduler', status: 'available', capabilities: ['phone calls', 'calendar', 'reservations', 'appointments'] },
];
