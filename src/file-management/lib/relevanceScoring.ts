// File Relevance Scoring System

import { UserFile } from '../types';
import { AgentRoleId } from '../../agent-engine/types';
import { getFileCategory, extractKeywords } from './fileUtils';

// Agent role to preferred file categories mapping
const AGENT_FILE_PREFERENCES: Record<AgentRoleId, string[]> = {
  atlas: ['document', 'spreadsheet'], // Planner needs overview docs
  nova: ['code', 'document'], // Developer needs code files
  sage: ['document', 'spreadsheet', 'code'], // Researcher needs everything
  echo: ['document', 'spreadsheet'], // Assistant handles general files
  pixel: ['image', 'document'], // Vision specialist needs visuals
  nexus: ['document', 'spreadsheet', 'archive'], // Admin handles system files
  cipher: ['code', 'document'], // Security needs logs and configs
  flux: ['code', 'archive'], // DevOps needs configs and packages
  aria: ['document'], // Communications needs documents
  orion: ['document', 'spreadsheet'], // Scheduler needs schedules
};

// Keywords that boost relevance for specific agent roles
const AGENT_KEYWORDS: Record<AgentRoleId, string[]> = {
  atlas: ['plan', 'roadmap', 'overview', 'summary', 'strategy', 'timeline', 'goals'],
  nova: ['code', 'api', 'function', 'module', 'component', 'test', 'debug', 'implementation'],
  sage: ['research', 'analysis', 'report', 'study', 'data', 'findings', 'statistics'],
  echo: ['notes', 'meeting', 'memo', 'reminder', 'task', 'todo', 'summary'],
  pixel: ['image', 'photo', 'screenshot', 'diagram', 'chart', 'visual', 'design', 'mockup'],
  nexus: ['config', 'settings', 'admin', 'system', 'backup', 'log', 'permissions'],
  cipher: ['security', 'audit', 'access', 'auth', 'encryption', 'vulnerability', 'compliance'],
  flux: ['deploy', 'docker', 'kubernetes', 'ci', 'cd', 'pipeline', 'infrastructure', 'build'],
  aria: ['email', 'draft', 'proposal', 'letter', 'communication', 'message', 'template'],
  orion: ['calendar', 'schedule', 'appointment', 'meeting', 'booking', 'availability'],
};

interface RelevanceFactors {
  keywordMatch: number;
  agentRoleMatch: number;
  recencyScore: number;
  tagMatch: number;
  previousAccessBonus: number;
}

// Calculate keyword match score between task and file
function calculateKeywordMatch(taskDescription: string, file: UserFile): number {
  const taskWords = taskDescription.toLowerCase().split(/\s+/);
  const fileKeywords = [
    ...extractKeywords(file.name),
    ...file.tags.map(t => t.toLowerCase()),
    file.summary?.toLowerCase().split(/\s+/) || [],
  ].flat();

  if (fileKeywords.length === 0) return 0;

  const matches = taskWords.filter(word => 
    fileKeywords.some(keyword => keyword.includes(word) || word.includes(keyword))
  );

  return Math.min(matches.length / Math.max(taskWords.length, 1), 1);
}

// Calculate agent role preference score
function calculateAgentRoleMatch(file: UserFile, agentRole: AgentRoleId): number {
  const category = getFileCategory(file.type);
  const preferredCategories = AGENT_FILE_PREFERENCES[agentRole] || [];
  const agentKeywords = AGENT_KEYWORDS[agentRole] || [];

  let score = 0;

  // Category preference
  if (preferredCategories.includes(category)) {
    score += 0.4;
  }

  // Keyword preference
  const fileText = `${file.name} ${file.tags.join(' ')} ${file.summary || ''}`.toLowerCase();
  const keywordMatches = agentKeywords.filter(keyword => fileText.includes(keyword));
  score += Math.min(keywordMatches.length * 0.15, 0.6);

  return Math.min(score, 1);
}

// Calculate recency score (more recent = higher score)
function calculateRecencyScore(file: UserFile): number {
  const now = new Date();
  const uploadDate = new Date(file.uploadedAt);
  const daysSinceUpload = (now.getTime() - uploadDate.getTime()) / (1000 * 60 * 60 * 24);

  if (daysSinceUpload < 1) return 1; // Today
  if (daysSinceUpload < 7) return 0.8; // This week
  if (daysSinceUpload < 30) return 0.6; // This month
  if (daysSinceUpload < 90) return 0.4; // Last 3 months
  if (daysSinceUpload < 365) return 0.2; // This year
  return 0.1; // Older
}

