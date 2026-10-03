import type {Bank,Catalog} from './question-bank';
import {cloneCatalog,mergePublishedCatalog,type PublishedUpdate} from './published-catalog';

export type CatalogStage='version'|'download'|'unpack'|'ready';
type Manifest={updates?:string;catalogs?:string;revision?:string;delivery_version?:number};
const complete=new Map<string,Catalog>();

// Keep the deadline active until the body has arrived, not just the headers.
async function readResource(url:string,gzip=false,milliseconds=25000):Promise<unknown>{
 const controller=new AbortController();
 let timer:ReturnType<typeof setTimeout>;
 const timeout=new Promise<never>((_,reject)=>{timer=setTimeout(()=>{controller.abort();reject(Error('catalog_timeout'));},milliseconds);});
 try{return await Promise.race([(async()=>{
  const mutable=url.endsWith('config.json')||/^\/question-bank\/(edexcel|aqa|esat|cie)\.json(?:\?|$)/.test(url);
  const response=await fetch(url,{signal:controller.signal,cache:mutable?'no-cache':'default'});
  if(!response.ok)throw Error(`catalog_http_${response.status}`);
  if(!gzip)return response.json();
  const bytes=new Uint8Array(await response.arrayBuffer());
  // Some hosts decode a Content-Encoding header automatically.
  const body=bytes[0]===0x1f&&bytes[1]===0x8b
   ?await new Response(new Blob([bytes]).stream().pipeThrough(new DecompressionStream('gzip'))).text()
   :new TextDecoder().decode(bytes);
  return JSON.parse(body);
 })(),timeout]);}finally{clearTimeout(timer!);}
}
function catalog(value:unknown,bank:Bank):Catalog{
 const c=value as Catalog;
 if(!c||c.bank!==bank||!Array.isArray(c.questions)||!Array.isArray(c.papers))throw Error('catalog_invalid');
 return c;
}
export async function fetchPublishedCatalog(bank:Bank,onStage?:(stage:CatalogStage)=>void):Promise<Catalog>{
 onStage?.('version');
 const manifest=await readResource('/question-bank/config.json',false,12000) as Manifest;
 if(manifest.catalogs){
  if(manifest.delivery_version!==2||!/^\/question-bank\/catalogs\/[a-f0-9]{64}$/.test(manifest.catalogs)||manifest.catalogs.split('/').pop()!==manifest.revision)throw Error('catalog_version');
  const key=`${manifest.catalogs}/${bank}.json`;
  let value=complete.get(key);
  if(!value){
   onStage?.('download');
   if(typeof DecompressionStream!=='undefined'){
    try{value=catalog(await readResource(key+'.gz',true),bank);}catch{/* Older embedded browsers or blocked .gz requests use the same approved snapshot. */}
   }
   if(!value)value=catalog(await readResource(key),bank);
   onStage?.('unpack');
   for(const old of complete.keys())if(old.endsWith(`/${bank}.json`))complete.delete(old);
   complete.set(key,value);
  }
  onStage?.('ready');return cloneCatalog(value);
 }
 // Compatibility with an older deployment; never contact workers.dev from
 // the public catalog path, even if an old config still includes an API URL.
 if(!manifest.updates||!/^\/question-bank\/updates\/[a-f0-9]{64}$/.test(manifest.updates))throw Error('catalog_version');
 onStage?.('download');
 const [base,updates]=await Promise.all([
  readResource(`/question-bank/${bank}.json?v=4-20260928`),
  readResource(`${manifest.updates}/${bank}.json`),
 ]);
 if(!Array.isArray(updates))throw Error('catalog_updates_invalid');
 const result=mergePublishedCatalog(catalog(base,bank),updates as PublishedUpdate[]);
 onStage?.('ready');return result;
}
