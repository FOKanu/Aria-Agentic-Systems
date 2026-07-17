// Agent Engine Types

export type AIProvider = 'local' | 'lovable-ai';
export type AIModel =
  | 'qwen3:8b'
  | 'qwen3:32b'
  | 'qwen2.5-coder:32b'
  | 'deepseek-r1:32b'
  | 'llama3.2:1b'
  | 'llama3.1:8b'
  | 'llama3.1:70b'
  | 'mistral:7b'
  | 'moondream'
  | 'nomic-embed-text:latest'
  | 'google/gemini-2.5-flash'
  | 'google/gemini-2.5-pro'
  | 'openai/gpt-5-mini'
  | 'openai/gpt-5';

// String literal type for agent role IDs (for use as Record keys)
export type AgentRoleId =
  | 'atlas'
  | 'nova'
  | 'sage'
  | 'echo'
  | 'pixel'
  | 'nexus'
  | 'cipher'
  | 'flux'
  | 'aria'
  | 'orion';

export interface RoutingDecision {
  provider: AIProvider;
  model: AIModel;
  reason: string;
  confidence: number; // 0-1
  fallbackProvider?: AIProvider;
  fallbackModel?: AIModel;
}

export interface AgentRoleConfig {
  id: AgentRoleId;
  name: string;
  primaryFunction: string;
  preferredFileTypes: string[];
  complexityThreshold: 'low' | 'medium' | 'high';
  defaultProvider: AIProvider;
}

export interface AgentExecutionContext {
  agentId: string;
  agentRole: string;
  taskId?: string;
  taskDescription?: string;
  conversationHistory: ChatMessage[];
  availableFiles: FileContext[];
  grantedFileIds: string[];
  pendingFileRequests: string[];
  systemPrompt: string;
  maxTokens?: number;
  temperature?: number;
}

export interface FileContextItem {
  fileId: string;
  fileName: string;
  fileType: string;
  summary?: string;
  relevanceScore: number;
  hasPermission: boolean;
}

// Built file context for agent task execution
export interface FileContext {
  availableFiles: Array<{
    id: string;
    name: string;
    type: string;
    summary?: string;
    relevance: number;
  }>;
  pendingAccessFiles: string[];
  deniedFiles: string[];
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant' | 'system' | 'tool';
  content: string;
  timestamp: string;
  agentId?: string;
  attachments?: MessageAttachment[];
  fileReferences?: string[]; // File IDs referenced
  toolCalls?: AIToolCall[]; // For assistant messages
  toolCallId?: string; // For tool messages
  metadata?: Record<string, unknown>;
}

export interface MessageAttachment {
  id: string;
  type: 'file' | 'image' | 'code' | 'link';
  name: string;
  url?: string;
  content?: string;
  mimeType?: string;
}

export interface StreamingState {
  isStreaming: boolean;
  content: string;
  provider: AIProvider | null;
  model: AIModel | null;
  error: string | null;
  startedAt?: string;
  tokensReceived: number;
  toolCalls?: AIToolCall[];
}

export interface AgentSystemPrompt {
  agentId: string;
  basePrompt: string;
  fileContextPrompt?: string;
  taskContextPrompt?: string;
  capabilities: string[];
  restrictions: string[];
}

export interface TaskComplexityAnalysis {
  score: number; // 0-1, higher = more complex
  factors: {
    multiStep: boolean;
    requiresReasoning: boolean;
    requiresCodeGeneration: boolean;
    requiresResearch: boolean;
    requiresVision: boolean;
    hasFileContext: boolean;
  };
  recommendedProvider: AIProvider;
  recommendedModel: AIModel;
}

export interface AIRequestPayload {
  messages: Array<{
    role: 'user' | 'assistant' | 'system' | 'tool';
    content: string | Array<{ type: 'text'; text: string } | { type: 'image_url'; image_url: { url: string } }>;
    tool_calls?: AIToolCall[];
    tool_call_id?: string;
  }>;
  model?: AIModel;
  stream?: boolean;
  temperature?: number;
  maxTokens?: number;
  tools?: AITool[];
  toolChoice?: 'auto' | 'none' | { type: 'function'; function: { name: string } };
}

export interface AITool {
  type: 'function';
  function: {
    name: string;
    description: string;
    parameters: {
      type: 'object';
      properties: Record<string, {
        type: string;
        description?: string;
        enum?: string[];
      }>;
      required?: string[];
    };
  };
}

export interface AIResponse {
  id: string;
  content: string;
  model: AIModel;
  provider: AIProvider;
  finishReason: 'stop' | 'length' | 'tool_calls' | 'error';
  usage?: {
    promptTokens: number;
    completionTokens: number;
    totalTokens: number;
  };
  toolCalls?: AIToolCall[];
}

export interface AIToolCall {
  id: string;
  type: 'function';
  function: {
    name: string;
    arguments: string; // JSON string
  };
}

export interface AIStreamChunk {
  id: string;
  content: string;
  delta: string;
  finishReason?: 'stop' | 'length' | 'tool_calls';
}

// Error types
export type AIErrorType =
  | 'rate_limit'
  | 'payment_required'
  | 'model_unavailable'
  | 'timeout'
  | 'network_error'
  | 'invalid_request'
  | 'context_too_long';

export interface AIError {
  type: AIErrorType;
  message: string;
  provider: AIProvider;
  retryable: boolean;
  retryAfter?: number; // seconds
}

// Agent chat state
export interface AgentChatState {
  messages: ChatMessage[];
  streaming: StreamingState;
  currentContext: AgentExecutionContext | null;
  lastRouting: RoutingDecision | null;
  error: AIError | null;
}
