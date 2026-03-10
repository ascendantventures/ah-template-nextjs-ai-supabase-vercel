import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import { Calendar, Plus, ChevronRight, Users } from 'lucide-react';

export default async function OrganizerEventsPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/login');

  const { data: events } = await supabase
    .from('tix_events')
    .select('*, venues(name, city, state)')
    .eq('organizer_id', user.id)
    .order('event_date', { ascending: false });

  const statusColor: Record<string, string> = {
    draft: '#71717A',
    published: '#06B6D4',
    on_sale: '#22C55E',
    sold_out: '#F59E0B',
    cancelled: '#EF4444',
    completed: '#A1A1AA',
  };

  return (
    <div style={{ padding: 32, maxWidth: 1000, margin: '0 auto' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 32 }}>
        <div>
          <h1 style={{ fontSize: 28, fontWeight: 700, color: '#F4F4F5', margin: '0 0 4px' }}>My Events</h1>
          <p style={{ color: '#A1A1AA', margin: 0 }}>{(events || []).length} event{(events || []).length !== 1 ? 's' : ''} total</p>
        </div>
        <Link
          href="/organizer/events/new"
          style={{ display: 'flex', alignItems: 'center', gap: 8, backgroundColor: '#8B5CF6', color: '#fff', textDecoration: 'none', padding: '10px 18px', borderRadius: 10, fontSize: 14, fontWeight: 600 }}
        >
          <Plus size={16} /> New Event
        </Link>
      </div>

      {(!events || events.length === 0) ? (
        <div style={{ textAlign: 'center', padding: '80px 0', backgroundColor: '#141414', borderRadius: 16, border: '1px solid rgba(255,255,255,0.08)' }}>
          <Calendar size={48} style={{ color: '#3F3F46', marginBottom: 16 }} />
          <h3 style={{ color: '#F4F4F5', margin: '0 0 8px' }}>No events yet</h3>
          <p style={{ color: '#71717A', margin: '0 0 24px' }}>Create your first event to start selling tickets</p>
          <Link href="/organizer/events/new" style={{ backgroundColor: '#8B5CF6', color: '#fff', textDecoration: 'none', padding: '10px 20px', borderRadius: 8, fontSize: 14, fontWeight: 600 }}>
            Create Event
          </Link>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {(events as any[]).map(event => (
            <Link
              key={event.event_id}
              href={`/organizer/events/${event.event_id}`}
              style={{ textDecoration: 'none', backgroundColor: '#141414', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 12, padding: 20, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}
            >
              <div style={{ display: 'flex', gap: 16, alignItems: 'center' }}>
                <div style={{ width: 48, height: 48, borderRadius: 10, backgroundColor: '#1E1E1E', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Calendar size={20} style={{ color: '#8B5CF6' }} />
                </div>
                <div>
                  <div style={{ fontSize: 16, fontWeight: 600, color: '#F4F4F5' }}>{event.title}</div>
                  <div style={{ fontSize: 13, color: '#71717A', marginTop: 4 }}>
                    {event.venues?.name} · {event.event_date ? new Date(event.event_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : 'No date set'}
                  </div>
                  <div style={{ fontSize: 12, color: '#52525B', marginTop: 2, textTransform: 'capitalize' }}>{event.event_type}</div>
                </div>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    <Users size={13} style={{ color: '#71717A' }} />
                    <span style={{ fontSize: 13, color: '#A1A1AA' }}>{event.sold_count || 0} sold</span>
                  </div>
                </div>
                <span style={{ fontSize: 12, fontWeight: 500, color: statusColor[event.status] || '#A1A1AA', padding: '4px 12px', borderRadius: 20, backgroundColor: `${statusColor[event.status] || '#A1A1AA'}15`, whiteSpace: 'nowrap', textTransform: 'capitalize' }}>
                  {event.status?.replace('_', ' ')}
                </span>
                <ChevronRight size={18} style={{ color: '#52525B' }} />
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
