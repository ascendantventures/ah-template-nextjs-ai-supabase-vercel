import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

type Params = { params: Promise<{ event_id: string }> };

export async function GET(_: Request, { params }: Params) {
  const { event_id } = await params;
  const supabase = await createClient();
  const { data } = await supabase
    .from('seat_inventory')
    .select('*, seats(seat_id, row_label, seat_number, seat_type, x_pos, y_pos, section_id)')
    .eq('event_id', event_id);
  return NextResponse.json({ inventory: data || [] });
}
