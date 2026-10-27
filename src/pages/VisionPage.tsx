import { useState, useEffect } from 'react';
import { Eye, Type, Box, MousePointer, Target, Monitor, Cpu, Activity, ChevronLeft, ChevronRight, Upload, Image as ImageIcon } from 'lucide-react';
import { mockVisionData } from '@/data/mockData';
import { mockAgents } from '@/data/agentsData';
import { cn } from '@/lib/utils';
import { MatrixRain } from '@/components/MatrixRain';
import { GazeTracker } from '@/components/GazeTracker';
import { Button } from '@/components/ui/button';
import { AIService } from '@/lib/ai';
import { VisionData } from '@/types/agent';
import { useToast } from '@/hooks/use-toast';

// Only show agents that are actively working
const activeAgents = mockAgents.filter(a => a.status === 'executing' || a.status === 'thinking');

export function VisionPage() {
  const [currentAgentIndex, setCurrentAgentIndex] = useState(0);
  const [showOCR, setShowOCR] = useState(true);
  const [showElements, setShowElements] = useState(true);
  const [showCursor, setShowCursor] = useState(true);
  const [showGaze, setShowGaze] = useState(true);
  const [isProcessing, setIsProcessing] = useState(false);
  const [visionData, setVisionData] = useState<VisionData>(mockVisionData);
  const [uploadedImage, setUploadedImage] = useState<string | null>(null);

  const { toast } = useToast();
  const currentAgent = activeAgents[currentAgentIndex] || mockAgents[0];

  // Check AI Health on mount
  useEffect(() => {
    AIService.checkHealth().then(isHealthy => {
      if (!isHealthy) {
        toast({
          title: "Local AI Offline",
          description: "Ollama service not detected at localhost:11434. Using mock data.",
          variant: "destructive"
        });
      }
    });
  }, [toast]);

  const handlePrevAgent = () => {
    setCurrentAgentIndex((prev) => (prev === 0 ? activeAgents.length - 1 : prev - 1));
  };

  const handleNextAgent = () => {
    setCurrentAgentIndex((prev) => (prev === activeAgents.length - 1 ? 0 : prev + 1));
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsProcessing(true);

    // Create preview
    const reader = new FileReader();
    reader.onload = async (event) => {
      const base64 = event.target?.result as string;
      setUploadedImage(base64);

      try {
        // Strip data:image/jpeg;base64, prefix for the API call if needed,
        // but our AIService handles the full URL format for OpenAI compatibility
        // or we strip it there. Let's send the raw base64 data part.
        const base64Data = base64.split(',')[1];

        const result = await AIService.analyzeScreen(base64Data);

        setVisionData(prev => ({
          ...prev,
          ...result,
          screenshot: base64
        }));

        toast({
          title: "Analysis Complete",
          description: "Moondream has analyzed the uploaded screen.",
        });
      } catch (error) {
        console.error(error);
        toast({
          title: "Analysis Failed",
          description: "Could not process image with local AI.",
          variant: "destructive"
        });
      } finally {
        setIsProcessing(false);
      }
    };
    reader.readAsDataURL(file);
  };

  return (
    <div className="space-y-4 animate-slide-up">
      {/* Header with navigation */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <h2 className="text-xl font-display font-bold">Vision Stream</h2>

          {/* Agent Navigation */}
          {activeAgents.length > 1 && (
            <div className="flex items-center gap-2">
              <Button variant="ghost" size="icon" onClick={handlePrevAgent} className="h-8 w-8">
                <ChevronLeft className="w-4 h-4" />
              </Button>
              <span className="text-sm text-muted-foreground">
                {currentAgentIndex + 1} / {activeAgents.length}
              </span>
              <Button variant="ghost" size="icon" onClick={handleNextAgent} className="h-8 w-8">
                <ChevronRight className="w-4 h-4" />
              </Button>
            </div>
          )}
        </div>

        <div className="flex items-center gap-2">
          <div className={cn(
            "flex items-center gap-1.5 px-2 py-1 rounded-full text-xs",
            isProcessing ? "bg-success/20 text-success" : "bg-muted text-muted-foreground"
          )}>
            <Activity className={cn("w-3 h-3", isProcessing && "animate-pulse")} />
            <span>{isProcessing ? 'Processing' : 'Idle'}</span>
          </div>
        </div>
      </div>

      {/* Current Agent Display */}
      <div className="flex items-center gap-3 p-3 rounded-xl bg-secondary/50 border border-border">
        <div className="w-10 h-10 rounded-lg bg-card flex items-center justify-center text-xl border border-border">
          {currentAgent.avatar}
        </div>
        <div className="flex-1">
          <p className="font-medium">{currentAgent.name}</p>
          <p className="text-xs text-muted-foreground capitalize">
            {currentAgent.title} • {currentAgent.status}
          </p>
        </div>
        <div className={cn(
          "w-3 h-3 rounded-full",
          currentAgent.status === 'executing' ? "bg-success animate-pulse" : "bg-primary"
        )} />
      </div>

      {/* Monitor Bezel Frame */}
      <div className="relative">
        {/* Outer bezel */}
        <div className="bg-gradient-to-b from-secondary to-muted rounded-2xl p-3 shadow-2xl border border-border">
          {/* Inner bezel */}
          <div className="bg-gradient-to-b from-card to-background rounded-xl p-1 border border-border/50">
            {/* Screen */}
            <div className="relative rounded-lg bg-background aspect-video overflow-hidden border-2 border-border/30 group">

              {/* Upload Overlay */}
              <div className="absolute inset-0 z-50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-black/50 backdrop-blur-sm">
                 <label className="cursor-pointer flex flex-col items-center gap-2 p-4 rounded-xl bg-card border border-border hover:bg-secondary transition-colors">
                    <Upload className="w-8 h-8 text-primary" />
                    <span className="text-sm font-medium">Upload Screen to Analyze</span>
                    <input type="file" accept="image/*" className="hidden" onChange={handleFileUpload} />
                 </label>
              </div>

              {/* Uploaded Image or Placeholder */}
              {uploadedImage ? (
                <img src={uploadedImage} alt="Screen Analysis" className="absolute inset-0 w-full h-full object-cover z-0" />
              ) : (
                <div className="absolute inset-0 flex items-center justify-center z-0">
                  <div className="text-center space-y-2">
                    <div className="w-20 h-20 rounded-xl bg-muted/30 flex items-center justify-center mx-auto border border-border/50">
                      <Monitor className="w-10 h-10 text-muted-foreground/50" />
                    </div>
                    <p className="text-sm text-muted-foreground font-display">Agent Screen Capture</p>
                    <p className="text-xs text-muted-foreground/60 font-mono">Waiting for input...</p>
                  </div>
                </div>
              )}

              {/* Matrix Rain Effect (Background) */}
              {!uploadedImage && <MatrixRain active={true} />}

              {/* Gaze Tracker */}
              <GazeTracker active={showGaze && isProcessing} />

              {/* UI Element Overlays */}
              {showElements && visionData.detectedElements.map((el) => (
                <div
                  key={el.id}
                  className="absolute border-2 border-primary/60 bg-primary/10 rounded-lg text-[9px] text-primary px-1.5 py-0.5 font-mono z-30"
                  style={{
                    left: `${(el.bounds.x / 400) * 100}%`,
                    top: `${(el.bounds.y / 300) * 100}%`,
                    width: `${(el.bounds.width / 400) * 100}%`,
                    height: `${(el.bounds.height / 300) * 100}%`,
                  }}
                >
                  {el.label}
                </div>
              ))}

              {/* Cursor Target */}
              {showCursor && visionData.cursorTarget && (
                <div
                  className="absolute w-8 h-8 -translate-x-1/2 -translate-y-1/2 z-30"
                  style={{
                    left: `${(visionData.cursorTarget.x / 400) * 100}%`,
                    top: `${(visionData.cursorTarget.y / 300) * 100}%`,
                  }}
                >
                  <MousePointer className="w-5 h-5 text-warning drop-shadow-[0_0_10px_hsl(var(--warning))]" />
                  <div className="absolute top-6 left-3 text-[10px] bg-warning text-warning-foreground px-2 py-0.5 rounded-full whitespace-nowrap font-mono shadow-lg">
                    {visionData.cursorTarget.label}
                  </div>
                </div>
              )}

              {/* Scanlines effect */}
              <div
                className="absolute inset-0 pointer-events-none z-40 opacity-[0.03]"
                style={{
                  background: 'repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(0,0,0,0.3) 2px, rgba(0,0,0,0.3) 4px)'
                }}
              />
            </div>
          </div>

          {/* Monitor stand indicator */}
          <div className="flex justify-center mt-2">
            <div className="flex items-center gap-2">
              <div className={cn(
                "w-2 h-2 rounded-full",
                isProcessing ? "bg-success animate-pulse" : "bg-muted-foreground"
              )} />
              <span className="text-[10px] font-mono text-muted-foreground uppercase">
                {isProcessing ? 'LIVE FEED' : 'STANDBY'}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Toggle Controls */}
      <div className="grid grid-cols-4 gap-2">
        <button
          onClick={() => setShowOCR(!showOCR)}
          className={cn(
            'flex flex-col items-center gap-1.5 p-3 rounded-xl border-2 transition-all',
            showOCR ? 'border-primary bg-primary/10 text-primary' : 'border-border bg-secondary/30 text-muted-foreground'
          )}
        >
          <Type className="w-4 h-4" />
          <span className="text-[10px] font-display font-medium">OCR</span>
        </button>
        <button
          onClick={() => setShowElements(!showElements)}
          className={cn(
            'flex flex-col items-center gap-1.5 p-3 rounded-xl border-2 transition-all',
            showElements ? 'border-primary bg-primary/10 text-primary' : 'border-border bg-secondary/30 text-muted-foreground'
          )}
        >
          <Box className="w-4 h-4" />
          <span className="text-[10px] font-display font-medium">Elements</span>
        </button>
        <button
          onClick={() => setShowCursor(!showCursor)}
          className={cn(
            'flex flex-col items-center gap-1.5 p-3 rounded-xl border-2 transition-all',
            showCursor ? 'border-primary bg-primary/10 text-primary' : 'border-border bg-secondary/30 text-muted-foreground'
          )}
        >
          <Target className="w-4 h-4" />
          <span className="text-[10px] font-display font-medium">Cursor</span>
        </button>
        <button
          onClick={() => setShowGaze(!showGaze)}
          className={cn(
            'flex flex-col items-center gap-1.5 p-3 rounded-xl border-2 transition-all',
            showGaze ? 'border-holo bg-holo/10 text-holo' : 'border-border bg-secondary/30 text-muted-foreground'
          )}
        >
          <Eye className="w-4 h-4" />
          <span className="text-[10px] font-display font-medium">Gaze</span>
        </button>
      </div>

      {/* OCR Text Display */}
      {showOCR && visionData.ocrText && (
        <div className="glass-card rounded-xl p-4 space-y-2">
          <h3 className="text-xs font-medium text-muted-foreground uppercase tracking-wider flex items-center gap-2 font-display">
            <Type className="w-3 h-3" />
            Detected Text / Analysis
          </h3>
          <pre className="text-xs font-mono text-foreground/80 whitespace-pre-wrap bg-secondary/50 p-3 rounded-lg max-h-40 overflow-y-auto">
            {visionData.ocrText}
          </pre>
        </div>
      )}

      {/* Vision Analysis */}
      <div className="glass-card rounded-xl p-4 space-y-3">
        <h3 className="text-xs font-medium text-muted-foreground uppercase tracking-wider font-display flex items-center gap-2">
          <Cpu className="w-3 h-3" />
          Vision Analysis
        </h3>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1">
            <p className="text-[10px] text-muted-foreground">Confidence</p>
            <div className="flex items-center gap-2">
              <div className="flex-1 h-2 bg-secondary rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-success to-holo transition-all"
                  style={{ width: `${visionData.confidence * 100}%` }}
                />
              </div>
              <span className="text-sm font-mono font-bold text-success">{Math.round(visionData.confidence * 100)}%</span>
            </div>
          </div>
          <div className="space-y-1">
            <p className="text-[10px] text-muted-foreground">Elements Found</p>
            <p className="text-lg font-mono font-bold">{visionData.detectedElements.length}</p>
          </div>
        </div>

        {visionData.nextAction && (
          <div className="p-3 rounded-lg bg-primary/10 border border-primary/30">
            <p className="text-[10px] text-muted-foreground mb-1">Next Action</p>
            <p className="text-sm text-primary font-display font-medium">{visionData.nextAction}</p>
          </div>
        )}
      </div>
    </div>
  );
}
