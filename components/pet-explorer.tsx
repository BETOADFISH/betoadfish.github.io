'use client';
import { Copy, useSite } from '@/components/site-context';
import { useEffect, useId, useState } from 'react';
import { Pause, Play, RotateCcw } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine } from 'recharts';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useMotionPlayback } from './use-motion-playback';
import { t } from '@/lib/bilingual';
import traces from '@/lib/pet-traces.json';

export function PetExplorer() {
  const { tr, dark, locale } = useSite();
  const { running, setPlaying, ref: hostRef, allowed, playing } = useMotionPlayback<HTMLElement>(false);
  const [substrate, setSubstrate] = useState('DIES');
  const [sample, setSample] = useState(traces.length - 1);
  const sliderId = useId();
  const columns = substrate === 'DIES' ? [1, 2] : [3, 4];
  const wells = ['D', 'E', 'F'].flatMap(row => columns.map((column, i) => ({ key: `${row}${column}`, test: i === 1 })));
  const time = traces[sample].time;

  useEffect(() => {
    if (!running) return;
    if (sample === traces.length - 1) { setPlaying(false); return; }
    const timer = window.setTimeout(() => setSample(current => Math.min(traces.length - 1, current + 1)), 90);
    return () => window.clearTimeout(timer);
  }, [running, setPlaying, sample]);

  return <section ref={hostRef} className="interactive-panel pet-trace-explorer" aria-label={tr('CCH11 assay trace explorer')}>
    <div className="explorer-top"><div><p className="eyebrow"><Copy>{'Recorded experiment / 26 June 2025'}</Copy></p><h2><Copy>{'Inspect the individual wells.'}</Copy></h2></div><Tabs value={substrate} onValueChange={value => { setSubstrate(String(value)); setSample(traces.length - 1); setPlaying(false); }}><TabsList aria-label={tr('Substrate condition')}><TabsTrigger value="DIES">DIES</TabsTrigger><TabsTrigger value="BHET">BHET</TabsTrigger></TabsList></Tabs></div>
    <p><Copy>{t('CCH11 assay at approximately 40 °C. Each line is one well; solid blue lines show tests and dashed grey lines show controls.', '约 40 °C 下的 CCH11 检测。每条线代表一个孔：蓝色实线为实验孔，灰色虚线为对照孔。')}</Copy></p>
    <div className="trace-playback">
      <div className="trace-playback-buttons">{allowed && <button type="button" onClick={() => { if (sample === traces.length - 1) setSample(0); setPlaying(value => !value); }} aria-pressed={playing}>{playing ? <Pause size={16}/> : <Play size={16}/>}<Copy>{playing ? t('Pause', '暂停') : t('Replay readings', '回放测量')}</Copy></button>}<button type="button" onClick={() => { setSample(traces.length - 1); setPlaying(false); }}><RotateCcw size={15}/><Copy>{t('Full experiment', '完整实验')}</Copy></button></div>
      <label htmlFor={sliderId}><Copy>{t('Recorded time', '记录时间')}</Copy><output aria-live="off">{time.toFixed(1)} min</output></label>
      <input id={sliderId} type="range" min={0} max={traces.length - 1} value={sample} aria-label={locale === 'zh' ? '记录时间' : 'Recorded time'} aria-valuetext={`${time.toFixed(1)} ${locale === 'zh' ? '分钟' : 'minutes'}`} onChange={event => { setSample(Number(event.target.value)); setPlaying(false); }}/>
    </div>
    <div className="chart-axis-label"><Copy>{'Absorbance (A550)'}</Copy></div>
    <figure className="trace-chart" aria-label={locale === 'zh' ? `${substrate}：3 个实验孔和 3 个对照孔，显示至 ${time.toFixed(1)} 分钟。` : `${substrate}: three test wells and three controls, shown through ${time.toFixed(1)} minutes.`}>
      <ResponsiveContainer width="100%" height="100%"><LineChart data={traces.slice(0, sample + 1)} margin={{ top: 15, right: 20, left: 0, bottom: 20 }}><CartesianGrid stroke="var(--chart-grid)" strokeDasharray="3 3"/><XAxis dataKey="time" type="number" domain={[0, 100]} tickFormatter={value => Number(value).toFixed(0)} label={{ value: tr('Time (min)'), position: 'insideBottom', offset: -12 }}/><YAxis domain={[0, 1.2]} width={45}/><Tooltip labelFormatter={value => `${Number(value).toFixed(2)} min`} formatter={(value, name) => [Number(value).toFixed(4), name]}/>{sample < traces.length - 1 && <ReferenceLine x={time} stroke="var(--project-ink)" strokeDasharray="2 5"/>}{wells.map((well, index) => <Line key={well.key} dataKey={well.key} name={`${tr(well.test ? 'Test' : 'Control')} ${well.key}`} stroke={well.test ? (dark ? ['#a6d9fc', '#73bdea', '#4da0d0'] : ['#235C8B', '#2B76AA', '#498BAC'])[Math.floor(index / 2)] : '#8798A6'} strokeDasharray={well.test ? undefined : '5 4'} strokeWidth={well.test ? 2 : 1.5} dot={sample === 0 ? { r: 3 } : false} type="linear" isAnimationActive={false}/>)}</LineChart></ResponsiveContainer>
    </figure>
    <div className="trace-legend"><span><i className="legend-test"/><Copy>{'Test wells'}</Copy>{' '}{wells.filter(well => well.test).map(well => well.key).join(', ')}</span><span><i className="legend-control"/><Copy>{'Control wells'}</Copy>{' '}{wells.filter(well => !well.test).map(well => well.key).join(', ')}</span></div>
    <p className="trace-playback-note"><Copy>{t('Replay reveals the recorded samples in order at an accelerated pace; the horizontal axis remains the experimental time.', '回放按采样顺序加速展示原始读数；横轴始终表示实验时间。')}</Copy></p>
    <p className="interpretation"><Copy>{t('Test wells show a larger fall in A550 than their controls. These substrate-assay signals support further characterisation; they do not measure polymer degradation rates.', '实验孔的 A550 下降幅度大于对照孔。这些底物检测信号支持进一步表征，不能直接当作聚合物降解速率。')}</Copy></p>
  </section>;
}
