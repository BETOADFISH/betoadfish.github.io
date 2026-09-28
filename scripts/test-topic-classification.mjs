import fs from 'node:fs';
import assert from 'node:assert/strict';
import {build} from 'esbuild';
import {Script} from 'node:vm';
new Script(fs.readFileSync('backend/admin.html','utf8').match(/<script>([\s\S]*?)<\/script>/)[1]);
await build({entryPoints:['lib/topic-classification.ts','backend/validation.ts','lib/question-bank.ts'],outdir:'qa/classification-tests',bundle:true,platform:'node',format:'esm',outExtension:{'.js':'.mjs'}});
const {matchesTopicScope,topicLabels}=await import('../qa/classification-tests/lib/topic-classification.mjs');
const {validatePatch}=await import('../qa/classification-tests/backend/validation.mjs');
const catalogs=Object.fromEntries(['aqa','edexcel','cie','esat'].map(b=>[b,JSON.parse(fs.readFileSync(`public/question-bank/${b}.json`,'utf8'))]));
const get=(b,id)=>catalogs[b].questions.find(q=>q.id===id);
for(const [bank,cat] of Object.entries(catalogs)){
 assert.equal(cat.version,4);
 const known=new Map(cat.taxonomy.flatMap(ch=>ch.children.map(t=>[t.id,ch.id])));
 for(const q of cat.questions){
  assert(q.topic_ids.length,q.id);
  assert(q.topic_ids.every(t=>known.has(t)),q.id);
  assert.deepEqual({topics:q.topics,chapters:q.chapters},topicLabels(bank,q.topic_ids),q.id);
  if(!q.is_leaf)assert.deepEqual(new Set(q.topic_ids),new Set(q.leaves.flatMap(id=>get(bank,id).topic_ids)),q.id);
 }
 assert(!cat.questions.some(q=>q.topic_ids.includes(`${bank}-point-56`)),`${bank}: unresolved classification`);
 console.log(bank,cat.questions.length,'records: valid taxonomy, synchronized labels, parent unions');
}
for(const suffix of ['1','2','3']){
 const q=get('aqa',`aqa-as-p2-specimen-Q07.${suffix}`);
 assert(!q.topic_ids.some(t=>['aqa-point-24','aqa-point-60','aqa-point-61'].includes(t)));
 assert(!q.chapters.some(ch=>ch.startsWith('3.2.')));
}
assert.deepEqual(get('aqa','aqa-as-p2-specimen-Q07.3').topic_ids,['aqa-point-44']);
assert.deepEqual(get('aqa','aqa-as-p2-june-2016-Q07.2').topic_ids,['aqa-point-23','aqa-point-25']);
assert.deepEqual(get('aqa','aqa-as-p1-june-2017-Q10.1').topic_ids,['aqa-point-23','aqa-point-25']);
assert.deepEqual(get('aqa','aqa-as-p1-specimen-Q09.4').topic_ids,['aqa-point-14']);
const cross=get('aqa','aqa-as-p1-june-2020-Q09.2');
assert.deepEqual(cross.topic_ids,['aqa-point-8','aqa-point-14']);
assert(!matchesTopicScope(cross,['aqa-point-8']));
assert(matchesTopicScope(cross,cross.topic_ids));
assert(matchesTopicScope({...cross,topic_ids:[...cross.topic_ids,'aqa-point-55']},cross.topic_ids));
assert(matchesTopicScope(cross,[]));
assert(catalogs.esat.taxonomy.some(t=>t.label.startsWith('B11. Plant physiology')));
assert(get('esat','nsaa-biology-2016-Q55').chapters.every(ch=>ch.startsWith('B7.')));
assert.deepEqual(get('cie','cie-2025-s-14-q9').topic_ids,['cie-point-0']); // reaction diagram, not enzyme distractor
assert(!get('cie','cie-2026-s-21-q4').topic_ids.includes('cie-point-33')); // rejected kidney-shaped nucleus
assert(!get('cie','cie-2025-w-23-q6').topic_ids.includes('cie-point-36')); // cardiac conduction, not neurones
for(const bank of ['aqa','cie']){
 const regulation=catalogs[bank].taxonomy.find(ch=>ch.children.some(t=>t.id===`${bank}-point-52`));
 assert.equal(regulation.id,`${bank}-topic-${bank==='aqa'?8:16}`);
}
const base=get('aqa','aqa-as-p1-specimen-Q09.4');
const patch=validatePatch({topic_ids:['aqa-point-8','aqa-point-14'],topics:['stale label'],chapters:['wrong']},base);
assert.deepEqual(patch,{topic_ids:['aqa-point-8','aqa-point-14'],...topicLabels('aqa',['aqa-point-8','aqa-point-14'])});
assert.throws(()=>validatePatch({topic_ids:['cie-point-14']},base));
assert.throws(()=>validatePatch({topic_ids:[]},base));
const {loadCatalog}=await import('../qa/classification-tests/lib/question-bank.mjs');
const mockBase=structuredClone(catalogs.aqa);
globalThis.fetch=async url=>new Response(JSON.stringify(url.endsWith('/config.json')?{updates:'/question-bank/updates/'+'a'.repeat(64)}:url.includes('/updates/')?[{id:base.id,revision:2,published:patch}]:mockBase),{status:200});
const updated=await loadCatalog('aqa');
assert.deepEqual(updated.questions.find(q=>q.id===base.id).chapters,patch.chapters);
for(const parent of updated.questions.filter(q=>!q.is_leaf&&q.leaves.includes(base.id)))assert(parent.topic_ids.includes('aqa-point-8'));
console.log('Observed misclassifications, real cross-topic question, strict random scope and published topic edits passed.');
