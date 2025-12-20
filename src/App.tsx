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
import { AuthProvider } from "@/hooks/useAuth";
import Index from "./pages/Index";
import { ChatPage } from "./pages/ChatPage";
import { LoginPage } from "./pages/LoginPage";
import { SignupPage } from "./pages/SignupPage";
import { ForgotPasswordPage } from "./pages/ForgotPasswordPage";
import { CalendarPage } from "./pages/CalendarPage";
import { ContactsPage } from "./pages/ContactsPage";
import { EmailPage } from "./pages/EmailPage";
import { WorkflowsPage } from "./pages/WorkflowsPage";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <ThemeProvider>
      <AuthProvider>
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
                        <Route path="/login" element={<LoginPage />} />
                        <Route path="/signup" element={<SignupPage />} />
                        <Route path="/forgot-password" element={<ForgotPasswordPage />} />
                        <Route path="/calendar" element={<CalendarPage />} />
                        <Route path="/contacts" element={<ContactsPage />} />
                        <Route path="/email" element={<EmailPage />} />
                        <Route path="/workflows" element={<WorkflowsPage />} />
                        <Route path="*" element={<NotFound />} />
                      </Routes>
                    </BrowserRouter>
                  </TooltipProvider>
                </DashboardCustomizationProvider>
              </FavoritesProvider>
            </ActivityLogProvider>
          </NotificationProvider>
        </NotificationPreferencesProvider>
      </AuthProvider>
    </ThemeProvider>
  </QueryClientProvider>
);

export default App;
