import { useEffect, useRef } from 'react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { ChatMessage as ChatMessageType } from '@/types/chat';
import { ChatMessage } from './ChatMessage';

interface ConversationStreamProps {
  messages: ChatMessageType[];
}

export function ConversationStream({ messages }: ConversationStreamProps) {
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  if (messages.length === 0) {
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
      <div className="py-4 max-w-4xl mx-auto">
        {messages.map((message) => (
          <ChatMessage key={message.id} message={message} />
        ))}
        <div ref={bottomRef} />
      </div>
    </ScrollArea>
  );
}
