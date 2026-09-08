 'use client';
import paths from '@/lib/brand-paths.json';
import { useSite } from './site-context';
const marks={hubisco:['cambridge','University of Cambridge'],pet:['portsmouth','University of Portsmouth'],mcr:['melbourne','University of Melbourne'],culture:['dynamax','Shanghai Dynamax Group'],yidu:['yidu','Yidu']} as const;
export function InstitutionMark({theme}:{theme:string}){
 const {tr}=useSite();const mark=marks[theme as keyof typeof marks];if(!mark)return null;const art=paths[mark[0]];
 return <div className={`institution-mark line-mark line-mark-${theme}`}><svg viewBox={art.viewBox} role="img" aria-label={tr(mark[1])}><path d={art.path} fill="currentColor"/></svg></div>;
}
