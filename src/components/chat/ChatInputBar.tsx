// Chat Input Bar - Francis Okorie Iyeke-Kanu
import { useState, useRef, useEffect, useCallback } from 'react';
import { Send, Mic, MicOff, X, Loader2, Paperclip, FileText, Image, File } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { ChatAgent, ChatAttachment } from '@/types/chat';
import { useToast } from '@/hooks/use-toast';
import { useAgentMention } from '@/hooks/useAgentMention';
import { AgentMentionPopover } from './AgentMentionPopover';

/* Francis Okorie Iyeke-Kanu - Accepted File Types */
const ACCEPTED_FILE_TYPES = {
  // Spreadsheets
  'text/csv': { icon: FileText, label: 'CSV' },
  'application/vnd.ms-excel': { icon: FileText, label: 'XLS' },
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': { icon: FileText, label: 'XLSX' },
  // Documents
  'application/pdf': { icon: FileText, label: 'PDF' },
  'application/msword': { icon: FileText, label: 'DOC' },
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document': { icon: FileText, label: 'DOCX' },
  'application/vnd.ms-powerpoint': { icon: FileText, label: 'PPT' },
  'application/vnd.openxmlformats-officedocument.presentationml.presentation': { icon: FileText, label: 'PPTX' },
  'text/plain': { icon: FileText, label: 'TXT' },
  'text/markdown': { icon: FileText, label: 'MD' },
  // Code
  'text/html': { icon: FileText, label: 'HTML' },
  'text/css': { icon: FileText, label: 'CSS' },
  'text/javascript': { icon: FileText, label: 'JS' },
  'application/javascript': { icon: FileText, label: 'JS' },
  'text/x-python': { icon: FileText, label: 'Python' },
  'application/x-python-code': { icon: FileText, label: 'Python' },
  'application/json': { icon: FileText, label: 'JSON' },
  'application/xml': { icon: FileText, label: 'XML' },
  'text/xml': { icon: FileText, label: 'XML' },
  // Images
  'image/jpeg': { icon: Image, label: 'JPEG' },
  'image/png': { icon: Image, label: 'PNG' },
  'image/webp': { icon: Image, label: 'WebP' },
  'image/gif': { icon: Image, label: 'GIF' },
  'image/svg+xml': { icon: Image, label: 'SVG' },
};

const ACCEPTED_EXTENSIONS = '.csv,.xls,.xlsx,.pdf,.doc,.docx,.ppt,.pptx,.txt,.md,.html,.css,.js,.ts,.tsx,.py,.ipynb,.json,.xml,.jpeg,.jpg,.png,.webp,.gif,.svg';
const MAX_FILE_SIZE = 20 * 1024 * 1024; // 20MB
const MAX_FILES = 10;

interface ChatInputBarProps {
  onSendMessage: (message: string, attachments?: ChatAttachment[], mentionedAgentIds?: string[]) => void;
  onStartRecording: () => void;
  onStopRecording: () => void;
  isRecording: boolean;
  isTranscribing: boolean;
  transcriptionPreview: string;
  selectedAgents: ChatAgent[];
  onRemoveAgent: (agentId: string) => void;
  onAddAgentFromMention?: (agentId: string) => void;
  disabled?: boolean;
}

