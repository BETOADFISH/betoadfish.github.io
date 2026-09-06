import type { Metadata } from 'next';
import Link from 'next/link';
import {
  ArrowLeft,
  ArrowUpRight,
  ArrowDown,
  FlaskConical,
  Orbit,
  ChartNoAxesCombined,
  MoveRight,
} from 'lucide-react';
import { project, profile } from '@/lib/projectData';
import { StructureViewer } from '@/components/structure-viewer';
import { ProjectNav } from '@/components/project-nav';
import {
  ConcentrationChart,
  NmrChart,
  EvidenceNotes,
} from '@/components/evidence-charts';
import { MotionEnhancement } from '@/components/motion';
export const dynamic = 'force-static';
export const metadata: Metadata = {
  title: 'HuBisCO | Structure, experiments & evidence — Bill',
  description:
    'Explore a structure-guided RuBisCO case study: interactive 9RUB and 5RUB structures, mutant rationale, biochemical evidence, limitations and next experiments.',
};
export default function HuBisCO() {
  return (
    <main>
      <MotionEnhancement />
      <section className="project-hero wrap" id="overview">
        <Link href="/#projects" className="back-link">
          <ArrowLeft size={15} /> All projects
        </Link>
        <div className="project-heading">
          <div>
            <p className="eyebrow">Case study 01 / Enzyme engineering</p>
            <h1>
              HuBisCO<span className="green-period">.</span>
            </h1>
            <h2>{project.subtitle}</h2>
          </div>
          <span className="pill public-version">Public portfolio version</span>
        </div>
        <p className="project-intro">{project.summary}</p>
        <div className="project-meta">
          <div>
            <span>Research context</span>
            <b>{profile.institution}</b>
          </div>
          <div>
            <span>Research group</span>
            <b>{project.metadata.group}</b>
          </div>
          <div>
            <span>Project</span>
            <b>{project.metadata.type}</b>
          </div>
          <div>
            <span>Year / duration</span>
            <b>
              {project.metadata.year} / {project.metadata.duration}
            </b>
          </div>
        </div>
        <p className="source-note">
          Selected methods and results are shown for portfolio purposes. Private
          source documents are not reproduced. Affiliation describes the
          research context; this is an independent portfolio.
        </p>
      </section>
      <ProjectNav />
      <div className="wrap case-body">
        <section
          className="glance-grid section reveal"
          aria-label="Project at a glance"
        >
          {[
            [
              Orbit,
              'Scientific question',
              'Can an alternative sugar-phosphate geometry be accommodated in the RuBP-binding site?',
            ],
            [
              FlaskConical,
              'Experimental strategy',
              'Connect structure-guided mutations, recombinant proteins, coupled assays and precursor NMR.',
            ],
            [
              ChartNoAxesCombined,
              'My role',
              'Structural reasoning, protein work, assay analysis and integration of biochemical evidence.',
            ],
          ].map(([Icon, title, body]) => {
            const I = Icon as typeof Orbit;
            return (
              <article key={String(title)}>
                <I size={23} strokeWidth={1.3} />
                <h3>{String(title)}</h3>
                <p>{String(body)}</p>
              </article>
            );
          })}
          <article className="glance-outcome">
            <span className="pill warning">Preliminary / unresolved</span>
            <h3>Current evidence level</h3>
            <p>{project.outcome}</p>
          </article>
        </section>
        <section className="case-section question-section reveal" id="question">
          <div className="section-kicker">
            <span>01</span>
            <p className="eyebrow">The scientific problem</p>
          </div>
          <h2>{project.researchQuestion}</h2>
          <p>
            RuBisCO is highly adapted to its native substrate environment. A
            different sugar-phosphate geometry can alter steric fit, phosphate
            positioning, hydrogen bonding and catalytic alignment. A convincing
            engineering claim needs more than a plausible binding pose.
          </p>
          <div className="question-flow">
            {[
              'Native active-site requirements',
              'Alternative substrate geometry',
              'Potential interaction mismatch',
              'Testable mutations',
            ].map((t, i) => (
              <div key={t}>
                <span>0{i + 1}</span>
                <p>{t}</p>
                {i < 3 && <MoveRight size={20} />}
              </div>
            ))}
          </div>
        </section>
        <section className="case-section" id="structure">
          <div className="section-kicker">
            <span>02</span>
            <p className="eyebrow">Structural rationale</p>
          </div>
          <div className="section-heading">
            <h2>
              A small change.
              <br />A testable question.
            </h2>
            <p>
              Inspect the wild-type reference, then connect each candidate
              substitution to the interaction it probes.
            </p>
          </div>
          <StructureViewer />
          <div className="mutant-grid">
            {project.mutants.map((m) => (
              <article className="mutant-card reveal" key={m.name}>
                <span className="eyebrow">Design hypothesis</span>
                <h3>{m.name}</h3>
                <span className="mutation-change">{m.change}</span>
                <p>{m.rationale}</p>
              </article>
            ))}
          </div>
          <p className="source-note">
            These are design rationales, not demonstrated improvements. No
            mutation-specific activity gain is established.
          </p>
        </section>
        <section className="case-section" id="strategy">
          <div className="section-kicker">
            <span>03</span>
            <p className="eyebrow">Experimental strategy</p>
          </div>
          <h2>
            From a structural idea
            <br />
            to an experimental decision.
          </h2>
          <p className="muted">
            Each stage answers a question—and introduces an uncertainty that the
            next stage must address.
          </p>
          <div className="workflow">
            {project.workflow.map((w, i) => (
              <details className="workflow-step" key={w.title}>
                <summary>
                  <span className="workflow-number">
                    {String(i + 1).padStart(2, '0')}
                  </span>
                  <span>
                    <h3>{w.title}</h3>
                    <p>{w.objective}</p>
                  </span>
                  <ArrowDown className="details-arrow" size={19} />
                </summary>
                <dl>
                  <div>
                    <dt>Method</dt>
                    <dd>{w.method}</dd>
                  </div>
                  <div>
                    <dt>Output</dt>
                    <dd>{w.output}</dd>
                  </div>
                  <div>
                    <dt>Uncertainty</dt>
                    <dd>{w.uncertainty}</dd>
                  </div>
                </dl>
              </details>
            ))}
          </div>
        </section>
        <section className="case-section" id="evidence">
          <div className="section-kicker">
            <span>04</span>
            <p className="eyebrow">Evidence dashboard</p>
          </div>
          <div className="section-heading">
            <h2>
              What was measured.
              <br />
              What it can tell us.
            </h2>
            <p>
              Selected values, with their sources and interpretation boundaries
              kept visible.
            </p>
          </div>
          <ConcentrationChart />
          <article className="evidence-card assay-card reveal">
            <div className="evidence-title">
              <span className="figure-number">02</span>
              <div>
                <p className="eyebrow">Native activity benchmark</p>
                <h3>Measured WT RuBP activity</h3>
              </div>
              <span className="pill warning">Preliminary assay value</span>
            </div>
            <div className="assay-layout">
              <div className="assay-number">
                <span>Reported Vmax</span>
                <strong>0.008</strong>
                <span>mM s⁻¹</span>
              </div>
              <div>
                <p>
                  Wild-type RuBP-dependent activity was measurable in the
                  coupled assay system.
                </p>
                <p className="small muted">
                  This is a native-substrate benchmark. It is not kcat,
                  catalytic efficiency or evidence of alternative-substrate
                  turnover.
                </p>
                <p className="source-note">
                  Value supplied in the portfolio brief; not independently
                  corroborated in the dissertation text.
                </p>
              </div>
            </div>
            <EvidenceNotes
              observation="The coupled system detected WT RuBP-dependent activity."
              interpretation="The enzyme and coupled readout were operational under the tested condition."
              limitation="The reported assay Vmax alone does not establish HuBP turnover or mutant-specific performance."
              decision="Use matched substrate, enzyme-concentration and background controls for subsequent comparisons."
            />
          </article>
          <NmrChart />
        </section>
        <section className="case-section" id="interpretation">
          <div className="section-kicker">
            <span>05</span>
            <p className="eyebrow">Interpretation</p>
          </div>
          <h2>
            Evidence has boundaries.
            <br />
            Make them visible.
          </h2>
          <p>
            The dissertation reports negligible or no alternative-substrate
            activity. Weak mutant assay signals were inconclusive and could
            reflect random error without repeat measurements. The NMR result
            supports precursor chemistry in the PHI system.
          </p>
          <div className="evidence-matrix">
            {project.evidence.map((e) => (
              <article className={`status-card ${e.tone} reveal`} key={e.title}>
                <span className="status-label">
                  {e.title === 'Suggested'
                    ? 'Consistent with, not proven'
                    : e.title}
                </span>
                <h3>
                  {e.title === 'Observed'
                    ? 'What the data show'
                    : e.title === 'Suggested'
                      ? 'What they may suggest'
                      : 'What remains unknown'}
                </h3>
                <ul>
                  {e.items.map((t) => (
                    <li key={t}>{t}</li>
                  ))}
                </ul>
              </article>
            ))}
          </div>
          <div className="conclusion-note">
            <b>No claim of an engineered carbon-fixation pathway.</b>
            <p>
              The project identifies what the present evidence cannot establish
              and which experiments would make the next conclusion stronger.
            </p>
          </div>
        </section>
        <section className="case-section" id="contribution">
          <div className="section-kicker">
            <span>06</span>
            <p className="eyebrow">My contribution</p>
          </div>
          <h2>
            Connecting the work,
            <br />
            not just collecting results.
          </h2>
          <div className="contribution-grid">
            {project.contribution.map((c, i) => (
              <article key={c.title} className="reveal">
                <span className="step-number">0{i + 1}</span>
                <h3>{c.title}</h3>
                <ul>
                  {c.items.map((x) => (
                    <li key={x}>{x}</li>
                  ))}
                </ul>
              </article>
            ))}
          </div>
        </section>
        <section className="case-section" id="limitations">
          <div className="section-kicker">
            <span>07</span>
            <p className="eyebrow">Limitations</p>
          </div>
          <h2>
            Where the system
            <br />
            remained limiting.
          </h2>
          <div className="limitations-grid">
            {project.limitations.map((l) => (
              <article className="reveal" key={l.title}>
                <span className="limitation-mark">↗</span>
                <h3>{l.title}</h3>
                <p>{l.body}</p>
              </article>
            ))}
          </div>
        </section>
        <section className="case-section" id="next-steps">
          <div className="section-kicker">
            <span>08</span>
            <p className="eyebrow">Proposed next steps</p>
          </div>
          <div className="section-heading">
            <h2>
              The next experiment
              <br />
              should reduce uncertainty.
            </h2>
            <span className="pill">Proposed future work</span>
          </div>
          <div className="next-list">
            {project.nextExperiments.map((e, i) => (
              <article className="reveal" key={e.title}>
                <span>{String(i + 1).padStart(2, '0')}</span>
                <h3>{e.title}</h3>
                <p>{e.body}</p>
              </article>
            ))}
          </div>
        </section>
        <section className="case-section skills-section">
          <p className="eyebrow">Skills demonstrated</p>
          <div className="skills-tags">
            {project.skills.map((s) => (
              <span className="pill" key={s}>
                {s}
              </span>
            ))}
          </div>
        </section>
        <section className="reflection reveal">
          <p className="eyebrow">Project reflection</p>
          <h2>
            Rigour is knowing
            <br />
            what you can claim.
          </h2>
          <p>
            This project connects structural reasoning with experimental
            biochemistry while maintaining a clear boundary between measured
            evidence and mechanistic inference. Its value lies in identifying
            limiting interactions, testing them and deciding what evidence is
            still required.
          </p>
          <div className="actions">
            <a className="button primary" href="/downloads/HuBisCO-project-brief.pdf" download>
              Download project brief (PDF) ↓
            </a>
            <a href="#contact" className="text-link">
              Contact <ArrowUpRight size={18} />
            </a>
          </div>
        </section>
        <section className="sources-section" id="sources">
          <details>
            <summary>
              Sources & evidence notes{' '}
              <span>3 source groups + downloadable values</span>
            </summary>
            {project.sourceNotes.map((s) => (
              <div key={s.title}>
                <h3>{s.title}</h3>
                <p>{s.detail}</p>
              </div>
            ))}
            <div className="source-links">
              <a
                href="https://www.rcsb.org/structure/9RUB"
                target="_blank"
                rel="noreferrer"
              >
                RCSB: 9RUB ↗
              </a>
              <a
                href="https://www.rcsb.org/structure/5RUB"
                target="_blank"
                rel="noreferrer"
              >
                RCSB: 5RUB ↗
              </a>
              <a
                href="https://nglviewer.org/ngl/"
                target="_blank"
                rel="noreferrer"
              >
                Molecular visualization: NGL ↗
              </a>
            </div>
            <p className="small muted">
              Protein images supplied in the project folder. Interactive models
              use deposited atomic coordinates; no molecular coordinates or
              experimental observations are generated.
            </p>
          </details>
        </section>
        <div className="more-projects">
          <span>More projects in development</span>
          <Link href="/">
            Back to portfolio <ArrowUpRight size={17} />
          </Link>
        </div>
      </div>
    </main>
  );
}
