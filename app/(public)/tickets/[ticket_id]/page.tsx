import { createClient } from '@/lib/supabase/server';
import { redirect, notFound } from 'next/navigation';
import Link from 'next/link';
import { Ticket, Calendar, MapPin, CheckCircle2, XCircle, Clock } from 'lucide-react';

export default async function TicketPage({ params }: { params: Promise<{ ticket_id: string }> }) {
  const { ticket_id } = await params;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect(`/login?redirect=/tickets/${ticket_id}`);

  const { data: ticket } = await supabase
    .from('tickets')
    .select('*, tix_events(*, venues(name, city, state, address)), seats(row_label, seat_number, sections(name)), ticket_tiers(name, description), orders(total_amount, status)')
    .eq('ticket_id', ticket_id)
    .eq('user_id', user.id)
    .single();

  if (!ticket) notFound();

  const t = ticket as any;
  const event = t.tix_events;
  const venue = event?.venues;

  const statusConfig: Record<string, { color: string; bg: string; icon: typeof CheckCircle2; label: string }> = {
    valid: { color: '#22C55E', bg: 'rgba(34,197,94,0.15)', icon: CheckCircle2, label: 'Valid' },
    used: { color: '#A1A1AA', bg: 'rgba(161,161,170,0.15)', icon: Clock, label: 'Used' },
    cancelled: { color: '#EF4444', bg: 'rgba(239,68,68,0.15)', icon: XCircle, label: 'Cancelled' },
    refunded: { color: '#F59E0B', bg: 'rgba(245,158,11,0.15)', icon: XCircle, label: 'Refunded' },
  };

  const status = statusConfig[t.status] || statusConfig.valid;
  const StatusIcon = status.icon;

  return (
    <div style={{ padding: 32, maxWidth: 600, margin: '0 auto' }}>
      <Link href="/dashboard/orders" style={{ color: '#8B5CF6', textDecoration: 'none', fontSize: 14, display: 'inline-flex', alignItems: 'center', gap: 4, marginBottom: 24 }}>
        ← Back to Orders
      </Link>

      {/* Ticket Card */}
      <div style={{ backgroundColor: '#141414', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 16, overflow: 'hidden' }}>
        {/* Header */}
        <div style={{ background: 'linear-gradient(135deg, #4C1D95 0%, #6D28D9 50%, #8B5CF6 100%)', padding: '32px 32px 24px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
            <Ticket size={24} style={{ color: 'rgba(255,255,255,0.8)' }} />
            <span style={{ fontSize: 14, fontWeight: 500, color: 'rgba(255,255,255,0.7)', textTransform: 'uppercase', letterSpacing: 1 }}>TicketHub</span>
          </div>
          <h1 style={{ fontSize: 26, fontWeight: 700, color: '#fff', margin: '0 0 8px', lineHeight: 1.2 }}>{event?.title}</h1>
          <div style={{ fontSize: 14, color: 'rgba(255,255,255,0.7)' }}>{t.ticket_tiers?.name || 'General Admission'}</div>
        </div>

        {/* Dashed separator */}
        <div style={{ display: 'flex', alignItems: 'center', margin: '0 -1px' }}>
          <div style={{ width: 24, height: 24, borderRadius: '50%', backgroundColor: '#09090B', border: '1px solid rgba(255,255,255,0.08)', flexShrink: 0 }} />
          <div style={{ flex: 1, borderTop: '2px dashed rgba(255,255,255,0.1)' }} />
          <div style={{ width: 24, height: 24, borderRadius: '50%', backgroundColor: '#09090B', border: '1px solid rgba(255,255,255,0.08)', flexShrink: 0 }} />
        </div>

        {/* Details */}
        <div style={{ padding: '24px 32px' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20, marginBottom: 24 }}>
            <div>
              <div style={{ fontSize: 11, color: '#71717A', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 4 }}>Date</div>
              <div style={{ fontSize: 14, fontWeight: 500, color: '#F4F4F5', display: 'flex', alignItems: 'center', gap: 6 }}>
                <Calendar size={14} style={{ color: '#8B5CF6' }} />
                {event?.event_date ? new Date(event.event_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : 'TBD'}
              </div>
            </div>
            <div>
              <div style={{ fontSize: 11, color: '#71717A', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 4 }}>Time</div>
              <div style={{ fontSize: 14, fontWeight: 500, color: '#F4F4F5' }}>
                {event?.event_date ? new Date(event.event_date).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }) : 'TBD'}
              </div>
            </div>
            <div>
              <div style={{ fontSize: 11, color: '#71717A', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 4 }}>Venue</div>
              <div style={{ fontSize: 14, fontWeight: 500, color: '#F4F4F5', display: 'flex', alignItems: 'center', gap: 6 }}>
                <MapPin size={14} style={{ color: '#8B5CF6' }} />
                {venue?.name}
              </div>
              <div style={{ fontSize: 12, color: '#71717A' }}>{venue?.city}, {venue?.state}</div>
            </div>
            {t.seats && (
              <div>
                <div style={{ fontSize: 11, color: '#71717A', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 4 }}>Seat</div>
                <div style={{ fontSize: 14, fontWeight: 500, color: '#F4F4F5' }}>
                  {t.seats.sections?.name}
                </div>
                <div style={{ fontSize: 12, color: '#71717A' }}>Row {t.seats.row_label}, Seat {t.seats.seat_number}</div>
              </div>
            )}
          </div>

          {/* Status & Barcode */}
          <div style={{ borderTop: '1px solid rgba(255,255,255,0.08)', paddingTop: 20 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
              <div>
                <div style={{ fontSize: 11, color: '#71717A', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 4 }}>Status</div>
                <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '6px 12px', borderRadius: 20, backgroundColor: status.bg }}>
                  <StatusIcon size={14} style={{ color: status.color }} />
                  <span style={{ fontSize: 13, fontWeight: 600, color: status.color }}>{status.label}</span>
                </div>
              </div>
              <div style={{ textAlign: 'right' }}>
                <div style={{ fontSize: 11, color: '#71717A', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 4 }}>Ticket ID</div>
                <div style={{ fontSize: 13, fontWeight: 600, color: '#F4F4F5', fontFamily: 'monospace' }}>{ticket_id.slice(0, 8).toUpperCase()}</div>
              </div>
            </div>

            {/* QR-style barcode placeholder */}
            <div style={{ backgroundColor: '#fff', borderRadius: 12, padding: 16, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <div style={{ width: 140, height: 140, backgroundColor: '#f4f4f5', borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: 8 }}>
                <Ticket size={32} style={{ color: '#3F3F46' }} />
                <div style={{ fontSize: 10, color: '#71717A', textAlign: 'center', fontFamily: 'monospace' }}>{ticket_id.slice(0, 16).toUpperCase()}</div>
              </div>
            </div>

            <p style={{ fontSize: 12, color: '#52525B', textAlign: 'center', margin: '12px 0 0' }}>
              Present this ticket at the venue entrance
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
