import { useState } from 'react';
import { Eye, Type, Box, MousePointer, Target } from 'lucide-react';
import { Switch } from '@/components/ui/switch';
import { mockVisionData } from '@/data/mockData';
import { cn } from '@/lib/utils';

export function VisionPage() {
  const [showOCR, setShowOCR] = useState(true);
  const [showElements, setShowElements] = useState(true);
  const [showCursor, setShowCursor] = useState(true);

  return (
    <div className="space-y-4 animate-slide-up">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold">Vision Monitor</h2>
        <div className="flex items-center gap-1.5">
          <Eye className="w-4 h-4 text-primary" />
          <span className="text-xs text-muted-foreground">Live</span>
        </div>
      </div>

      {/* Screenshot Area */}
      <div className="relative rounded-lg border border-border bg-secondary/30 aspect-video overflow-hidden">
        {/* Placeholder for screenshot */}
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-center space-y-2">
            <div className="w-16 h-16 rounded-lg bg-muted/50 flex items-center justify-center mx-auto">
              <Eye className="w-8 h-8 text-muted-foreground" />
            </div>
            <p className="text-sm text-muted-foreground">Agent Screen Capture</p>
            <p className="text-xs text-muted-foreground/60 font-mono">320×180 preview</p>
          </div>
        </div>

        {/* UI Element Overlays */}
        {showElements && mockVisionData.detectedElements.map((el) => (
          <div
            key={el.id}
            className="absolute border border-primary/60 bg-primary/10 rounded text-[8px] text-primary px-1"
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
        {showCursor && mockVisionData.cursorTarget && (
          <div
            className="absolute w-6 h-6 -translate-x-1/2 -translate-y-1/2"
            style={{
              left: `${(mockVisionData.cursorTarget.x / 400) * 100}%`,
              top: `${(mockVisionData.cursorTarget.y / 300) * 100}%`,
            }}
          >
            <MousePointer className="w-4 h-4 text-warning drop-shadow-lg" />
            <div className="absolute top-5 left-2 text-[9px] bg-warning/90 text-warning-foreground px-1 rounded whitespace-nowrap">
              {mockVisionData.cursorTarget.label}
            </div>
          </div>
        )}
      </div>

      {/* Toggle Controls */}
      <div className="grid grid-cols-3 gap-2">
        <button
          onClick={() => setShowOCR(!showOCR)}
          className={cn(
            'flex flex-col items-center gap-1.5 p-3 rounded-lg border transition-all',
            showOCR ? 'border-primary bg-primary/10 text-primary' : 'border-border bg-secondary/30 text-muted-foreground'
          )}
        >
          <Type className="w-4 h-4" />
          <span className="text-[10px] font-medium">OCR Text</span>
        </button>
        <button
          onClick={() => setShowElements(!showElements)}
          className={cn(
            'flex flex-col items-center gap-1.5 p-3 rounded-lg border transition-all',
            showElements ? 'border-primary bg-primary/10 text-primary' : 'border-border bg-secondary/30 text-muted-foreground'
          )}
        >
          <Box className="w-4 h-4" />
          <span className="text-[10px] font-medium">Elements</span>
        </button>
        <button
          onClick={() => setShowCursor(!showCursor)}
          className={cn(
            'flex flex-col items-center gap-1.5 p-3 rounded-lg border transition-all',
            showCursor ? 'border-primary bg-primary/10 text-primary' : 'border-border bg-secondary/30 text-muted-foreground'
          )}
        >
          <Target className="w-4 h-4" />
          <span className="text-[10px] font-medium">Cursor</span>
        </button>
      </div>

      {/* OCR Text Display */}
      {showOCR && mockVisionData.ocrText && (
        <div className="rounded-lg border border-border bg-card p-3 space-y-2">
          <h3 className="text-xs font-medium text-muted-foreground uppercase tracking-wider flex items-center gap-1.5">
            <Type className="w-3 h-3" />
            Detected Text
          </h3>
          <pre className="text-xs font-mono text-foreground/80 whitespace-pre-wrap">
            {mockVisionData.ocrText}
          </pre>
        </div>
      )}

      {/* Vision Analysis */}
      <div className="rounded-lg border border-border bg-card p-3 space-y-3">
        <h3 className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Vision Analysis</h3>
        
        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1">
            <p className="text-[10px] text-muted-foreground">Confidence</p>
            <div className="flex items-center gap-2">
              <div className="flex-1 h-1.5 bg-secondary rounded-full overflow-hidden">
                <div 
                  className="h-full bg-success transition-all"
                  style={{ width: `${mockVisionData.confidence * 100}%` }}
                />
              </div>
              <span className="text-xs font-mono">{Math.round(mockVisionData.confidence * 100)}%</span>
            </div>
          </div>
          <div className="space-y-1">
            <p className="text-[10px] text-muted-foreground">Elements Found</p>
            <p className="text-sm font-mono">{mockVisionData.detectedElements.length}</p>
          </div>
        </div>

        {mockVisionData.nextAction && (
          <div className="p-2 rounded bg-primary/10 border border-primary/30">
            <p className="text-[10px] text-muted-foreground mb-1">Next Action</p>
            <p className="text-sm text-primary">{mockVisionData.nextAction}</p>
          </div>
        )}
      </div>
    </div>
  );
}
