 'use client';
import { useId } from 'react';
import { Network } from 'lucide-react';
import { useSite } from './site-context';
const marks: Record<string, { src: string; name: string }> = {
  hubisco: { src: '/brands/cambridge-line.png', name: 'University of Cambridge' },
  pet: { src: '/brands/portsmouth-line.png', name: 'University of Portsmouth' },
  mcr: { src: '/brands/melbourne-line.png', name: 'University of Melbourne' },
  culture: { src: '/brands/dynamax-line.png', name: 'Shanghai Dynamax Group' },
};
export function InstitutionMark({ theme }: { theme: string }) {
  const { tr } = useSite();
  const uid = useId().replace(/:/g, '');
  const mark = marks[theme];
  return mark ? <div className={`institution-mark line-mark line-mark-${theme}`}><svg viewBox="0 0 1254 1254" role="img" aria-label={tr(mark.name)}><defs><mask id={`ink-${uid}`} maskUnits="userSpaceOnUse" x="0" y="0" width="1254" height="1254" style={{maskType:'luminance'}}><image href={mark.src} width="1254" height="1254" style={{filter:'invert(1)'}}/></mask></defs><rect x="0" y="0" width="1254" height="1254" fill="currentColor" mask={`url(#ink-${uid})`}/></svg></div> : <div className="institution-mark anonymous-mark"><Network strokeWidth={1.1}/></div>;
}
