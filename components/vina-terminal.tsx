'use client';
import { useEffect, useRef, useState } from 'react';
import { Check, ChevronRight, FileCode2, RotateCcw, TerminalSquare } from 'lucide-react';
import { Copy, useSite } from './site-context';
import { t } from '@/lib/bilingual';
import records from '@/lib/vina-replay.json';

const ligands=['RuBP','HuBP','Hu6P'];
const receptors=['WT','I164T','S368C','S368A'];
const duration=80, total=duration*ligands.length;
const atomColour:Record<string,string>={C:'#abc2b0',O:'#f08f83',P:'#e5c071',N:'#85b6ed',S:'#e5c071'};
type PoseRecord=typeof records[number];

function Pose({record,angle}:{record:PoseRecord;angle:number}){
 const atoms=record.atoms.map(a=>({element:String(a[0]),x:Number(a[1]),y:Number(a[2]),z:Number(a[3])}));
 const centre=atoms.reduce((c,a)=>[c[0]+a.x/atoms.length,c[1]+a.y/atoms.length,c[2]+a.z/atoms.length],[0,0,0]);
 const radius=Math.max(...atoms.map(a=>Math.hypot(a.x-centre[0],a.y-centre[1],a.z-centre[2])));
 const yaw=angle*Math.PI/180,tilt=-.35,scale=70/radius;
 const points=atoms.map(a=>{const x=a.x-centre[0],y=a.y-centre[1],z=a.z-centre[2];const rx=x*Math.cos(yaw)+z*Math.sin(yaw),rz=-x*Math.sin(yaw)+z*Math.cos(yaw);return {x:130+rx*scale,y:105+(y*Math.cos(tilt)-rz*Math.sin(tilt))*scale,z:y*Math.sin(tilt)+rz*Math.cos(tilt),element:a.element};});
 return <svg className="vina-molecule" viewBox="0 0 260 210" role="img" aria-label={record.protein+' / '+record.ligand+' · Vina pose 1'}><g className="vina-coordinate-grid" aria-hidden="true"><path d="M36 149 130 189 224 149 130 109Z M36 61 130 21 224 61 224 149 M36 61 36 149 M36 61 130 101 224 61 M130 101 130 189"/><circle cx="130" cy="105" r="78"/></g><g>{record.bonds.map(([i,j])=>{const a=points[i],b=points[j];return <g key={i+'-'+j}><line x1={a.x} y1={a.y} x2={(a.x+b.x)/2} y2={(a.y+b.y)/2} stroke={atomColour[a.element]}/><line x1={(a.x+b.x)/2} y1={(a.y+b.y)/2} x2={b.x} y2={b.y} stroke={atomColour[b.element]}/></g>;})}</g><g>{points.map((p,i)=>({...p,i})).sort((a,b)=>a.z-b.z).map(p=><circle key={p.i} cx={p.x} cy={p.y} r={p.element==='P'?6:4.4} fill={atomColour[p.element]} stroke="#132019" strokeWidth="1.2"/>)}</g></svg>;
}

