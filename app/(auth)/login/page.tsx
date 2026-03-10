"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { createClient } from "@/lib/supabase/client";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { Ticket, Mail, Lock, Loader2, Eye, EyeOff } from "lucide-react";

export default function LoginPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const supabase = createClient();
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });

    if (error) {
      setError(error.message);
      setLoading(false);
    } else {
      // Get profile to redirect to right dashboard
      const { data: profile } = await supabase.from('profiles').select('role').eq('user_id', data.user.id).single();
      const role = profile?.role || 'fan';
      const redirect = searchParams.get('redirect') ||
        (role === 'platform_admin' ? '/admin' : role === 'organizer' ? '/organizer' : '/dashboard');
      router.push(redirect);
      router.refresh();
    }
  }

  const inputStyle = {
    width: '100%',
    height: 44,
    backgroundColor: '#1E1E1E',
    border: '1px solid rgba(255,255,255,0.10)',
    borderRadius: 10,
    padding: '0 14px',
    fontSize: 16,
    color: '#F4F4F5',
    outline: 'none',
    boxSizing: 'border-box' as const,
  };

  return (
    <div style={{ display: 'flex', minHeight: '100vh', backgroundColor: '#09090B' }}>
      {/* Left panel */}
      <div style={{ flex: 1, display: 'none', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', padding: 48, background: 'linear-gradient(135deg, #141414 0%, #09090B 100%)' }} className="md:flex">
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 24 }}>
          <div style={{ width: 40, height: 40, borderRadius: 10, backgroundColor: '#8B5CF6', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Ticket size={22} strokeWidth={2} style={{ color: '#fff' }} />
          </div>
          <span style={{ fontSize: 32, fontWeight: 700, color: '#F4F4F5' }}>TicketHub</span>
        </div>
        <p style={{ fontSize: 20, color: '#A1A1AA', textAlign: 'center', maxWidth: 300, lineHeight: 1.5 }}>
          Your Seat to Unforgettable Moments
        </p>
      </div>

      {/* Right panel */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', padding: 48 }}>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
          style={{ width: '100%', maxWidth: 420, backgroundColor: '#141414', border: '1px solid rgba(255,255,255,0.10)', borderRadius: 16, padding: 40 }}
        >
          <h2 style={{ fontSize: 28, fontWeight: 700, color: '#F4F4F5', margin: '0 0 8px' }}>Welcome back</h2>
          <p style={{ fontSize: 16, color: '#A1A1AA', margin: '0 0 32px' }}>Sign in to your account</p>

          <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <div>
              <label style={{ display: 'block', fontSize: 14, fontWeight: 500, color: '#A1A1AA', marginBottom: 6 }}>Email address</label>
              <div style={{ position: 'relative' }}>
                <Mail size={16} style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: '#71717A' }} />
                <input type="email" value={email} onChange={e => setEmail(e.target.value)} required
                  style={{ ...inputStyle, paddingLeft: 40 }} placeholder="you@example.com" />
              </div>
            </div>

            <div>
              <label style={{ display: 'block', fontSize: 14, fontWeight: 500, color: '#A1A1AA', marginBottom: 6 }}>Password</label>
              <div style={{ position: 'relative' }}>
                <Lock size={16} style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: '#71717A' }} />
                <input type={showPassword ? 'text' : 'password'} value={password} onChange={e => setPassword(e.target.value)} required
                  style={{ ...inputStyle, paddingLeft: 40, paddingRight: 44 }} placeholder="••••••••" />
                <button type="button" onClick={() => setShowPassword(s => !s)} style={{ position: 'absolute', right: 14, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: '#71717A' }}>
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            {error && <p style={{ fontSize: 12, fontWeight: 500, color: '#EF4444', margin: 0 }}>{error}</p>}

            <motion.button
              whileTap={{ scale: 0.97 }}
              type="submit"
              disabled={loading}
              style={{ width: '100%', backgroundColor: '#8B5CF6', color: '#fff', border: 'none', borderRadius: 10, padding: '12px 24px', fontSize: 14, fontWeight: 600, cursor: loading ? 'not-allowed' : 'pointer', boxShadow: '0 4px 12px rgba(139,92,246,0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, opacity: loading ? 0.7 : 1 }}
            >
              {loading && <Loader2 size={16} style={{ animation: 'spin 1s linear infinite' }} />}
              {loading ? 'Signing in...' : 'Sign In'}
            </motion.button>
          </form>

          <p style={{ textAlign: 'center', fontSize: 14, color: '#A1A1AA', marginTop: 24 }}>
            Don&apos;t have an account?{' '}
            <Link href="/signup" style={{ color: '#8B5CF6', fontWeight: 600, textDecoration: 'none' }}>Sign up</Link>
          </p>
        </motion.div>
      </div>

      <style>{`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}
