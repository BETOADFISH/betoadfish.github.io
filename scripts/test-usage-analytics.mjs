import {build} from 'esbuild';
import {DatabaseSync} from 'node:sqlite';
import {createHash,randomUUID} from 'node:crypto';
import fs from 'node:fs';
import {Script} from 'node:vm';
import assert from 'node:assert/strict';

await build({entryPoints:['backend/worker.ts'],outfile:'qa/usage-worker-test.mjs',bundle:true,platform:'node',format:'esm',loader:{'.html':'text'}});
const worker=(await import('../qa/usage-worker-test.mjs')).default;
const sqlite=new DatabaseSync(':memory:');
sqlite.exec(fs.readFileSync('backend/schema.sql','utf8'));
// Additive migration is safe to run after schema creation and to rerun.
sqlite.exec(fs.readFileSync('backend/migrations/0003-usage-events.sql','utf8'));
sqlite.exec(fs.readFileSync('backend/migrations/0003-usage-events.sql','utf8'));
const DB={prepare(sql){let args=[];return{bind(...values){args=values;return this},async first(){return sqlite.prepare(sql).get(...args)||null},async all(){return{results:sqlite.prepare(sql).all(...args)}},async run(){return sqlite.prepare(sql).run(...args)}}}};
const env={DB,PUBLIC_ORIGIN:'https://betoadfish.github.io',GITHUB_CLIENT_ID:'test-client',GITHUB_OWNER_ID:'test-owner'};
const adminOrigin='https://admin.example.test';
const testSession='a'.repeat(43);
sqlite.prepare('INSERT INTO admin_sessions(token_hash,subject,expires) VALUES(?,?,?)').run(createHash('sha256').update(testSession).digest('hex'),env.GITHUB_OWNER_ID,Math.floor(Date.now()/1000)+300);
function request(path,{event,origin=env.PUBLIC_ORIGIN,method=event?'POST':'GET',owner=false,body,contentType='application/json'}={}){
  const init={method,headers:{Origin:origin,...(body||event?{'Content-Type':contentType}:{}),...(owner?{Cookie:'__Host-biology-session='+testSession}:{})}};
  if(method!=='GET'&&method!=='HEAD')init.body=body??(event?JSON.stringify(event):undefined);
  return worker.fetch(new Request(adminOrigin+path,init),env);
}
const base={event_id:randomUUID(),session_id:randomUUID(),event:'page_view',path:'/tools/biology',language:'zh',viewport:'large'};
const emit=event=>request('/events/usage',{event:{...base,event_id:randomUUID(),...event}});

assert.equal((await request('/admin/api/usage')).status,401);
assert.equal((await request('/admin')).status,401);
assert.equal((await request('/admin/api/usage',{owner:true})).status,200);
const empty=await(await request('/admin/api/usage',{owner:true})).json();
assert.deepEqual(empty.summary,{views:0,sessions:0,visible_ms:0,first_event:null,last_event:null});
assert.deepEqual(empty.daily,[]);assert.deepEqual(empty.pages,[]);assert.deepEqual(empty.banks,[]);assert.deepEqual(empty.exports,[]);
assert.equal((await request('/admin/api/usage?days=8',{owner:true})).status,400);
for(const days of [7,30,90])assert.equal((await request('/admin/api/usage?days='+days,{owner:true})).status,200);
const admin=await request('/admin',{owner:true});
assert.equal(admin.status,200);assert.match(admin.headers.get('Content-Security-Policy'),/frame-ancestors 'none'/);
assert.match(await admin.text(),/访问与题库使用/);
sqlite.prepare('UPDATE admin_sessions SET subject=?').run('different-owner');
assert.equal((await request('/admin/api/usage',{owner:true})).status,401);
sqlite.prepare('UPDATE admin_sessions SET subject=?,expires=0').run(env.GITHUB_OWNER_ID);
assert.equal((await request('/admin/api/usage',{owner:true})).status,401);
sqlite.prepare('UPDATE admin_sessions SET expires=?').run(Math.floor(Date.now()/1000)+300);

