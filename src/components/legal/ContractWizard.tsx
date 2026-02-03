import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Progress } from '@/components/ui/progress';
import { Card, CardContent } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { 
  FileText, ChevronRight, ChevronLeft, Sparkles, Bot, 
  Globe, Shield, AlertTriangle, CheckCircle, Scale
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

interface ContractWizardProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onComplete: (contract: ContractDraft) => void;
}

export interface ContractDraft {
  id: string;
  title: string;
  type: string;
  jurisdiction: string;
  governingLaw: string;
  riskTolerance: 'conservative' | 'moderate' | 'aggressive';
  party1: string;
  party2: string;
  startDate: string;
  endDate?: string;
  value?: number;
  specialTerms: string;
  selectedAgents: string[];
  clauses: string[];
}

const contractTypes = [
  { id: 'service', name: 'Service Agreement', description: 'B2B service contracts', icon: FileText },
  { id: 'employment', name: 'Employment Contract', description: 'Hiring agreements', icon: FileText },
  { id: 'nda', name: 'Non-Disclosure Agreement', description: 'Confidentiality protection', icon: Shield },
  { id: 'license', name: 'License Agreement', description: 'IP & software licensing', icon: FileText },
  { id: 'partnership', name: 'Partnership Agreement', description: 'Business partnerships', icon: FileText },
  { id: 'consulting', name: 'Consulting Agreement', description: 'Professional consulting', icon: FileText },
];

const jurisdictions = [
  { id: 'us-de', name: 'Delaware, USA', flag: '🇺🇸' },
  { id: 'us-ca', name: 'California, USA', flag: '🇺🇸' },
  { id: 'us-ny', name: 'New York, USA', flag: '🇺🇸' },
  { id: 'uk', name: 'United Kingdom', flag: '🇬🇧' },
  { id: 'eu-de', name: 'Germany (EU)', flag: '🇩🇪' },
  { id: 'eu-fr', name: 'France (EU)', flag: '🇫🇷' },
  { id: 'sg', name: 'Singapore', flag: '🇸🇬' },
  { id: 'hk', name: 'Hong Kong', flag: '🇭🇰' },
];

const agents = [
  { id: 'aria', name: 'Aria', specialty: 'Communications', description: 'Drafts clear, professional language' },
  { id: 'sage', name: 'Sage', specialty: 'Researcher', description: 'Researches legal precedents' },
  { id: 'cipher', name: 'Cipher', specialty: 'Security', description: 'Reviews security clauses' },
];

const standardClauses = [
  { id: 'liability', name: 'Limitation of Liability', recommended: true },
  { id: 'indemnity', name: 'Indemnification', recommended: true },
  { id: 'termination', name: 'Termination Clause', recommended: true },
  { id: 'confidentiality', name: 'Confidentiality', recommended: true },
  { id: 'ip', name: 'Intellectual Property', recommended: false },
  { id: 'force-majeure', name: 'Force Majeure', recommended: false },
  { id: 'dispute', name: 'Dispute Resolution', recommended: true },
  { id: 'non-compete', name: 'Non-Compete', recommended: false },
];

const STEPS = [
  { id: 1, title: 'Contract Type', description: 'Select the type of contract' },
  { id: 2, title: 'Jurisdiction', description: 'Choose governing law' },
  { id: 3, title: 'Business Context', description: 'Define parties and terms' },
  { id: 4, title: 'Risk & Clauses', description: 'Set risk tolerance' },
  { id: 5, title: 'AI Generation', description: 'Generate with AI agents' },
];

