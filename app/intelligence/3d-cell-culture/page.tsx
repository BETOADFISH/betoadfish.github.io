import { CaseShell } from '@/components/case-shell';
import { CultureExplorer } from '@/components/culture-explorer';
import content from '@/lib/culture-content.json';
export const metadata = { title: '3D cell culture | Bill Huang', description: 'Technical due diligence on culture platforms, biological validation and practical laboratory requirements.' };
export default function Culture(){return <CaseShell theme="culture" category="Biotech intelligence" title={content.title} subtitle={content.subtitle} role={content.role} date={content.date} institution="Private equity internship" summary={content.summary}>
 {content.sections.slice(0,3).map((s,i)=><section className="editorial-section editorial-grid" key={s.heading}><div><p className="eyebrow">0{i+1} / Technology assessment</p><h2>{s.heading}</h2></div><p>{s.body}</p></section>)}<CultureExplorer/>
 <section className="editorial-section editorial-grid"><div><p className="eyebrow">Findings</p><h2>{content.sections[3].heading}</h2></div><div><p>{content.sections[3].body}</p><p>{content.sections[4].body}</p></div></section>
 <details className="source-disclosure"><summary>Sources and scope</summary><p>Two original project reports: an overview of 3D culture methods and a comparison of seven product platforms. Role and dates follow the personal CV; the review process is also described in the personal project account.</p><p>The public case groups products by material family and omits business identities. It describes documentary research, not laboratory benchmarking. Indicative historic prices and unverified claims of an investment outcome are excluded.</p></details>
 </CaseShell>;}
