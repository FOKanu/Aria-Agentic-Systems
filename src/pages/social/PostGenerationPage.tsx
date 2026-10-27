// Post Generation Page - Social Media Module
import { useState } from 'react';
import { useCapabilityNav } from '@/hooks/useCapabilityNav';
import {
  Megaphone, Sparkles, Copy, Send, CheckCircle, Bot, Wand2,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import { askAgent } from '@/lib/agentActions';
import {
  mockGeneratedPosts, PLATFORM_LABELS,
  type Platform, type PostTone, type PostVariant,
} from './mockData';

const tones: { id: PostTone; label: string }[] = [
  { id: 'professional', label: 'Professional' },
  { id: 'casual', label: 'Casual' },
  { id: 'bold', label: 'Bold' },
  { id: 'playful', label: 'Playful' },
  { id: 'technical', label: 'Technical' },
];

function buildVariants(brief: string, tone: PostTone, platform: Platform): PostVariant[] {
  const base = brief.trim() || 'New product update from ARIA';
  const platformTag = platform === 'x' ? '#BuildInPublic' : platform === 'linkedin' ? '#AgenticAI' : '#ARIA';
  const templates: Record<PostTone, string> = {
    professional: `${base}. Here's what changed and why it matters for your workflow.`,
    casual: `Quick update — ${base.toLowerCase()}. Thought you'd want to know.`,
    bold: `${base}. This changes how your team ships. Full stop.`,
    playful: `Plot twist: ${base.toLowerCase()} 👀`,
    technical: `Changelog: ${base}. Details, tradeoffs, and rollout plan below.`,
  };
  const caption1 = templates[tone];
  const caption2 = `${base} — now live across the ARIA Command Center. Try it and tell us what breaks.`;
  return [
    {
      id: `v-${Date.now()}-a`,
      caption: caption1,
      hashtags: [platformTag, '#ProductUpdate'],
      tone,
      characterCount: caption1.length,
    },
    {
      id: `v-${Date.now()}-b`,
      caption: caption2,
      hashtags: [platformTag, '#AIagents'],
      tone,
      characterCount: caption2.length,
    },
  ];
}

export default function PostGenerationPage() {
  const nav = useCapabilityNav();
  const [brief, setBrief] = useState('');
  const [platform, setPlatform] = useState<Platform>('linkedin');
  const [tone, setTone] = useState<PostTone>('professional');
  const [isGenerating, setIsGenerating] = useState(false);
  const [variants, setVariants] = useState<PostVariant[]>([]);
  const [recentGenerations] = useState(mockGeneratedPosts);

  const handleGenerate = async () => {
    if (!brief.trim()) {
      toast.error('Add a brief so an agent knows what to draft');
      return;
    }
    setIsGenerating(true);
    await new Promise((resolve) => setTimeout(resolve, 1400));
    setVariants(buildVariants(brief, tone, platform));
    setIsGenerating(false);
    toast.success('Draft variants ready for review');
  };

  const handleCopy = (caption: string) => {
    navigator.clipboard.writeText(caption);
    toast.success('Caption copied to clipboard');
  };

  const handleSaveToSchedule = (variant: PostVariant) => {
    toast.success('Saved to schedule', {
      description: `${PLATFORM_LABELS[platform]} · ${variant.caption.slice(0, 60)}...`,
    });
    nav('social-scheduling');
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold font-display text-foreground">Post Generation</h1>
          <p className="text-muted-foreground text-sm">Turn a brief into platform-ready drafts with AI assistance</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Form Section */}
        <div className="lg:col-span-2 space-y-6">
          <Card className="bg-card/50 border-border/50">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg">Brief</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>What's this post about?</Label>
                <Textarea
                  placeholder="e.g. Announce the new Trend Monitoring page, launching this week, agent-assisted relevance scoring..."
                  value={brief}
                  onChange={(e) => setBrief(e.target.value)}
                  rows={3}
                />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Target Platform</Label>
                  <Select value={platform} onValueChange={(v) => setPlatform(v as Platform)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {Object.entries(PLATFORM_LABELS).map(([id, label]) => (
                        <SelectItem key={id} value={id}>{label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Tone</Label>
                  <Select value={tone} onValueChange={(v) => setTone(v as PostTone)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {tones.map((t) => (
                        <SelectItem key={t.id} value={t.id}>{t.label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>

          <Button
            onClick={handleGenerate}
            disabled={isGenerating}
            className="w-full gap-2"
            size="lg"
          >
            {isGenerating ? (
              <>
                <Sparkles className="h-5 w-5 animate-pulse" />
                Generating drafts...
              </>
            ) : (
              <>
                <Wand2 className="h-5 w-5" />
                Generate Variants
              </>
            )}
          </Button>

          {/* Generated Variants */}
          {variants.length > 0 && (
            <div className="space-y-4">
              {variants.map((variant, i) => (
                <Card key={variant.id} className="bg-card/50 border-border/50">
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-base flex items-center gap-2">
                        Variant {i + 1}
                        <Badge variant="secondary" className="text-xs capitalize">{variant.tone}</Badge>
                      </CardTitle>
                      <span className="text-xs text-muted-foreground">{variant.characterCount} chars</span>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <p className="text-sm text-foreground bg-muted/30 p-3 rounded-lg">{variant.caption}</p>
                    <div className="flex flex-wrap gap-1">
                      {variant.hashtags.map((tag) => (
                        <Badge key={tag} variant="outline" className="text-xs">{tag}</Badge>
                      ))}
                    </div>
                    <div className="flex gap-2 pt-1">
                      <Button variant="outline" size="sm" className="gap-2" onClick={() => handleCopy(variant.caption)}>
                        <Copy className="h-4 w-4" />
                        Copy
                      </Button>
                      <Button size="sm" className="gap-2" onClick={() => handleSaveToSchedule(variant)}>
                        <Send className="h-4 w-4" />
                        Save to Schedule
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          <Card className="bg-card/50 border-border/50">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg">Recent Generations</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {recentGenerations.map((gen) => (
                <div key={gen.id} className="p-3 rounded-lg bg-muted/30">
                  <div className="flex items-center justify-between gap-2">
                    <p className="font-medium text-foreground text-sm truncate">{gen.brief}</p>
                  </div>
                  <div className="flex items-center gap-2 mt-2 flex-wrap">
                    <Badge variant="secondary" className="text-xs">{PLATFORM_LABELS[gen.platform]}</Badge>
                    <Badge variant="outline" className="text-xs">{gen.variants.length} variants</Badge>
                  </div>
                  <span className="flex items-center gap-1 text-primary text-xs mt-2">
                    <Bot className="w-3 h-3" />
                    {gen.assignedAgent}
                  </span>
                </div>
              ))}
            </CardContent>
          </Card>

          <Card className="bg-card/50 border-border/50">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg flex items-center gap-2">
                <Megaphone className="w-5 h-5 text-primary" />
                Ask an Agent
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <p className="text-sm text-muted-foreground">
                Hand this brief to Aria for full drafting, or Sage for a data-backed angle.
              </p>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  className="flex-1"
                  onClick={() => askAgent('Aria', brief || 'Draft a new social post')}
                >
                  Ask Aria
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="flex-1"
                  onClick={() => askAgent('Sage', brief || 'Draft a new social post')}
                >
                  Ask Sage
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-card/50 border-border/50">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg">Quick Tips</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3 text-sm text-muted-foreground">
                <div className="flex items-start gap-2">
                  <CheckCircle className="h-4 w-4 text-emerald-400 mt-0.5 shrink-0" />
                  <p>Keep briefs specific — mention the feature, the audience, and the outcome</p>
                </div>
                <div className="flex items-start gap-2">
                  <CheckCircle className="h-4 w-4 text-emerald-400 mt-0.5 shrink-0" />
                  <p>Generate 2-3 variants and A/B test on lower-stakes platforms first</p>
                </div>
                <div className="flex items-start gap-2">
                  <CheckCircle className="h-4 w-4 text-emerald-400 mt-0.5 shrink-0" />
                  <p>Technical tone performs best on LinkedIn and YouTube</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
