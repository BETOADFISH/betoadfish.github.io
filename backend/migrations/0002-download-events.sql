CREATE TABLE IF NOT EXISTS download_events (
 event_id TEXT PRIMARY KEY,
 bank TEXT NOT NULL CHECK(bank IN ('edexcel','aqa','cie','esat')),
 kind TEXT NOT NULL CHECK(kind IN ('qp','ms')),
 status TEXT NOT NULL CHECK(status IN ('success','error')),
 bytes INTEGER NOT NULL CHECK(bytes BETWEEN 0 AND 104857600),
 duration_ms INTEGER NOT NULL CHECK(duration_ms BETWEEN 0 AND 3600000),
 questions INTEGER NOT NULL CHECK(questions BETWEEN 1 AND 100),
 created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX IF NOT EXISTS download_events_created ON download_events(created_at);
