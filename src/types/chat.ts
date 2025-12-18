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
  avatar: string;
  role: 'planner' | 'vision' | 'admin' | 'code' | 'researcher' | 'assistant';
  status: 'available' | 'busy' | 'offline';
  capabilities: string[];
}

export interface AgentPreset {
  id: string;
  name: string;
  agentIds: string[];
  description: string;
}

export const AGENT_PRESETS: AgentPreset[] = [
  { id: 'auto', name: 'Auto (Planner decides)', agentIds: [], description: 'Let the planner coordinate' },
  { id: 'admin', name: 'Admin only', agentIds: ['admin'], description: 'Administrative tasks' },
  { id: 'vision-planner', name: 'Vision + Planner', agentIds: ['vision', 'planner'], description: 'Visual analysis tasks' },
  { id: 'all', name: 'All agents', agentIds: ['all'], description: 'Full team coordination' },
];

export const CHAT_AGENTS: ChatAgent[] = [
  { id: 'planner', name: 'Planner', avatar: '🧠', role: 'planner', status: 'available', capabilities: ['coordination', 'task breakdown', 'delegation'] },
  { id: 'vision', name: 'Vision', avatar: '👁️', role: 'vision', status: 'available', capabilities: ['image analysis', 'document reading', 'OCR'] },
  { id: 'admin', name: 'Admin', avatar: '⚙️', role: 'admin', status: 'available', capabilities: ['system tasks', 'file management', 'settings'] },
  { id: 'code', name: 'Code', avatar: '💻', role: 'code', status: 'busy', capabilities: ['coding', 'debugging', 'refactoring'] },
  { id: 'researcher', name: 'Researcher', avatar: '🔬', role: 'researcher', status: 'available', capabilities: ['web search', 'analysis', 'summarization'] },
];
