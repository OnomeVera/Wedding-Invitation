-- ============================================================
-- Elizabeth Meruwoma & Stephen Ukpong — Royal Wedding Platform
-- Initial Database Migration
-- ============================================================

-- Enable pgcrypto for token generation
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- ============================================================
-- 1. admin_profiles
-- ============================================================
CREATE TABLE IF NOT EXISTS admin_profiles (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name   TEXT NOT NULL,
  role        TEXT NOT NULL DEFAULT 'admin' CHECK (role IN ('super_admin', 'admin', 'organiser')),
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (user_id)
);

-- ============================================================
-- 2. guests
-- ============================================================
CREATE TABLE IF NOT EXISTS guests (
  id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  full_name           TEXT NOT NULL,
  email               TEXT,
  phone               TEXT,
  category            TEXT NOT NULL DEFAULT 'General',
  allocated_guests    INTEGER NOT NULL DEFAULT 1 CHECK (allocated_guests >= 1 AND allocated_guests <= 50),
  invitation_status   TEXT NOT NULL DEFAULT 'not_sent'
                        CHECK (invitation_status IN ('not_sent','sent','viewed','revoked')),
  created_at          TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at          TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS guests_full_name_idx ON guests (full_name);
CREATE INDEX IF NOT EXISTS guests_category_idx  ON guests (category);

-- Auto-update updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER guests_updated_at
  BEFORE UPDATE ON guests
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================================
-- 3. invitation_tokens
-- ============================================================
CREATE TABLE IF NOT EXISTS invitation_tokens (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  guest_id    UUID NOT NULL REFERENCES guests(id) ON DELETE CASCADE,
  token_hash  TEXT NOT NULL UNIQUE,   -- SHA-256 of the raw token
  expires_at  TIMESTAMPTZ,             -- NULL = never expires
  revoked_at  TIMESTAMPTZ,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS invitation_tokens_guest_id_idx   ON invitation_tokens (guest_id);
CREATE INDEX IF NOT EXISTS invitation_tokens_token_hash_idx ON invitation_tokens (token_hash);

-- ============================================================
-- 4. rsvps
-- ============================================================
CREATE TABLE IF NOT EXISTS rsvps (
  id                    UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  guest_id              UUID NOT NULL REFERENCES guests(id) ON DELETE CASCADE,
  attendance_status     TEXT NOT NULL CHECK (attendance_status IN ('accepted','declined')),
  attending_count       INTEGER NOT NULL DEFAULT 0 CHECK (attending_count >= 0),
  dietary_requirements  TEXT,
  special_requests      TEXT,
  personal_message      TEXT,
  responded_at          TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at            TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (guest_id)
);

CREATE TRIGGER rsvps_updated_at
  BEFORE UPDATE ON rsvps
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================================
-- 5. accompanying_guests
-- ============================================================
CREATE TABLE IF NOT EXISTS accompanying_guests (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  rsvp_id     UUID NOT NULL REFERENCES rsvps(id) ON DELETE CASCADE,
  full_name   TEXT NOT NULL,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS accompanying_guests_rsvp_id_idx ON accompanying_guests (rsvp_id);

-- ============================================================
-- 6. wedding_settings
-- ============================================================
CREATE TABLE IF NOT EXISTS wedding_settings (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  bride_name        TEXT NOT NULL DEFAULT 'Elizabeth Meruwoma',
  groom_name        TEXT NOT NULL DEFAULT 'Stephen Ukpong',
  wedding_date      DATE NOT NULL DEFAULT '2027-02-13',
  timezone          TEXT NOT NULL DEFAULT 'Africa/Lagos',
  ceremony_time     TEXT NOT NULL DEFAULT 'TBD',
  ceremony_venue    TEXT NOT NULL DEFAULT 'TBD',
  reception_time    TEXT NOT NULL DEFAULT 'TBD',
  reception_venue   TEXT NOT NULL DEFAULT 'TBD',
  dress_code        TEXT NOT NULL DEFAULT 'Smart Elegant',
  contact_details   TEXT,
  whatsapp_number   TEXT,
  updated_at        TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Seed default settings row
INSERT INTO wedding_settings (
  bride_name, groom_name, wedding_date, timezone,
  ceremony_time, ceremony_venue, reception_time, reception_venue, dress_code
)
VALUES (
  'Elizabeth Meruwoma', 'Stephen Ukpong', '2027-02-13', 'Africa/Lagos',
  'TBD', 'TBD', 'TBD', 'TBD',
  'Smart Elegant — Burnt Orange & Olive Green Accents'
)
ON CONFLICT DO NOTHING;

-- ============================================================
-- 7. wedding_events
-- ============================================================
CREATE TABLE IF NOT EXISTS wedding_events (
  id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_name          TEXT NOT NULL,
  event_time          TEXT NOT NULL,
  event_location      TEXT,
  event_description   TEXT,
  display_order       INTEGER NOT NULL DEFAULT 1
);

CREATE INDEX IF NOT EXISTS wedding_events_order_idx ON wedding_events (display_order);

-- Seed default events
INSERT INTO wedding_events (event_name, event_time, event_location, event_description, display_order)
VALUES
  ('Arrival of Guests',    '11:00 AM', 'Main Entrance',   'Guests are warmly welcomed',                         1),
  ('Wedding Ceremony',     '12:00 PM', 'Ceremony Venue',  'The exchange of vows and rings',                     2),
  ('Photography Session',  '1:30 PM',  'Garden Grounds',  'Capturing beautiful moments',                        3),
  ('Reception Begins',     '3:00 PM',  'Reception Hall',  'Dinner, speeches and celebration',                   4),
  ('First Dance',          '5:00 PM',  'Reception Hall',  'Elizabeth & Stephen''s first dance as husband and wife', 5),
  ('Evening Celebrations', '7:00 PM',  'Reception Hall',  'Music, dancing and merriment',                       6)
ON CONFLICT DO NOTHING;

-- ============================================================
-- 8. guest_checkins
-- ============================================================
CREATE TABLE IF NOT EXISTS guest_checkins (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  guest_id          UUID NOT NULL REFERENCES guests(id) ON DELETE CASCADE,
  checked_in_by     UUID REFERENCES auth.users(id),
  checked_in_at     TIMESTAMPTZ NOT NULL DEFAULT now(),
  attendance_count  INTEGER NOT NULL DEFAULT 1,
  UNIQUE (guest_id)  -- prevent duplicate check-ins
);

CREATE INDEX IF NOT EXISTS guest_checkins_guest_id_idx ON guest_checkins (guest_id);

-- ============================================================
-- 9. audit_logs
-- ============================================================
CREATE TABLE IF NOT EXISTS audit_logs (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  admin_user_id   UUID REFERENCES auth.users(id),
  action          TEXT NOT NULL,
  record_type     TEXT NOT NULL,
  record_id       UUID,
  metadata        JSONB,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS audit_logs_admin_user_id_idx ON audit_logs (admin_user_id);
CREATE INDEX IF NOT EXISTS audit_logs_created_at_idx    ON audit_logs (created_at DESC);

-- ============================================================
-- ROW LEVEL SECURITY
-- ============================================================

-- Enable RLS on all tables
ALTER TABLE admin_profiles    ENABLE ROW LEVEL SECURITY;
ALTER TABLE guests             ENABLE ROW LEVEL SECURITY;
ALTER TABLE invitation_tokens  ENABLE ROW LEVEL SECURITY;
ALTER TABLE rsvps              ENABLE ROW LEVEL SECURITY;
ALTER TABLE accompanying_guests ENABLE ROW LEVEL SECURITY;
ALTER TABLE wedding_settings   ENABLE ROW LEVEL SECURITY;
ALTER TABLE wedding_events     ENABLE ROW LEVEL SECURITY;
ALTER TABLE guest_checkins     ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_logs         ENABLE ROW LEVEL SECURITY;

-- ── Helper: is authenticated admin ─────────────────────────────
CREATE OR REPLACE FUNCTION is_admin()
RETURNS BOOLEAN AS $$
  SELECT EXISTS (
    SELECT 1 FROM admin_profiles
    WHERE user_id = auth.uid()
  );
$$ LANGUAGE sql SECURITY DEFINER STABLE;

-- ── admin_profiles ──────────────────────────────────────────────
CREATE POLICY "Admins can read own profile"
  ON admin_profiles FOR SELECT
  USING (user_id = auth.uid());

CREATE POLICY "Admins can update own profile"
  ON admin_profiles FOR UPDATE
  USING (user_id = auth.uid());

-- ── guests ──────────────────────────────────────────────────────
CREATE POLICY "Admins can manage guests"
  ON guests FOR ALL
  USING (is_admin());

-- ── invitation_tokens ───────────────────────────────────────────
CREATE POLICY "Admins can manage tokens"
  ON invitation_tokens FOR ALL
  USING (is_admin());

-- Allow anonymous read of active tokens (Edge Functions use service role, so this is for direct DB reads only)
CREATE POLICY "Public can verify active tokens"
  ON invitation_tokens FOR SELECT
  USING (revoked_at IS NULL);

-- ── rsvps ───────────────────────────────────────────────────────
CREATE POLICY "Admins can manage rsvps"
  ON rsvps FOR ALL
  USING (is_admin());

-- Guests can read their own RSVP (matched via invitation token — Edge Functions handle this)
CREATE POLICY "Service role manages rsvps"
  ON rsvps FOR ALL
  USING (auth.role() = 'service_role');

-- ── accompanying_guests ─────────────────────────────────────────
CREATE POLICY "Admins can manage accompanying_guests"
  ON accompanying_guests FOR ALL
  USING (is_admin());

CREATE POLICY "Service role manages accompanying_guests"
  ON accompanying_guests FOR ALL
  USING (auth.role() = 'service_role');

-- ── wedding_settings ────────────────────────────────────────────
-- Public read, admin write
CREATE POLICY "Anyone can read settings"
  ON wedding_settings FOR SELECT
  USING (true);

CREATE POLICY "Admins can update settings"
  ON wedding_settings FOR ALL
  USING (is_admin());

-- ── wedding_events ──────────────────────────────────────────────
CREATE POLICY "Anyone can read events"
  ON wedding_events FOR SELECT
  USING (true);

CREATE POLICY "Admins can manage events"
  ON wedding_events FOR ALL
  USING (is_admin());

-- ── guest_checkins ──────────────────────────────────────────────
CREATE POLICY "Admins can manage checkins"
  ON guest_checkins FOR ALL
  USING (is_admin());

CREATE POLICY "Service role manages checkins"
  ON guest_checkins FOR ALL
  USING (auth.role() = 'service_role');

-- ── audit_logs ──────────────────────────────────────────────────
CREATE POLICY "Admins can read audit logs"
  ON audit_logs FOR SELECT
  USING (is_admin());

CREATE POLICY "Service role writes audit logs"
  ON audit_logs FOR INSERT
  WITH CHECK (auth.role() = 'service_role');
