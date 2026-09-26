import {build} from 'esbuild';
import fs from 'node:fs';
import assert from 'node:assert/strict';
fs.mkdirSync('qa',{recursive:true});
for(const [name,entry] of [['request-timeout','lib/request-timeout.ts'],['preview-size','lib/pdf-preview-size.ts'],['download-event','lib/download-analytics.ts']])
 await build({entryPoints:[entry],bundle:true,platform:'node',format:'esm',outfile:`qa/mobile-${name}.mjs`});
const {fetchWithTimeout}=await import('../qa/mobile-request-timeout.mjs');
const {previewScale}=await import('../qa/mobile-preview-size.mjs');
const {downloadEventId}=await import('../qa/mobile-download-event.mjs');
const originalFetch=globalThis.fetch,originalTimeout=AbortSignal.timeout;
try{
 AbortSignal.timeout=undefined;
 globalThis.fetch=async(_url,{signal})=>new Promise((resolve,reject)=>{
  const fail=()=>reject(new DOMException('Aborted','AbortError'));
  if(signal.aborted)fail();else signal.addEventListener('abort',fail,{once:true});
 });
 await assert.rejects(()=>fetchWithTimeout('/slow',{},10),{name:'AbortError'});
 const caller=new AbortController();
 const pending=fetchWithTimeout('/cancel',{signal:caller.signal},1000);caller.abort();
 await assert.rejects(()=>pending,{name:'AbortError'});
 await assert.rejects(()=>fetchWithTimeout('/already-cancelled',{signal:caller.signal},1000),{name:'AbortError'});
 globalThis.fetch=async()=>new Response('ok');
 assert.equal(await (await fetchWithTimeout('/fast',{},1000)).text(),'ok');
}finally{globalThis.fetch=originalFetch;AbortSignal.timeout=originalTimeout;}
const uuid=/^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/;
const ids=Array.from({length:1000},()=>downloadEventId());assert(ids.every(id=>uuid.test(id)));assert.equal(new Set(ids).size,1000);
for(const width of [280,320,390,430,1024])for(const dpr of [1,2,3,4])for(const [w,h] of [[595,842],[842,595],[10000,20000]]){
 const scale=previewScale(w,h,width,dpr);
 assert(scale>0&&scale<=2.5);assert(w*h*scale*scale<=2500001);
 assert(w*scale<=width*Math.min(2,dpr)+.001);
}
console.log('Mobile request cancellation, export event IDs and PDF canvas memory bounds passed.');
