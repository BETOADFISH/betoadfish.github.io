import {Copy} from '@/components/site-context';
import {WorkGrid} from '@/components/work-grid';
import {t} from '@/lib/bilingual';
export const metadata={title:'Tools | Bill Huang',description:'Tools I build for teaching and learning.'};
export default function Tools(){return <main className="section wrap"><div className="section-heading"><div><p className="eyebrow"><Copy>{t('TOOLS & TEACHING','工具与教学')}</Copy></p><h1><Copy>{t('Things I use in class.','课堂上用得上的工具。')}</Copy></h1></div><p><Copy>{t('Built around the small tasks that take time.','把备课时费时间的小事做得顺手一些。')}</Copy></p></div><WorkGrid category="Tools"/></main>;}
