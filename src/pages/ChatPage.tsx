import { useState, useCallback } from 'react';
import { ChatHeader } from '@/components/chat/ChatHeader';
import { ConversationStream } from '@/components/chat/ConversationStream';
import { ChatInputBar } from '@/components/chat/ChatInputBar';
import { AgentSelectorModal } from '@/components/chat/AgentSelectorModal';
import { QuickActions } from '@/components/chat/QuickActions';
import { ApprovalInline } from '@/components/chat/ApprovalInline';
import { ChatMessage, ChatStatus, ChatAgent, ChatAttachment, AgentPreset, CHAT_AGENTS } from '@/types/chat';
import { useVoiceInput } from '@/hooks/useVoiceInput';
import { useTextToSpeech } from '@/hooks/useTextToSpeech';
import { useToast } from '@/hooks/use-toast';

export function ChatPage() {
  const [status, setStatus] = useState<ChatStatus>('idle');
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [selectedAgentIds, setSelectedAgentIds] = useState<string[]>([]);
  const [agentSelectorOpen, setAgentSelectorOpen] = useState(false);
  const [pendingApproval, setPendingApproval] = useState<{ id: string; description: string } | null>(null);

  const { toast } = useToast();
  const voiceInput = useVoiceInput();
  const tts = useTextToSpeech();

  const selectedAgents = CHAT_AGENTS.filter((a) => selectedAgentIds.includes(a.id));

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

  const simulateAgentResponse = useCallback(async (userMessage: string, attachments?: ChatAttachment[]) => {
    setStatus('thinking');

    // System message showing task delegation
    const attachmentText = attachments && attachments.length > 0 
      ? ` with ${attachments.length} file(s)` 
      : '';
    
    if (selectedAgentIds.length > 1) {
      addMessage({
        content: `Task delegated to ${selectedAgentIds.length} agents${attachmentText}`,
        sender: 'system',
        type: 'status',
        structuredData: { status: 'started' },
      });
    } else if (attachments && attachments.length > 0) {
      addMessage({
        content: `Processing ${attachments.length} attached file(s)...`,
        sender: 'system',
        type: 'status',
        structuredData: { status: 'started' },
      });
    }

    // Simulate thinking delay
    await new Promise((r) => setTimeout(r, 1500));

    setStatus('executing');

    // Pick a random agent to respond (or the planner if auto)
    const respondingAgent =
      selectedAgentIds.length === 0
        ? CHAT_AGENTS.find((a) => a.role === 'planner')!
        : CHAT_AGENTS.find((a) => selectedAgentIds.includes(a.id)) || CHAT_AGENTS[0];

    // Simulate agent response
    const responses = [
      `I've analyzed your request. Here's what I found:`,
      `Based on my analysis, I can help you with that.`,
      `I'm processing your request now.`,
      `Let me break this down for you.`,
    ];

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

    // Speak the response if TTS is enabled
    if (tts.enabled) {
      tts.speak(response);
    }

    // Randomly trigger approval request
    if (Math.random() > 0.7) {
      setPendingApproval({
        id: `approval-${Date.now()}`,
        description: 'Agent wants to execute a system command. Do you approve?',
      });
    }

    setStatus('idle');
  }, [selectedAgentIds, addMessage, tts]);

  const handleSendMessage = useCallback(async (content: string, attachments?: ChatAttachment[], mentionedAgentIds?: string[]) => {
    // If agents were @mentioned, add them to selected agents
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

    await simulateAgentResponse(content, attachments);
  }, [addMessage, simulateAgentResponse]);

  const handleAddAgentFromMention = useCallback((agentId: string) => {
    setSelectedAgentIds(prev => {
      if (prev.includes(agentId)) return prev;
      return [...prev, agentId];
    });
  }, []);

  const handleVoiceStart = useCallback(() => {
    voiceInput.startRecording();
    setStatus('listening');
  }, [voiceInput]);

  const handleVoiceStop = useCallback(async () => {
    const transcription = await voiceInput.stopRecording();
    setStatus('idle');

    if (transcription) {
      handleSendMessage(transcription);
    }
  }, [voiceInput, handleSendMessage]);

  const handleQuickAction = useCallback((action: string) => {
    switch (action) {
      case 'task':
        toast({ title: 'Task Mode', description: 'Next message will be assigned as a task.' });
        break;
      case 'followup':
        handleSendMessage('Can you elaborate on that?');
        break;
      case 'summary':
        handleSendMessage('Please summarize the conversation so far.');
        break;
      case 'voice':
        voiceInput.startRecording();
        setStatus('listening');
        break;
    }
  }, [toast, handleSendMessage, voiceInput]);

  const handleApprove = useCallback((taskId: string) => {
    setPendingApproval(null);
    addMessage({
      content: 'Action approved. Executing...',
      sender: 'system',
      type: 'status',
      structuredData: { status: 'completed' },
    });
    toast({ title: 'Approved', description: 'The action has been approved.' });
  }, [addMessage, toast]);

  const handleReject = useCallback((taskId: string) => {
    setPendingApproval(null);
    addMessage({
      content: 'Action rejected by user.',
      sender: 'system',
      type: 'status',
      structuredData: { status: 'error' },
    });
    toast({ title: 'Rejected', description: 'The action has been rejected.', variant: 'destructive' });
  }, [addMessage, toast]);

  const handleSelectPreset = useCallback((preset: AgentPreset) => {
    if (preset.id === 'auto') {
      setSelectedAgentIds([]);
    } else if (preset.id === 'all') {
      setSelectedAgentIds(CHAT_AGENTS.map((a) => a.id));
    } else {
      setSelectedAgentIds(preset.agentIds);
    }
  }, []);

  const handleRemoveAgent = useCallback((agentId: string) => {
    setSelectedAgentIds((prev) => prev.filter((id) => id !== agentId));
  }, []);

  return (
    <div className="flex flex-col h-screen bg-background">
      <ChatHeader
        status={status}
        selectedAgentCount={selectedAgentIds.length || CHAT_AGENTS.length}
        audioEnabled={tts.enabled}
        onToggleAudio={() => tts.setEnabled(!tts.enabled)}
        onOpenAgentSelector={() => setAgentSelectorOpen(true)}
      />

      <div className="flex-1 pt-14 pb-48 lg:pb-36 overflow-hidden">
        <ConversationStream messages={messages} />

        {/* Inline Approval */}
        {pendingApproval && (
          <ApprovalInline
            taskId={pendingApproval.id}
            taskDescription={pendingApproval.description}
            onApprove={handleApprove}
            onReject={handleReject}
          />
        )}
      </div>

      {/* Quick Actions */}
      <div className="fixed bottom-[180px] lg:bottom-[140px] left-0 right-0 lg:left-20 px-4">
        <div className="max-w-4xl mx-auto">
          <QuickActions onAction={handleQuickAction} hasActiveTask={messages.length > 0} />
        </div>
      </div>

      <ChatInputBar
        onSendMessage={handleSendMessage}
        onStartRecording={handleVoiceStart}
        onStopRecording={handleVoiceStop}
        isRecording={voiceInput.isRecording}
        isTranscribing={voiceInput.isTranscribing}
        transcriptionPreview={voiceInput.transcriptionPreview}
        selectedAgents={selectedAgents}
        onRemoveAgent={handleRemoveAgent}
        onAddAgentFromMention={handleAddAgentFromMention}
      />

      <AgentSelectorModal
        open={agentSelectorOpen}
        onOpenChange={setAgentSelectorOpen}
        agents={CHAT_AGENTS}
        selectedAgentIds={selectedAgentIds}
        onSelectAgents={setSelectedAgentIds}
        onSelectPreset={handleSelectPreset}
      />
    </div>
  );
}
