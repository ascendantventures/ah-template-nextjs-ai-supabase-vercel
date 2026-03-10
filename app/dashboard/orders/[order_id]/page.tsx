import { createClient } from '@/lib/supabase/server';
import { redirect, notFound } from 'next/navigation';
import Link from 'next/link';
import { Ticket, MapPin, Calendar, CreditCard } from 'lucide-react';

export default async function OrderDetailPage({ params }: { params: Promise<{ order_id: string }> }) {
  const { order_id } = await params;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/login');

  const { data: order } = await supabase
    .from('orders')
    .select('*, tix_events(*, venues(name, city, state, address))')
    .eq('order_id', order_id)
    .eq('user_id', user.id)
    .single();

  if (!order) notFound();

  const { data: tickets } = await supabase
    .from('tickets')
    .select('*, seats(row_label, seat_number, sections(name)), ticket_tiers(name)')
    .eq('order_id', order_id);

  const statusColor: Record<string, string> = {
    completed: '#22C55E',
    pending: '#F59E0B',
    cancelled: '#EF4444',
    refunded: '#A1A1AA',
  };

  const event = (order as any).tix_events;
  const venue = event?.venues;

  return (
    <div style={{ padding: 32, maxWidth: 800, margin: '0 auto' }}>
      <Link href="/dashboard/orders" style={{ color: '#8B5CF6', textDecoration: 'none', fontSize: 14, display: 'inline-flex', alignItems: 'center', gap: 4, marginBottom: 24 }}>
        ← Back to Orders
      </Link>

      {/* Order header */}
      <div style={{ backgroundColor: '#141414', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 12, padding: 24, marginBottom: 20 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 20 }}>
          <div>
            <h1 style={{ fontSize: 24, fontWeight: 700, color: '#F4F4F5', margin: '0 0 4px' }}>{event?.title}</h1>
            <div style={{ fontSize: 13, color: '#52525B' }}>Order #{order_id.slice(0, 8).toUpperCase()}</div>
          </div>
          <div style={{ padding: '6px 14px', borderRadius: 20, backgroundColor: `${statusColor[(order as any).status] || '#A1A1AA'}20`, color: statusColor[(order as any).status] || '#A1A1AA', fontSize: 13, fontWeight: 600, textTransform: 'capitalize' }}>
            {(order as any).status}
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
          <div style={{ display: 'flex', gap: 10, alignItems: 'flex-start' }}>
            <Calendar size={16} style={{ color: '#8B5CF6', marginTop: 2 }} />
            <div>
              <div style={{ fontSize: 12, color: '#71717A' }}>Event Date</div>
              <div style={{ fontSize: 14, color: '#F4F4F5' }}>
                {event?.event_date ? new Date(event.event_date).toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' }) : 'TBD'}
              </div>
            </div>
          </div>
          <div style={{ display: 'flex', gap: 10, alignItems: 'flex-start' }}>
            <MapPin size={16} style={{ color: '#8B5CF6', marginTop: 2 }} />
            <div>
              <div style={{ fontSize: 12, color: '#71717A' }}>Venue</div>
              <div style={{ fontSize: 14, color: '#F4F4F5' }}>{venue?.name}</div>
              <div style={{ fontSize: 12, color: '#71717A' }}>{venue?.city}, {venue?.state}</div>
            </div>
          </div>
          <div style={{ display: 'flex', gap: 10, alignItems: 'flex-start' }}>
            <CreditCard size={16} style={{ color: '#8B5CF6', marginTop: 2 }} />
            <div>
              <div style={{ fontSize: 12, color: '#71717A' }}>Order Total</div>
              <div style={{ fontSize: 14, color: '#F4F4F5', fontWeight: 600 }}>${((order as any).total_amount / 100).toFixed(2)}</div>
            </div>
          </div>
          <div style={{ display: 'flex', gap: 10, alignItems: 'flex-start' }}>
            <Ticket size={16} style={{ color: '#8B5CF6', marginTop: 2 }} />
            <div>
              <div style={{ fontSize: 12, color: '#71717A' }}>Tickets</div>
              <div style={{ fontSize: 14, color: '#F4F4F5' }}>{tickets?.length || 0} ticket{(tickets?.length || 0) !== 1 ? 's' : ''}</div>
            </div>
          </div>
        </div>
      </div>

      {/* Tickets */}
      <h2 style={{ fontSize: 18, fontWeight: 600, color: '#F4F4F5', margin: '0 0 16px' }}>Your Tickets</h2>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        {(tickets || []).map((ticket: any) => (
          <div key={ticket.ticket_id} style={{ backgroundColor: '#141414', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 12, padding: 20, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div style={{ display: 'flex', gap: 14, alignItems: 'center' }}>
              <div style={{ width: 44, height: 44, borderRadius: 10, backgroundColor: 'rgba(139,92,246,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Ticket size={20} style={{ color: '#8B5CF6' }} />
              </div>
              <div>
                <div style={{ fontSize: 15, fontWeight: 600, color: '#F4F4F5' }}>
                  {ticket.ticket_tiers?.name || 'General Admission'}
                </div>
                {ticket.seats && (
                  <div style={{ fontSize: 13, color: '#71717A', marginTop: 2 }}>
                    {ticket.seats.sections?.name} · Row {ticket.seats.row_label}, Seat {ticket.seats.seat_number}
                  </div>
                )}
                <div style={{ fontSize: 12, color: '#52525B', marginTop: 2 }}>#{ticket.ticket_id.slice(0, 8).toUpperCase()}</div>
              </div>
            </div>
            <Link
              href={`/tickets/${ticket.ticket_id}`}
              style={{ backgroundColor: '#1E1E1E', color: '#8B5CF6', textDecoration: 'none', padding: '8px 16px', borderRadius: 8, fontSize: 13, fontWeight: 500, border: '1px solid rgba(139,92,246,0.3)' }}
            >
              View Ticket
            </Link>
          </div>
        ))}
      </div>
    </div>
  );
}
