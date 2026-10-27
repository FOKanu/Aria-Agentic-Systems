// Conversation Stream - Francis Okorie Iyeke-Kanu
import { useEffect, useRef } from 'react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { ChatMessage as ChatMessageType } from '@/types/chat';
import { ChatMessage } from './ChatMessage';
import { TypingIndicator, ProcessingIndicator } from './TypingIndicator';
import { EmptyMessages } from '@/components/EmptyState';

interface TypingAgent {
  id: string;
  name: string;
  avatar: string;
  isProcessing?: boolean;
  task?: string;
}

interface ConversationStreamProps {
  messages: ChatMessageType[];
  typingAgents?: TypingAgent[];
}

/* Developed by Francis Okorie Iyeke-Kanu */
export function ConversationStream({ messages, typingAgents = [] }: ConversationStreamProps) {
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, typingAgents]);

  if (messages.length === 0 && typingAgents.length === 0) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center text-center px-8 py-12">
        <div className="text-6xl mb-4">💬</div>
        <h2 className="text-xl font-semibold font-display mb-2">Start a Conversation</h2>
        <p className="text-muted-foreground max-w-sm">
          Ask a question, assign a task, or speak to your AI agents. They're ready to help.
        </p>
      </div>
    );
  }

  return (
    <ScrollArea className="flex-1 px-4">
      <div className="py-4 max-w-4xl mx-auto space-y-4">
        {messages.map((message) => (
          <ChatMessage key={message.id} message={message} />
        ))}
        
        {/* Typing indicators */}
        {typingAgents.map((agent) => (
          agent.isProcessing ? (
            <ProcessingIndicator
              key={agent.id}
              agentName={agent.name}
              agentAvatar={agent.avatar}
              task={agent.task}
            />
          ) : (
            <TypingIndicator
              key={agent.id}
              agentName={agent.name}
              agentAvatar={agent.avatar}
            />
          )
        ))}
        
        <div ref={bottomRef} />
      </div>
    </ScrollArea>
  );
}