// Calculate tag match score
function calculateTagMatch(taskDescription: string, file: UserFile): number {
  if (file.tags.length === 0) return 0;

  const taskWords = taskDescription.toLowerCase().split(/\s+/);
  const matchingTags = file.tags.filter(tag =>
    taskWords.some(word => tag.toLowerCase().includes(word) || word.includes(tag.toLowerCase()))
  );

  return matchingTags.length / file.tags.length;
}

// Main relevance scoring function
export function scoreFileRelevance(
  file: UserFile,
  taskDescription: string,
  agentRole: AgentRoleId,
  previouslyAccessed: boolean = false
): number {
  const factors: RelevanceFactors = {
    keywordMatch: calculateKeywordMatch(taskDescription, file),
    agentRoleMatch: calculateAgentRoleMatch(file, agentRole),
    recencyScore: calculateRecencyScore(file),
    tagMatch: calculateTagMatch(taskDescription, file),
    previousAccessBonus: previouslyAccessed ? 0.1 : 0,
  };

  // Weighted combination
  const weights = {
    keywordMatch: 0.35,
    agentRoleMatch: 0.25,
    recencyScore: 0.15,
    tagMatch: 0.15,
    previousAccessBonus: 0.10,
  };

  const score =
    factors.keywordMatch * weights.keywordMatch +
    factors.agentRoleMatch * weights.agentRoleMatch +
    factors.recencyScore * weights.recencyScore +
    factors.tagMatch * weights.tagMatch +
    factors.previousAccessBonus * weights.previousAccessBonus;

  return Math.min(Math.max(score, 0), 1);
}

// Find relevant files for a task
export function findRelevantFiles(
  files: UserFile[],
  taskDescription: string,
  agentRole: AgentRoleId,
  options: {
    threshold?: number;
    maxResults?: number;
    previouslyAccessedIds?: string[];
  } = {}
): UserFile[] {
  const {
    threshold = 0.2,
    maxResults = 10,
    previouslyAccessedIds = [],
  } = options;

  const scoredFiles = files.map(file => ({
    file,
    score: scoreFileRelevance(
      file,
      taskDescription,
      agentRole,
      previouslyAccessedIds.includes(file.id)
    ),
  }));

  return scoredFiles
    .filter(({ score }) => score >= threshold)
    .sort((a, b) => b.score - a.score)
    .slice(0, maxResults)
    .map(({ file, score }) => ({
      ...file,
      relevanceScore: score,
    }));
}

// Get top files by category for an agent
export function getTopFilesByCategory(
  files: UserFile[],
  agentRole: AgentRoleId,
  maxPerCategory: number = 3
): Record<string, UserFile[]> {
  const categorized: Record<string, UserFile[]> = {};
  const preferredCategories = AGENT_FILE_PREFERENCES[agentRole] || [];

  preferredCategories.forEach(category => {
    const categoryFiles = files
      .filter(file => getFileCategory(file.type) === category)
      .map(file => ({
        ...file,
        relevanceScore: calculateAgentRoleMatch(file, agentRole),
      }))
      .sort((a, b) => (b.relevanceScore || 0) - (a.relevanceScore || 0))
      .slice(0, maxPerCategory);

    if (categoryFiles.length > 0) {
      categorized[category] = categoryFiles;
    }
  });

  return categorized;
}

// Analyze task complexity to determine file needs
export function analyzeTaskFileNeeds(taskDescription: string): {
  needsData: boolean;
  needsDocuments: boolean;
  needsImages: boolean;
  needsCode: boolean;
  suggestedCategories: string[];
} {
  const lowerTask = taskDescription.toLowerCase();

  const dataKeywords = ['analyze', 'data', 'spreadsheet', 'csv', 'numbers', 'statistics', 'chart', 'graph'];
  const docKeywords = ['document', 'report', 'write', 'draft', 'review', 'read', 'summary', 'pdf'];
  const imageKeywords = ['image', 'photo', 'screenshot', 'visual', 'design', 'mockup', 'diagram'];
  const codeKeywords = ['code', 'implement', 'function', 'api', 'debug', 'fix', 'build', 'develop'];

  const needsData = dataKeywords.some(k => lowerTask.includes(k));
  const needsDocuments = docKeywords.some(k => lowerTask.includes(k));
  const needsImages = imageKeywords.some(k => lowerTask.includes(k));
  const needsCode = codeKeywords.some(k => lowerTask.includes(k));

  const suggestedCategories: string[] = [];
  if (needsData) suggestedCategories.push('spreadsheet');
  if (needsDocuments) suggestedCategories.push('document');
  if (needsImages) suggestedCategories.push('image');
  if (needsCode) suggestedCategories.push('code');

  return {
    needsData,
    needsDocuments,
    needsImages,
    needsCode,
    suggestedCategories,
  };
}
