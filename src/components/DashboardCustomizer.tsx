import { Settings2, GripVertical, RotateCcw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Switch } from '@/components/ui/switch';
import { useDashboardCustomization, DashboardWidget } from '@/hooks/useDashboardCustomization';
import { cn } from '@/lib/utils';

export function DashboardCustomizer() {
  const { widgets, toggleWidget, resetToDefault } = useDashboardCustomization();

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="gap-2">
          <Settings2 className="h-4 w-4" />
          Customize
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center justify-between">
            Customize Dashboard
            <Button variant="ghost" size="sm" onClick={resetToDefault} className="text-xs">
              <RotateCcw className="h-3 w-3 mr-1" />
              Reset
            </Button>
          </DialogTitle>
        </DialogHeader>
        <div className="space-y-1 py-4">
          <p className="text-sm text-muted-foreground mb-4">
            Toggle widgets to show or hide them on your dashboard.
          </p>
          {widgets.sort((a, b) => a.order - b.order).map((widget) => (
            <div 
              key={widget.id}
              className={cn(
                "flex items-center justify-between p-3 rounded-lg border border-border",
                widget.enabled ? "bg-muted/30" : "bg-background"
              )}
            >
              <div className="flex items-center gap-3">
                <GripVertical className="h-4 w-4 text-muted-foreground/50 cursor-grab" />
                <div>
                  <p className="text-sm font-medium">{widget.name}</p>
                  <p className="text-xs text-muted-foreground">{widget.description}</p>
                </div>
              </div>
              <Switch
                checked={widget.enabled}
                onCheckedChange={() => toggleWidget(widget.id)}
              />
            </div>
          ))}
        </div>
      </DialogContent>
    </Dialog>
  );
}
