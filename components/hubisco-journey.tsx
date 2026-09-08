'use client';
import { useState } from 'react';
import { ArrowLeft, ArrowRight, ChevronDown, Check, FlaskConical, ScanLine, Compass } from 'lucide-react';
import { VinaTerminal } from './vina-terminal';
import { ProjectJourney } from './project-journey';
import { Copy, useSite } from './site-context';
import { SourceFigure } from './source-figure';
import { StructureViewer } from './structure-viewer';
import { MutantAssays, DockingRecords } from './hubisco-evidence';
import { journey } from '@/lib/hubisco-journey';
import { t } from '@/lib/bilingual';
import type { CopyText } from '@/lib/bilingual';

function Flow({nodes}:{nodes:[CopyText,CopyText][]}){
  return <div className="process-flow">{nodes.map(([name,note],i)=><div className="process-unit" key={i}><div className="process-node"><strong><Copy>{name}</Copy></strong><span><Copy>{note}</Copy></span></div>{i<nodes.length-1&&<ArrowRight className="flow-arrow" aria-hidden="true"/>}</div>)}</div>;
}
function JourneyVisual({index}:{index:number}){
  if(index===0)return <div className="journey-visual precursor-visual"><span className="visual-kicker"><Copy>{t('The accessible route','可行的供给路线')}</Copy></span><Flow nodes={[[t('F6P','F6P'),t('Available substrate','可获得的底物')],['PHI',t('Isomerisation','异构化')],['Hu6P',t('Six-carbon precursor','六碳前体')]]}/><div className="missing-anchor"><span>Hu6P</span><i>·····</i><span>HuBP</span><small><Copy>{t('C1 phosphorylation remained unresolved','C1 磷酸化尚待解决')}</Copy></small></div></div>;
  if(index===1)return <div className="journey-visual mutation-visual"><span className="visual-kicker"><Copy>{t('Three local changes','三个局部改变')}</Copy></span><div className="mutation-cards">{[['I164T','I → T',t('Add a hydroxyl','引入羟基')],['S368A','S → A',t('Remove a hydroxyl','去掉羟基')],['S368C','S → C',t('Alter the interaction','改变接触性质')]].map(([name,change,note])=><div key={String(name)}><span><Copy>{change}</Copy></span><strong><Copy>{name}</Copy></strong><p><Copy>{note}</Copy></p></div>)}</div><p className="visual-note"><Copy>{t('Space and orientation have to be considered together.','空间与方向，需要一起考虑。')}</Copy></p></div>;
  if(index===2)return <div className="journey-visual assay-visual"><span className="visual-kicker"><Copy>{t('From product to readout','从产物到读数')}</Copy></span><Flow nodes={[[t('3-PG','3-PG'),t('Reaction product','反应产物')],['PGK / GAPDH',t('Coupled enzymes','偶联酶')],['NADH ↓',t('Absorbance at 340 nm','340 nm 吸光度')]]}/><div className="control-pair"><span><Check size={17}/><Copy>{t('RuBP positive control','RuBP 阳性对照')}</Copy></span><span><ScanLine size={17}/><Copy>{t('Supporting-enzyme controls','辅助酶对照')}</Copy></span></div></div>;
  if(index===3)return <figure className="journey-visual nmr-summary"><span className="visual-kicker"><Copy>{t('Hu6P : F6P peak-area ratio','Hu6P : F6P 峰面积比')}</Copy></span><div className="nmr-bars">{[[24,.035],[144,.196]].map(([time,value])=><div className="nmr-bar-column" key={time}><strong>{value.toFixed(3)}</strong><div className="nmr-bar-track"><i style={{height:`${value/.2*100}%`}}/></div><span>{time} h</span></div>)}</div><figcaption><Copy>{t('Two measured time points. The ratio tracks precursor conversion, not RuBisCO turnover.','两个测量时间点。比值反映前体转化，不代表 RuBisCO 催化周转。')}</Copy></figcaption></figure>;
  if(index===4)return <div className="journey-visual activity-visual"><span className="visual-kicker"><Copy>{t('Native-substrate activity','天然底物活性')}</Copy></span><div className="active-proteins">{['I164T','S368C','S368A'].map(name=><div key={name}><FlaskConical size={27} strokeWidth={1.2}/><strong>{name}</strong><span><Check size={15}/><Copy>{t('RuBP activity','RuBP 活性')}</Copy></span></div>)}</div><div className="activity-question"><span>Hu6P / Ru5P</span><strong><Copy>{t('Signal unresolved','信号尚未明确')}</Copy></strong></div></div>;
  return <VinaTerminal/>;
}

