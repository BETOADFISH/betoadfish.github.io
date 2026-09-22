import {Copy} from '@/components/site-context';
import {WorkGrid} from '@/components/work-grid';
import {t} from '@/lib/bilingual';
export const metadata={title:'Tools | Bill Huang',description:'Tools I build for teaching and learning.'};
export default function Tools(){return <main className="section wrap"><div className="section-heading"><div><p className="eyebrow"><Copy>{t('TOOLS','工具')}</Copy></p><h1><Copy>{t('Teaching tools','教学工具')}</Copy></h1></div><p><Copy>{t('Choose biology questions and download practice papers.','按知识点选题，下载练习和答案。')}</Copy></p></div><WorkGrid category="Tools"/></main>;}
