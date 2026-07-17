import { useLocation, useNavigate } from 'react-router-dom';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface ModulePage {
  path: string;
  tabId?: string; // For internal tab-based navigation
  label: string;
}

interface ModuleConfig {
  basePath: string;
  pages: ModulePage[];
}

const moduleConfigs: Record<string, ModuleConfig> = {
  admin: {
    basePath: '/admin',
    pages: [
      { path: '/calendar', tabId: 'calendar', label: 'Calendar' },
      { path: '/email', tabId: 'email', label: 'Email' },
      { path: '/phone', tabId: 'phone', label: 'Phone' },
      { path: '/reservations', tabId: 'reservations', label: 'Reservations' },
      { path: '/workflows', tabId: 'workflows', label: 'Workflows' },
      { path: '/contacts', tabId: 'contacts', label: 'Contacts' },
      { path: '/admin/job-applications', label: 'Job Applications' },
    ],
  },
  finance: {
    basePath: '/finance',
    pages: [
      { path: '/invoices', tabId: 'invoices', label: 'Invoices' },
      { path: '/expenses', tabId: 'expenses', label: 'Expenses' },
      { path: '/budget', tabId: 'budget', label: 'Budget' },
      { path: '/reports', tabId: 'reports', label: 'Reports' },
      { path: '/payments', tabId: 'payments', label: 'Payments' },
      { path: '/tax', tabId: 'tax', label: 'Tax' },
    ],
  },
  legal: {
    basePath: '/legal',
    pages: [
      { path: '/legal', tabId: 'legal', label: 'Overview' },
      { path: '/legal/contracts', tabId: 'contracts', label: 'Contracts' },
      { path: '/legal/document-review', tabId: 'review', label: 'Document Review' },
      { path: '/legal/compliance', tabId: 'compliance', label: 'Compliance' },
      { path: '/legal/nda-generator', tabId: 'nda', label: 'NDA Generator' },
      { path: '/legal/ip-management', tabId: 'ip', label: 'IP Management' },
      { path: '/legal/case-research', tabId: 'research', label: 'Case Research' },
    ],
  },
  devops: {
    basePath: '/devops',
    pages: [
      { path: '/devops/pipelines', tabId: 'devops-pipelines', label: 'CI/CD Pipelines' },
      { path: '/devops/code-review', tabId: 'devops-code-review', label: 'Code Review' },
      { path: '/devops/deployment', tabId: 'devops-deployment', label: 'Deployment' },
      { path: '/devops/infrastructure', tabId: 'devops-infrastructure', label: 'Infrastructure' },
      { path: '/devops/security', tabId: 'devops-security', label: 'Security' },
      { path: '/devops/logs', tabId: 'devops-logs', label: 'Log Analysis' },
    ],
  },
  monitoring: {
    basePath: '/monitoring',
    pages: [
      { path: '/monitoring', tabId: 'monitoring', label: 'Overview' },
      { path: '/monitoring/activity', label: 'Activity Stream' },
      { path: '/monitoring/alerts', label: 'Alerts' },
      { path: '/monitoring/execution', label: 'Execution Trace' },
      { path: '/monitoring/tools', label: 'Tool Monitor' },
    ],
  },
  social: {
    basePath: '/social',
    pages: [
      { path: '/social', tabId: 'social', label: 'Overview' },
      { path: '/social/scheduling', tabId: 'social-scheduling', label: 'Content Scheduling' },
      { path: '/social/posts', tabId: 'social-posts', label: 'Post Generation' },
      { path: '/social/analytics', tabId: 'social-analytics', label: 'Analytics Dashboard' },
      { path: '/social/community', tabId: 'social-community', label: 'Community Management' },
      { path: '/social/outreach', tabId: 'social-outreach', label: 'Influencer Outreach' },
      { path: '/social/trends', tabId: 'social-trends', label: 'Trend Monitoring' },
    ],
  },
};

interface FloatingModuleNavProps {
  activeTab?: string;
  onNavigate?: (tab: string) => void;
}

function detectModuleFromPath(pathname: string): { module: ModuleConfig; currentIndex: number } | null {
  // Check legal first (more specific paths)
  if (pathname.startsWith('/legal')) {
    const module = moduleConfigs.legal;
    const idx = module.pages.findIndex(p => p.path === pathname);
    if (idx !== -1) return { module, currentIndex: idx };
    if (pathname === '/legal' || pathname === '/legal/overview') return { module, currentIndex: 0 };
  }

  // Check devops
  if (pathname.startsWith('/devops')) {
    const module = moduleConfigs.devops;
    const idx = module.pages.findIndex(p => p.path === pathname);
    if (idx !== -1) return { module, currentIndex: idx };
  }

  // Check monitoring
  if (pathname.startsWith('/monitoring')) {
    const module = moduleConfigs.monitoring;
    const idx = module.pages.findIndex(p => p.path === pathname);
    if (idx !== -1) return { module, currentIndex: idx };
  }

  // Check admin pages
  if (pathname.startsWith('/admin')) {
    const module = moduleConfigs.admin;
    const idx = module.pages.findIndex(p => p.path === pathname);
    if (idx !== -1) return { module, currentIndex: idx };
  }

  // Check social
  if (pathname.startsWith('/social')) {
    const module = moduleConfigs.social;
    const idx = module.pages.findIndex(p => p.path === pathname);
    if (idx !== -1) return { module, currentIndex: idx };
    if (pathname === '/social') return { module, currentIndex: 0 };
  }

  return null;
}

