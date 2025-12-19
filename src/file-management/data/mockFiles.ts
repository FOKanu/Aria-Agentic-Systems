import { UserFile, FileFolder, FilePermission, AgentFileAccess, FileAccessRequest } from '../types';

// Sample folders
export const mockFolders: FileFolder[] = [
  {
    id: 'folder-projects',
    name: 'Projects',
    parentId: null,
    color: 'hsl(var(--primary))',
    icon: 'folder',
    createdAt: '2024-01-15T10:00:00Z',
    fileCount: 8,
  },
  {
    id: 'folder-reports',
    name: 'Reports',
    parentId: null,
    color: 'hsl(var(--accent))',
    icon: 'file-text',
    createdAt: '2024-01-20T14:30:00Z',
    fileCount: 5,
  },
  {
    id: 'folder-assets',
    name: 'Visual Assets',
    parentId: null,
    color: 'hsl(142, 76%, 36%)',
    icon: 'image',
    createdAt: '2024-02-01T09:00:00Z',
    fileCount: 12,
  },
  {
    id: 'folder-data',
    name: 'Data Files',
    parentId: null,
    color: 'hsl(38, 92%, 50%)',
    icon: 'database',
    createdAt: '2024-02-10T11:15:00Z',
    fileCount: 6,
  },
  {
    id: 'folder-shared',
    name: 'Shared',
    parentId: null,
    color: 'hsl(280, 65%, 60%)',
    icon: 'users',
    createdAt: '2024-02-15T16:45:00Z',
    fileCount: 4,
  },
  {
    id: 'folder-projects-alpha',
    name: 'Project Alpha',
    parentId: 'folder-projects',
    color: 'hsl(var(--primary))',
    icon: 'folder',
    createdAt: '2024-01-16T10:00:00Z',
    fileCount: 3,
  },
];

