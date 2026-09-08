import { Copy, SiteLink } from '@/components/site-context';
import { CaseShell } from '@/components/case-shell';
import { ProjectIntro } from '@/components/project-intro';
import { MembraneProtocol } from '@/components/project-highlights';
import { McrJourney } from '@/components/case-journeys';
import story from '@/lib/mcr1-colistin-story.json';
import { t } from '@/lib/bilingual';
export const metadata = { title: 'Colistin adjuvants | Bill Huang', alternates: { canonical: 'https://betoadfish.github.io/projects/mcr1-colistin', languages: { en: 'https://betoadfish.github.io/projects/mcr1-colistin', 'zh-CN': 'https://betoadfish.github.io/zh/projects/mcr1-colistin' } } };
export default function MCR() {
 return <CaseShell theme="mcr" title={story.title} subtitle={story.subtitle} role={story.role} date={story.date} institution={story.institution} summary={story.summary}>
 <ProjectIntro title={story.introTitle} lead={story.introLead} items={story.introItems}/>
 <p className="reference-link"> <SiteLink href="https://www.nature.com/articles/srep39392" target="_blank" rel="noreferrer"><Copy>{t('Background: structural study of MCR-1 (2016) ↗','研究背景：MCR-1 结构研究（2016）↗')}</Copy></SiteLink></p>
 <section className="featured-workbench"><p className="eyebrow"><Copy>{t("The experimental system / three complementary readouts","实验体系 / 三种互补读数")}</Copy></p><MembraneProtocol/></section><McrJourney/>
 <section className="editorial-section editorial-grid"><h2><Copy>{t('My contribution','我的工作')}</Copy></h2><p><Copy>{story.contribution}</Copy></p></section>
</CaseShell>;
}
