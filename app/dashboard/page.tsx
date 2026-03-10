import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import { Ticket, Calendar, CreditCard, ChevronRight } from 'lucide-react';
import { Order } from '@/types';

async function getDashboardData(userId: string) {
  const supabase = await createClient();

  const [ordersResult, ticketsResult] = await Promise.all([
    supabase
      .from('orders')
      .select('*, tix_events(title, event_date, venues(name, city))')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(5),
    supabase
      .from('tickets')
      .select('*, tix_events(title, event_date), orders(total_amount)')
      .eq('user_id', userId)
      .eq('status', 'valid')
      .order('created_at', { ascending: false })
      .limit(5),
  ]);

  return {
    recentOrders: (ordersResult.data || []) as any[],
    upcomingTickets: (ticketsResult.data || []) as any[],
  };
}

export default async function FanDashboard() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/login');

  const { data: profile } = await supabase.from('profiles').select('*').eq('user_id', user.id).single();
  const { recentOrders, upcomingTickets } = await getDashboardData(user.id);

  const stats = [
    { label: 'Upcoming Events', value: upcomingTickets.length, icon: Calendar, color: '#8B5CF6' },
    { label: 'Total Orders', value: recentOrders.length, icon: CreditCard, color: '#06B6D4' },
    { label: 'Active Tickets', value: upcomingTickets.filter((t: any) => t.status === 'valid').length, icon: Ticket, color: '#22C55E' },
  ];

  return (
    <div style={{ padding: 32, maxWidth: 1100, margin: '0 auto' }}>
      <div style={{ marginBottom: 32 }}>
        <h1 style={{ fontSize: 28, fontWeight: 700, color: '#F4F4F5', margin: '0 0 4px' }}>
          Welcome back, {profile?.full_name?.split(' ')[0] || 'there'}
        </h1>
        <p style={{ color: '#A1A1AA', margin: 0 }}>Here&apos;s what&apos;s happening with your tickets</p>
      </div>

      {/* Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16, marginBottom: 32 }}>
        {stats.map(stat => {
          const Icon = stat.icon;
          return (
            <div key={stat.label} style={{ backgroundColor: '#141414', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 12, padding: 24 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 12 }}>
                <div style={{ width: 40, height: 40, borderRadius: 10, backgroundColor: `${stat.color}20`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Icon size={20} style={{ color: stat.color }} />
                </div>
                <span style={{ fontSize: 14, color: '#A1A1AA' }}>{stat.label}</span>
              </div>
              <div style={{ fontSize: 32, fontWeight: 700, color: '#F4F4F5' }}>{stat.value}</div>
            </div>
          );
        })}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24 }}>
        {/* Recent Orders */}
        <div style={{ backgroundColor: '#141414', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 12, padding: 24 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
            <h2 style={{ fontSize: 18, fontWeight: 600, color: '#F4F4F5', margin: 0 }}>Recent Orders</h2>
            <Link href="/dashboard/orders" style={{ fontSize: 14, color: '#8B5CF6', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 4 }}>
              View all <ChevronRight size={14} />
            </Link>
          </div>
          {recentOrders.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '32px 0', color: '#71717A' }}>
              <CreditCard size={32} style={{ marginBottom: 8, opacity: 0.5 }} />
              <p style={{ margin: 0 }}>No orders yet</p>
              <Link href="/events" style={{ color: '#8B5CF6', textDecoration: 'none', fontSize: 14 }}>Browse events</Link>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {recentOrders.map((order: any) => (
                <Link key={order.order_id} href={`/dashboard/orders/${order.order_id}`} style={{ textDecoration: 'none', display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 0', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
                  <div>
                    <div style={{ fontSize: 14, fontWeight: 500, color: '#F4F4F5' }}>{order.tix_events?.title}</div>
                    <div style={{ fontSize: 12, color: '#71717A', marginTop: 2 }}>
                      {order.tix_events?.event_date ? new Date(order.tix_events.event_date).toLocaleDateString() : ''}
                    </div>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontSize: 14, fontWeight: 600, color: '#F4F4F5' }}>${(order.total_amount / 100).toFixed(2)}</div>
                    <div style={{ fontSize: 12, color: order.status === 'completed' ? '#22C55E' : order.status === 'pending' ? '#F59E0B' : '#EF4444', marginTop: 2 }}>
                      {order.status}
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>

        {/* Upcoming Tickets */}
        <div style={{ backgroundColor: '#141414', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 12, padding: 24 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
            <h2 style={{ fontSize: 18, fontWeight: 600, color: '#F4F4F5', margin: 0 }}>My Tickets</h2>
          </div>
          {upcomingTickets.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '32px 0', color: '#71717A' }}>
              <Ticket size={32} style={{ marginBottom: 8, opacity: 0.5 }} />
              <p style={{ margin: 0 }}>No tickets yet</p>
              <Link href="/events" style={{ color: '#8B5CF6', textDecoration: 'none', fontSize: 14 }}>Find an event</Link>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {upcomingTickets.map((ticket: any) => (
                <Link key={ticket.ticket_id} href={`/tickets/${ticket.ticket_id}`} style={{ textDecoration: 'none', display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 0', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
                  <div>
                    <div style={{ fontSize: 14, fontWeight: 500, color: '#F4F4F5' }}>{ticket.tix_events?.title}</div>
                    <div style={{ fontSize: 12, color: '#71717A', marginTop: 2 }}>
                      {ticket.tix_events?.event_date ? new Date(ticket.tix_events.event_date).toLocaleDateString() : ''}
                    </div>
                  </div>
                  <div style={{ padding: '4px 10px', borderRadius: 20, backgroundColor: 'rgba(34,197,94,0.15)', color: '#22C55E', fontSize: 12, fontWeight: 500 }}>
                    Valid
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Quick link to browse events */}
      <div style={{ marginTop: 24, textAlign: 'center' }}>
        <Link href="/events" style={{ display: 'inline-flex', alignItems: 'center', gap: 8, backgroundColor: '#8B5CF6', color: '#fff', textDecoration: 'none', padding: '12px 24px', borderRadius: 10, fontSize: 14, fontWeight: 600 }}>
          <Ticket size={16} />
          Browse Events
        </Link>
      </div>
    </div>
  );
}
