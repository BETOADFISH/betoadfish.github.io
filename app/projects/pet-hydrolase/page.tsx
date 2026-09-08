import { Copy, SiteLink } from '@/components/site-context';
import { CaseShell } from '@/components/case-shell';
import { ProjectIntro } from '@/components/project-intro';
import { PetJourney } from '@/components/case-journeys';
import story from '@/lib/pet-hydrolase-story.json';
import { t } from '@/lib/bilingual';
export const metadata = { title: 'PET hydrolases | Bill Huang', alternates: { canonical: 'https://betoadfish.github.io/projects/pet-hydrolase', languages: { en: 'https://betoadfish.github.io/projects/pet-hydrolase', 'zh-CN': 'https://betoadfish.github.io/zh/projects/pet-hydrolase' } } };
export default function PET() {
 return <CaseShell theme="pet" title={story.title} subtitle={story.subtitle} role={story.role} date={story.date} institution={story.institution} summary={story.summary}>
 <ProjectIntro title={story.introTitle} lead={story.introLead} items={story.introItems}/>
 <p className="reference-link"> <SiteLink href="https://researchportal.port.ac.uk/en/publications/a-flexible-kinetic-assay-efficiently-sorts-prospective-biocatalys/" target="_blank" rel="noreferrer"><Copy>{t('Background: a kinetic assay for BHET hydrolysis ↗','研究背景：BHET 水解的动力学检测方法 ↗')}</Copy></SiteLink></p>
 <PetJourney/>
 <section className="editorial-section editorial-grid"><h2><Copy>{t('My contribution','我的工作')}</Copy></h2><p><Copy>{story.contribution}</Copy></p></section>
</CaseShell>;
}
