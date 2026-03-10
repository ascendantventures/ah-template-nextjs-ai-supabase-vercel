import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import { Calendar, MapPin, Ticket, TrendingUp, Plus, ChevronRight } from 'lucide-react';

export default async function OrganizerDashboard() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/login');

  const { data: profile } = await supabase.from('profiles').select('*').eq('user_id', user.id).single();

  const [eventsResult, venuesResult] = await Promise.all([
    supabase
      .from('tix_events')
      .select('*, venues(name, city)')
      .eq('organizer_id', user.id)
      .order('created_at', { ascending: false })
      .limit(5),
    supabase
      .from('venues')
      .select('*')
      .eq('owner_id', user.id)
      .order('created_at', { ascending: false }),
  ]);

  const events = (eventsResult.data || []) as any[];
  const venues = (venuesResult.data || []) as any[];

  // Get total ticket sales
  const { data: ordersData } = await supabase
    .from('orders')
    .select('total_amount, status')
    .eq('status', 'completed');

  const totalRevenue = (ordersData || []).reduce((sum, o) => sum + (o.total_amount || 0), 0);

  const stats = [
    { label: 'Total Events', value: events.length, icon: Calendar, color: '#8B5CF6' },
    { label: 'Venues', value: venues.length, icon: MapPin, color: '#06B6D4' },
    { label: 'Revenue', value: `$${(totalRevenue / 100).toFixed(0)}`, icon: TrendingUp, color: '#22C55E' },
  ];

  const statusColor: Record<string, string> = {
    draft: '#71717A',
    published: '#06B6D4',
    on_sale: '#22C55E',
    sold_out: '#F59E0B',
    cancelled: '#EF4444',
    completed: '#A1A1AA',
  };

  return (
    <div style={{ padding: 32, maxWidth: 1100, margin: '0 auto' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 32 }}>
        <div>
          <h1 style={{ fontSize: 28, fontWeight: 700, color: '#F4F4F5', margin: '0 0 4px' }}>Organizer Dashboard</h1>
          <p style={{ color: '#A1A1AA', margin: 0 }}>Welcome back, {(profile as any)?.full_name}</p>
        </div>
        <Link
          href="/organizer/events/new"
          style={{ display: 'flex', alignItems: 'center', gap: 8, backgroundColor: '#8B5CF6', color: '#fff', textDecoration: 'none', padding: '10px 18px', borderRadius: 10, fontSize: 14, fontWeight: 600 }}
        >
          <Plus size={16} /> New Event
        </Link>
      </div>

      {/* Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16, marginBottom: 32 }}>
        {stats.map(stat => {
          const Icon = stat.icon;
          return (
            <div key={stat.label} style={{ backgroundColor: '#141414', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 12, padding: 24 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 12 }}>
                <div style={{ width: 40, height: 40, borderRadius: 10, backgroundColor: `${stat.color}20`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Icon size={20} style={{ color: stat.color }} />
                </div>
                <span style={{ fontSize: 14, color: '#A1A1AA' }}>{stat.label}</span>
              </div>
              <div style={{ fontSize: 32, fontWeight: 700, color: '#F4F4F5' }}>{stat.value}</div>
            </div>
          );
        })}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 24 }}>
        {/* Recent Events */}
        <div style={{ backgroundColor: '#141414', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 12, padding: 24 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
            <h2 style={{ fontSize: 18, fontWeight: 600, color: '#F4F4F5', margin: 0 }}>Recent Events</h2>
            <Link href="/organizer/events" style={{ fontSize: 14, color: '#8B5CF6', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 4 }}>
              View all <ChevronRight size={14} />
            </Link>
          </div>
          {events.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '40px 0', color: '#71717A' }}>
              <Calendar size={36} style={{ marginBottom: 12, opacity: 0.5 }} />
              <p style={{ margin: '0 0 16px' }}>No events yet</p>
              <Link href="/organizer/events/new" style={{ color: '#8B5CF6', textDecoration: 'none' }}>Create your first event</Link>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {events.map((event: any) => (
                <Link
                  key={event.event_id}
                  href={`/organizer/events/${event.event_id}`}
                  style={{ textDecoration: 'none', display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 0', borderBottom: '1px solid rgba(255,255,255,0.06)' }}
                >
                  <div>
                    <div style={{ fontSize: 14, fontWeight: 500, color: '#F4F4F5' }}>{event.title}</div>
                    <div style={{ fontSize: 12, color: '#71717A', marginTop: 2 }}>
                      {event.venues?.name} · {event.event_date ? new Date(event.event_date).toLocaleDateString() : 'No date'}
                    </div>
                  </div>
                  <span style={{ fontSize: 12, fontWeight: 500, color: statusColor[event.status] || '#A1A1AA', padding: '3px 10px', borderRadius: 20, backgroundColor: `${statusColor[event.status] || '#A1A1AA'}15`, textTransform: 'capitalize' }}>
                    {event.status?.replace('_', ' ')}
                  </span>
                </Link>
              ))}
            </div>
          )}
        </div>

        {/* Venues */}
        <div style={{ backgroundColor: '#141414', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 12, padding: 24 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
            <h2 style={{ fontSize: 18, fontWeight: 600, color: '#F4F4F5', margin: 0 }}>Venues</h2>
            <Link href="/organizer/venues" style={{ fontSize: 14, color: '#8B5CF6', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 4 }}>
              View all <ChevronRight size={14} />
            </Link>
          </div>
          {venues.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '40px 0', color: '#71717A' }}>
              <MapPin size={36} style={{ marginBottom: 12, opacity: 0.5 }} />
              <p style={{ margin: '0 0 16px' }}>No venues yet</p>
              <Link href="/organizer/venues/new" style={{ color: '#8B5CF6', textDecoration: 'none' }}>Add a venue</Link>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {venues.slice(0, 5).map((venue: any) => (
                <Link
                  key={venue.venue_id}
                  href={`/organizer/venues/${venue.venue_id}`}
                  style={{ textDecoration: 'none', padding: '10px 0', borderBottom: '1px solid rgba(255,255,255,0.06)', display: 'block' }}
                >
                  <div style={{ fontSize: 14, fontWeight: 500, color: '#F4F4F5' }}>{venue.name}</div>
                  <div style={{ fontSize: 12, color: '#71717A', marginTop: 2 }}>{venue.city}, {venue.state} · Cap: {venue.capacity?.toLocaleString()}</div>
                </Link>
              ))}
            </div>
          )}
          <Link href="/organizer/venues/new" style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 16, color: '#8B5CF6', textDecoration: 'none', fontSize: 14 }}>
            <Plus size={14} /> Add Venue
          </Link>
        </div>
      </div>
    </div>
  );
}
