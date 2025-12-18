import { useEffect, useCallback } from 'react';
import { TabId } from '@/components/BottomNav';

interface UseKeyboardShortcutsProps {
  onNavigate: (tab: TabId) => void;
  onTogglePause?: () => void;
  onStop?: () => void;
  isAuthenticated?: boolean;
}

export function useKeyboardShortcuts({
  onNavigate,
  onTogglePause,
  onStop,
  isAuthenticated = true,
}: UseKeyboardShortcutsProps) {
  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    // Don't trigger shortcuts when typing in input fields
    const target = e.target as HTMLElement;
    if (
      target.tagName === 'INPUT' ||
      target.tagName === 'TEXTAREA' ||
      target.isContentEditable
    ) {
      return;
    }

    if (!isAuthenticated) return;

    // Navigation shortcuts (g + key for "go to")
    if (e.key === 'g' && !e.metaKey && !e.ctrlKey && !e.altKey) {
      // Wait for next key
      const handleNextKey = (nextE: KeyboardEvent) => {
        document.removeEventListener('keydown', handleNextKey);
        
        const shortcuts: Record<string, TabId> = {
          'h': 'home',
          'c': 'chat',
          'd': 'dashboard',
          't': 'tasks',
          'v': 'monitoring',
          'm': 'memory',
          'a': 'agents',
          's': 'settings',
        };

        if (shortcuts[nextE.key]) {
          nextE.preventDefault();
          onNavigate(shortcuts[nextE.key]);
        }
      };

      // Set a timeout to remove listener if no second key is pressed
      setTimeout(() => {
        document.removeEventListener('keydown', handleNextKey);
      }, 1000);

      document.addEventListener('keydown', handleNextKey);
      return;
    }

    // Direct shortcuts
    // Escape - go home
    if (e.key === 'Escape' && !e.metaKey && !e.ctrlKey) {
      onNavigate('home');
      return;
    }

    // Space - toggle pause (when not in input)
    if (e.key === ' ' && e.shiftKey && onTogglePause) {
      e.preventDefault();
      onTogglePause();
      return;
    }

    // Shift + S - stop all
    if (e.key === 'S' && e.shiftKey && !e.metaKey && !e.ctrlKey && onStop) {
      e.preventDefault();
      onStop();
      return;
    }

    // Number keys for quick navigation
    const numberShortcuts: Record<string, TabId> = {
      '1': 'home',
      '2': 'chat',
      '3': 'dashboard',
      '4': 'tasks',
      '5': 'monitoring',
      '6': 'memory',
      '7': 'agents',
      '8': 'settings',
    };

    if (e.altKey && numberShortcuts[e.key]) {
      e.preventDefault();
      onNavigate(numberShortcuts[e.key]);
      return;
    }
  }, [onNavigate, onTogglePause, onStop, isAuthenticated]);

  useEffect(() => {
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);
}

// Export shortcut definitions for help display
export const KEYBOARD_SHORTCUTS = [
  { keys: ['⌘', 'K'], description: 'Open command palette' },
  { keys: ['Esc'], description: 'Go to home' },
  { keys: ['Alt', '1-8'], description: 'Navigate to pages' },
  { keys: ['g', 'h'], description: 'Go to Home' },
  { keys: ['g', 'c'], description: 'Go to Chat' },
  { keys: ['g', 'd'], description: 'Go to Dashboard' },
  { keys: ['g', 't'], description: 'Go to Tasks' },
  { keys: ['g', 'v'], description: 'Go to Vision' },
  { keys: ['g', 'm'], description: 'Go to Memory' },
  { keys: ['g', 'a'], description: 'Go to Agents' },
  { keys: ['g', 's'], description: 'Go to Settings' },
  { keys: ['Shift', 'Space'], description: 'Toggle pause' },
  { keys: ['Shift', 'S'], description: 'Stop all agents' },
];
