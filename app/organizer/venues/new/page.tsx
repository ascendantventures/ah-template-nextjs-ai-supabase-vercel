'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Loader2 } from 'lucide-react';

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

export default function NewVenuePage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [form, setForm] = useState({
    name: '',
    address: '',
    city: '',
    state: '',
    country: 'US',
    zip_code: '',
    capacity: '',
    timezone: 'America/New_York',
  });

  function handleChange(e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) {
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const res = await fetch('/api/venues', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        ...form,
        capacity: form.capacity ? parseInt(form.capacity) : null,
      }),
    });

    if (res.ok) {
      const data = await res.json();
      router.push(`/organizer/venues/${data.venue.venue_id}`);
    } else {
      const data = await res.json();
      setError(data.error || 'Failed to create venue');
      setLoading(false);
    }
  }

  return (
    <div style={{ padding: 32, maxWidth: 700, margin: '0 auto' }}>
      <Link href="/organizer/venues" style={{ color: '#8B5CF6', textDecoration: 'none', fontSize: 14, display: 'inline-flex', alignItems: 'center', gap: 4, marginBottom: 24 }}>
        ← Back to Venues
      </Link>

      <div style={{ marginBottom: 32 }}>
        <h1 style={{ fontSize: 28, fontWeight: 700, color: '#F4F4F5', margin: '0 0 4px' }}>Add New Venue</h1>
        <p style={{ color: '#A1A1AA', margin: 0 }}>Enter your venue details</p>
      </div>

      <div style={{ backgroundColor: '#141414', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 16, padding: 32 }}>
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
          <div>
            <label style={labelStyle}>Venue Name *</label>
            <input name="name" value={form.name} onChange={handleChange} required style={inputStyle} placeholder="e.g. Madison Square Garden" />
          </div>

          <div>
            <label style={labelStyle}>Street Address</label>
            <input name="address" value={form.address} onChange={handleChange} style={inputStyle} placeholder="123 Main St" />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
            <div>
              <label style={labelStyle}>City *</label>
              <input name="city" value={form.city} onChange={handleChange} required style={inputStyle} placeholder="New York" />
            </div>
            <div>
              <label style={labelStyle}>State *</label>
              <input name="state" value={form.state} onChange={handleChange} required style={inputStyle} placeholder="NY" maxLength={2} />
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 16 }}>
            <div>
              <label style={labelStyle}>ZIP Code</label>
              <input name="zip_code" value={form.zip_code} onChange={handleChange} style={inputStyle} placeholder="10001" />
            </div>
            <div>
              <label style={labelStyle}>Country</label>
              <input name="country" value={form.country} onChange={handleChange} style={inputStyle} placeholder="US" maxLength={2} />
            </div>
            <div>
              <label style={labelStyle}>Capacity</label>
              <input name="capacity" type="number" value={form.capacity} onChange={handleChange} style={inputStyle} placeholder="20000" min="1" />
            </div>
          </div>

          <div>
            <label style={labelStyle}>Timezone</label>
            <select name="timezone" value={form.timezone} onChange={handleChange} style={inputStyle}>
              <option value="America/New_York">Eastern (ET)</option>
              <option value="America/Chicago">Central (CT)</option>
              <option value="America/Denver">Mountain (MT)</option>
              <option value="America/Los_Angeles">Pacific (PT)</option>
              <option value="America/Phoenix">Arizona (AZ)</option>
              <option value="Pacific/Honolulu">Hawaii (HI)</option>
              <option value="America/Anchorage">Alaska (AK)</option>
            </select>
          </div>

          {error && <p style={{ color: '#EF4444', fontSize: 14, margin: 0 }}>{error}</p>}

          <div style={{ display: 'flex', gap: 12, justifyContent: 'flex-end' }}>
            <Link href="/organizer/venues" style={{ padding: '10px 20px', borderRadius: 8, border: '1px solid rgba(255,255,255,0.1)', color: '#A1A1AA', textDecoration: 'none', fontSize: 14, fontWeight: 500 }}>
              Cancel
            </Link>
            <button
              type="submit"
              disabled={loading}
              style={{ display: 'flex', alignItems: 'center', gap: 8, backgroundColor: '#8B5CF6', color: '#fff', border: 'none', borderRadius: 8, padding: '10px 20px', fontSize: 14, fontWeight: 600, cursor: loading ? 'not-allowed' : 'pointer', opacity: loading ? 0.7 : 1 }}
            >
              {loading && <Loader2 size={15} style={{ animation: 'spin 1s linear infinite' }} />}
              {loading ? 'Creating...' : 'Add Venue'}
            </button>
          </div>
        </form>
      </div>

      <style>{`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}
