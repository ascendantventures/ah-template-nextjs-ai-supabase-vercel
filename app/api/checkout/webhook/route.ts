import { NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { serverEnv } from '@/lib/env.server';

export async function POST(req: Request) {
  if (!serverEnv.STRIPE_SECRET_KEY) {
    return NextResponse.json({ error: 'Stripe not configured' }, { status: 503 });
  }

  const body = await req.text();
  const signature = req.headers.get('stripe-signature');

  if (!signature || !serverEnv.STRIPE_WEBHOOK_SECRET) {
    return NextResponse.json({ error: 'Missing signature' }, { status: 400 });
  }

  try {
    const Stripe = (await import('stripe')).default;
    const stripe = new Stripe(serverEnv.STRIPE_SECRET_KEY!, { apiVersion: '2024-12-18.acacia' });
    const event = stripe.webhooks.constructEvent(body, signature, serverEnv.STRIPE_WEBHOOK_SECRET!);

    if (event.type === 'checkout.session.completed') {
      const session = event.data.object;
      const orderId = session.metadata?.order_id;
      const seatIds = session.metadata?.seat_ids?.split(',') || [];
      const eventId = session.metadata?.event_id;

      if (!orderId) return NextResponse.json({ ok: true });

      const admin = createAdminClient();

      // Confirm order
      await admin.from('orders').update({ status: 'confirmed', stripe_checkout_session_id: session.id }).eq('order_id', orderId);

      // Get order
      const { data: order } = await admin.from('orders').select('user_id').eq('order_id', orderId).single();

      // Update seat_inventory to sold
      await admin.from('seat_inventory').update({ status: 'sold', locked_by: null, locked_until: null })
        .eq('event_id', eventId).in('seat_id', seatIds);

      // Create ticket rows
      if (seatIds.length > 0 && eventId) {
        const { data: inventory } = await admin.from('seat_inventory').select('seat_id, tier_id').eq('event_id', eventId).in('seat_id', seatIds);
        const { data: tiers } = await admin.from('ticket_tiers').select('tier_id, price').eq('event_id', eventId);
        const tierPriceMap = Object.fromEntries((tiers || []).map(t => [t.tier_id, t.price]));

        const ticketRows = (inventory || []).map(inv => ({
          order_id: orderId,
          event_id: eventId,
          seat_id: inv.seat_id,
          tier_id: inv.tier_id,
          user_id: order?.user_id || null,
          price_paid: inv.tier_id ? Number(tierPriceMap[inv.tier_id] || 0) : 0,
        }));

        if (ticketRows.length > 0) {
          await admin.from('tickets').insert(ticketRows);
          // Update sold_count on tiers
          for (const tid of [...new Set(ticketRows.map(t => t.tier_id).filter(Boolean))]) {
            const count = ticketRows.filter(t => t.tier_id === tid).length;
            await admin.from('ticket_tiers').update({ sold_count: admin.from('ticket_tiers').select('sold_count') as unknown as number }).eq('tier_id', tid);
          }
        }
      }
    }

    return NextResponse.json({ received: true });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Webhook error';
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
