'use client';
import {useEffect,useRef,useState} from 'react';
import {useSite} from '@/components/site-context';
export function VirtualLab(){
 const {locale}=useSite(); const [height,setHeight]=useState(1800); const frame=useRef<HTMLIFrameElement>(null);
 const sendTheme=()=>frame.current?.contentWindow?.postMessage({type:'biology-lab-theme',theme:document.documentElement.dataset.theme==='dark'?'dark':'light'},location.origin);
 useEffect(()=>{const onMessage=(event:MessageEvent)=>{if(event.origin===location.origin && event.source===frame.current?.contentWindow && event.data?.type==='biology-lab-height' && Number.isFinite(event.data.height)) setHeight(Math.max(900,Math.min(event.data.height,20000)));};window.addEventListener('message',onMessage);const observer=new MutationObserver(sendTheme);observer.observe(document.documentElement,{attributes:true,attributeFilter:['data-theme']});sendTheme();return()=>{window.removeEventListener('message',onMessage);observer.disconnect()};},[locale]);
 return <main className="section wrap"><div className="section-heading"><div><p className="eyebrow">{locale==='zh'?'教学工具':'TEACHING TOOL'}</p><h1>{locale==='zh'?'虚拟生物实验室':'Virtual Biology Lab'}</h1></div><p>{locale==='zh'?'选择一个实验，设置条件并探索模拟数据。':'Choose an investigation, set conditions and explore simulated data.'}</p></div><iframe ref={frame} onLoad={sendTheme} key={locale} title={locale==='zh'?'虚拟生物实验室':'Virtual Biology Lab'} src={'/virtual-biology-lab/index.html?lang='+locale} style={{display:'block',width:'100%',height,border:'1px solid var(--border, #e0e8e2)',borderRadius:12}} /></main>;
}
