'use client';

import { useEffect, useId, useState } from 'react';
import { FileText, Check, Layers3, Search, RotateCcw, Pause, Play } from 'lucide-react';
import { Copy, useSite } from './site-context';
import { useMotionPlayback } from './use-motion-playback';
import { t } from '@/lib/bilingual';

const stages = [t('Organise source material', '整理资料'), t('Draft the argument', '组织论点'), t('Build the slide', '制作页面'), t('Check claims and layout', '核对内容与版式')];
const icons = [Search, FileText, Layers3, Check];

export function SlideWorkbench() {
  const { locale } = useSite();
  const { allowed, running, setPlaying, ref: hostRef, playing } = useMotionPlayback<HTMLElement>();
  const [step, setStep] = useState(0);
  const [selected, setSelected] = useState(false);
  const slideId = useId();
  const stage = !allowed && !selected ? 3 : step;

  useEffect(() => {
    if (!running) return;
    const timer = window.setTimeout(() => {
      if (step === 3) setPlaying(false);
      else setStep(current => current + 1);
    }, 2300);
    return () => window.clearTimeout(timer);
  }, [running, setPlaying, step]);

  function selectStage(index: number) {
    setStep(index);
    setSelected(true);
    setPlaying(false);
  }

  return <section ref={hostRef} className="slide-workbench" id="slide-workbench" data-stage={stage} data-motion-running={running}>
    <div className="workbench-toolbar">
      <div><p className="eyebrow"><Copy>{t('From evidence to a presentation', '从证据到演示文稿')}</Copy></p><h3><Copy>{t('A presentation takes shape.', '一页分析怎样形成。')}</Copy></h3></div>
      <div className="workbench-playback">
        {allowed && <button type="button" onClick={() => { if (step === 3) setStep(0); setPlaying(!playing); }} aria-label={locale === 'zh' ? (playing ? '暂停制作演示' : '播放制作演示') : (playing ? 'Pause slide workflow' : 'Play slide workflow')} aria-pressed={playing}>{playing ? <Pause size={16}/> : <Play size={16}/>}<Copy>{playing ? t('Pause', '暂停') : t('Play', '播放')}</Copy></button>}
        <button type="button" onClick={() => { setStep(0); setSelected(true); setPlaying(true); }} disabled={!allowed} aria-label={locale === 'zh' ? '重新播放制作流程' : 'Replay slide workflow'}><RotateCcw size={16}/></button>
      </div>
    </div>
    <div className="slide-studio">
      <aside className="studio-sources"><span className="visual-kicker"><Copy>{t('Research inputs', '研究资料')}</Copy></span>{[t('Interview themes', '访谈主题'), t('Evidence questions', '证据问题'), t('Patient journey', '患者路径')].map((value, index) => <div key={index}><FileText size={17}/><Copy>{value}</Copy><Check size={14}/></div>)}<p><Copy>{t('Question → claim → supporting source', '问题 → 论点 → 支持来源')}</Copy></p></aside>
      <div className="slide-preview" id={slideId}>
        <span className="slide-page-number">01 / 04</span>
        <p className="slide-overline"><Copy>{t('Research synthesis', '研究材料综合')}</Copy></p>
        <h4><Copy>{t('What changes a clinical decision?', '什么会改变临床判断？')}</Copy></h4>
        <div className={`slide-content ${stage >= 1 ? 'shown' : ''}`}><div className="slide-thesis"><Copy>{t('Read benefit, safety and patient context together.', '结合获益、安全性与患者背景理解判断。')}</Copy></div><div className={`slide-columns ${stage >= 2 ? 'shown' : ''}`}>{[t('Event history', '事件史'), t('Risk balance', '风险权衡'), t('Continuity of care', '持续管理')].map((value, index) => <div key={index}><b>0{index + 1}</b><Copy>{value}</Copy><i/><i/></div>)}</div></div>
        <div className={`slide-source-line ${stage >= 3 ? 'shown' : ''}`}><Check size={13}/><Copy>{t('Source checked · scope stated · layout reviewed', '来源已核对 · 范围已说明 · 版式已审阅')}</Copy></div>
      </div>
      <fieldset className="studio-stages" aria-label={locale === 'zh' ? '选择制作步骤' : 'Select a slide workflow step'}>{stages.map((value, index) => { const Icon = icons[index]; return <button type="button" className={stage === index ? 'active' : stage > index ? 'done' : ''} key={index} aria-pressed={stage === index} aria-controls={slideId} onClick={() => selectStage(index)}><Icon size={17}/><span><Copy>{value}</Copy></span><small>0{index + 1}</small></button>; })}</fieldset>
    </div>
    <p className="small muted"><Copy>{t('Illustrative reconstruction of the production workflow, using generalised content rather than a client slide.', '用概括性内容重现制作过程，画面不是客户原始幻灯片。')}</Copy></p>
  </section>;
}
