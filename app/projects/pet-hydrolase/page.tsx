import { Copy, SiteLink } from '@/components/site-context';
import { CaseShell } from '@/components/case-shell';
import { ProjectIntro } from '@/components/project-intro';
import { PetExplorer } from '@/components/pet-explorer';
import story from '@/lib/pet-hydrolase-story.json';
import { t } from '@/lib/bilingual';
export const metadata = { title: 'PET hydrolases | Bill Huang', alternates: { canonical: 'https://betoadfish.github.io/projects/pet-hydrolase', languages: { en: 'https://betoadfish.github.io/projects/pet-hydrolase', 'zh-CN': 'https://betoadfish.github.io/zh/projects/pet-hydrolase' } } };
export default function PET() {
 return <CaseShell theme="pet" title={story.title} subtitle={story.subtitle} role={story.role} date={story.date} institution={story.institution} summary={story.summary}>
 <ProjectIntro title={story.introTitle} lead={story.introLead} items={story.introItems}/>
 {story.steps.map(([label,title,body],i)=><section className="editorial-section" key={i}><div className="editorial-grid"><div><p className="eyebrow"><Copy>{label}</Copy></p><h2><Copy>{title}</Copy></h2></div><p><Copy>{body}</Copy></p></div>{i===3&&<PetExplorer/ >}</section>)}
 <section className="editorial-section editorial-grid"><h2><Copy>{t('My contribution','我的工作')}</Copy></h2><p><Copy>{story.contribution}</Copy></p></section>
 <details className="source-disclosure"><summary><Copy>{t('Sources and scope','资料来源与说明')}</Copy></summary><p><Copy>{story.source}</Copy></p>
 <SiteLink href="https://researchportal.port.ac.uk/en/publications/a-flexible-kinetic-assay-efficiently-sorts-prospective-biocatalys/" target="_blank" rel="noreferrer"><Copy>{t('Background: a kinetic assay for BHET hydrolysis ↗','研究背景：BHET 水解的动力学检测方法 ↗')}</Copy></SiteLink></details></CaseShell>;
}
