// Only bounded categories cross the analytics boundary. Never add URL queries,
// search strings, question IDs, referrers, addresses, or account identifiers here.
export const usageRoutes = ['/', '/projects', '/projects/pet-hydrolase', '/projects/mcr1-colistin', '/projects/hubisco', '/intelligence', '/intelligence/yidu', '/intelligence/3d-cell-culture', '/tools', '/tools/biology'] as const;
export const usageEvents = ['page_view', 'page_active', 'bank_open', 'bank_loaded', 'bank_error', 'question_preview', 'filter_apply', 'random_generated', 'export_started', 'export_success', 'export_error'] as const;
export type UsageEventName = typeof usageEvents[number];
export type UsageRoute = typeof usageRoutes[number];
export type UsageEvent = {
  event_id: string;
  session_id: string;
  event: UsageEventName;
  path: UsageRoute;
  language: 'en' | 'zh';
  viewport: 'small' | 'large';
  bank?: 'edexcel' | 'aqa' | 'cie' | 'esat';
  kind?: 'qp' | 'ms';
  duration_ms?: number;
};

export function usageRoute(pathname: string): {path: UsageRoute; language: 'en' | 'zh'} | null {
  const language = /^\/zh(?:\/|$)/.test(pathname) ? 'zh' : 'en';
  const path = (pathname.replace(/^\/zh(?=\/|$)/, '').replace(/\/+$/, '') || '/') as UsageRoute;
  return usageRoutes.includes(path) ? {path, language} : null;
}
