import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const search = searchParams.get('search');
  const type = searchParams.get('type');
  const status = searchParams.get('status');

  const supabase = await createClient();
  let query = supabase.from('tix_events').select('*, venues(name, city, state)');

  if (status) {
    query = query.eq('status', status);
  } else {
    query = query.in('status', ['on_sale', 'published']);
  }
  if (search) query = query.or(`title.ilike.%${search}%,description.ilike.%${search}%`);
  if (type && type !== 'all') query = query.eq('event_type', type);

  const { data } = await query.order('event_date', { ascending: true }).limit(50);
  return NextResponse.json({ events: data || [] });
}

export async function POST(req: Request) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { data: profile } = await supabase.from('profiles').select('role').eq('user_id', user.id).single();
  if (!profile || !['organizer', 'platform_admin'].includes(profile.role)) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  const body = await req.json();
  const { title, description, event_type, event_date, doors_open_at, venue_id, cover_image_url, tags } = body;

  const admin = createAdminClient();
  const { data, error } = await admin.from('tix_events').insert({
    organizer_id: user.id, venue_id, title, description, event_type: event_type || 'concert',
    event_date, doors_open_at, cover_image_url, tags, status: 'draft',
  }).select().single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ event: data }, { status: 201 });
}
