// Agent Hand-off Helper - Francis Okorie Iyeke-Kanu
// Lightweight bridge between capability pages and Chat until pages can push
// a real prefilled draft into the chat/agent-engine pipeline.
import { toast } from 'sonner';

/**
 * Notify the operator that a task has been handed to an agent.
 * For now this surfaces a toast; once ChatPage supports an initial
 * draft message this can navigate to /chat with the intent prefilled.
 */
export function askAgent(agentName: string, intent: string) {
  toast.success(`Asked ${agentName}`, {
    description: intent,
  });
}
