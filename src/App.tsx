/**
 * Main Application Entry Point
 * Created by Francis Okorie Iyeke-Kanu
 */
import { AppProviders } from '@/shell';
import { AppRoutes } from '@/shell';
import { TerminalOutput } from '@/components/ui/TerminalOutput';

const App = () => (
  <AppProviders>
    <AppRoutes />
    <TerminalOutput />
  </AppProviders>
);

export default App;
