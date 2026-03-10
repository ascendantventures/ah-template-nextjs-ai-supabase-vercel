import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function GET() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { data } = await supabase
    .from('tickets')
    .select('*, tix_events(title, event_date, cover_image_url, venues(name, city)), seats(row_label, seat_number), ticket_tiers(name), orders(order_id)')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false });
  return NextResponse.json({ tickets: data || [] });
}