function ProteinEvidence(){
  const [view,setView]=useState('native');
  return <div><div className="record-tabs" role="group" aria-label="Protein experiments">{[['native',t('Native activity','天然活性')],['purification',t('Purification','蛋白纯化')],['alternative',t('Alternative substrates','替代底物')]].map(([id,label])=><button key={String(id)} aria-pressed={view===id} onClick={()=>setView(String(id))}><Copy>{label}</Copy></button>)}</div>
    {view==='alternative'?<MutantAssays/>:view==='purification'?<SourceFigure src="/evidence/hubisco/purification.webp" crop={{width:708,height:1146,box:[18,44,680,1095]}} title={t('Expression and purification','表达与纯化')}
      legend={t('(a) Fractions from WT purification. (b) Final WT, I164T, S368C, S368A and PHI samples. The molecular-weight marker is in kDa; RuBisCO monomer is approximately 53 kDa and PHI approximately 20 kDa.','（a）WT 纯化各阶段样品；（b）WT、I164T、S368C、S368A 与 PHI 的最终样品。分子量标记单位为 kDa；RuBisCO 单体约 53 kDa，PHI 约 20 kDa。')}
      caption={t('The target bands become enriched during purification. SUMO cleavage reduces the apparent size of the RuBisCO fusion protein; the paler S368C lane reflects lower sample loading.','目标条带在纯化后富集。SUMO 切除使 RuBisCO 融合蛋白的表观分子量降低；S368C 泳道较浅，与上样量较少有关。')}/>:<SourceFigure src="/evidence/hubisco/native-mutants.svg" title={t('All three mutants retain RuBP activity','三个突变体均保留 RuBP 活性')}
      legend={t('+ denotes the WT–RuBP positive control. I164T, S368C and S368A denote the corresponding mutant with RuBP. The arrow marks substrate addition after 20 minutes; the curves follow the two-hour NADH-coupled response.','+ 表示 WT–RuBP 阳性对照；I164T、S368C、S368A 表示各突变体与 RuBP。箭头表示稳定 20 分钟后加入底物，曲线记录两小时的 NADH 偶联响应。')}
      caption={t('Each mutant gives a measurable native-substrate response. Protein inputs differ between traces, so the raw slopes do not rank intrinsic activity.','每个突变体都给出可测的天然底物响应。各曲线使用的蛋白量不同，不能直接用斜率排列酶的本征活性。')}/>}
  </div>;
}

