import { unstable_noStore as noStore } from 'next/cache';
import { createClient } from '@/lib/supabase/server';
import { SearchX } from 'lucide-react';
import { TixEvent } from '@/types';
import EventGrid from '@/components/events/EventGrid';
import EventDiscoveryClient from './EventDiscoveryClient';

export const dynamic = 'force-dynamic';

async function getEvents(search?: string, type?: string) {
  noStore();
  const supabase = await createClient();
  let query = supabase
    .from('tix_events')
    .select('*, venues(name, city, state)')
    .in('status', ['on_sale', 'published'])
    .order('event_date', { ascending: true });

  if (search) {
    query = query.or(`title.ilike.%${search}%,description.ilike.%${search}%`);
  }
  if (type && type !== 'all') {
    query = query.eq('event_type', type);
  }

  const { data } = await query.limit(50);
  return (data || []) as TixEvent[];
}

export default async function EventsPage({
  searchParams,
}: {
  searchParams: Promise<{ search?: string; type?: string }>;
}) {
  const params = await searchParams;
  const events = await getEvents(params.search, params.type);

  return <EventDiscoveryClient events={events} initialSearch={params.search} initialType={params.type} />;
}
