import { createClient } from '@/lib/supabase/server';
import { redirect, notFound } from 'next/navigation';
import Link from 'next/link';
import { MapPin, Users, Settings, ChevronRight } from 'lucide-react';

export default async function VenueDetailPage({ params }: { params: Promise<{ venue_id: string }> }) {
  const { venue_id } = await params;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/login');

  const { data: venue } = await supabase
    .from('venues')
    .select('*')
    .eq('venue_id', venue_id)
    .eq('owner_id', user.id)
    .single();

  if (!venue) notFound();

  const { data: sections } = await supabase
    .from('sections')
    .select('*, seats(seat_id)')
    .eq('venue_id', venue_id)
    .order('name');

  const v = venue as any;

  return (
    <div style={{ padding: 32, maxWidth: 900, margin: '0 auto' }}>
      <Link href="/organizer/venues" style={{ color: '#8B5CF6', textDecoration: 'none', fontSize: 14, display: 'inline-flex', alignItems: 'center', gap: 4, marginBottom: 24 }}>
        ← Back to Venues
      </Link>

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 32 }}>
        <div>
          <h1 style={{ fontSize: 28, fontWeight: 700, color: '#F4F4F5', margin: '0 0 4px' }}>{v.name}</h1>
          <p style={{ color: '#A1A1AA', margin: 0 }}>{v.city}, {v.state}</p>
        </div>
        <Link
          href={`/organizer/venues/${venue_id}/sections`}
          style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '9px 16px', borderRadius: 8, backgroundColor: '#8B5CF6', color: '#fff', textDecoration: 'none', fontSize: 13, fontWeight: 500 }}
        >
          <Settings size={14} /> Manage Sections
        </Link>
      </div>

      {/* Venue Info */}
      <div style={{ backgroundColor: '#141414', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 12, padding: 24, marginBottom: 24 }}>
        <h2 style={{ fontSize: 16, fontWeight: 600, color: '#F4F4F5', margin: '0 0 20px' }}>Venue Details</h2>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 20 }}>
          <div>
            <div style={{ fontSize: 12, color: '#71717A', marginBottom: 4 }}>Address</div>
            <div style={{ fontSize: 14, color: '#F4F4F5' }}>{v.address || 'Not set'}</div>
            <div style={{ fontSize: 13, color: '#A1A1AA' }}>{v.city}, {v.state} {v.zip_code}</div>
          </div>
          <div>
            <div style={{ fontSize: 12, color: '#71717A', marginBottom: 4 }}>Capacity</div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <Users size={16} style={{ color: '#8B5CF6' }} />
              <span style={{ fontSize: 14, color: '#F4F4F5' }}>{v.capacity?.toLocaleString() || 'Not set'}</span>
            </div>
          </div>
          <div>
            <div style={{ fontSize: 12, color: '#71717A', marginBottom: 4 }}>Timezone</div>
            <div style={{ fontSize: 14, color: '#F4F4F5' }}>{v.timezone || 'America/New_York'}</div>
          </div>
        </div>
      </div>

      {/* Sections */}
      <div style={{ backgroundColor: '#141414', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 12, padding: 24 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
          <h2 style={{ fontSize: 16, fontWeight: 600, color: '#F4F4F5', margin: 0 }}>Sections ({(sections || []).length})</h2>
          <Link
            href={`/organizer/venues/${venue_id}/sections`}
            style={{ fontSize: 13, color: '#8B5CF6', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 4 }}
          >
            Manage <ChevronRight size={13} />
          </Link>
        </div>

        {(!sections || sections.length === 0) ? (
          <div style={{ textAlign: 'center', padding: '32px 0', color: '#71717A' }}>
            <MapPin size={32} style={{ marginBottom: 8, opacity: 0.4 }} />
            <p style={{ margin: '0 0 12px', fontSize: 14 }}>No sections configured</p>
            <Link href={`/organizer/venues/${venue_id}/sections`} style={{ color: '#8B5CF6', textDecoration: 'none', fontSize: 14 }}>
              Set up seating sections
            </Link>
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12 }}>
            {(sections as any[]).map(section => (
              <div key={section.section_id} style={{ backgroundColor: '#1E1E1E', borderRadius: 10, padding: 16 }}>
                <div style={{ fontSize: 14, fontWeight: 600, color: '#F4F4F5', marginBottom: 4 }}>{section.name}</div>
                <div style={{ fontSize: 12, color: '#71717A' }}>{section.seats?.length || 0} seats</div>
                {section.description && <div style={{ fontSize: 12, color: '#52525B', marginTop: 4 }}>{section.description}</div>}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
