import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';

type Params = { params: Promise<{ venue_id: string; section_id: string }> };

export async function PATCH(req: Request, { params }: Params) {
  const { venue_id, section_id } = await params;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { data: venue } = await supabase.from('venues').select('organizer_id').eq('venue_id', venue_id).single();
  const { data: profile } = await supabase.from('profiles').select('role').eq('user_id', user.id).single();
  if (!venue || (!profile) || (venue.organizer_id !== user.id && profile.role !== 'platform_admin')) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  const body = await req.json();
  const admin = createAdminClient();
  const { data, error } = await admin.from('sections').update(body).eq('section_id', section_id).select().single();
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ section: data });
}

export async function DELETE(_: Request, { params }: Params) {
  const { venue_id, section_id } = await params;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { data: venue } = await supabase.from('venues').select('organizer_id').eq('venue_id', venue_id).single();
  const { data: profile } = await supabase.from('profiles').select('role').eq('user_id', user.id).single();
  if (!venue || (!profile) || (venue.organizer_id !== user.id && profile.role !== 'platform_admin')) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  const admin = createAdminClient();
  await admin.from('sections').delete().eq('section_id', section_id);
  return NextResponse.json({ ok: true });
}
