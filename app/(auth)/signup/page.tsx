"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { createClient } from "@/lib/supabase/client";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { Ticket, Loader2 } from "lucide-react";

export default function SignupPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const roleParam = searchParams.get('role');
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [role, setRole] = useState<'fan' | 'organizer'>(roleParam === 'organizer' ? 'organizer' : 'fan');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const supabase = createClient();
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { full_name: fullName, role } },
    });

    if (error) {
      setError(error.message);
      setLoading(false);
    } else if (data.user) {
      // Call onboard API
      await fetch('/api/auth/onboard', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ full_name: fullName, role }),
      });
      router.push(role === 'organizer' ? '/organizer' : '/dashboard');
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
      <div style={{ flex: 1, display: 'none', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', padding: 48, background: 'linear-gradient(135deg, #141414 0%, #09090B 100%)' }} className="md:flex">
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 24 }}>
          <div style={{ width: 40, height: 40, borderRadius: 10, backgroundColor: '#8B5CF6', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Ticket size={22} strokeWidth={2} style={{ color: '#fff' }} />
          </div>
          <span style={{ fontSize: 32, fontWeight: 700, color: '#F4F4F5' }}>TicketHub</span>
        </div>
        <p style={{ fontSize: 20, color: '#A1A1AA', textAlign: 'center', maxWidth: 300, lineHeight: 1.5 }}>
          Join thousands of fans and organizers
        </p>
      </div>

      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', padding: 48 }}>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
          style={{ width: '100%', maxWidth: 420, backgroundColor: '#141414', border: '1px solid rgba(255,255,255,0.10)', borderRadius: 16, padding: 40 }}
        >
          <h2 style={{ fontSize: 28, fontWeight: 700, color: '#F4F4F5', margin: '0 0 8px' }}>Create your account</h2>
          <p style={{ fontSize: 16, color: '#A1A1AA', margin: '0 0 32px' }}>Join thousands of fans</p>

          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <div>
              <label style={{ display: 'block', fontSize: 14, fontWeight: 500, color: '#A1A1AA', marginBottom: 6 }}>Full name</label>
              <input name="full_name" type="text" value={fullName} onChange={e => setFullName(e.target.value)}
                style={inputStyle} placeholder="Your full name" required />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: 14, fontWeight: 500, color: '#A1A1AA', marginBottom: 6 }}>Email address</label>
              <input type="email" value={email} onChange={e => setEmail(e.target.value)}
                style={inputStyle} placeholder="you@example.com" required />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: 14, fontWeight: 500, color: '#A1A1AA', marginBottom: 6 }}>Password</label>
              <input type="password" value={password} onChange={e => setPassword(e.target.value)}
                style={inputStyle} placeholder="••••••••" required minLength={6} />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: 14, fontWeight: 500, color: '#A1A1AA', marginBottom: 10 }}>I want to...</label>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
                {[
                  { value: 'fan', label: 'Buy tickets' },
                  { value: 'organizer', label: 'Sell tickets' },
                ].map(opt => (
                  <button
                    key={opt.value}
                    type="button"
                    onClick={() => setRole(opt.value as 'fan' | 'organizer')}
                    style={{
                      padding: '10px',
                      borderRadius: 10,
                      border: role === opt.value ? '1px solid rgba(139,92,246,0.50)' : '1px solid rgba(255,255,255,0.10)',
                      backgroundColor: role === opt.value ? 'rgba(139,92,246,0.15)' : '#1E1E1E',
                      color: role === opt.value ? '#8B5CF6' : '#A1A1AA',
                      fontSize: 14,
                      fontWeight: 500,
                      cursor: 'pointer',
                    }}
                  >
                    {opt.label}
                  </button>
                ))}
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
              {loading ? 'Creating account...' : 'Create Account'}
            </motion.button>
          </form>

          <p style={{ textAlign: 'center', fontSize: 12, color: '#71717A', margin: '16px 0 0' }}>
            By signing up, you agree to our Terms of Service and Privacy Policy
          </p>

          <p style={{ textAlign: 'center', fontSize: 14, color: '#A1A1AA', marginTop: 16 }}>
            Already have an account?{' '}
            <Link href="/login" style={{ color: '#8B5CF6', fontWeight: 600, textDecoration: 'none' }}>Sign in</Link>
          </p>
        </motion.div>
      </div>

      <style>{`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}