function detectModuleFromTab(tabId: string): { module: ModuleConfig; currentIndex: number } | null {
  // Admin tabs
  const adminTabs = ['calendar', 'email', 'phone', 'reservations', 'workflows', 'contacts'];
  if (adminTabs.includes(tabId)) {
    const module = moduleConfigs.admin;
    const idx = module.pages.findIndex(p => p.tabId === tabId);
    if (idx !== -1) return { module, currentIndex: idx };
  }

  // Finance tabs
  const financeTabs = ['invoices', 'expenses', 'budget', 'reports', 'payments', 'tax'];
  if (financeTabs.includes(tabId)) {
    const module = moduleConfigs.finance;
    const idx = module.pages.findIndex(p => p.tabId === tabId);
    if (idx !== -1) return { module, currentIndex: idx };
  }

  // DevOps tabs
  const devopsTabs = ['devops-pipelines', 'devops-code-review', 'devops-deployment', 'devops-infrastructure', 'devops-security', 'devops-logs'];
  if (devopsTabs.includes(tabId)) {
    const module = moduleConfigs.devops;
    const idx = module.pages.findIndex(p => p.tabId === tabId);
    if (idx !== -1) return { module, currentIndex: idx };
  }

  // Monitoring tab
  if (tabId === 'monitoring') {
    const module = moduleConfigs.monitoring;
    return { module, currentIndex: 0 };
  }

  // Legal tabs
  const legalTabs = ['legal', 'contracts', 'review', 'compliance', 'nda', 'ip', 'research'];
  if (legalTabs.includes(tabId)) {
    const module = moduleConfigs.legal;
    const idx = module.pages.findIndex(p => p.tabId === tabId);
    if (idx !== -1) return { module, currentIndex: idx };
  }

  // Social tabs
  const socialTabs = ['social', 'social-scheduling', 'social-posts', 'social-analytics', 'social-community', 'social-outreach', 'social-trends'];
  if (socialTabs.includes(tabId)) {
    const module = moduleConfigs.social;
    const idx = module.pages.findIndex(p => p.tabId === tabId);
    if (idx !== -1) return { module, currentIndex: idx };
  }

  return null;
}

export function FloatingModuleNav({ activeTab, onNavigate }: FloatingModuleNavProps) {
  const location = useLocation();
  const navigate = useNavigate();

  // Determine if we're using tab-based or path-based navigation
  const isTabBased = activeTab !== undefined && onNavigate !== undefined;
  
  const detected = isTabBased 
    ? detectModuleFromTab(activeTab)
    : detectModuleFromPath(location.pathname);

  if (!detected) return null;

  const { module, currentIndex } = detected;
  const hasPrev = currentIndex > 0;
  const hasNext = currentIndex < module.pages.length - 1;

  const prevPage = hasPrev ? module.pages[currentIndex - 1] : null;
  const nextPage = hasNext ? module.pages[currentIndex + 1] : null;
  const currentPage = module.pages[currentIndex];

  const handleNavigate = (page: ModulePage) => {
    if (isTabBased && page.tabId && onNavigate) {
      onNavigate(page.tabId);
    } else {
      navigate(page.path);
    }
  };

  return (
    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-40 flex items-center gap-2">
      <Button
        variant="outline"
        size="icon"
        disabled={!hasPrev}
        onClick={() => prevPage && handleNavigate(prevPage)}
        className={cn(
          "h-10 w-10 rounded-full bg-card/95 backdrop-blur-xl border-border shadow-lg",
          !hasPrev && "opacity-50 cursor-not-allowed"
        )}
        title={prevPage?.label || 'Previous'}
      >
        <ChevronLeft className="w-5 h-5" />
      </Button>

      <div className="px-4 py-2 rounded-full bg-card/95 backdrop-blur-xl border border-border shadow-lg">
        <span className="text-sm font-medium text-foreground">{currentPage.label}</span>
        <span className="text-xs text-muted-foreground ml-2">
          {currentIndex + 1} / {module.pages.length}
        </span>
      </div>

      <Button
        variant="outline"
        size="icon"
        disabled={!hasNext}
        onClick={() => nextPage && handleNavigate(nextPage)}
        className={cn(
          "h-10 w-10 rounded-full bg-card/95 backdrop-blur-xl border-border shadow-lg",
          !hasNext && "opacity-50 cursor-not-allowed"
        )}
        title={nextPage?.label || 'Next'}
      >
        <ChevronRight className="w-5 h-5" />
      </Button>
    </div>
  );
}
