import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export const runtime = 'nodejs'

export async function POST(req: NextRequest) {
  try {
    const { creatorId, linkId, referrer } = await req.json();
    if (!creatorId) return NextResponse.json({ ok: false }, { status: 400 });

    const supabase = await createClient();
    const country = req.headers.get('x-vercel-ip-country') ?? req.headers.get('cf-ipcountry') ?? undefined;

    await supabase.from('sirena_link_clicks').insert({
      creator_id: creatorId,
      link_id: linkId || undefined,
      ip_country: country,
      referrer: referrer || undefined,
    });

    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ ok: false }, { status: 500 });
  }
}
