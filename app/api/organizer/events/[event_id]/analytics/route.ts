import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

type Params = { params: Promise<{ event_id: string }> };

export async function GET(_: Request, { params }: Params) {
  const { event_id } = await params;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { data: tiers } = await supabase.from('ticket_tiers').select('*').eq('event_id', event_id);
  const { data: orders } = await supabase.from('orders').select('total, status').eq('event_id', event_id).eq('status', 'confirmed');
  const { data: inventory } = await supabase.from('seat_inventory').select('status').eq('event_id', event_id);

  const totalSeats = inventory?.length || 0;
  const soldSeats = inventory?.filter(i => i.status === 'sold').length || 0;
  const availableSeats = inventory?.filter(i => i.status === 'available').length || 0;
  const revenue = (orders || []).reduce((sum, o) => sum + Number(o.total), 0);
  const totalSold = (tiers || []).reduce((sum, t) => sum + (t.sold_count || 0), 0);

  return NextResponse.json({
    totalSeats, soldSeats, availableSeats,
    revenue: revenue.toFixed(2),
    totalSold,
    availabilityPercent: totalSeats > 0 ? Math.round((availableSeats / totalSeats) * 100) : 0,
  });
}
