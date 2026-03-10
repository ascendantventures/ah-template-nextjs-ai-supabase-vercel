-- =============================================
-- TICKETING PLATFORM — SUPABASE MIGRATION
-- =============================================

-- Extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =============================================
-- TABLE: profiles
-- NOTE: has handle_new_user trigger — use upsert() not insert()
-- NOTE: SECURITY DEFINER required — auth admin role cannot INSERT into profiles
-- =============================================
CREATE TABLE IF NOT EXISTS profiles (
  user_id       UUID        PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email         TEXT        NOT NULL,
  full_name     TEXT,
  role          TEXT        NOT NULL DEFAULT 'fan'
                            CHECK (role IN ('fan', 'organizer', 'platform_admin')),
  avatar_url    TEXT,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- =============================================
-- TABLE: venues
-- =============================================
CREATE TABLE IF NOT EXISTS venues (
  venue_id      UUID        PRIMARY KEY DEFAULT uuid_generate_v4(),
  organizer_id  UUID        NOT NULL REFERENCES profiles(user_id) ON DELETE CASCADE,
  name          TEXT        NOT NULL,
  address       TEXT        NOT NULL,
  city          TEXT        NOT NULL,
  state         TEXT        NOT NULL,
  zip           TEXT        NOT NULL,
  capacity      INTEGER     NOT NULL DEFAULT 0,
  map_config    JSONB,
  image_url     TEXT,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- =============================================
-- TABLE: sections
-- =============================================
CREATE TABLE IF NOT EXISTS sections (
  section_id          UUID        PRIMARY KEY DEFAULT uuid_generate_v4(),
  venue_id            UUID        NOT NULL REFERENCES venues(venue_id) ON DELETE CASCADE,
  name                TEXT        NOT NULL,
  row_count           INTEGER     NOT NULL DEFAULT 0,
  seat_count_per_row  INTEGER     NOT NULL DEFAULT 0,
  base_price          NUMERIC(10,2) NOT NULL DEFAULT 0,
  section_type        TEXT        NOT NULL DEFAULT 'standard'
                                  CHECK (section_type IN ('standard','vip','accessible','floor','suite')),
  color_hex           TEXT,
  polygon_coords      JSONB,
  created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- =============================================
-- TABLE: seats
-- =============================================
CREATE TABLE IF NOT EXISTS seats (
  seat_id       UUID        PRIMARY KEY DEFAULT uuid_generate_v4(),
  section_id    UUID        NOT NULL REFERENCES sections(section_id) ON DELETE CASCADE,
  venue_id      UUID        NOT NULL REFERENCES venues(venue_id) ON DELETE CASCADE,
  row_label     TEXT        NOT NULL,
  seat_number   TEXT        NOT NULL,
  seat_type     TEXT        NOT NULL DEFAULT 'standard'
                            CHECK (seat_type IN ('standard','vip','accessible','aisle')),
  x_pos         NUMERIC(8,2),
  y_pos         NUMERIC(8,2),
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (section_id, row_label, seat_number)
);

-- =============================================
-- TABLE: events
-- =============================================
CREATE TABLE IF NOT EXISTS events (
  event_id          UUID        PRIMARY KEY DEFAULT uuid_generate_v4(),
  venue_id          UUID        NOT NULL REFERENCES venues(venue_id) ON DELETE CASCADE,
  organizer_id      UUID        NOT NULL REFERENCES profiles(user_id) ON DELETE CASCADE,
  title             TEXT        NOT NULL,
  description       TEXT,
  event_type        TEXT        NOT NULL DEFAULT 'concert'
                                CHECK (event_type IN ('concert','sports','conference','other')),
  event_date        TIMESTAMPTZ NOT NULL,
  doors_open_at     TIMESTAMPTZ,
  status            TEXT        NOT NULL DEFAULT 'draft'
                                CHECK (status IN ('draft','published','on_sale','sold_out','cancelled','completed')),
  cover_image_url   TEXT,
  min_price         NUMERIC(10,2),
  max_price         NUMERIC(10,2),
  tags              TEXT[],
  created_at        TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at        TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- =============================================
-- TABLE: ticket_tiers
-- =============================================
CREATE TABLE IF NOT EXISTS ticket_tiers (
  tier_id         UUID          PRIMARY KEY DEFAULT uuid_generate_v4(),
  event_id        UUID          NOT NULL REFERENCES events(event_id) ON DELETE CASCADE,
  section_id      UUID          NOT NULL REFERENCES sections(section_id) ON DELETE CASCADE,
  name            TEXT          NOT NULL,
  price           NUMERIC(10,2) NOT NULL,
  fee_amount      NUMERIC(10,2) NOT NULL DEFAULT 0,
  max_per_order   INTEGER       NOT NULL DEFAULT 8,
  total_capacity  INTEGER,
  sold_count      INTEGER       NOT NULL DEFAULT 0,
  created_at      TIMESTAMPTZ   NOT NULL DEFAULT NOW(),
  UNIQUE (event_id, section_id)
);

-- =============================================
-- TABLE: seat_inventory
-- =============================================
CREATE TABLE IF NOT EXISTS seat_inventory (
  inventory_id  UUID        PRIMARY KEY DEFAULT uuid_generate_v4(),
  event_id      UUID        NOT NULL REFERENCES events(event_id) ON DELETE CASCADE,
  seat_id       UUID        NOT NULL REFERENCES seats(seat_id) ON DELETE CASCADE,
  tier_id       UUID        REFERENCES ticket_tiers(tier_id),
  status        TEXT        NOT NULL DEFAULT 'available'
                            CHECK (status IN ('available','locked','sold','reserved','blocked')),
  locked_by     UUID        REFERENCES auth.users(id),
  locked_until  TIMESTAMPTZ,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (event_id, seat_id)
);

-- =============================================
-- TABLE: orders
-- =============================================
CREATE TABLE IF NOT EXISTS orders (
  order_id                  UUID          PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id                   UUID          REFERENCES profiles(user_id) ON DELETE SET NULL,
  event_id                  UUID          NOT NULL REFERENCES events(event_id),
  status                    TEXT          NOT NULL DEFAULT 'pending'
                                          CHECK (status IN ('pending','confirmed','cancelled','refunded')),
  subtotal                  NUMERIC(10,2) NOT NULL DEFAULT 0,
  fee_total                 NUMERIC(10,2) NOT NULL DEFAULT 0,
  total                     NUMERIC(10,2) NOT NULL DEFAULT 0,
  stripe_payment_intent_id  TEXT,
  stripe_checkout_session_id TEXT,
  guest_email               TEXT,
  guest_name                TEXT,
  created_at                TIMESTAMPTZ   NOT NULL DEFAULT NOW(),
  updated_at                TIMESTAMPTZ   NOT NULL DEFAULT NOW()
);

-- =============================================
-- TABLE: tickets
-- =============================================
CREATE TABLE IF NOT EXISTS tickets (
  ticket_id     UUID          PRIMARY KEY DEFAULT uuid_generate_v4(),
  order_id      UUID          NOT NULL REFERENCES orders(order_id) ON DELETE CASCADE,
  event_id      UUID          NOT NULL REFERENCES events(event_id),
  seat_id       UUID          REFERENCES seats(seat_id),
  tier_id       UUID          REFERENCES ticket_tiers(tier_id),
  user_id       UUID          REFERENCES profiles(user_id),
  price_paid    NUMERIC(10,2) NOT NULL,
  qr_code       TEXT          UNIQUE NOT NULL DEFAULT uuid_generate_v4()::TEXT,
  status        TEXT          NOT NULL DEFAULT 'valid'
                              CHECK (status IN ('valid','used','cancelled','transferred')),
  created_at    TIMESTAMPTZ   NOT NULL DEFAULT NOW()
);

-- =============================================
-- INDEXES
-- =============================================
CREATE INDEX IF NOT EXISTS idx_venues_organizer_id        ON venues(organizer_id);
CREATE INDEX IF NOT EXISTS idx_sections_venue_id          ON sections(venue_id);
CREATE INDEX IF NOT EXISTS idx_seats_section_id           ON seats(section_id);
CREATE INDEX IF NOT EXISTS idx_seats_venue_id             ON seats(venue_id);
CREATE INDEX IF NOT EXISTS idx_events_venue_id            ON events(venue_id);
CREATE INDEX IF NOT EXISTS idx_events_organizer_id        ON events(organizer_id);
CREATE INDEX IF NOT EXISTS idx_events_status              ON events(status);
CREATE INDEX IF NOT EXISTS idx_events_event_date          ON events(event_date);
CREATE INDEX IF NOT EXISTS idx_ticket_tiers_event_id      ON ticket_tiers(event_id);
CREATE INDEX IF NOT EXISTS idx_seat_inventory_event_id    ON seat_inventory(event_id);
CREATE INDEX IF NOT EXISTS idx_seat_inventory_seat_id     ON seat_inventory(seat_id);
CREATE INDEX IF NOT EXISTS idx_seat_inventory_status      ON seat_inventory(status);
CREATE INDEX IF NOT EXISTS idx_seat_inventory_locked_until ON seat_inventory(locked_until);
CREATE INDEX IF NOT EXISTS idx_orders_user_id             ON orders(user_id);
CREATE INDEX IF NOT EXISTS idx_orders_event_id            ON orders(event_id);
CREATE INDEX IF NOT EXISTS idx_orders_stripe_session      ON orders(stripe_checkout_session_id);
CREATE INDEX IF NOT EXISTS idx_tickets_order_id           ON tickets(order_id);
CREATE INDEX IF NOT EXISTS idx_tickets_user_id            ON tickets(user_id);
CREATE INDEX IF NOT EXISTS idx_tickets_event_id           ON tickets(event_id);
CREATE INDEX IF NOT EXISTS idx_tickets_qr_code            ON tickets(qr_code);

-- =============================================
-- TRIGGER FUNCTION: handle_new_user
-- SECURITY DEFINER required
-- =============================================
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO profiles (user_id, email, full_name, role)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data ->> 'full_name', ''),
    COALESCE(NEW.raw_user_meta_data ->> 'role', 'fan')
  )
  ON CONFLICT (user_id) DO UPDATE SET
    email     = EXCLUDED.email,
    full_name = COALESCE(EXCLUDED.full_name, profiles.full_name),
    updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- =============================================
-- TRIGGER FUNCTION: release_expired_locks
-- =============================================
CREATE OR REPLACE FUNCTION release_expired_locks()
RETURNS void
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  UPDATE seat_inventory
  SET status = 'available', locked_by = NULL, locked_until = NULL
  WHERE status = 'locked' AND locked_until < NOW();
END;
$$ LANGUAGE plpgsql;

-- =============================================
-- TRIGGER: updated_at auto-update
-- =============================================
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_venues_updated_at BEFORE UPDATE ON venues
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_events_updated_at BEFORE UPDATE ON events
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_orders_updated_at BEFORE UPDATE ON orders
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- =============================================
-- STORAGE BUCKETS
-- =============================================
INSERT INTO storage.buckets (id, name, public) VALUES
  ('venue-assets', 'venue-assets', true),
  ('event-covers', 'event-covers', true),
  ('seat-maps',    'seat-maps',    false),
  ('tickets',      'tickets',      false)
ON CONFLICT (id) DO NOTHING;

-- =============================================
-- ROW LEVEL SECURITY
-- =============================================
ALTER TABLE profiles      ENABLE ROW LEVEL SECURITY;
ALTER TABLE venues         ENABLE ROW LEVEL SECURITY;
ALTER TABLE sections       ENABLE ROW LEVEL SECURITY;
ALTER TABLE seats          ENABLE ROW LEVEL SECURITY;
ALTER TABLE events         ENABLE ROW LEVEL SECURITY;
ALTER TABLE ticket_tiers   ENABLE ROW LEVEL SECURITY;
ALTER TABLE seat_inventory ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders         ENABLE ROW LEVEL SECURITY;
ALTER TABLE tickets        ENABLE ROW LEVEL SECURITY;

-- profiles
CREATE POLICY "profiles_select_own" ON profiles
  FOR SELECT TO authenticated USING (user_id = auth.uid());
CREATE POLICY "profiles_update_own" ON profiles
  FOR UPDATE TO authenticated USING (user_id = auth.uid());
CREATE POLICY "profiles_admin_all" ON profiles
  FOR ALL TO authenticated USING (
    EXISTS (SELECT 1 FROM profiles p WHERE p.user_id = auth.uid() AND p.role = 'platform_admin')
  );

-- venues
CREATE POLICY "venues_public_select" ON venues FOR SELECT USING (true);
CREATE POLICY "venues_organizer_insert" ON venues FOR INSERT TO authenticated
  WITH CHECK (
    organizer_id = auth.uid() AND
    EXISTS (SELECT 1 FROM profiles WHERE user_id = auth.uid() AND role IN ('organizer','platform_admin'))
  );
CREATE POLICY "venues_organizer_update" ON venues FOR UPDATE TO authenticated
  USING (
    organizer_id = auth.uid() OR
    EXISTS (SELECT 1 FROM profiles WHERE user_id = auth.uid() AND role = 'platform_admin')
  );
CREATE POLICY "venues_organizer_delete" ON venues FOR DELETE TO authenticated
  USING (
    organizer_id = auth.uid() OR
    EXISTS (SELECT 1 FROM profiles WHERE user_id = auth.uid() AND role = 'platform_admin')
  );

-- sections
CREATE POLICY "sections_public_select" ON sections FOR SELECT USING (true);
CREATE POLICY "sections_organizer_all" ON sections FOR ALL TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM venues v WHERE v.venue_id = sections.venue_id AND (
        v.organizer_id = auth.uid() OR
        EXISTS (SELECT 1 FROM profiles WHERE user_id = auth.uid() AND role = 'platform_admin')
      )
    )
  );

