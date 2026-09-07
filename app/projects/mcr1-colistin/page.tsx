import { Copy, SiteLink } from '@/components/site-context';
import { CaseShell } from '@/components/case-shell';
import { ProjectIntro } from '@/components/project-intro';
import { McrExplorer } from '@/components/mcr-explorer';
import story from '@/lib/mcr1-colistin-story.json';
import { t } from '@/lib/bilingual';
export const metadata = { title: 'Colistin adjuvants | Bill Huang', alternates: { canonical: 'https://betoadfish.github.io/projects/mcr1-colistin', languages: { en: 'https://betoadfish.github.io/projects/mcr1-colistin', 'zh-CN': 'https://betoadfish.github.io/zh/projects/mcr1-colistin' } } };
export default function MCR() {
 return <CaseShell theme="mcr" title={story.title} subtitle={story.subtitle} role={story.role} date={story.date} institution={story.institution} summary={story.summary}>
 <ProjectIntro title={story.introTitle} lead={story.introLead} items={story.introItems}/>
 <p className="reference-link"> <SiteLink href="https://www.nature.com/articles/srep39392" target="_blank" rel="noreferrer"><Copy>{t('Background: structural study of MCR-1 (2016) ↗','研究背景：MCR-1 结构研究（2016）↗')}</Copy></SiteLink></p>
 {story.steps.map(([label,title,body],i)=><section className="editorial-section" key={i}><div className="editorial-grid"><div><p className="eyebrow"><Copy>{label}</Copy></p><h2><Copy>{title}</Copy></h2></div><p><Copy>{body}</Copy></p></div>{i===0&&<McrExplorer/ >}</section>)}
 <section className="editorial-section editorial-grid"><h2><Copy>{t('My contribution','我的工作')}</Copy></h2><p><Copy>{story.contribution}</Copy></p></section>
</CaseShell>;
}
