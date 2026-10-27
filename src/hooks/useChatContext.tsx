// Global Chat Context - Francis Okorie Iyeke-Kanu
import React, { createContext, useContext, useState, useCallback, ReactNode, useRef } from 'react';
import { ChatMessage, ChatStatus, ChatAttachment, CHAT_AGENTS } from '@/types/chat';
import { useTextToSpeech } from '@/hooks/useTextToSpeech';
import { useToast } from '@/hooks/use-toast';
import {
  runAgentChatTurn,
  resolveAgentRoleId,
  type AgentChatTurnMessage,
} from '@/agent-engine/services/agentChatRunner';

export interface PageContext {
  pageId: string;
  pageName: string;
  pageCategory?: string;
  contextData?: Record<string, unknown>;
}

interface ChatContextType {
  messages: ChatMessage[];
  status: ChatStatus;
  selectedAgentIds: string[];
  isOpen: boolean;
  pageContext: PageContext | null;
  pendingApproval: { id: string; description: string } | null;

  // Actions
  addMessage: (message: Omit<ChatMessage, 'id' | 'timestamp'>) => void;
  sendMessage: (content: string, attachments?: ChatAttachment[], mentionedAgentIds?: string[]) => Promise<void>;
  setSelectedAgentIds: (ids: string[]) => void;
  toggleChat: () => void;
  openChat: () => void;
  closeChat: () => void;
  setPageContext: (context: PageContext | null) => void;
  clearMessages: () => void;
  approvePendingAction: () => void;
  rejectPendingAction: () => void;
}

const ChatContext = createContext<ChatContextType | null>(null);

