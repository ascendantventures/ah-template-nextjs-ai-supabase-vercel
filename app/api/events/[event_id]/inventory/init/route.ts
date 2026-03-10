import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';

type Params = { params: Promise<{ event_id: string }> };

export async function POST(_: Request, { params }: Params) {
  const { event_id } = await params;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { data: event } = await supabase.from('tix_events').select('organizer_id, venue_id').eq('event_id', event_id).single();
  const { data: profile } = await supabase.from('profiles').select('role').eq('user_id', user.id).single();
  if (!event || !profile || (event.organizer_id !== user.id && profile.role !== 'platform_admin')) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  // Get all seats for venue
  const { data: seats } = await supabase.from('seats').select('seat_id, section_id').eq('venue_id', event.venue_id);
  if (!seats?.length) return NextResponse.json({ error: 'No seats found for venue' }, { status: 400 });

  // Get tiers to map section->tier
  const { data: tiers } = await supabase.from('ticket_tiers').select('tier_id, section_id').eq('event_id', event_id);
  const tierBySectionId = Object.fromEntries((tiers || []).map(t => [t.section_id, t.tier_id]));

  const rows = seats.map(seat => ({
    event_id,
    seat_id: seat.seat_id,
    tier_id: tierBySectionId[seat.section_id] || null,
    status: 'available',
  }));

  const admin = createAdminClient();
  const { data, error } = await admin.from('seat_inventory').upsert(rows, { onConflict: 'event_id,seat_id', ignoreDuplicates: true }).select();
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ seeded: data?.length || 0 });
}
