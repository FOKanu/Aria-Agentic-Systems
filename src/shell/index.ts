/**
 * Shell Module - App chrome and navigation
 * 
 * Contains the app providers, routing, and layout components.
 */

// Providers
export { AppProviders } from './providers/AppProviders';

// Routes
export { AppRoutes } from './routes/AppRoutes';
export { LoadingFallback } from './routes/LoadingFallback';
export { LazyPages, PAGE_CONTEXT_MAP } from './routes/routes.config';
export type { RouteConfig } from './routes/routes.config';
