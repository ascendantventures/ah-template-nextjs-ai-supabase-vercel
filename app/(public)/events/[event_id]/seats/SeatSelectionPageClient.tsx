'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { ChevronLeft } from 'lucide-react';
import { TixEvent, SeatInventory, Section, TicketTier } from '@/types';
import { ToastProvider } from '@/components/ui/Toast';
import CartSidebar from '@/components/cart/CartSidebar';
import SeatMap from '@/components/seat-map/SeatMap';
import { useCartStore } from '@/lib/stores/cart';

interface SeatSelectionPageClientProps {
  event: TixEvent;
  inventory: SeatInventory[];
  tiers: TicketTier[];
  sections: Section[];
}

function formatDate(dateStr: string) {
  const d = new Date(dateStr);
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) + ' · ' + d.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });
}

export default function SeatSelectionPageClient({ event, inventory, tiers, sections }: SeatSelectionPageClientProps) {
  const { setEventId } = useCartStore();

  useEffect(() => {
    setEventId(event.event_id);
  }, [event.event_id, setEventId]);

  return (
    <ToastProvider>
      <div style={{ display: 'flex', height: '100vh', backgroundColor: '#09090B', overflow: 'hidden' }}>
        {/* Main area */}
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0 }}>
          {/* Header bar */}
          <div style={{ height: 64, backgroundColor: '#0F0F0F', borderBottom: '1px solid rgba(255,255,255,0.08)', padding: '0 24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexShrink: 0 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <Link href={`/events/${event.event_id}`} style={{ display: 'flex', alignItems: 'center', gap: 4, color: '#A1A1AA', textDecoration: 'none', fontSize: 14 }}>
                <ChevronLeft size={20} strokeWidth={1.5} />
                Back
              </Link>
              <div style={{ width: 1, height: 20, backgroundColor: 'rgba(255,255,255,0.10)' }} />
              <span style={{ fontSize: 18, fontWeight: 600, color: '#F4F4F5' }}>{event.title}</span>
            </div>
            <span style={{ fontSize: 14, fontWeight: 500, color: '#A1A1AA' }}>{formatDate(event.event_date)}</span>
          </div>

          {/* Seat map */}
          <div style={{ flex: 1, position: 'relative', overflow: 'hidden' }}>
            <SeatMap
              eventId={event.event_id}
              inventory={inventory}
              tiers={tiers}
              sections={sections}
            />
          </div>
        </div>

        {/* Cart sidebar */}
        <CartSidebar eventId={event.event_id} tiers={tiers} />
      </div>
    </ToastProvider>
  );
}
