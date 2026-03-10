import { createAdminClient } from '@/lib/supabase/admin';
import { Users, ShieldCheck, Building2, User } from 'lucide-react';
import AdminUserRoleClient from './AdminUserRoleClient';

async function getAllUsers() {
  const supabase = createAdminClient();
  const { data } = await supabase
    .from('profiles')
    .select('*')
    .order('created_at', { ascending: false });
  return (data || []) as any[];
}

export default async function AdminUsersPage() {
  const users = await getAllUsers();

  const roleCounts = {
    fan: users.filter(u => u.role === 'fan').length,
    organizer: users.filter(u => u.role === 'organizer').length,
    platform_admin: users.filter(u => u.role === 'platform_admin').length,
  };

  const roleIcon: Record<string, React.ReactNode> = {
    fan: <User size={14} />,
    organizer: <Building2 size={14} />,
    platform_admin: <ShieldCheck size={14} />,
  };

  const roleColor: Record<string, string> = {
    fan: '#06B6D4',
    organizer: '#8B5CF6',
    platform_admin: '#F59E0B',
  };

  return (
    <div style={{ padding: 32, maxWidth: 1100, margin: '0 auto' }}>
      <div style={{ marginBottom: 32 }}>
        <h1 style={{ fontSize: 28, fontWeight: 700, color: '#F4F4F5', margin: '0 0 4px' }}>Users</h1>
        <p style={{ color: '#A1A1AA', margin: 0 }}>{users.length} total users</p>
      </div>

      {/* Role stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16, marginBottom: 32 }}>
        {Object.entries(roleCounts).map(([role, count]) => (
          <div key={role} style={{ backgroundColor: '#141414', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 12, padding: 20 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
              <div style={{ color: roleColor[role] }}>{roleIcon[role]}</div>
              <span style={{ fontSize: 13, color: '#A1A1AA', textTransform: 'capitalize' }}>{role.replace('_', ' ')}</span>
            </div>
            <div style={{ fontSize: 28, fontWeight: 700, color: '#F4F4F5' }}>{count}</div>
          </div>
        ))}
      </div>

      {/* Users table */}
      <div style={{ backgroundColor: '#141414', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 12, overflow: 'hidden' }}>
        <div style={{ padding: '16px 20px', borderBottom: '1px solid rgba(255,255,255,0.06)', display: 'grid', gridTemplateColumns: '1fr 140px 140px 120px', gap: 12 }}>
          <div style={{ fontSize: 12, color: '#52525B', textTransform: 'uppercase', letterSpacing: 1 }}>User</div>
          <div style={{ fontSize: 12, color: '#52525B', textTransform: 'uppercase', letterSpacing: 1 }}>Role</div>
          <div style={{ fontSize: 12, color: '#52525B', textTransform: 'uppercase', letterSpacing: 1 }}>Joined</div>
          <div style={{ fontSize: 12, color: '#52525B', textTransform: 'uppercase', letterSpacing: 1 }}>Actions</div>
        </div>
        {users.map(user => (
          <AdminUserRoleClient key={user.user_id} user={user} />
        ))}
      </div>
    </div>
  );
}
