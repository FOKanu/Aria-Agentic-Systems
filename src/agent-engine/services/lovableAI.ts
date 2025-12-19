// Lovable AI Service
// Integration with Lovable AI Gateway for cloud-based AI

import { AIModel, AIResponse, AIRequestPayload, AIError, AIErrorType } from '../types';
import { parseNonStreamingResponse } from '../lib/streaming';

// Lovable AI Gateway endpoint
const LOVABLE_AI_ENDPOINT = 'https://ai.gateway.lovable.dev/v1/chat/completions';

// Default model
const DEFAULT_MODEL: AIModel = 'google/gemini-2.5-flash';

// Call Lovable AI (non-streaming) - for use in edge functions
export async function callLovableAI(
  payload: AIRequestPayload,
  apiKey: string
): Promise<AIResponse> {
  const model = payload.model || DEFAULT_MODEL;
  
  try {
    const response = await fetch(LOVABLE_AI_ENDPOINT, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model,
        messages: payload.messages,
        stream: false,
        temperature: payload.temperature ?? 0.7,
        max_tokens: payload.maxTokens,
        tools: payload.tools,
        tool_choice: payload.toolChoice,
      }),
    });
    
    if (!response.ok) {
      throw await handleLovableAIError(response);
    }
    
    const data = await response.json();
    const content = parseNonStreamingResponse(data);
    
    return {
      id: data.id || `lovable-${Date.now()}`,
      content,
      model: model as AIModel,
      provider: 'lovable-ai',
      finishReason: data.choices?.[0]?.finish_reason || 'stop',
      usage: data.usage ? {
        promptTokens: data.usage.prompt_tokens,
        completionTokens: data.usage.completion_tokens,
        totalTokens: data.usage.total_tokens,
      } : undefined,
      toolCalls: data.choices?.[0]?.message?.tool_calls,
    };
  } catch (error) {
    if ((error as AIError).type) {
      throw error;
    }
    
    throw createLovableError(
      'network_error',
      `Failed to connect to Lovable AI: ${error instanceof Error ? error.message : 'Unknown error'}`,
      true
    );
  }
}

// Call Lovable AI with streaming - for use in edge functions
export async function callLovableAIStreaming(
  payload: AIRequestPayload,
  apiKey: string
): Promise<Response> {
  const model = payload.model || DEFAULT_MODEL;
  
  try {
    const response = await fetch(LOVABLE_AI_ENDPOINT, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model,
        messages: payload.messages,
        stream: true,
        temperature: payload.temperature ?? 0.7,
        max_tokens: payload.maxTokens,
      }),
    });
    
    if (!response.ok) {
      throw await handleLovableAIError(response);
    }
    
    return response;
  } catch (error) {
    if ((error as AIError).type) {
      throw error;
    }
    
    throw createLovableError(
      'network_error',
      `Failed to connect to Lovable AI: ${error instanceof Error ? error.message : 'Unknown error'}`,
      true
    );
  }
}

// Handle Lovable AI error responses
async function handleLovableAIError(response: Response): Promise<AIError> {
  const status = response.status;
  
  // Rate limit error
  if (status === 429) {
    const retryAfter = response.headers.get('Retry-After');
    return createLovableError(
      'rate_limit',
      'Rate limit exceeded. Please try again later.',
      true,
      retryAfter ? parseInt(retryAfter) : 60
    );
  }
  
  // Payment required
  if (status === 402) {
    return createLovableError(
      'payment_required',
      'Payment required. Please add credits to your Lovable AI workspace.',
      false
    );
  }
  
  // Model unavailable
  if (status === 503) {
    return createLovableError(
      'model_unavailable',
      'The AI model is temporarily unavailable. Please try again.',
      true,
      30
    );
  }
  
  // Context too long
  if (status === 400) {
    try {
      const errorData = await response.json();
      if (errorData.error?.message?.includes('context')) {
        return createLovableError(
          'context_too_long',
          'The conversation is too long. Please start a new conversation or remove some messages.',
          false
        );
      }
    } catch {
      // Ignore JSON parse errors
    }
  }
  
  // Generic error
  let errorMessage = `Lovable AI error (${status})`;
  try {
    const errorData = await response.json();
    errorMessage = errorData.error?.message || errorMessage;
  } catch {
    // Use default message
  }
  
  return createLovableError('invalid_request', errorMessage, status >= 500);
}

// Create standardized Lovable AI error
function createLovableError(
  type: AIErrorType,
  message: string,
  retryable: boolean,
  retryAfter?: number
): AIError {
  return {
    type,
    message,
    provider: 'lovable-ai',
    retryable,
    retryAfter,
  };
}

// Model information for Lovable AI
export const LOVABLE_AI_MODELS = {
  'google/gemini-2.5-flash': {
    description: 'Fast and efficient for most tasks',
    strengths: ['Speed', 'Multimodal', 'Good reasoning'],
    costTier: 'low',
  },
  'google/gemini-2.5-pro': {
    description: 'Most capable for complex tasks',
    strengths: ['Complex reasoning', 'Large context', 'Vision'],
    costTier: 'high',
  },
  'openai/gpt-5-mini': {
    description: 'Balanced performance and cost',
    strengths: ['Reasoning', 'Instructions', 'Code'],
    costTier: 'medium',
  },
  'openai/gpt-5': {
    description: 'Top-tier performance',
    strengths: ['Best reasoning', 'Nuance', 'Complex tasks'],
    costTier: 'high',
  },
};

// Get recommended model based on task type
export function getRecommendedModel(
  requiresVision: boolean = false,
  requiresComplexReasoning: boolean = false,
  preferLowCost: boolean = true
): AIModel {
  if (requiresComplexReasoning) {
    return 'google/gemini-2.5-pro';
  }
  
  if (requiresVision) {
    return preferLowCost ? 'google/gemini-2.5-flash' : 'google/gemini-2.5-pro';
  }
  
  return 'google/gemini-2.5-flash';
}
