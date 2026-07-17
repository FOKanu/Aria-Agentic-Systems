// Social Media Module - Shared Mock Data & Types
// Francis Okorie Iyeke-Kanu
//
// Mock-only for now; shapes are kept close to what a Supabase table /
// provider (Buffer, Hootsuite, native platform APIs) would return so this
// can be swapped for live data later without reshaping the UI.

export type Platform = 'x' | 'linkedin' | 'instagram' | 'tiktok' | 'youtube';

export const PLATFORM_LABELS: Record<Platform, string> = {
  x: 'X (Twitter)',
  linkedin: 'LinkedIn',
  instagram: 'Instagram',
  tiktok: 'TikTok',
  youtube: 'YouTube',
};

// ---------------------------------------------------------------------------
// Content Scheduling
// ---------------------------------------------------------------------------

export type PostStatus = 'draft' | 'scheduled' | 'published' | 'failed';

export interface ScheduledPost {
  id: string;
  platform: Platform;
  content: string;
  status: PostStatus;
  scheduledFor: string; // ISO datetime
  publishedAt?: string;
  mediaType: 'text' | 'image' | 'video' | 'carousel';
  hashtags: string[];
  assignedAgent?: string;
  failureReason?: string;
  campaign?: string;
}

export const mockScheduledPosts: ScheduledPost[] = [
  {
    id: 'sp-1',
    platform: 'linkedin',
    content: 'ARIA now routes tool calls through a local Ollama sidecar before falling back to the cloud — faster, cheaper, and your data never leaves the machine unless it has to.',
    status: 'scheduled',
    scheduledFor: '2026-07-18T14:00:00',
    mediaType: 'image',
    hashtags: ['#AgenticAI', '#LocalFirst', '#DevTools'],
    assignedAgent: 'Orion',
    campaign: 'Local-First Launch',
  },
  {
    id: 'sp-2',
    platform: 'x',
    content: "New in ARIA: the Agent Rail now supports drag-to-reorder and per-agent pause/resume. Your fleet, your order. 🧵",
    status: 'scheduled',
    scheduledFor: '2026-07-17T18:30:00',
    mediaType: 'video',
    hashtags: ['#BuildInPublic', '#AIagents'],
    assignedAgent: 'Aria',
  },
  {
    id: 'sp-3',
    platform: 'instagram',
    content: 'Behind the scenes: how our Legal module drafts an NDA in under 30 seconds.',
    status: 'published',
    scheduledFor: '2026-07-15T12:00:00',
    publishedAt: '2026-07-15T12:00:00',
    mediaType: 'carousel',
    hashtags: ['#LegalTech', '#Automation'],
    assignedAgent: 'Aria',
    campaign: 'Command Center Demos',
  },
  {
    id: 'sp-4',
    platform: 'tiktok',
    content: 'POV: your compliance agent finds a GDPR gap before your lawyer does.',
    status: 'failed',
    scheduledFor: '2026-07-16T09:00:00',
    mediaType: 'video',
    hashtags: ['#Compliance', '#AITools'],
    failureReason: 'Video export exceeded 60s platform limit',
  },
  {
    id: 'sp-5',
    platform: 'youtube',
    content: 'ARIA Command Center walkthrough: multi-agent DevOps pipeline from commit to deploy.',
    status: 'draft',
    scheduledFor: '2026-07-22T16:00:00',
    mediaType: 'video',
    hashtags: ['#DevOps', '#CI/CD'],
    assignedAgent: 'Atlas',
  },
  {
    id: 'sp-6',
    platform: 'linkedin',
    content: 'We cut mean-time-to-resolution by 41% by letting agents triage before a human ever sees the ticket. Case study in the thread.',
    status: 'scheduled',
    scheduledFor: '2026-07-19T15:00:00',
    mediaType: 'text',
    hashtags: ['#CaseStudy', '#SupportOps'],
    assignedAgent: 'Sage',
  },
  {
    id: 'sp-7',
    platform: 'x',
    content: 'Shipping: Social Media module — scheduling, post generation, analytics, community, outreach, and trend monitoring, all agent-assisted.',
    status: 'draft',
    scheduledFor: '2026-07-24T13:00:00',
    mediaType: 'image',
    hashtags: ['#ProductLaunch'],
    assignedAgent: 'Aria',
    campaign: 'Social Module Launch',
  },
];

// ---------------------------------------------------------------------------
// Post Generation
// ---------------------------------------------------------------------------

export type PostTone = 'professional' | 'casual' | 'bold' | 'playful' | 'technical';

