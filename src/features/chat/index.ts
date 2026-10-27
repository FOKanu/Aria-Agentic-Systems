/**
 * Chat Feature Module
 * 
 * AI chat interface with messaging, voice input, and streaming responses.
 */

// Components
export * from './components';

// Hooks
export * from './hooks';

// Pages
export * from './pages';

// Types - explicitly re-export to avoid conflicts
export type { ChatAgent, ChatStatus, AgentPreset } from './types';
export { CHAT_AGENTS, AGENT_PRESETS } from './types';
// Note: ChatMessage type conflicts with component - use ChatMessageType alias when needed
