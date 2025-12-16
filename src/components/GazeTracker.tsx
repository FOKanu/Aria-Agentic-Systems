import { useEffect, useState } from 'react';
import { cn } from '@/lib/utils';

interface GazePoint {
  id: number;
  x: number;
  y: number;
  timestamp: number;
}

interface GazeTrackerProps {
  active: boolean;
}

export function GazeTracker({ active }: GazeTrackerProps) {
  const [gazePoints, setGazePoints] = useState<GazePoint[]>([]);

  useEffect(() => {
    if (!active) {
      setGazePoints([]);
      return;
    }

    let id = 0;
    const interval = setInterval(() => {
      const newPoint: GazePoint = {
        id: id++,
        x: 10 + Math.random() * 80,
        y: 10 + Math.random() * 80,
        timestamp: Date.now(),
      };

      setGazePoints(prev => {
        const filtered = prev.filter(p => Date.now() - p.timestamp < 2000);
        return [...filtered, newPoint].slice(-5);
      });
    }, 800);

    return () => clearInterval(interval);
  }, [active]);

  if (!active) return null;

  return (
    <div className="absolute inset-0 pointer-events-none z-20">
      {gazePoints.map((point, index) => {
        const age = Date.now() - point.timestamp;
        const opacity = Math.max(0, 1 - age / 2000);
        const scale = 1 - (age / 2000) * 0.3;
        const isLatest = index === gazePoints.length - 1;

        return (
          <div
            key={point.id}
            className={cn(
              "absolute rounded-full border-2 transition-all duration-300",
              isLatest ? "border-holo bg-holo/20" : "border-primary/50 bg-primary/10"
            )}
            style={{
              left: `${point.x}%`,
              top: `${point.y}%`,
              width: isLatest ? 40 : 24,
              height: isLatest ? 40 : 24,
              opacity,
              transform: `translate(-50%, -50%) scale(${scale})`,
              boxShadow: isLatest ? '0 0 20px hsl(var(--holo) / 0.5)' : 'none',
            }}
          >
            {isLatest && (
              <>
                <div className="absolute inset-0 rounded-full border border-holo animate-ping" />
                <div className="absolute inset-2 rounded-full bg-holo/40" />
              </>
            )}
          </div>
        );
      })}
    </div>
  );
}
