import {build} from 'esbuild';
import fs from 'node:fs';
import assert from 'node:assert/strict';

fs.mkdirSync('qa',{recursive:true});
await build({entryPoints:['lib/question-export-session.ts'],bundle:true,platform:'node',format:'esm',outfile:'qa/question-export-session.mjs'});
const {createQuestionExportSession,selectionKey}=await import('../qa/question-export-session.mjs');

function deferred(){let resolve,reject;const promise=new Promise((yes,no)=>{resolve=yes;reject=no;});return {promise,resolve,reject};}
async function complete(request,pending,events){
  try{const value=await pending;if(request.isCurrent())events.push(['download',value]);}
  catch{if(request.isCurrent())events.push(['error']);}
  finally{if(request.isCurrent())events.push(['idle']);}
}

// Pending output must never appear after additions, removals, reordering or a
// bank switch. Returning to the original selection must not revive it.
for(const [bank,ids] of [['aqa',['a','b','c']],['aqa',['a']],['aqa',['b','a']],['cie',['a','b']]]){
  const session=createQuestionExportSession(),pending=deferred(),events=[];
  const request=session.start('aqa',['a','b']);
  const finished=complete(request,pending.promise,events);
  assert.equal(session.select(bank,ids),true);
  session.select('aqa',['a','b']);
  pending.resolve('outdated PDF');await finished;
  assert.deepEqual(events,[]);
}

// An unchanged selection should retain a completed export and allow the
// current export to finish; unrelated filter changes do not invalidate it.
{
  const session=createQuestionExportSession(),pending=deferred(),events=[];
  const request=session.start('edexcel',['a','b']);
  assert.equal(session.select('edexcel',['a','b']),false);
  assert.equal(request.key,selectionKey('edexcel',['a','b']));
  const finished=complete(request,pending.promise,events);
  pending.resolve('current PDF');await finished;
  assert.deepEqual(events,[['download','current PDF'],['idle']]);
}

// A slow failing request must not replace a later success with an error, or
// clear the later request's busy state.
{
  const session=createQuestionExportSession(),old=deferred(),next=deferred(),events=[];
  const first=complete(session.start('aqa',['a']),old.promise,events);
  session.select('esat',['b']);
  const second=complete(session.start('esat',['b']),next.promise,events);
  old.reject(new Error('late network error'));await first;
  assert.deepEqual(events,[]);
  next.resolve('ESAT PDF');await second;
  assert.deepEqual(events,[['download','ESAT PDF'],['idle']]);
}

{
  const session=createQuestionExportSession();
  const first=session.start('aqa',['a']);
  const second=session.start('aqa',['a']);
  assert.equal(first.isCurrent(),false);
  assert.equal(second.isCurrent(),true);
  session.cancel();assert.equal(second.isCurrent(),false);
  assert.notEqual(selectionKey('aqa',['a','b']),selectionKey('aqa',['b','a']));
}
console.log('Question export selection edits, bank changes, late completion/failure, order and cancellation checks passed.');
