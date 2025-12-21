import { User, ChevronRight, LogOut } from 'lucide-react';
import { cn } from '@/lib/utils';
import { MockUser } from '@/pages/AuthPage';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

interface UserMenuProps {
  user: MockUser;
  onViewProfile: () => void;
  onLogout: () => void;
}

export function UserMenu({ user, onViewProfile, onLogout }: UserMenuProps) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button className="flex items-center gap-2 px-2 py-1.5 rounded-lg hover:bg-secondary/50 transition-colors">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary/30 to-accent/30 border border-primary/30 flex items-center justify-center">
            <User className="w-4 h-4 text-primary" />
          </div>
          <div className="hidden lg:block text-left">
            <p className="text-sm font-medium leading-tight">{user.name}</p>
            <p className="text-[10px] text-muted-foreground leading-tight">{user.email}</p>
          </div>
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56 bg-card border-border z-50">
        <DropdownMenuLabel className="font-display">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-primary/30 to-accent/30 flex items-center justify-center">
              <User className="w-5 h-5 text-primary" />
            </div>
            <div>
              <p className="font-semibold">{user.name}</p>
              <p className="text-xs text-muted-foreground font-normal">{user.email}</p>
            </div>
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        
        <DropdownMenuItem onClick={onViewProfile} className="cursor-pointer">
          <User className="mr-2 h-4 w-4" />
          <span>View Profile</span>
          <ChevronRight className="ml-auto h-4 w-4 text-muted-foreground" />
        </DropdownMenuItem>
        
        <DropdownMenuSeparator />
        
        <DropdownMenuItem 
          onClick={onLogout} 
          className="cursor-pointer text-destructive focus:text-destructive"
        >
          <LogOut className="mr-2 h-4 w-4" />
          <span>Sign Out</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
