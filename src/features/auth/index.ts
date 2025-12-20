/**
 * Auth Feature Module
 * 
 * Authentication, user management, and profile settings.
 */

// Pages
export { AuthPage } from '@/pages/AuthPage';
export { LoginPage } from '@/pages/LoginPage';
export { SignupPage } from '@/pages/SignupPage';
export { ForgotPasswordPage } from '@/pages/ForgotPasswordPage';
export { ProfilePage } from '@/pages/ProfilePage';
export { SettingsPage } from '@/pages/SettingsPage';

// Components
export { UserMenu } from '@/components/UserMenu';

// Hooks
export { useAuth, AuthProvider } from '@/hooks/useAuth';
