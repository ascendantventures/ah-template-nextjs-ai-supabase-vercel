import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import { CreditCard, ChevronRight, ExternalLink } from 'lucide-react';

export default async function OrdersPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/login');

  const { data: orders } = await supabase
    .from('orders')
    .select('*, tix_events(title, event_date, venues(name, city, state))')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false });

  const statusColor: Record<string, string> = {
    completed: '#22C55E',
    pending: '#F59E0B',
    cancelled: '#EF4444',
    refunded: '#A1A1AA',
  };

  return (
    <div style={{ padding: 32, maxWidth: 900, margin: '0 auto' }}>
      <div style={{ marginBottom: 32 }}>
        <Link href="/dashboard" style={{ color: '#8B5CF6', textDecoration: 'none', fontSize: 14, display: 'inline-flex', alignItems: 'center', gap: 4, marginBottom: 16 }}>
          ← Back to Dashboard
        </Link>
        <h1 style={{ fontSize: 28, fontWeight: 700, color: '#F4F4F5', margin: '0 0 4px' }}>My Orders</h1>
        <p style={{ color: '#A1A1AA', margin: 0 }}>Your complete purchase history</p>
      </div>

      {(!orders || orders.length === 0) ? (
        <div style={{ textAlign: 'center', padding: '80px 0', backgroundColor: '#141414', borderRadius: 16, border: '1px solid rgba(255,255,255,0.08)' }}>
          <CreditCard size={48} style={{ color: '#3F3F46', marginBottom: 16 }} />
          <h3 style={{ color: '#F4F4F5', margin: '0 0 8px' }}>No orders yet</h3>
          <p style={{ color: '#71717A', margin: '0 0 24px' }}>Start browsing events to make your first purchase</p>
          <Link href="/events" style={{ backgroundColor: '#8B5CF6', color: '#fff', textDecoration: 'none', padding: '10px 20px', borderRadius: 8, fontSize: 14, fontWeight: 600 }}>
            Browse Events
          </Link>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {(orders as any[]).map(order => (
            <Link
              key={order.order_id}
              href={`/dashboard/orders/${order.order_id}`}
              style={{ textDecoration: 'none', backgroundColor: '#141414', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 12, padding: 20, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}
            >
              <div style={{ display: 'flex', gap: 16, alignItems: 'center' }}>
                <div style={{ width: 48, height: 48, borderRadius: 10, backgroundColor: '#1E1E1E', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <CreditCard size={20} style={{ color: '#8B5CF6' }} />
                </div>
                <div>
                  <div style={{ fontSize: 16, fontWeight: 600, color: '#F4F4F5' }}>{order.tix_events?.title}</div>
                  <div style={{ fontSize: 13, color: '#71717A', marginTop: 4 }}>
                    {order.tix_events?.venues?.name} · {order.tix_events?.event_date ? new Date(order.tix_events.event_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : 'TBD'}
                  </div>
                  <div style={{ fontSize: 12, color: '#52525B', marginTop: 2 }}>Order #{order.order_id.slice(0, 8).toUpperCase()}</div>
                </div>
              </div>
              <div style={{ textAlign: 'right', display: 'flex', alignItems: 'center', gap: 16 }}>
                <div>
                  <div style={{ fontSize: 18, fontWeight: 700, color: '#F4F4F5' }}>${(order.total_amount / 100).toFixed(2)}</div>
                  <div style={{ fontSize: 13, fontWeight: 500, color: statusColor[order.status] || '#A1A1AA', marginTop: 2, textTransform: 'capitalize' }}>{order.status}</div>
                </div>
                <ChevronRight size={18} style={{ color: '#52525B' }} />
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
