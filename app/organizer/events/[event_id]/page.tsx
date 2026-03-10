import { createClient } from '@/lib/supabase/server';
import { redirect, notFound } from 'next/navigation';
import Link from 'next/link';
import { Calendar, MapPin, Users, TrendingUp, Ticket, QrCode, Settings, ExternalLink } from 'lucide-react';

export default async function OrganizerEventDetailPage({ params }: { params: Promise<{ event_id: string }> }) {
  const { event_id } = await params;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/login');

  const { data: event } = await supabase
    .from('tix_events')
    .select('*, venues(name, city, state, address)')
    .eq('event_id', event_id)
    .eq('organizer_id', user.id)
    .single();

  if (!event) notFound();

  const { data: tiers } = await supabase
    .from('ticket_tiers')
    .select('*')
    .eq('event_id', event_id);

  const { data: analyticsData } = await supabase
    .from('orders')
    .select('total_amount, status, created_at')
    .eq('status', 'completed');

  const revenue = (analyticsData || []).reduce((sum, o) => sum + (o.total_amount || 0), 0);

  const e = event as any;
  const venue = e.venues;

  const statusColor: Record<string, string> = {
    draft: '#71717A',
    published: '#06B6D4',
    on_sale: '#22C55E',
    sold_out: '#F59E0B',
    cancelled: '#EF4444',
    completed: '#A1A1AA',
  };

  const statusOptions = ['draft', 'published', 'on_sale', 'sold_out', 'cancelled', 'completed'];

  return (
    <div style={{ padding: 32, maxWidth: 1000, margin: '0 auto' }}>
      <Link href="/organizer/events" style={{ color: '#8B5CF6', textDecoration: 'none', fontSize: 14, display: 'inline-flex', alignItems: 'center', gap: 4, marginBottom: 24 }}>
        ← Back to Events
      </Link>

      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 32 }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 8 }}>
            <h1 style={{ fontSize: 28, fontWeight: 700, color: '#F4F4F5', margin: 0 }}>{e.title}</h1>
            <span style={{ fontSize: 12, fontWeight: 500, color: statusColor[e.status] || '#A1A1AA', padding: '4px 12px', borderRadius: 20, backgroundColor: `${statusColor[e.status] || '#A1A1AA'}15`, textTransform: 'capitalize' }}>
              {e.status?.replace('_', ' ')}
            </span>
          </div>
          <p style={{ color: '#71717A', margin: 0 }}>Event ID: {event_id}</p>
        </div>
        <div style={{ display: 'flex', gap: 10 }}>
          <Link
            href={`/events/${event_id}`}
            style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '9px 16px', borderRadius: 8, border: '1px solid rgba(255,255,255,0.1)', color: '#A1A1AA', textDecoration: 'none', fontSize: 13, fontWeight: 500 }}
          >
            <ExternalLink size={14} /> Preview
          </Link>
          <Link
            href={`/organizer/events/${event_id}/scan`}
            style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '9px 16px', borderRadius: 8, backgroundColor: '#1E1E1E', border: '1px solid rgba(255,255,255,0.1)', color: '#F4F4F5', textDecoration: 'none', fontSize: 13, fontWeight: 500 }}
          >
            <QrCode size={14} /> Scan Tickets
          </Link>
        </div>
      </div>

      {/* Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16, marginBottom: 32 }}>
        {[
          { label: 'Tickets Sold', value: e.sold_count || 0, icon: Ticket, color: '#8B5CF6' },
          { label: 'Revenue', value: `$${(revenue / 100).toFixed(0)}`, icon: TrendingUp, color: '#22C55E' },
          { label: 'Ticket Tiers', value: (tiers || []).length, icon: Settings, color: '#06B6D4' },
        ].map(stat => {
          const Icon = stat.icon;
          return (
            <div key={stat.label} style={{ backgroundColor: '#141414', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 12, padding: 20 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10 }}>
                <div style={{ width: 36, height: 36, borderRadius: 8, backgroundColor: `${stat.color}20`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Icon size={18} style={{ color: stat.color }} />
                </div>
                <span style={{ fontSize: 13, color: '#A1A1AA' }}>{stat.label}</span>
              </div>
              <div style={{ fontSize: 28, fontWeight: 700, color: '#F4F4F5' }}>{stat.value}</div>
            </div>
          );
        })}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24 }}>
        {/* Event Details */}
        <div style={{ backgroundColor: '#141414', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 12, padding: 24 }}>
          <h2 style={{ fontSize: 16, fontWeight: 600, color: '#F4F4F5', margin: '0 0 20px' }}>Event Details</h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <div style={{ display: 'flex', gap: 10 }}>
              <Calendar size={16} style={{ color: '#8B5CF6', marginTop: 2, flexShrink: 0 }} />
              <div>
                <div style={{ fontSize: 12, color: '#71717A', marginBottom: 2 }}>Date & Time</div>
                <div style={{ fontSize: 14, color: '#F4F4F5' }}>
                  {e.event_date ? new Date(e.event_date).toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit' }) : 'Not set'}
                </div>
              </div>
            </div>
            {venue && (
              <div style={{ display: 'flex', gap: 10 }}>
                <MapPin size={16} style={{ color: '#8B5CF6', marginTop: 2, flexShrink: 0 }} />
                <div>
                  <div style={{ fontSize: 12, color: '#71717A', marginBottom: 2 }}>Venue</div>
                  <div style={{ fontSize: 14, color: '#F4F4F5' }}>{venue.name}</div>
                  <div style={{ fontSize: 13, color: '#71717A' }}>{venue.city}, {venue.state}</div>
                </div>
              </div>
            )}
            {e.description && (
              <div>
                <div style={{ fontSize: 12, color: '#71717A', marginBottom: 4 }}>Description</div>
                <div style={{ fontSize: 14, color: '#A1A1AA', lineHeight: 1.5 }}>{e.description}</div>
              </div>
            )}
          </div>
        </div>

        {/* Ticket Tiers */}
        <div style={{ backgroundColor: '#141414', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 12, padding: 24 }}>
          <h2 style={{ fontSize: 16, fontWeight: 600, color: '#F4F4F5', margin: '0 0 20px' }}>Ticket Tiers</h2>
          {(!tiers || tiers.length === 0) ? (
            <div style={{ textAlign: 'center', padding: '24px 0', color: '#71717A' }}>
              <Ticket size={32} style={{ marginBottom: 8, opacity: 0.4 }} />
              <p style={{ margin: '0 0 12px', fontSize: 14 }}>No ticket tiers yet</p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {(tiers as any[]).map(tier => (
                <div key={tier.tier_id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 0', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
                  <div>
                    <div style={{ fontSize: 14, fontWeight: 500, color: '#F4F4F5' }}>{tier.name}</div>
                    <div style={{ fontSize: 12, color: '#71717A' }}>{tier.quantity_available} available</div>
                  </div>
                  <div style={{ fontSize: 15, fontWeight: 600, color: '#F4F4F5' }}>${(tier.price / 100).toFixed(2)}</div>
                </div>
              ))}
            </div>
          )}
          <div style={{ marginTop: 16, display: 'flex', gap: 8 }}>
            <Link
              href={`/events/${event_id}/seats`}
              style={{ flex: 1, textAlign: 'center', padding: '8px', borderRadius: 8, border: '1px solid rgba(139,92,246,0.3)', color: '#8B5CF6', textDecoration: 'none', fontSize: 13, fontWeight: 500 }}
            >
              Manage Seats
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
