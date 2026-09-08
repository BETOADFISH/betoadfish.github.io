'use client';
import { useEffect, useState } from 'react';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Copy, useSite } from './site-context';
import { ArrowRight } from 'lucide-react';
import { t } from '@/lib/bilingual';

export function HubiscoConcept(){
  const [mode,setMode]=useState('rubp'),[ready,setReady]=useState(false);
  useEffect(()=>setReady(true),[]);
  const proposed=mode==='hubp';
  const {locale}=useSite();
  return <figure className="reaction-concept" data-proposed={proposed}>
    <div className="concept-heading"><div><span className="eyebrow"><Copy>{t('Reaction comparison','反应对比')}</Copy></span><h3><Copy>{t('One extra carbon. Different products.','多一个碳，产物如何改变？')}</Copy></h3></div><Tabs value={mode} onValueChange={v=>setMode(String(v))}><TabsList aria-label={locale==='zh'?'选择底物反应':'Choose substrate reaction'}><TabsTrigger id="reaction-tab-rubp" value="rubp" disabled={!ready}><Copy>{t('Native RuBP','天然 RuBP')}</Copy></TabsTrigger><TabsTrigger id="reaction-tab-hubp" value="hubp" disabled={!ready}><Copy>{t('HuBP proposal','HuBP 设计')}</Copy></TabsTrigger></TabsList></Tabs></div>
    <div className="reaction-board" key={mode} aria-live="polite" aria-atomic="true">
      <div className="sugar-node"><span className="reaction-kicker"><Copy>{t('Sugar substrate','糖底物')}</Copy></span><strong>{proposed?'HuBP':'RuBP'}</strong><div className="carbon-chain" aria-hidden="true"><b>P</b>{Array.from({length:proposed?6:5},(_,i)=><i className={proposed&&i===0?'extra-carbon':''} key={i}/>)}<b>P</b></div><span><Copy>{proposed?t('6 carbons · two phosphates','6 个碳 · 两个磷酸基团'):t('5 carbons · two phosphates','5 个碳 · 两个磷酸基团')}</Copy></span></div>
      <div className="reaction-branches">
        <div className="reaction-branch"><div className="reaction-route"><span className="reaction-gas">+ CO₂</span><ArrowRight aria-hidden="true"/></div><div className="reaction-product"><strong>{proposed?<><span>3-PG</span> + <span>4PE</span></>:<><span>2 × 3-PG</span></>}</strong><span><Copy>{t('Carboxylation','羧化反应')}</Copy></span></div></div>
        <div className="reaction-branch oxygen"><div className="reaction-route"><span className="reaction-gas">+ O₂</span><ArrowRight aria-hidden="true"/></div><div className={`reaction-product ${proposed?'useful':'salvage'}`}><strong>{proposed?<><span>2 × 3-PG</span></>:<><span>3-PG</span> + <span>2-PG</span></>}</strong><span><Copy>{proposed?t('Proposed oxygenation products','设想中的加氧产物'):t('2-PG enters photorespiratory recycling','2-PG 进入光呼吸回收')}</Copy></span></div></div>
      </div>
    </div>
    <figcaption><p><Copy>{proposed?t('HuBP retains both phosphates and adds one carbon. Its proposed oxygenation avoids 2-PG; the diagram shows the design target, not a reaction established in this project.','HuBP 保留两个磷酸基团，并多出一个碳。设想中的加氧反应可避免生成 2-PG；图中展示的是设计目标，本项目尚未实现这一反应。'):t('RuBP carboxylation produces two 3-PG molecules. Oxygenation instead produces 3-PG and 2-PG; recycling 2-PG consumes energy and can release fixed CO₂.','RuBP 羧化生成两分子 3-PG；加氧则生成 3-PG 与 2-PG。回收 2-PG 会消耗能量，也可能释放已固定的 CO₂。')}</Copy></p><p className="reaction-key"><Copy>{t('Dots = carbon atoms · P = phosphate · 3-PG = 3-phosphoglycerate · 2-PG = 2-phosphoglycolate · 4PE = 4-phosphoerythronate.','圆点：碳原子；P：磷酸基团。3-PG：3-磷酸甘油酸；2-PG：2-磷酸乙醇酸；4PE：4-磷酸赤藓糖酸。')}</Copy></p></figcaption>
  </figure>;
}