// Sample files
export const mockFiles: UserFile[] = [
  // Project files
  {
    id: 'file-001',
    name: 'Q4 Sales Report.xlsx',
    type: 'xlsx',
    size: 245760,
    url: '/files/q4-sales-report.xlsx',
    tags: ['sales', 'quarterly', 'finance'],
    folderId: 'folder-reports',
    uploadedAt: '2024-03-01T10:30:00Z',
    analyzedAt: '2024-03-01T10:31:00Z',
    summary: 'Quarterly sales data with regional breakdowns and YoY comparisons.',
  },
  {
    id: 'file-002',
    name: 'Product Roadmap 2024.pdf',
    type: 'pdf',
    size: 1048576,
    url: '/files/product-roadmap-2024.pdf',
    tags: ['planning', 'product', 'roadmap'],
    folderId: 'folder-projects',
    uploadedAt: '2024-02-15T14:00:00Z',
    analyzedAt: '2024-02-15T14:05:00Z',
    summary: 'Strategic product roadmap outlining features and milestones for 2024.',
  },
  {
    id: 'file-003',
    name: 'User Research Findings.docx',
    type: 'docx',
    size: 524288,
    url: '/files/user-research-findings.docx',
    tags: ['research', 'users', 'ux'],
    folderId: 'folder-projects',
    uploadedAt: '2024-02-20T09:15:00Z',
    analyzedAt: '2024-02-20T09:20:00Z',
    summary: 'Comprehensive user research with interview transcripts and key insights.',
  },
  {
    id: 'file-004',
    name: 'Brand Guidelines.pdf',
    type: 'pdf',
    size: 3145728,
    url: '/files/brand-guidelines.pdf',
    thumbnail: '/thumbnails/brand-guidelines.png',
    tags: ['branding', 'design', 'guidelines'],
    folderId: 'folder-assets',
    uploadedAt: '2024-01-10T11:00:00Z',
    summary: 'Complete brand identity guidelines including colors, typography, and usage.',
  },
  {
    id: 'file-005',
    name: 'Customer Data Export.csv',
    type: 'csv',
    size: 2097152,
    url: '/files/customer-data-export.csv',
    tags: ['data', 'customers', 'export'],
    folderId: 'folder-data',
    uploadedAt: '2024-03-10T08:00:00Z',
    analyzedAt: '2024-03-10T08:02:00Z',
    summary: 'Customer database export with 15,000 records including demographics and purchase history.',
  },
  {
    id: 'file-006',
    name: 'Homepage Mockup.png',
    type: 'png',
    size: 1572864,
    url: '/files/homepage-mockup.png',
    thumbnail: '/thumbnails/homepage-mockup.png',
    tags: ['design', 'mockup', 'homepage'],
    folderId: 'folder-assets',
    uploadedAt: '2024-03-05T15:30:00Z',
    summary: 'High-fidelity homepage design mockup with responsive variants.',
  },
  {
    id: 'file-007',
    name: 'API Documentation.md',
    type: 'md',
    size: 81920,
    url: '/files/api-documentation.md',
    tags: ['api', 'documentation', 'technical'],
    folderId: 'folder-projects',
    uploadedAt: '2024-02-28T16:45:00Z',
    summary: 'REST API documentation with endpoints, parameters, and examples.',
  },
  {
    id: 'file-008',
    name: 'Meeting Notes - Sprint Planning.txt',
    type: 'txt',
    size: 12288,
    url: '/files/meeting-notes-sprint.txt',
    tags: ['meeting', 'sprint', 'planning'],
    folderId: 'folder-shared',
    uploadedAt: '2024-03-12T10:00:00Z',
    summary: 'Sprint planning notes with assigned tasks and priorities.',
  },
  {
    id: 'file-009',
    name: 'Financial Projections.xlsx',
    type: 'xlsx',
    size: 327680,
    url: '/files/financial-projections.xlsx',
    tags: ['finance', 'projections', 'budget'],
    folderId: 'folder-reports',
    uploadedAt: '2024-03-08T13:20:00Z',
    analyzedAt: '2024-03-08T13:22:00Z',
    summary: '3-year financial projections with revenue forecasts and expense analysis.',
  },
  {
    id: 'file-010',
    name: 'Team Photo.jpg',
    type: 'jpg',
    size: 2621440,
    url: '/files/team-photo.jpg',
    thumbnail: '/thumbnails/team-photo.jpg',
    tags: ['team', 'photo', 'company'],
    folderId: 'folder-assets',
    uploadedAt: '2024-02-25T12:00:00Z',
    summary: 'Company team photo from the 2024 annual meeting.',
  },
  {
    id: 'file-011',
    name: 'Competitor Analysis.pdf',
    type: 'pdf',
    size: 786432,
    url: '/files/competitor-analysis.pdf',
    tags: ['research', 'competitors', 'market'],
    folderId: 'folder-reports',
    uploadedAt: '2024-03-02T09:45:00Z',
    analyzedAt: '2024-03-02T09:50:00Z',
    summary: 'Detailed competitor analysis covering 5 major players with SWOT analysis.',
  },
  {
    id: 'file-012',
    name: 'Analytics Dashboard Config.json',
    type: 'json',
    size: 4096,
    url: '/files/analytics-config.json',
    tags: ['config', 'analytics', 'dashboard'],
    folderId: 'folder-data',
    uploadedAt: '2024-03-11T17:00:00Z',
    summary: 'Configuration file for analytics dashboard widgets and data sources.',
  },
  {
    id: 'file-013',
    name: 'Product Screenshots.zip',
    type: 'zip',
    size: 15728640,
    url: '/files/product-screenshots.zip',
    tags: ['screenshots', 'product', 'archive'],
    folderId: 'folder-assets',
    uploadedAt: '2024-03-06T14:15:00Z',
    summary: 'Archive containing 50 product screenshots for marketing materials.',
  },
  {
    id: 'file-014',
    name: 'User Onboarding Flow.svg',
    type: 'svg',
    size: 32768,
    url: '/files/onboarding-flow.svg',
    thumbnail: '/thumbnails/onboarding-flow.png',
    tags: ['design', 'onboarding', 'flow'],
    folderId: 'folder-projects-alpha',
    uploadedAt: '2024-03-09T11:30:00Z',
    summary: 'SVG diagram of the user onboarding flow with decision points.',
  },
  {
    id: 'file-015',
    name: 'Privacy Policy Draft.docx',
    type: 'docx',
    size: 45056,
    url: '/files/privacy-policy-draft.docx',
    tags: ['legal', 'privacy', 'policy'],
    folderId: 'folder-shared',
    uploadedAt: '2024-03-13T10:00:00Z',
    summary: 'Draft privacy policy document for legal review.',
  },
];

