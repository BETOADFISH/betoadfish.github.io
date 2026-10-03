import {usageEvents, usageRoutes, type UsageEvent} from '../lib/usage-contract';

const uuid = /^[a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12}$/;
export function validateUsageEvent(value: unknown): UsageEvent {
  if (!value || typeof value !== 'object' || Array.isArray(value)) throw Error('Invalid event');
  const v = value as Record<string, unknown>;
  const required = ['event_id', 'session_id', 'event', 'path', 'language', 'viewport'];
  if (required.some(key => !(key in v)) || Object.keys(v).some(key => ![...required, 'bank', 'kind', 'duration_ms'].includes(key))) throw Error('Invalid fields');
  if (typeof v.event_id !== 'string' || !uuid.test(v.event_id) || typeof v.session_id !== 'string' || !uuid.test(v.session_id)) throw Error('Invalid ID');
  if (!usageEvents.includes(v.event as UsageEvent['event']) || !usageRoutes.includes(v.path as UsageEvent['path']) || !['en', 'zh'].includes(v.language as string) || !['small', 'large'].includes(v.viewport as string)) throw Error('Invalid category');
  const isPage = v.event === 'page_view' || v.event === 'page_active';
  const isExport = String(v.event).startsWith('export_');
  if (isPage ? 'bank' in v : !['edexcel', 'aqa', 'cie', 'esat'].includes(v.bank as string) || v.path !== '/tools/biology') throw Error('Invalid bank');
  if (isExport ? !['qp', 'ms'].includes(v.kind as string) : 'kind' in v) throw Error('Invalid kind');
  if (v.event === 'page_active' ? !Number.isSafeInteger(v.duration_ms) || Number(v.duration_ms) < 1000 || Number(v.duration_ms) > 60000 : 'duration_ms' in v) throw Error('Invalid duration');
  return v as UsageEvent;
}

export async function collectUsage(req: Request, db: D1Database, origin: string) {
  const headers = {'Access-Control-Allow-Origin': origin, Vary: 'Origin', 'Cache-Control': 'no-store'};
  if (req.headers.get('Origin') !== origin) return new Response(null, {status: 403});
  if (req.method === 'OPTIONS') return new Response(null, {status: 204, headers: {...headers, 'Access-Control-Allow-Methods': 'POST', 'Access-Control-Allow-Headers': 'Content-Type', 'Access-Control-Max-Age': '86400'}});
  if (req.method !== 'POST') return new Response(null, {status: 405, headers});
  if (req.headers.get('Content-Type')?.split(';')[0] !== 'application/json') return new Response(null, {status: 415, headers});
  if (Number(req.headers.get('Content-Length') || 0) > 1024) return new Response(null, {status: 413, headers});
  let event: UsageEvent;
  try {
    const reader = req.body?.getReader();
    if (!reader) throw Error('Empty');
    let raw = '', size = 0;
    const decoder = new TextDecoder();
    while (true) {
      const {done, value} = await reader.read();
      if (done) break;
      size += value.length;
      if (size > 1024) { await reader.cancel(); return new Response(null, {status: 413, headers}); }
      raw += decoder.decode(value, {stream: true});
    }
    event = validateUsageEvent(JSON.parse(raw + decoder.decode()));
  } catch { return new Response(null, {status: 400, headers}); }
  try {
    await db.prepare('INSERT OR IGNORE INTO usage_events(event_id,session_id,event,path,language,viewport,bank,kind,duration_ms) VALUES(?,?,?,?,?,?,?,?,?)')
      .bind(event.event_id, event.session_id, event.event, event.path, event.language, event.viewport, event.bank ?? null, event.kind ?? null, event.duration_ms ?? 0).run();
    return new Response(null, {status: 204, headers});
  } catch { return new Response(null, {status: 503, headers}); }
}

export async function usageStats(db: D1Database, days: number) {
  const period = `-${days} days`;
  const query = (sql: string) => db.prepare(sql).bind(period).all();
  const [summary, daily, pages, banks, exports, coverage] = await Promise.all([
    query("SELECT count(CASE WHEN event='page_view' THEN 1 END) AS views,count(DISTINCT CASE WHEN event='page_view' THEN session_id END) AS sessions,coalesce(sum(duration_ms),0) AS visible_ms,min(created_at) AS first_event,max(created_at) AS last_event FROM usage_events WHERE created_at>=datetime('now',?)"),
    query("SELECT date(created_at,'+8 hours') AS day,count(CASE WHEN event='page_view' THEN 1 END) AS views,count(DISTINCT CASE WHEN event='page_view' THEN session_id END) AS sessions,coalesce(sum(duration_ms),0) AS visible_ms FROM usage_events WHERE created_at>=datetime('now',?) GROUP BY day ORDER BY day"),
    query("SELECT path,language,viewport,count(CASE WHEN event='page_view' THEN 1 END) AS views,count(DISTINCT CASE WHEN event='page_view' THEN session_id END) AS sessions,coalesce(sum(duration_ms),0) AS visible_ms FROM usage_events WHERE created_at>=datetime('now',?) AND event IN ('page_view','page_active') GROUP BY path,language,viewport ORDER BY views DESC,path,language,viewport"),
    // The cohort is sessions with bank_open in this window. Each later count is
    // an intersection, so lost initial events cannot inflate a rate above 100%.
    query(`WITH sessions AS (
      SELECT bank,session_id,max(event='bank_open') AS opened,max(event='bank_loaded') AS loaded,max(event='bank_error') AS failed,
      max(event='question_preview') AS previewed,max(event='filter_apply') AS filtered,max(event='random_generated') AS randomized,
      max(event='export_started') AS export_started,max(event='export_success') AS exported
      FROM usage_events WHERE created_at>=datetime('now',?) AND bank IS NOT NULL GROUP BY bank,session_id
    ) SELECT bank,sum(opened) AS opened,sum(opened*loaded) AS loaded,sum(opened*failed) AS failed,
      sum(opened*loaded*previewed) AS previewed,sum(opened*loaded*filtered) AS filtered,sum(opened*loaded*randomized) AS randomized,
      sum(opened*loaded*export_started) AS export_started,sum(opened*loaded*export_started*exported) AS exported
      FROM sessions GROUP BY bank ORDER BY bank`),
    query("SELECT bank,kind,sum(event='export_started') AS started,sum(event='export_success') AS successes,sum(event='export_error') AS failures FROM usage_events WHERE created_at>=datetime('now',?) AND event IN ('export_started','export_success','export_error') GROUP BY bank,kind ORDER BY bank,kind"),
    query("SELECT count(*) AS received_events,count(DISTINCT CASE WHEN bank IS NOT NULL THEN session_id END) AS bank_sessions FROM usage_events WHERE created_at>=datetime('now',?)"),
  ]);
  return {days, timezone: 'Asia/Shanghai', retention_days: 90, generated_at: new Date().toISOString(), summary: summary.results[0], daily: daily.results, pages: pages.results, banks: banks.results, exports: exports.results, coverage: coverage.results[0]};
}