export function ChatProvider({ children }: { children: ReactNode }) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [status, setStatus] = useState<ChatStatus>('idle');
  const [selectedAgentIds, setSelectedAgentIds] = useState<string[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [pageContext, setPageContext] = useState<PageContext | null>(null);
  const [pendingApproval, setPendingApproval] = useState<{ id: string; description: string } | null>(null);
  const streamingContentRef = useRef<string>('');
  const abortRef = useRef<AbortController | null>(null);
  const approvalResolverRef = useRef<((approved: boolean) => void) | null>(null);

  const { toast } = useToast();
  const tts = useTextToSpeech();

  const addMessage = useCallback((message: Omit<ChatMessage, 'id' | 'timestamp'>) => {
    setMessages((prev) => [
      ...prev,
      {
        ...message,
        id: `msg-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        timestamp: new Date(),
      },
    ]);
  }, []);

  const updateLastAssistantMessage = useCallback((content: string, agentId?: string) => {
    const respondingAgent =
      CHAT_AGENTS.find((a) => a.id === agentId) ||
      CHAT_AGENTS.find((a) => a.id === 'atlas') ||
      CHAT_AGENTS[0];

    setMessages((prev) => {
      const last = prev[prev.length - 1];
      if (last?.sender === 'agent') {
        return prev.map((m, i) =>
          i === prev.length - 1 ? { ...m, content, isStreaming: true } : m
        );
      }
      return [
        ...prev,
        {
          id: `msg-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
          content,
          sender: 'agent' as const,
          type: 'text' as const,
          timestamp: new Date(),
          agentId: respondingAgent.id,
          agentName: respondingAgent.name,
          agentRole: respondingAgent.role,
          agentAvatar: respondingAgent.avatar,
          isStreaming: true,
        },
      ];
    });
  }, []);

  const sendMessage = useCallback(async (
    content: string,
    attachments?: ChatAttachment[],
    mentionedAgentIds?: string[]
  ) => {
    let nextSelected = selectedAgentIds;
    if (mentionedAgentIds && mentionedAgentIds.length > 0) {
      nextSelected = [
        ...selectedAgentIds,
        ...mentionedAgentIds.filter((id) => !selectedAgentIds.includes(id)),
      ];
      setSelectedAgentIds(nextSelected);
    }

    const respondingAgent =
      CHAT_AGENTS.find((a) => nextSelected.includes(a.id)) ||
      CHAT_AGENTS.find((a) => a.id === 'atlas') ||
      CHAT_AGENTS[0];

    addMessage({
      content,
      sender: 'user',
      type: 'text',
      attachments,
    });

    setStatus('thinking');
    streamingContentRef.current = '';

    const history: AgentChatTurnMessage[] = messages
      .filter((m) => m.type === 'text' && (m.sender === 'user' || m.sender === 'agent'))
      .map((m) => ({
        role: m.sender === 'user' ? ('user' as const) : ('assistant' as const),
        content: m.content,
      }));

    const fileContext = pageContext
      ? [
          `Current page: ${pageContext.pageName}`,
          pageContext.pageCategory ? `Category: ${pageContext.pageCategory}` : '',
          pageContext.contextData
            ? `Context: ${JSON.stringify(pageContext.contextData)}`
            : '',
        ]
          .filter(Boolean)
          .join('\n')
      : undefined;

    abortRef.current?.abort();
    abortRef.current = new AbortController();

    try {
      await runAgentChatTurn({
        content,
        history,
        agentRole: resolveAgentRoleId(respondingAgent.id),
        agentId: respondingAgent.id,
        fileContext,
        preferLocal: true,
        enableTools: true,
        signal: abortRef.current.signal,
        onStatus: (message) => {
          if (!message.toLowerCase().includes('runtime unpaired') &&
              !message.toLowerCase().includes('running tool')) {
            return;
          }
          setStatus('executing');
          addMessage({
            content: message,
            sender: 'system',
            type: 'status',
            structuredData: { status: 'started' },
          });
        },
        onToolEvent: (event) => {
          if (event.result !== undefined || event.error) {
            addMessage({
              content: event.error
                ? `Tool ${event.name} failed: ${event.error}`
                : `Tool ${event.name} completed`,
              sender: 'system',
              type: 'status',
              structuredData: { status: event.error ? 'error' : 'completed' },
            });
          }
        },
        onDelta: (_delta, full) => {
          setStatus('executing');
          streamingContentRef.current = full;
          updateLastAssistantMessage(full, respondingAgent.id);
        },
        onApprovalRequired: (req) =>
          new Promise<boolean>((resolve) => {
            approvalResolverRef.current?.(false);
            approvalResolverRef.current = resolve;
            setIsOpen(true);
            setStatus('executing');
            setPendingApproval({ id: req.id, description: req.description });
            addMessage({
              content: `Waiting for approval: ${req.description}`,
              sender: 'system',
              type: 'status',
              structuredData: { status: 'waiting' },
            });
          }),
      });

      setMessages((prev) => {
        const last = prev[prev.length - 1];
        if (last?.sender === 'agent' && last.isStreaming) {
          return prev.map((m, i) =>
            i === prev.length - 1 ? { ...m, isStreaming: false } : m
          );
        }
        return prev;
      });

      setStatus('idle');
      if (tts.enabled && streamingContentRef.current) {
        tts.speak(streamingContentRef.current);
      }
    } catch (error) {
      if ((error as Error).name === 'AbortError') return;

      console.error('Chat error:', error);
      toast({
        title: 'Chat Error',
        description: error instanceof Error ? error.message : 'Unknown error',
        variant: 'destructive',
      });
      setStatus('idle');
    }
  }, [
    messages,
    addMessage,
    updateLastAssistantMessage,
    pageContext,
    tts,
    toast,
    selectedAgentIds,
  ]);

  const approvePendingAction = useCallback(() => {
    approvalResolverRef.current?.(true);
    approvalResolverRef.current = null;
    setPendingApproval(null);
    addMessage({
      content: 'Action approved. Executing…',
      sender: 'system',
      type: 'status',
      structuredData: { status: 'completed' },
    });
    toast({ title: 'Approved', description: 'The action will proceed.' });
  }, [addMessage, toast]);

  const rejectPendingAction = useCallback(() => {
    approvalResolverRef.current?.(false);
    approvalResolverRef.current = null;
    setPendingApproval(null);
    addMessage({
      content: 'Action rejected by user.',
      sender: 'system',
      type: 'status',
      structuredData: { status: 'error' },
    });
    toast({ title: 'Rejected', description: 'The action was cancelled.', variant: 'destructive' });
  }, [addMessage, toast]);

  const toggleChat = useCallback(() => {
    setIsOpen((prev) => !prev);
  }, []);

  const openChat = useCallback(() => {
    setIsOpen(true);
  }, []);

  const closeChat = useCallback(() => {
    setIsOpen(false);
  }, []);

  const clearMessages = useCallback(() => {
    setMessages([]);
    setStatus('idle');
  }, []);

  return (
    <ChatContext.Provider
      value={{
        messages,
        status,
        selectedAgentIds,
        isOpen,
        pageContext,
        pendingApproval,
        addMessage,
        sendMessage,
        setSelectedAgentIds,
        toggleChat,
        openChat,
        closeChat,
        setPageContext,
        clearMessages,
        approvePendingAction,
        rejectPendingAction,
      }}
    >
      {children}
    </ChatContext.Provider>
  );
}

export function useChatContext() {
  const context = useContext(ChatContext);
  if (!context) {
    throw new Error('useChatContext must be used within a ChatProvider');
  }
  return context;
}

// Hook to set page context when navigating
export function usePageChatContext(pageId: string, pageName: string, pageCategory?: string) {
  const { setPageContext } = useChatContext();

  React.useEffect(() => {
    setPageContext({ pageId, pageName, pageCategory });
    return () => setPageContext(null);
  }, [pageId, pageName, pageCategory, setPageContext]);
}
