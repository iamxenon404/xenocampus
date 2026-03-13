-- ─────────────────────────────────────────────────────────
-- xenoCampus Main Database Schema
-- Run this once on your main Render Postgres DB
-- ─────────────────────────────────────────────────────────

-- Schools table — one row per subscribed school
CREATE TABLE IF NOT EXISTS schools (
  id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name                VARCHAR(255) NOT NULL,
  subdomain           VARCHAR(100) UNIQUE NOT NULL,
  custom_domain       VARCHAR(255),
  
  -- Admin contact
  admin_email         VARCHAR(255) UNIQUE NOT NULL,
  admin_password_hash VARCHAR(255) NOT NULL,
  admin_name          VARCHAR(255) NOT NULL,

  -- Branding (set during/after onboarding)
  logo_url            TEXT,
  primary_color       VARCHAR(7) DEFAULT '#4f46e5',
  secondary_color     VARCHAR(7) DEFAULT '#6366f1',
  motto               TEXT,

  -- Plan & billing
  plan                VARCHAR(50) NOT NULL DEFAULT 'starter',
  status              VARCHAR(50) NOT NULL DEFAULT 'pending',
  -- status: pending | active | suspended | cancelled | provision_failed

  stripe_customer_id      VARCHAR(255),
  stripe_subscription_id  VARCHAR(255),
  billing_cycle_end       TIMESTAMPTZ,

  -- School DB info
  db_name               VARCHAR(255),
  db_connection_string  TEXT,

  -- Usage stats (updated by aggregation job)
  student_count       INTEGER DEFAULT 0,
  staff_count         INTEGER DEFAULT 0,
  db_storage_mb       FLOAT DEFAULT 0,
  cloud_storage_mb    FLOAT DEFAULT 0,
  last_active         TIMESTAMPTZ,

  provisioned_at      TIMESTAMPTZ,
  created_at          TIMESTAMPTZ DEFAULT NOW(),
  updated_at          TIMESTAMPTZ DEFAULT NOW()
);

-- Analytics snapshots — written by hourly aggregation job
CREATE TABLE IF NOT EXISTS school_analytics (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  school_id   UUID NOT NULL REFERENCES schools(id) ON DELETE CASCADE,
  student_count   INTEGER DEFAULT 0,
  staff_count     INTEGER DEFAULT 0,
  db_storage_mb   FLOAT DEFAULT 0,
  cloud_storage_mb FLOAT DEFAULT 0,
  snapshot_at TIMESTAMPTZ DEFAULT NOW()
);

-- Billing events log
CREATE TABLE IF NOT EXISTS billing_events (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  school_id       UUID REFERENCES schools(id) ON DELETE SET NULL,
  stripe_event_id VARCHAR(255) UNIQUE NOT NULL,
  event_type      VARCHAR(100) NOT NULL,
  amount          INTEGER, -- in cents
  status          VARCHAR(50),
  created_at      TIMESTAMPTZ DEFAULT NOW()
);

-- xenoCampus super admins (you + any team)
CREATE TABLE IF NOT EXISTS admins (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email         VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  name          VARCHAR(255) NOT NULL,
  created_at    TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_schools_subdomain ON schools(subdomain);
CREATE INDEX IF NOT EXISTS idx_schools_status ON schools(status);
CREATE INDEX IF NOT EXISTS idx_schools_stripe_customer ON schools(stripe_customer_id);
CREATE INDEX IF NOT EXISTS idx_billing_events_school ON billing_events(school_id);
CREATE INDEX IF NOT EXISTS idx_analytics_school ON school_analytics(school_id);