export function VinaTerminal(){
 const {locale,motionPaused}=useSite();
 const [protein,setProtein]=useState('WT'),[frame,setFrame]=useState(0),[visible,setVisible]=useState(false),[foreground,setForeground]=useState(true);
 const surface=useRef<HTMLElement>(null);
 const complete=frame>=total,index=Math.min(2,Math.floor(frame/duration)),phase=complete?duration:frame-index*duration;
 const ligand=ligands[index],record=records.find(r=>r.protein===protein&&r.ligand===ligand)!;
 const finished=complete?3:Math.min(3,index+(phase>=66?1:0));
 const playing=visible&&foreground&&!motionPaused;
 useEffect(()=>{const observer=new IntersectionObserver(([entry])=>setVisible(entry.isIntersecting),{threshold:.12});if(surface.current)observer.observe(surface.current);const update=()=>setForeground(!document.hidden);document.addEventListener('visibilitychange',update);update();if(matchMedia('(prefers-reduced-motion: reduce)').matches)setFrame(total);return()=>{observer.disconnect();document.removeEventListener('visibilitychange',update);};},[]);
 useEffect(()=>{if(!playing)return;let last=performance.now();const id=window.setInterval(()=>{const now=performance.now(),delta=Math.min(now-last,100);last=now;setFrame(f=>f>=total+40?0:f+delta/100);},50);return()=>clearInterval(id);},[playing]);
 function replay(start=0){setFrame(motionPaused?Math.min(total,start+duration-1):start);}
 const receptor=protein==='WT'?'9RUB_ChainA':protein;
 const command='vina --config config.txt\n  --receptor receptor/'+receptor+'.pdbqt\n  --ligand ligands_pdbqt/'+record.file+'.pdbqt\n  --out output/'+record.file+'_out.pdbqt';
 const typed=command.slice(0,Math.floor(Math.min(1,phase/24)*command.length));
 const progress=Math.round(Math.max(0,Math.min(100,(phase-36)/26*100)));
 const status=complete?t('Replay complete','回放完成'):phase<24?t('Command','输入命令'):phase<36?t('Preparation','读取结构'):phase<66?t('Docking','对接过程'):t('Recorded output','读取原始结果');
 return <section ref={surface} className="vina-workbench" data-running={playing} data-ligand={ligand} aria-labelledby="vina-workbench-title">
  <header className="vina-window-bar"><div className="vina-window-title"><TerminalSquare size={17}/><span id="vina-workbench-title">HuBisCO <i>/</i> AutoDock Vina</span></div><span className="vina-replay-badge"><i/><Copy>{t('Workflow replay','工作流回放')}</Copy></span></header>
  <div className="vina-workspace">
   <aside className="vina-sidebar"><label htmlFor="vina-receptor"><Copy>{t('Receptor model','受体模型')}</Copy></label><select id="vina-receptor" value={protein} onChange={e=>{setProtein(e.target.value);setFrame(0);}}>{receptors.map(r=><option key={r}>{r}</option>)}</select><p className="vina-queue-label"><Copy>{t('Ligand queue','配体队列')}</Copy><span>{finished}/3</span></p><div className="vina-queue">{ligands.map((l,i)=><button key={l} className={i===index?'active':''} aria-pressed={i===index} aria-label={(locale==='zh'?'回放 ':'Replay ')+l} onClick={()=>replay(i*duration)}><FileCode2 size={16}/><span>{l}</span>{i<finished?<Check size={15}/>:i===index?<span className="vina-queue-dot"/>:<span className="vina-queue-number">0{i+1}</span>}</button>)}</div><p className="vina-source-type">PDBQT <span>→</span> Vina</p></aside>
   <div className="vina-console"><div className="vina-console-heading"><span><ChevronRight size={15}/> terminal</span><span><Copy>{status}</Copy></span></div><div className="vina-console-content" aria-label={locale==='zh'?'Vina 命令与输出演示':'Vina command and output demonstration'}><p className="vina-comment"># <Copy>{t('Illustrative command · original output','命令示意 · 原始结果')}</Copy></p><pre className="vina-command"><span className="vina-prompt">$ </span>{typed}<span className="vina-caret" aria-hidden="true"/></pre><div className="vina-log" style={{visibility:phase>=24?'visible':'hidden'}}><p>AutoDock Vina</p><p className="vina-log-muted">Reading {record.file}.pdbqt … <span>done</span></p><p className="vina-log-muted" style={{visibility:phase>=31?'visible':'hidden'}}>Computing Vina grid … <span>done</span></p><div className="vina-progress-row" style={{visibility:phase>=36?'visible':'hidden'}}><span><Copy>{t('Search replay','搜索演示')}</Copy></span><b>{progress}%</b></div><div className="vina-progress" style={{visibility:phase>=36?'visible':'hidden'}}><i style={{width:progress+'%'}}/></div><div className="vina-mode-output" style={{visibility:phase>=66?'visible':'hidden'}}><table aria-label={locale==='zh'?'原始 Vina 前三个构象打分':'Original Vina scores for the first three poses'}><thead><tr><th>mode</th><th>kcal/mol</th><th>rmsd l.b.</th><th>rmsd u.b.</th></tr></thead><tbody>{record.modes.map((m,i)=><tr key={i}><td>{i+1}</td>{m.map((n,j)=><td key={j}>{n.toFixed(3)}</td>)}</tr>)}</tbody></table><p className="vina-output-path">✓ output/{record.file}_out.pdbqt</p></div></div></div></div>
   <aside className="vina-results"><div className="vina-pose-title"><span><Copy>{t('Recorded pose 1','原始构象 1')}</Copy></span><strong>{ligand}</strong></div><Pose record={record} angle={frame*1.8}/><div className="vina-atom-key"><span><i style={{background:atomColour.C}}/>C</span><span><i style={{background:atomColour.O}}/>O</span><span><i style={{background:atomColour.P}}/>P</span><small><Copy>{t('Heavy atoms','重原子')}</Copy></small></div><div className="vina-score-list" aria-label={locale==='zh'?'已回放的原始最佳构象打分':'Replayed original top-pose scores'}><p><Copy>{t('Recorded scores','原始打分')}</Copy><span>kcal/mol</span></p>{ligands.map((l,i)=><div key={l} className={i<finished?'revealed':''}><span>{l}</span><strong>{i<finished?records.find(r=>r.protein===protein&&r.ligand===l)!.modes[0][0].toFixed(3):'—'}</strong></div>)}</div></aside>
  </div>
  <footer className="vina-controls"><p><span className="vina-status-dot"/><Copy>{t('Recorded poses and scores. Animation is illustrative.','构象与打分来自原始记录，过程为动画演示。')}</Copy></p><div><button onClick={()=>replay()} aria-label={locale==='zh'?'重新播放对接流程':'Replay docking workflow'}><RotateCcw size={15}/><Copy>{t('Replay','重播')}</Copy></button><button className="vina-show-results" onClick={()=>setFrame(total)} disabled={complete}><Copy>{t('Show results','查看结果')}</Copy><ChevronRight size={15}/></button></div></footer>
  <p className="vina-method-note"><Copy>{t('Each molecule is the top pose from the selected model’s original PDBQT output. Rotation changes the viewing angle; it does not reconstruct the search trajectory. Vina scores are model estimates, not measured affinity or catalytic activity.','分子显示所选模型原始 PDBQT 输出中的第一构象。旋转仅改变观察角度，并非重现搜索轨迹。Vina 打分是模型估计，不代表实测亲和力或催化活性。')}</Copy></p>
 </section>;
}
