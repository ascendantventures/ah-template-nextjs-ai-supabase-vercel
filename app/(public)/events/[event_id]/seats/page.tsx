import { unstable_noStore as noStore } from 'next/cache';
import { createClient } from '@/lib/supabase/server';
import { notFound } from 'next/navigation';
import { TixEvent, SeatInventory, Section, TicketTier } from '@/types';
import SeatSelectionPageClient from './SeatSelectionPageClient';

export const dynamic = 'force-dynamic';

export default async function SeatSelectionPage({ params }: { params: Promise<{ event_id: string }> }) {
  noStore();
  const { event_id } = await params;
  const supabase = await createClient();

  const [eventRes, inventoryRes, tiersRes, sectionsRes] = await Promise.all([
    supabase.from('tix_events').select('*, venues(name, city)').eq('event_id', event_id).single(),
    supabase.from('seat_inventory').select('*, seats(seat_id, row_label, seat_number, seat_type, x_pos, y_pos, section_id)').eq('event_id', event_id),
    supabase.from('ticket_tiers').select('*, sections(name, section_type, color_hex)').eq('event_id', event_id),
    supabase.from('sections').select('*').eq('venue_id', 'placeholder').limit(0), // will query below
  ]);

  if (!eventRes.data) notFound();

  const event = eventRes.data as TixEvent;
  const inventory = (inventoryRes.data || []) as SeatInventory[];
  const tiers = (tiersRes.data || []) as TicketTier[];

  // Get sections for the venue
  const sectionsRes2 = await supabase
    .from('sections')
    .select('*')
    .eq('venue_id', event.venue_id);
  const sections = (sectionsRes2.data || []) as Section[];

  return <SeatSelectionPageClient event={event} inventory={inventory} tiers={tiers} sections={sections} />;
}
