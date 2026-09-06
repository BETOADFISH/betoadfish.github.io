import { Copy, SiteLink } from '@/components/site-context';
import { CaseShell } from '@/components/case-shell';
import { CultureExplorer } from '@/components/culture-explorer';
import content from '@/lib/culture-content.json';
export const metadata = { title: '3D cell culture | Bill Huang', description: 'Technical due diligence on culture platforms, biological validation and practical laboratory requirements.', alternates: { canonical: 'https://betoadfish.github.io/intelligence/3d-cell-culture', languages: { en: 'https://betoadfish.github.io/intelligence/3d-cell-culture', 'zh-CN': 'https://betoadfish.github.io/zh/intelligence/3d-cell-culture' } } };
export default function Culture() {
    return <CaseShell theme="culture" category="Biotech intelligence" title={content.title} subtitle={content.subtitle} role={content.role} date={content.date} institution="Shanghai Dynamax Group · Private equity internship" summary={content.summary}>
 <Copy>{content.sections.slice(0, 3).map((s, i) => <section className="editorial-section editorial-grid" key={s.heading}><div><p className="eyebrow">0<Copy>{i + 1}</Copy>{' '}<Copy>{"/ Technology assessment"}</Copy></p><h2><Copy>{s.heading}</Copy></h2></div><p><Copy>{s.body}</Copy></p></section>)}</Copy><CultureExplorer />
 <section className="editorial-section editorial-grid"><div><p className="eyebrow"><Copy>{"Findings"}</Copy></p><h2><Copy>{content.sections[3].heading}</Copy></h2></div><div><p><Copy>{content.sections[3].body}</Copy></p><p><Copy>{content.sections[4].body}</Copy></p></div></section>
 <details className="source-disclosure"><summary><Copy>{"Sources and scope"}</Copy></summary><p><Copy>{"Two original project reports: an overview of 3D culture methods and a comparison of seven product platforms. Role and dates follow the personal CV; the review process is also described in the personal project account."}</Copy></p><p><Copy>{"The public case groups products by material family and omits the assessed business’s identity. It describes documentary research, not laboratory benchmarking. Indicative historic prices and unverified claims of an investment outcome are excluded."}</Copy></p></details>
 </CaseShell>;
}
