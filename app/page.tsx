import { Copy, SiteLink } from '@/components/site-context';
import { ArrowUpRight, ArrowRight } from 'lucide-react';
import { StructureViewer } from '@/components/structure-viewer';
import { WorkGrid } from '@/components/work-grid';
export default function Home() {
    return (<main>

      <section className="hero wrap home-hero">
        <div>
          <p className="eyebrow">
            <span className="status-dot"/><Copy>{"Bill Huang / Cambridge"}</Copy></p>
          <h1><Copy>{"Biochemistry"}</Copy><br /><Copy>{"and "}</Copy><span className="highlight"><Copy>{"biotechnology."}</Copy></span></h1>
          <p className="hero-description"><Copy>{"I study enzymes and antimicrobial systems, and assess the evidence behind emerging biotechnology. This portfolio documents my experiments, the decisions I made and the questions that remain."}</Copy></p>
          <div className="actions">
            <SiteLink className="button primary" href="/projects"><Copy>{"Explore my research"}</Copy><ArrowUpRight size={19}/>
            </SiteLink>
            <SiteLink className="text-link" href="#approach"><Copy>{"My scientific approach"}</Copy><ArrowRight size={18}/>
            </SiteLink>
          </div>
          <p className="hero-index"><Copy>{"01 / RESEARCH PORTFOLIO"}</Copy><span><Copy>{"Structure \u2192 Evidence \u2192 Decision"}</Copy></span>
          </p>
        </div>
        <div className="hero-art">
          <div className="art-heading">
            <span className="eyebrow"><Copy>{"A closer look at the active site"}</Copy></span>
            <ArrowUpRight size={20}/>
          </div>
          <StructureViewer compact/>
          <div className="art-caption">
            <span>
              <b><Copy>{"HuBisCO"}</Copy></b>
              <br /><Copy>{"A question of molecular compatibility."}</Copy></span>
            <span className="tiny"><Copy>{"STRUCTURE-GUIDED"}</Copy><br /><Copy>{"ENZYME ENGINEERING"}</Copy></span>
          </div>
        </div>
      </section>
      <div className="discipline-strip">
        <div className="wrap">
          <Copy>{[
        'Biochemistry',
        'Enzymology',
        'Protein engineering',
        'Structural biology',
        'Data analysis',
    ].map((x) => (<span key={x}><Copy>{x}</Copy></span>))}</Copy>
        </div>
      </div>
      <section className="section wrap" id="projects"><div className="section-heading"><div><p className="eyebrow"><Copy>{"Selected work"}</Copy></p><h2><Copy>{"Questions I have worked on."}</Copy></h2></div><p><Copy>{"Each case follows a different part of my work, with the relevant experimental or analytical evidence."}</Copy></p></div><WorkGrid /></section>
      <section className="section approach-section" id="approach">
        <div className="wrap">
          <p className="eyebrow"><Copy>{"02 / How I work"}</Copy></p>
          <div className="section-heading">
            <h2><Copy>{"How I approach"}</Copy><br /><Copy>{"an uncertain result."}</Copy></h2>
            <p><Copy>{"I revisit the controls, the measurement and the assumptions."}</Copy><br /><Copy>{"Then I decide what the result can support."}</Copy></p>
          </div>
          <div className="approach-steps">
            <Copy>{[
        ['Question', 'Define the biochemical problem.'],
        ['Hypothesis', 'Connect molecular geometry to a testable idea.'],
        [
            'Experiment',
            'Choose controls that separate possible explanations.',
        ],
        ['Evidence', 'Make the measured result inspectable.'],
        ['Interpretation', 'Separate observation from inference.'],
        [
            'Next decision',
            'Identify the experiment that reduces uncertainty.',
        ],
    ].map(([t, b], i) => (<div key={t}>
                <span className="step-number">0<Copy>{i + 1}</Copy></span>
                <h3><Copy>{t}</Copy></h3>
                <p><Copy>{b}</Copy></p>
              </div>))}</Copy>
          </div>
        </div>
      </section>
      <section className="section wrap about-grid" id="about">
        <div>
          <p className="eyebrow"><Copy>{"03 / About"}</Copy></p>
          <h2><Copy>{"A background in"}</Copy><br /><Copy>{"experimental science."}</Copy></h2>
        </div>
        <div>
          <p><Copy>{"I\u2019m Bill Huang, a Cambridge Natural Sciences graduate with a background in biochemistry. My experience spans enzyme engineering, antimicrobial research, molecular recognition and biotechnology due diligence. I connect experimental work with structural reasoning to evaluate evidence and guide the next scientific decision."}</Copy></p>
          <p><Copy>{"My featured project in the Prywes Lab explores alternative sugar-phosphate chemistry in a RuBisCO-based experimental system. Previous research placements took me to Melbourne, Portsmouth and Xiamen. I also developed a biotechnology evaluation framework during a private-equity internship."}</Copy></p>
          <div className="bio-meta">
            <span><Copy>{"Research context"}</Copy></span>
            <strong><Copy>{"University of Cambridge"}</Copy><br /><Copy>{"Department of Biochemistry \u00B7 Prywes Lab"}</Copy></strong>
          </div>
          <p className="small muted"><Copy>{"BA Natural Sciences, Cambridge \u00B7 2023\u20132026. Planned MSci Biochemistry, Cambridge \u00B7 October 2026\u2013July 2027."}</Copy></p>
          <SiteLink className="button primary" href="/downloads/Bill-Huang-CV.pdf" download><Copy>{"Download CV"}</Copy><ArrowUpRight size={18}/>
          </SiteLink>
        </div>
      </section>
    </main>);
}
