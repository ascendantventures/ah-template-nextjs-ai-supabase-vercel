import { NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';

export async function POST() {
  const admin = createAdminClient();
  await admin.rpc('release_expired_locks');
  return NextResponse.json({ ok: true });
}
