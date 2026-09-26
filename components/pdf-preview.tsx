 'use client';
import {useEffect,useRef,useState} from 'react';
import type {PDFDocumentProxy,RenderTask} from 'pdfjs-dist';
import {previewScale} from '@/lib/pdf-preview-size';
import {useSite} from './site-context';
export function PdfPreview({url,loading,error}:{url:string;loading:string;error:string}){
 const host=useRef<HTMLDivElement>(null),canvas=useRef<HTMLCanvasElement>(null);
 const [pdf,setPdf]=useState<PDFDocumentProxy|null>(null),[page,setPage]=useState(1),[width,setWidth]=useState(320),[status,setStatus]=useState(loading);
 const {locale}=useSite();const zh=locale==='zh';
 useEffect(()=>{const el=host.current;if(!el)return;const resize=()=>setWidth(Math.max(1,el.clientWidth-16));resize();const observer=new ResizeObserver(resize);observer.observe(el);return()=>observer.disconnect();},[]);
 useEffect(()=>{
  let cancelled=false;let task:{destroy:()=>Promise<void>}|undefined;setPdf(null);setPage(1);setStatus(loading);
  (async()=>{const pdfjs=await import('pdfjs-dist/legacy/build/pdf.mjs');const worker=await import('pdfjs-dist/legacy/build/pdf.worker.min.mjs?url');if(cancelled)return;
   pdfjs.GlobalWorkerOptions.workerSrc=worker.default;const pending=pdfjs.getDocument({url,standardFontDataUrl:'/question-bank/pdf-viewer/standard_fonts/',wasmUrl:'/question-bank/pdf-viewer/wasm/'});task=pending;const doc=await pending.promise;if(!cancelled)setPdf(doc);
  })().catch(()=>{if(!cancelled)setStatus(error);});
  return()=>{cancelled=true;void task?.destroy();};
 },[url,loading,error]);
 useEffect(()=>{if(!pdf||!canvas.current)return;let cancelled=false,render:RenderTask|undefined;const target=canvas.current;setStatus(loading);
  (async()=>{const sheet=await pdf.getPage(page);if(cancelled)return;const base=sheet.getViewport({scale:1});const viewport=sheet.getViewport({scale:previewScale(base.width,base.height,width,window.devicePixelRatio||1)});target.width=Math.ceil(viewport.width);target.height=Math.ceil(viewport.height);render=sheet.render({canvas:target,viewport});await render.promise;if(!cancelled){setStatus('');host.current?.scrollTo({top:0});}sheet.cleanup();})().catch(()=>{if(!cancelled)setStatus(error);});
  return()=>{cancelled=true;render?.cancel();};
 },[pdf,page,width,loading,error]);
 return <div className="qb-pdf-pages"><div className="qb-pdf-pager"><button type="button" disabled={!pdf||page<=1} onClick={()=>setPage(n=>Math.max(1,n-1))}>{zh?'上一页':'Previous'}</button><span aria-live="polite">{pdf?`${page} / ${pdf.numPages}`:'PDF'}</span><button type="button" disabled={!pdf||page>=pdf.numPages} onClick={()=>setPage(n=>Math.min(pdf?.numPages||1,n+1))}>{zh?'下一页':'Next'}</button></div>{status&&<p role="status">{status}</p>}<div className="qb-pdf-sheet" ref={host}><canvas ref={canvas} role="img" aria-label={zh?`PDF 第 ${page} 页`:`PDF page ${page}`} hidden={!pdf||!!status}/></div></div>;
}
