import React, { useEffect, useRef, useState } from 'react';
import { terminalSignals } from '@/lib/signals';
import { cn } from '@/lib/utils';
import { Terminal, XCircle } from 'lucide-react';

interface TerminalOutputProps {
  className?: string;
}

export const TerminalOutput: React.FC<TerminalOutputProps> = ({ className }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [output, setOutput] = useState<string[]>([]);
  const [currentCommand, setCurrentCommand] = useState<string | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Scroll to bottom on new output
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [output, isOpen]);

  useEffect(() => {
    const unsubOutput = terminalSignals.output.subscribe((data) => {
      setOutput(prev => [...prev, data]);
      setIsOpen(true); // Auto-open on output
    });

    const unsubStart = terminalSignals.start.subscribe((cmd) => {
      setCurrentCommand(cmd);
      setOutput([]); // Clear previous output on new command
      setIsOpen(true);
    });

    const unsubEnd = terminalSignals.end.subscribe((code) => {
      setOutput(prev => [...prev, `\n[Process exited with code ${code}]`]);
    });

    const unsubClear = terminalSignals.clear.subscribe(() => {
      setOutput([]);
      setIsOpen(false);
    });

    return () => {
      unsubOutput();
      unsubStart();
      unsubEnd();
      unsubClear();
    };
  }, []);

  if (!isOpen && !currentCommand) return null;

  return (
    <div className={cn(
      "fixed bottom-4 right-4 w-[600px] max-w-[90vw] bg-black/90 text-green-500 font-mono text-sm rounded-lg shadow-2xl border border-green-900 overflow-hidden z-50 flex flex-col transition-all duration-300",
      isOpen ? "h-96 opacity-100 translate-y-0" : "h-12 opacity-80 translate-y-0",
      className
    )}>
      {/* Header */}
      <div
        className="flex items-center justify-between px-4 py-2 bg-green-950/30 border-b border-green-900 cursor-pointer hover:bg-green-950/50 transition-colors"
        onClick={() => setIsOpen(!isOpen)}
      >
        <div className="flex items-center gap-2">
          <Terminal size={16} />
          <span className="font-bold truncate max-w-[400px]">
            {currentCommand || "Terminal"}
          </span>
        </div>
        <button
          onClick={(e) => {
            e.stopPropagation();
            setIsOpen(false);
          }}
          className="hover:text-red-400 transition-colors"
        >
          <XCircle size={16} />
        </button>
      </div>

      {/* Content */}
      {isOpen && (
        <div
          ref={scrollRef}
          className="flex-1 overflow-auto p-4 whitespace-pre-wrap break-all"
        >
          {output.map((line, i) => (
            <div key={i}>{line}</div>
          ))}
          {output.length === 0 && (
            <span className="opacity-50 italic">Waiting for output...</span>
          )}
        </div>
      )}
    </div>
  );
};
