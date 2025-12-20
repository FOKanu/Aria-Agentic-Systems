// Floating Voice Button - Francis Okorie Iyeke-Kanu
import { useState, useCallback } from 'react';
import { Mic, MicOff, X, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useChatContext } from '@/hooks/useChatContext';
import { useVoiceInput } from '@/hooks/useVoiceInput';
import { cn } from '@/lib/utils';

export function FloatingVoiceButton() {
  const { sendMessage, pageContext, openChat } = useChatContext();
  const voiceInput = useVoiceInput();
  const [showPanel, setShowPanel] = useState(false);

  const handleVoiceStart = useCallback(() => {
    setShowPanel(true);
    voiceInput.startRecording();
  }, [voiceInput]);

  const handleVoiceStop = useCallback(async () => {
    const transcription = await voiceInput.stopRecording();
    if (transcription) {
      // Send the transcribed message and open chat to show the response
      await sendMessage(transcription);
      openChat();
    }
    setShowPanel(false);
  }, [voiceInput, sendMessage, openChat]);

  const handleCancel = useCallback(() => {
    voiceInput.stopRecording();
    setShowPanel(false);
  }, [voiceInput]);

  // Recording panel when active
  if (showPanel) {
    return (
      <Card className="fixed bottom-20 left-4 lg:bottom-6 lg:left-6 z-50 p-4 bg-background/95 backdrop-blur-xl border-border/50 shadow-2xl w-[280px]">
        <div className="flex flex-col items-center gap-4">
          {/* Header */}
          <div className="flex items-center justify-between w-full">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-destructive animate-pulse" />
              <span className="text-sm font-medium">Recording...</span>
            </div>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8"
              onClick={handleCancel}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>

          {/* Context badge */}
          {pageContext && (
            <Badge variant="secondary" className="text-xs">
              Context: {pageContext.pageName}
            </Badge>
          )}

          {/* Waveform Animation */}
          <div className="flex items-center justify-center gap-1 h-16 w-full">
            {[...Array(20)].map((_, i) => (
              <div
                key={i}
                className="w-1.5 bg-primary rounded-full animate-pulse"
                style={{
                  height: `${Math.random() * 40 + 10}px`,
                  animationDelay: `${i * 50}ms`,
                  animationDuration: '0.5s',
                }}
              />
            ))}
          </div>

          {/* Transcription preview */}
          {voiceInput.isTranscribing ? (
            <div className="flex items-center gap-2 text-muted-foreground">
              <Loader2 className="h-4 w-4 animate-spin" />
              <span className="text-sm">Transcribing...</span>
            </div>
          ) : voiceInput.transcriptionPreview ? (
            <p className="text-sm text-muted-foreground italic text-center line-clamp-2">
              "{voiceInput.transcriptionPreview}"
            </p>
          ) : (
            <p className="text-sm text-muted-foreground">Speak now...</p>
          )}

          {/* Stop button */}
          <Button
            variant="destructive"
            size="lg"
            className="w-full"
            onClick={handleVoiceStop}
            disabled={voiceInput.isTranscribing}
          >
            {voiceInput.isTranscribing ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Processing...
              </>
            ) : (
              <>
                <MicOff className="h-4 w-4 mr-2" />
                Stop & Send
              </>
            )}
          </Button>
        </div>
      </Card>
    );
  }

  // Floating button when not recording
  return (
    <Button
      onClick={handleVoiceStart}
      size="lg"
      variant="outline"
      className="fixed bottom-20 left-4 lg:bottom-6 lg:left-6 z-50 h-14 w-14 rounded-full shadow-lg bg-background/95 backdrop-blur-xl border-border/50 hover:bg-primary hover:text-primary-foreground transition-all duration-200 hover:scale-105"
    >
      <Mic className="h-6 w-6" />
    </Button>
  );
}
