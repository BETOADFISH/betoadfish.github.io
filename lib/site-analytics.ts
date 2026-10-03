import {fetchWithTimeout} from './request-timeout';
import {usageRoute, type UsageEvent, type UsageEventName} from './usage-contract';
import type {Bank} from './question-bank';

const endpoint = 'https://bill-biology-admin.betoadfish.workers.dev/events/usage';
const sessionKey = 'bill-anonymous-session-v1';
const sessionGapMs = 30 * 60 * 1000;
let memorySession: {id: string; last: number} | null = null;

function sessionId() {
  const now = Date.now();
  try {
    const stored = JSON.parse(sessionStorage.getItem(sessionKey) || 'null');
    if (stored && /^[a-f0-9-]{36}$/.test(stored.id) && Number.isFinite(stored.last)) memorySession = stored;
  } catch { /* A blocked storage API must not affect the website. */ }
  if (!memorySession || now - memorySession.last > sessionGapMs || memorySession.last > now) memorySession = {id: crypto.randomUUID(), last: now};
  memorySession.last = now;
  try { sessionStorage.setItem(sessionKey, JSON.stringify(memorySession)); } catch {}
  return memorySession.id;
}

export function analyticsEnabled() {
  return typeof location !== 'undefined' && location.origin === 'https://betoadfish.github.io'
    && navigator.doNotTrack !== '1' && !(navigator as Navigator & {globalPrivacyControl?: boolean}).globalPrivacyControl;
}

export function trackUsage(event: UsageEventName, details: Pick<UsageEvent, 'bank' | 'kind' | 'duration_ms'> = {}, pathname?: string, eventId?: string) {
  try {
    if (!analyticsEnabled()) return;
    const route = usageRoute(pathname ?? location.pathname);
    if (!route) return;
    const payload: UsageEvent = {event_id: eventId || crypto.randomUUID(), session_id: sessionId(), event, ...route, viewport: matchMedia('(max-width: 767px)').matches ? 'small' : 'large', ...details};
    // Fire and forget: a blocked collection host never delays a page or export.
    void fetchWithTimeout(endpoint, {method: 'POST', headers: {'Content-Type': 'application/json'}, body: JSON.stringify(payload), credentials: 'omit', referrerPolicy: 'no-referrer', keepalive: true}, 4000).catch(() => {});
  } catch { /* Unsupported crypto/storage/network must never break a user action. */ }
}

export function trackBankEvent(event: Exclude<UsageEventName, 'page_view' | 'page_active'>, bank: Bank, options: {kind?: 'qp' | 'ms'; eventId?: string} = {}) {
  trackUsage(event, {bank, ...(options.kind ? {kind: options.kind} : {})}, undefined, options.eventId);
}
