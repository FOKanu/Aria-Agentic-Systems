/**
 * Shared agent chat runner — single brain path for Chat UI and floating chat.
 * Sprint 2: local-only tools when runtime is paired; text cloud fallback without tools.
 */

import type { AgentRoleId, AIModel, AIToolCall, RoutingDecision } from '../types';
import { routeTask } from '../lib/router';
import { generateAgentSystemPrompt } from '../lib/prompts';
import {
  checkLocalModelHealth,
  callLocalModelStreaming,
  callLocalModelForTools,
} from '../services/localModel';
import { getToolDefinitions, executeToolCall, type ApprovalRequest } from '../services/toolRegistry';
import { runtimeClient } from '../services/runtimeBridge';

const CHAT_ENDPOINT = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/chat`;
const MAX_TOOL_ROUNDS = 3;

export interface AgentChatTurnMessage {
  role: 'user' | 'assistant' | 'system' | 'tool';
  content: string;
  tool_calls?: AIToolCall[];
  tool_call_id?: string;
}

export interface ToolEvent {
  name: string;
  args: unknown;
  result?: unknown;
  error?: string;
}

export interface RunAgentChatTurnParams {
  content: string;
  history?: AgentChatTurnMessage[];
  agentRole: AgentRoleId;
  agentId: string;
  fileContext?: string;
  preferLocal?: boolean;
  /**
   * When true, offer tools on the **local** path if the sidecar is paired + healthy.
   * Cloud fallback stays text-only (MVP).
   */
  enableTools?: boolean;
  signal?: AbortSignal;
  onRouting?: (routing: RoutingDecision) => void;
  onDelta?: (delta: string, fullContent: string) => void;
  onToolEvent?: (event: ToolEvent) => void;
  onStatus?: (message: string) => void;
  /**
   * HITL: resolve true to approve, false to reject.
   * Required for medium/high-risk commands and fs_write when tools are enabled.
   */
  onApprovalRequired?: (req: ApprovalRequest) => Promise<boolean>;
}

export interface RunAgentChatTurnResult {
  content: string;
  routing: RoutingDecision;
  providerUsed: 'local' | 'lovable-ai';
  toolsUsed: boolean;
  toolEvents: ToolEvent[];
}

async function streamOpenAICompatibleResponse(
  response: Response,
  onDelta?: (delta: string, fullContent: string) => void,
  signal?: AbortSignal
): Promise<string> {
  const reader = response.body?.getReader();
  if (!reader) throw new Error('No stream body');

  const decoder = new TextDecoder();
  let fullContent = '';
  let buffer = '';

  while (true) {
    if (signal?.aborted) {
      reader.cancel().catch(() => undefined);
      throw new DOMException('Aborted', 'AbortError');
    }

    const { done, value } = await reader.read();
    if (done) break;

    buffer += decoder.decode(value, { stream: true });
    const lines = buffer.split('\n');
    buffer = lines.pop() || '';

    for (const line of lines) {
      if (!line.trim()) continue;
      try {
        const cleanLine = line.startsWith('data: ') ? line.slice(6) : line;
        if (cleanLine === '[DONE]') continue;

        const parsed = JSON.parse(cleanLine);
        const delta =
          parsed.choices?.[0]?.delta?.content ||
          parsed.message?.content ||
          parsed.response ||
          '';

        if (delta) {
          fullContent += delta;
          onDelta?.(delta, fullContent);
        }
      } catch {
        // partial JSON chunk — ignore
      }
    }
  }

  return fullContent;
}

async function callCloudStream(
  apiMessages: AgentChatTurnMessage[],
  model: AIModel,
  agentRole: AgentRoleId,
  signal?: AbortSignal
): Promise<Response> {
  const response = await fetch(CHAT_ENDPOINT, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
    },
    body: JSON.stringify({
      messages: apiMessages,
      model,
      agentRole,
      stream: true,
    }),
    signal,
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(
      (errorData as { error?: string }).error ||
        `Cloud chat failed with status ${response.status}`
    );
  }

  return response;
}

async function isRuntimeReady(): Promise<boolean> {
  if (!runtimeClient.getToken()) return false;
  try {
    const health = await runtimeClient.checkHealth();
    return health?.status === 'ok';
  } catch {
    return false;
  }
}

function parseToolArgs(raw: string): unknown {
  try {
    return JSON.parse(raw || '{}');
  } catch {
    return { raw };
  }
}

/**
 * Run one agent chat turn. Prefers tunneled Ollama; falls back to Gemini via Supabase.
 * Tools run only on local Ollama when the sidecar is ready.
 */
export async function runAgentChatTurn(
  params: RunAgentChatTurnParams
): Promise<RunAgentChatTurnResult> {
  const {
    content,
    history = [],
    agentRole,
    agentId: _agentId,
    fileContext,
    preferLocal = true,
    enableTools = false,
    signal,
    onRouting,
    onDelta,
    onToolEvent,
    onStatus,
    onApprovalRequired,
  } = params;

  const localAvailable = await checkLocalModelHealth();
  const runtimeReady = enableTools ? await isRuntimeReady() : false;
  const toolsActive = Boolean(enableTools && localAvailable && runtimeReady);
  const tools = toolsActive ? getToolDefinitions() : undefined;

  if (enableTools && !runtimeReady) {
    onStatus?.(
      'Runtime unpaired or offline — chat continues without tools. Pair the sidecar in Settings to enable actions.'
    );
  }

  const routing = routeTask(
    content,
    agentRole,
    !!fileContext,
    history.length,
    preferLocal,
    localAvailable
  );
  onRouting?.(routing);

  const toolHint = toolsActive
    ? `\n\n## Tools\nYou can call tools to act on the local machine (list/read/write files, run allowlisted commands).\nPrefer fs_list when the user asks what files exist. Keep tool arguments valid JSON.`
    : '';

  const systemPrompt = `${generateAgentSystemPrompt(agentRole, fileContext)}${toolHint}`;

  const workingMessages: AgentChatTurnMessage[] = [
    { role: 'system', content: systemPrompt },
    ...history.filter(
      (m) =>
        m.role === 'user' ||
        m.role === 'assistant' ||
        m.role === 'tool' ||
        m.role === 'system'
    ),
    { role: 'user', content },
  ];

  const toolEvents: ToolEvent[] = [];
  const tryLocal = routing.provider === 'local' && localAvailable;

  if (tryLocal) {
    try {
      if (toolsActive && tools?.length) {
        for (let round = 0; round < MAX_TOOL_ROUNDS; round++) {
          if (signal?.aborted) throw new DOMException('Aborted', 'AbortError');

          onStatus?.(
            round === 0
              ? 'Consulting local model with tools…'
              : `Tool round ${round + 1}…`
          );

          const completion = await callLocalModelForTools({
            messages: workingMessages,
            model: routing.model,
            stream: false,
            temperature: 0.2,
            tools,
            toolChoice: 'auto',
          });

          if (completion.toolCalls.length === 0) {
            const text = completion.content || '';
            if (text) onDelta?.(text, text);
            return {
              content: text,
              routing,
              providerUsed: 'local',
              toolsUsed: toolEvents.length > 0,
              toolEvents,
            };
          }

          // Record assistant tool-call turn
          workingMessages.push({
            role: 'assistant',
            content: completion.content || '',
            tool_calls: completion.toolCalls,
          });

          for (const call of completion.toolCalls) {
            const args = parseToolArgs(call.function.arguments);
            onStatus?.(`Running tool: ${call.function.name}`);
            onToolEvent?.({ name: call.function.name, args });

            let result: unknown;
            let error: string | undefined;
            try {
              result = await executeToolCall(call.function.name, args, {
                requestApproval: onApprovalRequired,
              });
            } catch (err) {
              error = err instanceof Error ? err.message : String(err);
              result = { error };
            }

            const event: ToolEvent = {
              name: call.function.name,
              args,
              result,
              error,
            };
            toolEvents.push(event);
            onToolEvent?.(event);

            workingMessages.push({
              role: 'tool',
              tool_call_id: call.id,
              content: JSON.stringify(result),
            });
          }
        }

        // Final synthesis after max tool rounds
        onStatus?.('Summarizing tool results…');
        const response = await callLocalModelStreaming({
          messages: workingMessages,
          model: routing.model,
          stream: true,
          temperature: 0.5,
        });
        const text = await streamOpenAICompatibleResponse(response, onDelta, signal);
        return {
          content: text,
          routing,
          providerUsed: 'local',
          toolsUsed: toolEvents.length > 0,
          toolEvents,
        };
      }

      // Text-only local stream (no tools)
      const response = await callLocalModelStreaming({
        messages: workingMessages,
        model: routing.model,
        stream: true,
        temperature: 0.7,
      });
      const text = await streamOpenAICompatibleResponse(response, onDelta, signal);
      return {
        content: text,
        routing,
        providerUsed: 'local',
        toolsUsed: false,
        toolEvents,
      };
    } catch (err) {
      if ((err as Error).name === 'AbortError') throw err;
      console.warn('[agentChatRunner] Local path failed — falling back to cloud:', err);
    }
  }

  // Cloud fallback — text only (no tools in MVP)
  const cloudModel =
    routing.provider === 'lovable-ai'
      ? routing.model
      : ('google/gemini-2.5-flash' as AIModel);

  const cloudRouting: RoutingDecision = {
    ...routing,
    provider: 'lovable-ai',
    model: cloudModel,
    reason:
      routing.provider === 'local'
        ? 'Local model failed or unavailable; using cloud fallback'
        : routing.reason,
  };
  onRouting?.(cloudRouting);

  const response = await callCloudStream(
    workingMessages.filter((m) => m.role !== 'tool') as AgentChatTurnMessage[],
    cloudModel,
    agentRole,
    signal
  );
  const text = await streamOpenAICompatibleResponse(response, onDelta, signal);
  return {
    content: text,
    routing: cloudRouting,
    providerUsed: 'lovable-ai',
    toolsUsed: false,
    toolEvents,
  };
}

/** Map Chat UI agent id → engine role id (ids already align). */
export function resolveAgentRoleId(agentId: string | undefined): AgentRoleId {
  const allowed: AgentRoleId[] = [
    'atlas', 'nova', 'sage', 'echo', 'pixel',
    'nexus', 'cipher', 'flux', 'aria', 'orion',
  ];
  if (agentId && (allowed as string[]).includes(agentId)) {
    return agentId as AgentRoleId;
  }
  return 'atlas';
}
