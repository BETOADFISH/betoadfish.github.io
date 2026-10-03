CREATE TABLE IF NOT EXISTS usage_events (
 event_id TEXT PRIMARY KEY,
 session_id TEXT NOT NULL,
 event TEXT NOT NULL CHECK(event IN ('page_view','page_active','bank_open','bank_loaded','bank_error','question_preview','filter_apply','random_generated','export_started','export_success','export_error')),
 path TEXT NOT NULL,
 language TEXT NOT NULL CHECK(language IN ('en','zh')),
 viewport TEXT NOT NULL CHECK(viewport IN ('small','large')),
 bank TEXT CHECK(bank IN ('edexcel','aqa','cie','esat')),
 kind TEXT CHECK(kind IN ('qp','ms')),
 duration_ms INTEGER NOT NULL DEFAULT 0 CHECK(duration_ms BETWEEN 0 AND 60000),
 created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX IF NOT EXISTS usage_events_created ON usage_events(created_at);
CREATE INDEX IF NOT EXISTS usage_events_bank_session ON usage_events(bank,session_id,created_at);
