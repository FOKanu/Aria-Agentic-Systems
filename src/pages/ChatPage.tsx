// Developed by Francis Okorie Iyeke-Kanu
import { useState, useCallback, useMemo, useRef } from 'react';
import { ChatHeader } from '@/components/chat/ChatHeader';
import { ConversationStream } from '@/components/chat/ConversationStream';
import { ChatInputBar } from '@/components/chat/ChatInputBar';
import { AgentSelectorModal } from '@/components/chat/AgentSelectorModal';
import { QuickActions } from '@/components/chat/QuickActions';
import { ApprovalInline } from '@/components/chat/ApprovalInline';
import { ChatMessage, ChatStatus, ChatAttachment, AgentPreset, CHAT_AGENTS } from '@/types/chat';
import { useVoiceInput } from '@/hooks/useVoiceInput';
import { useTextToSpeech } from '@/hooks/useTextToSpeech';
import { useToast } from '@/hooks/use-toast';
import {
  runAgentChatTurn,
  resolveAgentRoleId,
  type AgentChatTurnMessage,
} from '@/agent-engine/services/agentChatRunner';
import { getRoutingDisplayInfo } from '@/agent-engine/hooks/useAIChat';
import type { RoutingDecision } from '@/agent-engine/types';

export function ChatPage() {
  const [status, setStatus] = useState<ChatStatus>('idle');
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [selectedAgentIds, setSelectedAgentIds] = useState<string[]>([]);
  const [agentSelectorOpen, setAgentSelectorOpen] = useState(false);
  const [pendingApproval, setPendingApproval] = useState<{ id: string; description: string } | null>(null);
  const [lastRouting, setLastRouting] = useState<RoutingDecision | null>(null);
  const abortRef = useRef<AbortController | null>(null);
  const approvalResolverRef = useRef<((approved: boolean) => void) | null>(null);

  const { toast } = useToast();
  const voiceInput = useVoiceInput();
  const tts = useTextToSpeech();

  const selectedAgents = CHAT_AGENTS.filter((a) => selectedAgentIds.includes(a.id));
  const primaryAgent =
    selectedAgents[0] ||
    CHAT_AGENTS.find((a) => a.id === 'atlas') ||
    CHAT_AGENTS[0];

  const routingInfo = useMemo(() => getRoutingDisplayInfo(lastRouting), [lastRouting]);

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

  const updateStreamingAgentMessage = useCallback((content: string, agent = primaryAgent) => {
    setMessages((prev) => {
      const last = prev[prev.length - 1];
      if (last?.sender === 'agent' && last.isStreaming) {
        return prev.map((m, i) =>
          i === prev.length - 1 ? { ...m, content } : m
        );
      }
      return [
        ...prev,
        {
          id: `msg-${Date.now()}-stream`,
          content,
          sender: 'agent' as const,
          type: 'text' as const,
          timestamp: new Date(),
          agentId: agent.id,
          agentName: agent.name,
          agentRole: agent.role,
          agentAvatar: agent.avatar,
          isStreaming: true,
          confidence: 0.95,
        },
      ];
    });
  }, [primaryAgent]);

  const handleSendMessage = useCallback(async (
    content: string,
    attachments?: ChatAttachment[],
    mentionedAgentIds?: string[]
  ) => {
    if (mentionedAgentIds && mentionedAgentIds.length > 0) {
      setSelectedAgentIds((prev) => {
        const newIds = mentionedAgentIds.filter((id) => !prev.includes(id));
        return [...prev, ...newIds];
      });
    }

    const respondingAgent =
      (mentionedAgentIds?.[0] && CHAT_AGENTS.find((a) => a.id === mentionedAgentIds[0])) ||
      selectedAgents[0] ||
      CHAT_AGENTS.find((a) => a.id === 'atlas') ||
      CHAT_AGENTS[0];

    addMessage({
      content,
      sender: 'user',
      type: 'text',
      attachments,
    });

    setStatus('thinking');

    const history: AgentChatTurnMessage[] = messages
      .filter((m) => m.type === 'text' && (m.sender === 'user' || m.sender === 'agent'))
      .map((m) => ({
        role: m.sender === 'user' ? ('user' as const) : ('assistant' as const),
        content: m.content,
      }));

    abortRef.current?.abort();
    abortRef.current = new AbortController();

    try {
      const result = await runAgentChatTurn({
        content,
        history,
        agentRole: resolveAgentRoleId(respondingAgent.id),
        agentId: respondingAgent.id,
        preferLocal: true,
        enableTools: true,
        signal: abortRef.current.signal,
        onRouting: (routing) => setLastRouting(routing),
        onStatus: (message) => {
          // Only surface actionable / pairing notices in the transcript
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
            const summary = event.error
              ? `Tool ${event.name} failed: ${event.error}`
              : `Tool ${event.name} completed`;
            addMessage({
              content: summary,
              sender: 'system',
              type: 'status',
              structuredData: { status: event.error ? 'error' : 'completed' },
            });
          }
        },
        onDelta: (_delta, full) => {
          setStatus('executing');
          updateStreamingAgentMessage(full, respondingAgent);
        },
        onApprovalRequired: (req) =>
          new Promise<boolean>((resolve) => {
            // Reject any prior pending approval to avoid deadlocks
            approvalResolverRef.current?.(false);
            approvalResolverRef.current = resolve;
            setStatus('executing');
            setPendingApproval({
              id: req.id,
              description: req.description,
            });
            addMessage({
              content: `Waiting for approval: ${req.description}`,
              sender: 'system',
              type: 'status',
              structuredData: { status: 'waiting' },
            });
          }),
      });

      if (result.content) {
        setMessages((prev) => {
          const last = prev[prev.length - 1];
          if (last?.sender === 'agent' && last.isStreaming) {
            return prev.map((m, i) =>
              i === prev.length - 1
                ? { ...m, content: result.content, isStreaming: false }
                : m
            );
          }
          return [
            ...prev,
            {
              id: `msg-${Date.now()}-assistant`,
              content: result.content,
              sender: 'agent' as const,
              type: 'text' as const,
              timestamp: new Date(),
              agentId: respondingAgent.id,
              agentName: respondingAgent.name,
              agentRole: respondingAgent.role,
              agentAvatar: respondingAgent.avatar,
              confidence: 0.95,
            },
          ];
        });
      } else {
        addMessage({
          content: '(Empty response)',
          sender: 'agent',
          type: 'text',
          agentId: respondingAgent.id,
          agentName: respondingAgent.name,
          agentRole: respondingAgent.role,
          agentAvatar: respondingAgent.avatar,
        });
      }

      if (tts.enabled && result.content) {
        tts.speak(result.content);
      }
    } catch (error) {
      if ((error as Error).name === 'AbortError') return;

      console.error('AI Error:', error);
      toast({
        title: 'AI Error',
        description: error instanceof Error ? error.message : 'Failed to get agent response.',
        variant: 'destructive',
      });

      addMessage({
        content: 'I could not complete that turn. Check the Ollama tunnel or cloud connection.',
        sender: 'system',
        type: 'status',
        structuredData: { status: 'error' },
      });
    } finally {
      setStatus('idle');
    }
  }, [
    addMessage,
    messages,
    selectedAgents,
    tts,
    toast,
    updateStreamingAgentMessage,
  ]);

  const handleAddAgentFromMention = useCallback((agentId: string) => {
    setSelectedAgentIds((prev) => {
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

  const handleReject = useCallback((taskId: string) => {
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
        routingLabel={
          routingInfo.model
            ? `${routingInfo.provider} · ${routingInfo.model}`
            : undefined
        }
        primaryAgentName={primaryAgent.name}
      />

      <div className="flex-1 pt-14 pb-48 lg:pb-36 overflow-hidden">
        <ConversationStream messages={messages} />

        {pendingApproval && (
          <ApprovalInline
            taskId={pendingApproval.id}
            taskDescription={pendingApproval.description}
            onApprove={handleApprove}
            onReject={handleReject}
          />
        )}
      </div>

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
