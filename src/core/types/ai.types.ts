/**
 * AI Types - Unified AI/Provider types
 */

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
  confidence: number;
  fallbackProvider?: AIProvider;
  fallbackModel?: AIModel;
}

export interface TaskComplexityAnalysis {
  score: number;
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
    role: 'user' | 'assistant' | 'system';
    content: string | Array<{ type: 'text'; text: string } | { type: 'image_url'; image_url: { url: string } }>;
  }>;
  model?: AIModel;
  stream?: boolean;
  temperature?: number;
  maxTokens?: number;
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
}

export interface AIStreamChunk {
  id: string;
  content: string;
  delta: string;
  finishReason?: 'stop' | 'length' | 'tool_calls';
}

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
  retryAfter?: number;
}