-- seats
CREATE POLICY "seats_public_select" ON seats FOR SELECT USING (true);
CREATE POLICY "seats_organizer_all" ON seats FOR ALL TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM venues v WHERE v.venue_id = seats.venue_id AND (
        v.organizer_id = auth.uid() OR
        EXISTS (SELECT 1 FROM profiles WHERE user_id = auth.uid() AND role = 'platform_admin')
      )
    )
  );

-- events
CREATE POLICY "events_public_select" ON events FOR SELECT
  USING (status IN ('published','on_sale','sold_out'));
CREATE POLICY "events_organizer_select_own" ON events FOR SELECT TO authenticated
  USING (organizer_id = auth.uid());
CREATE POLICY "events_admin_select_all" ON events FOR SELECT TO authenticated
  USING (EXISTS (SELECT 1 FROM profiles WHERE user_id = auth.uid() AND role = 'platform_admin'));
CREATE POLICY "events_organizer_insert" ON events FOR INSERT TO authenticated
  WITH CHECK (
    organizer_id = auth.uid() AND
    EXISTS (SELECT 1 FROM profiles WHERE user_id = auth.uid() AND role IN ('organizer','platform_admin'))
  );
CREATE POLICY "events_organizer_update" ON events FOR UPDATE TO authenticated
  USING (
    organizer_id = auth.uid() OR
    EXISTS (SELECT 1 FROM profiles WHERE user_id = auth.uid() AND role = 'platform_admin')
  );
