CREATE TABLE IF NOT EXISTS questions (
 bank TEXT NOT NULL, id TEXT NOT NULL, base TEXT NOT NULL,
 draft TEXT, published TEXT, changed INTEGER NOT NULL DEFAULT 0,
 revision INTEGER NOT NULL DEFAULT 1, updated_at TEXT,
 PRIMARY KEY(bank,id)
);
CREATE INDEX IF NOT EXISTS public_changes ON questions(bank,changed);
CREATE TABLE IF NOT EXISTS admin_sessions (
 token_hash TEXT PRIMARY KEY, subject TEXT NOT NULL, expires INTEGER NOT NULL
);
CREATE TABLE IF NOT EXISTS audit (
 id INTEGER PRIMARY KEY AUTOINCREMENT, bank TEXT NOT NULL, question_id TEXT NOT NULL,
 action TEXT NOT NULL, revision INTEGER NOT NULL, created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);

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
