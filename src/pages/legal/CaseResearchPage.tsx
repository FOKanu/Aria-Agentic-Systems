// Case Research Page - Francis Okorie Iyeke-Kanu
import { useState } from 'react';
import { Search, BookOpen, Scale, FileText, Bookmark, Clock, ExternalLink, Sparkles, Filter, Download, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';

interface CaseResult {
  id: string;
  title: string;
  citation: string;
  court: string;
  date: string;
  jurisdiction: string;
  summary: string;
  relevanceScore: number;
  keyTopics: string[];
  isBookmarked: boolean;
}

interface ResearchProject {
  id: string;
  name: string;
  query: string;
  createdAt: string;
  caseCount: number;
  status: 'active' | 'completed';
}

const mockResults: CaseResult[] = [
  {
    id: '1',
    title: 'Alice Corp. v. CLS Bank International',
    citation: '573 U.S. 208 (2014)',
    court: 'Supreme Court of the United States',
    date: '2014-06-19',
    jurisdiction: 'Federal',
    summary: 'The Court held that abstract ideas are not patentable under 35 U.S.C. § 101, and that implementing an abstract idea on a generic computer does not make it patentable.',
    relevanceScore: 95,
    keyTopics: ['Patent Eligibility', 'Software Patents', 'Abstract Ideas'],
    isBookmarked: true,
  },
  {
    id: '2',
    title: 'Bilski v. Kappos',
    citation: '561 U.S. 593 (2010)',
    court: 'Supreme Court of the United States',
    date: '2010-06-28',
    jurisdiction: 'Federal',
    summary: 'Business method patents are not categorically outside of patent protection. The machine-or-transformation test is not the sole test for patent eligibility.',
    relevanceScore: 88,
    keyTopics: ['Business Methods', 'Patent Eligibility', 'Machine-or-Transformation'],
    isBookmarked: false,
  },
  {
    id: '3',
    title: 'Mayo Collaborative Services v. Prometheus Laboratories',
    citation: '566 U.S. 66 (2012)',
    court: 'Supreme Court of the United States',
    date: '2012-03-20',
    jurisdiction: 'Federal',
    summary: 'Claims that merely recite laws of nature are not patentable. The claims at issue do not add enough to make them patent-eligible applications of natural laws.',
    relevanceScore: 82,
    keyTopics: ['Laws of Nature', 'Medical Diagnostics', 'Patent Eligibility'],
    isBookmarked: false,
  },
  {
    id: '4',
    title: 'Diamond v. Diehr',
    citation: '450 U.S. 175 (1981)',
    court: 'Supreme Court of the United States',
    date: '1981-03-03',
    jurisdiction: 'Federal',
    summary: 'A process that uses a computer program to calculate the cure time for rubber may be patentable if the claim as a whole produces a physical result.',
    relevanceScore: 75,
    keyTopics: ['Process Patents', 'Computer Programs', 'Physical Transformation'],
    isBookmarked: true,
  },
];

const mockProjects: ResearchProject[] = [
  {
    id: '1',
    name: 'Software Patent Eligibility',
    query: 'software patent eligibility 35 USC 101',
    createdAt: '2024-12-15',
    caseCount: 24,
    status: 'active',
  },
  {
    id: '2',
    name: 'Trade Secret Misappropriation',
    query: 'trade secret misappropriation DTSA',
    createdAt: '2024-12-10',
    caseCount: 18,
    status: 'active',
  },
  {
    id: '3',
    name: 'Non-Compete Enforceability',
    query: 'non-compete agreement enforceability',
    createdAt: '2024-11-28',
    caseCount: 32,
    status: 'completed',
  },
];

const recentSearches = [
  'patent infringement damages calculation',
  'GDPR compliance enforcement actions',
  'trade secret injunctive relief',
  'software licensing disputes',
];

export default function CaseResearchPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [results, setResults] = useState<CaseResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [jurisdictionFilter, setJurisdictionFilter] = useState<string>('all');
  const [projects] = useState<ResearchProject[]>(mockProjects);

  const handleSearch = async () => {
    if (!searchQuery.trim()) return;
    
    setIsSearching(true);
    // Simulate AI search
    await new Promise(resolve => setTimeout(resolve, 1500));
    setResults(mockResults);
    setIsSearching(false);
    toast.success(`Found ${mockResults.length} relevant cases`);
  };

  const toggleBookmark = (id: string) => {
    setResults(results.map(r => 
      r.id === id ? { ...r, isBookmarked: !r.isBookmarked } : r
    ));
    toast.success('Bookmark updated');
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold font-display text-foreground">Case Research</h1>
          <p className="text-muted-foreground text-sm">AI-powered legal precedent research</p>
        </div>
        <Button className="gap-2">
          <Plus className="h-4 w-4" />
          New Research Project
        </Button>
      </div>

      {/* Search Section */}
      <Card className="bg-card/50 border-border/50">
        <CardContent className="p-6">
          <div className="space-y-4">
            <div className="flex gap-3">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                <Input
                  placeholder="Search legal cases, statutes, or describe your research question..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                  className="pl-11 h-12 text-base"
                />
              </div>
              <Button onClick={handleSearch} disabled={isSearching} className="h-12 px-6 gap-2">
                {isSearching ? (
                  <>
                    <Sparkles className="h-5 w-5 animate-pulse" />
                    Researching...
                  </>
                ) : (
                  <>
                    <Sparkles className="h-5 w-5" />
                    Research
                  </>
                )}
              </Button>
            </div>
            
            {/* Recent Searches */}
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-sm text-muted-foreground">Recent:</span>
              {recentSearches.map((search, i) => (
                <Badge
                  key={i}
                  variant="secondary"
                  className="cursor-pointer hover:bg-primary/20"
                  onClick={() => setSearchQuery(search)}
                >
                  {search}
                </Badge>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Sidebar */}
        <div className="space-y-6">
          {/* Research Projects */}
          <Card className="bg-card/50 border-border/50">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg flex items-center gap-2">
                <BookOpen className="h-5 w-5 text-primary" />
                Research Projects
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {projects.map(project => (
                  <div
                    key={project.id}
                    className="p-3 rounded-lg bg-muted/30 hover:bg-muted/50 cursor-pointer transition-colors"
                  >
                    <div className="flex items-center justify-between">
                      <p className="font-medium text-foreground text-sm">{project.name}</p>
                      <Badge
                        variant="outline"
                        className={project.status === 'active' 
                          ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30' 
                          : 'bg-muted text-muted-foreground border-border'
                        }
                      >
                        {project.status}
                      </Badge>
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">{project.caseCount} cases saved</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Filters */}
          <Card className="bg-card/50 border-border/50">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg flex items-center gap-2">
                <Filter className="h-5 w-5 text-primary" />
                Filters
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm text-muted-foreground">Jurisdiction</label>
                <Select value={jurisdictionFilter} onValueChange={setJurisdictionFilter}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Jurisdictions</SelectItem>
                    <SelectItem value="federal">Federal</SelectItem>
                    <SelectItem value="state">State Courts</SelectItem>
                    <SelectItem value="international">International</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <label className="text-sm text-muted-foreground">Date Range</label>
                <Select defaultValue="all">
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Time</SelectItem>
                    <SelectItem value="1year">Last Year</SelectItem>
                    <SelectItem value="5years">Last 5 Years</SelectItem>
                    <SelectItem value="10years">Last 10 Years</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <label className="text-sm text-muted-foreground">Court Level</label>
                <Select defaultValue="all">
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Courts</SelectItem>
                    <SelectItem value="supreme">Supreme Court</SelectItem>
                    <SelectItem value="appellate">Appellate Courts</SelectItem>
                    <SelectItem value="district">District Courts</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Results */}
        <div className="lg:col-span-3">
          {results.length > 0 ? (
            <Card className="bg-card/50 border-border/50">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg">
                    Search Results ({results.length} cases)
                  </CardTitle>
                  <Button variant="outline" size="sm" className="gap-2">
                    <Download className="h-4 w-4" />
                    Export
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-[600px]">
                  <div className="space-y-4">
                    {results.map(result => (
                      <Card key={result.id} className="bg-muted/30 border-border/50">
                        <CardContent className="p-4">
                          <div className="flex items-start justify-between gap-4">
                            <div className="flex-1">
                              <div className="flex items-center gap-2 flex-wrap">
                                <h3 className="font-semibold text-foreground hover:text-primary cursor-pointer">
                                  {result.title}
                                </h3>
                                <Badge variant="secondary" className="text-xs">
                                  {result.relevanceScore}% match
                                </Badge>
                              </div>
                              <div className="flex items-center gap-3 mt-1 text-sm text-muted-foreground">
                                <span className="flex items-center gap-1">
                                  <Scale className="h-3 w-3" />
                                  {result.court}
                                </span>
                                <span>{result.citation}</span>
                                <span>{new Date(result.date).toLocaleDateString()}</span>
                              </div>
                              <p className="text-sm text-foreground/80 mt-3 leading-relaxed">
                                {result.summary}
                              </p>
                              <div className="flex items-center gap-2 mt-3 flex-wrap">
                                {result.keyTopics.map((topic, i) => (
                                  <Badge key={i} variant="outline" className="text-xs">
                                    {topic}
                                  </Badge>
                                ))}
                              </div>
                            </div>
                            <div className="flex flex-col gap-2">
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => toggleBookmark(result.id)}
                                className={result.isBookmarked ? 'text-primary' : 'text-muted-foreground'}
                              >
                                <Bookmark className={`h-5 w-5 ${result.isBookmarked ? 'fill-current' : ''}`} />
                              </Button>
                              <Button variant="ghost" size="icon">
                                <ExternalLink className="h-5 w-5" />
                              </Button>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </ScrollArea>
              </CardContent>
            </Card>
          ) : (
            <Card className="bg-card/50 border-border/50">
              <CardContent className="flex flex-col items-center justify-center py-16">
                <Scale className="h-16 w-16 text-muted-foreground/30 mb-4" />
                <h3 className="text-lg font-medium text-foreground mb-2">Start Your Research</h3>
                <p className="text-muted-foreground text-center max-w-md">
                  Enter a legal question, case citation, or topic above to search through thousands of legal precedents with AI-powered relevance ranking.
                </p>
                <div className="flex gap-3 mt-6">
                  <Button variant="outline" onClick={() => setSearchQuery('software patent eligibility')}>
                    Try: Software Patents
                  </Button>
                  <Button variant="outline" onClick={() => setSearchQuery('trade secret misappropriation')}>
                    Try: Trade Secrets
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}