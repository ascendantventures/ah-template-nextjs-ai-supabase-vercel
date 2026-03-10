import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import { MapPin, Plus, ChevronRight, Users } from 'lucide-react';

export default async function OrganizerVenuesPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/login');

  const { data: venues } = await supabase
    .from('venues')
    .select('*')
    .eq('owner_id', user.id)
    .order('created_at', { ascending: false });

  return (
    <div style={{ padding: 32, maxWidth: 900, margin: '0 auto' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 32 }}>
        <div>
          <h1 style={{ fontSize: 28, fontWeight: 700, color: '#F4F4F5', margin: '0 0 4px' }}>My Venues</h1>
          <p style={{ color: '#A1A1AA', margin: 0 }}>{(venues || []).length} venue{(venues || []).length !== 1 ? 's' : ''}</p>
        </div>
        <Link
          href="/organizer/venues/new"
          style={{ display: 'flex', alignItems: 'center', gap: 8, backgroundColor: '#8B5CF6', color: '#fff', textDecoration: 'none', padding: '10px 18px', borderRadius: 10, fontSize: 14, fontWeight: 600 }}
        >
          <Plus size={16} /> Add Venue
        </Link>
      </div>

      {(!venues || venues.length === 0) ? (
        <div style={{ textAlign: 'center', padding: '80px 0', backgroundColor: '#141414', borderRadius: 16, border: '1px solid rgba(255,255,255,0.08)' }}>
          <MapPin size={48} style={{ color: '#3F3F46', marginBottom: 16 }} />
          <h3 style={{ color: '#F4F4F5', margin: '0 0 8px' }}>No venues yet</h3>
          <p style={{ color: '#71717A', margin: '0 0 24px' }}>Add your first venue to start creating events</p>
          <Link href="/organizer/venues/new" style={{ backgroundColor: '#8B5CF6', color: '#fff', textDecoration: 'none', padding: '10px 20px', borderRadius: 8, fontSize: 14, fontWeight: 600 }}>
            Add Venue
          </Link>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {(venues as any[]).map(venue => (
            <Link
              key={venue.venue_id}
              href={`/organizer/venues/${venue.venue_id}`}
              style={{ textDecoration: 'none', backgroundColor: '#141414', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 12, padding: 20, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}
            >
              <div style={{ display: 'flex', gap: 16, alignItems: 'center' }}>
                <div style={{ width: 48, height: 48, borderRadius: 10, backgroundColor: 'rgba(139,92,246,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <MapPin size={22} style={{ color: '#8B5CF6' }} />
                </div>
                <div>
                  <div style={{ fontSize: 16, fontWeight: 600, color: '#F4F4F5' }}>{venue.name}</div>
                  <div style={{ fontSize: 13, color: '#71717A', marginTop: 4 }}>
                    {venue.address ? `${venue.address} · ` : ''}{venue.city}, {venue.state}
                  </div>
                </div>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                {venue.capacity && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    <Users size={14} style={{ color: '#71717A' }} />
                    <span style={{ fontSize: 13, color: '#A1A1AA' }}>{venue.capacity.toLocaleString()} cap</span>
                  </div>
                )}
                <ChevronRight size={18} style={{ color: '#52525B' }} />
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
