'use client';
import {useEffect,useRef,useState} from 'react';

export function PdfPreview({url,loading,error}:{url:string;loading:string;error:string}){
 const host=useRef<HTMLDivElement>(null);const [status,setStatus]=useState(loading);
 useEffect(()=>{
  let cancelled=false;let task:{destroy:()=>Promise<void>}|undefined;
  const target=host.current!;target.replaceChildren();setStatus(loading);
  (async()=>{
   const pdfjs=await import('pdfjs-dist');const worker=await import('pdfjs-dist/build/pdf.worker.min.mjs?url');
   if(cancelled)return;pdfjs.GlobalWorkerOptions.workerSrc=worker.default;
   const pending=pdfjs.getDocument({url,standardFontDataUrl:'/question-bank/pdf-viewer/standard_fonts/',wasmUrl:'/question-bank/pdf-viewer/wasm/'});task=pending;
   const pdf=await pending.promise;
   for(let i=1;i<=pdf.numPages;i++){
    if(cancelled)return;const page=await pdf.getPage(i);const viewport=page.getViewport({scale:1.4});
    const canvas=document.createElement('canvas');canvas.width=Math.ceil(viewport.width);canvas.height=Math.ceil(viewport.height);canvas.setAttribute('role','img');canvas.setAttribute('aria-label',`PDF page ${i}`);
    await page.render({canvas,viewport}).promise;if(cancelled)return;target.appendChild(canvas);setStatus('');
   }
  })().catch(()=>{if(!cancelled)setStatus(error);});
  return()=>{cancelled=true;void task?.destroy();};
 },[url,loading,error]);
 return <div className="qb-pdf-pages">{status&&<p role="status">{status}</p>}<div ref={host}/></div>;
}