assert.equal((await request('/events/usage',{event:base,origin:'https://other.test'})).status,403);
assert.equal((await request('/events/usage',{event:base,contentType:'text/plain'})).status,415);
assert.equal((await request('/events/usage')).status,405);
const options=await request('/events/usage',{method:'OPTIONS'});assert.equal(options.status,204);assert.equal(options.headers.get('Access-Control-Allow-Origin'),env.PUBLIC_ORIGIN);
for(const patch of [{ip:'1.2.3.4'},{referrer:'https://private.test/'},{query:'private search'},{question_id:'123'},{event:'arbitrary'},{path:'/tools/biology?secret=1'},{path:'/admin'},{bank:'cie'},{kind:'qp'},{duration_ms:1000},{session_id:'private-user'},{language:['zh']},{viewport:{toString:'large'}}])assert.equal((await emit(patch)).status,400,JSON.stringify(patch));
assert.equal((await emit({created_at:'2020-01-01'})).status,400);
for(const patch of [{event:'bank_open'},{event:'bank_open',bank:['cie']},{event:'bank_open',bank:'cie',path:'/'},{event:'export_started',bank:'cie'},{event:'export_success',bank:'cie',kind:['qp']},{event:'page_active',duration_ms:60001},{event:'page_active',duration_ms:0},{event:'page_active',duration_ms:1.5}])assert.equal((await emit(patch)).status,400);
assert.equal((await request('/events/usage',{event:{...base,padding:'x'.repeat(2000)}})).status,413);
assert.equal((await request('/events/usage',{body:'{broken',method:'POST'})).status,400);
assert.equal((await request('/events/usage',{event:base})).status,204);
assert.equal((await request('/events/usage',{event:base})).status,204);
assert.equal(sqlite.prepare('SELECT count(*) AS n FROM usage_events').get().n,1);
assert.equal((await emit({event:'page_active',duration_ms:30000})).status,204);
for(const event of ['bank_open','bank_loaded','question_preview','filter_apply','random_generated'])assert.equal((await emit({event,bank:'cie'})).status,204);
for(const event of ['export_started','export_success'])assert.equal((await emit({event,bank:'cie',kind:'qp'})).status,204);
// A second session opens the bank and receives an error. A missing open event
// in a third session must not enter the loaded-session numerator.
const failedSession=randomUUID(),orphanSession=randomUUID();
for(const event of ['bank_open','bank_error'])await emit({event,bank:'cie',session_id:failedSession});
for(const event of ['bank_loaded','question_preview','export_started','export_success'])await emit({event,bank:'cie',session_id:orphanSession,...(event.startsWith('export_')?{kind:'ms'}:{})});
await emit({event:'export_error',bank:'cie',kind:'qp'});
let stats=await(await request('/admin/api/usage?days=30',{owner:true})).json();
assert.equal(stats.summary.views,1);assert.equal(stats.summary.sessions,1);assert.equal(stats.summary.visible_ms,30000);
assert.equal(stats.pages[0].language,'zh');assert.equal(stats.pages[0].viewport,'large');assert.equal(stats.pages[0].path,'/tools/biology');
assert.deepEqual(stats.banks[0],{bank:'cie',opened:2,loaded:1,failed:1,previewed:1,filtered:1,randomized:1,export_started:1,exported:1});
const qp=stats.exports.find(r=>r.kind==='qp');assert.equal(qp.started,1);assert.equal(qp.successes,1);assert.equal(qp.failures,1);
assert.equal(stats.timezone,'Asia/Shanghai');assert.equal(stats.retention_days,90);
assert.equal(Object.hasOwn(stats,'sessions'),false);assert.equal(JSON.stringify(stats).includes(base.session_id),false);
// Event timestamps come only from the service. Old rows are cleared by the
// scheduled handler; current rows and question editing tables stay intact.
sqlite.prepare("UPDATE usage_events SET created_at=datetime('now','-91 days') WHERE event_id=?").run(base.event_id);
await worker.scheduled({},env);
assert.equal(sqlite.prepare('SELECT count(*) AS n FROM usage_events WHERE event_id=?').get(base.event_id).n,0);
assert(sqlite.prepare('SELECT count(*) AS n FROM usage_events').get().n>0);
stats=await(await request('/admin/api/usage?days=7',{owner:true})).json();assert.equal(stats.summary.views,0);
sqlite.close();
console.log('Usage backend: strict privacy schema, CORS/body limits, duplicate IDs, real GitHub session protection, denominator intersections, rolling ranges and retention passed.');

