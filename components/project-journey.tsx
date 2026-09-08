'use client';
import { useEffect, useRef, useState, type ReactNode } from 'react';
import { ArrowLeft, ArrowRight, ChevronDown } from 'lucide-react';
import { Tabs, TabsList, TabsTrigger, TabsContent } from './ui/tabs';
import { Button } from './ui/button';
import { Copy, useSite } from './site-context';
import { t, type CopyText } from '@/lib/bilingual';

export type JourneyStep = { id:string; label:CopyText; title:CopyText; method:CopyText; result:CopyText; next:CopyText };
export function JourneyFlow({nodes,kicker,note}:{nodes:[CopyText,CopyText][];kicker:CopyText;note?:CopyText}){
 return <div className="journey-visual"><span className="visual-kicker"><Copy>{kicker}</Copy></span><div className="process-flow">{nodes.map(([name,detail],i)=><div className="process-unit" key={i}><div className="process-node"><strong><Copy>{name}</Copy></strong><span><Copy>{detail}</Copy></span></div>{i<nodes.length-1&&<ArrowRight className="flow-arrow" aria-hidden="true"/>}</div>)}</div>{note&&<p className="visual-note"><Copy>{note}</Copy></p>}</div>;
}

export function ProjectJourney({steps,visuals,evidence=[],evidenceLabels=[],title,eyebrow}:{steps:JourneyStep[];visuals:ReactNode[];evidence?:ReactNode[];evidenceLabels?:(CopyText|null)[];title?:CopyText;eyebrow?:CopyText}){
 const [active,setActive]=useState(0),[expanded,setExpanded]=useState(false),[ready,setReady]=useState(false);const {locale}=useSite();const rail=useRef<HTMLDivElement>(null);
 useEffect(()=>{setReady(true);const restore=()=>{const i=steps.findIndex(s=>'#'+s.id===location.hash);if(i>=0){setActive(i);setExpanded(false);}};restore();window.addEventListener('hashchange',restore);return()=>window.removeEventListener('hashchange',restore);},[steps]);
 function change(index:number){
  setActive(index);setExpanded(false);history.replaceState(history.state,'',location.pathname+location.search+'#'+steps[index].id);
  requestAnimationFrame(()=>{const el=rail.current;if(!el)return;const header=document.querySelector('.site-header')?.getBoundingClientRect().bottom??100;if(el.getBoundingClientRect().top<header+12)el.scrollIntoView({block:'start',behavior:window.matchMedia('(prefers-reduced-motion: reduce)').matches?'instant':'smooth'});});
 }
 return <section className="journey-section" id="journey" data-count={steps.length} aria-busy={!ready}><div className="section-heading"><div><p className="eyebrow"><Copy>{eyebrow??t('My experimental route','我的实验路线')}</Copy></p><h2><Copy>{title??t('Each result shapes the next step.','每一步结果，都决定下一步。')}</Copy></h2></div></div>
  <Tabs value={String(active)} onValueChange={v=>change(Number(v))} className="journey-tabs"><div className="journey-rail-anchor" ref={rail}><TabsList className="journey-rail" aria-label={locale==='zh'?'项目流程':'Project journey'} style={{gridTemplateColumns:`repeat(${steps.length},minmax(0,1fr))`}}>{steps.map((step,i)=><TabsTrigger id={`journey-tab-${step.id}`} key={step.id} value={String(i)} disabled={!ready}><span className="journey-number">{String(i+1).padStart(2,'0')}</span><Copy>{step.label}</Copy></TabsTrigger>)}</TabsList></div>
   {steps.map((step,i)=><TabsContent value={String(i)} key={step.id} className="journey-panel" id={step.id}><div className="journey-main"><div className="journey-copy"><span className="journey-counter">{String(i+1).padStart(2,'0')} / {String(steps.length).padStart(2,'0')}</span><h3><Copy>{step.title}</Copy></h3><p><Copy>{step.method}</Copy></p><div className="journey-result"><span><Copy>{t('What I learned','得到什么')}</Copy></span><strong><Copy>{step.result}</Copy></strong></div></div>{visuals[i]}</div>
    <p className="journey-next"><ArrowRight size={18}/><Copy>{step.next}</Copy></p><div className="journey-actions">{evidence[i]?<button className="evidence-toggle" disabled={!ready} aria-expanded={expanded} aria-controls={`journey-evidence-${i}`} onClick={()=>setExpanded(!expanded)}><Copy>{evidenceLabels[i]??t('Figures and legends','实验图与图注')}</Copy><ChevronDown size={17}/></button>:<span/>}<div><Button variant="outline" aria-label={locale==='zh'?'上一步':'Previous step'} disabled={!ready||i===0} onClick={()=>change(i-1)}><ArrowLeft size={17}/></Button><Button variant="outline" disabled={!ready||i===steps.length-1} onClick={()=>change(i+1)}><Copy>{i===steps.length-1?t('Final step','最后一步'):t('Next step','下一步')}</Copy><ArrowRight size={17}/></Button></div></div>
    {evidence[i]&&<div id={`journey-evidence-${i}`} className="journey-evidence" hidden={!expanded}>{expanded&&evidence[i]}</div>}
   </TabsContent>)}
  </Tabs>
 </section>;
}
