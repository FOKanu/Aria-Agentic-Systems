import { useState } from 'react';
import { Lock, Unlock, Cpu, Eye, ScanLine, Brain, FileText, FileEdit, Terminal, Sparkles } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';

interface SkillNode {
  id: string;
  name: string;
  description: string;
  icon: React.ElementType;
  unlocked: boolean;
  equipped: boolean;
  branch: 'core' | 'vision' | 'action';
  level: number;
  requires?: string;
  cost: number;
}

const initialSkills: SkillNode[] = [
  // Core
  { id: 'core', name: 'Core Logic', description: 'Base LLM reasoning capabilities', icon: Cpu, unlocked: true, equipped: true, branch: 'core', level: 0, cost: 0 },
  
  // Vision Branch
  { id: 'screen-capture', name: 'Screen Capture', description: 'Capture and view screen content', icon: Eye, unlocked: true, equipped: true, branch: 'vision', level: 1, requires: 'core', cost: 100 },
  { id: 'ocr', name: 'OCR Engine', description: 'Extract text from images', icon: ScanLine, unlocked: true, equipped: false, branch: 'vision', level: 2, requires: 'screen-capture', cost: 250 },
  { id: 'visual-reasoning', name: 'Visual Reasoning', description: 'Advanced visual analysis and understanding', icon: Brain, unlocked: false, equipped: false, branch: 'vision', level: 3, requires: 'ocr', cost: 500 },
  
  // Action Branch
  { id: 'file-read', name: 'File Read', description: 'Read files from the system', icon: FileText, unlocked: true, equipped: true, branch: 'action', level: 1, requires: 'core', cost: 100 },
  { id: 'file-write', name: 'File Write', description: 'Create and modify files', icon: FileEdit, unlocked: true, equipped: false, branch: 'action', level: 2, requires: 'file-read', cost: 250 },
  { id: 'terminal', name: 'Terminal Access', description: 'Execute shell commands', icon: Terminal, unlocked: false, equipped: false, branch: 'action', level: 3, requires: 'file-write', cost: 500 },
];

function SkillNodeComponent({ 
  skill, 
  onClick,
  position,
}: { 
  skill: SkillNode; 
  onClick: () => void;
  position: { x: number; y: number };
}) {
  const Icon = skill.icon;
  
  return (
    <button
      onClick={onClick}
      className={cn(
        "absolute w-16 h-16 rounded-2xl border-2 flex items-center justify-center transition-all duration-300",
        "hover:scale-110",
        skill.unlocked 
          ? skill.equipped
            ? "bg-primary/30 border-primary glow-primary"
            : "bg-secondary border-border hover:border-primary/50"
          : "bg-muted/50 border-muted-foreground/30 cursor-not-allowed opacity-60"
      )}
      style={{ 
        left: position.x, 
        top: position.y,
        transform: 'translate(-50%, -50%)'
      }}
      disabled={!skill.unlocked}
    >
      <Icon className={cn(
        "w-7 h-7 transition-colors",
        skill.equipped ? "text-primary" : skill.unlocked ? "text-foreground" : "text-muted-foreground"
      )} />
      
      {/* Lock icon overlay */}
      {!skill.unlocked && (
        <div className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-muted border border-border flex items-center justify-center">
          <Lock className="w-3 h-3 text-muted-foreground" />
        </div>
      )}
      
      {/* Equipped indicator */}
      {skill.equipped && (
        <div className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-success flex items-center justify-center">
          <Sparkles className="w-3 h-3 text-success-foreground" />
        </div>
      )}
    </button>
  );
}

function ConnectionLine({ from, to, unlocked }: { from: { x: number; y: number }; to: { x: number; y: number }; unlocked: boolean }) {
  const midX = (from.x + to.x) / 2;
  const midY = (from.y + to.y) / 2;
  
  return (
    <svg className="absolute inset-0 pointer-events-none" style={{ overflow: 'visible' }}>
      <defs>
        <linearGradient id={`gradient-${from.x}-${to.x}`} x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor={unlocked ? "hsl(var(--primary))" : "hsl(var(--muted-foreground))"} stopOpacity={unlocked ? 0.8 : 0.3} />
          <stop offset="100%" stopColor={unlocked ? "hsl(var(--accent))" : "hsl(var(--muted-foreground))"} stopOpacity={unlocked ? 0.8 : 0.3} />
        </linearGradient>
      </defs>
      <line
        x1={from.x}
        y1={from.y}
        x2={to.x}
        y2={to.y}
        stroke={`url(#gradient-${from.x}-${to.x})`}
        strokeWidth={unlocked ? 3 : 2}
        strokeLinecap="round"
        className={cn(unlocked && "drop-shadow-[0_0_8px_hsl(var(--primary))]")}
      />
    </svg>
  );
}

