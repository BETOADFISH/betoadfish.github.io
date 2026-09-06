'use client';
import { useEffect } from 'react';
export function MotionEnhancement() {
  useEffect(() => {
    if (matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    const nodes = document.querySelectorAll(
      '.reveal,.workflow-step,.approach-steps>div',
    );
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) {
            e.target.classList.add('in-view');
            observer.unobserve(e.target);
          }
        });
      },
      { threshold: 0.08 },
    );
    nodes.forEach((n) => {
      n.classList.add('motion-ready');
      observer.observe(n);
    });
    return () => {
      observer.disconnect();
      nodes.forEach((n) => n.classList.remove('motion-ready'));
    };
  }, []);
  return null;
}
