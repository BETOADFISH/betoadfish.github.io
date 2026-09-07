'use client';
import { Copy, useSite } from '@/components/site-context';
import { useState } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { t } from '@/lib/bilingual';
import traces from '@/lib/pet-traces.json';
export function PetExplorer() {
    const { tr, dark } = useSite();
    const [substrate, setSubstrate] = useState('DIES');
    const columns = substrate === 'DIES' ? [1, 2] : [3, 4];
    const wells = ['D', 'E', 'F'].flatMap(row => columns.map((column, i) => ({ key: `${row}${column}`, test: i === 1 })));
    return <section className="interactive-panel" aria-label={tr("CCH11 assay trace explorer")}><div className="explorer-top"><div><p className="eyebrow"><Copy>{"Recorded experiment / 26 June 2025"}</Copy></p><h2><Copy>{"Inspect the individual wells."}</Copy></h2></div><Tabs value={substrate} onValueChange={v => setSubstrate(String(v))}><TabsList aria-label={tr("Substrate condition")}><TabsTrigger value="DIES"><Copy>{"DIES"}</Copy></TabsTrigger><TabsTrigger value="BHET"><Copy>{"BHET"}</Copy></TabsTrigger></TabsList></Tabs></div>
 <p><Copy>{t('CCH11 assay at approximately 40 °C. Each line is one well; solid blue lines show tests and dashed grey lines show controls.','约 40 °C 下的 CCH11 检测。每条线代表一个孔：蓝色实线为实验孔，灰色虚线为对照孔。')}</Copy></p><div className="chart-axis-label"><Copy>{"Absorbance (A550)"}</Copy></div><div className="trace-chart" role="img" aria-label={tr(`${substrate}: three test wells and three control wells, absorbance over time.`)}><ResponsiveContainer width="100%" height="100%"><LineChart data={traces} margin={{ top: 15, right: 20, left: 0, bottom: 20 }}><CartesianGrid stroke="var(--chart-grid)" strokeDasharray="3 3"/><XAxis dataKey="time" type="number" domain={[0, 100]} tickFormatter={v => Number(v).toFixed(0)} label={{ value: tr('Time (min)'), position: 'insideBottom', offset: -12 }}/><YAxis domain={[0, 1.2]} width={45}/><Tooltip labelFormatter={v => `${Number(v).toFixed(2)} min`} formatter={(v, n) => [Number(v).toFixed(4), n]}/>{wells.map((w, i) => <Line key={w.key} dataKey={w.key} name={`${tr(w.test ? 'Test' : 'Control')} ${w.key}`} stroke={w.test ? (dark ? ['#a6d9fc', '#73bdea', '#4da0d0'] : ['#235C8B', '#2B76AA', '#498BAC'])[Math.floor(i / 2)] : '#8798A6'} strokeDasharray={w.test ? undefined : '5 4'} strokeWidth={w.test ? 2 : 1.5} dot={false} type="linear" isAnimationActive={false}/>)}</LineChart></ResponsiveContainer></div>
 <div className="trace-legend"><span><i className="legend-test"/><Copy>{"Test wells"}</Copy>{' '}<Copy>{wells.filter(w => w.test).map(w => w.key).join(', ')}</Copy></span><span><i className="legend-control"/><Copy>{"Control wells"}</Copy>{' '}<Copy>{wells.filter(w => !w.test).map(w => w.key).join(', ')}</Copy></span></div><p className="interpretation"><Copy>{t('Test wells show a larger fall in A550 than their controls. These substrate-assay signals support further characterisation; they do not measure polymer degradation rates.','实验孔的 A550 下降幅度大于对照孔。这些底物检测信号支持进一步表征，不能直接当作聚合物降解速率。')}</Copy></p>
 </section>;
}
