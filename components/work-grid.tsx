import { ArrowUpRight, Atom, FlaskConical, Microscope, Network } from 'lucide-react';
import { work } from '@/lib/work';
const icons = { hubisco: Atom, pet: FlaskConical, mcr: Microscope, culture: Network };
export function WorkGrid({ category }: { category?: string }) {
 return <div className="work-grid">{work.filter(w => !category || w.category === category).map((w, i) => { const Icon = icons[w.theme];
 return <a className={`work-card theme-${w.theme}`} href={w.path} key={w.slug}><div className="work-art" aria-hidden="true"><span className="work-number">0{i + 1}</span><Icon size={94} strokeWidth={0.8}/><span>{w.field}</span></div><div className="work-copy"><div className="work-meta"><span>{w.category} / {w.year}</span><ArrowUpRight size={19}/></div><h3>{w.title}</h3><p className="work-question">{w.question}</p><p className="small muted">{w.detail}</p></div></a>; })}</div>;
}
