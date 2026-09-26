'use client';
import { Copy, SiteLink } from '@/components/site-context';
import { ArrowUpRight, BookOpen } from 'lucide-react';
import { InstitutionMark } from './institution-mark';
import { work } from '@/lib/work';
import { t } from '@/lib/bilingual';
const institutions={hubisco:t('Cambridge','剑桥大学'),pet:t('Portsmouth','朴茨茅斯大学'),mcr:t('Melbourne','墨尔本大学'),culture:t('Shanghai Dynamax','上海冠亚投资'),yidu:t('Yidu','医渡科技'),tools:t('Biology','生物学')};
export function WorkGrid({category}:{category?:string}){
 return <div className="work-grid portfolio-work-grid">{work.filter(w=>!category||w.category===category).sort((a,b)=>b.start.localeCompare(a.start)).map(w=><SiteLink className={`work-card theme-${w.theme}${w.theme==='hubisco'||w.theme==='tools'?' work-card-wide':''}`} href={w.path} key={w.slug}>
  <div className="work-art">{w.theme==='tools'?<BookOpen size={52} strokeWidth={1.4}/>:<InstitutionMark theme={w.theme}/>}</div>
  <div className="work-copy"><div className="work-meta"><span><Copy>{institutions[w.theme]}</Copy> · <Copy>{w.field}</Copy></span><ArrowUpRight size={19}/></div><h3><Copy>{w.title}</Copy></h3><p className="work-question"><Copy>{w.question}</Copy></p><p className="small muted"><Copy>{w.detail}</Copy></p><span className="work-date"><Copy>{w.year}</Copy></span></div>
 </SiteLink>)}</div>;
}
