import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';

type Params = { params: Promise<{ event_id: string }> };

export async function GET(_: Request, { params }: Params) {
  const { event_id } = await params;
  const supabase = await createClient();
  const { data } = await supabase.from('ticket_tiers').select('*, sections(name, section_type)').eq('event_id', event_id);
  return NextResponse.json({ tiers: data || [] });
}

export async function POST(req: Request, { params }: Params) {
  const { event_id } = await params;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { data: event } = await supabase.from('tix_events').select('organizer_id').eq('event_id', event_id).single();
  const { data: profile } = await supabase.from('profiles').select('role').eq('user_id', user.id).single();
  if (!event || !profile || (event.organizer_id !== user.id && profile.role !== 'platform_admin')) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  const body = await req.json();
  const { section_id, name, price, fee_amount, max_per_order, total_capacity } = body;

  const admin = createAdminClient();
  const { data, error } = await admin.from('ticket_tiers').upsert({
    event_id, section_id, name, price: Number(price), fee_amount: Number(fee_amount) || 0,
    max_per_order: Number(max_per_order) || 8, total_capacity: total_capacity ? Number(total_capacity) : null,
  }, { onConflict: 'event_id,section_id' }).select().single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ tier: data }, { status: 201 });
}
