'use client';

import { useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { QrCode, CheckCircle2, XCircle, Loader2 } from 'lucide-react';

export default function ScanPage() {
  const params = useParams();
  const event_id = params.event_id as string;
  const [ticketId, setTicketId] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<{ success: boolean; message: string; ticket?: any } | null>(null);

  async function handleScan(e: React.FormEvent) {
    e.preventDefault();
    if (!ticketId.trim()) return;
    setLoading(true);
    setResult(null);

    const res = await fetch(`/api/tickets/${ticketId}/validate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ event_id }),
    });

    const data = await res.json();
    setResult({ success: res.ok, message: data.message || (res.ok ? 'Ticket validated successfully' : data.error || 'Validation failed'), ticket: data.ticket });
    setLoading(false);
    if (res.ok) setTicketId('');
  }

  return (
    <div style={{ padding: 32, maxWidth: 600, margin: '0 auto' }}>
      <Link href={`/organizer/events/${event_id}`} style={{ color: '#8B5CF6', textDecoration: 'none', fontSize: 14, display: 'inline-flex', alignItems: 'center', gap: 4, marginBottom: 24 }}>
        ← Back to Event
      </Link>

      <div style={{ marginBottom: 32 }}>
        <h1 style={{ fontSize: 28, fontWeight: 700, color: '#F4F4F5', margin: '0 0 4px' }}>Ticket Scanner</h1>
        <p style={{ color: '#A1A1AA', margin: 0 }}>Scan or enter ticket IDs to validate entry</p>
      </div>

      <div style={{ backgroundColor: '#141414', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 16, padding: 32, marginBottom: 20 }}>
        {/* Scanner icon */}
        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 24 }}>
          <div style={{ width: 80, height: 80, borderRadius: 20, backgroundColor: 'rgba(139,92,246,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <QrCode size={40} style={{ color: '#8B5CF6' }} />
          </div>
        </div>

        <form onSubmit={handleScan} style={{ display: 'flex', gap: 10 }}>
          <input
            value={ticketId}
            onChange={e => setTicketId(e.target.value)}
            placeholder="Enter ticket ID or scan QR code..."
            style={{ flex: 1, height: 44, backgroundColor: '#1E1E1E', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 10, padding: '0 14px', fontSize: 15, color: '#F4F4F5', outline: 'none' }}
            autoFocus
          />
          <button
            type="submit"
            disabled={loading || !ticketId.trim()}
            style={{ display: 'flex', alignItems: 'center', gap: 8, backgroundColor: '#8B5CF6', color: '#fff', border: 'none', borderRadius: 10, padding: '0 20px', fontSize: 14, fontWeight: 600, cursor: loading ? 'not-allowed' : 'pointer', opacity: loading || !ticketId.trim() ? 0.6 : 1, whiteSpace: 'nowrap' }}
          >
            {loading ? <Loader2 size={16} style={{ animation: 'spin 1s linear infinite' }} /> : 'Validate'}
          </button>
        </form>
      </div>

      {/* Result */}
      {result && (
        <div style={{ backgroundColor: result.success ? 'rgba(34,197,94,0.1)' : 'rgba(239,68,68,0.1)', border: `1px solid ${result.success ? 'rgba(34,197,94,0.3)' : 'rgba(239,68,68,0.3)'}`, borderRadius: 16, padding: 24 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: result.ticket ? 16 : 0 }}>
            {result.success
              ? <CheckCircle2 size={28} style={{ color: '#22C55E', flexShrink: 0 }} />
              : <XCircle size={28} style={{ color: '#EF4444', flexShrink: 0 }} />
            }
            <div>
              <div style={{ fontSize: 16, fontWeight: 600, color: result.success ? '#22C55E' : '#EF4444' }}>
                {result.success ? 'Entry Approved' : 'Entry Denied'}
              </div>
              <div style={{ fontSize: 14, color: '#A1A1AA', marginTop: 2 }}>{result.message}</div>
            </div>
          </div>
          {result.ticket && (
            <div style={{ borderTop: `1px solid ${result.success ? 'rgba(34,197,94,0.2)' : 'rgba(239,68,68,0.2)'}`, paddingTop: 16, display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
              {result.ticket.holder_name && (
                <div>
                  <div style={{ fontSize: 11, color: '#71717A', marginBottom: 2 }}>Holder</div>
                  <div style={{ fontSize: 14, color: '#F4F4F5' }}>{result.ticket.holder_name}</div>
                </div>
              )}
              {result.ticket.holder_email && (
                <div>
                  <div style={{ fontSize: 11, color: '#71717A', marginBottom: 2 }}>Email</div>
                  <div style={{ fontSize: 14, color: '#F4F4F5' }}>{result.ticket.holder_email}</div>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      <style>{`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}
