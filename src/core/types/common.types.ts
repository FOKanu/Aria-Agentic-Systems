/**
 * Common Types - Shared interfaces used across modules
 */

// Navigation types
export type ViewMode = 'main' | 'details' | 'profile';

export type TabId = 
  | 'home'
  | 'chat'
  | 'dashboard'
  | 'tasks'
  | 'monitoring'
  | 'memory'
  | 'settings'
  | 'agents'
  | 'analytics'
  | 'files'
  | 'calendar'
  | 'contacts'
  | 'email'
  | 'workflows'
  | 'phone'
  | 'reservations'
  | 'invoices'
  | 'expenses'
  | 'budget'
  | 'reports'
  | 'payments'
  | 'tax'
  | 'documents'
  | 'devops-pipelines'
  | 'devops-code-review'
  | 'devops-deployment'
  | 'devops-infrastructure'
  | 'devops-security'
  | 'devops-logs'
  | 'legal'
  | 'contracts'
  | 'review'
  | 'compliance'
  | 'nda'
  | 'ip'
  | 'research'
  | 'social'
  | 'social-scheduling'
  | 'social-posts'
  | 'social-analytics'
  | 'social-community'
  | 'social-outreach'
  | 'social-trends';

// User types
export interface User {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  role?: string;
  createdAt: Date;
}

// Fleet status
export interface FleetStatus {
  status: 'optimal' | 'degraded' | 'critical';
  message: string;
}

// Page context for chat
export interface PageContext {
  pageId: string;
  pageName: string;
  pageCategory?: string;
  availableActions?: string[];
  relevantData?: Record<string, unknown>;
}

// Notification types
export interface Notification {
  id: string;
  type: 'info' | 'success' | 'warning' | 'error';
  title: string;
  message: string;
  timestamp: Date;
  read: boolean;
  actionUrl?: string;
}
