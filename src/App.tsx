import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { NotificationProvider } from "@/hooks/useNotifications";
import { NotificationPreferencesProvider } from "@/hooks/useNotificationPreferences";
import { ActivityLogProvider } from "@/hooks/useActivityLog";
import { FavoritesProvider } from "@/hooks/useFavorites";
import { ThemeProvider } from "@/hooks/useTheme";
import { DashboardCustomizationProvider } from "@/hooks/useDashboardCustomization";
import Index from "./pages/Index";
import { ChatPage } from "./pages/ChatPage";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <ThemeProvider>
      <NotificationPreferencesProvider>
        <NotificationProvider>
          <ActivityLogProvider>
            <FavoritesProvider>
              <DashboardCustomizationProvider>
                <TooltipProvider>
                  <Toaster />
                  <Sonner />
                  <BrowserRouter>
                    <Routes>
                      <Route path="/" element={<Index />} />
                      <Route path="/chat" element={<ChatPage />} />
                      {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
                      <Route path="*" element={<NotFound />} />
                    </Routes>
                  </BrowserRouter>
                </TooltipProvider>
              </DashboardCustomizationProvider>
            </FavoritesProvider>
          </ActivityLogProvider>
        </NotificationProvider>
      </NotificationPreferencesProvider>
    </ThemeProvider>
  </QueryClientProvider>
);

export default App;
