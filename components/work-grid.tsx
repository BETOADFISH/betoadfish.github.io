'use client';
import { Copy, SiteLink, useSite } from '@/components/site-context';
import { ArrowUpRight } from 'lucide-react';
import { InstitutionMark } from './institution-mark';
import { work } from '@/lib/work';
export function WorkGrid({ category }: {
    category?: string;
}) {
    const { tr } = useSite();
    return <div className="work-grid">{work.filter(w => !category || w.category === category).sort((a,b)=>b.start.localeCompare(a.start)).map((w, i) => {
            return <SiteLink className={`work-card theme-${w.theme}`} href={w.path} key={w.slug}><div className="work-art"><span className="work-number" aria-hidden="true">0<Copy>{i + 1}</Copy></span><InstitutionMark theme={w.theme}/></div><div className="work-copy"><div className="work-meta"><span><Copy>{w.category}</Copy> / <Copy>{w.year}</Copy></span><ArrowUpRight size={19}/></div><h3><Copy>{w.title}</Copy></h3><p className="work-question"><Copy>{w.question}</Copy></p><p className="small muted"><Copy>{w.detail}</Copy></p></div></SiteLink>;
        })}</div>;
}
