import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';

type Params = { params: Promise<{ venue_id: string }> };

export async function GET(_: Request, { params }: Params) {
  const { venue_id } = await params;
  const supabase = await createClient();
  const { data } = await supabase.from('sections').select('*').eq('venue_id', venue_id).order('name');
  return NextResponse.json({ sections: data || [] });
}

export async function POST(req: Request, { params }: Params) {
  const { venue_id } = await params;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { data: venue } = await supabase.from('venues').select('organizer_id').eq('venue_id', venue_id).single();
  if (!venue) return NextResponse.json({ error: 'Not found' }, { status: 404 });

  const { data: profile } = await supabase.from('profiles').select('role').eq('user_id', user.id).single();
  if (!profile || (venue.organizer_id !== user.id && profile.role !== 'platform_admin')) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  const body = await req.json();
  const { name, row_count, seat_count_per_row, base_price, section_type, color_hex } = body;

  const admin = createAdminClient();
  const { data, error } = await admin.from('sections').insert({
    venue_id, name, row_count: Number(row_count) || 0, seat_count_per_row: Number(seat_count_per_row) || 0,
    base_price: Number(base_price) || 0, section_type: section_type || 'standard', color_hex,
  }).select().single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ section: data }, { status: 201 });
}
