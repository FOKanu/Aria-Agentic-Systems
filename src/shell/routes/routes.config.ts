/**
 * Route Configuration - Centralized route definitions
 * Uses lazy imports from feature modules
 */
import { lazy } from 'react';
import type { TabId } from '@/core/types';

export interface RouteConfig {
  path: string;
  tabId: TabId;
  label: string;
  category: string;
}

// Lazy-loaded page components from feature modules
export const LazyPages = {
  // Main pages (Index is the main app shell)
  Index: lazy(() => import('@/pages/Index')),
  
  // Chat feature
  Chat: lazy(() => import('@/pages/ChatPage').then(m => ({ default: m.ChatPage }))),
  
  // Auth feature
  Auth: lazy(() => import('@/pages/AuthPage').then(m => ({ default: m.AuthPage }))),
  Login: lazy(() => import('@/pages/LoginPage').then(m => ({ default: m.LoginPage }))),
  Signup: lazy(() => import('@/pages/SignupPage').then(m => ({ default: m.SignupPage }))),
  ForgotPassword: lazy(() => import('@/pages/ForgotPasswordPage').then(m => ({ default: m.ForgotPasswordPage }))),
  
  // Calendar feature
  Calendar: lazy(() => import('@/pages/CalendarPage').then(m => ({ default: m.CalendarPage }))),
  
  // Contacts feature
  Contacts: lazy(() => import('@/pages/ContactsPage').then(m => ({ default: m.ContactsPage }))),
  Email: lazy(() => import('@/pages/EmailPage').then(m => ({ default: m.EmailPage }))),
  Phone: lazy(() => import('@/pages/PhonePage').then(m => ({ default: m.PhonePage }))),
  
  // Tasks feature
  Workflows: lazy(() => import('@/pages/WorkflowsPage').then(m => ({ default: m.WorkflowsPage }))),
  Reservations: lazy(() => import('@/pages/ReservationsPage').then(m => ({ default: m.ReservationsPage }))),
  Tasks: lazy(() => import('@/pages/TasksPage').then(m => ({ default: m.TasksPage }))),
  
  // Finance feature
  Invoices: lazy(() => import('@/pages/InvoicesPage').then(m => ({ default: m.InvoicesPage }))),
  Expenses: lazy(() => import('@/pages/ExpensesPage').then(m => ({ default: m.ExpensesPage }))),
  Budget: lazy(() => import('@/pages/BudgetPage').then(m => ({ default: m.BudgetPage }))),
  FinancialReports: lazy(() => import('@/pages/FinancialReportsPage').then(m => ({ default: m.FinancialReportsPage }))),
  Payments: lazy(() => import('@/pages/PaymentsPage').then(m => ({ default: m.PaymentsPage }))),
  Tax: lazy(() => import('@/pages/TaxPage').then(m => ({ default: m.TaxPage }))),
  
  // DevOps feature
  CICDPipelines: lazy(() => import('@/pages/devops/CICDPipelinesPage')),
  CodeReview: lazy(() => import('@/pages/devops/CodeReviewPage')),
  Deployment: lazy(() => import('@/pages/devops/DeploymentPage')),
  Infrastructure: lazy(() => import('@/pages/devops/InfrastructurePage')),
  SecurityScanning: lazy(() => import('@/pages/devops/SecurityScanningPage')),
  LogAnalysis: lazy(() => import('@/pages/devops/LogAnalysisPage')),
  
  // Legal feature
  LegalOverview: lazy(() => import('@/pages/legal/LegalOverviewPage')),
  Contracts: lazy(() => import('@/pages/legal/ContractsPage')),
  DocumentReview: lazy(() => import('@/pages/legal/DocumentReviewPage')),
  Compliance: lazy(() => import('@/pages/legal/CompliancePage')),
  NDAGenerator: lazy(() => import('@/pages/legal/NDAGeneratorPage')),
  IPManagement: lazy(() => import('@/pages/legal/IPManagementPage')),
  CaseResearch: lazy(() => import('@/pages/legal/CaseResearchPage')),

  // Social Media feature
  SocialOverview: lazy(() => import('@/pages/social/SocialOverviewPage')),
  SocialScheduling: lazy(() => import('@/pages/social/ContentSchedulingPage')),
  SocialPosts: lazy(() => import('@/pages/social/PostGenerationPage')),
  SocialAnalytics: lazy(() => import('@/pages/social/AnalyticsDashboardPage')),
  SocialCommunity: lazy(() => import('@/pages/social/CommunityManagementPage')),
  SocialOutreach: lazy(() => import('@/pages/social/InfluencerOutreachPage')),
  SocialTrends: lazy(() => import('@/pages/social/TrendMonitoringPage')),

  // Admin feature
  JobApplications: lazy(() => import('@/pages/admin/JobApplicationsPage')),
  
  // Monitoring feature
  ActivityStream: lazy(() => import('@/pages/monitoring/ActivityStreamPage').then(m => ({ default: m.ActivityStreamPage }))),
  AlertsControls: lazy(() => import('@/pages/monitoring/AlertsControlsPage').then(m => ({ default: m.AlertsControlsPage }))),
  ExecutionTrace: lazy(() => import('@/pages/monitoring/ExecutionTracePage').then(m => ({ default: m.ExecutionTracePage }))),
  ToolMonitor: lazy(() => import('@/pages/monitoring/ToolMonitorPage').then(m => ({ default: m.ToolMonitorPage }))),
  
  // 404
  NotFound: lazy(() => import('@/pages/NotFound')),
};

