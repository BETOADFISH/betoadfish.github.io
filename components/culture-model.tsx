'use client';

import { useEffect, useId, useState } from 'react';
import { Pause, Play } from 'lucide-react';
import { Copy, useSite } from './site-context';
import { useMotionPlayback } from './use-motion-playback';
import { t } from '@/lib/bilingual';

const cells = Array.from({ length: 19 }, (_, index) => ({
  x: Math.sin(index * 2.39) * .72,
  y: Math.cos(index * 1.77) * .7,
  z: Math.sin(index * 1.13 + .7) * .65,
}));

export function CultureModel() {
  const { running, ref: hostRef, allowed, playing, setPlaying } = useMotionPlayback();
  const { locale } = useSite();
  const [spatial, setSpatial] = useState(true);
  const [angle, setAngle] = useState(28);
  const angleId = useId();
  const radians = angle * Math.PI / 180;
  const project = (x: number, y: number, z: number) => ({ x: 180 + (x * Math.cos(radians) + z * Math.sin(radians)) * 79, y: 126 + y * 62 + (z * Math.cos(radians) - x * Math.sin(radians)) * 28 });

  useEffect(() => {
    if (!running || !spatial) return;
    const timer = window.setInterval(() => setAngle(value => (value + .65) % 360), 100);
    return () => window.clearInterval(timer);
  }, [running, spatial]);

  return <div ref={hostRef} className="journey-visual culture-model" data-motion-running={running}>
    <span className="visual-kicker"><Copy>{t('Inspect the culture space', '观察培养空间')}</Copy></span>
    <fieldset className="culture-model-controls" aria-label={locale === 'zh' ? '培养空间示意' : 'Culture space illustration'}><button type="button" aria-pressed={!spatial} onClick={() => setSpatial(false)}><Copy>{t('Flat surface', '平面')}</Copy></button><button type="button" aria-pressed={spatial} onClick={() => setSpatial(true)}><Copy>{t('3D scaffold', '三维支架')}</Copy></button>{allowed && spatial && <button type="button" className="model-rotate" aria-pressed={playing} aria-label={locale === 'zh' ? (playing ? '暂停旋转' : '旋转示意图') : (playing ? 'Pause rotation' : 'Rotate illustration')} onClick={() => setPlaying(value => !value)}>{playing ? <Pause size={15}/> : <Play size={15}/>}</button>}</fieldset>
    <svg className="culture-space" viewBox="0 0 360 255" aria-label={locale === 'zh' ? (spatial ? '细胞分布于三维空间中的概念示意' : '细胞位于平面上的概念示意') : (spatial ? 'Conceptual cells distributed in three dimensions' : 'Conceptual cells on a flat surface')}>
      {(spatial ? [-1, 0, 1] : [0]).map(depth => <g key={depth} className="culture-lattice">{[-1, -.5, 0, .5, 1].map(position => { const start = project(-1, position, depth); const end = project(1, position, depth); const startVertical = project(position, -1, depth); const endVertical = project(position, 1, depth); return <g key={position}><line x1={start.x} y1={start.y} x2={end.x} y2={end.y}/><line x1={startVertical.x} y1={startVertical.y} x2={endVertical.x} y2={endVertical.y}/></g>; })}</g>)}
      {cells.map((cell, index) => { const point = project(cell.x, cell.y, spatial ? cell.z : 0); return <g key={index} className="culture-cell"><circle cx={point.x} cy={point.y} r={spatial ? 8 + cell.z * 2 : 8}/><circle className="culture-nucleus" cx={point.x - 1} cy={point.y + 1} r="2.5"/></g>; })}
      <text x="180" y="244" textAnchor="middle"><Copy>{spatial ? t('Support around cells', '细胞周围的支撑环境') : t('Cells on a surface', '细胞位于表面')}</Copy></text>
    </svg>
    <label className="culture-angle" htmlFor={angleId} aria-label={locale === 'zh' ? '观察角度' : 'Viewing angle'}><span><Copy>{t('Viewing angle', '观察角度')}</Copy></span><input id={angleId} type="range" min="0" max="359" step="1" value={Math.round(angle) % 360} onChange={event => { setAngle(Number(event.target.value)); setPlaying(false); }}/></label>
    <p className="visual-note"><Copy>{t('A spatial illustration. Cell function and reproducibility still need to be validated for each model; this is not a product-performance comparison.', '此图仅说明空间结构。细胞功能与重复性仍需在具体模型中验证，不能据此比较产品性能。')}</Copy></p>
  </div>;
}