function Evidence({index}:{index:number}){
  if(index===0)return <SourceFigure src="/evidence/hubisco/reaction-scheme.svg" title={t('Native chemistry and the HuBP proposal','天然反应与 HuBP 反应设计')}
    legend={t('CO₂ and O₂ label carboxylation and oxygenation. RuBP is a five-carbon sugar; HuBP is a six-carbon sugar. 3-PG is 3-phosphoglycerate, 2-PG is 2-phosphoglycolate and 4PE is 4-phosphoerythronate.','CO₂ 和 O₂ 分别标示羧化与加氧。RuBP 为五碳糖，HuBP 为六碳糖。3-PG 为 3-磷酸甘油酸，2-PG 为 2-磷酸乙醇酸，4PE 为 4-磷酸赤藓糖酸。')}
    caption={t('The extra carbon changes the proposed oxygenation products to two molecules of 3-PG. The HuBP reactions are the design target; these experiments used the accessible precursor Hu6P.','额外的一个碳，使设想中的加氧产物变为两分子 3-PG。HuBP 反应是设计目标，本阶段实验使用可获得的前体 Hu6P。')}/>;
  if(index===1)return <StructureViewer/>;
  if(index===2)return <><SourceFigure src="/evidence/hubisco/coupled-assay.svg" title={t('NADH-coupled assay','NADH 偶联检测体系')}
    legend={t('PRK converts Ru5P to RuBP; PHI converts F6P to Hu6P. PGK and GAPDH couple downstream 3-PG formation to NADH consumption. A340 monitors the reporter.','PRK 将 Ru5P 转化为 RuBP，PHI 将 F6P 转化为 Hu6P；PGK 和 GAPDH 把下游 3-PG 的生成与 NADH 消耗相连，以 A340 检测。')}
    caption={t('The Hu6P-to-3-PG arrow marks the reaction being tested. RuBP provides the established positive-control route.','Hu6P 指向 3-PG 的箭头表示待检验的反应；RuBP 路线用于建立阳性对照。')}/>
    <SourceFigure src="/evidence/hubisco/native-assay.webp" title={t('WT: establishing the activity benchmark','WT：建立活性检测基准')}
      legend={t('+ = RuBP; PRK+ / PRK− = Ru5P with / without PRK; PHI+ / PHI− = F6P with / without PHI. All groups contain WT RuBisCO. The arrow marks substrate addition after 20 minutes.','+：RuBP；PRK+ / PRK−：Ru5P 加 / 不加 PRK；PHI+ / PHI−：F6P 加 / 不加 PHI。各组均含 WT RuBisCO。箭头表示稳定 20 分钟后加入底物。')}
      caption={t('Time is shown across two hours; the vertical axis is the calibrated NADH response in mM. RuBP and PRK+ give clear responses, establishing the native-substrate benchmark.','横轴为两小时内的时间，纵轴为换算后的 NADH 响应，单位 mM。RuBP 与 PRK+ 条件给出明显信号，确立天然底物检测基准。')}/></>;
  if(index===3)return <SourceFigure src="/evidence/hubisco/nmr.webp" title={t('³¹P NMR: precursor conversion over time','³¹P NMR：前体随时间转化')}
    legend={t('Spectra correspond to 0, 24 and 144 h. The F6P peak is near 3.75 ppm; the rising peak near 4.25 ppm is assigned to Hu6P. Peak areas give the Hu6P:F6P ratio.','谱图对应 0、24 和 144 h。约 3.75 ppm 的峰为 F6P，约 4.25 ppm 逐渐升高的峰归属于 Hu6P；通过峰面积计算 Hu6P:F6P 比值。')}
    caption={t('At 298 K, the ratio increased from 0.035 at 24 h to 0.196 at 144 h. This supports slow PHI-mediated precursor conversion and motivates pre-incubation before the RuBisCO assay.','在 298 K 下，该比值由 24 h 的 0.035 升至 144 h 的 0.196，支持较慢的 PHI 前体转化，也为先预孵育、再进行 RuBisCO 检测提供依据。')}/>;
  if(index===4)return <ProteinEvidence/>;
  return <><DockingRecords/><details className="secondary-evidence"><summary><Copy>{t('RuBP reference comparison','RuBP 参照构象比较')}</Copy></summary><SourceFigure src="/evidence/hubisco/rubp-redocking.svg" crop={{width:1280,height:720,box:[32,0,1216,720]}} title={t('RuBP redocking','RuBP 重对接')}
    legend={t('Violet sticks show the docked RuBP; the grey-backbone ball-and-stick model shows crystallographic RuBP in 9RUB. P1/P5 mark phosphates and O2/O3 identify the reactive end of the sugar.','紫色棒状模型表示重对接的 RuBP；灰色骨架球棒模型表示 9RUB 晶体结构中的 RuBP。P1/P5 标注磷酸，O2/O3 标注糖的反应端。')}
    caption={t('The overall pose provides a qualitative reference, while local differences around O3 limit precise geometric interpretation.','整体构象提供定性参照，O3 附近的局部偏差提示精细几何解释仍有局限。')}/></details></>;
}

export function HubiscoJourney(){
 return <ProjectJourney steps={journey} visuals={journey.map((_,i)=><JourneyVisual index={i} key={i}/>)} evidence={journey.map((_,i)=><Evidence index={i} key={i}/>)} evidenceLabels={journey.map((_,i)=>i===1?t('Explore the structure','查看结构'):t('Figures and legends','实验图与图注'))}/>;
}