// Sample permissions
export const mockPermissions: FilePermission[] = [
  {
    id: 'perm-001',
    agentId: 'sage',
    fileId: 'file-003',
    scope: 'permanent',
    grantedAt: '2024-03-01T10:00:00Z',
    grantedBy: 'user',
  },
  {
    id: 'perm-002',
    agentId: 'sage',
    fileId: 'file-011',
    scope: 'permanent',
    grantedAt: '2024-03-02T14:00:00Z',
    grantedBy: 'user',
  },
  {
    id: 'perm-003',
    agentId: 'nova',
    fileId: 'file-007',
    scope: 'permanent',
    grantedAt: '2024-02-28T17:00:00Z',
    grantedBy: 'user',
  },
  {
    id: 'perm-004',
    agentId: 'pixel',
    fileId: 'file-006',
    scope: 'permanent',
    grantedAt: '2024-03-05T16:00:00Z',
    grantedBy: 'user',
  },
  {
    id: 'perm-005',
    agentId: 'pixel',
    fileId: 'file-014',
    scope: 'session',
    grantedAt: '2024-03-14T09:00:00Z',
    grantedBy: 'user',
  },
  {
    id: 'perm-006',
    agentId: 'nexus',
    fileId: 'file-012',
    scope: 'permanent',
    grantedAt: '2024-03-11T17:30:00Z',
    grantedBy: 'system',
  },
];

// Sample access history
export const mockAccessHistory: AgentFileAccess[] = [
  {
    id: 'access-001',
    agentId: 'sage',
    fileId: 'file-003',
    action: 'analyze',
    timestamp: '2024-03-14T09:30:00Z',
    taskId: 'task-001',
    contextUsed: 'Extracted key user pain points for feature prioritization',
  },
  {
    id: 'access-002',
    agentId: 'nova',
    fileId: 'file-007',
    action: 'read',
    timestamp: '2024-03-14T10:15:00Z',
    taskId: 'task-002',
    contextUsed: 'Referenced API endpoints for integration task',
  },
  {
    id: 'access-003',
    agentId: 'pixel',
    fileId: 'file-006',
    action: 'view',
    timestamp: '2024-03-14T11:00:00Z',
    contextUsed: 'Analyzed design mockup for accessibility review',
  },
  {
    id: 'access-004',
    agentId: 'sage',
    fileId: 'file-011',
    action: 'analyze',
    timestamp: '2024-03-13T15:45:00Z',
    taskId: 'task-003',
    contextUsed: 'Summarized competitor strengths and weaknesses',
  },
];

// Sample pending requests
export const mockPendingRequests: FileAccessRequest[] = [
  {
    id: 'req-001',
    agentId: 'atlas',
    agentName: 'Atlas',
    agentAvatar: '/avatars/atlas.png',
    fileIds: ['file-002', 'file-009'],
    reason: 'Need to review roadmap and financial projections to create a comprehensive project plan for Q2.',
    taskContext: 'Creating Q2 strategic plan',
    status: 'pending',
    requestedAt: '2024-03-14T14:00:00Z',
    requestedScope: 'task-scoped',
  },
  {
    id: 'req-002',
    agentId: 'aria',
    agentName: 'Aria',
    agentAvatar: '/avatars/aria.png',
    fileIds: ['file-004'],
    reason: 'Require brand guidelines to ensure marketing copy aligns with brand voice and visual identity.',
    status: 'pending',
    requestedAt: '2024-03-14T14:30:00Z',
    requestedScope: 'permanent',
  },
];

// Helper to get file by ID
export const getFileById = (id: string): UserFile | undefined => {
  return mockFiles.find(f => f.id === id);
};

// Helper to get folder by ID
export const getFolderById = (id: string): FileFolder | undefined => {
  return mockFolders.find(f => f.id === id);
};

// Helper to get files in folder
export const getFilesInFolder = (folderId: string | null): UserFile[] => {
  return mockFiles.filter(f => f.folderId === folderId);
};

// Helper to get subfolders
export const getSubfolders = (parentId: string | null): FileFolder[] => {
  return mockFolders.filter(f => f.parentId === parentId);
};

// Helper to get agent permissions
export const getAgentPermissions = (agentId: string): FilePermission[] => {
  return mockPermissions.filter(p => p.agentId === agentId);
};

// Helper to check if agent has permission
export const hasFilePermission = (agentId: string, fileId: string): boolean => {
  return mockPermissions.some(p => p.agentId === agentId && p.fileId === fileId);
};
