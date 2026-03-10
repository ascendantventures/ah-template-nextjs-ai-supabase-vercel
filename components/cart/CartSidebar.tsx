'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Clock, X, CreditCard, ShoppingCart } from 'lucide-react';
import { useCartStore } from '@/lib/stores/cart';
import { useToast } from '@/components/ui/Toast';
import { createClient } from '@/lib/supabase/client';
import { TicketTier } from '@/types';

interface CartSidebarProps {
  eventId: string;
  tiers: TicketTier[];
}

function formatCountdown(ms: number) {
  if (ms <= 0) return '0:00';
  const min = Math.floor(ms / 60000);
  const sec = Math.floor((ms % 60000) / 1000);
  return `${min}:${sec.toString().padStart(2, '0')}`;
}

export default function CartSidebar({ eventId, tiers }: CartSidebarProps) {
  const { seats, lockedUntil, clearCart, removeSeat, setLockExpiry } = useCartStore();
  const [timeLeft, setTimeLeft] = useState(0);
  const [guestEmail, setGuestEmail] = useState('');
  const [guestName, setGuestName] = useState('');
  const [isAuthed, setIsAuthed] = useState(false);
  const [checkoutLoading, setCheckoutLoading] = useState(false);
  const [lockLoading, setLockLoading] = useState(false);
  const { toast } = useToast();
  const supabase = createClient();

  // Check auth
  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      setIsAuthed(!!data.user);
    });
  }, []);

  // Countdown timer
  useEffect(() => {
    if (!lockedUntil) return;
    const interval = setInterval(() => {
      const remaining = lockedUntil.getTime() - Date.now();
      if (remaining <= 0) {
        clearCart();
        // Release locks
        fetch(`/api/events/${eventId}/seats/lock`, { method: 'DELETE' });
        clearInterval(interval);
      } else {
        setTimeLeft(remaining);
      }
    }, 500);
    return () => clearInterval(interval);
  }, [lockedUntil, eventId, clearCart]);

  const subtotal = seats.reduce((sum, s) => sum + s.price, 0);
  const feeTotal = seats.reduce((sum, s) => sum + s.fee, 0);
  const total = subtotal + feeTotal;
  const isExpiringSoon = timeLeft > 0 && timeLeft < 120000;

  async function lockSeats() {
    if (seats.length === 0) return;
    setLockLoading(true);
    try {
      const res = await fetch(`/api/events/${eventId}/seats/lock`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ seat_ids: seats.map(s => s.seatId) }),
      });
      const data = await res.json();
      if (data.expires_at) {
        setLockExpiry(data.expires_at);
        setTimeLeft(new Date(data.expires_at).getTime() - Date.now());
        toast({ type: 'success', title: 'Seats Locked', message: `${data.locked?.length || 0} seat(s) locked for 10 minutes` });
      }
      if (data.failed?.length > 0) {
        toast({ type: 'warning', title: 'Some Seats Unavailable', message: `${data.failed.length} seat(s) could not be locked` });
      }
    } catch {
      toast({ type: 'error', title: 'Lock Failed', message: 'Could not lock seats. Please try again.' });
    } finally {
      setLockLoading(false);
    }
  }

  async function proceedToCheckout() {
    if (!isAuthed && (!guestEmail || !guestName)) {
      toast({ type: 'error', title: 'Guest Info Required', message: 'Please enter your email and name to continue.' });
      return;
    }
    setCheckoutLoading(true);
    try {
      // First lock seats if not already locked
      if (!lockedUntil) {
        await lockSeats();
      }

      const res = await fetch('/api/checkout/session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          event_id: eventId,
          seat_ids: seats.map(s => s.seatId),
          guest_email: !isAuthed ? guestEmail : undefined,
          guest_name: !isAuthed ? guestName : undefined,
        }),
      });
      const data = await res.json();
      if (data.checkout_url) {
        window.location.href = data.checkout_url;
      } else {
        toast({ type: 'error', title: 'Checkout Failed', message: data.error || 'Could not create checkout session.' });
      }
    } catch {
      toast({ type: 'error', title: 'Error', message: 'Checkout failed. Please try again.' });
    } finally {
      setCheckoutLoading(false);
    }
  }

  return (
    <div
      data-testid="cart-sidebar"
      style={{
        width: 380,
        flexShrink: 0,
        backgroundColor: '#141414',
        borderLeft: '1px solid rgba(255,255,255,0.08)',
        height: '100vh',
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
      }}
    >
      {/* Header */}
      <div style={{ padding: '20px 24px', borderBottom: '1px solid rgba(255,255,255,0.08)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <ShoppingCart size={18} strokeWidth={1.5} style={{ color: '#8B5CF6' }} />
          <span style={{ fontSize: 18, fontWeight: 600, color: '#F4F4F5' }}>Your Seats</span>
        </div>
        {seats.length > 0 && (
          <span style={{ fontSize: 12, fontWeight: 600, backgroundColor: '#8B5CF6', color: '#fff', borderRadius: 9999, padding: '2px 8px' }}>
            {seats.length}
          </span>
        )}
      </div>

      {/* Timer */}
      <AnimatePresence>
        {lockedUntil && timeLeft > 0 && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            style={{
              backgroundColor: isExpiringSoon ? 'rgba(239,68,68,0.10)' : 'rgba(245,158,11,0.10)',
              borderBottom: '1px solid rgba(255,255,255,0.08)',
              padding: '16px 24px',
              display: 'flex',
              alignItems: 'center',
              gap: 12,
            }}
          >
            <Clock size={18} strokeWidth={1.5} style={{ color: isExpiringSoon ? '#EF4444' : '#F59E0B', flexShrink: 0 }} />
            <div>
              <div style={{ fontSize: 14, color: '#A1A1AA' }}>Seats held for</div>
              <div
                data-testid="lock-countdown"
                className="tabular-nums"
                style={{ fontSize: 24, fontWeight: 700, color: isExpiringSoon ? '#EF4444' : '#F59E0B', lineHeight: 1 }}
              >
                {formatCountdown(timeLeft)}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Seat list */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '16px 24px' }}>
        {seats.length === 0 ? (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', textAlign: 'center', gap: 12 }}>
            <ShoppingCart size={48} strokeWidth={1} style={{ color: '#71717A' }} />
            <p style={{ fontSize: 16, fontWeight: 600, color: '#A1A1AA', margin: 0 }}>No seats selected</p>
            <p style={{ fontSize: 14, color: '#71717A', margin: 0 }}>Click on available seats to add them to your cart</p>
          </div>
        ) : (
          seats.map(seat => (
            <div key={seat.seatId} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 0', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
              <div>
                <div style={{ fontSize: 14, fontWeight: 500, color: '#F4F4F5' }}>{seat.sectionName}</div>
                <div style={{ fontSize: 12, color: '#A1A1AA' }}>Row {seat.rowLabel}, Seat {seat.seatNumber}</div>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <span style={{ fontSize: 14, fontWeight: 600, color: '#F4F4F5' }}>${seat.price.toFixed(2)}</span>
                <button
                  onClick={() => removeSeat(seat.seatId)}
                  style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#71717A', padding: 0 }}
                >
                  <X size={16} strokeWidth={2} />
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Footer */}
      {seats.length > 0 && (
        <div style={{ borderTop: '1px solid rgba(255,255,255,0.08)', padding: '20px 24px', backgroundColor: '#0F0F0F' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
            <span style={{ fontSize: 14, color: '#A1A1AA' }}>Subtotal</span>
            <span style={{ fontSize: 14, color: '#A1A1AA' }}>${subtotal.toFixed(2)}</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
            <span style={{ fontSize: 14, color: '#A1A1AA' }}>Service Fees</span>
            <span style={{ fontSize: 14, color: '#A1A1AA' }}>${feeTotal.toFixed(2)}</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', borderTop: '1px solid rgba(255,255,255,0.08)', paddingTop: 8, marginBottom: 16 }}>
            <span style={{ fontSize: 18, fontWeight: 600, color: '#F4F4F5' }}>Total</span>
            <span style={{ fontSize: 18, fontWeight: 600, color: '#F4F4F5' }}>${total.toFixed(2)}</span>
          </div>

          {/* Guest fields */}
          {!isAuthed && (
            <div style={{ marginBottom: 12 }}>
              <input
                type="email"
                placeholder="Email address"
                value={guestEmail}
                onChange={e => setGuestEmail(e.target.value)}
                data-testid="guest-email"
                style={{
                  width: '100%',
                  height: 44,
                  backgroundColor: '#1E1E1E',
                  border: '1px solid rgba(255,255,255,0.10)',
                  borderRadius: 10,
                  padding: '0 14px',
                  fontSize: 14,
                  color: '#F4F4F5',
                  outline: 'none',
                  marginBottom: 8,
                  boxSizing: 'border-box',
                }}
              />
              <input
                type="text"
                placeholder="Full name"
                value={guestName}
                onChange={e => setGuestName(e.target.value)}
                data-testid="guest-name"
                style={{
                  width: '100%',
                  height: 44,
                  backgroundColor: '#1E1E1E',
                  border: '1px solid rgba(255,255,255,0.10)',
                  borderRadius: 10,
                  padding: '0 14px',
                  fontSize: 14,
                  color: '#F4F4F5',
                  outline: 'none',
                  boxSizing: 'border-box',
                }}
              />
            </div>
          )}

          {!lockedUntil && (
            <motion.button
              whileTap={{ scale: 0.97 }}
              onClick={lockSeats}
              disabled={lockLoading}
              style={{
                width: '100%',
                border: '1px solid rgba(255,255,255,0.15)',
                borderRadius: 10,
                padding: '10px 24px',
                fontSize: 14,
                fontWeight: 600,
                color: '#F4F4F5',
                cursor: 'pointer',
                backgroundColor: 'transparent',
                marginBottom: 8,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 8,
              }}
            >
              {lockLoading ? 'Locking...' : 'Hold My Seats (10 min)'}
            </motion.button>
          )}

          <motion.button
            whileTap={{ scale: 0.97 }}
            onClick={proceedToCheckout}
            disabled={checkoutLoading}
            data-testid="proceed-to-checkout"
            style={{
              width: '100%',
              backgroundColor: '#8B5CF6',
              color: '#fff',
              border: 'none',
              borderRadius: 10,
              padding: '12px 24px',
              fontSize: 14,
              fontWeight: 600,
              cursor: 'pointer',
              boxShadow: '0 4px 12px rgba(139,92,246,0.4)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 8,
            }}
          >
            <CreditCard size={16} strokeWidth={2} />
            {checkoutLoading ? 'Processing...' : 'Proceed to Checkout'}
          </motion.button>
        </div>
      )}
    </div>
  );
}