// Page context mapping for chat
export const PAGE_CONTEXT_MAP: Record<string, { name: string; category?: string }> = {
  'home': { name: 'Home', category: 'general' },
  'dashboard': { name: 'Dashboard', category: 'general' },
  'tasks': { name: 'Tasks', category: 'productivity' },
  'monitoring': { name: 'Monitoring', category: 'system' },
  'memory': { name: 'Memory', category: 'system' },
  'settings': { name: 'Settings', category: 'system' },
  'agents': { name: 'Agents', category: 'system' },
  'analytics': { name: 'Analytics', category: 'data' },
  'files': { name: 'Files', category: 'productivity' },
  'calendar': { name: 'Calendar', category: 'productivity' },
  'contacts': { name: 'Contacts', category: 'productivity' },
  'email': { name: 'Email', category: 'communication' },
  'workflows': { name: 'Workflows', category: 'automation' },
  'phone': { name: 'Phone', category: 'communication' },
  'reservations': { name: 'Reservations', category: 'scheduling' },
  'invoices': { name: 'Invoices', category: 'finance' },
  'expenses': { name: 'Expenses', category: 'finance' },
  'budget': { name: 'Budget', category: 'finance' },
  'reports': { name: 'Financial Reports', category: 'finance' },
  'payments': { name: 'Payments', category: 'finance' },
  'tax': { name: 'Tax', category: 'finance' },
  'documents': { name: 'Documents', category: 'productivity' },
  'devops-pipelines': { name: 'CI/CD Pipelines', category: 'devops' },
  'devops-code-review': { name: 'Code Review', category: 'devops' },
  'devops-deployment': { name: 'Deployment', category: 'devops' },
  'devops-infrastructure': { name: 'Infrastructure', category: 'devops' },
  'devops-security': { name: 'Security Scanning', category: 'devops' },
  'devops-logs': { name: 'Log Analysis', category: 'devops' },
  'legal': { name: 'Legal Overview', category: 'legal' },
  'contracts': { name: 'Contract Drafting', category: 'legal' },
  'review': { name: 'Document Review', category: 'legal' },
  'compliance': { name: 'Compliance Monitoring', category: 'legal' },
  'nda': { name: 'NDA Generator', category: 'legal' },
  'ip': { name: 'IP Management', category: 'legal' },
  'research': { name: 'Case Research', category: 'legal' },
  'social': { name: 'Social Media Overview', category: 'social' },
  'social-scheduling': { name: 'Content Scheduling', category: 'social' },
  'social-posts': { name: 'Post Generation', category: 'social' },
  'social-analytics': { name: 'Analytics Dashboard', category: 'social' },
  'social-community': { name: 'Community Management', category: 'social' },
  'social-outreach': { name: 'Influencer Outreach', category: 'social' },
  'social-trends': { name: 'Trend Monitoring', category: 'social' },
};
