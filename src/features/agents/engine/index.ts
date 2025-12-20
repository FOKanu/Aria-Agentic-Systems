/**
 * Agent Engine - AI processing and orchestration
 * Re-exports from agent-engine
 */
export { useAIChat } from '@/agent-engine/hooks/useAIChat';
export { AGENT_SYSTEM_PROMPTS, BASE_SYSTEM_PROMPT, generateAgentSystemPrompt, getAgentCapabilities, getAgentRestrictions } from '@/agent-engine/lib/prompts';
export { analyzeTaskComplexity, routeTask, getModelDisplayName, getProviderDisplayName } from '@/agent-engine/lib/router';
export { parseSSELine, createStreamReader, processStream, parseNonStreamingResponse, estimateTokens } from '@/agent-engine/lib/streaming';
export { checkLocalModelHealth, getAvailableLocalModels, callLocalModel, callLocalModelStreaming, LOCAL_MODEL_RECOMMENDATIONS } from '@/agent-engine/services/localModel';
export { callLovableAI, callLovableAIStreaming, LOVABLE_AI_MODELS, getRecommendedModel } from '@/agent-engine/services/lovableAI';
export type * from '@/agent-engine/types';
