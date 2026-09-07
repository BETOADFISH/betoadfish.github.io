'use client';
import { useState } from 'react';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Copy } from './site-context';
import { t } from '@/lib/bilingual';

export function HubiscoConcept(){
  const [mode,setMode]=useState('rubp');
  const proposed=mode==='hubp';
  return <figure className="reaction-concept" data-proposed={proposed}>
    <div className="concept-heading"><h3><Copy>{t('Change the substrate. Change the products.','改变底物，改变反应的产物。')}</Copy></h3><Tabs value={mode} onValueChange={v=>setMode(String(v))}><TabsList aria-label="Reaction scheme"><TabsTrigger value="rubp"><Copy>{t('Native RuBP','天然 RuBP')}</Copy></TabsTrigger><TabsTrigger value="hubp"><Copy>{t('HuBP proposal','HuBP 设计')}</Copy></TabsTrigger></TabsList></Tabs></div>
    <div className="reaction-board" key={mode}>
      <div className="sugar-node"><span className="reaction-kicker"><Copy>{t('Sugar substrate','糖底物')}</Copy></span><strong>{proposed?'HuBP':'RuBP'}</strong><div className="carbon-chain" aria-hidden="true"><b>P</b>{Array.from({length:proposed?6:5},(_,i)=><i className={proposed&&i===0?'extra-carbon':''} key={i}/>)}<b>P</b></div><span><Copy>{proposed?t('6 carbons · two phosphates','6 个碳 · 两个磷酸基团'):t('5 carbons · two phosphates','5 个碳 · 两个磷酸基团')}</Copy></span></div>
      <div className="reaction-branches">
        <div className="reaction-branch"><span className="reaction-gas">+ CO₂</span><i aria-hidden="true"/><div className="reaction-product"><strong>{proposed?'3-PG + 4PE':'2 × 3-PG'}</strong><span><Copy>{t('Carboxylation','羧化反应')}</Copy></span></div></div>
        <div className="reaction-branch oxygen"><span className="reaction-gas">+ O₂</span><i aria-hidden="true"/><div className={`reaction-product ${proposed?'useful':'salvage'}`}><strong>{proposed?'2 × 3-PG':'3-PG + 2-PG'}</strong><span><Copy>{proposed?t('The intended benign oxygenation','设想中的“良性加氧”'):t('2-PG requires photorespiratory recycling','2-PG 需要经光呼吸回收')}</Copy></span></div></div>
      </div>
    </div>
    <figcaption><Copy>{proposed?t('HuBP adds one carbon while retaining both phosphate groups. The proposed oxygenation would produce two 3-PG molecules and avoid 2-PG; this product chemistry remains an experimental goal.','HuBP 多一个碳，同时保留两个磷酸基团。设想中的加氧反应可生成两分子 3-PG，避免生成 2-PG；实现这一反应是酶改造的目标。'):t('RuBisCO normally adds CO₂ to RuBP. Competing oxygenation diverts part of the carbon into 2-PG, whose recovery consumes energy and can release previously fixed CO₂.','RuBisCO 通常将 CO₂ 加到 RuBP 上。竞争性的加氧反应会把部分碳引入 2-PG，其回收消耗能量，也可能释放已经固定的 CO₂。')}</Copy></figcaption>
  </figure>;
}
