// Streaming Utilities for AI Responses
// SSE parsing and stream handling for both local and cloud providers

import { AIStreamChunk } from '../types';

// Parse a single SSE line and extract content
export function parseSSELine(line: string): {
  content?: string;
  tool_calls?: any[];
  done?: boolean;
  error?: string
} {
  // Handle empty lines and comments
  if (!line || line.startsWith(':')) {
    return {};
  }

  // Handle data prefix
  if (!line.startsWith('data: ')) {
    return {};
  }

  const data = line.slice(6).trim();

  // Handle stream end
  if (data === '[DONE]') {
    return { done: true };
  }

  // Parse JSON
  try {
    const parsed = JSON.parse(data);

    // OpenAI/Lovable AI format
    if (parsed.choices?.[0]?.delta) {
      const delta = parsed.choices[0].delta;
      const result: { content?: string; tool_calls?: any[] } = {};

      if (delta.content) {
        result.content = delta.content;
      }

      if (delta.tool_calls) {
        result.tool_calls = delta.tool_calls;
      }

      if (Object.keys(result).length > 0) {
        return result;
      }
    }

    // Handle finish reason
    if (parsed.choices?.[0]?.finish_reason) {
      return { done: parsed.choices[0].finish_reason === 'stop' };
    }

    // Ollama format
    if (parsed.message?.content) {
      return { content: parsed.message.content };
    }

    // Direct content
    if (parsed.content) {
      return { content: parsed.content };
    }

    // Error response
    if (parsed.error) {
      return { error: parsed.error.message || parsed.error };
    }

    return {};
  } catch {
    // Not valid JSON, might be partial - return empty
    return {};
  }
}

// Create an async iterator for streaming response
export async function* createStreamReader(
  response: Response
): AsyncGenerator<AIStreamChunk & { toolCalls?: any[] }, void, unknown> {
  if (!response.body) {
    throw new Error('Response body is null');
  }

  const reader = response.body.getReader();
  const decoder = new TextDecoder();
  let buffer = '';
  let chunkId = 0;
  let fullContent = '';

  try {
    while (true) {
      const { done, value } = await reader.read();

      if (done) {
        // Process any remaining buffer
        if (buffer.trim()) {
          for (const line of buffer.split('\n')) {
            const result = parseSSELine(line);
            if (result.content || result.tool_calls) {
              if (result.content) fullContent += result.content;
              yield {
                id: `chunk-${chunkId++}`,
                content: fullContent,
                delta: result.content || '',
                toolCalls: result.tool_calls,
              };
            }
          }
        }
        break;
      }

      buffer += decoder.decode(value, { stream: true });

      // Process complete lines
      let newlineIndex: number;
      while ((newlineIndex = buffer.indexOf('\n')) !== -1) {
        const line = buffer.slice(0, newlineIndex);
        buffer = buffer.slice(newlineIndex + 1);

        // Handle CRLF
        const cleanLine = line.endsWith('\r') ? line.slice(0, -1) : line;

        const result = parseSSELine(cleanLine);

        if (result.error) {
          throw new Error(result.error);
        }

        if (result.done) {
          return;
        }

        if (result.content || result.tool_calls) {
          if (result.content) fullContent += result.content;
          yield {
            id: `chunk-${chunkId++}`,
            content: fullContent,
            delta: result.content || '',
            toolCalls: result.tool_calls,
          };
        }
      }
    }
  } finally {
    reader.releaseLock();
  }
}

// Helper to process stream with callbacks
export async function processStream(
  response: Response,
  onDelta: (delta: string, fullContent: string, toolCalls?: any[]) => void,
  onDone: () => void,
  onError: (error: Error) => void
): Promise<string> {
  let fullContent = '';

  try {
    for await (const chunk of createStreamReader(response)) {
      fullContent = chunk.content;
      onDelta(chunk.delta, fullContent, chunk.toolCalls);
    }
    onDone();
    return fullContent;
  } catch (error) {
    onError(error instanceof Error ? error : new Error(String(error)));
    throw error;
  }
}

// Simple non-streaming response parser
export function parseNonStreamingResponse(data: unknown): string {
  if (!data || typeof data !== 'object') {
    return '';
  }

  const obj = data as Record<string, unknown>;

  // OpenAI/Lovable AI format
  if (Array.isArray(obj.choices) && obj.choices[0]) {
    const choice = obj.choices[0] as Record<string, unknown>;
    if (choice.message && typeof choice.message === 'object') {
      const message = choice.message as Record<string, unknown>;
      if (typeof message.content === 'string') {
        return message.content;
      }
    }
  }

  // Ollama format
  if (obj.message && typeof obj.message === 'object') {
    const message = obj.message as Record<string, unknown>;
    if (typeof message.content === 'string') {
      return message.content;
    }
  }

  // Direct content
  if (typeof obj.content === 'string') {
    return obj.content;
  }

  return '';
}

// Estimate tokens (rough approximation)
export function estimateTokens(text: string): number {
  // Rough estimate: ~4 characters per token on average
  return Math.ceil(text.length / 4);
}
