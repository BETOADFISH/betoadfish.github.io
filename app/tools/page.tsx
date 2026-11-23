import {Copy} from '@/components/site-context';
import {WorkGrid} from '@/components/work-grid';
import {ToolsPreview} from '@/components/tools-preview';
import {t} from '@/lib/bilingual';
export const metadata={title:'Tools | Bill Huang',description:'Tools I build for teaching and learning.'};
export default function Tools(){return <main className="section wrap"><div className="section-heading"><div><p className="eyebrow"><Copy>{t('TOOLS','工具')}</Copy></p><h1><Copy>{t('Tools','工具')}</Copy></h1></div><p><Copy>{t('Explore biology questions and simulated experiments.','练习生物题目，探索模拟实验。')}</Copy></p></div><ToolsPreview/><WorkGrid category="Tools"/></main>;}