CREATE POLICY "events_organizer_delete" ON events FOR DELETE TO authenticated
  USING (
    organizer_id = auth.uid() OR
    EXISTS (SELECT 1 FROM profiles WHERE user_id = auth.uid() AND role = 'platform_admin')
  );

-- ticket_tiers
CREATE POLICY "ticket_tiers_public_select" ON ticket_tiers FOR SELECT USING (true);
CREATE POLICY "ticket_tiers_organizer_all" ON ticket_tiers FOR ALL TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM events e WHERE e.event_id = ticket_tiers.event_id AND (
        e.organizer_id = auth.uid() OR
        EXISTS (SELECT 1 FROM profiles WHERE user_id = auth.uid() AND role = 'platform_admin')
      )
    )
  );

-- seat_inventory
CREATE POLICY "seat_inventory_public_select" ON seat_inventory FOR SELECT USING (true);

-- orders
CREATE POLICY "orders_fan_select_own" ON orders FOR SELECT TO authenticated
  USING (user_id = auth.uid());
CREATE POLICY "orders_organizer_select" ON orders FOR SELECT TO authenticated
  USING (
    EXISTS (SELECT 1 FROM events e WHERE e.event_id = orders.event_id AND e.organizer_id = auth.uid())
  );
CREATE POLICY "orders_admin_all" ON orders FOR ALL TO authenticated
  USING (EXISTS (SELECT 1 FROM profiles WHERE user_id = auth.uid() AND role = 'platform_admin'));

-- tickets
CREATE POLICY "tickets_fan_select_own" ON tickets FOR SELECT TO authenticated
  USING (user_id = auth.uid());
CREATE POLICY "tickets_organizer_select" ON tickets FOR SELECT TO authenticated
  USING (
    EXISTS (SELECT 1 FROM events e WHERE e.event_id = tickets.event_id AND e.organizer_id = auth.uid())
  );
CREATE POLICY "tickets_admin_all" ON tickets FOR ALL TO authenticated
  USING (EXISTS (SELECT 1 FROM profiles WHERE user_id = auth.uid() AND role = 'platform_admin'));
