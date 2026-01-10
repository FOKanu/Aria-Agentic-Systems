import { useState } from 'react';
import { Mail, Inbox, Send, Archive, Trash2, Star, Search, Plus, Paperclip, Clock, MailOpen, Settings } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { cn } from '@/lib/utils';
import { EmailSettingsPanel } from '@/components/email/EmailSettingsPanel';

interface Email {
  id: string;
  from: { name: string; email: string; avatar: string };
  subject: string;
  preview: string;
  date: string;
  isRead: boolean;
  isStarred: boolean;
  hasAttachment: boolean;
  folder: 'inbox' | 'sent' | 'archive' | 'trash';
  labels?: string[];
}

const mockEmails: Email[] = [
  { id: '1', from: { name: 'Alex Chen', email: 'alex@techcorp.com', avatar: '👨‍💻' }, subject: 'Q4 Project Update', preview: 'Hey team, I wanted to share the latest progress on our Q4 initiatives. We\'ve made significant headway on...', date: '10:30 AM', isRead: false, isStarred: true, hasAttachment: true, folder: 'inbox', labels: ['work', 'important'] },
  { id: '2', from: { name: 'Aria Agent', email: 'aria@system.ai', avatar: '🤖' }, subject: 'Weekly Task Summary', preview: 'Here\'s your automated weekly summary. You completed 23 tasks this week with a 94% success rate...', date: '9:15 AM', isRead: true, isStarred: false, hasAttachment: false, folder: 'inbox', labels: ['automated'] },
  { id: '3', from: { name: 'Sarah Miller', email: 'sarah@designlab.io', avatar: '👩‍🎨' }, subject: 'Design Review Feedback', preview: 'Thanks for sharing the mockups! I have some thoughts on the color palette and typography...', date: 'Yesterday', isRead: true, isStarred: false, hasAttachment: true, folder: 'inbox' },
  { id: '4', from: { name: 'Meeting Reminder', email: 'calendar@aria.ai', avatar: '📅' }, subject: 'Upcoming: Team Sync at 2 PM', preview: 'Your meeting "Team Sync" is starting in 1 hour. Click to join the video call...', date: 'Yesterday', isRead: true, isStarred: false, hasAttachment: false, folder: 'inbox' },
  { id: '5', from: { name: 'You', email: 'me@aria.ai', avatar: '🧑' }, subject: 'RE: Project Proposal', preview: 'Thanks for your interest! I\'ve attached the detailed proposal document for your review...', date: '2 days ago', isRead: true, isStarred: false, hasAttachment: true, folder: 'sent' },
];

const folders = [
  { id: 'inbox', label: 'Inbox', icon: Inbox, count: 4 },
  { id: 'sent', label: 'Sent', icon: Send, count: 12 },
  { id: 'archive', label: 'Archive', icon: Archive, count: 45 },
  { id: 'trash', label: 'Trash', icon: Trash2, count: 3 },
];

export function EmailPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFolder, setActiveFolder] = useState('inbox');
  const [selectedEmail, setSelectedEmail] = useState<Email | null>(null);
  const [activeTab, setActiveTab] = useState('mail');

  const filteredEmails = mockEmails.filter(email => {
    const matchesFolder = email.folder === activeFolder;
    const matchesSearch = email.subject.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         email.from.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         email.preview.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesFolder && matchesSearch;
  });

  return (
    <div className="space-y-6 animate-slide-up">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
            <Mail className="w-5 h-5 text-primary" />
          </div>
          <div>
            <h1 className="text-xl font-bold font-display">Email</h1>
            <p className="text-sm text-muted-foreground">Manage your communications</p>
          </div>
        </div>
        <Button className="gap-2">
          <Plus className="w-4 h-4" />
          Compose
        </Button>
      </div>

      {/* Main Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="mail" className="gap-2">
            <Mail className="w-4 h-4" />
            Mail
          </TabsTrigger>
          <TabsTrigger value="settings" className="gap-2">
            <Settings className="w-4 h-4" />
            Settings
          </TabsTrigger>
        </TabsList>

        <TabsContent value="mail" className="mt-4">
          <div className="grid lg:grid-cols-4 gap-6">
            {/* Sidebar */}
            <div className="space-y-2">
              {folders.map(folder => {
                const Icon = folder.icon;
                return (
                  <button
                    key={folder.id}
                    onClick={() => setActiveFolder(folder.id)}
                    className={cn(
                      "w-full flex items-center justify-between p-3 rounded-lg transition-all text-sm",
                      activeFolder === folder.id
                        ? "bg-primary/10 text-primary"
                        : "hover:bg-secondary text-muted-foreground hover:text-foreground"
                    )}
                  >
                    <div className="flex items-center gap-3">
                      <Icon className="w-4 h-4" />
                      <span>{folder.label}</span>
                    </div>
                    {folder.count > 0 && (
                      <Badge variant="secondary" className="text-xs">
                        {folder.count}
                      </Badge>
                    )}
                  </button>
                );
              })}
            </div>

            {/* Email List */}
            <div className="lg:col-span-3 space-y-4">
              {/* Search */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  placeholder="Search emails..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>

              {/* Email Items */}
              <div className="space-y-2">
                {filteredEmails.map(email => (
                  <Card 
                    key={email.id} 
                    className={cn(
                      "cursor-pointer transition-all hover:border-primary/50",
                      !email.isRead && "bg-primary/5 border-primary/20",
                      selectedEmail?.id === email.id && "border-primary"
                    )}
                    onClick={() => setSelectedEmail(email)}
                  >
                    <CardContent className="p-4">
                      <div className="flex items-start gap-3">
                        <Avatar className="w-10 h-10">
                          <AvatarFallback className="text-lg">{email.from.avatar}</AvatarFallback>
                        </Avatar>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between mb-1">
                            <div className="flex items-center gap-2">
                              <span className={cn("font-medium truncate", !email.isRead && "font-semibold")}>
                                {email.from.name}
                              </span>
                              {email.isStarred && <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />}
                              {email.hasAttachment && <Paperclip className="w-4 h-4 text-muted-foreground" />}
                            </div>
                            <div className="flex items-center gap-2 text-xs text-muted-foreground">
                              <Clock className="w-3 h-3" />
                              {email.date}
                            </div>
                          </div>
                          <h4 className={cn("text-sm truncate mb-1", !email.isRead && "font-medium")}>
                            {email.subject}
                          </h4>
                          <p className="text-xs text-muted-foreground line-clamp-1">
                            {email.preview}
                          </p>
                          {email.labels && email.labels.length > 0 && (
                            <div className="flex gap-1 mt-2">
                              {email.labels.map(label => (
                                <Badge key={label} variant="outline" className="text-xs capitalize">
                                  {label}
                                </Badge>
                              ))}
                            </div>
                          )}
                        </div>
                        {!email.isRead && (
                          <div className="w-2 h-2 rounded-full bg-primary mt-2" />
                        )}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>

              {filteredEmails.length === 0 && (
                <div className="text-center py-12">
                  <MailOpen className="w-12 h-12 text-muted-foreground/50 mx-auto mb-3" />
                  <h3 className="font-medium">No emails found</h3>
                  <p className="text-sm text-muted-foreground">Your {activeFolder} is empty</p>
                </div>
              )}
            </div>
          </div>
        </TabsContent>

        <TabsContent value="settings" className="mt-4">
          <EmailSettingsPanel />
        </TabsContent>
      </Tabs>
    </div>
  );
}
