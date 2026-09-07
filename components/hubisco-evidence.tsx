'use client';
import { useState } from 'react';
import { Copy } from './site-context';
import { SourceFigure } from './source-figure';
import { t } from '@/lib/bilingual';
const mutants=['I164T','S368C','S368A'] as const;

export function MutantAssays(){
  const [selected,setSelected]=useState<typeof mutants[number]>('I164T');
  return <div><div className="record-tabs" role="group" aria-label="Mutant assays">{mutants.map(name=><button key={name} aria-pressed={selected===name} onClick={()=>setSelected(name)}>{name}</button>)}</div>
    <SourceFigure src={`/evidence/hubisco/${selected.toLowerCase()}-assay.svg`} crop={{width:3243,height:2299,box:[400,210,2475,2089]}} title={t(`${selected}: native and alternative substrates`,`${selected}：天然底物与替代底物`)}
      legend={t(`+ = WT with RuBP; ${selected} + = mutant with RuBP; ${selected} Ru5P = mutant and Ru5P without PRK; ${selected} F6P = mutant with F6P and PHI. The arrow marks substrate addition after 20 minutes.`,`+：WT 与 RuBP；${selected} +：突变体与 RuBP；${selected} Ru5P：突变体与 Ru5P，不加 PRK；${selected} F6P：突变体与 F6P、PHI。箭头表示稳定 20 分钟后加入底物。`)}
      caption={t('The two-hour NADH-coupled readout compares the native positive controls with monophosphate conditions. Weak signals in I164T and S368C were not resolved from background without repeat measurements.','两小时 NADH 偶联读数比较天然底物阳性对照与单磷酸底物条件。I164T、S368C 的部分信号较弱，缺少重复测量，尚不能与背景区分。')}/>
  </div>;
}
export function DockingRecords(){
  const [selected,setSelected]=useState('WT');
  const row=mutants.indexOf(selected as typeof mutants[number]);
  return <div><div className="record-tabs" role="group" aria-label="Docking models">{['WT',...mutants].map(name=><button key={name} aria-pressed={selected===name} onClick={()=>setSelected(name)}>{name}</button>)}</div>
    <SourceFigure src={`/evidence/hubisco/${selected==='WT'?'wt-docking':'mutant-docking'}.svg`} crop={selected==='WT'?{width:1280,height:720,box:[0,0,1280,655]}:{width:2481,height:3508,box:[0,[138,1211,2260][row],2481,[1072,1048,1075][row]]}}
      title={t(`${selected}: phosphate anchoring and orientation`,`${selected}：磷酸锚定与配体方向`)}
      legend={t('Left: HuBP. Right: Hu6P. Violet sticks show the docked six-carbon ligand; the element-coloured ball-and-stick model shows crystallographic RuBP. P1/P5/P6 label terminal phosphates. Arrows locate the mutation; dashed lines mark candidate-contact distances.','左侧为 HuBP，右侧为 Hu6P。紫色棒状模型表示预测的六碳配体，按元素着色的球棒模型表示晶体结构中的 RuBP。P1/P5/P6 标注末端磷酸；箭头定位突变位点，虚线标示潜在接触距离。')}
      caption={selected==='I164T'?t('I164T suggests a new polar contact for HuBP, while Hu6P can reverse its orientation. The 4.02 Å HuBP contact is a design clue, not an established hydrogen bond.','I164T 提示 HuBP 可能形成新的极性接触，而 Hu6P 可出现反向构象。HuBP 图中的 4.02 Å 接触为设计提供线索，尚不能认定为氢键。'):selected==='WT'?t('HuBP retains the C1 phosphate anchor but its sugar geometry remains distorted. Hu6P lacks this anchor and has a less constrained orientation.','HuBP 保留 C1 磷酸锚定，但糖骨架仍有偏移；Hu6P 缺少这一定位作用，方向更不受约束。'):t('Changing S368 loosens a phosphate-side interaction. Extra space alone did not improve substrate positioning in these models.','改变 S368 会松动磷酸端的相互作用。在这些模型中，增加空间本身并未改善底物定位。')}/>
  </div>;
}
