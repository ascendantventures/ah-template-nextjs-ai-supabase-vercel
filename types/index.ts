// Ticketing Platform Types

export interface Profile {
  user_id: string;
  email: string;
  full_name: string | null;
  role: 'fan' | 'organizer' | 'platform_admin';
  avatar_url: string | null;
  created_at: string;
  updated_at: string;
}

export interface Venue {
  venue_id: string;
  organizer_id: string;
  name: string;
  address: string;
  city: string;
  state: string;
  zip: string;
  capacity: number;
  map_config: Record<string, unknown> | null;
  image_url: string | null;
  created_at: string;
  updated_at: string;
}

export interface Section {
  section_id: string;
  venue_id: string;
  name: string;
  row_count: number;
  seat_count_per_row: number;
  base_price: number;
  section_type: 'standard' | 'vip' | 'accessible' | 'floor' | 'suite';
  color_hex: string | null;
  polygon_coords: Record<string, unknown> | null;
  created_at: string;
}

export interface Seat {
  seat_id: string;
  section_id: string;
  venue_id: string;
  row_label: string;
  seat_number: string;
  seat_type: 'standard' | 'vip' | 'accessible' | 'aisle';
  x_pos: number | null;
  y_pos: number | null;
  created_at: string;
}

export interface TixEvent {
  event_id: string;
  venue_id: string;
  organizer_id: string;
  title: string;
  description: string | null;
  event_type: 'concert' | 'sports' | 'conference' | 'other';
  event_date: string;
  doors_open_at: string | null;
  status: 'draft' | 'published' | 'on_sale' | 'sold_out' | 'cancelled' | 'completed';
  cover_image_url: string | null;
  min_price: number | null;
  max_price: number | null;
  tags: string[] | null;
  created_at: string;
  updated_at: string;
  // Joined fields
  venues?: Venue;
}

export interface TicketTier {
  tier_id: string;
  event_id: string;
  section_id: string;
  name: string;
  price: number;
  fee_amount: number;
  max_per_order: number;
  total_capacity: number | null;
  sold_count: number;
  created_at: string;
  // Joined fields
  sections?: Section;
}

export interface SeatInventory {
  inventory_id: string;
  event_id: string;
  seat_id: string;
  tier_id: string | null;
  status: 'available' | 'locked' | 'sold' | 'reserved' | 'blocked';
  locked_by: string | null;
  locked_until: string | null;
  created_at: string;
  // Joined fields
  seats?: Seat;
}

export interface Order {
  order_id: string;
  user_id: string | null;
  event_id: string;
  status: 'pending' | 'confirmed' | 'cancelled' | 'refunded';
  subtotal: number;
  fee_total: number;
  total: number;
  stripe_payment_intent_id: string | null;
  stripe_checkout_session_id: string | null;
  guest_email: string | null;
  guest_name: string | null;
  created_at: string;
  updated_at: string;
  // Joined fields
  tix_events?: TixEvent;
  tickets?: Ticket[];
}

export interface Ticket {
  ticket_id: string;
  order_id: string;
  event_id: string;
  seat_id: string | null;
  tier_id: string | null;
  user_id: string | null;
  price_paid: number;
  qr_code: string;
  status: 'valid' | 'used' | 'cancelled' | 'transferred';
  created_at: string;
  // Joined fields
  tix_events?: TixEvent;
  seats?: Seat;
  ticket_tiers?: TicketTier;
  orders?: Order;
}

export interface CartSeat {
  seatId: string;
  inventoryId: string;
  sectionName: string;
  rowLabel: string;
  seatNumber: string;
  seatType: string;
  price: number;
  fee: number;
  tierId: string;
}
