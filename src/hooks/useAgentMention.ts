import { useState, useCallback, useMemo } from 'react';
import { CHAT_AGENTS, ChatAgent } from '@/types/chat';

interface MentionState {
  isActive: boolean;
  query: string;
  startIndex: number;
  suggestions: ChatAgent[];
}

export interface MentionedAgent {
  id: string;
  name: string;
  title: string;
}

export function useAgentMention() {
  const [mentionState, setMentionState] = useState<MentionState>({
    isActive: false,
    query: '',
    startIndex: -1,
    suggestions: [],
  });

  // Get filtered suggestions based on query
  const getSuggestions = useCallback((query: string): ChatAgent[] => {
    const lowerQuery = query.toLowerCase();
    return CHAT_AGENTS.filter(
      (agent) =>
        agent.name.toLowerCase().includes(lowerQuery) ||
        agent.title.toLowerCase().includes(lowerQuery)
    ).slice(0, 5);
  }, []);

  // Handle input change to detect @ mentions
  const handleInputChange = useCallback(
    (value: string, cursorPosition: number) => {
      // Find the @ symbol before cursor
      const textBeforeCursor = value.slice(0, cursorPosition);
      const lastAtIndex = textBeforeCursor.lastIndexOf('@');

      if (lastAtIndex === -1) {
        setMentionState({ isActive: false, query: '', startIndex: -1, suggestions: [] });
        return;
      }

      // Check if @ is at start or preceded by whitespace
      const charBeforeAt = lastAtIndex > 0 ? value[lastAtIndex - 1] : ' ';
      if (charBeforeAt !== ' ' && charBeforeAt !== '\n' && lastAtIndex !== 0) {
        setMentionState({ isActive: false, query: '', startIndex: -1, suggestions: [] });
        return;
      }

      // Get the query after @
      const query = textBeforeCursor.slice(lastAtIndex + 1);
      
      // Check if query contains space (mention completed)
      if (query.includes(' ')) {
        setMentionState({ isActive: false, query: '', startIndex: -1, suggestions: [] });
        return;
      }

      const suggestions = getSuggestions(query);
      
      setMentionState({
        isActive: true,
        query,
        startIndex: lastAtIndex,
        suggestions,
      });
    },
    [getSuggestions]
  );

  // Insert selected agent mention
  const insertMention = useCallback(
    (agent: ChatAgent, currentValue: string): string => {
      if (!mentionState.isActive) return currentValue;

      const before = currentValue.slice(0, mentionState.startIndex);
      const after = currentValue.slice(mentionState.startIndex + mentionState.query.length + 1);
      
      const newValue = `${before}@${agent.name} ${after}`;
      
      setMentionState({ isActive: false, query: '', startIndex: -1, suggestions: [] });
      
      return newValue;
    },
    [mentionState]
  );

  // Parse mentioned agents from a message
  const parseMentions = useCallback((message: string): MentionedAgent[] => {
    const mentionRegex = /@(\w+)/g;
    const mentions: MentionedAgent[] = [];
    let match;

    while ((match = mentionRegex.exec(message)) !== null) {
      const name = match[1];
      const agent = CHAT_AGENTS.find(
        (a) => a.name.toLowerCase() === name.toLowerCase()
      );
      if (agent && !mentions.find((m) => m.id === agent.id)) {
        mentions.push({
          id: agent.id,
          name: agent.name,
          title: agent.title,
        });
      }
    }

    return mentions;
  }, []);

  // Close mention popup
  const closeMention = useCallback(() => {
    setMentionState({ isActive: false, query: '', startIndex: -1, suggestions: [] });
  }, []);

  return {
    mentionState,
    handleInputChange,
    insertMention,
    parseMentions,
    closeMention,
  };
}
