'use client';
import { useEffect, useRef, useState } from 'react';
import {
  BarChart,
  Bar,
  CartesianGrid,
  XAxis,
  YAxis,
  LabelList,
  Tooltip,
  ScatterChart,
  Scatter,
  ZAxis,
} from 'recharts';
import { ChartContainer } from '@/components/ui/chart';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { project } from '@/lib/projectData';
function useChartEntry() {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);
  const [animate, setAnimate] = useState(false);
  useEffect(() => {
    setAnimate(!matchMedia('(prefers-reduced-motion: reduce)').matches);
    const io = new IntersectionObserver(
      (entries) => {
        if (entries.some((x) => x.isIntersecting)) {
          setVisible(true);
          io.disconnect();
        }
      },
      { threshold: 0.15 },
    );
    if (ref.current) io.observe(ref.current);
    return () => io.disconnect();
  }, []);
  return { ref, visible, animate };
}
export function EvidenceNotes({
  observation,
  interpretation,
  limitation,
  decision,
}: {
  observation: string;
  interpretation: string;
  limitation: string;
  decision: string;
}) {
  return (
    <dl className="evidence-notes">
      {[
        ['Observation', observation],
        ['Interpretation', interpretation],
        ['Limitation', limitation],
        ['Decision implication', decision],
      ].map(([k, v]) => (
        <div key={k}>
          <dt>{k}</dt>
          <dd>{v}</dd>
        </div>
      ))}
    </dl>
  );
}
export function ConcentrationChart() {
  const { ref, visible, animate } = useChartEntry();
  return (
    <article className="evidence-card reveal" ref={ref}>
      <div className="evidence-title">
        <span className="figure-number">01</span>
        <div>
          <p className="eyebrow">Protein preparation</p>
          <h3>Purified protein concentration</h3>
        </div>
        <span className="pill">Reported values</span>
      </div>
      <p className="chart-axis-caption">Concentration (mg/mL)</p>
      <div className="chart-wrap">
        {visible && (
          <ChartContainer
            config={{
              value: { label: 'Concentration (mg/mL)', color: '#CBF6C1' },
            }}
            className="evidence-chart"
            aria-label="Purified protein: I164T 6.46, S368C 3.66, S368A 1.451 milligrams per millilitre"
          >
            <BarChart
              data={project.concentrations}
              accessibilityLayer
              margin={{ top: 24, right: 20, left: 0, bottom: 0 }}
            >
              <CartesianGrid vertical={false} strokeDasharray="3 4" />
              <XAxis
                dataKey="name"
                tickLine={false}
                axisLine={false}
                tick={{ fontSize: 14 }}
              />
              <YAxis
                domain={[0, 7]}
                ticks={[0, 2, 4, 6]}
                tickLine={false}
                axisLine={false}
                width={35}
                tick={{ fontSize: 14 }}
              />
              <Tooltip
                cursor={{ fill: '#f3f8f1' }}
                formatter={(v) => [`${v} mg/mL`, 'Concentration']}
                contentStyle={{ borderRadius: 8, borderColor: '#dce5dd' }}
              />
              <Bar
                dataKey="value"
                fill="#CBF6C1"
                stroke="#5d8854"
                strokeWidth={1}
                radius={[4, 4, 0, 0]}
                maxBarSize={80}
                isAnimationActive={animate}
                animationDuration={700}
              >
                <LabelList
                  dataKey="value"
                  position="top"
                  fill="#243e2a"
                  fontSize={14}
                />
              </Bar>
            </BarChart>
          </ChartContainer>
        )}
      </div>
      <p className="figure-caption">
        Reported concentration, not expression yield or catalytic performance.
        Collection volumes differ; no error bars or replicate counts are
        supplied.
      </p>
      <Table className="data-table">
        <TableHeader>
          <TableRow>
            <TableHead>Variant</TableHead>
            <TableHead>mg/mL</TableHead>
            <TableHead>Volume (µL)</TableHead>
            <TableHead>Mass (mg)</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {project.concentrations.map((r) => (
            <TableRow key={r.name}>
              <TableCell>{r.name}</TableCell>
              <TableCell>{r.value}</TableCell>
              <TableCell>{r.volume}</TableCell>
              <TableCell>{r.mass ?? 'Not supplied'}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
      <p className="source-note">
        Source: owner-supplied portfolio brief. Masses are reported, not
        recalculated; rounding may differ.{' '}
        <a href="/data/protein-concentrations.csv" download>
          Download values ↓
        </a>
      </p>
      <EvidenceNotes
        observation="All three variants yielded recoverable purified protein, at different concentrations and pooled volumes."
        interpretation="The preparations provided material for downstream biochemical testing."
        limitation="Concentration alone cannot establish folding quality, catalytic competence or the active enzyme fraction."
        decision="Normalize assay inputs and include matched activity controls."
      />
    </article>
  );
}
export function NmrChart() {
  const { ref, visible, animate } = useChartEntry();
  return (
    <article className="evidence-card reveal" ref={ref}>
      <div className="evidence-title">
        <span className="figure-number">03</span>
        <div>
          <p className="eyebrow">Supporting-enzyme chemistry</p>
          <h3>³¹P NMR: precursor conversion</h3>
        </div>
        <span className="pill">Two reported points</span>
      </div>
      <p>PHI-mediated conversion using a 10 mM F6P substrate solution.</p>
      <p className="chart-axis-caption">Hu6P:F6P ratio (dimensionless)</p>
      <div className="chart-wrap">
        {visible && (
          <ChartContainer
            config={{ ratio: { label: 'Hu6P:F6P ratio', color: '#467b86' } }}
            className="evidence-chart"
            aria-label="PHI NMR: Hu6P to F6P ratio increases from 0.035 at 24 hours to 0.196 at 144 hours"
          >
            <ScatterChart
              accessibilityLayer
              margin={{ top: 25, right: 33, left: 0, bottom: 23 }}
            >
              <CartesianGrid vertical={false} strokeDasharray="3 4" />
              <XAxis
                dataKey="hours"
                type="number"
                domain={[0, 168]}
                ticks={[0, 24, 72, 120, 144]}
                name="Time"
                unit=" h"
                tick={{ fontSize: 13 }}
                tickLine={false}
                label={{
                  value: 'Time (hours)',
                  position: 'bottom',
                  offset: 0,
                  fontSize: 14,
                }}
              />
              <YAxis
                dataKey="ratio"
                type="number"
                domain={[0, 0.23]}
                ticks={[0, 0.05, 0.1, 0.15, 0.2]}
                tick={{ fontSize: 13 }}
                width={45}
                tickLine={false}
                name="Hu6P:F6P"
              />
              <ZAxis range={[95, 95]} />
              <Tooltip
                cursor={{ strokeDasharray: '3 3' }}
                formatter={(v, n) => [
                  v,
                  n === 'Time' ? 'Time (hours)' : 'Hu6P:F6P ratio',
                ]}
              />
              <Scatter
                data={project.nmr}
                fill="#467b86"
                line={{
                  stroke: '#467b86',
                  strokeDasharray: '5 5',
                  strokeWidth: 1.5,
                }}
                isAnimationActive={animate}
                animationDuration={700}
              >
                <LabelList
                  dataKey="ratio"
                  position="top"
                  fill="#245764"
                  fontSize={14}
                />
              </Scatter>
            </ScatterChart>
          </ChartContainer>
        )}
      </div>
      <p className="figure-caption">
        The dashed connector is a visual guide, not a fitted kinetic curve. No
        intermediate time points have been added.
      </p>
      <div className="nmr-readout">
        <div>
          <span>24 h</span>
          <strong>0.035</strong>
        </div>
        <div>
          <span>144 h</span>
          <strong>0.196</strong>
        </div>
        <div>
          <span>Calculated ratio-change slope</span>
          <strong>1.34 × 10⁻³ h⁻¹</strong>
        </div>
      </div>
      <p className="source-note">
        (0.196 − 0.035) ÷ (144 − 24). This two-point slope is not a mechanistic
        rate constant. Source: dissertation PHI NMR results; 10 mM refers to the
        substrate solution before PHI-stock addition.{' '}
        <a href="/data/phi-nmr.csv" download>
          Download values ↓
        </a>
      </p>
      <EvidenceNotes
        observation="The Hu6P:F6P ratio increased from 0.035 at 24 h to 0.196 at 144 h."
        interpretation="The change is consistent with slow PHI-mediated formation or accumulation of Hu6P."
        limitation="This measures supporting-enzyme precursor chemistry, not RuBisCO turnover. The Hu6P assignment also requires orthogonal confirmation; two points cannot define a robust kinetic mechanism."
        decision="Collect a denser time course and confirm products with an independent method."
      />
    </article>
  );
}
