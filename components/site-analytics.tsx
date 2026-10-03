'use client';
import {useEffect} from 'react';
import {usePathname} from 'next/navigation';
import {analyticsEnabled, trackUsage} from '@/lib/site-analytics';

export function SiteAnalytics() {
  const pathname = usePathname();
  useEffect(() => {
    if (!pathname || !analyticsEnabled()) return;
    let started = false;
    let visibleSince: number | null = null;
    // React's development effect replay cancels this before it can double count.
    const start = window.setTimeout(() => {
      started = true;
      trackUsage('page_view', {}, pathname);
      visibleSince = document.visibilityState === 'visible' ? performance.now() : null;
    }, 0);
    const flush = () => {
      if (!started || visibleSince === null) return;
      const now = performance.now();
      // Throttled timers / a sleeping device must not produce hours of dwell time.
      const duration_ms = Math.min(60_000, Math.max(0, Math.round(now - visibleSince)));
      visibleSince = document.visibilityState === 'visible' ? now : null;
      if (duration_ms >= 1000) trackUsage('page_active', {duration_ms}, pathname);
    };
    const visibility = () => {
      if (document.visibilityState === 'hidden') flush();
      else if (started) visibleSince = performance.now();
    };
    const pagehide = () => { flush(); visibleSince = null; };
    const pageshow = (event: PageTransitionEvent) => {
      if (event.persisted) { trackUsage('page_view', {}, pathname); visibleSince = performance.now(); }
    };
    const timer = window.setInterval(flush, 30_000);
    document.addEventListener('visibilitychange', visibility);
    window.addEventListener('pagehide', pagehide);
    window.addEventListener('pageshow', pageshow);
    return () => {
      window.clearTimeout(start);
      window.clearInterval(timer);
      flush();
      document.removeEventListener('visibilitychange', visibility);
      window.removeEventListener('pagehide', pagehide);
      window.removeEventListener('pageshow', pageshow);
    };
  }, [pathname]);
  return null;
}
