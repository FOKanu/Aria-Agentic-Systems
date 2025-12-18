import { useState, useRef, useEffect } from 'react';
import { Send, Mic, MicOff, X, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { ChatAgent } from '@/types/chat';

interface ChatInputBarProps {
  onSendMessage: (message: string) => void;
  onStartRecording: () => void;
  onStopRecording: () => void;
  isRecording: boolean;
  isTranscribing: boolean;
  transcriptionPreview: string;
  selectedAgents: ChatAgent[];
  onRemoveAgent: (agentId: string) => void;
  disabled?: boolean;
}

export function ChatInputBar({
  onSendMessage,
  onStartRecording,
  onStopRecording,
  isRecording,
  isTranscribing,
  transcriptionPreview,
  selectedAgents,
  onRemoveAgent,
  disabled,
}: ChatInputBarProps) {
  const [message, setMessage] = useState('');
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Auto-resize textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = Math.min(textareaRef.current.scrollHeight, 120) + 'px';
    }
  }, [message]);

  const handleSend = () => {
    if (message.trim() && !disabled) {
      onSendMessage(message.trim());
      setMessage('');
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="fixed bottom-16 lg:bottom-0 left-0 right-0 bg-card/95 backdrop-blur-xl border-t border-border p-4 lg:left-20">
      <div className="max-w-4xl mx-auto space-y-3">
        {/* Selected Agents Chips */}
        {selectedAgents.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {selectedAgents.map((agent) => (
              <div
                key={agent.id}
                className="flex items-center gap-1 px-2 py-1 rounded-full bg-primary/20 text-primary text-sm"
              >
                <span>{agent.avatar}</span>
                <span>{agent.name}</span>
                <button
                  onClick={() => onRemoveAgent(agent.id)}
                  className="p-0.5 hover:bg-primary/30 rounded-full"
                >
                  <X className="w-3 h-3" />
                </button>
              </div>
            ))}
          </div>
        )}

        {/* Recording State */}
        {isRecording && (
          <div className="flex items-center gap-3 p-3 rounded-lg bg-destructive/10 border border-destructive/30">
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-destructive animate-pulse" />
              <span className="text-sm font-medium text-destructive">Recording...</span>
            </div>
            {/* Waveform Animation */}
            <div className="flex items-center gap-1 flex-1">
              {[...Array(20)].map((_, i) => (
                <div
                  key={i}
                  className="w-1 bg-destructive rounded-full animate-pulse"
                  style={{
                    height: `${Math.random() * 20 + 8}px`,
                    animationDelay: `${i * 50}ms`,
                  }}
                />
              ))}
            </div>
            <Button
              variant="destructive"
              size="sm"
              onClick={onStopRecording}
            >
              Stop
            </Button>
          </div>
        )}

        {/* Transcription Preview */}
        {isTranscribing && (
          <div className="flex items-center gap-2 p-3 rounded-lg bg-muted">
            <Loader2 className="w-4 h-4 animate-spin" />
            <span className="text-sm text-muted-foreground">Transcribing...</span>
            {transcriptionPreview && (
              <span className="text-sm italic">{transcriptionPreview}</span>
            )}
          </div>
        )}

        {/* Input Area */}
        {!isRecording && !isTranscribing && (
          <div className="flex items-end gap-2">
            <div className="flex-1 relative">
              <Textarea
                ref={textareaRef}
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Ask a question, assign a task, or speak..."
                className="min-h-[44px] max-h-[120px] resize-none pr-12 rounded-2xl"
                disabled={disabled}
                rows={1}
              />
            </div>

            {/* Microphone Button */}
            <Button
              variant="outline"
              size="icon"
              className={cn(
                'rounded-full h-11 w-11 flex-shrink-0',
                isRecording && 'bg-destructive text-destructive-foreground'
              )}
              onMouseDown={onStartRecording}
              onMouseUp={onStopRecording}
              onMouseLeave={isRecording ? onStopRecording : undefined}
              onTouchStart={onStartRecording}
              onTouchEnd={onStopRecording}
              disabled={disabled}
            >
              {isRecording ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
            </Button>

            {/* Send Button */}
            <Button
              size="icon"
              className="rounded-full h-11 w-11 flex-shrink-0"
              onClick={handleSend}
              disabled={!message.trim() || disabled}
            >
              <Send className="w-5 h-5" />
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
