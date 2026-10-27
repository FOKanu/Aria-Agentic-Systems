// Mock Data - Developed by Francis Okorie Iyeke-Kanu
import { AgentState, Task, VisionData, MemoryEntry, ToolUsage, AnalyzedFile, AgentEvent, AutonomyLevel } from '@/types/agent';

export const mockAgentState: AgentState = 'executing';

export const mockAutonomyLevel: AutonomyLevel = 'assisted';

/* Francis Okorie Iyeke-Kanu - Active Task Mock */
export const mockActiveTask: Task = {
  id: 'task-001',
  name: 'Process Q4 Sales Report',
  status: 'running',
  startedAt: new Date(Date.now() - 1000 * 60 * 12).toISOString(),
  steps: [
    {
      id: 'step-1',
      plan: 'Open sales spreadsheet from Downloads folder',
      tool: 'file_browser',
      result: 'Found sales_q4_2024.xlsx',
      confidence: 0.95,
      status: 'completed',
      timestamp: new Date(Date.now() - 1000 * 60 * 10).toISOString(),
    },
    {
      id: 'step-2',
      plan: 'Extract revenue data from Sheet 1',
      tool: 'spreadsheet_reader',
      result: 'Extracted 1,247 rows of transaction data',
      confidence: 0.92,
      status: 'completed',
      timestamp: new Date(Date.now() - 1000 * 60 * 8).toISOString(),
    },
    {
      id: 'step-3',
      plan: 'Calculate monthly totals and growth rates',
      tool: 'data_analyzer',
      result: 'Computed aggregates for Oct, Nov, Dec',
      confidence: 0.88,
      status: 'completed',
      timestamp: new Date(Date.now() - 1000 * 60 * 5).toISOString(),
    },
    {
      id: 'step-4',
      plan: 'Generate summary chart visualization',
      tool: 'chart_generator',
      confidence: 0.75,
      status: 'running',
      timestamp: new Date(Date.now() - 1000 * 60 * 2).toISOString(),
    },
    {
      id: 'step-5',
      plan: 'Export report to PDF format',
      tool: 'pdf_exporter',
      confidence: 0.70,
      status: 'pending',
      timestamp: new Date().toISOString(),
    },
  ],
};

// Author: Francis Okorie Iyeke-Kanu
export const mockTasks: Task[] = [
  mockActiveTask,
  {
    id: 'task-002',
    name: 'Schedule Team Meeting',
    status: 'completed',
    startedAt: new Date(Date.now() - 1000 * 60 * 60).toISOString(),
    completedAt: new Date(Date.now() - 1000 * 60 * 45).toISOString(),
    steps: [
      {
        id: 'step-1',
        plan: 'Check calendar availability',
        tool: 'calendar_api',
        result: 'Found 3 available slots',
        confidence: 0.98,
        status: 'completed',
        timestamp: new Date(Date.now() - 1000 * 60 * 55).toISOString(),
      },
      {
        id: 'step-2',
        plan: 'Send meeting invites',
        tool: 'email_sender',
        result: 'Sent to 5 participants',
        confidence: 0.96,
        status: 'completed',
        timestamp: new Date(Date.now() - 1000 * 60 * 45).toISOString(),
      },
    ],
  },
  {
    id: 'task-003',
    name: 'Research Competitor Pricing',
    status: 'failed',
    startedAt: new Date(Date.now() - 1000 * 60 * 120).toISOString(),
    steps: [
      {
        id: 'step-1',
        plan: 'Navigate to competitor website',
        tool: 'browser',
        result: 'Page loaded',
        confidence: 0.90,
        status: 'completed',
        timestamp: new Date(Date.now() - 1000 * 60 * 118).toISOString(),
      },
      {
        id: 'step-2',
        plan: 'Extract pricing table data',
        tool: 'web_scraper',
        confidence: 0.45,
        status: 'failed',
        error: 'Access denied - CAPTCHA detected',
        timestamp: new Date(Date.now() - 1000 * 60 * 115).toISOString(),
      },
    ],
  },
];

