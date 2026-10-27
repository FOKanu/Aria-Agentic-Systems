import { useState, useEffect } from 'react';
import { X, ChevronRight, ChevronLeft, Sparkles, MessageSquare, Users, Keyboard, Bell } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
} from '@/components/ui/dialog';
import { cn } from '@/lib/utils';

interface OnboardingStep {
  id: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  tip?: string;
}

const ONBOARDING_STEPS: OnboardingStep[] = [
  {
    id: 'welcome',
    title: 'Welcome to Agent Command',
    description: 'Your AI-powered multi-agent orchestration platform. Control and coordinate autonomous AI agents to automate complex tasks.',
    icon: <Sparkles className="h-8 w-8" />,
    tip: 'Let\'s take a quick tour of the key features.',
  },
  {
    id: 'agents',
    title: 'Your Agent Fleet',
    description: 'The left sidebar shows your available agents. Click an agent to view details, or right-click for quick actions like pause, resume, or stop.',
    icon: <Users className="h-8 w-8" />,
    tip: 'You have 10 specialized agents ready to help.',
  },
  {
    id: 'chat',
    title: 'Chat with Agents',
    description: 'Use natural language to communicate with your agents. Type @AgentName to direct a message to a specific agent, or select multiple agents for coordinated tasks.',
    icon: <MessageSquare className="h-8 w-8" />,
    tip: 'Try: "@Nova build a login page" or "@Atlas plan a feature"',
  },
  {
    id: 'shortcuts',
    title: 'Power User Shortcuts',
    description: 'Press Cmd+K (or Ctrl+K) to open the command palette for quick navigation. Use keyboard shortcuts like g+h for Home, g+c for Chat, and more.',
    icon: <Keyboard className="h-8 w-8" />,
    tip: 'Click the keyboard icon in the top bar to see all shortcuts.',
  },
  {
    id: 'notifications',
    title: 'Stay Informed',
    description: 'The notification bell shows agent events, task completions, and items requiring your approval. Never miss an important update.',
    icon: <Bell className="h-8 w-8" />,
    tip: 'You\'re all set! Start by chatting with an agent.',
  },
];

const STORAGE_KEY = 'agent-command-onboarding-complete';

interface OnboardingDialogProps {
  forceShow?: boolean;
  onComplete?: () => void;
}

export function OnboardingDialog({ forceShow = false, onComplete }: OnboardingDialogProps) {
  const [open, setOpen] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);

  useEffect(() => {
    if (forceShow) {
      setOpen(true);
      setCurrentStep(0);
      return;
    }

    const completed = localStorage.getItem(STORAGE_KEY);
    if (!completed) {
      // Small delay before showing onboarding
      const timer = setTimeout(() => setOpen(true), 500);
      return () => clearTimeout(timer);
    }
  }, [forceShow]);

  const handleComplete = () => {
    localStorage.setItem(STORAGE_KEY, 'true');
    setOpen(false);
    onComplete?.();
  };

  const handleSkip = () => {
    handleComplete();
  };

  const handleNext = () => {
    if (currentStep < ONBOARDING_STEPS.length - 1) {
      setCurrentStep(prev => prev + 1);
    } else {
      handleComplete();
    }
  };

  const handlePrev = () => {
    if (currentStep > 0) {
      setCurrentStep(prev => prev - 1);
    }
  };

  const step = ONBOARDING_STEPS[currentStep];

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="sm:max-w-lg p-0 overflow-hidden">
        {/* Skip button */}
        <Button
          variant="ghost"
          size="sm"
          className="absolute right-2 top-2 text-muted-foreground"
          onClick={handleSkip}
        >
          Skip
        </Button>

        {/* Content */}
        <div className="p-8 pt-12 text-center">
          {/* Icon */}
          <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-6 text-primary">
            {step.icon}
          </div>

          {/* Text */}
          <h2 className="text-xl font-semibold mb-3">{step.title}</h2>
          <p className="text-muted-foreground mb-4">{step.description}</p>
          
          {step.tip && (
            <p className="text-sm text-primary/80 bg-primary/5 rounded-lg px-4 py-2 inline-block">
              💡 {step.tip}
            </p>
          )}
        </div>

        {/* Progress & Navigation */}
        <div className="border-t border-border px-6 py-4 bg-muted/30">
          {/* Progress dots */}
          <div className="flex items-center justify-center gap-1.5 mb-4">
            {ONBOARDING_STEPS.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentStep(index)}
                className={cn(
                  "w-2 h-2 rounded-full transition-all",
                  index === currentStep 
                    ? "w-6 bg-primary" 
                    : index < currentStep 
                      ? "bg-primary/50" 
                      : "bg-muted-foreground/30"
                )}
              />
            ))}
          </div>

          {/* Navigation buttons */}
          <div className="flex items-center justify-between">
            <Button
              variant="ghost"
              onClick={handlePrev}
              disabled={currentStep === 0}
              className={cn(currentStep === 0 && "invisible")}
            >
              <ChevronLeft className="h-4 w-4 mr-1" />
              Back
            </Button>

            <Button onClick={handleNext}>
              {currentStep === ONBOARDING_STEPS.length - 1 ? (
                'Get Started'
              ) : (
                <>
                  Next
                  <ChevronRight className="h-4 w-4 ml-1" />
                </>
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

// Hook to check/reset onboarding
export function useOnboarding() {
  const isComplete = () => localStorage.getItem(STORAGE_KEY) === 'true';
  const reset = () => localStorage.removeItem(STORAGE_KEY);
  return { isComplete, reset };
}
