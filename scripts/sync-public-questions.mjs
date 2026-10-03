import fs from 'node:fs/promises';
import {createHash} from 'node:crypto';
import {build} from 'esbuild';
import {gzipSync} from 'node:zlib';

// Publish only the public API's approved changes. Failure must stop deployment;
// silently falling back to empty updates could restore withdrawn questions.
await fs.mkdir('qa',{recursive:true});
await build({entryPoints:['backend/validation.ts'],outfile:'qa/snapshot-validation.mjs',bundle:true,platform:'node',format:'esm'});
const {validatePatch}=await import('../qa/snapshot-validation.mjs');
await build({entryPoints:['lib/published-catalog.ts'],outfile:'qa/published-catalog.mjs',bundle:true,platform:'node',format:'esm'});
const {mergePublishedCatalog}=await import('../qa/published-catalog.mjs');
const banks=['edexcel','aqa','esat','cie'];
const snapshots={};
const catalogs={};
for(const bank of banks){
 const base=JSON.parse(await fs.readFile(`public/question-bank/${bank}.json`,'utf8'));
 const known=new Map(base.questions.map(q=>[q.id,q]));
 const response=await fetch(`https://bill-biology-admin.betoadfish.workers.dev/public/${bank}`,{signal:AbortSignal.timeout(30000)});
 if(!response.ok)throw Error(`Published ${bank} changes unavailable: ${response.status}`);
 const updates=await response.json();
 if(!Array.isArray(updates))throw Error(`Invalid ${bank} updates`);
 const seen=new Set();
 snapshots[bank]=updates.map(row=>{
  if(!row||!known.has(row.id)||seen.has(row.id)||!Number.isSafeInteger(row.revision)||row.revision<1)throw Error(`Invalid ${bank} update identity`);
  seen.add(row.id);
  return {id:row.id,revision:row.revision,published:row.published===null?null:validatePatch(row.published,known.get(row.id))};
 }).sort((a,b)=>a.id.localeCompare(b.id));
 catalogs[bank]=mergePublishedCatalog(base,snapshots[bank]);
}
// Revision covers the full approved catalog, including base content changes.
const revision=createHash('sha256').update(JSON.stringify(catalogs)).digest('hex');
const updates=`/question-bank/updates/${revision}`;
const catalogPath=`/question-bank/catalogs/${revision}`;
await fs.mkdir('public'+updates,{recursive:true});
await fs.mkdir('public'+catalogPath,{recursive:true});
for(const bank of banks)await fs.writeFile(`public${updates}/${bank}.json`,JSON.stringify(snapshots[bank]));
for(const bank of banks){
 const bytes=Buffer.from(JSON.stringify(catalogs[bank]));
 const compressed=gzipSync(bytes,{level:9});
 await fs.writeFile(`public${catalogPath}/${bank}.json`,bytes);
 await fs.writeFile(`public${catalogPath}/${bank}.json.gz`,compressed);
 console.log(`${bank}: ${catalogs[bank].questions.length} records, ${bytes.length} → ${compressed.length} bytes`);
}
// Replace the manifest only after every immutable catalog is ready.
await fs.writeFile('public/question-bank/config.json',JSON.stringify({updates,catalogs:catalogPath,revision,delivery_version:2})+'\n');
let changed=true;
if(process.env.GITHUB_EVENT_NAME==='schedule'){
 try{
  const current=await fetch('https://betoadfish.github.io/question-bank/config.json',{signal:AbortSignal.timeout(15000)});
  if(current.ok)changed=(await current.json()).revision!==revision;
 }catch{/* An unreachable current site must not prevent a fresh deployment. */}
}
if(process.env.GITHUB_OUTPUT)await fs.appendFile(process.env.GITHUB_OUTPUT,`changed=${changed}\n`);
console.log(`Public snapshot ${revision.slice(0,12)}: ${banks.map(b=>`${b} ${snapshots[b].length} changes`).join(', ')}; deploy=${changed}`);
