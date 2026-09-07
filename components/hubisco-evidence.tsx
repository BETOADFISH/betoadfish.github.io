'use client';
import { useState } from 'react';
import { Copy, SiteLink } from './site-context';
import { SourceFigure } from './source-figure';
import { t } from '@/lib/bilingual';
import scores from '@/lib/docking-scores.json';
const mutants = ['I164T','S368C','S368A'] as const;
export function MutantAssays() {
  const [selected,setSelected] = useState<typeof mutants[number]>('I164T');
  return <div><div className="record-tabs" aria-label="Mutant assays">{mutants.map(name => <button key={name} aria-pressed={selected===name} onClick={()=>setSelected(name)}>{name}</button>)}</div>
    <SourceFigure src={`/evidence/hubisco/${selected.toLowerCase()}-assay.svg`} crop={{width:3243,height:2299,box:[400,210,2475,2089]}} title={t(`${selected}: native and exploratory substrate conditions`, `${selected}：天然底物与替代底物实验`)} caption={t('The RuBP condition provides a positive activity control. PRK/Ru5P and PHI/F6P conditions examine the supporting-enzyme routes. Arrows mark substrate addition; the original traces and annotations are retained.', 'RuBP 条件用于确认酶仍有活性；PRK/Ru5P 和 PHI/F6P 条件用于考察辅助酶参与的底物路线。箭头标出底物加入时间，曲线及标注均保留自原始实验图。')} notes={t('Weak exploratory signals in I164T and S368C were not resolved from background. These assays lacked repeat measurements. Source rate labels are retained as reported estimates, not newly fitted or independently validated kinetic constants.', 'I164T 和 S368C 的部分探索条件出现微弱信号，但尚不能与背景区分。这组实验没有重复测量；图中的速率标注是原报告的估计值，本站未重新拟合，也未将其作为已验证的动力学常数。')} source={t('Project dissertation, mutant assays; original I164T, S368C and S368A assay figures.', '来源：项目论文中的突变体实验章节及 I164T、S368C、S368A 原始实验图。')}/>
  </div>;
}
export function DockingRecords() {
  const [selected,setSelected] = useState('WT');
  const row = mutants.indexOf(selected as typeof mutants[number]);
  return <div><div className="record-tabs" aria-label="Docking models">{['WT',...mutants].map(name=><button key={name} aria-pressed={selected===name} onClick={()=>setSelected(name)}>{name}</button>)}</div>
    <SourceFigure src={`/evidence/hubisco/${selected==='WT'?'wt-docking':'mutant-docking'}.svg`} crop={selected==='WT'?{width:1280,height:720,box:[0,0,1280,655]}:{width:2481,height:3508,box:[0,[138,1211,2260][row],2481,[1072,1048,1075][row]]}} title={t(`${selected}: HuBP and Hu6P poses`,`${selected}：HuBP 与 Hu6P 对接构象`)} caption={t('Original docking panels compare the two six-carbon ligands in the modelled active site. Distances describe candidate contacts in a predicted pose; they do not establish a hydrogen bond or a catalytic geometry.', '原始对接图比较两种六碳配体在模型活性位点中的位置。标注距离描述预测构象中的潜在接触，不能据此确认氢键形成或催化构象。')} notes={t('The mutant source figure is shown one pair of panels at a time for readability. Open the full image for the complete six-panel record. Docking is a hypothesis-generating model, not a measurement of turnover.', '为方便阅读，突变体原图按每个突变体的两个面板分组展示；点击原图可查看完整六面板记录。对接用于提出后续实验假设，不代表已测得催化活性。')} source={t('Project dissertation, AutoDock Vina structural analysis; original WT and mutant docking figures.', '来源：项目论文 AutoDock Vina 结构分析章节，以及 WT 和突变体原始对接图。')}/>
    <h3><Copy>{t('The retained Vina score matrix','原始 Vina 打分记录')}</Copy></h3><p className="small muted"><Copy>{t('kcal/mol, as exported. A more negative model score does not demonstrate stronger experimental binding or faster catalysis. Hu6P is labelled H6P in the source files.','单位为 kcal/mol，保留导出值。更负的模型打分不等于实测结合更强或催化更快；原文件中的 H6P 在此统一写为 Hu6P。')}</Copy></p>
    <div className="comparison-scroll"><table className="comparison-table"><thead><tr><th><Copy>{t('Model','蛋白模型')}</Copy></th>{['RuBP','HuBP','Hu6P','Ru5P','F6P'].map(x=><th key={x}>{x}</th>)}</tr></thead><tbody>{['WT',...mutants].map(protein=><tr key={protein}><td>{protein}</td>{['RuBP','HuBP','Hu6P','Ru5P','F6P'].map(ligand=><td key={ligand}>{scores.find(x=>x.protein===protein&&x.ligand===ligand)?.score.toFixed(3)}</td>)}</tr>)}</tbody></table></div><SiteLink className="text-link" href="/data/hubisco-docking.csv" download><Copy>{t('Download docking records (CSV) ↓','下载 docking 数据（CSV）↓')}</Copy></SiteLink>
  </div>;
}
