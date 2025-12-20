/**
 * Settings Page
 * Author: Francis Okorie Iyeke-Kanu
 */
import { useState } from 'react';
import { Settings, Shield, Eye, ScrollText, Terminal, Globe, Mail, FolderOpen } from 'lucide-react';
import { Switch } from '@/components/ui/switch';
import { AutonomyLevel } from '@/types/agent';
import { cn } from '@/lib/utils';
import { ProviderConfigSection } from '@/components/settings/ProviderConfigSection';

const autonomyLevels: { id: AutonomyLevel; label: string; description: string }[] = [
  { id: 'manual', label: 'Manual', description: 'All actions require approval' },
  { id: 'assisted', label: 'Assisted', description: 'Safe actions auto-approved' },
  { id: 'autonomous', label: 'Autonomous', description: 'Full autonomy enabled' },
];

interface SettingsPageProps {
  autonomyLevel: AutonomyLevel;
  onAutonomyChange: (level: AutonomyLevel) => void;
}

// Francis Okorie Iyeke-Kanu
export function SettingsPage({ autonomyLevel, onAutonomyChange }: SettingsPageProps) {
  const [permissions, setPermissions] = useState({
    terminal: true,
    browser: true,
    email: false,
    files: true,
  });
  
  const [visionSettings, setVisionSettings] = useState({
    autoCapture: true,
    ocrEnabled: true,
    elementDetection: true,
  });

  const [loggingLevel, setLoggingLevel] = useState<'minimal' | 'normal' | 'verbose'>('normal');

  return (
    <div className="space-y-6 animate-slide-up">
      <div className="flex items-center gap-2">
        <Settings className="w-5 h-5 text-primary" />
        <h2 className="text-lg font-semibold">Settings</h2>
      </div>

      {/* Provider Configuration */}
      <ProviderConfigSection />

      {/* Autonomy Level */}
      <div className="space-y-3">
        <h3 className="text-xs font-medium text-muted-foreground uppercase tracking-wider flex items-center gap-1.5">
          <Shield className="w-3.5 h-3.5" />
          Autonomy Level
        </h3>
        <div className="grid gap-2">
          {autonomyLevels.map((level) => (
            <button
              key={level.id}
              onClick={() => onAutonomyChange(level.id)}
              className={cn(
                'flex items-center justify-between p-3 rounded-lg border transition-all text-left',
                autonomyLevel === level.id
                  ? 'border-primary bg-primary/10'
                  : 'border-border bg-card hover:border-primary/30'
              )}
            >
              <div>
                <p className="text-sm font-medium">{level.label}</p>
                <p className="text-xs text-muted-foreground">{level.description}</p>
              </div>
              <div className={cn(
                'w-4 h-4 rounded-full border-2 transition-all',
                autonomyLevel === level.id
                  ? 'border-primary bg-primary'
                  : 'border-muted-foreground'
              )} />
            </button>
          ))}
        </div>
      </div>

      {/* Tool Permissions */}
      <div className="space-y-3">
        <h3 className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Tool Permissions</h3>
        <div className="rounded-lg border border-border bg-card divide-y divide-border">
          {[
            { key: 'terminal', label: 'Terminal Access', icon: Terminal, description: 'Execute shell commands' },
            { key: 'browser', label: 'Browser Control', icon: Globe, description: 'Navigate and interact with websites' },
            { key: 'email', label: 'Email Access', icon: Mail, description: 'Send and read emails' },
            { key: 'files', label: 'File System', icon: FolderOpen, description: 'Read and write files' },
          ].map((tool) => {
            const Icon = tool.icon;
            return (
              <div key={tool.key} className="flex items-center justify-between p-3">
                <div className="flex items-center gap-3">
                  <Icon className="w-4 h-4 text-muted-foreground" />
                  <div>
                    <p className="text-sm">{tool.label}</p>
                    <p className="text-xs text-muted-foreground">{tool.description}</p>
                  </div>
                </div>
                <Switch
                  checked={permissions[tool.key as keyof typeof permissions]}
                  onCheckedChange={(checked) => 
                    setPermissions(prev => ({ ...prev, [tool.key]: checked }))
                  }
                />
              </div>
            );
          })}
        </div>
      </div>

      {/* Vision Configuration */}
      <div className="space-y-3">
        <h3 className="text-xs font-medium text-muted-foreground uppercase tracking-wider flex items-center gap-1.5">
          <Eye className="w-3.5 h-3.5" />
          Vision Settings
        </h3>
        <div className="rounded-lg border border-border bg-card divide-y divide-border">
          {[
            { key: 'autoCapture', label: 'Auto Screen Capture', description: 'Capture screen on each action' },
            { key: 'ocrEnabled', label: 'OCR Processing', description: 'Extract text from screenshots' },
            { key: 'elementDetection', label: 'UI Element Detection', description: 'Detect clickable elements' },
          ].map((setting) => (
            <div key={setting.key} className="flex items-center justify-between p-3">
              <div>
                <p className="text-sm">{setting.label}</p>
                <p className="text-xs text-muted-foreground">{setting.description}</p>
              </div>
              <Switch
                checked={visionSettings[setting.key as keyof typeof visionSettings]}
                onCheckedChange={(checked) => 
                  setVisionSettings(prev => ({ ...prev, [setting.key]: checked }))
                }
              />
            </div>
          ))}
        </div>
      </div>

      {/* Logging */}
      <div className="space-y-3">
        <h3 className="text-xs font-medium text-muted-foreground uppercase tracking-wider flex items-center gap-1.5">
          <ScrollText className="w-3.5 h-3.5" />
          Logging Verbosity
        </h3>
        <div className="flex gap-2 p-1 bg-secondary/50 rounded-lg">
          {(['minimal', 'normal', 'verbose'] as const).map((level) => (
            <button
              key={level}
              onClick={() => setLoggingLevel(level)}
              className={cn(
                'flex-1 py-2 px-3 rounded-md text-xs font-medium transition-all capitalize',
                loggingLevel === level
                  ? 'bg-card text-foreground shadow-sm'
                  : 'text-muted-foreground hover:text-foreground'
              )}
            >
              {level}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
