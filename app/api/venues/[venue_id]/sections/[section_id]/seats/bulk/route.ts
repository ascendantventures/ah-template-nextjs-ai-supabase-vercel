import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';

type Params = { params: Promise<{ venue_id: string; section_id: string }> };

export async function POST(_: Request, { params }: Params) {
  const { venue_id, section_id } = await params;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { data: venue } = await supabase.from('venues').select('organizer_id').eq('venue_id', venue_id).single();
  const { data: profile } = await supabase.from('profiles').select('role').eq('user_id', user.id).single();
  if (!venue || (!profile) || (venue.organizer_id !== user.id && profile.role !== 'platform_admin')) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  const { data: section } = await supabase.from('sections').select('*').eq('section_id', section_id).single();
  if (!section) return NextResponse.json({ error: 'Section not found' }, { status: 404 });

  const rows: Record<string, unknown>[] = [];
  const COLS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  const SEAT_SPACING = 25;
  const ROW_SPACING = 25;

  for (let r = 0; r < section.row_count; r++) {
    const rowLabel = COLS[r] || `R${r + 1}`;
    for (let c = 0; c < section.seat_count_per_row; c++) {
      rows.push({
        section_id,
        venue_id,
        row_label: rowLabel,
        seat_number: String(c + 1),
        seat_type: section.section_type === 'accessible' ? 'accessible' : 'standard',
        x_pos: 100 + c * SEAT_SPACING,
        y_pos: 100 + r * ROW_SPACING,
      });
    }
  }

  const admin = createAdminClient();
  const { data, error } = await admin.from('seats').upsert(rows, { onConflict: 'section_id,row_label,seat_number', ignoreDuplicates: true }).select();
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ created: data?.length || 0 }, { status: 201 });
}
