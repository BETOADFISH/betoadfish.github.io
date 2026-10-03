'use client';

import { useEffect, useRef, useState } from 'react';
import { useSite } from './site-context';

/** Keep animation clocks idle outside the viewport or in a background tab. */
export function useMotionPlayback<T extends HTMLElement = HTMLDivElement>(autoplay = true) {
  const ref = useRef<T>(null);
  const { motionPaused } = useSite();
  const [playing, setPlaying] = useState(autoplay);
  const [visible, setVisible] = useState(false);
  const [foreground, setForeground] = useState(false);
  const [reduced, setReduced] = useState(true);

  useEffect(() => {
    const preference = window.matchMedia('(prefers-reduced-motion: reduce)');
    const updatePreference = () => setReduced(preference.matches);
    const updateVisibility = () => setForeground(!document.hidden);
    const observer = new IntersectionObserver(([entry]) => setVisible(entry.isIntersecting), { threshold: 0.08 });
    if (ref.current) observer.observe(ref.current);
    updatePreference();
    updateVisibility();
    preference.addEventListener('change', updatePreference);
    document.addEventListener('visibilitychange', updateVisibility);
    return () => {
      observer.disconnect();
      preference.removeEventListener('change', updatePreference);
      document.removeEventListener('visibilitychange', updateVisibility);
    };
  }, []);

  const allowed = !motionPaused && !reduced;
  return { ref, playing, setPlaying, reduced, allowed, running: playing && allowed && visible && foreground };
}
