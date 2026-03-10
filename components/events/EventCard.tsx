'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import { Calendar, MapPin, Music, Trophy, Presentation, Sparkles } from 'lucide-react';
import { TixEvent } from '@/types';

const typeIcons: Record<string, React.ReactNode> = {
  concert: <Music size={14} strokeWidth={1.5} />,
  sports: <Trophy size={14} strokeWidth={1.5} />,
  conference: <Presentation size={14} strokeWidth={1.5} />,
  other: <Sparkles size={14} strokeWidth={1.5} />,
};

function formatDate(dateStr: string) {
  const d = new Date(dateStr);
  return d.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' }) +
    ' · ' + d.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });
}

interface EventCardProps {
  event: TixEvent;
}

export default function EventCard({ event }: EventCardProps) {
  return (
    <motion.div
      whileHover={{ y: -4 }}
      transition={{ duration: 0.2 }}
    >
      <Link href={`/events/${event.event_id}`} style={{ textDecoration: 'none', display: 'block' }}>
        <div
          style={{
            backgroundColor: '#141414',
            border: '1px solid rgba(255,255,255,0.08)',
            borderRadius: 16,
            overflow: 'hidden',
            boxShadow: '0 4px 16px rgba(0,0,0,0.5), 0 1px 0 rgba(255,255,255,0.06) inset',
            transition: 'all 200ms ease',
            cursor: 'pointer',
          }}
          onMouseEnter={e => {
            (e.currentTarget as HTMLElement).style.border = '1px solid rgba(139,92,246,0.30)';
            (e.currentTarget as HTMLElement).style.boxShadow = '0 8px 32px rgba(0,0,0,0.6), 0 1px 0 rgba(255,255,255,0.08) inset';
          }}
          onMouseLeave={e => {
            (e.currentTarget as HTMLElement).style.border = '1px solid rgba(255,255,255,0.08)';
            (e.currentTarget as HTMLElement).style.boxShadow = '0 4px 16px rgba(0,0,0,0.5), 0 1px 0 rgba(255,255,255,0.06) inset';
          }}
        >
          {/* Image area */}
          <div style={{ position: 'relative', aspectRatio: '16/9', overflow: 'hidden' }}>
            {event.cover_image_url ? (
              <img src={event.cover_image_url} alt={event.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            ) : (
              <div style={{ width: '100%', height: '100%', background: 'linear-gradient(135deg, #1E1E1E 0%, #141414 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Calendar size={48} strokeWidth={1} style={{ color: '#71717A' }} />
              </div>
            )}
            {/* Event type badge */}
            <div style={{
              position: 'absolute',
              top: 12,
              left: 12,
              backgroundColor: 'rgba(139,92,246,0.90)',
              color: '#fff',
              fontSize: 11,
              fontWeight: 600,
              textTransform: 'uppercase',
              padding: '4px 10px',
              borderRadius: 6,
              display: 'flex',
              alignItems: 'center',
              gap: 4,
            }}>
              {typeIcons[event.event_type]}
              {event.event_type}
            </div>
          </div>

          {/* Content */}
          <div style={{ padding: 20 }}>
            <h3 style={{ fontSize: 18, fontWeight: 600, color: '#F4F4F5', margin: '0 0 8px', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
              {event.title}
            </h3>

            <div style={{ display: 'flex', alignItems: 'center', gap: 6, color: '#A1A1AA', fontSize: 14, fontWeight: 500, marginBottom: 4 }}>
              <Calendar size={14} strokeWidth={1.5} />
              {formatDate(event.event_date)}
            </div>

            {event.venues && (
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, color: '#71717A', fontSize: 14 }}>
                <MapPin size={14} strokeWidth={1.5} />
                {event.venues.name}, {event.venues.city}
              </div>
            )}

            {event.min_price != null && (
              <div style={{ fontSize: 16, fontWeight: 600, color: '#22C55E', marginTop: 12 }}>
                From ${Number(event.min_price).toFixed(0)}
              </div>
            )}
          </div>
        </div>
      </Link>
    </motion.div>
  );
}
