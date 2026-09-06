import Link from 'next/link';
import { ArrowUpRight, ArrowRight } from 'lucide-react';
import { StructureViewer } from '@/components/structure-viewer';
import { MotionEnhancement } from '@/components/motion';
export default function Home() {
  return (
    <main>
      <MotionEnhancement />
      <section className="hero wrap">
        <div>
          <p className="eyebrow">
            <span className="status-dot" /> Molecular science & biotech
            intelligence
          </p>
          <h1>
            From molecular
            <br />
            mechanisms to
            <br />
            <span className="highlight">decision-ready</span>
            <br />
            evidence.
          </h1>
          <p className="hero-description">
            I connect experimental biochemistry, structural reasoning and data
            to ask better questions—and decide what to test next.
          </p>
          <div className="actions">
            <Link className="button primary" href="/projects/hubisco">
              Explore HuBisCO <ArrowUpRight size={19} />
            </Link>
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
      <section className="section wrap" id="projects">
        <div className="section-top">
          <p className="eyebrow">01 / Selected research</p>
          <span className="tiny">
            ONE QUESTION. MULTIPLE LINES OF EVIDENCE.
          </span>
        </div>
        <Link href="/projects/hubisco" className="feature">
          <div className="feature-copy">
            <span className="pill">Enzyme engineering</span>
            <h2>
              HuBisCO<span className="green-period">.</span>
            </h2>
            <h3>
              Probing alternative substrate
              <br />
              compatibility in RuBisCO
            </h3>
            <p>
              A structure-guided project connecting active-site hypotheses,
              rational mutagenesis, coupled assays and ³¹P NMR.
            </p>
            <span className="text-link">
              Read the case study <ArrowUpRight size={20} />
            </span>
          </div>
          <div className="feature-visual">
            <img
              src="/I164-S368-interaction.webp"
              alt="Supplied rendering of the I164 and S368 active-site environment"
              loading="lazy"
            />
            <span className="image-label">9RUB · Active-site context</span>
          </div>
        </Link>
      </section>
      <section className="section approach-section" id="approach">
        <div className="wrap">
          <p className="eyebrow">02 / How I work</p>
          <div className="section-heading">
            <h2>
              Follow the question.
              <br />
              Respect the evidence.
            </h2>
            <p>
              A useful result moves a decision forward.
              <br />
              So does a well-understood limitation.
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
            At the intersection of
            <br />
            molecules and decisions.
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
