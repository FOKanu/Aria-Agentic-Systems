/**
 * Chat Feature Module
 * 
 * AI chat interface with messaging, voice input, and streaming responses.
 */

// Components
export { FloatingChatPanel } from '@/components/chat/FloatingChatPanel';
export { FloatingVoiceButton } from '@/components/chat/FloatingVoiceButton';
export { ChatHeader } from '@/components/chat/ChatHeader';
export { ChatInputBar } from '@/components/chat/ChatInputBar';
export { ChatMessage } from '@/components/chat/ChatMessage';
export { ConversationStream } from '@/components/chat/ConversationStream';
export { TypingIndicator } from '@/components/chat/TypingIndicator';
export { AgentMentionPopover } from '@/components/chat/AgentMentionPopover';
export { AgentSelectorModal } from '@/components/chat/AgentSelectorModal';
export { ApprovalInline } from '@/components/chat/ApprovalInline';
export { MessageTemplates } from '@/components/chat/MessageTemplates';
export { QuickActions } from '@/components/chat/QuickActions';

// Hooks
export { useChatContext, ChatProvider } from '@/hooks/useChatContext';
export { useVoiceInput } from '@/hooks/useVoiceInput';
export { useTextToSpeech } from '@/hooks/useTextToSpeech';
export { useAgentMention } from '@/hooks/useAgentMention';

// Pages
export { ChatPage } from '@/pages/ChatPage';

// Types
export type { ChatMessage as ChatMessageType, ChatAgent, ChatStatus, AgentPreset } from '@/types/chat';
export { CHAT_AGENTS, AGENT_PRESETS } from '@/types/chat';
