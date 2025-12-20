/**
 * App Providers - Wraps all context providers
 */
import { ReactNode } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { BrowserRouter } from 'react-router-dom';
import { ThemeProvider } from '@/hooks/useTheme';
import { AuthProvider } from '@/hooks/useAuth';
import { NotificationProvider } from '@/hooks/useNotifications';
import { NotificationPreferencesProvider } from '@/hooks/useNotificationPreferences';
import { FavoritesProvider } from '@/hooks/useFavorites';
import { DashboardCustomizationProvider } from '@/hooks/useDashboardCustomization';
import { ActivityLogProvider } from '@/hooks/useActivityLog';
import { ChatProvider } from '@/hooks/useChatContext';
import { TooltipProvider } from '@/components/ui/tooltip';
import { Toaster } from '@/components/ui/toaster';
import { Toaster as Sonner } from '@/components/ui/sonner';

const queryClient = new QueryClient();

interface AppProvidersProps {
  children: ReactNode;
}

export function AppProviders({ children }: AppProvidersProps) {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <AuthProvider>
          <NotificationProvider>
            <NotificationPreferencesProvider>
              <FavoritesProvider>
                <DashboardCustomizationProvider>
                  <ActivityLogProvider>
                    <ChatProvider>
                      <TooltipProvider>
                        <BrowserRouter>
                          {children}
                          <Toaster />
                          <Sonner />
                        </BrowserRouter>
                      </TooltipProvider>
                    </ChatProvider>
                  </ActivityLogProvider>
                </DashboardCustomizationProvider>
              </FavoritesProvider>
            </NotificationPreferencesProvider>
          </NotificationProvider>
        </AuthProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}