export function ContractWizard({ open, onOpenChange, onComplete }: ContractWizardProps) {
  const [step, setStep] = useState(1);
  const [isGenerating, setIsGenerating] = useState(false);
  
  // Form state
  const [contractType, setContractType] = useState('');
  const [jurisdiction, setJurisdiction] = useState('');
  const [governingLaw, setGoverningLaw] = useState('');
  const [party1, setParty1] = useState('');
  const [party2, setParty2] = useState('');
  const [title, setTitle] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [value, setValue] = useState('');
  const [specialTerms, setSpecialTerms] = useState('');
  const [riskTolerance, setRiskTolerance] = useState<'conservative' | 'moderate' | 'aggressive'>('moderate');
  const [selectedClauses, setSelectedClauses] = useState<string[]>(
    standardClauses.filter(c => c.recommended).map(c => c.id)
  );
  const [selectedAgents, setSelectedAgents] = useState<string[]>(['aria']);

  const progress = (step / STEPS.length) * 100;

  const canProceed = () => {
    switch (step) {
      case 1: return !!contractType;
      case 2: return !!jurisdiction;
      case 3: return !!party1 && !!party2 && !!title;
      case 4: return selectedClauses.length > 0;
      case 5: return selectedAgents.length > 0;
      default: return true;
    }
  };

  const handleNext = () => {
    if (step < STEPS.length) {
      setStep(step + 1);
    }
  };

  const handleBack = () => {
    if (step > 1) {
      setStep(step - 1);
    }
  };

  const handleGenerate = async () => {
    setIsGenerating(true);
    
    // Simulate AI generation
    await new Promise(resolve => setTimeout(resolve, 2500));
    
    const contract: ContractDraft = {
      id: crypto.randomUUID(),
      title,
      type: contractType,
      jurisdiction,
      governingLaw: governingLaw || jurisdiction,
      riskTolerance,
      party1,
      party2,
      startDate,
      endDate: endDate || undefined,
      value: value ? parseFloat(value) : undefined,
      specialTerms,
      selectedAgents,
      clauses: selectedClauses,
    };
    
    setIsGenerating(false);
    onComplete(contract);
    toast.success('Contract draft generated successfully');
    handleReset();
  };

  const handleReset = () => {
    setStep(1);
    setContractType('');
    setJurisdiction('');
    setGoverningLaw('');
    setParty1('');
    setParty2('');
    setTitle('');
    setStartDate('');
    setEndDate('');
    setValue('');
    setSpecialTerms('');
    setRiskTolerance('moderate');
    setSelectedClauses(standardClauses.filter(c => c.recommended).map(c => c.id));
    setSelectedAgents(['aria']);
  };

  const toggleClause = (clauseId: string) => {
    setSelectedClauses(prev => 
      prev.includes(clauseId) 
        ? prev.filter(id => id !== clauseId)
        : [...prev, clauseId]
    );
  };

  const toggleAgent = (agentId: string) => {
    setSelectedAgents(prev => 
      prev.includes(agentId) 
        ? prev.filter(id => id !== agentId)
        : [...prev, agentId]
    );
  };

  return (
    <Dialog open={open} onOpenChange={(open) => { if (!open) handleReset(); onOpenChange(open); }}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Scale className="w-5 h-5 text-primary" />
            Contract Drafting Wizard
          </DialogTitle>
        </DialogHeader>

        {/* Progress */}
        <div className="space-y-2">
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>Step {step} of {STEPS.length}</span>
            <span>{STEPS[step - 1].title}</span>
          </div>
          <Progress value={progress} className="h-2" />
          <div className="flex justify-between">
            {STEPS.map((s) => (
              <div 
                key={s.id} 
                className={cn(
                  "text-xs",
                  s.id === step ? "text-primary font-medium" : 
                  s.id < step ? "text-muted-foreground" : "text-muted-foreground/50"
                )}
              >
                {s.id < step ? <CheckCircle className="w-4 h-4 inline" /> : s.id}
              </div>
            ))}
          </div>
        </div>

        {/* Step Content */}
        <div className="py-4 min-h-[300px]">
          {/* Step 1: Contract Type */}
          {step === 1 && (
            <div className="space-y-4">
              <p className="text-sm text-muted-foreground">Select the type of contract you want to create.</p>
              <div className="grid grid-cols-2 gap-3">
                {contractTypes.map(type => (
                  <Card 
                    key={type.id}
                    className={cn(
                      "cursor-pointer transition-all hover:border-primary/50",
                      contractType === type.id && "border-primary bg-primary/5"
                    )}
                    onClick={() => setContractType(type.id)}
                  >
                    <CardContent className="p-4 flex items-start gap-3">
                      <type.icon className="w-5 h-5 text-primary mt-0.5" />
                      <div>
                        <p className="font-medium text-sm">{type.name}</p>
                        <p className="text-xs text-muted-foreground">{type.description}</p>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          )}

          {/* Step 2: Jurisdiction */}
          {step === 2 && (
            <div className="space-y-4">
              <p className="text-sm text-muted-foreground">Select jurisdiction and governing law for this contract.</p>
              
              <div className="space-y-2">
                <Label>Primary Jurisdiction</Label>
                <div className="grid grid-cols-2 gap-2">
                  {jurisdictions.map(j => (
                    <Button
                      key={j.id}
                      variant={jurisdiction === j.id ? "default" : "outline"}
                      className="justify-start gap-2 h-auto py-3"
                      onClick={() => setJurisdiction(j.id)}
                    >
                      <span>{j.flag}</span>
                      <span className="text-sm">{j.name}</span>
                    </Button>
                  ))}
                </div>
              </div>

              <div className="space-y-2">
                <Label>Governing Law (optional override)</Label>
                <Select value={governingLaw} onValueChange={setGoverningLaw}>
                  <SelectTrigger>
                    <SelectValue placeholder="Same as jurisdiction" />
                  </SelectTrigger>
                  <SelectContent>
                    {jurisdictions.map(j => (
                      <SelectItem key={j.id} value={j.id}>
                        {j.flag} {j.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {jurisdiction && (
                <div className="p-3 rounded-lg bg-blue-500/10 border border-blue-500/20">
                  <div className="flex items-start gap-2">
                    <Globe className="w-4 h-4 text-blue-500 mt-0.5" />
                    <div className="text-sm">
                      <p className="font-medium text-blue-500">Jurisdiction Note</p>
                      <p className="text-muted-foreground text-xs mt-1">
                        Contracts in {jurisdictions.find(j => j.id === jurisdiction)?.name} require specific 
                        compliance with local regulations. Our AI will ensure all clauses meet requirements.
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Step 3: Business Context */}
          {step === 3 && (
            <div className="space-y-4">
              <p className="text-sm text-muted-foreground">Define the parties and basic terms of the contract.</p>
              
              <div className="space-y-2">
                <Label>Contract Title</Label>
                <Input 
                  placeholder="e.g., Software Development Agreement" 
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Party 1 (Your Organization)</Label>
                  <Input 
                    placeholder="Company name" 
                    value={party1}
                    onChange={(e) => setParty1(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Party 2 (Counterparty)</Label>
                  <Input 
                    placeholder="Other party name" 
                    value={party2}
                    onChange={(e) => setParty2(e.target.value)}
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label>Start Date</Label>
                  <Input 
                    type="date" 
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label>End Date (optional)</Label>
                  <Input 
                    type="date" 
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Contract Value</Label>
                  <Input 
                    type="number" 
                    placeholder="0.00"
                    value={value}
                    onChange={(e) => setValue(e.target.value)}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label>Special Terms (optional)</Label>
                <Textarea 
                  placeholder="Any specific requirements or conditions..." 
                  rows={3}
                  value={specialTerms}
                  onChange={(e) => setSpecialTerms(e.target.value)}
                />
              </div>
            </div>
          )}

          {/* Step 4: Risk & Clauses */}
          {step === 4 && (
            <div className="space-y-4">
              <p className="text-sm text-muted-foreground">Set your risk tolerance and select clauses to include.</p>
              
              <div className="space-y-2">
                <Label>Risk Tolerance</Label>
                <RadioGroup value={riskTolerance} onValueChange={(v) => setRiskTolerance(v as typeof riskTolerance)}>
                  <div className="grid grid-cols-3 gap-3">
                    <Label 
                      className={cn(
                        "flex flex-col items-center gap-2 p-4 rounded-lg border cursor-pointer transition-all",
                        riskTolerance === 'conservative' && "border-primary bg-primary/5"
                      )}
                    >
                      <RadioGroupItem value="conservative" className="sr-only" />
                      <Shield className="w-6 h-6 text-green-500" />
                      <span className="font-medium text-sm">Conservative</span>
                      <span className="text-xs text-muted-foreground text-center">Maximum protection</span>
                    </Label>
                    <Label 
                      className={cn(
                        "flex flex-col items-center gap-2 p-4 rounded-lg border cursor-pointer transition-all",
                        riskTolerance === 'moderate' && "border-primary bg-primary/5"
                      )}
                    >
                      <RadioGroupItem value="moderate" className="sr-only" />
                      <Scale className="w-6 h-6 text-yellow-500" />
                      <span className="font-medium text-sm">Moderate</span>
                      <span className="text-xs text-muted-foreground text-center">Balanced approach</span>
                    </Label>
                    <Label 
                      className={cn(
                        "flex flex-col items-center gap-2 p-4 rounded-lg border cursor-pointer transition-all",
                        riskTolerance === 'aggressive' && "border-primary bg-primary/5"
                      )}
                    >
                      <RadioGroupItem value="aggressive" className="sr-only" />
                      <AlertTriangle className="w-6 h-6 text-red-500" />
                      <span className="font-medium text-sm">Aggressive</span>
                      <span className="text-xs text-muted-foreground text-center">Favor flexibility</span>
                    </Label>
                  </div>
                </RadioGroup>
              </div>

              <div className="space-y-2">
                <Label>Standard Clauses</Label>
                <div className="grid grid-cols-2 gap-2">
                  {standardClauses.map(clause => (
                    <div 
                      key={clause.id}
                      className={cn(
                        "flex items-center gap-2 p-3 rounded-lg border cursor-pointer transition-all",
                        selectedClauses.includes(clause.id) && "border-primary bg-primary/5"
                      )}
                      onClick={() => toggleClause(clause.id)}
                    >
                      <Checkbox 
                        checked={selectedClauses.includes(clause.id)} 
                        onCheckedChange={() => toggleClause(clause.id)}
                      />
                      <span className="text-sm flex-1">{clause.name}</span>
                      {clause.recommended && (
                        <Badge variant="secondary" className="text-xs">Recommended</Badge>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Step 5: AI Generation */}
          {step === 5 && (
            <div className="space-y-4">
              <p className="text-sm text-muted-foreground">Select AI agents to assist with contract generation.</p>
              
              <div className="space-y-3">
                {agents.map(agent => (
                  <Card 
                    key={agent.id}
                    className={cn(
                      "cursor-pointer transition-all",
                      selectedAgents.includes(agent.id) && "border-primary bg-primary/5"
                    )}
                    onClick={() => toggleAgent(agent.id)}
                  >
                    <CardContent className="p-4 flex items-center gap-4">
                      <Checkbox 
                        checked={selectedAgents.includes(agent.id)} 
                        onCheckedChange={() => toggleAgent(agent.id)}
                      />
                      <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                        <Bot className="w-5 h-5 text-primary" />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <span className="font-medium">{agent.name}</span>
                          <Badge variant="secondary" className="text-xs">{agent.specialty}</Badge>
                        </div>
                        <p className="text-xs text-muted-foreground mt-1">{agent.description}</p>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>

              {/* Summary */}
              <Card className="bg-muted/30">
                <CardContent className="p-4">
                  <h4 className="font-medium mb-3 flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-primary" />
                    Generation Summary
                  </h4>
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <div>
                      <span className="text-muted-foreground">Type:</span>
                      <span className="ml-2">{contractTypes.find(t => t.id === contractType)?.name}</span>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Jurisdiction:</span>
                      <span className="ml-2">{jurisdictions.find(j => j.id === jurisdiction)?.name}</span>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Clauses:</span>
                      <span className="ml-2">{selectedClauses.length} selected</span>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Risk:</span>
                      <span className="ml-2 capitalize">{riskTolerance}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </div>

        <DialogFooter className="flex justify-between">
          <Button 
            variant="outline" 
            onClick={handleBack}
            disabled={step === 1 || isGenerating}
          >
            <ChevronLeft className="w-4 h-4 mr-1" />
            Back
          </Button>
          
          {step < STEPS.length ? (
            <Button onClick={handleNext} disabled={!canProceed()}>
              Next
              <ChevronRight className="w-4 h-4 ml-1" />
            </Button>
          ) : (
            <Button 
              onClick={handleGenerate} 
              disabled={!canProceed() || isGenerating}
              className="gap-2"
            >
              {isGenerating ? (
                <>
                  <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                  Generating...
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  Generate Contract
                </>
              )}
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
