/**
 * Main Application Entry Point
 * Created by Francis Okorie Iyeke-Kanu
 */
import { AppProviders } from '@/shell';
import { AppRoutes } from '@/shell';

const App = () => (
  <AppProviders>
    <AppRoutes />
  </AppProviders>
);

export default App;
