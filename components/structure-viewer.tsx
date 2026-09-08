'use client';
import { Copy, SiteLink, useSite } from '@/components/site-context';
import { useEffect, useRef, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { RotateCcw, Play, Pause, ZoomIn, ZoomOut } from 'lucide-react';
import { project } from '@/lib/projectData';
import { t } from '@/lib/bilingual';

type NglModule = typeof import('ngl');
type Stage = InstanceType<NglModule['Stage']>;
type MolecularComponent = InstanceType<NglModule['StructureComponent']>;
type MolecularRepresentation = InstanceType<NglModule['RepresentationElement']>;

export function StructureViewer({ compact = false }: { compact?: boolean }) {
  const { tr, dark, motionPaused } = useSite();
  const host = useRef<HTMLDivElement>(null);
  const stageRef = useRef<Stage|null>(null);
  const compRef = useRef<MolecularComponent|null>(null);
  const focusReps = useRef<MolecularRepresentation[]>([]);
  const [structure,setStructure] = useState('9RUB');
  const [selected,setSelected] = useState('Overview');
  const [state,setState] = useState<'loading'|'ready'|'error'>('loading');
  const [activated,setActivated] = useState(compact);
  const [spinning,setSpinning] = useState(false);
  const [retry,setRetry] = useState(0);
  const [stageVersion,setStageVersion] = useState(0);
  const residues = project.residues.filter(r=>r.id!=='Loops');
  const residue = residues.find(r=>r.id===selected);

  useEffect(()=>{
    if(activated || !host.current) return;
    const observer=new IntersectionObserver(entries=>{
      if(entries.some(entry=>entry.isIntersecting)) { setActivated(true); observer.disconnect(); }
    },{rootMargin:'250px'});
    observer.observe(host.current);
    return ()=>observer.disconnect();
  },[activated]);

  // One renderer per mounted viewer. Switching a PDB replaces only its component.
  useEffect(()=>{
    if(!activated || !host.current) return;
    let cancelled=false;
    let ownedStage:Stage|undefined;
    let resize:ResizeObserver|undefined;
    const container=host.current;
    setState('loading');
    import('ngl').then(NGL=>{
      if(cancelled) return;
      ownedStage=new NGL.Stage(container,{
        backgroundColor:document.documentElement.dataset.theme==='dark'?'#17221b':'#fafcf9',
        quality:'medium',cameraType:'orthographic',sampleLevel:0,
      });
      stageRef.current=ownedStage;
      ownedStage.mouseControls.remove('scroll');
      resize=new ResizeObserver(()=>ownedStage?.handleResize());
      resize.observe(container);
      ownedStage.handleResize();
      setStageVersion(v=>v+1);
    }).catch(()=>{if(!cancelled)setState('error');});
    return ()=>{
      cancelled=true;
      resize?.disconnect();
      if(ownedStage){
        ownedStage.setSpin(false);
        ownedStage.animationControls.pause();
        ownedStage.removeAllComponents();
        ownedStage.dispose();
      }
      if(stageRef.current===ownedStage){
        stageRef.current=null; compRef.current=null; focusReps.current=[];
      }
    };
  },[activated,retry]);

  useEffect(()=>{
    const stage=stageRef.current;
    if(!stage || !stageVersion) return;
    let cancelled=false;
    let ownedComp:MolecularComponent|undefined;
    const controller=new AbortController();
    const timeout=setTimeout(()=>controller.abort(),18000);
    setState('loading');setSelected('Overview');setSpinning(false);
    stage.setSpin(false);
    compRef.current=null;focusReps.current=[];
    stage.removeAllComponents();
    async function load(){
      try{
        const response=await fetch(`/structures/${structure}.pdb`,{signal:controller.signal});
        if(!response.ok)throw new Error('Structure unavailable');
        const blob=await response.blob();
        if(cancelled)return;
        const loaded=await stage!.loadFile(blob,{ext:'pdb'});
        if(!loaded)throw new Error('Structure unavailable');
        ownedComp=loaded as MolecularComponent;
        if(cancelled || stageRef.current!==stage){stage!.removeComponent(ownedComp);return;}
        compRef.current=ownedComp;
        ownedComp.addRepresentation('cartoon',{sele:'protein and :A',color:'#85ba8a',quality:'medium',aspectRatio:4});
        ownedComp.addRepresentation('cartoon',{sele:'protein and :B',color:'#466f62',quality:'medium',aspectRatio:4});
        if(structure==='9RUB'){
          ownedComp.addRepresentation('ball+stick',{sele:'[RUB]',colorScheme:'element',scale:1.3});
          ownedComp.addRepresentation('spacefill',{sele:'[MG]',color:'#a285cf',scale:.65});
        }
        ownedComp.autoView('protein',0);
        stage!.handleResize();
        setState('ready');
      }catch{if(!cancelled)setState('error');}
      finally{clearTimeout(timeout);}
    }
    void load();
    return ()=>{cancelled=true;clearTimeout(timeout);controller.abort();};
  },[structure,stageVersion]);

  useEffect(()=>{
    stageRef.current?.setParameters({backgroundColor:dark?'#17221b':'#fafcf9'});
  },[dark,stageVersion]);
  useEffect(()=>{
    const hide=()=>{if(document.hidden){stageRef.current?.setSpin(false);setSpinning(false);}};
    document.addEventListener('visibilitychange',hide);
    return ()=>document.removeEventListener('visibilitychange',hide);
  },[]);

  useEffect(()=>{if(motionPaused){stageRef.current?.setSpin(false);setSpinning(false);}},[motionPaused]);

  function clearFocus(){
    const comp=compRef.current;
    const old=focusReps.current;focusReps.current=[];
    old.forEach(rep=>comp?.removeRepresentation(rep));
    stageRef.current?.setSpin(false);setSpinning(false);
    // Do not clear NGL's animation list: its persistent spin controller lives there.
  }
  function focus(id:string){
    const comp=compRef.current, item=residues.find(r=>r.id===id);
    if(!comp || !item || state!=='ready')return;
    clearFocus();setSelected(id);
    const selection=structure==='5RUB'&&id==='K191'?'191:A':item.selection;
    focusReps.current=[
      comp.addRepresentation('ball+stick',{sele:selection,color:'#d39b4a',scale:1.5}),
      comp.addRepresentation('label',{sele:selection,labelType:'res',labelGrouping:'residue',color:dark?'#eef9eb':'#23482d',zOffset:2,scale:1.5}),
    ];
    comp.autoView(`(${selection})${structure==='9RUB'?' or ([RUB] and :A)':''}`,motionPaused?0:1000);
  }
  function reset(){clearFocus();setSelected('Overview');compRef.current?.autoView('protein',motionPaused?0:1000);}

  return <div className="molecule">
    <div className="viewer-top"><div><span className="eyebrow"><Copy>{t('Molecular context','结构中的设计依据')}</Copy></span><h3><Copy>{t('Where the substrate is held.','底物如何在活性位点定位。')}</Copy></h3></div>
      <Tabs value={structure} onValueChange={v=>{if(v){setState('loading');setStructure(String(v));}}}><TabsList aria-label={tr('Select experimental structure')}><TabsTrigger value="9RUB"><Copy>9RUB · Bound</Copy></TabsTrigger><TabsTrigger value="5RUB"><Copy>5RUB · Apo</Copy></TabsTrigger></TabsList></Tabs>
    </div>
    <div className="viewer-layout"><div className="viewer-scene">
      <div className="ngl-host" ref={host} role="img" aria-label={tr(`${structure} experimental RuBisCO dimer. Drag to rotate; use the labeled buttons to zoom or focus residues.`)}/>
      {state!=='ready'&&<div className="viewer-fallback"><img className="scientific-image" src="/I164-S368-interaction.webp" alt={tr('Project-supplied static RuBisCO rendering; interactive structure has not loaded')} draggable={false} onContextMenu={e=>e.preventDefault()}/><p role="status"><Copy>{state==='error'?'3D unavailable on this device. Static reference shown.':activated?'Loading the experimental structure…':'Static reference · 3D loads when in view'}</Copy></p>{state==='error'&&<Button variant="outline" onClick={()=>setRetry(x=>x+1)}><Copy>Retry 3D</Copy></Button>}</div>}
      <span className="structure-id">PDB {structure}</span>
      <div className="viewer-controls"><Button variant="outline" aria-label={tr('Reset structure view')} disabled={state!=='ready'} onClick={reset}><RotateCcw size={17}/></Button><Button variant="outline" aria-label={tr('Zoom in')} disabled={state!=='ready'} onClick={()=>stageRef.current?.viewerControls.zoom(.18)}><ZoomIn size={17}/></Button><Button variant="outline" aria-label={tr('Zoom out')} disabled={state!=='ready'} onClick={()=>stageRef.current?.viewerControls.zoom(-.22)}><ZoomOut size={17}/></Button><Button variant="outline" aria-label={tr(spinning?'Pause rotation':'Start slow rotation')} aria-pressed={spinning} disabled={state!=='ready'} onClick={()=>{stageRef.current?.setSpin(!spinning);setSpinning(!spinning);}}>{spinning?<Pause size={17}/>:<Play size={17}/>}</Button></div>
      <span className="drag-hint"><Copy>Drag to rotate · Buttons to zoom</Copy></span>
    </div><aside className="residue-panel"><p className="eyebrow"><Copy>Explore chain A</Copy></p><div className="residue-buttons">{residues.map(r=><Button key={r.id} variant="outline" aria-pressed={selected===r.id} disabled={state!=='ready'||(structure==='5RUB'&&r.id==='Mg²⁺')} onClick={()=>focus(r.id)}><Copy>{r.id}</Copy></Button>)}</div>
      <div className="residue-explanation" aria-live="polite"><h3><Copy>{residue?.title??t('Two phosphate anchors.','两个磷酸基团的定位作用。')}</Copy></h3><p><Copy>{residue?.description??t('I164 and S368 sit near the C1 end of RuBP. The mutant designs test whether this region can accommodate a longer sugar while preserving productive positioning.','I164 和 S368 位于 RuBP 的 C1 端附近。突变设计检验这一局部能否容纳更长的糖，同时保留有利于反应的定位。')}</Copy></p></div>
      <div className="viewer-legend"><span><i className="key chain-a"/><Copy>Chain A</Copy></span><span><i className="key chain-b"/><Copy>Chain B</Copy></span>{structure==='9RUB'&&<span><i className="key metal"/>Mg²⁺</span>}</div>
      <p className="small muted"><Copy>{structure==='9RUB'?t('9RUB contains RuBP and catalytic Mg²⁺. Lys191 is carbamylated.','9RUB 含天然底物 RuBP 和催化所需的 Mg²⁺，Lys191 处于氨基甲酰化状态。'):t('5RUB has no bound substrate or Mg²⁺. Parts of residues 54–63 and 324–335 are unresolved; their absence is not an observed opening motion.','5RUB 不含结合底物或 Mg²⁺。54–63 与 324–335 区间的部分坐标未解析，不能把缺失坐标当作真实开合运动。')}</Copy></p>
      <SiteLink className="text-link" href={`https://www.rcsb.org/structure/${structure}`} target="_blank" rel="noreferrer"><Copy>{t('PDB reference ↗','PDB 结构文献 ↗')}</Copy></SiteLink>
    </aside></div>
    <p className="viewer-footnote"><Copy>{t('Ligand binding is associated with ordering of flexible active-site regions. These wild-type structures provide the context for mutant design; the view does not simulate catalysis.','配体结合伴随柔性活性位点区域的有序化。这些野生型结构为突变设计提供依据，图中旋转仅用于观察空间关系。')}</Copy></p>
  </div>;
}
