import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

type Params = { params: Promise<{ ticket_id: string }> };

export async function GET(_: Request, { params }: Params) {
  const { ticket_id } = await params;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { data } = await supabase
    .from('tickets')
    .select('*, tix_events(title, event_date, cover_image_url, venues(name, city, address)), seats(row_label, seat_number, seat_type), ticket_tiers(name, sections(name))')
    .eq('ticket_id', ticket_id)
    .single();

  if (!data) return NextResponse.json({ error: 'Not found' }, { status: 404 });
  if (data.user_id !== user.id) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  return NextResponse.json({ ticket: data });
}
