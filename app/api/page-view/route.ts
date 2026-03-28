import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export const runtime = 'nodejs'

export async function POST(req: NextRequest) {
  try {
    const { creatorId, referrer } = await req.json();
    if (!creatorId) return NextResponse.json({ ok: false }, { status: 400 });

    const supabase = await createClient();
    const country = req.headers.get('x-vercel-ip-country') ?? req.headers.get('cf-ipcountry') ?? undefined;
    const utmSource = new URL(req.url).searchParams.get('utm_source') ?? undefined;

    await supabase.from('sirena_page_views').insert({
      creator_id: creatorId,
      ip_country: country,
      referrer: referrer || undefined,
      utm_source: utmSource,
    });

    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ ok: false }, { status: 500 });
  }
}
