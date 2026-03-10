import { createAdminClient } from '@/lib/supabase/admin';
import { Calendar, MapPin, Users } from 'lucide-react';

async function getAllEvents() {
  const supabase = createAdminClient();
  const { data } = await supabase
    .from('tix_events')
    .select('*, venues(name, city, state), profiles(full_name)')
    .order('created_at', { ascending: false })
    .limit(200);
  return (data || []) as any[];
}

const statusColor: Record<string, string> = {
  draft: '#71717A',
  published: '#06B6D4',
  on_sale: '#22C55E',
  sold_out: '#F59E0B',
  cancelled: '#EF4444',
  completed: '#A1A1AA',
};

export default async function AdminEventsPage() {
  const events = await getAllEvents();

  return (
    <div style={{ padding: 32, maxWidth: 1200, margin: '0 auto' }}>
      <div style={{ marginBottom: 32 }}>
        <h1 style={{ fontSize: 28, fontWeight: 700, color: '#F4F4F5', margin: '0 0 4px' }}>All Events</h1>
        <p style={{ color: '#A1A1AA', margin: 0 }}>{events.length} events on the platform</p>
      </div>

      <div style={{ backgroundColor: '#141414', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 12, overflow: 'hidden' }}>
        {events.length === 0 ? (
          <div style={{ padding: '60px 0', textAlign: 'center', color: '#71717A' }}>
            No events found.
          </div>
        ) : (
          <>
            <div style={{ padding: '14px 20px', borderBottom: '1px solid rgba(255,255,255,0.06)', display: 'grid', gridTemplateColumns: '2fr 150px 150px 100px 100px', gap: 12 }}>
              {['Event', 'Organizer', 'Date', 'Status', 'Sold'].map(h => (
                <div key={h} style={{ fontSize: 11, color: '#52525B', textTransform: 'uppercase', letterSpacing: 1 }}>{h}</div>
              ))}
            </div>
            {events.map((event: any) => (
              <div key={event.event_id} style={{ padding: '14px 20px', borderBottom: '1px solid rgba(255,255,255,0.04)', display: 'grid', gridTemplateColumns: '2fr 150px 150px 100px 100px', gap: 12, alignItems: 'center' }}>
                <div>
                  <div style={{ fontSize: 14, fontWeight: 500, color: '#F4F4F5' }}>{event.title}</div>
                  {event.venues && (
                    <div style={{ fontSize: 12, color: '#71717A', marginTop: 2, display: 'flex', alignItems: 'center', gap: 4 }}>
                      <MapPin size={11} /> {event.venues.name}, {event.venues.city}
                    </div>
                  )}
                </div>
                <div style={{ fontSize: 13, color: '#A1A1AA' }}>
                  {event.profiles?.full_name || '—'}
                </div>
                <div style={{ fontSize: 13, color: '#A1A1AA', display: 'flex', alignItems: 'center', gap: 4 }}>
                  <Calendar size={13} />
                  {event.event_date ? new Date(event.event_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : '—'}
                </div>
                <div>
                  <span style={{ fontSize: 12, fontWeight: 500, color: statusColor[event.status] || '#A1A1AA', padding: '3px 10px', borderRadius: 20, backgroundColor: `${statusColor[event.status] || '#A1A1AA'}15`, textTransform: 'capitalize' }}>
                    {event.status?.replace('_', ' ')}
                  </span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 13, color: '#A1A1AA' }}>
                  <Users size={13} style={{ color: '#71717A' }} />
                  {event.sold_count || 0}
                </div>
              </div>
            ))}
          </>
        )}
      </div>
    </div>
  );
}
