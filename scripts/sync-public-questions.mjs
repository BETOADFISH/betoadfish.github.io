import fs from 'node:fs/promises';
import {createHash} from 'node:crypto';
import {build} from 'esbuild';

// Publish only the public API's approved changes. Failure must stop deployment;
// silently falling back to empty updates could restore withdrawn questions.
await fs.mkdir('qa',{recursive:true});
await build({entryPoints:['backend/validation.ts'],outfile:'qa/snapshot-validation.mjs',bundle:true,platform:'node',format:'esm'});
const {validatePatch}=await import('../qa/snapshot-validation.mjs');
const banks=['edexcel','aqa','esat'];
const snapshots={};
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
}
const revision=createHash('sha256').update(JSON.stringify(snapshots)).digest('hex');
const updates=`/question-bank/updates/${revision}`;
await fs.mkdir('public'+updates,{recursive:true});
for(const bank of banks)await fs.writeFile(`public${updates}/${bank}.json`,JSON.stringify(snapshots[bank]));
await fs.writeFile('public/question-bank/config.json',JSON.stringify({updates,revision})+'\n');
let changed=true;
if(process.env.GITHUB_EVENT_NAME==='schedule'){
 try{
  const current=await fetch('https://betoadfish.github.io/question-bank/config.json',{signal:AbortSignal.timeout(15000)});
  if(current.ok)changed=(await current.json()).revision!==revision;
 }catch{/* An unreachable current site must not prevent a fresh deployment. */}
}
if(process.env.GITHUB_OUTPUT)await fs.appendFile(process.env.GITHUB_OUTPUT,`changed=${changed}\n`);
console.log(`Public snapshot ${revision.slice(0,12)}: ${banks.map(b=>`${b} ${snapshots[b].length} changes`).join(', ')}; deploy=${changed}`);
