import { createAdminClient } from '@/lib/supabase/admin';
import Link from 'next/link';
import { Users, Calendar, Ticket, TrendingUp, ShieldCheck, ChevronRight } from 'lucide-react';

export default async function AdminDashboard() {
  const supabase = createAdminClient();

  const [usersResult, eventsResult, ordersResult, ticketsResult] = await Promise.all([
    supabase.from('profiles').select('user_id', { count: 'exact', head: true }),
    supabase.from('tix_events').select('event_id', { count: 'exact', head: true }),
    supabase.from('orders').select('total_amount, status'),
    supabase.from('tickets').select('ticket_id', { count: 'exact', head: true }),
  ]);

  const totalRevenue = ((ordersResult.data || []) as any[])
    .filter((o: any) => o.status === 'completed')
    .reduce((sum: number, o: any) => sum + (o.total_amount || 0), 0);

  const stats = [
    { label: 'Total Users', value: usersResult.count || 0, icon: Users, color: '#8B5CF6', href: '/admin/users' },
    { label: 'Total Events', value: eventsResult.count || 0, icon: Calendar, color: '#06B6D4', href: '/admin/events' },
    { label: 'Total Tickets', value: ticketsResult.count || 0, icon: Ticket, color: '#22C55E', href: '/admin/events' },
    { label: 'Platform Revenue', value: `$${(totalRevenue / 100).toFixed(0)}`, icon: TrendingUp, color: '#F59E0B', href: '/admin/events' },
  ];

  const quickActions = [
    { href: '/admin/users', label: 'Manage Users', desc: 'View and manage user accounts and roles', icon: Users },
    { href: '/admin/events', label: 'All Events', desc: 'Monitor all events across the platform', icon: Calendar },
  ];

  return (
    <div style={{ padding: 32, maxWidth: 1100, margin: '0 auto' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 8 }}>
        <div style={{ width: 36, height: 36, borderRadius: 8, backgroundColor: 'rgba(139,92,246,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <ShieldCheck size={18} style={{ color: '#8B5CF6' }} />
        </div>
        <h1 style={{ fontSize: 28, fontWeight: 700, color: '#F4F4F5', margin: 0 }}>Platform Admin</h1>
      </div>
      <p style={{ color: '#A1A1AA', margin: '0 0 32px' }}>TicketHub admin dashboard</p>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16, marginBottom: 32 }}>
        {stats.map(stat => {
          const Icon = stat.icon;
          return (
            <Link key={stat.label} href={stat.href} style={{ textDecoration: 'none', backgroundColor: '#141414', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 12, padding: 20 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10 }}>
                <div style={{ width: 36, height: 36, borderRadius: 8, backgroundColor: `${stat.color}20`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Icon size={18} style={{ color: stat.color }} />
                </div>
                <span style={{ fontSize: 13, color: '#A1A1AA' }}>{stat.label}</span>
              </div>
              <div style={{ fontSize: 28, fontWeight: 700, color: '#F4F4F5' }}>{stat.value}</div>
            </Link>
          );
        })}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
        {quickActions.map(action => {
          const Icon = action.icon;
          return (
            <Link
              key={action.href}
              href={action.href}
              style={{ textDecoration: 'none', backgroundColor: '#141414', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 12, padding: 24, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}
            >
              <div style={{ display: 'flex', gap: 16, alignItems: 'center' }}>
                <div style={{ width: 48, height: 48, borderRadius: 12, backgroundColor: 'rgba(139,92,246,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Icon size={22} style={{ color: '#8B5CF6' }} />
                </div>
                <div>
                  <div style={{ fontSize: 16, fontWeight: 600, color: '#F4F4F5' }}>{action.label}</div>
                  <div style={{ fontSize: 13, color: '#71717A', marginTop: 2 }}>{action.desc}</div>
                </div>
              </div>
              <ChevronRight size={18} style={{ color: '#52525B' }} />
            </Link>
          );
        })}
      </div>
    </div>
  );
}
