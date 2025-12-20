/**
 * Dashboard Feature Module
 * 
 * Home dashboard, analytics, status cards, and activity feeds.
 */

// Components
export { StatusCard } from '@/components/StatusCard';
export { StatusBar } from '@/components/StatusBar';
export { RadialStat } from '@/components/RadialStat';
export { XPBar } from '@/components/XPBar';
export { EventsFeed } from '@/components/EventsFeed';
export { QuestTimeline } from '@/components/QuestTimeline';
export { ActivityLog } from '@/components/ActivityLog';
export { DashboardCustomizer } from '@/components/DashboardCustomizer';

// Pages
export { DashboardPage } from '@/pages/DashboardPage';
export { AnalyticsPage } from '@/pages/AnalyticsPage';
export { MonitoringPage } from '@/pages/MonitoringPage';

// Hooks
export { useDashboardCustomization, DashboardCustomizationProvider } from '@/hooks/useDashboardCustomization';
export { useActivityLog } from '@/hooks/useActivityLog';
