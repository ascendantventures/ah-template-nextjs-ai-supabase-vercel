'use client';

import { useEffect, useState, useRef, useCallback } from 'react';
import dynamic from 'next/dynamic';
import { ZoomIn, ZoomOut, Maximize, Accessibility, Armchair } from 'lucide-react';
import { SeatInventory, Section, TicketTier, CartSeat } from '@/types';
import { useCartStore } from '@/lib/stores/cart';
import { useToast } from '@/components/ui/Toast';
import { createClient } from '@/lib/supabase/client';

// Dynamically import Konva to avoid SSR issues
const KonvaStage = dynamic(() => import('./KonvaStage'), { ssr: false });

interface SeatMapProps {
  eventId: string;
  inventory: SeatInventory[];
  tiers: TicketTier[];
  sections: Section[];
}

export const SEAT_STATUS_COLORS = {
  available: '#22C55E',
  locked: '#F59E0B',
  sold: '#EF4444',
  selected: '#8B5CF6',
  accessible: '#06B6D4',
  blocked: '#71717A',
  reserved: '#71717A',
};

export default function SeatMap({ eventId, inventory, tiers, sections }: SeatMapProps) {
  const [seatStatuses, setSeatStatuses] = useState<Record<string, string>>(() => {
    const map: Record<string, string> = {};
    inventory.forEach(inv => {
      if (inv.seat_id) map[inv.seat_id] = inv.status;
    });
    return map;
  });
  const [accessibilityMode, setAccessibilityMode] = useState(false);
  const [scale, setScale] = useState(1);
  const { addSeat, removeSeat, seats: cartSeats } = useCartStore();
  const { toast } = useToast();
  const supabase = createClient();

  // Map inventory by seat_id
  const inventoryBySeatId = useRef<Record<string, SeatInventory>>({});
  useEffect(() => {
    inventory.forEach(inv => {
      if (inv.seat_id) inventoryBySeatId.current[inv.seat_id] = inv;
    });
  }, [inventory]);

  // Map tiers by section_id
  const tierBySectionId = useRef<Record<string, TicketTier>>({});
  useEffect(() => {
    tiers.forEach(tier => {
      if (tier.section_id) tierBySectionId.current[tier.section_id] = tier;
    });
  }, [tiers]);

  const selectedSeatIds = new Set(cartSeats.map(s => s.seatId));

  // Supabase Realtime subscription
  useEffect(() => {
    const channel = supabase
      .channel(`seats:${eventId}`)
      .on('postgres_changes', {
        event: 'UPDATE',
        schema: 'public',
        table: 'seat_inventory',
        filter: `event_id=eq.${eventId}`,
      }, (payload) => {
        const newRow = payload.new as { seat_id: string; status: string };
        if (newRow.seat_id) {
          setSeatStatuses(prev => ({ ...prev, [newRow.seat_id]: newRow.status }));
        }
      })
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [eventId]);

  const handleSeatClick = useCallback(async (seatId: string, seatData: { seat_id: string; row_label: string; seat_number: string; seat_type: string; section_id: string }) => {
    const status = seatStatuses[seatId] || 'available';

    if (selectedSeatIds.has(seatId)) {
      removeSeat(seatId);
      return;
    }

    if (status !== 'available') {
      toast({ type: 'warning', title: 'Seat Unavailable', message: 'This seat is currently unavailable.' });
      return;
    }

    const tier = tierBySectionId.current[seatData.section_id];
    if (!tier) {
      toast({ type: 'error', title: 'No Pricing', message: 'No ticket tier found for this section.' });
      return;
    }

    const inv = inventoryBySeatId.current[seatId];
    if (!inv) return;

    const cartSeat: CartSeat = {
      seatId,
      inventoryId: inv.inventory_id,
      sectionName: (tier as TicketTier & { sections?: { name: string } }).sections?.name || 'Section',
      rowLabel: seatData.row_label,
      seatNumber: seatData.seat_number,
      seatType: seatData.seat_type,
      price: Number(tier.price),
      fee: Number(tier.fee_amount),
      tierId: tier.tier_id,
    };

    addSeat(cartSeat);
  }, [seatStatuses, selectedSeatIds, addSeat, removeSeat, toast]);

  return (
    <div style={{ position: 'relative', width: '100%', height: '100%', backgroundColor: '#0A0A0A', borderRadius: 0, overflow: 'hidden' }}>
      {/* Konva canvas */}
      <KonvaStage
        inventory={inventory}
        seatStatuses={seatStatuses}
        selectedSeatIds={selectedSeatIds}
        sections={sections}
        accessibilityMode={accessibilityMode}
        scale={scale}
        onScaleChange={setScale}
        onSeatClick={handleSeatClick}
      />

      {/* Controls */}
      <div style={{ position: 'absolute', top: 16, right: 16, backgroundColor: 'rgba(20,20,20,0.90)', border: '1px solid rgba(255,255,255,0.10)', borderRadius: 10, padding: 8, display: 'flex', flexDirection: 'column', gap: 8 }}>
        {[
          { icon: <ZoomIn size={18} strokeWidth={1.5} />, onClick: () => setScale(s => Math.min(s * 1.2, 4)), title: 'Zoom In' },
          { icon: <ZoomOut size={18} strokeWidth={1.5} />, onClick: () => setScale(s => Math.max(s / 1.2, 0.3)), title: 'Zoom Out' },
          { icon: <Maximize size={18} strokeWidth={1.5} />, onClick: () => setScale(1), title: 'Reset' },
          { icon: <Accessibility size={18} strokeWidth={1.5} />, onClick: () => setAccessibilityMode(m => !m), title: 'Accessibility Mode' },
        ].map((btn, i) => (
          <button
            key={i}
            onClick={btn.onClick}
            title={btn.title}
            style={{
              width: 36,
              height: 36,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              background: 'none',
              border: 'none',
              borderRadius: 6,
              cursor: 'pointer',
              color: btn.title === 'Accessibility Mode' && accessibilityMode ? '#06B6D4' : '#A1A1AA',
            }}
          >
            {btn.icon}
          </button>
        ))}
      </div>

      {/* Legend */}
      <div style={{ position: 'absolute', bottom: 16, left: 16, backgroundColor: 'rgba(20,20,20,0.90)', border: '1px solid rgba(255,255,255,0.10)', borderRadius: 10, padding: '12px 16px', display: 'flex', gap: 16, flexWrap: 'wrap' }}>
        {[
          { color: '#22C55E', label: 'Available' },
          { color: '#8B5CF6', label: 'Selected' },
          { color: '#F59E0B', label: 'Locked' },
          { color: '#EF4444', label: 'Sold' },
          { color: '#06B6D4', label: 'Accessible' },
        ].map(item => (
          <div key={item.label} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <div style={{ width: 12, height: 12, borderRadius: '50%', backgroundColor: item.color }} />
            <span style={{ fontSize: 12, fontWeight: 500, color: '#A1A1AA' }}>{item.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
