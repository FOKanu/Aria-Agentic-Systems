import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@/components/ui/breadcrumb';
import { Home } from 'lucide-react';
import { TabId } from '@/components/BottomNav';

interface AppBreadcrumbProps {
  activeTab: TabId;
  viewMode: 'main' | 'details' | 'profile';
  agentName?: string;
  onNavigate: (tab: TabId) => void;
  onBackToMain: () => void;
}

const tabLabels: Record<TabId, string> = {
  home: 'Home',
  chat: 'Chat',
  dashboard: 'Dashboard',
  tasks: 'Tasks',
  monitoring: 'Monitoring',
  memory: 'Memory',
  agents: 'Fleet Command',
  settings: 'Settings',
  analytics: 'Analytics',
  files: 'Files',
  calendar: 'Calendar',
  contacts: 'Contacts',
  email: 'Email',
  workflows: 'Workflows',
  phone: 'Phone',
  reservations: 'Reservations',
  invoices: 'Invoices',
  expenses: 'Expenses',
  budget: 'Budget',
  reports: 'Reports',
  payments: 'Payments',
  tax: 'Tax',
  documents: 'Documents',
  'devops-pipelines': 'CI/CD Pipelines',
  'devops-code-review': 'Code Review',
  'devops-deployment': 'Deployment',
  'devops-infrastructure': 'Infrastructure',
  'devops-security': 'Security Scanning',
  'devops-logs': 'Log Analysis',
  legal: 'Legal Overview',
  contracts: 'Contract Drafting',
  review: 'Document Review',
  compliance: 'Compliance Monitoring',
  nda: 'NDA Generator',
  ip: 'IP Management',
  research: 'Case Research',
  social: 'Social Media Overview',
  'social-scheduling': 'Content Scheduling',
  'social-posts': 'Post Generation',
  'social-analytics': 'Analytics Dashboard',
  'social-community': 'Community Management',
  'social-outreach': 'Influencer Outreach',
  'social-trends': 'Trend Monitoring',
};

export function AppBreadcrumb({
  activeTab,
  viewMode,
  agentName,
  onNavigate,
  onBackToMain,
}: AppBreadcrumbProps) {
  return (
    <Breadcrumb>
      <BreadcrumbList>
        <BreadcrumbItem>
          <BreadcrumbLink 
            onClick={() => onNavigate('home')}
            className="flex items-center gap-1.5 cursor-pointer hover:text-foreground transition-colors"
          >
            <Home className="h-4 w-4" />
            <span className="sr-only sm:not-sr-only">Home</span>
          </BreadcrumbLink>
        </BreadcrumbItem>

        {activeTab !== 'home' && (
          <>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              {viewMode === 'main' ? (
                <BreadcrumbPage>{tabLabels[activeTab]}</BreadcrumbPage>
              ) : (
                <BreadcrumbLink 
                  onClick={onBackToMain}
                  className="cursor-pointer hover:text-foreground transition-colors"
                >
                  {tabLabels[activeTab]}
                </BreadcrumbLink>
              )}
            </BreadcrumbItem>
          </>
        )}

        {viewMode === 'details' && agentName && (
          <>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbPage>{agentName}</BreadcrumbPage>
            </BreadcrumbItem>
          </>
        )}

        {viewMode === 'profile' && (
          <>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbPage>Profile</BreadcrumbPage>
            </BreadcrumbItem>
          </>
        )}
      </BreadcrumbList>
    </Breadcrumb>
  );
}
