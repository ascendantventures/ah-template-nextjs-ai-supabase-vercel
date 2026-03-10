import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

type Params = { params: Promise<{ order_id: string }> };

export async function GET(_: Request, { params }: Params) {
  const { order_id } = await params;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { data: profile } = await supabase.from('profiles').select('role').eq('user_id', user.id).single();
  const { data: order } = await supabase
    .from('orders')
    .select('*, tix_events(title, event_date, venue_id, venues(name, city)), tickets(*, seats(row_label, seat_number, seat_type, sections(name)))')
    .eq('order_id', order_id)
    .single();

  if (!order) return NextResponse.json({ error: 'Not found' }, { status: 404 });

  const isOwner = order.user_id === user.id;
  const isAdmin = profile?.role === 'platform_admin';
  const isOrganizerOfEvent = false; // Would need to join event organizer_id

  if (!isOwner && !isAdmin) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  return NextResponse.json({ order });
}
