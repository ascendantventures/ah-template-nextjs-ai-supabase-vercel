'use client';

import { useState } from 'react';
import { Loader2 } from 'lucide-react';

export default function AdminUserRoleClient({ user }: { user: any }) {
  const [role, setRole] = useState(user.role);
  const [loading, setLoading] = useState(false);

  const roleColor: Record<string, string> = {
    fan: '#06B6D4',
    organizer: '#8B5CF6',
    platform_admin: '#F59E0B',
  };

  async function handleRoleChange(newRole: string) {
    if (newRole === role) return;
    setLoading(true);
    const res = await fetch(`/api/admin/users/${user.user_id}/role`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ role: newRole }),
    });
    if (res.ok) setRole(newRole);
    setLoading(false);
  }

  return (
    <div style={{ padding: '14px 20px', borderBottom: '1px solid rgba(255,255,255,0.04)', display: 'grid', gridTemplateColumns: '1fr 140px 140px 120px', gap: 12, alignItems: 'center' }}>
      <div>
        <div style={{ fontSize: 14, fontWeight: 500, color: '#F4F4F5' }}>{user.full_name || 'No name'}</div>
        <div style={{ fontSize: 12, color: '#71717A', marginTop: 2 }}>{user.email}</div>
      </div>
      <div>
        <span style={{ fontSize: 12, fontWeight: 500, color: roleColor[role] || '#A1A1AA', padding: '3px 10px', borderRadius: 20, backgroundColor: `${roleColor[role] || '#A1A1AA'}15`, textTransform: 'capitalize' }}>
          {role?.replace('_', ' ')}
        </span>
      </div>
      <div style={{ fontSize: 13, color: '#71717A' }}>
        {user.created_at ? new Date(user.created_at).toLocaleDateString() : 'Unknown'}
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
        {loading ? (
          <Loader2 size={14} style={{ color: '#8B5CF6', animation: 'spin 1s linear infinite' }} />
        ) : (
          <select
            value={role}
            onChange={e => handleRoleChange(e.target.value)}
            style={{ backgroundColor: '#1E1E1E', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 6, color: '#F4F4F5', fontSize: 12, padding: '4px 8px', cursor: 'pointer' }}
          >
            <option value="fan">Fan</option>
            <option value="organizer">Organizer</option>
            <option value="platform_admin">Admin</option>
          </select>
        )}
      </div>
      <style>{`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}
