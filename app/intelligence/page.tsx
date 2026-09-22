import { t } from '@/lib/bilingual';
import { Copy, SiteLink } from '@/components/site-context';
import { WorkGrid } from '@/components/work-grid';
export const metadata = { title: 'Biotech intelligence | Bill Huang', description: 'Technology assessment, biological validation and the practical constraints on adoption.', alternates: { canonical: 'https://betoadfish.github.io/intelligence', languages: { en: 'https://betoadfish.github.io/intelligence', 'zh-CN': 'https://betoadfish.github.io/zh/intelligence' } } };
export default function Directory() { return <main className="wrap directory-page"><p className="eyebrow"><Copy>{"Biotech intelligence"}</Copy></p><h1><Copy>{t('Biotech and healthcare research','生物技术与医药研究')}</Copy></h1><p className="directory-intro"><Copy>{t('Two projects: technology due diligence and clinical interview analysis.','两个项目：技术尽调，以及医生访谈与证据整理。')}</Copy></p><WorkGrid category="Biotech intelligence"/></main>; }