// Francis Okorie Iyeke-Kanu - Vision Data
export const mockVisionData: VisionData = {
  screenshot: undefined,
  ocrText: 'Task Manager\nActive Tasks: 3\nCompleted: 12\n[New Task] [Refresh] [Export]',
  detectedElements: [
    { id: 'el-1', type: 'button', label: 'New Task', bounds: { x: 120, y: 340, width: 80, height: 32 }, confidence: 0.94 },
    { id: 'el-2', type: 'button', label: 'Refresh', bounds: { x: 210, y: 340, width: 70, height: 32 }, confidence: 0.92 },
    { id: 'el-3', type: 'button', label: 'Export', bounds: { x: 290, y: 340, width: 75, height: 32 }, confidence: 0.91 },
  ],
  cursorTarget: { x: 160, y: 356, label: 'New Task Button' },
  confidence: 0.89,
  nextAction: 'Click New Task button to create a task',
};

export const mockMemoryShortTerm: MemoryEntry[] = [
  { id: 'mem-1', type: 'short-term', content: 'User requested Q4 sales report processing', timestamp: new Date(Date.now() - 1000 * 60 * 12).toISOString(), relevance: 0.95 },
  { id: 'mem-2', type: 'short-term', content: 'Found sales_q4_2024.xlsx in Downloads', timestamp: new Date(Date.now() - 1000 * 60 * 10).toISOString(), relevance: 0.88 },
  { id: 'mem-3', type: 'short-term', content: 'Total revenue calculated: $1,247,832', timestamp: new Date(Date.now() - 1000 * 60 * 5).toISOString(), relevance: 0.92 },
];

export const mockMemoryLongTerm: MemoryEntry[] = [
  { id: 'mem-lt-1', type: 'long-term', content: 'User prefers PDF format for reports', timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24 * 7).toISOString() },
  { id: 'mem-lt-2', type: 'long-term', content: 'Sales reports are stored in /Documents/Reports/', timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24 * 14).toISOString() },
  { id: 'mem-lt-3', type: 'long-term', content: 'Team meetings typically scheduled for Tuesdays', timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24 * 30).toISOString() },
];

export const mockToolUsage: ToolUsage[] = [
  { id: 'tool-1', tool: 'file_browser', input: 'ls ~/Downloads/*.xlsx', output: 'sales_q4_2024.xlsx', timestamp: new Date(Date.now() - 1000 * 60 * 10).toISOString(), success: true },
  { id: 'tool-2', tool: 'spreadsheet_reader', input: 'read sales_q4_2024.xlsx Sheet1', output: '1247 rows extracted', timestamp: new Date(Date.now() - 1000 * 60 * 8).toISOString(), success: true },
  { id: 'tool-3', tool: 'data_analyzer', input: 'aggregate by month', output: 'Oct: $412K, Nov: $398K, Dec: $437K', timestamp: new Date(Date.now() - 1000 * 60 * 5).toISOString(), success: true },
];

export const mockAnalyzedFiles: AnalyzedFile[] = [
  { id: 'file-1', name: 'sales_q4_2024.xlsx', type: 'csv', summary: 'Q4 sales data with 1,247 transactions across 3 regions', analyzedAt: new Date(Date.now() - 1000 * 60 * 8).toISOString() },
  { id: 'file-2', name: 'team_roster.pdf', type: 'pdf', summary: 'Employee directory with 47 team members', analyzedAt: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString() },
  { id: 'file-3', name: 'meeting_notes.docx', type: 'docx', summary: 'Q3 review meeting notes, action items pending', analyzedAt: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString() },
];

export const mockEvents: AgentEvent[] = [
  { id: 'evt-1', type: 'action', message: 'Started chart generation', timestamp: new Date(Date.now() - 1000 * 60 * 2).toISOString() },
  { id: 'evt-2', type: 'info', message: 'Data aggregation complete', timestamp: new Date(Date.now() - 1000 * 60 * 5).toISOString() },
  { id: 'evt-3', type: 'approval', message: 'Awaiting approval to export file', timestamp: new Date(Date.now() - 1000 * 60 * 1).toISOString() },
  { id: 'evt-4', type: 'warning', message: 'Low confidence on element detection', timestamp: new Date(Date.now() - 1000 * 60 * 3).toISOString() },
  { id: 'evt-5', type: 'info', message: 'Spreadsheet data extracted', timestamp: new Date(Date.now() - 1000 * 60 * 8).toISOString() },
];
