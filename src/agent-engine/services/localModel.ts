// Local Model Service
// Integration with local LLMs via Docker/Ollama (OpenAI-compatible API)
// Default target: Ollama on localhost:11434 (SSH-tunneled remote GPU box)

import { AIModel, AIResponse, AIRequestPayload, AIError, AIToolCall } from '../types';
import { parseNonStreamingResponse } from '../lib/streaming';

const DEFAULT_LOCAL_ENDPOINT = 'http://localhost:11434/v1';
const DEFAULT_CHAT_MODEL: AIModel = 'qwen3:8b';

function resolveEndpoint(override?: string): string {
  const fromEnv = import.meta.env.VITE_LOCAL_MODEL_ENDPOINT as string | undefined;
  return (override || fromEnv || DEFAULT_LOCAL_ENDPOINT).replace(/\/$/, '');
}

function resolveDefaultModel(override?: AIModel): AIModel {
  const fromEnv = import.meta.env.VITE_LOCAL_MODEL_NAME as AIModel | undefined;
  return override || fromEnv || DEFAULT_CHAT_MODEL;
}

// Configuration for local model
export interface LocalModelConfig {
  endpoint?: string;
  timeout?: number;
  defaultModel?: AIModel;
}

const defaultConfig: LocalModelConfig = {
  endpoint: DEFAULT_LOCAL_ENDPOINT,
  timeout: 120000, // 32B models can be slow over tunnel
  defaultModel: DEFAULT_CHAT_MODEL,
};

