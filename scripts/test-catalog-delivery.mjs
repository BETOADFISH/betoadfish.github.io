import {build} from 'esbuild';
import fs from 'node:fs';
import assert from 'node:assert/strict';
import {gzipSync,gunzipSync} from 'node:zlib';
fs.mkdirSync('qa',{recursive:true});
await build({entryPoints:['lib/catalog-delivery.ts'],outfile:'qa/catalog-delivery.mjs',bundle:true,platform:'node',format:'esm'});
const {fetchPublishedCatalog}=await import('../qa/catalog-delivery.mjs');
const empty={bank:'esat',version:1,questions:[],papers:[]};
const manifest=id=>({delivery_version:2,revision:id.repeat(64),catalogs:'/question-bank/catalogs/'+id.repeat(64)});
const requested=[];
globalThis.fetch=async url=>{
 requested.push(url);assert(String(url).startsWith('/question-bank/'));
 return new Response(url.endsWith('config.json')?JSON.stringify(manifest('a')):gzipSync(JSON.stringify(empty)));
};
const stages=[];
assert.deepEqual(await fetchPublishedCatalog('esat',stage=>stages.push(stage)),empty);
assert(requested[1].endsWith('.json.gz'));assert.equal(requested.length,2);
assert.deepEqual(stages,['version','download','unpack','ready']);
await fetchPublishedCatalog('esat');assert.equal(requested.length,3,'reuse exact immutable revision but recheck manifest');

// A corrupt/blocked compressed resource falls back only to the matching
// approved JSON, never the original or an external Workers API.
requested.length=0;
globalThis.fetch=async url=>{
 requested.push(url);
 return new Response(url.endsWith('config.json')?JSON.stringify(manifest('b')):url.endsWith('.gz')?'bad gzip':JSON.stringify(empty));
};
assert.deepEqual(await fetchPublishedCatalog('esat'),empty);
assert.equal(requested.length,3);assert.equal(requested[2],manifest('b').catalogs+'/esat.json');

// Older browsers without DecompressionStream use the same publication.
const decompressor=globalThis.DecompressionStream;
const cloner=globalThis.structuredClone;
globalThis.DecompressionStream=undefined;requested.length=0;
globalThis.structuredClone=undefined;
globalThis.fetch=async url=>{requested.push(url);return new Response(JSON.stringify(url.endsWith('config.json')?manifest('c'):empty));};
await fetchPublishedCatalog('esat');assert.equal(requested.length,2);assert(!requested.some(u=>u.endsWith('.gz')));
globalThis.DecompressionStream=decompressor;
globalThis.structuredClone=cloner;

for(const config of [{api:'https://blocked.workers.dev'}, {...manifest('d'),catalogs:'https://untrusted.test'}, {...manifest('d'),revision:'e'.repeat(64)}]){
 requested.length=0;globalThis.fetch=async url=>{requested.push(url);return new Response(JSON.stringify(config));};
 await assert.rejects(()=>fetchPublishedCatalog('esat'));assert.equal(requested.length,1);
}
// A valid cached old revision cannot hide a failed latest-manifest request.
globalThis.fetch=async()=>new Response('',{status:503});
await assert.rejects(()=>fetchPublishedCatalog('esat'));

// Slow bodies must time out even when headers arrived immediately.
const realTimer=globalThis.setTimeout;
globalThis.setTimeout=(fn)=>realTimer(fn,5);
globalThis.fetch=async()=>({ok:true,json:()=>new Promise(()=>{})});
await assert.rejects(()=>fetchPublishedCatalog('esat'),/catalog_timeout/);
globalThis.setTimeout=realTimer;

const config=JSON.parse(fs.readFileSync('public/question-bank/config.json','utf8'));
if(config.delivery_version===2){
 for(const bank of ['edexcel','aqa','cie','esat']){
  const raw=fs.readFileSync(`public${config.catalogs}/${bank}.json`),zip=fs.readFileSync(`public${config.catalogs}/${bank}.json.gz`);
  assert.deepEqual(gunzipSync(zip),raw);assert(zip.length<raw.length*.3);
  const parsed=JSON.parse(raw);assert.equal(parsed.bank,bank);
  const known=new Set(parsed.questions.map(q=>q.id));
  for(const q of parsed.questions)assert(q.leaves.every(id=>known.has(id)));
  console.log(`${bank}: ${parsed.questions.length} approved questions; ${Math.round((1-zip.length/raw.length)*100)}% smaller`);
 }
}
console.log('Same-origin gzip/JSON fallback, revision cache, unavailable updates, and body timeout passed.');
