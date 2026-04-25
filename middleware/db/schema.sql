CREATE TABLE IF NOT EXISTS events (
  id              INTEGER PRIMARY KEY AUTOINCREMENT,
  received_at     TEXT NOT NULL,
  event_type      TEXT,
  identity_id     TEXT,
  page_url        TEXT,
  page_title      TEXT,
  raw_payload     TEXT NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_events_received_at ON events(received_at);
CREATE INDEX IF NOT EXISTS idx_events_identity ON events(identity_id);
