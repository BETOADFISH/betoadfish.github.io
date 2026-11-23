'use client';
import {useEffect,useState} from 'react';
import {useSite} from '@/components/site-context';
export function VirtualLab(){
 const {locale}=useSite(); const [height,setHeight]=useState(1800);
 useEffect(()=>{const onMessage=(event:MessageEvent)=>{if(event.origin===location.origin && event.data?.type==='biology-lab-height' && Number.isFinite(event.data.height)) setHeight(Math.max(900,Math.min(event.data.height,20000)));};window.addEventListener('message',onMessage);return()=>window.removeEventListener('message',onMessage);},[]);
 return <main className="section wrap"><div className="section-heading"><div><p className="eyebrow">{locale==='zh'?'教学工具':'TEACHING TOOL'}</p><h1>{locale==='zh'?'虚拟生物实验室':'Virtual Biology Lab'}</h1></div><p>{locale==='zh'?'选择一个实验，设置条件并探索模拟数据。':'Choose an investigation, set conditions and explore simulated data.'}</p></div><iframe key={locale} title={locale==='zh'?'虚拟生物实验室':'Virtual Biology Lab'} src={'/virtual-biology-lab/index.html?lang='+locale} style={{display:'block',width:'100%',height,border:'1px solid var(--border, #e0e8e2)',borderRadius:12}} /></main>;
}
