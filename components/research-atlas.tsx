'use client';
import { useId, useState } from 'react';
import { ArrowUpRight, FlaskConical, Layers3, Microscope, ChartNoAxesCombined, Pause, Play } from 'lucide-react';
import { Copy, SiteLink, useSite } from './site-context';
import { t } from '@/lib/bilingual';

const fields = [
  { theme:'hubisco', icon:FlaskConical, label:t('Enzyme design','酶设计'), name:'HuBisCO', path:'/projects/hubisco', note:t('Changing substrate chemistry to explore a different route for carbon fixation.','从底物化学出发，探索不同的固碳路线。') },
  { theme:'pet', icon:Layers3, label:t('Biocatalysis','生物催化'), name:t('PET hydrolases','PET 水解酶'), path:'/projects/pet-hydrolase', note:t('Connecting recombinant protein production with catalytic characterisation.','把重组蛋白制备与催化功能表征连接起来。') },
  { theme:'mcr', icon:Microscope, label:t('Antimicrobials','抗菌研究'), name:t('Colistin adjuvants','多黏菌素 E 增效剂'), path:'/projects/mcr1-colistin', note:t('Following a combination effect from growth assays to membrane-level questions.','从组合用药的生长响应，追问细胞膜层面的作用。') },
  { theme:'culture', icon:ChartNoAxesCombined, label:t('Biotech strategy','生技战略'), name:t('3D cell culture','3D 细胞培养'), path:'/intelligence/3d-cell-culture', note:t('Translating material properties into adoption, workflow and investment questions.','把材料性能转化为客户采用、实验流程与投资判断。') },
];
const paths=['M145 100 C190 100 200 170 280 195','M415 100 C370 100 360 170 280 195','M145 290 C190 290 200 220 280 195','M415 290 C370 290 360 220 280 195'];
export function ResearchAtlas(){
  const [index,setIndex]=useState(0),[paused,setPaused]=useState(false);
  const uid=useId().replace(/:/g,'');
  const {locale}=useSite();
  const current=fields[index];
  return <div className={`research-atlas theme-${current.theme}`} data-paused={paused}>
    <div className="atlas-top"><p className="eyebrow"><Copy>{t('Across my work','我的研究与实践')}</Copy></p><button className="atlas-pause" onClick={()=>setPaused(!paused)} aria-label={locale==='zh'?(paused?'播放动画':'暂停动画'):(paused?'Play motion':'Pause motion')}>{paused?<Play size={16}/>:<Pause size={16}/>}</button></div>
    <div className="atlas-map">
      <svg viewBox="0 0 560 390" aria-hidden="true"><defs><radialGradient id={`atlas-${uid}`}><stop stopColor="var(--project-color)" stopOpacity=".5"/><stop offset="1" stopColor="var(--project-color)" stopOpacity="0"/></radialGradient></defs><circle cx="280" cy="195" r="140" fill={`url(#atlas-${uid})`}/><circle className="atlas-orbit" cx="280" cy="195" r="86"/><circle className="atlas-orbit inner" cx="280" cy="195" r="69"/>{paths.map((d,i)=><g key={d}><path className="atlas-track" d={d}/><path className={`atlas-signal ${index===i?'active':''}`} d={d}/></g>)}</svg>
      <div className="atlas-core"><span><Copy>{t('Question','问题')}</Copy></span><i>↓</i><strong><Copy>{t('Evidence','证据')}</Copy></strong><i>↓</i><span><Copy>{t('Next step','下一步')}</Copy></span></div>
      {fields.map((field,i)=>{const Icon=field.icon;return <button key={field.theme} className={`atlas-node atlas-node-${i} theme-${field.theme}`} aria-pressed={index===i} onClick={()=>setIndex(i)}><Icon size={25} strokeWidth={1.35}/><span><Copy>{field.label}</Copy></span></button>;})}
    </div>
    <div className="atlas-story" key={index}><div><h3><Copy>{current.name}</Copy></h3><p><Copy>{current.note}</Copy></p></div><SiteLink href={current.path} aria-label={locale==='zh'?'查看项目':'View project'}><ArrowUpRight size={23}/></SiteLink></div>
  </div>;
}