export interface PostVariant {
  id: string;
  caption: string;
  hashtags: string[];
  tone: PostTone;
  characterCount: number;
}

export interface GeneratedPost {
  id: string;
  brief: string;
  platform: Platform;
  tone: PostTone;
  createdAt: string;
  assignedAgent: string;
  variants: PostVariant[];
}

export const mockGeneratedPosts: GeneratedPost[] = [
  {
    id: 'gp-1',
    brief: 'Announce the new Social Media command center module, agent-assisted, mock-to-real data path.',
    platform: 'linkedin',
    tone: 'professional',
    createdAt: '2026-07-17T09:12:00',
    assignedAgent: 'Aria',
    variants: [
      {
        id: 'gp-1-a',
        caption: "Today we're rolling out the Social Media module inside ARIA Command Center: scheduling, post generation, analytics, community management, influencer outreach, and trend monitoring — all agent-assisted from one operator view.",
        hashtags: ['#AgenticAI', '#ProductLaunch', '#CommandCenter'],
        tone: 'professional',
        characterCount: 246,
      },
      {
        id: 'gp-1-b',
        caption: "Your social team just got six new coworkers. ARIA's Social Media module handles scheduling, drafting, listening, and outreach — you approve, agents execute.",
        hashtags: ['#AIagents', '#MarketingOps'],
        tone: 'bold',
        characterCount: 164,
      },
    ],
  },
  {
    id: 'gp-2',
    brief: 'Short, fun teaser for the Trend Monitoring page ahead of launch.',
    platform: 'x',
    tone: 'playful',
    createdAt: '2026-07-16T17:40:00',
    assignedAgent: 'Sage',
    variants: [
      {
        id: 'gp-2-a',
        caption: 'We built a page that watches the internet get excited about things so you don\'t have to. Trend Monitoring, live soon. 👀',
        hashtags: ['#ComingSoon', '#TrendWatch'],
        tone: 'playful',
        characterCount: 138,
      },
    ],
  },
];

// ---------------------------------------------------------------------------
// Analytics Dashboard
// ---------------------------------------------------------------------------

export interface EngagementPoint {
  date: string; // short label e.g. "Jul 11"
  impressions: number;
  engagements: number;
  followers: number;
}

export const engagementHistory: EngagementPoint[] = [
  { date: 'Jul 11', impressions: 18200, engagements: 940, followers: 12480 },
  { date: 'Jul 12', impressions: 21100, engagements: 1120, followers: 12512 },
  { date: 'Jul 13', impressions: 19800, engagements: 1005, followers: 12549 },
  { date: 'Jul 14', impressions: 24300, engagements: 1380, followers: 12601 },
  { date: 'Jul 15', impressions: 31200, engagements: 2210, followers: 12698 },
  { date: 'Jul 16', impressions: 27600, engagements: 1860, followers: 12744 },
  { date: 'Jul 17', impressions: 33500, engagements: 2490, followers: 12822 },
];

export interface PlatformBreakdown {
  platform: Platform;
  followers: number;
  engagementRate: number; // percent
  postsThisWeek: number;
  color: string;
}

export const platformBreakdown: PlatformBreakdown[] = [
  { platform: 'linkedin', followers: 5420, engagementRate: 4.8, postsThisWeek: 5, color: 'hsl(var(--primary))' },
  { platform: 'x', followers: 4110, engagementRate: 3.1, postsThisWeek: 9, color: 'hsl(var(--success))' },
  { platform: 'instagram', followers: 2380, engagementRate: 6.2, postsThisWeek: 4, color: 'hsl(var(--warning))' },
  { platform: 'tiktok', followers: 690, engagementRate: 8.9, postsThisWeek: 3, color: 'hsl(217 91% 60%)' },
  { platform: 'youtube', followers: 222, engagementRate: 2.4, postsThisWeek: 1, color: 'hsl(var(--muted-foreground))' },
];

export interface TopPost {
  id: string;
  platform: Platform;
  content: string;
  impressions: number;
  engagementRate: number;
  publishedAt: string;
}

export const topPosts: TopPost[] = [
  {
    id: 'top-1',
    platform: 'instagram',
    content: 'Behind the scenes: how our Legal module drafts an NDA in under 30 seconds.',
    impressions: 41200,
    engagementRate: 9.4,
    publishedAt: '2026-07-15',
  },
  {
    id: 'top-2',
    platform: 'linkedin',
    content: 'We cut mean-time-to-resolution by 41% by letting agents triage before a human ever sees the ticket.',
    impressions: 28700,
    engagementRate: 6.1,
    publishedAt: '2026-07-12',
  },
  {
    id: 'top-3',
    platform: 'x',
    content: "New in ARIA: the Agent Rail now supports drag-to-reorder and per-agent pause/resume.",
    impressions: 19600,
    engagementRate: 5.3,
    publishedAt: '2026-07-10',
  },
];

