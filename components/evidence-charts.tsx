'use client';
import { Copy, SiteLink, useSite } from '@/components/site-context';
import { useEffect, useRef, useState } from 'react';
import { BarChart, Bar, CartesianGrid, XAxis, YAxis, LabelList, Tooltip, ScatterChart, Scatter, ZAxis, } from 'recharts';
import { ChartContainer } from '@/components/ui/chart';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow, } from '@/components/ui/table';
import { project } from '@/lib/projectData';
function useChartEntry() {
    const ref = useRef<HTMLDivElement>(null);
    const [visible, setVisible] = useState(false);
    const [animate, setAnimate] = useState(false);
    useEffect(() => {
        setAnimate(!matchMedia('(prefers-reduced-motion: reduce)').matches);
        const io = new IntersectionObserver((entries) => {
            if (entries.some((x) => x.isIntersecting)) {
                setVisible(true);
                io.disconnect();
            }
        }, { threshold: 0.15 });
        if (ref.current)
            io.observe(ref.current);
        return () => io.disconnect();
    }, []);
    return { ref, visible, animate };
}
export function EvidenceNotes({ observation, interpretation, limitation, decision, }: {
    observation: string;
    interpretation: string;
    limitation: string;
    decision: string;
}) {
    const { tr } = useSite();
    return (<dl className="evidence-notes">
      {[
            ['Observation', observation],
            ['Interpretation', interpretation],
            ['Limitation', limitation],
            ['Decision implication', decision],
        ].map(([k, v]) => (<div key={k}>
          <dt><Copy>{k}</Copy></dt>
          <dd><Copy>{v}</Copy></dd>
        </div>))}
    </dl>);
}
export function ConcentrationChart() {
    const { tr } = useSite();
    const { ref, visible, animate } = useChartEntry();
    return (<article className="evidence-card reveal" ref={ref}>
      <div className="evidence-title">
        <span className="figure-number">01</span>
        <div>
          <p className="eyebrow"><Copy>{"Protein preparation"}</Copy></p>
          <h3><Copy>{"Purified protein concentration"}</Copy></h3>
        </div>
        <span className="pill"><Copy>{"Reported values"}</Copy></span>
      </div>
      <p className="chart-axis-caption"><Copy>{"Concentration (mg/mL)"}</Copy></p>
      <div className="chart-wrap">
        {visible && (<ChartContainer config={{
                value: { label: tr('Concentration (mg/mL)'), color: '#CBF6C1' },
            }} className="evidence-chart" aria-label={tr("Purified protein: I164T 6.46, S368C 3.66, S368A 1.451 milligrams per millilitre")}>
            <BarChart data={project.concentrations} accessibilityLayer margin={{ top: 24, right: 20, left: 0, bottom: 0 }}>
              <CartesianGrid vertical={false} strokeDasharray="3 4"/>
              <XAxis dataKey="name" tickLine={false} axisLine={false} tick={{ fontSize: 14 }}/>
              <YAxis domain={[0, 7]} ticks={[0, 2, 4, 6]} tickLine={false} axisLine={false} width={35} tick={{ fontSize: 14 }}/>
              <Tooltip cursor={{ fill: 'var(--surface-soft)' }} formatter={(v) => [`${v} mg/mL`, tr('Concentration')]} contentStyle={{ borderRadius: 8, borderColor: '#dce5dd' }}/>
              <Bar dataKey="value" fill="#CBF6C1" stroke="#5d8854" strokeWidth={1} radius={[4, 4, 0, 0]} maxBarSize={80} isAnimationActive={animate} animationDuration={700}>
                <LabelList dataKey="value" position="top" fill="#243e2a" fontSize={14}/>
              </Bar>
            </BarChart>
          </ChartContainer>)}
      </div>
      <p className="figure-caption"><Copy>{"Reported concentration, not expression yield or catalytic performance. Collection volumes differ; no error bars or replicate counts are supplied."}</Copy></p>
      <Table className="data-table">
        <TableHeader>
          <TableRow>
            <TableHead><Copy>{"Variant"}</Copy></TableHead>
            <TableHead><Copy>{"mg/mL"}</Copy></TableHead>
            <TableHead><Copy>{"Volume (\u00B5L)"}</Copy></TableHead>
            <TableHead><Copy>{"Mass (mg)"}</Copy></TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {project.concentrations.map((r) => (<TableRow key={r.name}>
              <TableCell><Copy>{r.name}</Copy></TableCell>
              <TableCell><Copy>{r.value}</Copy></TableCell>
              <TableCell><Copy>{r.volume}</Copy></TableCell>
              <TableCell><Copy>{r.mass ?? 'Not supplied'}</Copy></TableCell>
            </TableRow>))}
        </TableBody>
      </Table>
      <p className="source-note"><Copy>{"Source: owner-supplied portfolio brief. Masses are reported, not recalculated; rounding may differ."}</Copy>{' '}<Copy>{' '}</Copy>
        <SiteLink href="/data/protein-concentrations.csv" download><Copy>{"Download values \u2193"}</Copy></SiteLink>
      </p>
      <EvidenceNotes observation="All three variants yielded recoverable purified protein, at different concentrations and pooled volumes." interpretation="The preparations provided material for downstream biochemical testing." limitation="Concentration alone cannot establish folding quality, catalytic competence or the active enzyme fraction." decision="Normalize assay inputs and include matched activity controls."/>
    </article>);
}
export function NmrChart() {
    const { tr } = useSite();
    const { ref, visible, animate } = useChartEntry();
    return (<article className="evidence-card reveal" ref={ref}>
      <div className="evidence-title">
        <span className="figure-number">04</span>
        <div>
          <p className="eyebrow"><Copy>{"Supporting-enzyme chemistry"}</Copy></p>
          <h3><Copy>{"\u00B3\u00B9P NMR: precursor conversion"}</Copy></h3>
        </div>
        <span className="pill"><Copy>{"Two reported points"}</Copy></span>
      </div>
      <p><Copy>{"PHI-mediated conversion using a 10 mM F6P substrate solution."}</Copy></p>
      <p className="chart-axis-caption"><Copy>{"Hu6P:F6P ratio (dimensionless)"}</Copy></p>
      <div className="chart-wrap">
        {visible && (<ChartContainer config={{ ratio: { label: tr('Hu6P:F6P ratio'), color: '#467b86' } }} className="evidence-chart" aria-label={tr("PHI NMR: Hu6P to F6P ratio increases from 0.035 at 24 hours to 0.196 at 144 hours")}>
            <ScatterChart accessibilityLayer margin={{ top: 25, right: 33, left: 0, bottom: 23 }}>
              <CartesianGrid vertical={false} strokeDasharray="3 4"/>
              <XAxis dataKey="hours" type="number" domain={[0, 168]} ticks={[0, 24, 72, 120, 144]} name={tr("Time")} unit=" h" tick={{ fontSize: 13 }} tickLine={false} label={{
                value: tr('Time (hours)'),
                position: 'bottom',
                offset: 0,
                fontSize: 14,
            }}/>
              <YAxis dataKey="ratio" type="number" domain={[0, 0.23]} ticks={[0, 0.05, 0.1, 0.15, 0.2]} tick={{ fontSize: 13 }} width={45} tickLine={false} name="Hu6P:F6P"/>
              <ZAxis range={[95, 95]}/>
              <Tooltip cursor={{ strokeDasharray: '3 3' }} formatter={(v, n) => [
                v,
                n === tr('Time') ? tr('Time (hours)') : tr('Hu6P:F6P ratio'),
            ]}/>
              <Scatter data={project.nmr} fill="#467b86" line={{
                stroke: '#467b86',
                strokeDasharray: '5 5',
                strokeWidth: 1.5,
            }} isAnimationActive={animate} animationDuration={700}>
                <LabelList dataKey="ratio" position="top" fill="#245764" fontSize={14}/>
              </Scatter>
            </ScatterChart>
          </ChartContainer>)}
      </div>
      <p className="figure-caption"><Copy>{"The dashed connector is a visual guide, not a fitted kinetic curve. No intermediate time points have been added."}</Copy></p>
      <div className="nmr-readout">
        <div>
          <span><Copy>{"24 h"}</Copy></span>
          <strong>0.035</strong>
        </div>
        <div>
          <span><Copy>{"144 h"}</Copy></span>
          <strong>0.196</strong>
        </div>
        <div>
          <span><Copy>{"Calculated ratio-change slope"}</Copy></span>
          <strong><Copy>{"1.34 \u00D7 10\u207B\u00B3 h\u207B\u00B9"}</Copy></strong>
        </div>
      </div>
      <p className="source-note"><Copy>{"(0.196 \u2212 0.035) \u00F7 (144 \u2212 24). This two-point slope is not a mechanistic rate constant. Source: dissertation PHI NMR results; 10 mM refers to the substrate solution before PHI-stock addition."}</Copy>{' '}<Copy>{' '}</Copy>
        <SiteLink href="/data/phi-nmr.csv" download><Copy>{"Download values \u2193"}</Copy></SiteLink>
      </p>
      <EvidenceNotes observation="The Hu6P:F6P ratio increased from 0.035 at 24 h to 0.196 at 144 h." interpretation="The change is consistent with slow PHI-mediated formation or accumulation of Hu6P." limitation="This measures supporting-enzyme precursor chemistry, not RuBisCO turnover. The Hu6P assignment also requires orthogonal confirmation; two points cannot define a robust kinetic mechanism." decision="Collect a denser time course and confirm products with an independent method."/>
    </article>);
}
