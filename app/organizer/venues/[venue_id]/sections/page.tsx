'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { Plus, Loader2, Trash2, Users } from 'lucide-react';

const inputStyle = {
  width: '100%',
  height: 40,
  backgroundColor: '#1E1E1E',
  border: '1px solid rgba(255,255,255,0.10)',
  borderRadius: 8,
  padding: '0 12px',
  fontSize: 14,
  color: '#F4F4F5',
  outline: 'none',
  boxSizing: 'border-box' as const,
};

export default function SectionsPage() {
  const params = useParams();
  const venue_id = params.venue_id as string;

  const [sections, setSections] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [form, setForm] = useState({ name: '', description: '', rows: '10', seats_per_row: '20' });

  async function loadSections() {
    const res = await fetch(`/api/venues/${venue_id}/sections`);
    if (res.ok) {
      const data = await res.json();
      setSections(data.sections || []);
    }
    setLoading(false);
  }

  useEffect(() => { loadSections(); }, [venue_id]);

  function handleChange(e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) {
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));
  }

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    setCreating(true);
    setError(null);

    // Create section
    const res = await fetch(`/api/venues/${venue_id}/sections`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: form.name, description: form.description }),
    });

    if (!res.ok) {
      const data = await res.json();
      setError(data.error || 'Failed to create section');
      setCreating(false);
      return;
    }

    const { section } = await res.json();

    // Bulk generate seats
    if (parseInt(form.rows) > 0 && parseInt(form.seats_per_row) > 0) {
      await fetch(`/api/venues/${venue_id}/sections/${section.section_id}/seats/bulk`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ rows: parseInt(form.rows), seats_per_row: parseInt(form.seats_per_row) }),
      });
    }

    setForm({ name: '', description: '', rows: '10', seats_per_row: '20' });
    setShowForm(false);
    setCreating(false);
    loadSections();
  }

  async function handleDelete(section_id: string) {
    if (!confirm('Delete this section and all its seats?')) return;
    await fetch(`/api/venues/${venue_id}/sections/${section_id}`, { method: 'DELETE' });
    loadSections();
  }

  return (
    <div style={{ padding: 32, maxWidth: 800, margin: '0 auto' }}>
      <Link href={`/organizer/venues/${venue_id}`} style={{ color: '#8B5CF6', textDecoration: 'none', fontSize: 14, display: 'inline-flex', alignItems: 'center', gap: 4, marginBottom: 24 }}>
        ← Back to Venue
      </Link>

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 32 }}>
        <div>
          <h1 style={{ fontSize: 28, fontWeight: 700, color: '#F4F4F5', margin: '0 0 4px' }}>Sections</h1>
          <p style={{ color: '#A1A1AA', margin: 0 }}>Manage seating sections and seat layouts</p>
        </div>
        <button
          onClick={() => setShowForm(true)}
          style={{ display: 'flex', alignItems: 'center', gap: 8, backgroundColor: '#8B5CF6', color: '#fff', border: 'none', borderRadius: 10, padding: '10px 18px', fontSize: 14, fontWeight: 600, cursor: 'pointer' }}
        >
          <Plus size={16} /> Add Section
        </button>
      </div>

      {/* Add Section Form */}
      {showForm && (
        <div style={{ backgroundColor: '#141414', border: '1px solid rgba(139,92,246,0.3)', borderRadius: 12, padding: 24, marginBottom: 20 }}>
          <h3 style={{ fontSize: 16, fontWeight: 600, color: '#F4F4F5', margin: '0 0 20px' }}>New Section</h3>
          <form onSubmit={handleCreate} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <div>
              <label style={{ fontSize: 13, color: '#A1A1AA', display: 'block', marginBottom: 4 }}>Section Name *</label>
              <input name="name" value={form.name} onChange={handleChange} required style={inputStyle} placeholder="e.g. Floor A, Section 101" />
            </div>
            <div>
              <label style={{ fontSize: 13, color: '#A1A1AA', display: 'block', marginBottom: 4 }}>Description</label>
              <input name="description" value={form.description} onChange={handleChange} style={inputStyle} placeholder="Optional description" />
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
              <div>
                <label style={{ fontSize: 13, color: '#A1A1AA', display: 'block', marginBottom: 4 }}>Rows</label>
                <input name="rows" type="number" value={form.rows} onChange={handleChange} style={inputStyle} min="0" max="100" />
              </div>
              <div>
                <label style={{ fontSize: 13, color: '#A1A1AA', display: 'block', marginBottom: 4 }}>Seats per Row</label>
                <input name="seats_per_row" type="number" value={form.seats_per_row} onChange={handleChange} style={inputStyle} min="0" max="200" />
              </div>
            </div>
            {error && <p style={{ color: '#EF4444', fontSize: 13, margin: 0 }}>{error}</p>}
            <div style={{ display: 'flex', gap: 10 }}>
              <button
                type="submit"
                disabled={creating}
                style={{ display: 'flex', alignItems: 'center', gap: 6, backgroundColor: '#8B5CF6', color: '#fff', border: 'none', borderRadius: 8, padding: '9px 16px', fontSize: 14, fontWeight: 600, cursor: creating ? 'not-allowed' : 'pointer', opacity: creating ? 0.7 : 1 }}
              >
                {creating && <Loader2 size={14} style={{ animation: 'spin 1s linear infinite' }} />}
                {creating ? 'Creating...' : 'Create Section'}
              </button>
              <button
                type="button"
                onClick={() => setShowForm(false)}
                style={{ padding: '9px 16px', borderRadius: 8, border: '1px solid rgba(255,255,255,0.1)', color: '#A1A1AA', background: 'none', fontSize: 14, cursor: 'pointer' }}
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {loading ? (
        <div style={{ textAlign: 'center', padding: '60px 0', color: '#71717A' }}>Loading sections...</div>
      ) : sections.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '60px 0', backgroundColor: '#141414', borderRadius: 16, border: '1px solid rgba(255,255,255,0.08)' }}>
          <Users size={40} style={{ color: '#3F3F46', marginBottom: 12 }} />
          <p style={{ color: '#71717A', margin: 0 }}>No sections yet. Add your first section.</p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {sections.map(section => (
            <div key={section.section_id} style={{ backgroundColor: '#141414', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 12, padding: 18, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <div style={{ fontSize: 15, fontWeight: 600, color: '#F4F4F5' }}>{section.name}</div>
                {section.description && <div style={{ fontSize: 13, color: '#71717A', marginTop: 2 }}>{section.description}</div>}
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                  <Users size={14} style={{ color: '#71717A' }} />
                  <span style={{ fontSize: 13, color: '#A1A1AA' }}>{section.seat_count || 0} seats</span>
                </div>
                <button
                  onClick={() => handleDelete(section.section_id)}
                  style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#52525B', padding: 4 }}
                >
                  <Trash2 size={15} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      <style>{`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}
