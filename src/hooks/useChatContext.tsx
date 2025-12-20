// Global Chat Context - Francis Okorie Iyeke-Kanu
import React, { createContext, useContext, useState, useCallback, ReactNode } from 'react';
import { ChatMessage, ChatStatus, ChatAttachment, CHAT_AGENTS } from '@/types/chat';
import { useTextToSpeech } from '@/hooks/useTextToSpeech';
import { useToast } from '@/hooks/use-toast';

export interface PageContext {
  pageId: string;
  pageName: string;
  pageCategory?: string;
  contextData?: Record<string, any>;
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

  const simulateAgentResponse = useCallback(async (
    userMessage: string, 
    attachments?: ChatAttachment[],
    context?: PageContext | null
  ) => {
    setStatus('thinking');

    const attachmentText = attachments && attachments.length > 0 
      ? ` with ${attachments.length} file(s)` 
      : '';
    
    const contextText = context 
      ? ` (Context: ${context.pageName})` 
      : '';
    
    if (selectedAgentIds.length > 1) {
      addMessage({
        content: `Task delegated to ${selectedAgentIds.length} agents${attachmentText}${contextText}`,
        sender: 'system',
        type: 'status',
        structuredData: { status: 'started' },
      });
    } else if (context) {
      addMessage({
        content: `Fetching context from ${context.pageName}...`,
        sender: 'system',
        type: 'status',
        structuredData: { status: 'started' },
      });
    }

    await new Promise((r) => setTimeout(r, 1500));
    setStatus('executing');

    const respondingAgent =
      selectedAgentIds.length === 0
        ? CHAT_AGENTS.find((a) => a.role === 'planner')!
        : CHAT_AGENTS.find((a) => selectedAgentIds.includes(a.id)) || CHAT_AGENTS[0];

    // Context-aware responses
    const contextResponses: Record<string, string[]> = {
      'devops-pipelines': [
        'I can see your CI/CD pipeline status. Let me analyze the recent builds.',
        'I\'ve accessed the pipeline configuration. Here\'s what I found.',
        'Based on your current pipeline metrics, I can help optimize the workflow.',
      ],
      'devops-code-review': [
        'I\'m reviewing the pending code reviews. Here\'s the summary.',
        'I can see there are several PRs awaiting review.',
        'Let me analyze the code quality metrics from recent reviews.',
      ],
      'devops-deployment': [
        'I\'ve accessed the deployment dashboard. Current status looks stable.',
        'I can see your deployment history and current environments.',
        'Let me check the latest deployment metrics for you.',
      ],
      'devops-infrastructure': [
        'I\'m monitoring your infrastructure. All systems appear healthy.',
        'I can see CPU and memory usage across your clusters.',
        'Here\'s the infrastructure health report.',
      ],
      'devops-security': [
        'I\'ve scanned for security vulnerabilities. Here\'s the report.',
        'I can see the latest security scan results.',
        'Let me summarize the security findings for you.',
      ],
      'devops-logs': [
        'I\'m analyzing the logs for patterns and anomalies.',
        'I can see recent log entries. Let me filter for relevant information.',
        'Here\'s what I found in the log analysis.',
      ],
      'tasks': [
        'I can see your current tasks. Would you like me to help prioritize them?',
        'I\'ve reviewed your task list. Here are some suggestions.',
      ],
      'calendar': [
        'I\'ve accessed your calendar. Here\'s your upcoming schedule.',
        'I can help you manage your calendar events.',
      ],
      'files': [
        'I can see your file storage. What would you like to find?',
        'I\'ve accessed the file system. Here are the recent documents.',
      ],
      'default': [
        'I\'ve analyzed your request. Here\'s what I found:',
        'Based on my analysis, I can help you with that.',
        'Let me break this down for you.',
      ],
    };

    const responses = context?.pageId 
      ? contextResponses[context.pageId] || contextResponses['default']
      : contextResponses['default'];

    const response = responses[Math.floor(Math.random() * responses.length)];

    addMessage({
      content: response,
      sender: 'agent',
      type: 'text',
      agentId: respondingAgent.id,
      agentName: respondingAgent.name,
      agentRole: respondingAgent.role,
      agentAvatar: respondingAgent.avatar,
      confidence: Math.floor(Math.random() * 15) + 85,
    });

    if (tts.enabled) {
      tts.speak(response);
    }

    setStatus('idle');
  }, [selectedAgentIds, addMessage, tts]);

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
    
    addMessage({
      content,
      sender: 'user',
      type: 'text',
      attachments,
    });

    await simulateAgentResponse(content, attachments, pageContext);
  }, [addMessage, simulateAgentResponse, pageContext]);

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