// Check if local model server is available
export async function checkLocalModelHealth(
  config: LocalModelConfig = defaultConfig
): Promise<boolean> {
  const endpoint = resolveEndpoint(config.endpoint);

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
  const endpoint = resolveEndpoint(config.endpoint);

  try {
    const response = await fetch(`${endpoint}/models`, {
      method: 'GET',
    });

    if (!response.ok) {
      return [];
    }

    const data = await response.json();
    // OpenAI-compatible: { data: [{ id }] }; Ollama native sometimes uses { models: [{ name }] }
    if (Array.isArray(data.data)) {
      return data.data.map((m: { id?: string; name?: string }) => m.id || m.name).filter(Boolean);
    }
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
  const endpoint = resolveEndpoint(config.endpoint);
  const model = payload.model || resolveDefaultModel(config.defaultModel);

  const controller = new AbortController();
  const timeoutId = setTimeout(
    () => controller.abort(),
    config.timeout || 120000
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
        ...(payload.tools?.length
          ? {
              tools: payload.tools,
              tool_choice: payload.toolChoice ?? 'auto',
            }
          : {}),
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
    const toolCalls = extractToolCallsFromCompletion(data);

    return {
      id: data.id || `local-${Date.now()}`,
      content,
      model: model as AIModel,
      provider: 'local',
      finishReason: toolCalls.length
        ? 'tool_calls'
        : (data.choices?.[0]?.finish_reason || 'stop'),
      usage: data.usage ? {
        promptTokens: data.usage.prompt_tokens,
        completionTokens: data.usage.completion_tokens,
        totalTokens: data.usage.total_tokens,
      } : undefined,
      toolCalls,
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
  const endpoint = resolveEndpoint(config.endpoint);
  const model = payload.model || resolveDefaultModel(config.defaultModel);

  const controller = new AbortController();
  const timeoutId = setTimeout(
    () => controller.abort(),
    config.timeout || 120000
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
        ...(payload.tools?.length
          ? {
              tools: payload.tools,
              tool_choice: payload.toolChoice ?? 'auto',
            }
          : {}),
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

/** Normalize OpenAI / Ollama tool_calls from a chat completion payload */
export function extractToolCallsFromCompletion(data: unknown): AIToolCall[] {
  if (!data || typeof data !== 'object') return [];
  const obj = data as Record<string, unknown>;

  const fromChoices = () => {
    const choices = obj.choices;
    if (!Array.isArray(choices) || !choices[0]) return [];
    const message = (choices[0] as Record<string, unknown>).message as
      | Record<string, unknown>
      | undefined;
    const calls = message?.tool_calls;
    return normalizeToolCalls(calls);
  };

  const fromMessage = () => {
    const message = obj.message as Record<string, unknown> | undefined;
    return normalizeToolCalls(message?.tool_calls);
  };

  const calls = fromChoices();
  if (calls.length) return calls;
  return fromMessage();
}

function normalizeToolCalls(raw: unknown): AIToolCall[] {
  if (!Array.isArray(raw)) return [];
  return raw
    .map((item, index) => {
      const call = item as Record<string, unknown>;
      const fn = (call.function || call) as Record<string, unknown>;
      const name = typeof fn.name === 'string' ? fn.name : '';
      if (!name) return null;
      let args = fn.arguments;
      if (args && typeof args === 'object') {
        args = JSON.stringify(args);
      }
      if (typeof args !== 'string') args = '{}';
      return {
        id: typeof call.id === 'string' ? call.id : `call_${index}`,
        type: 'function' as const,
        function: {
          name,
          arguments: args,
        },
      };
    })
    .filter((c): c is AIToolCall => c !== null);
}

/**
 * Prefer non-streaming when tools are present — more reliable with Ollama tool calling.
 */
export async function callLocalModelForTools(
  payload: AIRequestPayload,
  config: LocalModelConfig = defaultConfig
): Promise<{ content: string; toolCalls: AIToolCall[]; finishReason: string }> {
  const result = await callLocalModel(payload, config);
  const toolCalls = result.toolCalls?.length
    ? result.toolCalls
    : tryParseToolCallsFromText(result.content);

  return {
    content: result.content,
    toolCalls,
    finishReason: toolCalls.length ? 'tool_calls' : result.finishReason,
  };
}

/** Soft fallback when the model writes a JSON tool call into text instead of tool_calls */
export function tryParseToolCallsFromText(content: string): AIToolCall[] {
  if (!content?.trim()) return [];

  const patterns = [
    /```(?:json)?\s*([\s\S]*?)\s*```/i,
    /(\{[\s\S]*"name"\s*:\s*"(?:fs_list|fs_read|fs_write|execute_command)"[\s\S]*\})/,
  ];

  for (const pattern of patterns) {
    const match = content.match(pattern);
    if (!match) continue;
    try {
      const parsed = JSON.parse(match[1]);
      const candidates = Array.isArray(parsed)
        ? parsed
        : parsed.tool_calls
          ? parsed.tool_calls
          : parsed.name
            ? [parsed]
            : [];

      return normalizeToolCalls(
        candidates.map((c: Record<string, unknown>, i: number) => {
          if (c.function) return c;
          return {
            id: `text_call_${i}`,
            type: 'function',
            function: {
              name: c.name,
              arguments:
                typeof c.arguments === 'string'
                  ? c.arguments
                  : JSON.stringify(c.arguments ?? c.parameters ?? {}),
            },
          };
        })
      );
    } catch {
      // try next pattern
    }
  }

  return [];
}

// Model recommendations for local / tunneled Ollama deployment
export const LOCAL_MODEL_RECOMMENDATIONS = {
  'qwen3:8b': {
    minVRAM: '8GB',
    description: 'Default fast chat model',
    strengths: ['Speed', 'General chat', 'Low latency over tunnel'],
  },
  'qwen3:32b': {
    minVRAM: '24GB+',
    description: 'Stronger chat / reasoning (load only one 32B at a time)',
    strengths: ['Reasoning', 'Quality', 'Longer answers'],
  },
  'qwen2.5-coder:32b': {
    minVRAM: '24GB+',
    description: 'Coding-focused 32B',
    strengths: ['Code generation', 'Debugging', 'Refactoring'],
  },
  'deepseek-r1:32b': {
    minVRAM: '24GB+',
    description: 'Deep reasoning model',
    strengths: ['Reasoning', 'Analysis', 'Hard problems'],
  },
  'llama3.2:1b': {
    minVRAM: '2GB',
    description: 'Tiny / smoke-test model',
    strengths: ['Speed', 'Smoke tests'],
  },
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
