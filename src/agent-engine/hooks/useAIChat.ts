// Main AI Chat Hook
// Integrates routing, streaming, and services for agent chat functionality

import { useState, useCallback, useRef } from 'react';
import { 
  ChatMessage, 
  StreamingState, 
  RoutingDecision, 
  AIError,
  AgentRoleId,
  AIModel,
  AgentChatState
} from '../types';
import { routeTask, getModelDisplayName, getProviderDisplayName } from '../lib/router';
import { generateAgentSystemPrompt } from '../lib/prompts';
import { processStream } from '../lib/streaming';
import { checkLocalModelHealth } from '../services/localModel';

// Chat endpoint (will be edge function when Cloud is enabled)
const CHAT_ENDPOINT = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/chat`;

export interface UseAIChatOptions {
  agentRole: AgentRoleId;
  agentId: string;
  preferLocal?: boolean;
  onMessageComplete?: (message: ChatMessage) => void;
  onError?: (error: AIError) => void;
}

export interface UseAIChatReturn {
  messages: ChatMessage[];
  streaming: StreamingState;
  lastRouting: RoutingDecision | null;
  error: AIError | null;
  sendMessage: (content: string, fileContext?: string) => Promise<void>;
  cancelStream: () => void;
  clearHistory: () => void;
  regenerateLastResponse: () => Promise<void>;
  isLocalAvailable: boolean;
  checkLocalAvailability: () => Promise<boolean>;
}

export function useAIChat(options: UseAIChatOptions): UseAIChatReturn {
  const { agentRole, agentId, preferLocal = false, onMessageComplete, onError } = options;
  
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [streaming, setStreaming] = useState<StreamingState>({
    isStreaming: false,
    content: '',
    provider: null,
    model: null,
    error: null,
    tokensReceived: 0,
  });
  const [lastRouting, setLastRouting] = useState<RoutingDecision | null>(null);
  const [error, setError] = useState<AIError | null>(null);
  const [isLocalAvailable, setIsLocalAvailable] = useState(false);
  
  const abortControllerRef = useRef<AbortController | null>(null);
  
  // Check local model availability
  const checkLocalAvailability = useCallback(async (): Promise<boolean> => {
    const available = await checkLocalModelHealth();
    setIsLocalAvailable(available);
    return available;
  }, []);
  
  // Send a message
  const sendMessage = useCallback(async (content: string, fileContext?: string) => {
    // Create user message
    const userMessage: ChatMessage = {
      id: `msg-${Date.now()}-user`,
      role: 'user',
      content,
      timestamp: new Date().toISOString(),
      agentId,
    };
    
    setMessages(prev => [...prev, userMessage]);
    setError(null);
    
    // Route the task
    const routing = routeTask(
      content,
      agentRole,
      !!fileContext,
      messages.length,
      preferLocal,
      isLocalAvailable
    );
    setLastRouting(routing);
    
    // Generate system prompt
    const systemPrompt = generateAgentSystemPrompt(agentRole, fileContext);
    
    // Prepare messages for API
    const apiMessages = [
      { role: 'system' as const, content: systemPrompt },
      ...messages.map(m => ({ role: m.role, content: m.content })),
      { role: 'user' as const, content },
    ];
    
    // Start streaming state
    setStreaming({
      isStreaming: true,
      content: '',
      provider: routing.provider,
      model: routing.model,
      error: null,
      startedAt: new Date().toISOString(),
      tokensReceived: 0,
    });
    
    // Create abort controller
    abortControllerRef.current = new AbortController();
    
    try {
      // Call the chat endpoint (edge function)
      const response = await fetch(CHAT_ENDPOINT, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
        },
        body: JSON.stringify({
          messages: apiMessages,
          model: routing.model,
          agentRole,
          stream: true,
        }),
        signal: abortControllerRef.current.signal,
      });
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw {
          type: response.status === 429 ? 'rate_limit' : 
                response.status === 402 ? 'payment_required' : 'invalid_request',
          message: errorData.error || `Request failed with status ${response.status}`,
          provider: routing.provider,
          retryable: response.status >= 500,
        } as AIError;
      }
      
      let fullContent = '';
      let tokenCount = 0;
      
      // Process the stream
      await processStream(
        response,
        (delta, content) => {
          fullContent = content;
          tokenCount++;
          setStreaming(prev => ({
            ...prev,
            content,
            tokensReceived: tokenCount,
          }));
        },
        () => {
          // Stream complete
          const assistantMessage: ChatMessage = {
            id: `msg-${Date.now()}-assistant`,
            role: 'assistant',
            content: fullContent,
            timestamp: new Date().toISOString(),
            agentId,
            metadata: {
              provider: routing.provider,
              model: routing.model,
              tokensUsed: tokenCount,
            },
          };
          
          setMessages(prev => [...prev, assistantMessage]);
          setStreaming({
            isStreaming: false,
            content: '',
            provider: null,
            model: null,
            error: null,
            tokensReceived: 0,
          });
          
          onMessageComplete?.(assistantMessage);
        },
        (err) => {
          const aiError: AIError = {
            type: 'network_error',
            message: err.message,
            provider: routing.provider,
            retryable: true,
          };
          setError(aiError);
          setStreaming(prev => ({
            ...prev,
            isStreaming: false,
            error: err.message,
          }));
          onError?.(aiError);
        }
      );
    } catch (err) {
      if ((err as Error).name === 'AbortError') {
        // User cancelled, don't treat as error
        setStreaming({
          isStreaming: false,
          content: '',
          provider: null,
          model: null,
          error: null,
          tokensReceived: 0,
        });
        return;
      }
      
      const aiError = (err as AIError).type ? err as AIError : {
        type: 'network_error' as const,
        message: err instanceof Error ? err.message : 'Unknown error',
        provider: routing.provider,
        retryable: true,
      };
      
      setError(aiError);
      setStreaming({
        isStreaming: false,
        content: '',
        provider: null,
        model: null,
        error: aiError.message,
        tokensReceived: 0,
      });
      onError?.(aiError);
    }
  }, [agentRole, agentId, messages, preferLocal, isLocalAvailable, onMessageComplete, onError]);
  
  // Cancel streaming
  const cancelStream = useCallback(() => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
    }
  }, []);
  
  // Clear history
  const clearHistory = useCallback(() => {
    setMessages([]);
    setError(null);
    setLastRouting(null);
    setStreaming({
      isStreaming: false,
      content: '',
      provider: null,
      model: null,
      error: null,
      tokensReceived: 0,
    });
  }, []);
  
  // Regenerate last response
  const regenerateLastResponse = useCallback(async () => {
    if (messages.length < 2) return;
    
    // Find the last user message (iterate backwards)
    let lastUserMessageIndex = -1;
    for (let i = messages.length - 1; i >= 0; i--) {
      if (messages[i].role === 'user') {
        lastUserMessageIndex = i;
        break;
      }
    }
    if (lastUserMessageIndex === -1) return;
    
    const lastUserMessage = messages[lastUserMessageIndex];
    
    // Remove all messages after the last user message
    setMessages(prev => prev.slice(0, lastUserMessageIndex + 1));
    
    // Resend the message
    await sendMessage(lastUserMessage.content);
  }, [messages, sendMessage]);
  
  return {
    messages,
    streaming,
    lastRouting,
    error,
    sendMessage,
    cancelStream,
    clearHistory,
    regenerateLastResponse,
    isLocalAvailable,
    checkLocalAvailability,
  };
}

// Helper to get display info for current routing
export function getRoutingDisplayInfo(routing: RoutingDecision | null): {
  provider: string;
  model: string;
  reason: string;
} {
  if (!routing) {
    return { provider: '', model: '', reason: '' };
  }
  
  return {
    provider: getProviderDisplayName(routing.provider),
    model: getModelDisplayName(routing.model),
    reason: routing.reason,
  };
}