export function SkillTreePage() {
  const [skills, setSkills] = useState(initialSkills);
  const [selectedSkill, setSelectedSkill] = useState<SkillNode | null>(null);
  const { toast } = useToast();

  // Positions for the skill tree
  const positions: Record<string, { x: number; y: number }> = {
    'core': { x: 200, y: 50 },
    'screen-capture': { x: 100, y: 150 },
    'ocr': { x: 100, y: 250 },
    'visual-reasoning': { x: 100, y: 350 },
    'file-read': { x: 300, y: 150 },
    'file-write': { x: 300, y: 250 },
    'terminal': { x: 300, y: 350 },
  };

  const connections = [
    { from: 'core', to: 'screen-capture' },
    { from: 'screen-capture', to: 'ocr' },
    { from: 'ocr', to: 'visual-reasoning' },
    { from: 'core', to: 'file-read' },
    { from: 'file-read', to: 'file-write' },
    { from: 'file-write', to: 'terminal' },
  ];

  const handleToggleEquip = (skill: SkillNode) => {
    if (!skill.unlocked) return;
    if (skill.id === 'core') {
      toast({ title: "Cannot Unequip", description: "Core Logic is always required.", variant: "destructive" });
      return;
    }

    setSkills(prev => prev.map(s => 
      s.id === skill.id ? { ...s, equipped: !s.equipped } : s
    ));
    
    toast({
      title: skill.equipped ? "Skill Unequipped" : "Skill Equipped",
      description: `${skill.name} has been ${skill.equipped ? 'disabled' : 'enabled'} for this agent.`,
    });
    setSelectedSkill(null);
  };

  const handleUnlock = (skill: SkillNode) => {
    setSkills(prev => prev.map(s => 
      s.id === skill.id ? { ...s, unlocked: true } : s
    ));
    
    toast({
      title: "Skill Unlocked!",
      description: `${skill.name} is now available. Cost: ${skill.cost} credits.`,
    });
    setSelectedSkill(null);
  };

  return (
    <div className="space-y-6 animate-slide-up">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-display font-bold">Skill Tree</h1>
        <p className="text-sm text-muted-foreground">Upgrade and configure agent capabilities</p>
      </div>

      {/* Skill Tree Container */}
      <div className="glass-card rounded-xl p-6 min-h-[450px] relative overflow-hidden">
        {/* Branch Labels */}
        <div className="absolute top-4 left-4 text-xs font-mono text-primary/60 uppercase tracking-wider">
          Vision Branch
        </div>
        <div className="absolute top-4 right-4 text-xs font-mono text-accent/60 uppercase tracking-wider">
          Action Branch
        </div>

        {/* Connection Lines */}
        {connections.map(conn => {
          const fromSkill = skills.find(s => s.id === conn.from);
          const toSkill = skills.find(s => s.id === conn.to);
          return (
            <ConnectionLine
              key={`${conn.from}-${conn.to}`}
              from={positions[conn.from]}
              to={positions[conn.to]}
              unlocked={fromSkill?.unlocked && toSkill?.unlocked || false}
            />
          );
        })}

        {/* Skill Nodes */}
        {skills.map(skill => (
          <SkillNodeComponent
            key={skill.id}
            skill={skill}
            position={positions[skill.id]}
            onClick={() => setSelectedSkill(skill)}
          />
        ))}

        {/* Labels */}
        {skills.map(skill => (
          <div
            key={`label-${skill.id}`}
            className="absolute text-center pointer-events-none"
            style={{
              left: positions[skill.id].x,
              top: positions[skill.id].y + 45,
              transform: 'translateX(-50%)',
            }}
          >
            <span className={cn(
              "text-xs font-display font-medium",
              skill.equipped ? "text-primary" : skill.unlocked ? "text-foreground" : "text-muted-foreground"
            )}>
              {skill.name}
            </span>
          </div>
        ))}
      </div>

      {/* Legend */}
      <div className="flex items-center justify-center gap-6 text-xs text-muted-foreground">
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded bg-primary/30 border border-primary" />
          <span>Equipped</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded bg-secondary border border-border" />
          <span>Available</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded bg-muted/50 border border-muted-foreground/30" />
          <span>Locked</span>
        </div>
      </div>

      {/* Skill Detail Dialog */}
      <Dialog open={!!selectedSkill} onOpenChange={() => setSelectedSkill(null)}>
        <DialogContent className="glass-card border-border">
          {selectedSkill && (
            <>
              <DialogHeader>
                <div className="flex items-center gap-3">
                  <div className={cn(
                    "w-12 h-12 rounded-xl flex items-center justify-center",
                    selectedSkill.equipped ? "bg-primary/30" : "bg-secondary"
                  )}>
                    <selectedSkill.icon className={cn(
                      "w-6 h-6",
                      selectedSkill.equipped ? "text-primary" : "text-foreground"
                    )} />
                  </div>
                  <div>
                    <DialogTitle className="font-display">{selectedSkill.name}</DialogTitle>
                    <DialogDescription>{selectedSkill.description}</DialogDescription>
                  </div>
                </div>
              </DialogHeader>
              
              <div className="space-y-4 pt-4">
                {selectedSkill.requires && (
                  <p className="text-sm text-muted-foreground">
                    Requires: <span className="text-foreground">{skills.find(s => s.id === selectedSkill.requires)?.name}</span>
                  </p>
                )}
                
                {selectedSkill.unlocked ? (
                  <Button 
                    onClick={() => handleToggleEquip(selectedSkill)}
                    variant={selectedSkill.equipped ? "outline" : "default"}
                    className="w-full"
                    disabled={selectedSkill.id === 'core'}
                  >
                    {selectedSkill.equipped ? (
                      <>
                        <Unlock className="w-4 h-4 mr-2" />
                        Unequip Skill
                      </>
                    ) : (
                      <>
                        <Sparkles className="w-4 h-4 mr-2" />
                        Equip Skill
                      </>
                    )}
                  </Button>
                ) : (
                  <Button 
                    onClick={() => handleUnlock(selectedSkill)}
                    className="w-full"
                  >
                    <Lock className="w-4 h-4 mr-2" />
                    Unlock for {selectedSkill.cost} Credits
                  </Button>
                )}
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
