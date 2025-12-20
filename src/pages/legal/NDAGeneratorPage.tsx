import { useState } from 'react';
import { FileText, Sparkles, Download, Send, Copy, Eye, Settings, CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { toast } from 'sonner';

interface NDATemplate {
  id: string;
  name: string;
  type: 'mutual' | 'one-way-disclosing' | 'one-way-receiving';
  description: string;
  useCases: string[];
}

const templates: NDATemplate[] = [
  {
    id: 'mutual',
    name: 'Mutual NDA',
    type: 'mutual',
    description: 'Both parties share and protect confidential information',
    useCases: ['Partnerships', 'Joint ventures', 'Business discussions'],
  },
  {
    id: 'one-way-disc',
    name: 'One-Way (Disclosing)',
    type: 'one-way-disclosing',
    description: 'You share confidential information with the other party',
    useCases: ['Investor pitches', 'Vendor evaluations', 'Consultant engagements'],
  },
  {
    id: 'one-way-recv',
    name: 'One-Way (Receiving)',
    type: 'one-way-receiving',
    description: 'Other party shares confidential information with you',
    useCases: ['Due diligence', 'Acquisition targets', 'Partnership evaluation'],
  },
];

const recentNDAs = [
  { id: '1', name: 'TechCorp Partnership NDA', created: '2024-12-18', status: 'signed' },
  { id: '2', name: 'Investor Discussion NDA', created: '2024-12-15', status: 'pending' },
  { id: '3', name: 'Consultant Engagement NDA', created: '2024-12-10', status: 'signed' },
  { id: '4', name: 'Vendor Evaluation NDA', created: '2024-12-05', status: 'draft' },
];

export default function NDAGeneratorPage() {
  const [selectedTemplate, setSelectedTemplate] = useState<string>('mutual');
  const [formData, setFormData] = useState({
    disclosingParty: '',
    receivingParty: '',
    purpose: '',
    duration: '2',
    jurisdiction: 'delaware',
    includeNonSolicit: false,
    includeNonCompete: false,
    customTerms: '',
  });
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedNDA, setGeneratedNDA] = useState<string | null>(null);

  const handleGenerate = async () => {
    setIsGenerating(true);
    // Simulate AI generation
    await new Promise(resolve => setTimeout(resolve, 2000));
    setGeneratedNDA(`
NON-DISCLOSURE AGREEMENT

This Non-Disclosure Agreement ("Agreement") is entered into as of ${new Date().toLocaleDateString()}, by and between:

DISCLOSING PARTY: ${formData.disclosingParty || '[Disclosing Party Name]'}
RECEIVING PARTY: ${formData.receivingParty || '[Receiving Party Name]'}

1. PURPOSE
The parties wish to explore a potential business relationship concerning ${formData.purpose || '[Purpose]'} ("Purpose").

2. CONFIDENTIAL INFORMATION
"Confidential Information" means any non-public information disclosed by either party to the other...

3. OBLIGATIONS
The Receiving Party agrees to:
(a) Hold all Confidential Information in strict confidence;
(b) Not disclose Confidential Information to any third parties;
(c) Use Confidential Information only for the Purpose...

4. TERM
This Agreement shall remain in effect for ${formData.duration} years from the date of execution.

5. GOVERNING LAW
This Agreement shall be governed by the laws of the State of ${formData.jurisdiction === 'delaware' ? 'Delaware' : formData.jurisdiction === 'california' ? 'California' : 'New York'}.

${formData.includeNonSolicit ? '\n6. NON-SOLICITATION\nDuring the term and for one year thereafter, neither party shall solicit employees of the other party...' : ''}

${formData.includeNonCompete ? '\n7. NON-COMPETE\nDuring the term, the Receiving Party agrees not to engage in any business that directly competes with the Disclosing Party...' : ''}

${formData.customTerms ? `\nADDITIONAL TERMS:\n${formData.customTerms}` : ''}

IN WITNESS WHEREOF, the parties have executed this Agreement as of the date first written above.

_______________________          _______________________
${formData.disclosingParty || '[Disclosing Party]'}                    ${formData.receivingParty || '[Receiving Party]'}
    `);
    setIsGenerating(false);
    toast.success('NDA generated successfully!');
  };

  const handleCopy = () => {
    if (generatedNDA) {
      navigator.clipboard.writeText(generatedNDA);
      toast.success('NDA copied to clipboard');
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold font-display text-foreground">NDA Generator</h1>
          <p className="text-muted-foreground text-sm">Generate customized NDAs with AI assistance</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Form Section */}
        <div className="lg:col-span-2 space-y-6">
          {/* Template Selection */}
          <Card className="bg-card/50 border-border/50">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg">Select Template</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                {templates.map(template => (
                  <div
                    key={template.id}
                    onClick={() => setSelectedTemplate(template.id)}
                    className={`p-4 rounded-lg border cursor-pointer transition-all ${
                      selectedTemplate === template.id
                        ? 'border-primary bg-primary/5'
                        : 'border-border hover:border-primary/50'
                    }`}
                  >
                    <div className="flex items-center gap-2 mb-2">
                      <FileText className="h-5 w-5 text-primary" />
                      <h3 className="font-medium text-foreground text-sm">{template.name}</h3>
                    </div>
                    <p className="text-xs text-muted-foreground mb-2">{template.description}</p>
                    <div className="flex flex-wrap gap-1">
                      {template.useCases.slice(0, 2).map((useCase, i) => (
                        <Badge key={i} variant="secondary" className="text-xs">
                          {useCase}
                        </Badge>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Party Information */}
          <Card className="bg-card/50 border-border/50">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg">Party Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Disclosing Party</Label>
                  <Input
                    placeholder="Company or individual name"
                    value={formData.disclosingParty}
                    onChange={(e) => setFormData({ ...formData, disclosingParty: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Receiving Party</Label>
                  <Input
                    placeholder="Company or individual name"
                    value={formData.receivingParty}
                    onChange={(e) => setFormData({ ...formData, receivingParty: e.target.value })}
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label>Purpose of Disclosure</Label>
                <Textarea
                  placeholder="Describe the business purpose for sharing confidential information..."
                  value={formData.purpose}
                  onChange={(e) => setFormData({ ...formData, purpose: e.target.value })}
                  rows={2}
                />
              </div>
            </CardContent>
          </Card>

          {/* Terms Configuration */}
          <Card className="bg-card/50 border-border/50">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg">Terms Configuration</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Duration (Years)</Label>
                  <Select
                    value={formData.duration}
                    onValueChange={(value) => setFormData({ ...formData, duration: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="1">1 Year</SelectItem>
                      <SelectItem value="2">2 Years</SelectItem>
                      <SelectItem value="3">3 Years</SelectItem>
                      <SelectItem value="5">5 Years</SelectItem>
                      <SelectItem value="perpetual">Perpetual</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Governing Law</Label>
                  <Select
                    value={formData.jurisdiction}
                    onValueChange={(value) => setFormData({ ...formData, jurisdiction: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="delaware">Delaware</SelectItem>
                      <SelectItem value="california">California</SelectItem>
                      <SelectItem value="new-york">New York</SelectItem>
                      <SelectItem value="texas">Texas</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="space-y-4 pt-2">
                <div className="flex items-center justify-between">
                  <div>
                    <Label>Include Non-Solicitation Clause</Label>
                    <p className="text-xs text-muted-foreground">Prevent hiring each other's employees</p>
                  </div>
                  <Switch
                    checked={formData.includeNonSolicit}
                    onCheckedChange={(checked) => setFormData({ ...formData, includeNonSolicit: checked })}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <Label>Include Non-Compete Clause</Label>
                    <p className="text-xs text-muted-foreground">Restrict competing business activities</p>
                  </div>
                  <Switch
                    checked={formData.includeNonCompete}
                    onCheckedChange={(checked) => setFormData({ ...formData, includeNonCompete: checked })}
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label>Custom Terms (Optional)</Label>
                <Textarea
                  placeholder="Add any additional terms or special conditions..."
                  value={formData.customTerms}
                  onChange={(e) => setFormData({ ...formData, customTerms: e.target.value })}
                  rows={3}
                />
              </div>
            </CardContent>
          </Card>

          {/* Generate Button */}
          <Button
            onClick={handleGenerate}
            disabled={isGenerating}
            className="w-full gap-2"
            size="lg"
          >
            {isGenerating ? (
              <>
                <Sparkles className="h-5 w-5 animate-pulse" />
                Generating NDA...
              </>
            ) : (
              <>
                <Sparkles className="h-5 w-5" />
                Generate NDA
              </>
            )}
          </Button>

          {/* Generated NDA Preview */}
          {generatedNDA && (
            <Card className="bg-card/50 border-border/50">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg">Generated NDA</CardTitle>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm" onClick={handleCopy}>
                      <Copy className="h-4 w-4 mr-2" />
                      Copy
                    </Button>
                    <Button variant="outline" size="sm">
                      <Download className="h-4 w-4 mr-2" />
                      Download
                    </Button>
                    <Button size="sm">
                      <Send className="h-4 w-4 mr-2" />
                      Send for Signature
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-[400px]">
                  <pre className="text-sm text-foreground whitespace-pre-wrap font-mono bg-muted/30 p-4 rounded-lg">
                    {generatedNDA}
                  </pre>
                </ScrollArea>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Recent NDAs */}
          <Card className="bg-card/50 border-border/50">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg">Recent NDAs</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {recentNDAs.map(nda => (
                  <div key={nda.id} className="flex items-center justify-between p-3 rounded-lg bg-muted/30">
                    <div>
                      <p className="font-medium text-foreground text-sm">{nda.name}</p>
                      <p className="text-xs text-muted-foreground">{nda.created}</p>
                    </div>
                    <Badge
                      variant="outline"
                      className={
                        nda.status === 'signed' ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30' :
                        nda.status === 'pending' ? 'bg-amber-500/20 text-amber-400 border-amber-500/30' :
                        'bg-muted text-muted-foreground border-border'
                      }
                    >
                      {nda.status === 'signed' && <CheckCircle className="h-3 w-3 mr-1" />}
                      {nda.status}
                    </Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Tips */}
          <Card className="bg-card/50 border-border/50">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg flex items-center gap-2">
                <Settings className="h-5 w-5 text-primary" />
                Quick Tips
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3 text-sm text-muted-foreground">
                <div className="flex items-start gap-2">
                  <CheckCircle className="h-4 w-4 text-emerald-400 mt-0.5 shrink-0" />
                  <p>Use Mutual NDAs for balanced partnerships</p>
                </div>
                <div className="flex items-start gap-2">
                  <CheckCircle className="h-4 w-4 text-emerald-400 mt-0.5 shrink-0" />
                  <p>2-3 years is standard for most business NDAs</p>
                </div>
                <div className="flex items-start gap-2">
                  <CheckCircle className="h-4 w-4 text-emerald-400 mt-0.5 shrink-0" />
                  <p>Delaware is preferred for business agreements</p>
                </div>
                <div className="flex items-start gap-2">
                  <CheckCircle className="h-4 w-4 text-emerald-400 mt-0.5 shrink-0" />
                  <p>Be specific about the purpose to limit scope</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}