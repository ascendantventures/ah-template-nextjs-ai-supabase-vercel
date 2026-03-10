'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import { Calendar, MapPin, CalendarDays, Clock, ChevronLeft } from 'lucide-react';
import { TixEvent, TicketTier } from '@/types';
import StatusBadge from '@/components/ui/StatusBadge';

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
}
function formatTime(dateStr: string) {
  return new Date(dateStr).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });
}

interface EventDetailClientProps {
  event: TixEvent;
  tiers: TicketTier[];
}

export default function EventDetailClient({ event, tiers }: EventDetailClientProps) {
  const venue = event.venues;
  const minTierPrice = tiers.length > 0 ? Math.min(...tiers.map(t => Number(t.price))) : event.min_price;
  const canBuy = ['on_sale'].includes(event.status);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
      style={{ minHeight: '100vh', backgroundColor: '#09090B' }}
    >
      {/* Hero */}
      <div style={{ position: 'relative', height: 400 }}>
        {event.cover_image_url ? (
          <img src={event.cover_image_url} alt={event.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
        ) : (
          <div style={{ width: '100%', height: '100%', background: 'linear-gradient(135deg, #1E1E1E 0%, #141414 100%)' }} />
        )}
        <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, #09090B 0%, rgba(9,9,11,0.7) 50%, transparent 100%)' }} />

        <div style={{ position: 'absolute', bottom: 48, left: 0, right: 0 }}>
          <div style={{ maxWidth: 1280, margin: '0 auto', padding: '0 24px' }}>
            <Link href="/events" style={{ display: 'inline-flex', alignItems: 'center', gap: 4, color: '#A1A1AA', textDecoration: 'none', fontSize: 14, fontWeight: 500, marginBottom: 16 }}>
              <ChevronLeft size={20} strokeWidth={1.5} />
              Back to Events
            </Link>

            <div style={{ marginBottom: 12 }}>
              <StatusBadge status={event.event_type} />
            </div>

            <h1 style={{ fontSize: 'clamp(32px, 5vw, 48px)', fontWeight: 800, color: '#F4F4F5', margin: '0 0 12px', lineHeight: 1.1, letterSpacing: '-0.02em' }}>
              {event.title}
            </h1>

            {venue && (
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, color: '#A1A1AA', fontSize: 18 }}>
                <MapPin size={18} strokeWidth={1.5} />
                {venue.name}, {venue.city}, {venue.state}
              </div>
            )}

            <div style={{ display: 'flex', alignItems: 'center', gap: 6, color: '#F4F4F5', fontSize: 18, fontWeight: 500, marginTop: 8 }}>
              <CalendarDays size={18} strokeWidth={1.5} />
              {formatDate(event.event_date)}
            </div>
          </div>
        </div>
      </div>

      {/* Main content */}
      <div style={{ maxWidth: 1280, margin: '0 auto', padding: '48px 24px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 380px', gap: 48 }}>
          {/* Left */}
          <div>
            <section>
              <h3 style={{ fontSize: 24, fontWeight: 600, color: '#F4F4F5', margin: '0 0 16px' }}>About This Event</h3>
              <p style={{ fontSize: 16, color: '#A1A1AA', lineHeight: 1.7 }}>
                {event.description || 'No description provided.'}
              </p>
            </section>

            <section style={{ marginTop: 48 }}>
              <h3 style={{ fontSize: 24, fontWeight: 600, color: '#F4F4F5', margin: '0 0 16px' }}>Event Details</h3>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24 }}>
                {[
                  { label: 'Doors Open', value: event.doors_open_at ? formatTime(event.doors_open_at) : 'TBA', icon: <Clock size={20} strokeWidth={1.5} style={{ color: '#8B5CF6' }} /> },
                  { label: 'Event Start', value: formatTime(event.event_date), icon: <CalendarDays size={20} strokeWidth={1.5} style={{ color: '#8B5CF6' }} /> },
                  { label: 'Event Date', value: formatDate(event.event_date), icon: <Calendar size={20} strokeWidth={1.5} style={{ color: '#8B5CF6' }} /> },
                  { label: 'Type', value: event.event_type.charAt(0).toUpperCase() + event.event_type.slice(1), icon: <MapPin size={20} strokeWidth={1.5} style={{ color: '#8B5CF6' }} /> },
                ].map(d => (
                  <div key={d.label} style={{ display: 'flex', alignItems: 'flex-start', gap: 12 }}>
                    {d.icon}
                    <div>
                      <div style={{ fontSize: 14, fontWeight: 500, color: '#71717A' }}>{d.label}</div>
                      <div style={{ fontSize: 16, fontWeight: 500, color: '#F4F4F5', marginTop: 2 }}>{d.value}</div>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          </div>

          {/* Right — ticket purchase sidebar */}
          <div style={{ position: 'sticky', top: 96 }}>
            <div style={{ backgroundColor: '#141414', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 16, padding: 24 }}>
              {minTierPrice != null && (
                <div style={{ fontSize: 28, fontWeight: 700, color: '#22C55E', marginBottom: 8 }}>
                  From ${Number(minTierPrice).toFixed(0)}
                </div>
              )}

              <div style={{ marginBottom: 16 }}>
                <StatusBadge status={event.status} />
              </div>

              {canBuy ? (
                <Link href={`/events/${event.event_id}/seats`}>
                  <motion.button
                    whileTap={{ scale: 0.97 }}
                    style={{
                      width: '100%',
                      backgroundColor: '#8B5CF6',
                      color: '#fff',
                      border: 'none',
                      borderRadius: 10,
                      padding: '12px 24px',
                      fontSize: 14,
                      fontWeight: 600,
                      cursor: 'pointer',
                      boxShadow: '0 4px 12px rgba(139,92,246,0.4)',
                      marginTop: 8,
                    }}
                  >
                    Select Seats
                  </motion.button>
                </Link>
              ) : (
                <div style={{ padding: '12px 24px', borderRadius: 10, backgroundColor: '#1E1E1E', color: '#71717A', fontSize: 14, fontWeight: 600, textAlign: 'center', marginTop: 8 }}>
                  {event.status === 'sold_out' ? 'Sold Out' : 'Not Available'}
                </div>
              )}

              {tiers.length > 0 && (
                <div style={{ marginTop: 24 }}>
                  <h4 style={{ fontSize: 16, fontWeight: 600, color: '#F4F4F5', margin: '0 0 12px' }}>Pricing Tiers</h4>
                  {tiers.map(tier => (
                    <div key={tier.tier_id} style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
                      <div style={{ fontSize: 14, fontWeight: 500, color: '#F4F4F5' }}>
                        {tier.name}
                        {tier.sections && <span style={{ color: '#71717A', fontWeight: 400, marginLeft: 4 }}>({tier.sections.name})</span>}
                      </div>
                      <div style={{ fontSize: 14, fontWeight: 600, color: '#A1A1AA' }}>${Number(tier.price).toFixed(0)}</div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