export const analyticsKpis = {
  totalImpressions: engagementHistory.reduce((sum, d) => sum + d.impressions, 0),
  totalEngagements: engagementHistory.reduce((sum, d) => sum + d.engagements, 0),
  followerGrowth: engagementHistory[engagementHistory.length - 1].followers - engagementHistory[0].followers,
  avgEngagementRate: 5.1,
};

// ---------------------------------------------------------------------------
// Community Management
// ---------------------------------------------------------------------------

export type Sentiment = 'positive' | 'neutral' | 'negative';
export type CommunityStatus = 'unread' | 'replied' | 'assigned' | 'escalated';
export type CommunityType = 'comment' | 'dm' | 'mention';

export interface CommunityItem {
  id: string;
  platform: Platform;
  type: CommunityType;
  author: string;
  handle: string;
  content: string;
  sentiment: Sentiment;
  status: CommunityStatus;
  assignedAgent?: string;
  receivedAt: string;
}

export const mockCommunityItems: CommunityItem[] = [
  {
    id: 'ci-1',
    platform: 'linkedin',
    type: 'comment',
    author: 'Priya Natarajan',
    handle: '@priyan',
    content: 'Does the local Ollama sidecar work offline entirely, or does it still phone home for routing decisions?',
    sentiment: 'neutral',
    status: 'unread',
    receivedAt: '2026-07-17T08:15:00',
  },
  {
    id: 'ci-2',
    platform: 'x',
    type: 'mention',
    author: 'Marcus Chen',
    handle: '@marcuscbuilds',
    content: "Been using @ARIA_HQ's DevOps module for two weeks — the pipeline agent caught a broken staging config before it hit prod. Genuinely impressed.",
    sentiment: 'positive',
    status: 'replied',
    assignedAgent: 'Aria',
    receivedAt: '2026-07-16T21:40:00',
  },
  {
    id: 'ci-3',
    platform: 'instagram',
    type: 'dm',
    author: 'Dana Whitfield',
    handle: '@dana.codes',
    content: "Pricing page is confusing — is the compliance module included in the base plan or an add-on?",
    sentiment: 'negative',
    status: 'assigned',
    assignedAgent: 'Sage',
    receivedAt: '2026-07-16T14:02:00',
  },
  {
    id: 'ci-4',
    platform: 'tiktok',
    type: 'comment',
    author: 'jules_builds',
    handle: '@jules_builds',
    content: 'ok but who is actually reviewing what the agent sends for signature 💀',
    sentiment: 'negative',
    status: 'escalated',
    assignedAgent: 'Cipher',
    receivedAt: '2026-07-16T11:30:00',
  },
  {
    id: 'ci-5',
    platform: 'youtube',
    type: 'comment',
    author: 'FullStackFatima',
    handle: '@fullstackfatima',
    content: 'This is the cleanest agent-rail UI I\'ve seen. Any plans for a self-hosted version?',
    sentiment: 'positive',
    status: 'unread',
    receivedAt: '2026-07-15T19:55:00',
  },
  {
    id: 'ci-6',
    platform: 'linkedin',
    type: 'dm',
    author: 'Grace Oyelaran',
    handle: '@grace-oyelaran',
    content: 'Interested in an enterprise demo for our legal + compliance team, 40 seats.',
    sentiment: 'positive',
    status: 'assigned',
    assignedAgent: 'Orion',
    receivedAt: '2026-07-15T10:20:00',
  },
];

// ---------------------------------------------------------------------------
// Influencer Outreach
// ---------------------------------------------------------------------------

export type OutreachStage = 'identified' | 'contacted' | 'negotiating' | 'active';

export interface InfluencerProspect {
  id: string;
  name: string;
  handle: string;
  platform: Platform;
  followers: number;
  engagementRate: number;
  stage: OutreachStage;
  campaignTags: string[];
  notes: string;
  lastContact?: string;
  assignedAgent?: string;
}

