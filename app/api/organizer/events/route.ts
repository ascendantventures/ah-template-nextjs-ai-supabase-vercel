import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function GET() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { data: profile } = await supabase.from('profiles').select('role').eq('user_id', user.id).single();
  if (!profile || !['organizer', 'platform_admin'].includes(profile.role)) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  const query = supabase.from('tix_events').select('*, venues(name, city)');
  if (profile.role === 'organizer') query.eq('organizer_id', user.id);

  const { data } = await query.order('created_at', { ascending: false });
  return NextResponse.json({ events: data || [] });
}
