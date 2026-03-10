import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';

type Params = { params: Promise<{ event_id: string }> };

export async function POST(req: Request, { params }: Params) {
  const { event_id } = await params;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  // Allow unauthenticated for guest checkout (use session ID as identifier)
  const userId = user?.id || null;

  const { seat_ids } = await req.json();
  if (!Array.isArray(seat_ids) || seat_ids.length === 0) {
    return NextResponse.json({ error: 'seat_ids required' }, { status: 400 });
  }

  const admin = createAdminClient();
  const expiresAt = new Date(Date.now() + 10 * 60 * 1000).toISOString();
  const locked: string[] = [];
  const failed: string[] = [];

  for (const seatId of seat_ids) {
    const { data: inv } = await admin
      .from('seat_inventory')
      .select('inventory_id, status, locked_by, locked_until')
      .eq('event_id', event_id)
      .eq('seat_id', seatId)
      .single();

    if (!inv) { failed.push(seatId); continue; }

    const now = new Date();
    const isAvailable = inv.status === 'available' ||
      (inv.status === 'locked' && userId && inv.locked_by === userId) ||
      (inv.status === 'locked' && inv.locked_until && new Date(inv.locked_until) < now);

    if (!isAvailable) { failed.push(seatId); continue; }

    const { error } = await admin.from('seat_inventory').update({
      status: 'locked',
      locked_by: userId,
      locked_until: expiresAt,
    }).eq('inventory_id', inv.inventory_id);

    if (error) { failed.push(seatId); } else { locked.push(seatId); }
  }

  return NextResponse.json({ locked, failed, expires_at: expiresAt });
}

export async function DELETE(req: Request, { params }: Params) {
  const { event_id } = await params;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  const admin = createAdminClient();

  if (user) {
    await admin.from('seat_inventory')
      .update({ status: 'available', locked_by: null, locked_until: null })
      .eq('event_id', event_id)
      .eq('locked_by', user.id)
      .eq('status', 'locked');
  }

  return NextResponse.json({ ok: true });
}
