'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import {
  LayoutDashboard, Ticket, Receipt, Settings, LogOut, Building2,
  Calendar, Users, QrCode, CalendarPlus, ShieldCheck
} from 'lucide-react';
import { createClient } from '@/lib/supabase/client';

interface SidebarProps {
  role: 'fan' | 'organizer' | 'platform_admin';
  userName?: string;
  userEmail?: string;
}

const fanLinks = [
  { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/events', label: 'Browse Events', icon: Calendar },
  { href: '/dashboard/orders', label: 'My Orders', icon: Receipt },
];

const organizerLinks = [
  { href: '/organizer', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/organizer/venues', label: 'My Venues', icon: Building2 },
  { href: '/organizer/events', label: 'My Events', icon: Calendar },
  { href: '/organizer/scan', label: 'Ticket Scanner', icon: QrCode },
];

const adminLinks = [
  { href: '/admin', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/admin/users', label: 'All Users', icon: Users },
  { href: '/admin/events', label: 'All Events', icon: Calendar },
];

export default function Sidebar({ role, userName, userEmail }: SidebarProps) {
  const pathname = usePathname();
  const router = useRouter();

  const links = role === 'platform_admin' ? adminLinks : role === 'organizer' ? organizerLinks : fanLinks;

  async function handleSignOut() {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push('/events');
    router.refresh();
  }

  const roleBadgeColors: Record<string, { bg: string; color: string }> = {
    fan: { bg: 'rgba(113,113,122,0.15)', color: '#A1A1AA' },
    organizer: { bg: 'rgba(139,92,246,0.15)', color: '#8B5CF6' },
    platform_admin: { bg: 'rgba(6,182,212,0.15)', color: '#06B6D4' },
  };
  const roleBadge = roleBadgeColors[role] ?? roleBadgeColors.fan;

  return (
    <aside style={{
      width: 260,
      flexShrink: 0,
      backgroundColor: '#0F0F0F',
      borderRight: '1px solid rgba(255,255,255,0.06)',
      height: '100vh',
      position: 'sticky',
      top: 0,
      display: 'flex',
      flexDirection: 'column',
      padding: 16,
    }}>
      {/* Logo */}
      <Link href="/events" style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '8px 12px', textDecoration: 'none', height: 64 }}>
        <div style={{ width: 32, height: 32, borderRadius: 8, backgroundColor: '#8B5CF6', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <Ticket size={18} strokeWidth={2} style={{ color: '#fff' }} />
        </div>
        <span style={{ fontSize: 20, fontWeight: 700, color: '#F4F4F5' }}>TicketHub</span>
      </Link>

      {/* Nav links */}
      <nav style={{ flex: 1, overflowY: 'auto', marginTop: 8 }}>
        {links.map(({ href, label, icon: Icon }) => {
          const isActive = pathname === href || (href !== '/events' && pathname.startsWith(href));
          return (
            <Link
              key={href}
              href={href}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 12,
                height: 44,
                padding: '0 12px',
                borderRadius: 8,
                marginBottom: 2,
                fontSize: 14,
                fontWeight: isActive ? 600 : 500,
                color: isActive ? '#8B5CF6' : '#A1A1AA',
                backgroundColor: isActive ? 'rgba(139,92,246,0.12)' : 'transparent',
                textDecoration: 'none',
                borderLeft: isActive ? '3px solid #8B5CF6' : '3px solid transparent',
                transition: 'all 150ms ease',
              }}
            >
              <Icon size={18} strokeWidth={1.5} />
              {label}
            </Link>
          );
        })}
      </nav>

      {/* User section */}
      <div style={{ borderTop: '1px solid rgba(255,255,255,0.06)', paddingTop: 16 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '0 12px', marginBottom: 8 }}>
          <div style={{ width: 40, height: 40, borderRadius: '50%', backgroundColor: '#1E1E1E', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
            <Users size={18} strokeWidth={1.5} style={{ color: '#71717A' }} />
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontSize: 14, fontWeight: 500, color: '#F4F4F5', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{userName || 'User'}</div>
            <div style={{ display: 'inline-block', fontSize: 11, fontWeight: 500, textTransform: 'uppercase', ...roleBadge, padding: '2px 8px', borderRadius: 4, marginTop: 2 }}>
              {role.replace('_', ' ')}
            </div>
          </div>
        </div>
        <button
          onClick={handleSignOut}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 12,
            width: '100%',
            height: 44,
            padding: '0 12px',
            borderRadius: 8,
            fontSize: 14,
            fontWeight: 500,
            color: '#A1A1AA',
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            textAlign: 'left',
          }}
        >
          <LogOut size={18} strokeWidth={1.5} />
          Sign Out
        </button>
      </div>
    </aside>
  );
}
