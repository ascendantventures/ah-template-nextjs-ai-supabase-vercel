import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { serverEnv } from '@/lib/env.server';

export async function POST(req: Request) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  const body = await req.json();
  const { event_id, seat_ids, guest_email, guest_name } = body;

  if (!event_id || !Array.isArray(seat_ids) || seat_ids.length === 0) {
    return NextResponse.json({ error: 'event_id and seat_ids required' }, { status: 400 });
  }

  if (!user && (!guest_email || !guest_name)) {
    return NextResponse.json({ error: 'guest_email and guest_name required for guest checkout' }, { status: 400 });
  }

  // Stripe not configured gracefully
  if (!serverEnv.STRIPE_SECRET_KEY) {
    return NextResponse.json({ error: 'Stripe not configured' }, { status: 503 });
  }

  const admin = createAdminClient();

  // Get inventory + tiers
  const { data: inventory } = await admin
    .from('seat_inventory')
    .select('*, ticket_tiers(price, fee_amount, name)')
    .eq('event_id', event_id)
    .in('seat_id', seat_ids);

  if (!inventory?.length) return NextResponse.json({ error: 'No inventory found' }, { status: 400 });

  // Verify seats are locked by user
  const validSeats = inventory.filter(inv => {
    if (user) return inv.status === 'locked' && inv.locked_by === user.id;
    return inv.status === 'locked';
  });

  if (validSeats.length === 0) {
    return NextResponse.json({ error: 'Seats must be locked before checkout. Please hold your seats first.' }, { status: 400 });
  }

  const subtotal = validSeats.reduce((sum, inv) => sum + Number(inv.ticket_tiers?.price || 0), 0);
  const feeTotal = validSeats.reduce((sum, inv) => sum + Number(inv.ticket_tiers?.fee_amount || 0), 0);
  const total = subtotal + feeTotal;

  // Create pending order
  const { data: order, error: orderError } = await admin.from('orders').insert({
    user_id: user?.id || null,
    event_id,
    status: 'pending',
    subtotal,
    fee_total: feeTotal,
    total,
    guest_email: !user ? guest_email : null,
    guest_name: !user ? guest_name : null,
  }).select().single();

  if (orderError) return NextResponse.json({ error: orderError.message }, { status: 500 });

  // Create Stripe session
  try {
    const Stripe = (await import('stripe')).default;
    const stripe = new Stripe(serverEnv.STRIPE_SECRET_KEY!, { apiVersion: '2024-12-18.acacia' });

    const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';

    const lineItems = validSeats.map(inv => ({
      price_data: {
        currency: 'usd',
        product_data: { name: `${inv.ticket_tiers?.name || 'Ticket'} - Seat` },
        unit_amount: Math.round((Number(inv.ticket_tiers?.price || 0) + Number(inv.ticket_tiers?.fee_amount || 0)) * 100),
      },
      quantity: 1,
    }));

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: lineItems,
      mode: 'payment',
      customer_email: user?.email || guest_email,
      success_url: `${appUrl}/dashboard/orders/${order.order_id}?success=1`,
      cancel_url: `${appUrl}/events/${event_id}/seats?cancelled=1`,
      metadata: { order_id: order.order_id, event_id, seat_ids: seat_ids.join(',') },
    });

    await admin.from('orders').update({ stripe_checkout_session_id: session.id }).eq('order_id', order.order_id);

    return NextResponse.json({ checkout_url: session.url, session_id: session.id });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Stripe error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
