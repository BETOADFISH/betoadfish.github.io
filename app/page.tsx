import { Copy, SiteLink } from '@/components/site-context';
import { ArrowUpRight } from 'lucide-react';
import { CVDownloads } from '@/components/cv-downloads';
import { t } from '@/lib/bilingual';
import { WorkGrid } from '@/components/work-grid';
export default function Home(){return <main className="portfolio-home">
 <section className="wrap personal-opening">
  <div className="personal-intro"><p className="personal-location"><Copy>{t('Biochemistry, Cambridge','生物化学 · 剑桥')}</Copy></p><h1>Bill Huang</h1>
   <p className="personal-lead"><Copy>{t('I work on enzymes and antimicrobial research. I also study how biotechnology is used in laboratories and healthcare.','我做酶工程和抗菌研究，也关注生物技术在实验室与医疗中的应用。')}</Copy></p>
   <p><Copy>{t('Here are my research projects, consulting work and a biology question tool I built for teaching.','这里收录了我的科研项目、咨询工作，以及为教学制作的生物题库。')}</Copy></p>
   <div className="personal-links"><SiteLink href="#projects"><Copy>{t('Browse projects','浏览项目')}</Copy><ArrowUpRight size={18}/></SiteLink><SiteLink href="/tools/biology"><Copy>{t('Open the question bank','打开生物题库')}</Copy></SiteLink></div>
  </div>
  <figure className="opening-figure theme-hubisco"><SiteLink href="/projects/hubisco" aria-label="HuBisCO"><img src="/I164-S368-interaction.webp" width="1600" height="1000" alt="RuBisCO active-site molecular illustration" fetchPriority="high"/></SiteLink><figcaption><div><span><Copy>{t('Cambridge · HuBisCO','剑桥大学 · HuBisCO')}</Copy></span><p><Copy>{t('Exploring a six-carbon substrate for RuBisCO.','探索 RuBisCO 对六碳底物的容纳。')}</Copy></p><small><Copy>{t('Active-site illustration used in the project.','项目中的活性位点示意图。')}</Copy></small></div><SiteLink href="/projects/hubisco" aria-label="HuBisCO"><ArrowUpRight size={22}/></SiteLink></figcaption></figure>
 </section>
 <section className="wrap portfolio-collection" id="projects"><div className="collection-heading"><h2><Copy>{t('Research','科研项目')}</Copy></h2><p><Copy>{t('Protein production, enzyme design and bacterial membranes.','蛋白制备、酶设计与细菌细胞膜。')}</Copy></p></div><WorkGrid category="Research"/></section>
 <section className="wrap portfolio-collection"><div className="collection-heading"><h2><Copy>{t('Consulting and analysis','咨询与分析')}</Copy></h2><p><Copy>{t('Technology due diligence and clinician interview research.','技术尽调与医生访谈研究。')}</Copy></p></div><WorkGrid category="Biotech intelligence"/></section>
 <section className="wrap portfolio-collection"><div className="collection-heading"><h2><Copy>{t('Tools','工具')}</Copy></h2></div><WorkGrid category="Tools"/></section>
 <section className="wrap personal-background" id="about"><div><h2><Copy>{t('About me','关于我')}</Copy></h2></div><div><p><Copy>{t('I studied Natural Sciences at Cambridge, specialising in biochemistry. In the Prywes Lab, I worked on alternative sugar-phosphate substrates for RuBisCO. My earlier research placements took me to Melbourne, Portsmouth and Xiamen.','我在剑桥大学学习自然科学，主修生物化学。在 Prywes 实验室，我研究了 RuBisCO 的替代糖磷酸底物；此前也在墨尔本、朴茨茅斯和厦门参与过科研项目。')}</Copy></p><p><Copy>{t('Alongside laboratory work, I have worked on biotechnology due diligence and healthcare consulting. I build biology teaching materials and tools from the questions I encounter in lessons.','实验室工作之外，我做过生物技术尽调和医药咨询，也会根据教学中遇到的问题整理生物资料、制作工具。')}</Copy></p><p className="small muted"><Copy>{t('BA Natural Sciences, Cambridge, 2023–2026. Planned MSci Biochemistry, October 2026–July 2027.','剑桥大学自然科学学士，2023–2026。计划于 2026 年 10 月至 2027 年 7 月攻读生物化学 MSci。')}</Copy></p><CVDownloads/></div></section>
</main>;}
