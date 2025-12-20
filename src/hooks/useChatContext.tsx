// Global Chat Context - Francis Okorie Iyeke-Kanu
import React, { createContext, useContext, useState, useCallback, ReactNode, useRef } from 'react';
import { ChatMessage, ChatStatus, ChatAttachment, CHAT_AGENTS } from '@/types/chat';
import { useTextToSpeech } from '@/hooks/useTextToSpeech';
import { useToast } from '@/hooks/use-toast';
import { streamChat, ChatMessage as StreamChatMessage } from '@/lib/chatStream';

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

  // Actions
  addMessage: (message: Omit<ChatMessage, 'id' | 'timestamp'>) => void;
  sendMessage: (content: string, attachments?: ChatAttachment[], mentionedAgentIds?: string[]) => Promise<void>;
  setSelectedAgentIds: (ids: string[]) => void;
  toggleChat: () => void;
  openChat: () => void;
  closeChat: () => void;
  setPageContext: (context: PageContext | null) => void;
  clearMessages: () => void;
}

const ChatContext = createContext<ChatContextType | null>(null);

export function ChatProvider({ children }: { children: ReactNode }) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [status, setStatus] = useState<ChatStatus>('idle');
  const [selectedAgentIds, setSelectedAgentIds] = useState<string[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [pageContext, setPageContext] = useState<PageContext | null>(null);
  const streamingContentRef = useRef<string>('');

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

  const updateLastAssistantMessage = useCallback((content: string) => {
    setMessages((prev) => {
      const last = prev[prev.length - 1];
      if (last?.sender === 'agent') {
        return prev.map((m, i) => 
          i === prev.length - 1 ? { ...m, content } : m
        );
      }
      // First token - create new assistant message
      const respondingAgent = CHAT_AGENTS.find((a) => a.role === 'planner')!;
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
        },
      ];
    });
  }, []);

  const sendMessage = useCallback(async (
    content: string,
    attachments?: ChatAttachment[],
    mentionedAgentIds?: string[]
  ) => {
    if (mentionedAgentIds && mentionedAgentIds.length > 0) {
      setSelectedAgentIds(prev => {
        const newIds = mentionedAgentIds.filter(id => !prev.includes(id));
        return [...prev, ...newIds];
      });
    }

    // Add user message
    addMessage({
      content,
      sender: 'user',
      type: 'text',
      attachments,
    });

    setStatus('thinking');
    streamingContentRef.current = '';

    // Convert messages to API format
    const apiMessages: StreamChatMessage[] = messages
      .filter(m => m.type === 'text' && (m.sender === 'user' || m.sender === 'agent'))
      .map(m => ({
        role: m.sender === 'user' ? 'user' as const : 'assistant' as const,
        content: m.content,
      }));
    
    // Add current message
    apiMessages.push({ role: 'user', content });

    try {
      await streamChat({
        messages: apiMessages,
        context: pageContext ? {
          pageName: pageContext.pageName,
          pageCategory: pageContext.pageCategory,
          contextData: pageContext.contextData,
        } : undefined,
        onDelta: (delta) => {
          if (status !== 'executing') {
            setStatus('executing');
          }
          streamingContentRef.current += delta;
          updateLastAssistantMessage(streamingContentRef.current);
        },
        onDone: () => {
          setStatus('idle');
          if (tts.enabled && streamingContentRef.current) {
            tts.speak(streamingContentRef.current);
          }
        },
        onError: (error) => {
          console.error('Chat error:', error);
          toast({
            title: "Chat Error",
            description: error.message,
            variant: "destructive",
          });
          setStatus('idle');
        },
      });
    } catch (error) {
      console.error('Chat error:', error);
      toast({
        title: "Connection Error",
        description: "Failed to connect to AI service. Please try again.",
        variant: "destructive",
      });
      setStatus('idle');
    }
  }, [messages, addMessage, updateLastAssistantMessage, pageContext, tts, toast, status]);

  const toggleChat = useCallback(() => {
    setIsOpen(prev => !prev);
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
        addMessage,
        sendMessage,
        setSelectedAgentIds,
        toggleChat,
        openChat,
        closeChat,
        setPageContext,
        clearMessages,
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
