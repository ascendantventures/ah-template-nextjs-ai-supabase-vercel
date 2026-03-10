import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';

type Params = { params: Promise<{ ticket_id: string }> };

export async function POST(req: Request, { params }: Params) {
  const { ticket_id } = await params;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { data: profile } = await supabase.from('profiles').select('role').eq('user_id', user.id).single();
  if (!profile || !['organizer', 'platform_admin'].includes(profile.role)) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  // Accept either ticket_id or qr_code
  const body = await req.json().catch(() => ({}));
  const qrCode = body.qr_code;

  const admin = createAdminClient();
  const query = qrCode
    ? admin.from('tickets').select('*').eq('qr_code', qrCode).single()
    : admin.from('tickets').select('*').eq('ticket_id', ticket_id).single();

  const { data: ticket } = await query;
  if (!ticket) return NextResponse.json({ error: 'Ticket not found' }, { status: 404 });

  if (ticket.status === 'used') {
    return NextResponse.json({ valid: false, reason: 'Already scanned', ticket });
  }
  if (ticket.status !== 'valid') {
    return NextResponse.json({ valid: false, reason: 'Invalid ticket', ticket });
  }

  await admin.from('tickets').update({ status: 'used' }).eq('ticket_id', ticket.ticket_id);
  return NextResponse.json({ valid: true, ticket: { ...ticket, status: 'used' } });
}
