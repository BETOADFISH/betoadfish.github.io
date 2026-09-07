import { Copy } from './site-context';
import { t, type CopyText } from '@/lib/bilingual';
export function ProjectIntro({ title, lead, items }: { title: CopyText; lead: CopyText; items: { title: CopyText; body: CopyText }[] }) {
  return <section id="intro" className="project-intro editorial-section"><p className="eyebrow"><Copy>{t('Introduction / The starting point', '项目背景')}</Copy></p><h2><Copy>{title}</Copy></h2><p className="intro-lead"><Copy>{lead}</Copy></p><div className="intro-grid">{items.map((item, index) => <article key={index}><span className="intro-number">0{index + 1}</span><h3><Copy>{item.title}</Copy></h3><p><Copy>{item.body}</Copy></p></article>)}</div></section>;
}
