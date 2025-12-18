import { Bell, Volume2, VolumeX, RotateCcw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import { useNotificationPreferences } from '@/hooks/useNotificationPreferences';
import { cn } from '@/lib/utils';

interface PreferenceRowProps {
  label: string;
  description?: string;
  checked: boolean;
  onCheckedChange: (checked: boolean) => void;
  disabled?: boolean;
}

function PreferenceRow({ label, description, checked, onCheckedChange, disabled }: PreferenceRowProps) {
  return (
    <div className={cn(
      "flex items-center justify-between py-3",
      disabled && "opacity-50"
    )}>
      <div>
        <p className="text-sm font-medium">{label}</p>
        {description && (
          <p className="text-xs text-muted-foreground">{description}</p>
        )}
      </div>
      <Switch
        checked={checked}
        onCheckedChange={onCheckedChange}
        disabled={disabled}
      />
    </div>
  );
}

export function NotificationPreferencesDialog() {
  const { preferences, updatePreference, resetToDefault } = useNotificationPreferences();

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="gap-2">
          <Bell className="h-4 w-4" />
          Notification Settings
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center justify-between">
            Notification Preferences
            <Button variant="ghost" size="sm" onClick={resetToDefault} className="text-xs">
              <RotateCcw className="h-3 w-3 mr-1" />
              Reset
            </Button>
          </DialogTitle>
        </DialogHeader>
        <div className="py-4 space-y-4">
          {/* Global Settings */}
          <div>
            <h4 className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-2">
              Global Settings
            </h4>
            <div className="space-y-1 divide-y divide-border">
              <PreferenceRow
                label="Enable Notifications"
                description="Master toggle for all notifications"
                checked={preferences.enabled}
                onCheckedChange={(v) => updatePreference('enabled', v)}
              />
              <PreferenceRow
                label="Sound"
                description="Play sound for new notifications"
                checked={preferences.sound}
                onCheckedChange={(v) => updatePreference('sound', v)}
                disabled={!preferences.enabled}
              />
            </div>
          </div>

          <Separator />

          {/* Category Settings */}
          <div>
            <h4 className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-2">
              Notification Types
            </h4>
            <div className="space-y-1 divide-y divide-border">
              <PreferenceRow
                label="Task Completions"
                description="When agents complete tasks"
                checked={preferences.taskCompletions}
                onCheckedChange={(v) => updatePreference('taskCompletions', v)}
                disabled={!preferences.enabled}
              />
              <PreferenceRow
                label="Task Failures"
                description="When tasks fail or error"
                checked={preferences.taskFailures}
                onCheckedChange={(v) => updatePreference('taskFailures', v)}
                disabled={!preferences.enabled}
              />
              <PreferenceRow
                label="Agent Status Changes"
                description="When agents start, stop, or pause"
                checked={preferences.agentStatus}
                onCheckedChange={(v) => updatePreference('agentStatus', v)}
                disabled={!preferences.enabled}
              />
              <PreferenceRow
                label="Approval Requests"
                description="When agents need your approval"
                checked={preferences.approvalRequests}
                onCheckedChange={(v) => updatePreference('approvalRequests', v)}
                disabled={!preferences.enabled}
              />
              <PreferenceRow
                label="System Alerts"
                description="Important system notifications"
                checked={preferences.systemAlerts}
                onCheckedChange={(v) => updatePreference('systemAlerts', v)}
                disabled={!preferences.enabled}
              />
            </div>
          </div>

          <Separator />

          {/* Display Settings */}
          <div>
            <h4 className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-2">
              Display
            </h4>
            <div className="space-y-1 divide-y divide-border">
              <PreferenceRow
                label="Show Badge Count"
                description="Display unread count on bell icon"
                checked={preferences.showBadge}
                onCheckedChange={(v) => updatePreference('showBadge', v)}
                disabled={!preferences.enabled}
              />
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
