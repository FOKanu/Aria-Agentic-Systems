import { cn } from '@/lib/utils';
import { ChatMessage as ChatMessageType, ChatAttachment } from '@/types/chat';
import { format } from 'date-fns';
import { CheckCircle2, Clock, AlertCircle, Loader2, FileText, Image, File } from 'lucide-react';

interface ChatMessageProps {
  message: ChatMessageType;
}

const getFileIcon = (type: string) => {
  if (type.startsWith('image/')) return Image;
  if (type.includes('pdf') || type.includes('document') || type.includes('text')) return FileText;
  return File;
};

const formatFileSize = (bytes: number) => {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
};

function AttachmentPreview({ attachment, isUser }: { attachment: ChatAttachment; isUser: boolean }) {
  const isImage = attachment.type.startsWith('image/');
  const FileIcon = getFileIcon(attachment.type);

  if (isImage && attachment.previewUrl) {
    return (
      <div className="rounded-lg overflow-hidden max-w-[200px]">
        <img
          src={attachment.previewUrl}
          alt={attachment.name}
          className="w-full h-auto object-cover"
        />
        <div className={cn(
          "px-2 py-1 text-xs truncate",
          isUser ? "bg-primary-foreground/10" : "bg-secondary"
        )}>
          {attachment.name}
        </div>
      </div>
    );
  }

  return (
    <div className={cn(
      "flex items-center gap-2 px-3 py-2 rounded-lg",
      isUser ? "bg-primary-foreground/10" : "bg-muted"
    )}>
      <FileIcon className="w-5 h-5 flex-shrink-0" />
      <div className="min-w-0 flex-1">
        <p className="text-sm font-medium truncate">{attachment.name}</p>
        <p className="text-xs opacity-70">{formatFileSize(attachment.size)}</p>
      </div>
    </div>
  );
}

export function ChatMessage({ message }: ChatMessageProps) {
  const isUser = message.sender === 'user';
  const isSystem = message.sender === 'system';

  const getStatusIcon = (status?: string) => {
    switch (status) {
      case 'started':
        return <Loader2 className="w-4 h-4 animate-spin text-primary" />;
      case 'completed':
        return <CheckCircle2 className="w-4 h-4 text-success" />;
      case 'waiting':
        return <Clock className="w-4 h-4 text-warning" />;
      case 'error':
        return <AlertCircle className="w-4 h-4 text-destructive" />;
      default:
        return null;
    }
  };

  if (isSystem) {
    return (
      <div className="flex justify-center my-3">
        <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-muted/50 text-muted-foreground text-sm">
          {message.structuredData?.status && getStatusIcon(message.structuredData.status)}
          <span>{message.content}</span>
        </div>
      </div>
    );
  }

  return (
    <div className={cn('flex gap-3 mb-4', isUser ? 'flex-row-reverse' : 'flex-row')}>
      {/* Avatar */}
      {!isUser && (
        <div className="flex-shrink-0 w-10 h-10 rounded-full bg-secondary flex items-center justify-center text-lg">
          {message.agentAvatar || '🤖'}
        </div>
      )}

      {/* Message Content */}
      <div className={cn('flex flex-col max-w-[80%]', isUser && 'items-end')}>
        {/* Agent Attribution */}
        {!isUser && message.agentName && (
          <div className="flex items-center gap-2 mb-1">
            <span className="text-sm font-medium text-foreground">{message.agentName}</span>
            {message.agentRole && (
              <span className="text-xs text-muted-foreground capitalize">• {message.agentRole}</span>
            )}
            {message.confidence !== undefined && (
              <span className="text-xs text-muted-foreground">({message.confidence}%)</span>
            )}
          </div>
        )}

        {/* Attachments */}
        {message.attachments && message.attachments.length > 0 && (
          <div className={cn(
            "flex flex-wrap gap-2 mb-2",
            isUser && "justify-end"
          )}>
            {message.attachments.map((attachment) => (
              <AttachmentPreview key={attachment.id} attachment={attachment} isUser={isUser} />
            ))}
          </div>
        )}

        {/* Message Bubble */}
        {message.content && (
          <div
            className={cn(
              'px-4 py-3 rounded-2xl',
              isUser
                ? 'bg-primary text-primary-foreground rounded-br-sm'
                : 'bg-secondary text-secondary-foreground rounded-bl-sm',
              message.isStreaming && 'animate-pulse'
            )}
          >
            {message.type === 'structured' && message.structuredData ? (
              <div className="space-y-2">
                {message.structuredData.title && (
                  <p className="font-medium">{message.structuredData.title}</p>
                )}
                {message.structuredData.items && (
                  <ul className="space-y-1 list-disc list-inside text-sm">
                    {message.structuredData.items.map((item, idx) => (
                      <li key={idx}>{item}</li>
                    ))}
                  </ul>
                )}
                {message.content && <p className="text-sm">{message.content}</p>}
              </div>
            ) : (
              <p className="whitespace-pre-wrap">{message.content}</p>
            )}
          </div>
        )}

        {/* Timestamp */}
        <span className="text-xs text-muted-foreground mt-1">
          {format(message.timestamp, 'HH:mm')}
        </span>
      </div>
    </div>
  );
}
