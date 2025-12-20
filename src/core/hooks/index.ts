/**
 * Core Hooks - Shared hooks used across the application
 */

// Toast notifications
export { useToast, toast } from '@/hooks/use-toast';

// Authentication
export { useAuth, AuthProvider } from '@/hooks/useAuth';

// Mobile detection
export { useIsMobile } from '@/hooks/use-mobile';

// Theme
export { useTheme, ThemeProvider } from '@/hooks/useTheme';

// Keyboard shortcuts
export { useKeyboardShortcuts } from '@/hooks/useKeyboardShortcuts';
