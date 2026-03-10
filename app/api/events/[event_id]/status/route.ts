import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';

type Params = { params: Promise<{ event_id: string }> };

const VALID_STATUSES = ['draft', 'published', 'on_sale', 'sold_out', 'cancelled', 'completed'];

export async function PATCH(req: Request, { params }: Params) {
  const { event_id } = await params;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { data: event } = await supabase.from('tix_events').select('organizer_id').eq('event_id', event_id).single();
  const { data: profile } = await supabase.from('profiles').select('role').eq('user_id', user.id).single();
  if (!event || !profile || (event.organizer_id !== user.id && profile.role !== 'platform_admin')) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  const { status } = await req.json();
  if (!VALID_STATUSES.includes(status)) return NextResponse.json({ error: 'Invalid status' }, { status: 400 });

  const admin = createAdminClient();
  const { data, error } = await admin.from('tix_events').update({ status, updated_at: new Date().toISOString() }).eq('event_id', event_id).select().single();
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ event: data });
}
