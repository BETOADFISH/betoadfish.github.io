'use client';
import { Network } from 'lucide-react';
import { Copy, useSite } from './site-context';
const marks: Record<string, { src: string; name: string }> = {
  hubisco: { src: '/brands/cambridge.png', name: 'University of Cambridge' },
  pet: { src: '/brands/portsmouth.png', name: 'University of Portsmouth' },
  mcr: { src: '/brands/melbourne.jpg', name: 'University of Melbourne' },
};
export function InstitutionMark({ theme }: { theme: string }) {
  const { tr } = useSite();
  const mark = marks[theme];
  if (theme === 'culture') return <div className="institution-mark"><svg viewBox="0 0 240 76" role="img" aria-label={tr('Shanghai Dynamax Group')}><image href="/brands/dynamax-header.jpg" width="1003" height="130"/></svg></div>;
  return mark ? <div className="institution-mark"><img src={mark.src} alt={tr(mark.name)} loading="lazy"/></div> : <div className="institution-mark anonymous-mark"><Network strokeWidth={1.1}/><span><Copy>Private equity</Copy></span></div>;
}