await build({entryPoints:['lib/site-analytics.ts'],outfile:'qa/usage-client-test.mjs',bundle:true,platform:'node',format:'esm'});
const calls=[],storage=new Map();
const saved={fetch:globalThis.fetch,navigator:Object.getOwnPropertyDescriptor(globalThis,'navigator'),location:Object.getOwnPropertyDescriptor(globalThis,'location'),matchMedia:globalThis.matchMedia,sessionStorage:Object.getOwnPropertyDescriptor(globalThis,'sessionStorage')};
Object.defineProperty(globalThis,'navigator',{configurable:true,value:{doNotTrack:'1',globalPrivacyControl:false}});
Object.defineProperty(globalThis,'location',{configurable:true,value:{origin:env.PUBLIC_ORIGIN,pathname:'/zh/tools/biology',search:'?private=value'}});
Object.defineProperty(globalThis,'sessionStorage',{configurable:true,value:{getItem:key=>storage.get(key)||null,setItem:(key,value)=>storage.set(key,value)}});
globalThis.matchMedia=()=>({matches:true});
globalThis.fetch=async(url,options)=>{calls.push({url,options,event:JSON.parse(options.body)});return new Response(null,{status:204})};
const {trackUsage,trackBankEvent}=await import('../qa/usage-client-test.mjs');
trackUsage('page_view');assert.equal(calls.length,0);
navigator.doNotTrack='0';navigator.globalPrivacyControl=true;trackUsage('page_view');assert.equal(calls.length,0);
navigator.globalPrivacyControl=false;trackUsage('page_view');trackBankEvent('bank_open','cie');
assert.equal(calls.length,2);assert.equal(calls[0].event.session_id,calls[1].event.session_id);assert.equal(calls[0].event.path,'/tools/biology');assert.equal(calls[0].event.language,'zh');assert.equal(calls[0].event.viewport,'small');assert.equal(JSON.stringify(calls).includes('private=value'),false);
assert.equal(calls[0].options.credentials,'omit');assert.equal(calls[0].options.referrerPolicy,'no-referrer');assert.equal(calls[0].options.keepalive,true);
const key=[...storage.keys()][0],old=JSON.parse(storage.get(key));storage.set(key,JSON.stringify({...old,last:Date.now()-31*60000}));trackUsage('page_view');assert.notEqual(calls[2].event.session_id,old.id);
location.origin='http://localhost:3000';trackUsage('page_view');assert.equal(calls.length,3);
location.origin=env.PUBLIC_ORIGIN;location.pathname='/admin';trackUsage('page_view');assert.equal(calls.length,3);
location.pathname='/tools/biology';globalThis.fetch=async()=>{throw Error('Network blocked')};assert.doesNotThrow(()=>trackBankEvent('bank_loaded','cie'));
await new Promise(resolve=>setTimeout(resolve,0));
globalThis.fetch=saved.fetch;globalThis.matchMedia=saved.matchMedia;
for(const name of ['navigator','location','sessionStorage'])if(saved[name])Object.defineProperty(globalThis,name,saved[name]);else delete globalThis[name];
const dashboard=fs.readFileSync('backend/usage-dashboard.html','utf8');new Script(dashboard.match(/<script>([\s\S]*?)<\/script>/)[1]);
console.log('Usage client: DNT/GPC, ephemeral sessions and expiry, canonical routes without query strings, local exclusion, anonymous non-blocking requests and dashboard script syntax passed.');
