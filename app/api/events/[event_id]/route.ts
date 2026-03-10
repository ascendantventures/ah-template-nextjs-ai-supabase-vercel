import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';

type Params = { params: Promise<{ event_id: string }> };

export async function GET(_: Request, { params }: Params) {
  const { event_id } = await params;
  const supabase = await createClient();
  const { data } = await supabase.from('tix_events').select('*, venues(*)').eq('event_id', event_id).single();
  if (!data) return NextResponse.json({ error: 'Not found' }, { status: 404 });
  return NextResponse.json({ event: data });
}

export async function PATCH(req: Request, { params }: Params) {
  const { event_id } = await params;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { data: profile } = await supabase.from('profiles').select('role').eq('user_id', user.id).single();
  const { data: event } = await supabase.from('tix_events').select('organizer_id').eq('event_id', event_id).single();
  if (!event) return NextResponse.json({ error: 'Not found' }, { status: 404 });
  if (!profile || (event.organizer_id !== user.id && profile.role !== 'platform_admin')) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  const body = await req.json();
  const admin = createAdminClient();
  const { data, error } = await admin.from('tix_events').update({ ...body, updated_at: new Date().toISOString() }).eq('event_id', event_id).select().single();
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ event: data });
}

export async function DELETE(_: Request, { params }: Params) {
  const { event_id } = await params;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { data: profile } = await supabase.from('profiles').select('role').eq('user_id', user.id).single();
  const { data: event } = await supabase.from('tix_events').select('organizer_id').eq('event_id', event_id).single();
  if (!event) return NextResponse.json({ error: 'Not found' }, { status: 404 });
  if (!profile || (event.organizer_id !== user.id && profile.role !== 'platform_admin')) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  const admin = createAdminClient();
  await admin.from('tix_events').delete().eq('event_id', event_id);
  return NextResponse.json({ ok: true });
}
