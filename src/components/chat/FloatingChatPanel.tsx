// Floating Chat Panel - Francis Okorie Iyeke-Kanu
import { useState, useCallback, forwardRef } from 'react';
import { MessageSquare, X, Minimize2, Maximize2, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { ChatMessage } from './ChatMessage';
import { ChatInputBar } from './ChatInputBar';
import { TypingIndicator, ProcessingIndicator } from './TypingIndicator';
import { AgentSelectorModal } from './AgentSelectorModal';
import { ApprovalInline } from './ApprovalInline';
import { useChatContext } from '@/hooks/useChatContext';
import { CHAT_AGENTS, AgentPreset } from '@/types/chat';
import { useVoiceInput } from '@/hooks/useVoiceInput';
import { cn } from '@/lib/utils';

export const FloatingChatPanel = forwardRef<HTMLDivElement>(function FloatingChatPanel(_props, _ref) {
  const {
    messages,
    status,
    selectedAgentIds,
    isOpen,
    pageContext,
    pendingApproval,
    sendMessage,
    setSelectedAgentIds,
    toggleChat,
    closeChat,
    clearMessages,
    approvePendingAction,
    rejectPendingAction,
  } = useChatContext();

  const [isMaximized, setIsMaximized] = useState(false);
  const [agentSelectorOpen, setAgentSelectorOpen] = useState(false);
  
  const voiceInput = useVoiceInput();
  const selectedAgents = CHAT_AGENTS.filter((a) => selectedAgentIds.includes(a.id));

  const handleRemoveAgent = useCallback((agentId: string) => {
    setSelectedAgentIds(selectedAgentIds.filter((id) => id !== agentId));
  }, [selectedAgentIds, setSelectedAgentIds]);

  const handleAddAgentFromMention = useCallback((agentId: string) => {
    if (!selectedAgentIds.includes(agentId)) {
      setSelectedAgentIds([...selectedAgentIds, agentId]);
    }
  }, [selectedAgentIds, setSelectedAgentIds]);

  const handleVoiceStart = useCallback(() => {
    voiceInput.startRecording();
  }, [voiceInput]);

  const handleVoiceStop = useCallback(async () => {
    const transcription = await voiceInput.stopRecording();
    if (transcription) {
      sendMessage(transcription);
    }
  }, [voiceInput, sendMessage]);

  const handleSelectPreset = useCallback((preset: AgentPreset) => {
    if (preset.id === 'auto') {
      setSelectedAgentIds([]);
    } else if (preset.id === 'all') {
      setSelectedAgentIds(CHAT_AGENTS.map((a) => a.id));
    } else {
      setSelectedAgentIds(preset.agentIds);
    }
  }, [setSelectedAgentIds]);

  // Floating button when closed
  if (!isOpen) {
    return (
      <Button
        onClick={toggleChat}
        size="lg"
        className="fixed bottom-20 right-4 lg:bottom-6 lg:right-6 z-50 h-14 w-14 rounded-full shadow-lg bg-primary hover:bg-primary/90 transition-all duration-200 hover:scale-105"
      >
        <MessageSquare className="h-6 w-6" />
        {messages.length > 0 && (
          <Badge 
            variant="destructive" 
            className="absolute -top-1 -right-1 h-5 w-5 p-0 flex items-center justify-center text-xs"
          >
            {messages.length}
          </Badge>
        )}
      </Button>
    );
  }

  // Chat panel when open
  return (
    <>
      <Card
        className={cn(
          "fixed z-50 flex flex-col bg-background/95 backdrop-blur-xl border-border/50 shadow-2xl transition-all duration-300",
          isMaximized
            ? "inset-4 lg:inset-6"
            : "bottom-20 right-4 lg:bottom-6 lg:right-6 w-[calc(100vw-2rem)] lg:w-[420px] h-[500px] lg:h-[600px]"
        )}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-3 border-b border-border/50 bg-muted/30">
          <div className="flex items-center gap-2">
            <MessageSquare className="h-5 w-5 text-primary" />
            <span className="font-medium font-display">Chat</span>
            {pageContext && (
              <Badge variant="secondary" className="text-xs">
                {pageContext.pageName}
              </Badge>
            )}
            {status !== 'idle' && (
              <Badge variant="outline" className="text-xs animate-pulse">
                {status === 'thinking' ? 'Thinking...' : status === 'executing' ? 'Responding...' : status}
              </Badge>
            )}
          </div>
          <div className="flex items-center gap-1">
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8"
              onClick={clearMessages}
              title="Clear messages"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8"
              onClick={() => setIsMaximized(!isMaximized)}
            >
              {isMaximized ? (
                <Minimize2 className="h-4 w-4" />
              ) : (
                <Maximize2 className="h-4 w-4" />
              )}
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8"
              onClick={closeChat}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Messages */}
        <ScrollArea className="flex-1 p-3">
          {messages.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center px-4 py-8">
              <div className="text-4xl mb-3">💬</div>
              <h3 className="text-lg font-semibold font-display mb-1">Start a Conversation</h3>
              <p className="text-sm text-muted-foreground">
                {pageContext 
                  ? `Ask anything about ${pageContext.pageName}. I have full context.`
                  : 'Ask a question or assign a task to your AI agents.'
                }
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {messages.map((message) => (
                <ChatMessage key={message.id} message={message} />
              ))}
              
              {status === 'thinking' && (
                <ProcessingIndicator
                  agentName="Atlas"
                  agentAvatar="🧠"
                  task="Analyzing request..."
                />
              )}
              
              {status === 'executing' && (
                <TypingIndicator
                  agentName="Atlas"
                  agentAvatar="🧠"
                />
              )}
            </div>
          )}
        </ScrollArea>

        {pendingApproval && (
          <div className="px-3 pb-2">
            <ApprovalInline
              taskId={pendingApproval.id}
              taskDescription={pendingApproval.description}
              onApprove={() => approvePendingAction()}
              onReject={() => rejectPendingAction()}
            />
          </div>
        )}

        {/* Input */}
        <div className="p-3 border-t border-border/50">
          <ChatInputBar
            onSendMessage={sendMessage}
            onStartRecording={handleVoiceStart}
            onStopRecording={handleVoiceStop}
            isRecording={voiceInput.isRecording}
            isTranscribing={voiceInput.isTranscribing}
            transcriptionPreview={voiceInput.transcriptionPreview}
            selectedAgents={selectedAgents}
            onRemoveAgent={handleRemoveAgent}
            onAddAgentFromMention={handleAddAgentFromMention}
            compact
          />
        </div>
      </Card>

      <AgentSelectorModal
        open={agentSelectorOpen}
        onOpenChange={setAgentSelectorOpen}
        agents={CHAT_AGENTS}
        selectedAgentIds={selectedAgentIds}
        onSelectAgents={setSelectedAgentIds}
        onSelectPreset={handleSelectPreset}
      />
    </>
  );
});
