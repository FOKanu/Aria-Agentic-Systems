// Contacts Page - Author: Francis Okorie Iyeke-Kanu
import { useState } from 'react';
import { Users, Plus, Search, Mail, Phone, Building2, Star, MoreVertical, UserPlus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { cn } from '@/lib/utils';

interface Contact {
  id: string;
  name: string;
  email: string;
  phone?: string;
  organization?: string;
  category: 'personal' | 'business' | 'client' | 'vendor' | 'team';
  isFavorite: boolean;
  avatar: string;
  lastContact?: string;
}

const mockContacts: Contact[] = [
  { id: '1', name: 'Alex Chen', email: 'alex@techcorp.com', phone: '+1 555-0123', organization: 'TechCorp', category: 'client', isFavorite: true, avatar: '👨‍💻', lastContact: '2 days ago' },
  { id: '2', name: 'Sarah Miller', email: 'sarah.m@designlab.io', phone: '+1 555-0124', organization: 'DesignLab', category: 'business', isFavorite: false, avatar: '👩‍🎨', lastContact: '1 week ago' },
  { id: '3', name: 'Mike Johnson', email: 'mike@personalmail.com', category: 'personal', isFavorite: true, avatar: '🧑', lastContact: 'Yesterday' },
  { id: '4', name: 'Emma Watson', email: 'emma@startup.co', phone: '+1 555-0125', organization: 'StartupCo', category: 'vendor', isFavorite: false, avatar: '👩‍💼', lastContact: '3 days ago' },
  { id: '5', name: 'Dev Team', email: 'dev@aria.ai', category: 'team', isFavorite: true, avatar: '👥', lastContact: 'Today' },
];

const categoryColors = {
  personal: 'bg-blue-500/20 text-blue-400',
  business: 'bg-green-500/20 text-green-400',
  client: 'bg-purple-500/20 text-purple-400',
  vendor: 'bg-orange-500/20 text-orange-400',
  team: 'bg-cyan-500/20 text-cyan-400',
};

/* Created by Francis Okorie Iyeke-Kanu */
export function ContactsPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  const filteredContacts = mockContacts.filter(contact => {
    const matchesSearch = contact.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         contact.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         contact.organization?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = !selectedCategory || contact.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const categories = ['personal', 'business', 'client', 'vendor', 'team'];

  return (
    <div className="space-y-6 animate-slide-up">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
            <Users className="w-5 h-5 text-primary" />
          </div>
          <div>
            <h1 className="text-xl font-bold font-display">Contacts</h1>
            <p className="text-sm text-muted-foreground">{mockContacts.length} contacts</p>
          </div>
        </div>
        <Button className="gap-2">
          <UserPlus className="w-4 h-4" />
          Add Contact
        </Button>
      </div>

      {/* Search and Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search contacts..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
        <div className="flex gap-2 flex-wrap">
          <Button 
            variant={selectedCategory === null ? "default" : "outline"}
            size="sm"
            onClick={() => setSelectedCategory(null)}
          >
            All
          </Button>
          {categories.map(category => (
            <Button
              key={category}
              variant={selectedCategory === category ? "default" : "outline"}
              size="sm"
              onClick={() => setSelectedCategory(category)}
              className="capitalize"
            >
              {category}
            </Button>
          ))}
        </div>
      </div>

      {/* Contacts Grid */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredContacts.map(contact => (
          <Card key={contact.id} className="group hover:border-primary/50 transition-all">
            <CardContent className="p-4">
              <div className="flex items-start gap-3">
                <Avatar className="w-12 h-12 text-xl">
                  <AvatarFallback className="bg-secondary">
                    {contact.avatar}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <h3 className="font-semibold truncate">{contact.name}</h3>
                    <div className="flex items-center gap-1">
                      {contact.isFavorite && (
                        <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
                      )}
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" className="w-8 h-8 opacity-0 group-hover:opacity-100">
                            <MoreVertical className="w-4 h-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem>Edit Contact</DropdownMenuItem>
                          <DropdownMenuItem>Send Email</DropdownMenuItem>
                          <DropdownMenuItem className="text-destructive">Delete</DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </div>
                  <Badge className={cn("text-xs mt-1 capitalize", categoryColors[contact.category])}>
                    {contact.category}
                  </Badge>
                </div>
              </div>
              
              <div className="mt-4 space-y-2 text-sm">
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Mail className="w-3.5 h-3.5" />
                  <span className="truncate">{contact.email}</span>
                </div>
                {contact.phone && (
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Phone className="w-3.5 h-3.5" />
                    <span>{contact.phone}</span>
                  </div>
                )}
                {contact.organization && (
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Building2 className="w-3.5 h-3.5" />
                    <span>{contact.organization}</span>
                  </div>
                )}
              </div>

              {contact.lastContact && (
                <p className="text-xs text-muted-foreground mt-3 pt-3 border-t border-border">
                  Last contact: {contact.lastContact}
                </p>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredContacts.length === 0 && (
        <div className="text-center py-12">
          <Users className="w-12 h-12 text-muted-foreground/50 mx-auto mb-3" />
          <h3 className="font-medium">No contacts found</h3>
          <p className="text-sm text-muted-foreground">Try adjusting your search or filters</p>
        </div>
      )}
    </div>
  );
}
