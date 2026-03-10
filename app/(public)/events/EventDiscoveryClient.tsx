'use client';

import { motion } from 'framer-motion';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Search, SearchX } from 'lucide-react';
import { TixEvent } from '@/types';
import EventGrid from '@/components/events/EventGrid';
import Link from 'next/link';

const EVENT_TYPES = [
  { value: 'all', label: 'All Events' },
  { value: 'concert', label: 'Concerts' },
  { value: 'sports', label: 'Sports' },
  { value: 'conference', label: 'Conferences' },
  { value: 'other', label: 'Other' },
];

interface EventDiscoveryClientProps {
  events: TixEvent[];
  initialSearch?: string;
  initialType?: string;
}

export default function EventDiscoveryClient({ events, initialSearch, initialType }: EventDiscoveryClientProps) {
  const router = useRouter();
  const [search, setSearch] = useState(initialSearch || '');
  const [activeType, setActiveType] = useState(initialType || 'all');

  function applyFilters(s: string, t: string) {
    const params = new URLSearchParams();
    if (s) params.set('search', s);
    if (t && t !== 'all') params.set('type', t);
    router.push(`/events?${params.toString()}`);
  }

  function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    applyFilters(search, activeType);
  }

  function handleTypeChange(type: string) {
    setActiveType(type);
    applyFilters(search, type);
  }

  function clearFilters() {
    setSearch('');
    setActiveType('all');
    router.push('/events');
  }

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#09090B' }}>
      {/* Hero */}
      <div className="hero-gradient" style={{ minHeight: '60vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '80px 24px', textAlign: 'center' }}>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
          style={{ maxWidth: 800 }}
        >
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '6px 16px', borderRadius: 9999, border: '1px solid rgba(139,92,246,0.40)', fontSize: 14, fontWeight: 500, color: '#A78BFA', marginBottom: 24 }}>
            Live Events Available Now
          </div>

          <h1 style={{ fontSize: 'clamp(40px, 6vw, 56px)', fontWeight: 800, letterSpacing: '-0.03em', color: '#F4F4F5', margin: '0 0 16px', lineHeight: 1.1 }}>
            Discover Unforgettable Experiences
          </h1>
          <p style={{ fontSize: 18, color: '#A1A1AA', margin: '0 0 32px', lineHeight: 1.6 }}>
            Find and book tickets to concerts, sports, and conferences
          </p>

          {/* Search bar */}
          <form onSubmit={handleSearch} style={{ maxWidth: 560, margin: '0 auto' }}>
            <div style={{ backgroundColor: '#141414', border: '1px solid rgba(255,255,255,0.10)', borderRadius: 12, padding: 8, display: 'flex', gap: 8 }}>
              <input
                type="text"
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder="Search events..."
                style={{
                  flex: 1,
                  background: 'transparent',
                  border: 'none',
                  outline: 'none',
                  fontSize: 16,
                  color: '#F4F4F5',
                  padding: '4px 8px',
                }}
              />
              <motion.button
                whileTap={{ scale: 0.97 }}
                type="submit"
                style={{
                  backgroundColor: '#8B5CF6',
                  color: '#fff',
                  border: 'none',
                  borderRadius: 10,
                  padding: '8px 20px',
                  fontSize: 14,
                  fontWeight: 600,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 6,
                }}
              >
                <Search size={16} strokeWidth={2} />
                Search
              </motion.button>
            </div>
          </form>
        </motion.div>
      </div>

      {/* Filter bar */}
      <div style={{ backgroundColor: '#0F0F0F', borderBottom: '1px solid rgba(255,255,255,0.06)', padding: '16px 0', position: 'sticky', top: 64, zIndex: 40 }}>
        <div style={{ maxWidth: 1280, margin: '0 auto', padding: '0 24px', display: 'flex', gap: 8, overflowX: 'auto' }}>
          {EVENT_TYPES.map(t => (
            <button
              key={t.value}
              onClick={() => handleTypeChange(t.value)}
              style={{
                padding: '8px 16px',
                borderRadius: 9999,
                fontSize: 14,
                fontWeight: 500,
                cursor: 'pointer',
                transition: 'all 150ms ease',
                border: activeType === t.value ? '1px solid rgba(139,92,246,0.30)' : '1px solid rgba(255,255,255,0.10)',
                backgroundColor: activeType === t.value ? 'rgba(139,92,246,0.15)' : '#1E1E1E',
                color: activeType === t.value ? '#8B5CF6' : '#A1A1AA',
                whiteSpace: 'nowrap',
              }}
            >
              {t.label}
            </button>
          ))}
        </div>
      </div>

      {/* Events grid */}
      <div style={{ maxWidth: 1280, margin: '0 auto', padding: '48px 24px' }}>
        {events.length === 0 ? (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '80px 0', textAlign: 'center' }}>
            <SearchX size={48} strokeWidth={1} style={{ color: '#71717A', marginBottom: 16 }} />
            <h4 style={{ fontSize: 20, fontWeight: 600, color: '#A1A1AA', margin: '0 0 8px' }}>No events found</h4>
            <p style={{ fontSize: 16, color: '#71717A', margin: '0 0 24px' }}>Try adjusting your filters or search terms</p>
            <button
              onClick={clearFilters}
              style={{ padding: '8px 16px', borderRadius: 8, fontSize: 14, fontWeight: 600, color: '#8B5CF6', background: 'none', border: 'none', cursor: 'pointer' }}
            >
              Clear Filters
            </button>
          </div>
        ) : (
          <>
            <div style={{ marginBottom: 24, color: '#71717A', fontSize: 14 }}>
              {events.length} event{events.length !== 1 ? 's' : ''} found
            </div>
            <EventGrid events={events} />
          </>
        )}
      </div>
    </div>
  );
}
