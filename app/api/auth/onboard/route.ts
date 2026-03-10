import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';

export async function POST(req: Request) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const body = await req.json();
  const { full_name, role = 'fan' } = body;

  const admin = createAdminClient();
  const { data, error } = await admin
    .from('profiles')
    .upsert({
      user_id: user.id,
      email: user.email!,
      full_name: full_name || '',
      role: ['fan', 'organizer'].includes(role) ? role : 'fan',
    }, { onConflict: 'user_id' })
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ profile: data });
}
