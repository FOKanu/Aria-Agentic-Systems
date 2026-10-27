// Memory Page - Created by Francis Okorie Iyeke-Kanu
import { useState } from 'react';
import { Brain, Clock, Database, Wrench, FileText } from 'lucide-react';
import { cn } from '@/lib/utils';
import { mockMemoryShortTerm, mockMemoryLongTerm, mockToolUsage, mockAnalyzedFiles } from '@/data/mockData';
import { formatDistanceToNow } from 'date-fns';

type MemoryTab = 'short' | 'long' | 'tools' | 'files';

const tabs: { id: MemoryTab; label: string; icon: React.ElementType }[] = [
  { id: 'short', label: 'Short-term', icon: Clock },
  { id: 'long', label: 'Long-term', icon: Database },
  { id: 'tools', label: 'Tools', icon: Wrench },
  { id: 'files', label: 'Files', icon: FileText },
];

/* © Francis Okorie Iyeke-Kanu */
export function MemoryPage() {
  const [activeTab, setActiveTab] = useState<MemoryTab>('short');

  return (
    <div className="space-y-4 animate-slide-up">
      <div className="flex items-center gap-2">
        <Brain className="w-5 h-5 text-primary" />
        <h2 className="text-lg font-semibold">Memory & Context</h2>
      </div>

      {/* Tab Navigation */}
      <div className="flex gap-1 p-1 bg-secondary/50 rounded-lg">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={cn(
                'flex-1 flex items-center justify-center gap-1.5 py-2 px-2 rounded-md text-xs font-medium transition-all',
                activeTab === tab.id
                  ? 'bg-card text-foreground shadow-sm'
                  : 'text-muted-foreground hover:text-foreground'
              )}
            >
              <Icon className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* Tab Content */}
      <div className="space-y-2">
        {activeTab === 'short' && (
          <>
            <p className="text-xs text-muted-foreground">{mockMemoryShortTerm.length} entries in working memory</p>
            {mockMemoryShortTerm.map((entry) => (
              <div key={entry.id} className="rounded-lg border border-border bg-card p-3 space-y-1.5">
                <p className="text-sm">{entry.content}</p>
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <Clock className="w-3 h-3" />
                  <span>{formatDistanceToNow(new Date(entry.timestamp), { addSuffix: true })}</span>
                  {entry.relevance && (
                    <>
                      <span>•</span>
                      <span>{Math.round(entry.relevance * 100)}% relevance</span>
                    </>
                  )}
                </div>
              </div>
            ))}
          </>
        )}

        {activeTab === 'long' && (
          <>
            <p className="text-xs text-muted-foreground">{mockMemoryLongTerm.length} persistent memories</p>
            {mockMemoryLongTerm.map((entry) => (
              <div key={entry.id} className="rounded-lg border border-border bg-card p-3 space-y-1.5">
                <p className="text-sm">{entry.content}</p>
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <Database className="w-3 h-3" />
                  <span>{formatDistanceToNow(new Date(entry.timestamp), { addSuffix: true })}</span>
                </div>
              </div>
            ))}
          </>
        )}

        {activeTab === 'tools' && (
          <>
            <p className="text-xs text-muted-foreground">{mockToolUsage.length} tool invocations</p>
            {mockToolUsage.map((usage) => (
              <div key={usage.id} className="rounded-lg border border-border bg-card p-3 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-mono font-medium text-primary">{usage.tool}</span>
                  <span className={cn(
                    'text-[10px] px-1.5 py-0.5 rounded',
                    usage.success ? 'bg-success/20 text-success' : 'bg-destructive/20 text-destructive'
                  )}>
                    {usage.success ? 'success' : 'failed'}
                  </span>
                </div>
                <div className="space-y-1 text-xs">
                  <p className="text-muted-foreground">
                    <span className="text-foreground/60">→</span> {usage.input}
                  </p>
                  <p className="text-muted-foreground font-mono bg-secondary/50 p-1.5 rounded">
                    <span className="text-foreground/60">←</span> {usage.output}
                  </p>
                </div>
                <p className="text-[10px] text-muted-foreground">
                  {formatDistanceToNow(new Date(usage.timestamp), { addSuffix: true })}
                </p>
              </div>
            ))}
          </>
        )}

        {activeTab === 'files' && (
          <>
            <p className="text-xs text-muted-foreground">{mockAnalyzedFiles.length} files analyzed</p>
            {mockAnalyzedFiles.map((file) => (
              <div key={file.id} className="rounded-lg border border-border bg-card p-3 space-y-2">
                <div className="flex items-center gap-2">
                  <FileText className="w-4 h-4 text-primary" />
                  <span className="text-sm font-medium">{file.name}</span>
                  <span className="text-[10px] px-1.5 py-0.5 rounded bg-secondary text-muted-foreground uppercase">
                    {file.type}
                  </span>
                </div>
                <p className="text-xs text-muted-foreground">{file.summary}</p>
                <p className="text-[10px] text-muted-foreground">
                  Analyzed {formatDistanceToNow(new Date(file.analyzedAt), { addSuffix: true })}
                </p>
              </div>
            ))}
          </>
        )}
      </div>
    </div>
  );
}
