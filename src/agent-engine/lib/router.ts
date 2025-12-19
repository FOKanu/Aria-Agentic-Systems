// Task Router - Determines which AI provider to use
// Routes between local models and Lovable AI based on task complexity

import { AIProvider, AIModel, RoutingDecision, AgentRoleId, TaskComplexityAnalysis } from '../types';

// Patterns that indicate complex tasks requiring more powerful models
const COMPLEX_TASK_PATTERNS = [
  /analyze.*(?:deeply|thoroughly|comprehensively)/i,
  /compare.*(?:multiple|several|different)/i,
  /write.*(?:detailed|comprehensive|long)/i,
  /research.*(?:extensively|thoroughly)/i,
  /debug.*(?:complex|difficult|intricate)/i,
  /explain.*(?:in detail|thoroughly|step by step)/i,
  /create.*(?:plan|strategy|architecture)/i,
  /review.*(?:code|document|proposal)/i,
  /summarize.*(?:long|extensive|multiple)/i,
  /generate.*(?:report|documentation|analysis)/i,
];

// Patterns that indicate simple tasks suitable for local models
const SIMPLE_TASK_PATTERNS = [
  /^(?:what|who|when|where|how|why)\s+(?:is|are|was|were|do|does|did)\b/i,
  /^(?:list|name|show|tell me)\b/i,
  /^(?:yes|no|true|false)\b/i,
  /^(?:define|describe briefly)\b/i,
  /^(?:translate|convert)\b/i,
  /^(?:format|reformat|clean up)\b/i,
];

// Agent roles that typically need more powerful models
const HIGH_COMPLEXITY_ROLES: AgentRoleId[] = ['atlas', 'sage', 'cipher', 'nova'];

// Agent roles that can work well with simpler models
const LOW_COMPLEXITY_ROLES: AgentRoleId[] = ['echo', 'orion', 'aria'];

// Analyze task complexity
export function analyzeTaskComplexity(
  message: string,
  agentRole: AgentRoleId,
  hasFileContext: boolean,
  conversationLength: number
): TaskComplexityAnalysis {
  const factors = {
    multiStep: /(?:then|next|after that|finally|first.*second)/i.test(message),
    requiresReasoning: /(?:why|because|reason|explain|analyze|think)/i.test(message),
    requiresCodeGeneration: /(?:write code|implement|create function|build|develop)/i.test(message),
    requiresResearch: /(?:research|find out|look up|investigate|study)/i.test(message),
    requiresVision: /(?:image|picture|photo|screenshot|visual|look at)/i.test(message),
    hasFileContext,
  };

  // Calculate complexity score (0-1)
  let score = 0;
  
  // Factor weights
  if (factors.multiStep) score += 0.15;
  if (factors.requiresReasoning) score += 0.2;
  if (factors.requiresCodeGeneration) score += 0.25;
  if (factors.requiresResearch) score += 0.2;
  if (factors.requiresVision) score += 0.15;
  if (factors.hasFileContext) score += 0.1;
  
  // Agent role influence
  if (HIGH_COMPLEXITY_ROLES.includes(agentRole)) score += 0.15;
  if (LOW_COMPLEXITY_ROLES.includes(agentRole)) score -= 0.1;
  
  // Message length influence
  if (message.length > 500) score += 0.1;
  if (message.length > 1000) score += 0.1;
  
  // Conversation length influence (longer conversations need better context handling)
  if (conversationLength > 10) score += 0.1;
  if (conversationLength > 20) score += 0.1;
  
  // Pattern matching
  const hasComplexPattern = COMPLEX_TASK_PATTERNS.some(p => p.test(message));
  const hasSimplePattern = SIMPLE_TASK_PATTERNS.some(p => p.test(message));
  
  if (hasComplexPattern) score += 0.2;
  if (hasSimplePattern) score -= 0.15;
  
  // Clamp score
  score = Math.max(0, Math.min(1, score));
  
  // Determine recommended provider and model
  let recommendedProvider: AIProvider;
  let recommendedModel: AIModel;
  
  if (score >= 0.6) {
    recommendedProvider = 'lovable-ai';
    recommendedModel = 'google/gemini-2.5-pro';
  } else if (score >= 0.4) {
    recommendedProvider = 'lovable-ai';
    recommendedModel = 'google/gemini-2.5-flash';
  } else {
    recommendedProvider = 'local';
    recommendedModel = 'llama3.1:8b';
  }
  
  return {
    score,
    factors,
    recommendedProvider,
    recommendedModel,
  };
}

// Main routing function
export function routeTask(
  message: string,
  agentRole: AgentRoleId,
  hasFileContext: boolean = false,
  conversationLength: number = 0,
  preferLocal: boolean = false,
  localModelAvailable: boolean = true
): RoutingDecision {
  const analysis = analyzeTaskComplexity(message, agentRole, hasFileContext, conversationLength);
  
  let provider = analysis.recommendedProvider;
  let model = analysis.recommendedModel;
  let reason = '';
  
  // Override: prefer local if requested and available
  if (preferLocal && localModelAvailable && analysis.score < 0.7) {
    provider = 'local';
    model = analysis.score > 0.4 ? 'llama3.1:70b' : 'llama3.1:8b';
    reason = 'Using local model as preferred';
  }
  
  // Override: fallback to Lovable AI if local unavailable
  if (provider === 'local' && !localModelAvailable) {
    provider = 'lovable-ai';
    model = 'google/gemini-2.5-flash';
    reason = 'Local model unavailable, using Lovable AI';
  }
  
  // Build reason string
  if (!reason) {
    const factorDescriptions: string[] = [];
    if (analysis.factors.multiStep) factorDescriptions.push('multi-step task');
    if (analysis.factors.requiresReasoning) factorDescriptions.push('requires reasoning');
    if (analysis.factors.requiresCodeGeneration) factorDescriptions.push('code generation');
    if (analysis.factors.requiresResearch) factorDescriptions.push('research needed');
    if (analysis.factors.requiresVision) factorDescriptions.push('vision analysis');
    if (analysis.factors.hasFileContext) factorDescriptions.push('file context');
    
    if (factorDescriptions.length > 0) {
      reason = `Task involves: ${factorDescriptions.join(', ')}`;
    } else {
      reason = analysis.score >= 0.4 ? 'Moderate complexity task' : 'Simple task';
    }
  }
  
  // Determine fallback
  const fallbackProvider: AIProvider = provider === 'local' ? 'lovable-ai' : 'local';
  const fallbackModel: AIModel = fallbackProvider === 'lovable-ai' 
    ? 'google/gemini-2.5-flash' 
    : 'llama3.1:8b';
  
  return {
    provider,
    model,
    reason,
    confidence: analysis.score,
    fallbackProvider,
    fallbackModel,
  };
}

// Get model display name
export function getModelDisplayName(model: AIModel): string {
  const names: Record<AIModel, string> = {
    'llama3.1:8b': 'Llama 3.1 8B',
    'llama3.1:70b': 'Llama 3.1 70B',
    'mistral:7b': 'Mistral 7B',
    'google/gemini-2.5-flash': 'Gemini 2.5 Flash',
    'google/gemini-2.5-pro': 'Gemini 2.5 Pro',
    'openai/gpt-5-mini': 'GPT-5 Mini',
    'openai/gpt-5': 'GPT-5',
  };
  return names[model] || model;
}

// Get provider display name
export function getProviderDisplayName(provider: AIProvider): string {
  return provider === 'local' ? 'Local AI' : 'Lovable AI';
}
