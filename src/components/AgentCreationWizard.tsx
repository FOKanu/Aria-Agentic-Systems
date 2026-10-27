import { useState, useEffect } from 'react';
import { Bot, Code, Search, Sparkles, Dices, Zap, Check, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';

interface AgentCreationWizardProps {
  open: boolean;
  onClose: () => void;
  onComplete: (agent: NewAgent) => void;
}

interface NewAgent {
  name: string;
  avatar: string;
  class: 'assistant' | 'coder' | 'researcher';
  stats: {
    accuracy: number;
    speed: number;
    creativity: number;
  };
}

const classes = [
  { id: 'assistant' as const, name: 'Assistant', icon: Bot, description: 'Versatile helper for general tasks', color: 'primary', emoji: '🤖' },
  { id: 'coder' as const, name: 'Code Architect', icon: Code, description: 'Specialized in programming and development', color: 'holo', emoji: '💻' },
  { id: 'researcher' as const, name: 'Researcher', icon: Search, description: 'Expert at data analysis and discovery', color: 'accent', emoji: '🔬' },
];

const avatars = ['🤖', '🦾', '🧠', '⚡', '🎯', '🔮', '🌟', '🚀', '💎', '🎪', '🦊', '🐱', '🐶', '🦁', '🐼'];
const prefixes = ['Nova', 'Atlas', 'Echo', 'Sage', 'Pixel', 'Flux', 'Nexus', 'Prism', 'Quantum', 'Cipher'];
const suffixes = ['X', 'Prime', 'Ultra', 'Neo', 'Max', 'Plus', 'Pro', 'Zen', 'Ace', 'One'];

export function AgentCreationWizard({ open, onClose, onComplete }: AgentCreationWizardProps) {
  const [step, setStep] = useState(1);
  const [selectedClass, setSelectedClass] = useState<'assistant' | 'coder' | 'researcher' | null>(null);
  const [stats, setStats] = useState({ accuracy: 50, speed: 50, creativity: 50 });
  const [isRolling, setIsRolling] = useState(false);
  const [name, setName] = useState('');
  const [avatar, setAvatar] = useState('🤖');
  const [isBooting, setIsBooting] = useState(false);
  const [bootProgress, setBootProgress] = useState(0);
  const { toast } = useToast();

  const rollStats = () => {
    setIsRolling(true);
    
    let rollCount = 0;
    const maxRolls = 15;
    const interval = setInterval(() => {
      setStats({
        accuracy: Math.floor(Math.random() * 60) + 40,
        speed: Math.floor(Math.random() * 60) + 40,
        creativity: Math.floor(Math.random() * 60) + 40,
      });
      
      rollCount++;
      if (rollCount >= maxRolls) {
        clearInterval(interval);
        setIsRolling(false);
      }
    }, 80);
  };

  const generateName = () => {
    const prefix = prefixes[Math.floor(Math.random() * prefixes.length)];
    const suffix = suffixes[Math.floor(Math.random() * suffixes.length)];
    setName(`${prefix}-${suffix}`);
  };

  const generateAvatar = () => {
    setAvatar(avatars[Math.floor(Math.random() * avatars.length)]);
  };

  const handleInitialize = () => {
    setIsBooting(true);
    setBootProgress(0);
    
    const interval = setInterval(() => {
      setBootProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval);
          setTimeout(() => {
            onComplete({
              name,
              avatar,
              class: selectedClass!,
              stats,
            });
            toast({
              title: "Agent Initialized!",
              description: `${name} is ready for deployment.`,
            });
            resetWizard();
            onClose();
          }, 500);
          return 100;
        }
        return prev + 5;
      });
    }, 100);
  };

  const resetWizard = () => {
    setStep(1);
    setSelectedClass(null);
    setStats({ accuracy: 50, speed: 50, creativity: 50 });
    setName('');
    setAvatar('🤖');
    setIsBooting(false);
    setBootProgress(0);
  };

  useEffect(() => {
    if (open) {
      resetWizard();
    }
  }, [open]);

  const canProceed = () => {
    switch (step) {
      case 1: return !!selectedClass;
      case 2: return true;
      case 3: return name.length > 0;
      default: return true;
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="glass-card border-border max-w-lg">
        <DialogHeader>
          <DialogTitle className="font-display text-xl flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-gold" />
            The Hangar - Agent Creation
          </DialogTitle>
        </DialogHeader>

        {/* Progress Steps */}
        <div className="flex items-center justify-center gap-2 py-2">
          {[1, 2, 3, 4].map(s => (
            <div
              key={s}
              className={cn(
                "w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold transition-all",
                s === step ? "bg-primary text-primary-foreground glow-primary" :
                s < step ? "bg-success text-success-foreground" :
                "bg-secondary text-muted-foreground"
              )}
            >
              {s < step ? <Check className="w-4 h-4" /> : s}
            </div>
          ))}
        </div>

        {/* Step Content */}
        <div className="min-h-[280px] py-4">
          {/* Step 1: Choose Class */}
          {step === 1 && (
            <div className="space-y-4">
              <p className="text-sm text-muted-foreground text-center">Choose your agent's class</p>
              <div className="grid grid-cols-3 gap-3">
                {classes.map(cls => {
                  const Icon = cls.icon;
                  return (
                    <button
                      key={cls.id}
                      onClick={() => setSelectedClass(cls.id)}
                      className={cn(
                        "p-4 rounded-xl border-2 transition-all text-center",
                        selectedClass === cls.id
                          ? "border-primary bg-primary/20 glow-primary"
                          : "border-border bg-secondary/50 hover:border-primary/50"
                      )}
                    >
                      <div className="text-3xl mb-2">{cls.emoji}</div>
                      <p className="font-display font-bold text-sm">{cls.name}</p>
                      <p className="text-[10px] text-muted-foreground mt-1">{cls.description}</p>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Step 2: Roll Stats */}
          {step === 2 && (
            <div className="space-y-6">
              <p className="text-sm text-muted-foreground text-center">Roll for your agent's attributes</p>
              
              <div className="space-y-4">
                {Object.entries(stats).map(([key, value]) => (
                  <div key={key} className="space-y-1">
                    <div className="flex justify-between text-sm">
                      <span className="capitalize font-display">{key}</span>
                      <span className={cn(
                        "font-mono font-bold",
                        isRolling && "animate-pulse text-gold"
                      )}>{value}</span>
                    </div>
                    <div className="h-3 bg-secondary rounded-full overflow-hidden">
                      <div
                        className={cn(
                          "h-full rounded-full transition-all duration-100",
                          key === 'accuracy' ? "bg-success" :
                          key === 'speed' ? "bg-holo" : "bg-accent"
                        )}
                        style={{ width: `${value}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>

              <Button 
                onClick={rollStats} 
                disabled={isRolling}
                className="w-full"
                variant="outline"
              >
                <Dices className={cn("w-4 h-4 mr-2", isRolling && "animate-spin")} />
                {isRolling ? 'Rolling...' : 'Roll Stats'}
              </Button>
            </div>
          )}

          {/* Step 3: Name & Avatar */}
          {step === 3 && (
            <div className="space-y-6">
              <p className="text-sm text-muted-foreground text-center">Customize your agent's identity</p>
              
              <div className="flex flex-col items-center gap-4">
                <button
                  onClick={generateAvatar}
                  className="w-20 h-20 rounded-2xl bg-gradient-to-br from-primary/30 to-accent/30 border-2 border-primary/50 flex items-center justify-center text-4xl hover:scale-105 transition-all"
                >
                  {avatar}
                </button>
                <p className="text-xs text-muted-foreground">Click to randomize avatar</p>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-display">Agent Name</label>
                <div className="flex gap-2">
                  <Input
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Enter agent name..."
                    className="flex-1"
                  />
                  <Button variant="outline" onClick={generateName}>
                    <Dices className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </div>
          )}

          {/* Step 4: Initialize */}
          {step === 4 && (
            <div className="space-y-6 text-center">
              {!isBooting ? (
                <>
                  <div className="w-24 h-24 mx-auto rounded-2xl bg-gradient-to-br from-primary/30 to-accent/30 border-2 border-primary/50 flex items-center justify-center text-5xl animate-float">
                    {avatar}
                  </div>
                  <div>
                    <p className="font-display font-bold text-lg">{name}</p>
                    <p className="text-sm text-muted-foreground capitalize">
                      {classes.find(c => c.id === selectedClass)?.name}
                    </p>
                  </div>
                  <div className="flex justify-center gap-4 text-sm">
                    <span className="text-success">ACC: {stats.accuracy}</span>
                    <span className="text-holo">SPD: {stats.speed}</span>
                    <span className="text-accent">CRE: {stats.creativity}</span>
                  </div>
                </>
              ) : (
                <div className="space-y-4">
                  <div className="w-24 h-24 mx-auto rounded-2xl bg-gradient-to-br from-primary/30 to-accent/30 border-2 border-primary flex items-center justify-center text-5xl glow-primary">
                    {avatar}
                  </div>
                  <p className="font-mono text-sm text-primary animate-pulse">
                    Initializing neural pathways...
                  </p>
                  <div className="h-2 bg-secondary rounded-full overflow-hidden max-w-xs mx-auto">
                    <div
                      className="h-full bg-gradient-to-r from-primary to-accent transition-all duration-100"
                      style={{ width: `${bootProgress}%` }}
                    />
                  </div>
                  <p className="font-mono text-xs text-muted-foreground">{bootProgress}%</p>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Navigation Buttons */}
        <div className="flex justify-between pt-4 border-t border-border">
          <Button
            variant="ghost"
            onClick={() => step > 1 ? setStep(step - 1) : onClose()}
            disabled={isBooting}
          >
            {step === 1 ? 'Cancel' : 'Back'}
          </Button>
          
          {step < 4 ? (
            <Button onClick={() => setStep(step + 1)} disabled={!canProceed()}>
              Next
            </Button>
          ) : (
            <Button 
              onClick={handleInitialize} 
              disabled={isBooting}
              className="gap-2"
            >
              {isBooting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Booting...
                </>
              ) : (
                <>
                  <Zap className="w-4 h-4" />
                  Initialize Agent
                </>
              )}
            </Button>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
