import { useState } from 'react';
import { 
  ArrowLeft, Mail, Shield, Clock, Trophy, Target, 
  Edit2, Camera, Bell, Moon, LogOut, ChevronRight,
  User, Settings, Activity
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { MockUser } from '@/pages/AuthPage';
import { cn } from '@/lib/utils';

interface ProfilePageProps {
  user: MockUser;
  onBack: () => void;
  onLogout: () => void;
  onUpdateUser: (user: MockUser) => void;
}

const roleLabels: Record<MockUser['role'], { label: string; color: string }> = {
  admin: { label: 'Administrator', color: 'text-destructive' },
  operator: { label: 'Fleet Operator', color: 'text-primary' },
  viewer: { label: 'Viewer', color: 'text-muted-foreground' },
};

export function ProfilePage({ user, onBack, onLogout, onUpdateUser }: ProfilePageProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [name, setName] = useState(user.name);
  const [notifications, setNotifications] = useState(true);
  const [darkMode, setDarkMode] = useState(true);

  const handleSave = () => {
    onUpdateUser({ ...user, name });
    setIsEditing(false);
  };

  const stats = {
    totalSessions: 47,
    avgSessionTime: '2h 34m',
    tasksApproved: 156,
    agentsManaged: 5,
  };

  return (
    <div className="space-y-6 animate-slide-up">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="icon" onClick={onBack}>
          <ArrowLeft className="w-5 h-5" />
        </Button>
        <h1 className="text-xl font-display font-bold">Profile</h1>
      </div>

      {/* Profile Card */}
      <div className="glass-card p-6 rounded-xl">
        <div className="flex items-start gap-4">
          {/* Avatar */}
          <div className="relative">
            <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-primary/30 to-accent/30 border-2 border-primary/50 flex items-center justify-center text-4xl">
              {user.avatar}
            </div>
            <button className="absolute -bottom-1 -right-1 w-8 h-8 rounded-full bg-primary flex items-center justify-center text-primary-foreground hover:bg-primary/90 transition-colors">
              <Camera className="w-4 h-4" />
            </button>
          </div>

          {/* Info */}
          <div className="flex-1">
            {isEditing ? (
              <div className="space-y-2">
                <Input
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="font-display font-bold"
                />
                <div className="flex gap-2">
                  <Button size="sm" onClick={handleSave}>Save</Button>
                  <Button size="sm" variant="ghost" onClick={() => setIsEditing(false)}>Cancel</Button>
                </div>
              </div>
            ) : (
              <>
                <div className="flex items-center gap-2">
                  <h2 className="text-xl font-display font-bold">{user.name}</h2>
                  <button 
                    onClick={() => setIsEditing(true)}
                    className="p-1 hover:bg-secondary rounded"
                  >
                    <Edit2 className="w-4 h-4 text-muted-foreground" />
                  </button>
                </div>
                <p className="text-sm text-muted-foreground flex items-center gap-1 mt-1">
                  <Mail className="w-3 h-3" />
                  {user.email}
                </p>
                <span className={cn(
                  "inline-flex items-center gap-1 text-xs font-medium mt-2 px-2 py-1 rounded-full bg-primary/10",
                  roleLabels[user.role].color
                )}>
                  <Shield className="w-3 h-3" />
                  {roleLabels[user.role].label}
                </span>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 gap-3">
        <div className="glass-card p-4 rounded-xl">
          <div className="flex items-center gap-2 text-muted-foreground mb-2">
            <Activity className="w-4 h-4" />
            <span className="text-xs">Sessions</span>
          </div>
          <p className="text-2xl font-mono font-bold">{stats.totalSessions}</p>
        </div>
        <div className="glass-card p-4 rounded-xl">
          <div className="flex items-center gap-2 text-muted-foreground mb-2">
            <Clock className="w-4 h-4" />
            <span className="text-xs">Avg. Time</span>
          </div>
          <p className="text-2xl font-mono font-bold">{stats.avgSessionTime}</p>
        </div>
        <div className="glass-card p-4 rounded-xl">
          <div className="flex items-center gap-2 text-muted-foreground mb-2">
            <Target className="w-4 h-4" />
            <span className="text-xs">Approved</span>
          </div>
          <p className="text-2xl font-mono font-bold">{stats.tasksApproved}</p>
        </div>
        <div className="glass-card p-4 rounded-xl">
          <div className="flex items-center gap-2 text-muted-foreground mb-2">
            <Trophy className="w-4 h-4" />
            <span className="text-xs">Agents</span>
          </div>
          <p className="text-2xl font-mono font-bold">{stats.agentsManaged}</p>
        </div>
      </div>

      {/* Settings Section */}
      <div className="glass-card rounded-xl overflow-hidden">
        <div className="p-4 border-b border-border">
          <h3 className="font-display font-semibold flex items-center gap-2">
            <Settings className="w-4 h-4" />
            Preferences
          </h3>
        </div>

        <div className="divide-y divide-border">
          <div className="flex items-center justify-between p-4">
            <div className="flex items-center gap-3">
              <Bell className="w-5 h-5 text-muted-foreground" />
              <div>
                <p className="font-medium text-sm">Notifications</p>
                <p className="text-xs text-muted-foreground">Receive alerts and updates</p>
              </div>
            </div>
            <Switch checked={notifications} onCheckedChange={setNotifications} />
          </div>

          <div className="flex items-center justify-between p-4">
            <div className="flex items-center gap-3">
              <Moon className="w-5 h-5 text-muted-foreground" />
              <div>
                <p className="font-medium text-sm">Dark Mode</p>
                <p className="text-xs text-muted-foreground">Use dark theme</p>
              </div>
            </div>
            <Switch checked={darkMode} onCheckedChange={setDarkMode} />
          </div>

          <button className="flex items-center justify-between p-4 w-full hover:bg-secondary/50 transition-colors">
            <div className="flex items-center gap-3">
              <User className="w-5 h-5 text-muted-foreground" />
              <div className="text-left">
                <p className="font-medium text-sm">Account Settings</p>
                <p className="text-xs text-muted-foreground">Manage your account</p>
              </div>
            </div>
            <ChevronRight className="w-5 h-5 text-muted-foreground" />
          </button>
        </div>
      </div>

      {/* Member Since */}
      <div className="text-center text-sm text-muted-foreground">
        <p>Member since {user.createdAt.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}</p>
      </div>

      {/* Logout Button */}
      <Button 
        variant="outline" 
        className="w-full text-destructive hover:text-destructive hover:bg-destructive/10 border-destructive/30"
        onClick={onLogout}
      >
        <LogOut className="w-4 h-4 mr-2" />
        Sign Out
      </Button>
    </div>
  );
}
