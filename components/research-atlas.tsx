'use client';
import { useId, useState, useEffect } from 'react';
import { ArrowUpRight, FlaskConical, Layers3, Microscope, ChartNoAxesCombined, FileHeart } from 'lucide-react';
import { Copy, SiteLink, useSite } from './site-context';
import { t } from '@/lib/bilingual';

const fields = [
  { theme:'hubisco', icon:FlaskConical, label:t('Enzyme design','酶设计'), name:t('Cambridge · HuBisCO','剑桥大学 · HuBisCO'), path:'/projects/hubisco', note:t('Changing substrate chemistry to explore a different route for carbon fixation.','从底物化学出发，探索不同的固碳路线。') },
  { theme:'pet', icon:Layers3, label:t('Biocatalysis','生物催化'), name:t('Portsmouth · PET hydrolases','朴茨茅斯大学 · PET 水解酶'), path:'/projects/pet-hydrolase', note:t('Expressing and purifying PET hydrolases, then testing their activity.','表达、纯化 PET 水解酶，并测试催化活性。') },
  { theme:'mcr', icon:Microscope, label:t('Antimicrobials','抗菌研究'), name:t('Melbourne · Colistin adjuvants','墨尔本大学 · 多黏菌素 E 增效剂'), path:'/projects/mcr1-colistin', note:t('Testing colistin combinations and their effects on bacterial membranes.','测试多黏菌素 E 的联合效果，以及对细菌细胞膜的影响。') },
  { theme:'culture', icon:ChartNoAxesCombined, label:t('Biotech strategy','生技分析'), name:t('Shanghai Dynamax · 3D cell culture','上海冠亚投资 · 3D 细胞培养'), path:'/intelligence/3d-cell-culture', note:t('Comparing 3D culture materials, validation evidence and laboratory costs.','比较 3D 培养材料、验证证据和实验成本。') },
  { theme:'yidu', icon:FileHeart, label:t('Healthcare research','医药研究'), name:t('Yidu · Healthcare research','医渡科技 · 医药研究'), path:'/intelligence/yidu', note:t('Reviewing clinician interviews and factor XI research questions in stroke prevention.','整理卒中预防相关的医生访谈与凝血因子 XI 研究问题。') },
];
const paths=['M135 90 C205 90 210 195 280 195','M135 300 C205 300 210 195 280 195','M135 195 L280 195','M425 265 C355 265 350 195 280 195','M425 125 C355 125 350 195 280 195'];
export function ResearchAtlas(){
  const [index,setIndex]=useState(0);
  const [pointerWithin,setPointerWithin]=useState(false);
  const [focusWithin,setFocusWithin]=useState(false);
  const [reducedMotion,setReducedMotion]=useState(false);
  const uid=useId().replace(/:/g,'');
  const {locale,motionPaused}=useSite();
  const paused=motionPaused||pointerWithin||focusWithin||reducedMotion;
  useEffect(()=>{
    const preference=window.matchMedia('(prefers-reduced-motion: reduce)');
    const update=()=>setReducedMotion(preference.matches);
    update();
    preference.addEventListener('change',update);
    return()=>preference.removeEventListener('change',update);
  },[]);
  useEffect(()=>{if(paused)return;const id=setInterval(()=>{if(!document.hidden)setIndex(i=>(i+1)%fields.length);},6000);return()=>clearInterval(id);},[paused]);
  const current=fields[index];
  return <div className={`research-atlas theme-${current.theme}`} data-paused={paused}
    onMouseEnter={()=>setPointerWithin(true)} onMouseLeave={()=>setPointerWithin(false)}
    onFocusCapture={()=>setFocusWithin(true)}
    onBlurCapture={event=>{if(!event.currentTarget.contains(event.relatedTarget as Node|null))setFocusWithin(false);}}>
    <div className="atlas-top"><p className="eyebrow"><Copy>{t('Across my work','我的研究与实践')}</Copy></p></div>
    <div className="atlas-map">
      <div className="atlas-lane atlas-lane-lab"><Copy>{t('RESEARCH','科研')}</Copy></div><div className="atlas-lane atlas-lane-analysis"><Copy>{t('ANALYSIS','分析')}</Copy></div>
      <svg viewBox="0 0 560 390" aria-hidden="true"><defs><radialGradient id={`atlas-${uid}`}><stop stopColor="var(--project-color)" stopOpacity=".5"/><stop offset="1" stopColor="var(--project-color)" stopOpacity="0"/></radialGradient></defs><circle cx="280" cy="195" r="140" fill={`url(#atlas-${uid})`}/><circle className="atlas-orbit" cx="280" cy="195" r="86"/><circle className="atlas-orbit inner" cx="280" cy="195" r="69"/>{paths.map((d,i)=><g key={d}><path className="atlas-track" d={d}/><path className={`atlas-signal ${index===i?'active':''}`} d={d}/></g>)}</svg>
      <div className="atlas-core"><span><Copy>{t('Question','问题')}</Copy></span><i>↓</i><strong><Copy>{t('Evidence','证据')}</Copy></strong><i>↓</i><span><Copy>{t('Next step','下一步')}</Copy></span></div>
      {fields.map((field,i)=>{const Icon=field.icon;return <button type="button" key={field.theme} className={`atlas-node atlas-node-${i} theme-${field.theme}`} aria-pressed={index===i} aria-controls={`atlas-story-${uid}`} onClick={()=>setIndex(i)}><Icon size={25} strokeWidth={1.35} aria-hidden="true"/><span><Copy>{field.label}</Copy></span></button>;})}
    </div>
    <div className="atlas-story" id={`atlas-story-${uid}`} key={index}><div><h3><Copy>{current.name}</Copy></h3><p><Copy>{current.note}</Copy></p></div><SiteLink href={current.path} aria-label={locale==='zh'?`查看${current.name.zh}`:`View ${current.name.en}`}><ArrowUpRight size={23} aria-hidden="true"/></SiteLink></div>
  </div>;
}
