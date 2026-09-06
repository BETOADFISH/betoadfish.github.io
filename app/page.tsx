import { ArrowUpRight, ArrowRight } from 'lucide-react';
import { StructureViewer } from '@/components/structure-viewer';
import { WorkGrid } from '@/components/work-grid';
export default function Home() {
  return (
    <main>

      <section className="hero wrap home-hero">
        <div>
          <p className="eyebrow">
            <span className="status-dot" /> Bill Huang / Cambridge
          </p>
          <h1>Biochemistry<br />and <span className="highlight">biotechnology.</span></h1>
          <p className="hero-description">I study enzymes and antimicrobial systems, and assess the evidence behind emerging biotechnology. This portfolio documents my experiments, the decisions I made and the questions that remain.</p>
          <div className="actions">
            <a className="button primary" href="/projects">
              Explore my research <ArrowUpRight size={19} />
            </a>
            <a className="text-link" href="#approach">
              My scientific approach <ArrowRight size={18} />
            </a>
          </div>
          <p className="hero-index">
            01 / RESEARCH PORTFOLIO <span>Structure → Evidence → Decision</span>
          </p>
        </div>
        <div className="hero-art">
          <div className="art-heading">
            <span className="eyebrow">A closer look at the active site</span>
            <ArrowUpRight size={20} />
          </div>
          <StructureViewer compact />
          <div className="art-caption">
            <span>
              <b>HuBisCO</b>
              <br />A question of molecular compatibility.
            </span>
            <span className="tiny">
              STRUCTURE-GUIDED
              <br />
              ENZYME ENGINEERING
            </span>
          </div>
        </div>
      </section>
      <div className="discipline-strip">
        <div className="wrap">
          {[
            'Biochemistry',
            'Enzymology',
            'Protein engineering',
            'Structural biology',
            'Data analysis',
          ].map((x) => (
            <span key={x}>{x}</span>
          ))}
        </div>
      </div>
      <section className="section wrap" id="projects"><div className="section-heading"><div><p className="eyebrow">Selected work</p><h2>Questions I have worked on.</h2></div><p>Each case follows a different part of my work, with the relevant experimental or analytical evidence.</p></div><WorkGrid /></section>
      <section className="section approach-section" id="approach">
        <div className="wrap">
          <p className="eyebrow">02 / How I work</p>
          <div className="section-heading">
            <h2>
              How I approach
              <br />
              an uncertain result.
            </h2>
            <p>
              I revisit the controls, the measurement and the assumptions.
              <br />
              Then I decide what the result can support.
            </p>
          </div>
          <div className="approach-steps">
            {[
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
            ].map(([t, b], i) => (
              <div key={t}>
                <span className="step-number">0{i + 1}</span>
                <h3>{t}</h3>
                <p>{b}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
      <section className="section wrap about-grid" id="about">
        <div>
          <p className="eyebrow">03 / About</p>
          <h2>
            A background in
            <br />
            experimental science.
          </h2>
        </div>
        <div>
          <p>
            I’m Bill Huang, a Cambridge Natural Sciences graduate with a
            background in biochemistry. My experience spans enzyme engineering,
            antimicrobial research, molecular recognition and biotechnology
            due diligence. I connect experimental work with structural reasoning
            to evaluate evidence and guide the next scientific decision.
          </p>
          <p>
            My featured project in the Prywes Lab explores alternative
            sugar-phosphate chemistry in a RuBisCO-based experimental system.
            Previous research placements took me to Melbourne, Portsmouth and
            Xiamen. I also developed a biotechnology evaluation framework during
            a private-equity internship.
          </p>
          <div className="bio-meta">
            <span>Research context</span>
            <strong>
              University of Cambridge
              <br />
              Department of Biochemistry · Prywes Lab
            </strong>
          </div>
          <p className="small muted">
            BA Natural Sciences, Cambridge · 2023–2026.
            Planned MSci Biochemistry, Cambridge · October 2026–July 2027.
          </p>
          <a className="button primary" href="/downloads/Bill-Huang-CV.pdf" download>
            Download CV <ArrowUpRight size={18} />
          </a>
        </div>
      </section>
    </main>
  );
}
