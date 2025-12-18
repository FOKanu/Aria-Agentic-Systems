import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Keyboard } from 'lucide-react';
import { KEYBOARD_SHORTCUTS } from '@/hooks/useKeyboardShortcuts';

interface KeyboardShortcutsHelpProps {
  trigger?: React.ReactNode;
}

export function KeyboardShortcutsHelp({ trigger }: KeyboardShortcutsHelpProps) {
  return (
    <Dialog>
      <DialogTrigger asChild>
        {trigger || (
          <Button variant="ghost" size="icon" className="h-8 w-8">
            <Keyboard className="h-4 w-4" />
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Keyboard className="h-5 w-5" />
            Keyboard Shortcuts
          </DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            {KEYBOARD_SHORTCUTS.map((shortcut, index) => (
              <div 
                key={index}
                className="flex items-center justify-between py-1.5 border-b border-border/50 last:border-0"
              >
                <span className="text-sm text-muted-foreground">
                  {shortcut.description}
                </span>
                <div className="flex items-center gap-1">
                  {shortcut.keys.map((key, keyIndex) => (
                    <span key={keyIndex}>
                      <kbd className="px-2 py-1 text-xs font-semibold bg-muted rounded border border-border">
                        {key}
                      </kbd>
                      {keyIndex < shortcut.keys.length - 1 && (
                        <span className="mx-1 text-muted-foreground">+</span>
                      )}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
