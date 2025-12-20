import { useState } from 'react';
import { Bookmark, Plus, Search, Calendar, MapPin, Clock, Users, Star, Filter, MoreVertical, Plane, Hotel, Utensils, Car, Ticket, Bot, CheckCircle, XCircle, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';

interface Reservation {
  id: string;
  title: string;
  type: 'restaurant' | 'travel' | 'hotel' | 'car' | 'event';
  date: Date;
  time?: string;
  location: string;
  guests?: number;
  status: 'confirmed' | 'pending' | 'cancelled';
  confirmationNumber?: string;
  agent?: string;
  notes?: string;
  price?: string;
}

const mockReservations: Reservation[] = [
  { id: '1', title: 'Dinner at La Maison', type: 'restaurant', date: new Date(Date.now() + 86400000), time: '7:30 PM', location: 'Downtown', guests: 4, status: 'confirmed', confirmationNumber: 'RES-12345', agent: 'Orion' },
  { id: '2', title: 'Flight to New York', type: 'travel', date: new Date(Date.now() + 604800000), time: '9:00 AM', location: 'JFK Airport', status: 'confirmed', confirmationNumber: 'FLT-AA1234', price: '$450', agent: 'Orion' },
  { id: '3', title: 'Hotel Grand Plaza', type: 'hotel', date: new Date(Date.now() + 604800000), location: 'Manhattan, NY', status: 'pending', price: '$280/night', notes: 'Awaiting confirmation' },
  { id: '4', title: 'Car Rental - SUV', type: 'car', date: new Date(Date.now() + 604800000), location: 'JFK Airport', status: 'confirmed', confirmationNumber: 'CAR-5678', price: '$65/day' },
  { id: '5', title: 'Broadway Show - Hamilton', type: 'event', date: new Date(Date.now() + 691200000), time: '8:00 PM', location: 'Richard Rodgers Theatre', guests: 2, status: 'confirmed', confirmationNumber: 'TKT-HAMILTON', price: '$350' },
  { id: '6', title: 'Lunch Meeting', type: 'restaurant', date: new Date(Date.now() - 172800000), time: '12:00 PM', location: 'Café Central', guests: 2, status: 'cancelled' },
];

const typeIcons = {
  restaurant: Utensils,
  travel: Plane,
  hotel: Hotel,
  car: Car,
  event: Ticket,
};

const typeColors = {
  restaurant: 'bg-orange-500/20 text-orange-500',
  travel: 'bg-blue-500/20 text-blue-500',
  hotel: 'bg-purple-500/20 text-purple-500',
  car: 'bg-green-500/20 text-green-500',
  event: 'bg-pink-500/20 text-pink-500',
};

const statusIcons = {
  confirmed: CheckCircle,
  pending: AlertCircle,
  cancelled: XCircle,
};

const statusColors = {
  confirmed: 'text-success',
  pending: 'text-warning',
  cancelled: 'text-destructive',
};

export function ReservationsPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState('upcoming');

  const now = new Date();
  const upcomingReservations = mockReservations.filter(r => r.date >= now && r.status !== 'cancelled');
  const pastReservations = mockReservations.filter(r => r.date < now || r.status === 'cancelled');

  const filteredReservations = (activeTab === 'upcoming' ? upcomingReservations : pastReservations)
    .filter(r => r.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.location.toLowerCase().includes(searchQuery.toLowerCase()));

  const stats = {
    upcoming: upcomingReservations.length,
    confirmed: mockReservations.filter(r => r.status === 'confirmed').length,
    pending: mockReservations.filter(r => r.status === 'pending').length,
  };

  return (
    <div className="space-y-6 animate-slide-up">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
            <Bookmark className="w-5 h-5 text-primary" />
          </div>
          <div>
            <h1 className="text-xl font-bold font-display">Reservations & Booking</h1>
            <p className="text-sm text-muted-foreground">Restaurant, travel & venue bookings</p>
          </div>
        </div>
        <Button className="gap-2">
          <Plus className="w-4 h-4" />
          New Reservation
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-3 gap-4">
        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-muted-foreground">Upcoming</p>
                <p className="text-2xl font-bold">{stats.upcoming}</p>
              </div>
              <Calendar className="w-8 h-8 text-muted-foreground/50" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-muted-foreground">Confirmed</p>
                <p className="text-2xl font-bold text-success">{stats.confirmed}</p>
              </div>
              <CheckCircle className="w-8 h-8 text-success/50" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-muted-foreground">Pending</p>
                <p className="text-2xl font-bold text-warning">{stats.pending}</p>
              </div>
              <AlertCircle className="w-8 h-8 text-warning/50" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Search */}
      <div className="flex items-center gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search reservations..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="pl-9"
          />
        </div>
        <Button variant="outline" size="icon">
          <Filter className="w-4 h-4" />
        </Button>
      </div>

      {/* Tabs and Reservations */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="upcoming">Upcoming ({upcomingReservations.length})</TabsTrigger>
          <TabsTrigger value="past">Past & Cancelled</TabsTrigger>
        </TabsList>

        <TabsContent value={activeTab} className="mt-4">
          <div className="grid gap-4">
            {filteredReservations.length === 0 ? (
              <Card>
                <CardContent className="py-8 text-center text-muted-foreground">
                  <Bookmark className="w-10 h-10 mx-auto mb-2 opacity-50" />
                  <p>No reservations found</p>
                </CardContent>
              </Card>
            ) : (
              filteredReservations.map(reservation => {
                const TypeIcon = typeIcons[reservation.type];
                const StatusIcon = statusIcons[reservation.status];
                return (
                  <Card key={reservation.id} className={cn(
                    'transition-all hover:border-primary/50',
                    reservation.status === 'cancelled' && 'opacity-60'
                  )}>
                    <CardContent className="p-4">
                      <div className="flex items-start gap-4">
                        <div className={cn(
                          'w-12 h-12 rounded-lg flex items-center justify-center',
                          typeColors[reservation.type]
                        )}>
                          <TypeIcon className="w-6 h-6" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between mb-1">
                            <div className="flex items-center gap-2">
                              <span className={cn(
                                'font-medium',
                                reservation.status === 'cancelled' && 'line-through'
                              )}>
                                {reservation.title}
                              </span>
                              <Badge variant="outline" className="text-xs capitalize">
                                {reservation.type}
                              </Badge>
                            </div>
                            <div className={cn('flex items-center gap-1 text-sm', statusColors[reservation.status])}>
                              <StatusIcon className="w-4 h-4" />
                              <span className="capitalize">{reservation.status}</span>
                            </div>
                          </div>
                          
                          <div className="flex flex-wrap items-center gap-x-4 gap-y-1 mt-2 text-sm text-muted-foreground">
                            <span className="flex items-center gap-1">
                              <Calendar className="w-3.5 h-3.5" />
                              {format(reservation.date, 'EEE, MMM d')}
                              {reservation.time && ` at ${reservation.time}`}
                            </span>
                            <span className="flex items-center gap-1">
                              <MapPin className="w-3.5 h-3.5" />
                              {reservation.location}
                            </span>
                            {reservation.guests && (
                              <span className="flex items-center gap-1">
                                <Users className="w-3.5 h-3.5" />
                                {reservation.guests} guests
                              </span>
                            )}
                            {reservation.price && (
                              <span className="font-medium text-foreground">
                                {reservation.price}
                              </span>
                            )}
                          </div>

                          <div className="flex items-center gap-3 mt-2 text-xs">
                            {reservation.confirmationNumber && (
                              <span className="text-muted-foreground">
                                Conf#: <span className="font-mono">{reservation.confirmationNumber}</span>
                              </span>
                            )}
                            {reservation.agent && (
                              <span className="flex items-center gap-1 text-primary">
                                <Bot className="w-3 h-3" />
                                Booked by {reservation.agent}
                              </span>
                            )}
                          </div>

                          {reservation.notes && (
                            <p className="mt-2 text-xs text-muted-foreground italic">
                              {reservation.notes}
                            </p>
                          )}
                        </div>
                        <Button variant="ghost" size="icon" className="h-8 w-8">
                          <MoreVertical className="w-4 h-4" />
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                );
              })
            )}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