export const mockInfluencerProspects: InfluencerProspect[] = [
  {
    id: 'inf-1',
    name: 'Devon Marsh',
    handle: '@devonshipsit',
    platform: 'youtube',
    followers: 184000,
    engagementRate: 5.6,
    stage: 'active',
    campaignTags: ['Dev Tools', 'AI Agents'],
    notes: 'Publishing a 15-min ARIA walkthrough in exchange for 6-month Team plan. Draft script approved.',
    lastContact: '2026-07-14',
    assignedAgent: 'Orion',
  },
  {
    id: 'inf-2',
    name: 'Sasha Okafor',
    handle: '@sashabuildsAI',
    platform: 'x',
    followers: 61200,
    engagementRate: 4.1,
    stage: 'negotiating',
    campaignTags: ['AI Agents', 'Indie Hackers'],
    notes: 'Asked for a custom affiliate link + revenue share instead of flat fee. Countered with 20% for 90 days.',
    lastContact: '2026-07-16',
    assignedAgent: 'Aria',
  },
  {
    id: 'inf-3',
    name: 'Legal Tech Weekly',
    handle: '@legaltechweekly',
    platform: 'linkedin',
    followers: 38500,
    engagementRate: 3.4,
    stage: 'contacted',
    campaignTags: ['Legal Tech', 'Newsletter'],
    notes: 'Pitched a sponsored deep-dive on the NDA Generator + Compliance modules. Awaiting rate card.',
    lastContact: '2026-07-15',
    assignedAgent: 'Sage',
  },
  {
    id: 'inf-4',
    name: 'Rosa Fields',
    handle: '@rosa.ships.code',
    platform: 'tiktok',
    followers: 92300,
    engagementRate: 7.8,
    stage: 'identified',
    campaignTags: ['Short-form', 'Gen Z Dev'],
    notes: 'High engagement on AI-agent explainer content. No outreach sent yet — queued for this week.',
  },
  {
    id: 'inf-5',
    name: 'The Ops Room',
    handle: '@theopsroom',
    platform: 'youtube',
    followers: 27400,
    engagementRate: 4.9,
    stage: 'identified',
    campaignTags: ['DevOps', 'SRE'],
    notes: 'Covers CI/CD tooling comparisons. Good fit for the DevOps module case study.',
  },
];

// ---------------------------------------------------------------------------
// Trend Monitoring
// ---------------------------------------------------------------------------

export type TrendVelocity = 'rising' | 'hot' | 'steady' | 'declining';

export interface Trend {
  id: string;
  topic: string;
  hashtag: string;
  platform: Platform;
  velocity: TrendVelocity;
  relevanceScore: number; // 0-100, relevance to our brand/product
  volume: number; // mentions in last 24h
  category: string;
}

export const mockTrends: Trend[] = [
  {
    id: 'tr-1',
    topic: 'Local-first AI agents',
    hashtag: '#LocalFirstAI',
    platform: 'x',
    velocity: 'hot',
    relevanceScore: 96,
    volume: 8400,
    category: 'AI / Dev Tools',
  },
  {
    id: 'tr-2',
    topic: 'Agent orchestration frameworks',
    hashtag: '#AgentOps',
    platform: 'linkedin',
    velocity: 'rising',
    relevanceScore: 91,
    volume: 3100,
    category: 'AI / Dev Tools',
  },
  {
    id: 'tr-3',
    topic: 'AI in compliance & legal ops',
    hashtag: '#LegalTech',
    platform: 'linkedin',
    velocity: 'steady',
    relevanceScore: 78,
    volume: 1900,
    category: 'Legal Tech',
  },
  {
    id: 'tr-4',
    topic: 'Build-in-public dev logs',
    hashtag: '#BuildInPublic',
    platform: 'x',
    velocity: 'steady',
    relevanceScore: 72,
    volume: 12600,
    category: 'Community',
  },
  {
    id: 'tr-5',
    topic: 'Multi-agent demo reels',
    hashtag: '#AIagents',
    platform: 'tiktok',
    velocity: 'rising',
    relevanceScore: 84,
    volume: 5200,
    category: 'AI / Dev Tools',
  },
  {
    id: 'tr-6',
    topic: 'No-code automation backlash',
    hashtag: '#NoCode',
    platform: 'x',
    velocity: 'declining',
    relevanceScore: 41,
    volume: 2200,
    category: 'Automation',
  },
];

// ---------------------------------------------------------------------------
// Shared: agent hints per capability (used for "Ask Agent" affordances)
// ---------------------------------------------------------------------------

export const socialAgentHints: Record<string, string> = {
  scheduling: 'Orion',
  posts: 'Aria',
  analytics: 'Sage',
  community: 'Cipher',
  outreach: 'Orion',
  trends: 'Sage',
};
