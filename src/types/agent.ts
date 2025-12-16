export type AgentState = 'idle' | 'thinking' | 'executing' | 'waiting' | 'error';

export type AutonomyLevel = 'manual' | 'assisted' | 'autonomous';

export interface Task {
  id: string;
  name: string;
  status: 'pending' | 'running' | 'completed' | 'failed';
  startedAt?: string;
  completedAt?: string;
  steps: TaskStep[];
}

export interface TaskStep {
  id: string;
  plan: string;
  tool: string;
  result?: string;
  confidence: number;
  status: 'pending' | 'running' | 'completed' | 'failed';
  error?: string;
  timestamp: string;
}

export interface VisionData {
  screenshot?: string;
  ocrText?: string;
  detectedElements: DetectedElement[];
  cursorTarget?: { x: number; y: number; label: string };
  confidence: number;
  nextAction?: string;
}

export interface DetectedElement {
  id: string;
  type: string;
  label: string;
  bounds: { x: number; y: number; width: number; height: number };
  confidence: number;
}

export interface MemoryEntry {
  id: string;
  type: 'short-term' | 'long-term';
  content: string;
  timestamp: string;
  relevance?: number;
}

export interface ToolUsage {
  id: string;
  tool: string;
  input: string;
  output: string;
  timestamp: string;
  success: boolean;
}

export interface AnalyzedFile {
  id: string;
  name: string;
  type: 'csv' | 'pdf' | 'docx' | 'txt';
  summary: string;
  analyzedAt: string;
}

export interface AgentEvent {
  id: string;
  type: 'info' | 'warning' | 'error' | 'action' | 'approval';
  message: string;
  timestamp: string;
  details?: string;
}