// Created by Francis Okorie Iyeke-Kanu
export function ChatInputBar({
  onSendMessage,
  onStartRecording,
  onStopRecording,
  isRecording,
  isTranscribing,
  transcriptionPreview,
  selectedAgents,
  onRemoveAgent,
  onAddAgentFromMention,
  disabled,
}: ChatInputBarProps) {
  const [message, setMessage] = useState('');
  const [attachments, setAttachments] = useState<ChatAttachment[]>([]);
  const [selectedMentionIndex, setSelectedMentionIndex] = useState(0);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();
  
  const { mentionState, handleInputChange, insertMention, parseMentions, closeMention } = useAgentMention();

  // Auto-resize textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = Math.min(textareaRef.current.scrollHeight, 120) + 'px';
    }
  }, [message]);

  // Reset selected index when suggestions change
  useEffect(() => {
    setSelectedMentionIndex(0);
  }, [mentionState.suggestions]);

  const handleSelectMention = useCallback((agent: ChatAgent) => {
    const newMessage = insertMention(agent, message);
    setMessage(newMessage);
    // Optionally add the agent to selected agents
    if (onAddAgentFromMention && !selectedAgents.find(a => a.id === agent.id)) {
      onAddAgentFromMention(agent.id);
    }
    textareaRef.current?.focus();
  }, [insertMention, message, onAddAgentFromMention, selectedAgents]);

  const handleSend = () => {
    if ((message.trim() || attachments.length > 0) && !disabled) {
      const mentions = parseMentions(message);
      const mentionedIds = mentions.map(m => m.id);
      onSendMessage(message.trim(), attachments.length > 0 ? attachments : undefined, mentionedIds.length > 0 ? mentionedIds : undefined);
      setMessage('');
      setAttachments([]);
      closeMention();
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (mentionState.isActive && mentionState.suggestions.length > 0) {
      if (e.key === 'ArrowDown') {
        e.preventDefault();
        setSelectedMentionIndex(prev => 
          prev < mentionState.suggestions.length - 1 ? prev + 1 : 0
        );
        return;
      }
      if (e.key === 'ArrowUp') {
        e.preventDefault();
        setSelectedMentionIndex(prev => 
          prev > 0 ? prev - 1 : mentionState.suggestions.length - 1
        );
        return;
      }
      if (e.key === 'Enter' || e.key === 'Tab') {
        e.preventDefault();
        handleSelectMention(mentionState.suggestions[selectedMentionIndex]);
        return;
      }
      if (e.key === 'Escape') {
        e.preventDefault();
        closeMention();
        return;
      }
    }
    
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const value = e.target.value;
    const cursorPosition = e.target.selectionStart || 0;
    setMessage(value);
    handleInputChange(value, cursorPosition);
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    
    if (attachments.length + files.length > MAX_FILES) {
      toast({
        title: 'Too many files',
        description: `Maximum ${MAX_FILES} files allowed per message.`,
        variant: 'destructive',
      });
      return;
    }

    const validFiles: ChatAttachment[] = [];
    
    for (const file of files) {
      if (file.size > MAX_FILE_SIZE) {
        toast({
          title: 'File too large',
          description: `${file.name} exceeds 20MB limit.`,
          variant: 'destructive',
        });
        continue;
      }

      // Create preview URL for images
      const isImage = file.type.startsWith('image/');
      const previewUrl = isImage ? URL.createObjectURL(file) : undefined;

      validFiles.push({
        id: `file-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        name: file.name,
        type: file.type,
        size: file.size,
        file,
        previewUrl,
      });
    }

    setAttachments((prev) => [...prev, ...validFiles]);
    
    // Reset input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const removeAttachment = (id: string) => {
    setAttachments((prev) => {
      const attachment = prev.find((a) => a.id === id);
      if (attachment?.previewUrl) {
        URL.revokeObjectURL(attachment.previewUrl);
      }
      return prev.filter((a) => a.id !== id);
    });
  };

  const getFileIcon = (type: string) => {
    const config = ACCEPTED_FILE_TYPES[type as keyof typeof ACCEPTED_FILE_TYPES];
    return config?.icon || File;
  };

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
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

        {/* Attached Files */}
        {attachments.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {attachments.map((attachment) => {
              const FileIcon = getFileIcon(attachment.type);
              const isImage = attachment.type.startsWith('image/');

              return (
                <div
                  key={attachment.id}
                  className="relative group flex items-center gap-2 px-3 py-2 rounded-lg bg-secondary border border-border"
                >
                  {isImage && attachment.previewUrl ? (
                    <img
                      src={attachment.previewUrl}
                      alt={attachment.name}
                      className="w-10 h-10 object-cover rounded"
                    />
                  ) : (
                    <div className="w-10 h-10 flex items-center justify-center rounded bg-muted">
                      <FileIcon className="w-5 h-5 text-muted-foreground" />
                    </div>
                  )}
                  <div className="flex flex-col min-w-0">
                    <span className="text-sm font-medium truncate max-w-[120px]">
                      {attachment.name}
                    </span>
                    <span className="text-xs text-muted-foreground">
                      {formatFileSize(attachment.size)}
                    </span>
                  </div>
                  <button
                    onClick={() => removeAttachment(attachment.id)}
                    className="absolute -top-1 -right-1 p-1 rounded-full bg-destructive text-destructive-foreground opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </div>
              );
            })}
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
            {/* File Upload Button */}
            <input
              ref={fileInputRef}
              type="file"
              accept={ACCEPTED_EXTENSIONS}
              multiple
              onChange={handleFileSelect}
              className="hidden"
            />
            <Button
              variant="outline"
              size="icon"
              className="rounded-full h-11 w-11 flex-shrink-0"
              onClick={() => fileInputRef.current?.click()}
              disabled={disabled || attachments.length >= MAX_FILES}
            >
              <Paperclip className="w-5 h-5" />
            </Button>

            <div className="flex-1 relative">
              {/* @Mention Popover */}
              {mentionState.isActive && mentionState.suggestions.length > 0 && (
                <AgentMentionPopover
                  suggestions={mentionState.suggestions}
                  selectedIndex={selectedMentionIndex}
                  onSelect={handleSelectMention}
                  position="above"
                />
              )}
              
              <Textarea
                ref={textareaRef}
                value={message}
                onChange={handleChange}
                onKeyDown={handleKeyDown}
                placeholder="Type @ to mention an agent, or ask a question..."
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
              disabled={(!message.trim() && attachments.length === 0) || disabled}
            >
              <Send className="w-5 h-5" />
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
