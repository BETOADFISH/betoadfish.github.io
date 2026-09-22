import {build} from 'esbuild';import fs from 'node:fs';import assert from 'node:assert/strict';
await build({entryPoints:['lib/random-paper.ts'],outfile:'qa/random-paper.mjs',bundle:true,platform:'node',format:'esm'});
const {randomPaper}=await import('../qa/random-paper.mjs');
const q=(id,marks,topics=['A'],deps=[])=>({id,bank:'esat',paper_id:'p',label:id,parent_id:null,major_id:id,kind:'leaf',marks,expected_seconds:marks*90,summary:id,text:'',topics,chapters:[],skills:[],year:2025,unit:1,is_leaf:true,leaves:[id],dependencies:deps,revision:1});
const opts={target:10,mode:'marks',topics:[]};
let result=randomPaper([q('a',6),q('b',4),q('c',7)],opts,()=>.5);assert.equal(result.marks,10);assert.equal(new Set(result.ids).size,result.ids.length);
result=randomPaper([q('a',6),q('b',4)],{...opts,target:14,mode:'minutes'});assert(result.minutes<=14);assert.equal(result.marks,6);
result=randomPaper([q('a',4),q('b',6,['B'])],{...opts,topics:['A']});assert.deepEqual(result.ids,['a']);assert.equal(result.exact,false);
const linked=[q('a',4),q('b',3,['B'],[{kind:'requires_answer',question_id:'a'}])];
assert.throws(()=>randomPaper(linked,{...opts,topics:['B']}));assert.throws(()=>randomPaper(linked,{...opts,target:6}));
assert.equal(randomPaper(linked,{...opts,target:7}).marks,7);
assert.throws(()=>randomPaper([q('a',1)],{...opts,target:0}));assert.throws(()=>randomPaper([q('a',1)],{...opts,year:'2024'}));
assert.equal(randomPaper(Array.from({length:130},(_,i)=>q('q'+i,1)),{...opts,target:120}).ids.length,100);
for(const bank of ['edexcel','aqa','esat','cie']){const cat=JSON.parse(fs.readFileSync(`public/question-bank/${bank}.json`,'utf8'));for(const mode of ['marks','minutes']){const result=randomPaper(cat.questions,{...opts,mode,target:40});assert(result.ids.length&&result.ids.length<=100);if(mode==='marks')assert(result.marks<=40);if(mode==='minutes')assert(result.minutes<=40);console.log(bank,mode,result.marks,'marks',result.ids.length,'groups');}}
console.log('Random practice: exact/closest target, time budget, topic restrictions, dependencies, no duplicates and 100-group limit passed.');

const mixed=[{...q('fast',8),expected_seconds:60},{...q('slow',2),expected_seconds:600}];
const timed=randomPaper(mixed,{...opts,target:2,mode:'minutes'});assert.deepEqual(timed.ids,['fast']);assert.equal(timed.minutes,1);assert.equal(timed.exact,false);
const scored=randomPaper(mixed,{...opts,target:2,mode:'marks'});assert.deepEqual(scored.ids,['slow']);assert.equal(scored.minutes,10);assert.equal(scored.exact,true);
const timedLinked=randomPaper([{...q('a',1),expected_seconds:60},{...q('b',1,['A'],[{kind:'requires_answer',question_id:'a'}]),expected_seconds:120}],{...opts,target:3,mode:'minutes'});assert.equal(timedLinked.minutes,3);assert.equal(timedLinked.marks,2);assert(timedLinked.exact);
console.log('Time budgets use per-question estimates independently of marks.');
