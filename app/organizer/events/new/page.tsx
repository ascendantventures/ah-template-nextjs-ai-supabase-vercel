'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Calendar, Loader2 } from 'lucide-react';

const inputStyle = {
  width: '100%',
  height: 44,
  backgroundColor: '#1E1E1E',
  border: '1px solid rgba(255,255,255,0.10)',
  borderRadius: 10,
  padding: '0 14px',
  fontSize: 15,
  color: '#F4F4F5',
  outline: 'none',
  boxSizing: 'border-box' as const,
};

const labelStyle = {
  display: 'block' as const,
  fontSize: 14,
  fontWeight: 500 as const,
  color: '#A1A1AA',
  marginBottom: 6,
};

export default function NewEventPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [venues, setVenues] = useState<any[]>([]);

  const [form, setForm] = useState({
    title: '',
    description: '',
    event_date: '',
    doors_open: '',
    venue_id: '',
    event_type: 'concert',
    min_age: '',
  });

  useEffect(() => {
    fetch('/api/venues').then(r => r.json()).then(d => setVenues(d.venues || []));
  }, []);

  function handleChange(e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) {
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const res = await fetch('/api/events', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        ...form,
        min_age: form.min_age ? parseInt(form.min_age) : null,
        venue_id: form.venue_id || null,
      }),
    });

    if (res.ok) {
      const data = await res.json();
      router.push(`/organizer/events/${data.event.event_id}`);
    } else {
      const data = await res.json();
      setError(data.error || 'Failed to create event');
      setLoading(false);
    }
  }

  return (
    <div style={{ padding: 32, maxWidth: 700, margin: '0 auto' }}>
      <Link href="/organizer/events" style={{ color: '#8B5CF6', textDecoration: 'none', fontSize: 14, display: 'inline-flex', alignItems: 'center', gap: 4, marginBottom: 24 }}>
        ← Back to Events
      </Link>

      <div style={{ marginBottom: 32 }}>
        <h1 style={{ fontSize: 28, fontWeight: 700, color: '#F4F4F5', margin: '0 0 4px' }}>Create New Event</h1>
        <p style={{ color: '#A1A1AA', margin: 0 }}>Fill in the details for your event</p>
      </div>

      <div style={{ backgroundColor: '#141414', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 16, padding: 32 }}>
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
          <div>
            <label style={labelStyle}>Event Title *</label>
            <input name="title" value={form.title} onChange={handleChange} required style={inputStyle} placeholder="e.g. Summer Music Festival 2026" />
          </div>

          <div>
            <label style={labelStyle}>Description</label>
            <textarea
              name="description"
              value={form.description}
              onChange={handleChange}
              rows={4}
              style={{ ...inputStyle, height: 'auto', padding: '12px 14px', resize: 'vertical' as const }}
              placeholder="Describe your event..."
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
            <div>
              <label style={labelStyle}>Event Type *</label>
              <select name="event_type" value={form.event_type} onChange={handleChange} required style={inputStyle}>
                <option value="concert">Concert</option>
                <option value="sports">Sports</option>
                <option value="conference">Conference</option>
                <option value="other">Other</option>
              </select>
            </div>

            <div>
              <label style={labelStyle}>Min Age</label>
              <input name="min_age" type="number" value={form.min_age} onChange={handleChange} style={inputStyle} placeholder="0 (all ages)" min="0" max="99" />
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
            <div>
              <label style={labelStyle}>Event Date & Time *</label>
              <input name="event_date" type="datetime-local" value={form.event_date} onChange={handleChange} required style={inputStyle} />
            </div>

            <div>
              <label style={labelStyle}>Doors Open</label>
              <input name="doors_open" type="datetime-local" value={form.doors_open} onChange={handleChange} style={inputStyle} />
            </div>
          </div>

          <div>
            <label style={labelStyle}>Venue</label>
            <select name="venue_id" value={form.venue_id} onChange={handleChange} style={inputStyle}>
              <option value="">Select a venue (optional)</option>
              {venues.map(v => (
                <option key={v.venue_id} value={v.venue_id}>{v.name} — {v.city}, {v.state}</option>
              ))}
            </select>
            {venues.length === 0 && (
              <p style={{ fontSize: 12, color: '#71717A', marginTop: 6 }}>
                No venues yet. <Link href="/organizer/venues/new" style={{ color: '#8B5CF6' }}>Create a venue</Link> first.
              </p>
            )}
          </div>

          {error && <p style={{ color: '#EF4444', fontSize: 14, margin: 0 }}>{error}</p>}

          <div style={{ display: 'flex', gap: 12, justifyContent: 'flex-end' }}>
            <Link href="/organizer/events" style={{ padding: '10px 20px', borderRadius: 8, border: '1px solid rgba(255,255,255,0.1)', color: '#A1A1AA', textDecoration: 'none', fontSize: 14, fontWeight: 500 }}>
              Cancel
            </Link>
            <button
              type="submit"
              disabled={loading}
              style={{ display: 'flex', alignItems: 'center', gap: 8, backgroundColor: '#8B5CF6', color: '#fff', border: 'none', borderRadius: 8, padding: '10px 20px', fontSize: 14, fontWeight: 600, cursor: loading ? 'not-allowed' : 'pointer', opacity: loading ? 0.7 : 1 }}
            >
              {loading && <Loader2 size={15} style={{ animation: 'spin 1s linear infinite' }} />}
              {loading ? 'Creating...' : 'Create Event'}
            </button>
          </div>
        </form>
      </div>

      <style>{`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}
