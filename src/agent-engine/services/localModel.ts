// Local Model Service
// Integration with local LLMs via Docker/Ollama (OpenAI-compatible API)

import { AIModel, AIResponse, AIRequestPayload, AIError } from '../types';
import { parseNonStreamingResponse } from '../lib/streaming';

// Default local model endpoint (Ollama)
const DEFAULT_LOCAL_ENDPOINT = 'http://localhost:11434/v1';

// Configuration for local model
export interface LocalModelConfig {
  endpoint?: string;
  timeout?: number;
  defaultModel?: AIModel;
}

const defaultConfig: LocalModelConfig = {
  endpoint: DEFAULT_LOCAL_ENDPOINT,
  timeout: 60000, // 60 seconds
  defaultModel: 'llama3.1:8b',
};

// Check if local model server is available
export async function checkLocalModelHealth(
  config: LocalModelConfig = defaultConfig
): Promise<boolean> {
  const endpoint = config.endpoint || DEFAULT_LOCAL_ENDPOINT;

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 5000);

    const response = await fetch(`${endpoint}/models`, {
      method: 'GET',
      signal: controller.signal,
    });

    clearTimeout(timeoutId);
    return response.ok;
  } catch {
    return false;
  }
}

// Get available local models
export async function getAvailableLocalModels(
  config: LocalModelConfig = defaultConfig
): Promise<string[]> {
  const endpoint = config.endpoint || DEFAULT_LOCAL_ENDPOINT;

  try {
    const response = await fetch(`${endpoint}/models`, {
      method: 'GET',
    });

    if (!response.ok) {
      return [];
    }

    const data = await response.json();
    return data.models?.map((m: { id?: string; name?: string }) => m.id || m.name) || [];
  } catch {
    return [];
  }
}

// Call local model (non-streaming)
export async function callLocalModel(
  payload: AIRequestPayload,
  config: LocalModelConfig = defaultConfig
): Promise<AIResponse> {
  const endpoint = config.endpoint || DEFAULT_LOCAL_ENDPOINT;
  const model = payload.model || config.defaultModel || 'llama3.1:8b';

  const controller = new AbortController();
  const timeoutId = setTimeout(
    () => controller.abort(),
    config.timeout || 60000
  );

  try {
    const response = await fetch(`${endpoint}/chat/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model,
        messages: payload.messages,
        stream: false,
        temperature: payload.temperature ?? 0.7,
        max_tokens: payload.maxTokens,
      }),
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      const errorText = await response.text();
      throw createLocalError('invalid_request', `Local model error: ${errorText}`, false);
    }

    const data = await response.json();
    const content = parseNonStreamingResponse(data);

    return {
      id: data.id || `local-${Date.now()}`,
      content,
      model: model as AIModel,
      provider: 'local',
      finishReason: data.choices?.[0]?.finish_reason || 'stop',
      usage: data.usage ? {
        promptTokens: data.usage.prompt_tokens,
        completionTokens: data.usage.completion_tokens,
        totalTokens: data.usage.total_tokens,
      } : undefined,
    };
  } catch (error) {
    clearTimeout(timeoutId);

    if (error instanceof Error && error.name === 'AbortError') {
      throw createLocalError('timeout', 'Local model request timed out', true);
    }

    if ((error as AIError).type) {
      throw error;
    }

    throw createLocalError(
      'network_error',
      `Failed to connect to local model: ${error instanceof Error ? error.message : 'Unknown error'}`,
      true
    );
  }
}

// Call local model with streaming
export async function callLocalModelStreaming(
  payload: AIRequestPayload,
  config: LocalModelConfig = defaultConfig
): Promise<Response> {
  const endpoint = config.endpoint || DEFAULT_LOCAL_ENDPOINT;
  const model = payload.model || config.defaultModel || 'llama3.1:8b';

  const controller = new AbortController();
  const timeoutId = setTimeout(
    () => controller.abort(),
    config.timeout || 60000
  );

  try {
    const response = await fetch(`${endpoint}/chat/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model,
        messages: payload.messages,
        stream: true,
        temperature: payload.temperature ?? 0.7,
        max_tokens: payload.maxTokens,
      }),
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      const errorText = await response.text();
      throw createLocalError('invalid_request', `Local model error: ${errorText}`, false);
    }

    return response;
  } catch (error) {
    clearTimeout(timeoutId);

    if (error instanceof Error && error.name === 'AbortError') {
      throw createLocalError('timeout', 'Local model request timed out', true);
    }

    if ((error as AIError).type) {
      throw error;
    }

    throw createLocalError(
      'network_error',
      `Failed to connect to local model: ${error instanceof Error ? error.message : 'Unknown error'}`,
      true
    );
  }
}

// Create standardized local error
function createLocalError(
  type: AIError['type'],
  message: string,
  retryable: boolean
): AIError {
  return {
    type,
    message,
    provider: 'local',
    retryable,
  };
}

// Model recommendations for local deployment
export const LOCAL_MODEL_RECOMMENDATIONS = {
  'llama3.1:8b': {
    minVRAM: '8GB',
    description: 'Fast and efficient for simple tasks',
    strengths: ['Speed', 'Low resource usage', 'General tasks'],
  },
  'llama3.1:70b': {
    minVRAM: '48GB',
    description: 'High quality for complex reasoning',
    strengths: ['Complex reasoning', 'Code generation', 'Analysis'],
  },
  'mistral:7b': {
    minVRAM: '8GB',
    description: 'Good balance of speed and quality',
    strengths: ['Code', 'Instructions', 'Efficiency'],
  },
};
