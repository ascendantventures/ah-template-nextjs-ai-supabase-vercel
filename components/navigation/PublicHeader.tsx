'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Ticket, Menu, X, LogIn, UserPlus } from 'lucide-react';
import { useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { useRouter } from 'next/navigation';

export default function PublicHeader() {
  const pathname = usePathname();
  const router = useRouter();
  const [menuOpen, setMenuOpen] = useState(false);

  const navLinks = [
    { href: '/events', label: 'Events' },
    { href: '/dashboard', label: 'My Tickets' },
  ];

  async function handleSignOut() {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push('/events');
    router.refresh();
  }

  return (
    <header style={{
      position: 'sticky',
      top: 0,
      zIndex: 50,
      height: 64,
      backgroundColor: 'rgba(9,9,11,0.80)',
      backdropFilter: 'blur(12px) saturate(180%)',
      borderBottom: '1px solid rgba(255,255,255,0.06)',
    }}>
      <div style={{ maxWidth: 1280, margin: '0 auto', padding: '0 24px', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <Link href="/events" style={{ display: 'flex', alignItems: 'center', gap: 10, textDecoration: 'none' }}>
          <div style={{ width: 32, height: 32, borderRadius: 8, backgroundColor: '#8B5CF6', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Ticket size={18} strokeWidth={2} style={{ color: '#fff' }} />
          </div>
          <span style={{ fontSize: 20, fontWeight: 700, color: '#F4F4F5' }}>TicketHub</span>
        </Link>

        <nav style={{ display: 'flex', alignItems: 'center', gap: 32 }} className="hidden md:flex">
          {navLinks.map(link => (
            <Link
              key={link.href}
              href={link.href}
              style={{
                fontSize: 14,
                fontWeight: 500,
                color: pathname.startsWith(link.href) ? '#F4F4F5' : '#A1A1AA',
                textDecoration: 'none',
                transition: 'color 150ms ease',
              }}
            >
              {link.label}
            </Link>
          ))}
        </nav>

        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <Link href="/login" style={{
            padding: '8px 16px',
            borderRadius: 10,
            fontSize: 14,
            fontWeight: 600,
            color: '#A1A1AA',
            textDecoration: 'none',
            transition: 'color 150ms ease',
          }}>
            Sign In
          </Link>
          <Link href="/signup" style={{
            padding: '8px 16px',
            borderRadius: 10,
            fontSize: 14,
            fontWeight: 600,
            color: '#fff',
            textDecoration: 'none',
            backgroundColor: '#8B5CF6',
            boxShadow: '0 4px 12px rgba(139,92,246,0.4)',
            transition: 'all 150ms ease',
          }}>
            Sign Up
          </Link>
          <button
            onClick={() => setMenuOpen(!menuOpen)}
            style={{ background: 'none', border: 'none', color: '#A1A1AA', cursor: 'pointer', display: 'none' }}
            className="md:hidden"
          >
            {menuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>
    </header>
  );
}
