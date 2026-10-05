-- Lions Club Website — initial schema migration
-- Run once at deploy time via: psql $DATABASE_URL -f migrate.sql
-- Or via the npm run db:migrate script

CREATE TABLE IF NOT EXISTS users (
  id                TEXT PRIMARY KEY,
  email             TEXT NOT NULL UNIQUE,
  password          TEXT NOT NULL,
  first_name        TEXT NOT NULL,
  last_name         TEXT NOT NULL,
  phone             TEXT,
  avatar            TEXT,
  role              TEXT NOT NULL DEFAULT 'normal_user',
  membership_number TEXT UNIQUE,
  dues_paid_until   TIMESTAMPTZ,
  is_active         BOOLEAN NOT NULL DEFAULT TRUE,
  bio               TEXT,
  address           TEXT,
  occupation        TEXT,
  created_at        TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at        TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS refresh_tokens (
  id         TEXT PRIMARY KEY,
  token      TEXT NOT NULL UNIQUE,
  user_id    TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  expires_at TIMESTAMPTZ NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS events (
  id           TEXT PRIMARY KEY,
  title        TEXT NOT NULL,
  slug         TEXT NOT NULL UNIQUE,
  description  TEXT NOT NULL,
  location     TEXT NOT NULL,
  start_date   TIMESTAMPTZ NOT NULL,
  end_date     TIMESTAMPTZ,
  image        TEXT,
  category     TEXT NOT NULL DEFAULT 'general',
  capacity     INTEGER,
  is_published BOOLEAN NOT NULL DEFAULT TRUE,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at   TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS event_bookings (
  id         TEXT PRIMARY KEY,
  user_id    TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  event_id   TEXT NOT NULL REFERENCES events(id) ON DELETE CASCADE,
  status     TEXT NOT NULL DEFAULT 'confirmed',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(user_id, event_id)
);

CREATE TABLE IF NOT EXISTS meetings (
  id           TEXT PRIMARY KEY,
  title        TEXT NOT NULL,
  description  TEXT,
  location     TEXT NOT NULL,
  date         TIMESTAMPTZ NOT NULL,
  agenda       TEXT,
  pv_file      TEXT,
  is_published BOOLEAN NOT NULL DEFAULT TRUE,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at   TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS meeting_attendance (
  id          TEXT PRIMARY KEY,
  meeting_id  TEXT NOT NULL REFERENCES meetings(id) ON DELETE CASCADE,
  user_id     TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  rsvp_status TEXT NOT NULL DEFAULT 'pending',
  status      TEXT,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(meeting_id, user_id)
);

CREATE TABLE IF NOT EXISTS transactions (
  id          TEXT PRIMARY KEY,
  type        TEXT NOT NULL,
  category    TEXT NOT NULL,
  amount      DOUBLE PRECISION NOT NULL,
  description TEXT NOT NULL,
  date        TIMESTAMPTZ NOT NULL,
  receipt     TEXT,
  user_id     TEXT REFERENCES users(id) ON DELETE SET NULL,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS donations (
  id         TEXT PRIMARY KEY,
  name       TEXT,
  email      TEXT,
  amount     DOUBLE PRECISION NOT NULL,
  message    TEXT,
  anonymous  BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS documents (
  id          TEXT PRIMARY KEY,
  title       TEXT NOT NULL,
  category    TEXT NOT NULL DEFAULT 'general',
  file_url    TEXT NOT NULL,
  file_name   TEXT NOT NULL,
  file_size   INTEGER,
  mime_type   TEXT,
  uploaded_by TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  is_public   BOOLEAN NOT NULL DEFAULT FALSE,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS service_hours (
  id            TEXT PRIMARY KEY,
  user_id       TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  activity      TEXT NOT NULL,
  description   TEXT,
  hours         DOUBLE PRECISION NOT NULL,
  date          TIMESTAMPTZ NOT NULL,
  status        TEXT NOT NULL DEFAULT 'pending',
  reject_reason TEXT,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS applications (
  id                       TEXT PRIMARY KEY,
  user_id                  TEXT NOT NULL UNIQUE REFERENCES users(id) ON DELETE CASCADE,
  birth_date               TEXT NOT NULL,
  status_type              TEXT NOT NULL,
  field_of_study           TEXT NOT NULL,
  has_past_experience      BOOLEAN NOT NULL DEFAULT FALSE,
  past_experience_details  TEXT,
  skills                   TEXT NOT NULL,
  motivation               TEXT NOT NULL,
  discovery_channel        TEXT NOT NULL,
  availability             TEXT NOT NULL,
  ready_for_responsibility BOOLEAN NOT NULL DEFAULT FALSE,
  status                   TEXT NOT NULL DEFAULT 'pending',
  created_at               TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at               TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS notifications (
  id         TEXT PRIMARY KEY,
  user_id    TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  title      TEXT NOT NULL,
  message    TEXT NOT NULL,
  type       TEXT NOT NULL DEFAULT 'info',
  is_read    BOOLEAN NOT NULL DEFAULT FALSE,
  link       TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
