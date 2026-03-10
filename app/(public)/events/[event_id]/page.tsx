import { unstable_noStore as noStore } from 'next/cache';
import { createClient } from '@/lib/supabase/server';
import { notFound } from 'next/navigation';
import { TixEvent, TicketTier } from '@/types';
import EventDetailClient from './EventDetailClient';

export const dynamic = 'force-dynamic';

async function getEvent(eventId: string) {
  noStore();
  const supabase = await createClient();
  const { data } = await supabase
    .from('tix_events')
    .select('*, venues(name, address, city, state, zip, capacity)')
    .eq('event_id', eventId)
    .single();
  return data as TixEvent | null;
}

async function getTiers(eventId: string) {
  noStore();
  const supabase = await createClient();
  const { data } = await supabase
    .from('ticket_tiers')
    .select('*, sections(name, section_type)')
    .eq('event_id', eventId);
  return (data || []) as TicketTier[];
}

export default async function EventDetailPage({ params }: { params: Promise<{ event_id: string }> }) {
  const { event_id } = await params;
  const [event, tiers] = await Promise.all([getEvent(event_id), getTiers(event_id)]);

  if (!event) notFound();

  return <EventDetailClient event={event} tiers={tiers} />;
}
