export type Bank = 'edexcel' | 'aqa' | 'esat';
export type Region = { page: number; box?: number[] };
export type Dependency = { id?: string; kind?: string; question_id?: string; qp?: Region[] };
export type Question = { id:string; bank:Bank; paper_id:string; label:string; parent_id?:string|null; major_id:string; kind:string; marks:number; summary:string; text:string; topics:string[]; chapters:string[]; skills:string[]; practical_skills?:string[]; year:number; session:string; unit:number; code:string; paper_title:string; is_leaf:boolean; leaves:string[]; qp:Region[]; ms:Region[]; dependencies:Dependency[]; historical_extension?:boolean; revision:number };
export type Paper = {id:string;title:string;code:string;qp:string;ms:string;general_ms?:Region[]};
export type Catalog = {bank:Bank;version:number;questions:Question[];papers:Paper[]};
export const banks = {
 edexcel:{name:'Edexcel',detail:'IAS / IAL Biology',color:'#23645D',caption:'Unit 1 · Unit 2 · Unit 3'},
 aqa:{name:'AQA AS',detail:'Biology · 7401',color:'#625387',caption:'Paper 1 · Paper 2'},
 esat:{name:'ESAT Biology',detail:'NSAA practice',color:'#9A6330',caption:'NSAA 2016–2023'},
};
export function resolveSelection(ids:string[],questions:Question[]):Question[]{
 const map=new Map(questions.map(q=>[q.id,q]));const chosen:Question[]=[];const visiting=new Set<string>();const done=new Set<string>();
 function visit(id:string){if(done.has(id))return;if(visiting.has(id))throw Error('题目依赖有误，请换一道题。');const q=map.get(id);if(!q)throw Error('有题目已更新或下架，请重新选择。');visiting.add(id);
 for(const dep of q.dependencies||[])if(dep.kind==='requires_answer'&&dep.question_id)visit(dep.question_id);
 visiting.delete(id);done.add(id);chosen.push(q);}
 ids.forEach(visit);
 // A whole question replaces its selected descendants without double-counting marks.
 function ancestor(child:Question,parent:Question){let id=child.parent_id;const seen=new Set<string>();while(id&&!seen.has(id)){if(id===parent.id)return true;seen.add(id);id=map.get(id)?.parent_id;}return false;}
 return chosen.filter(q=>!chosen.some(other=>other.id!==q.id&&q.leaves.every(x=>other.leaves.includes(x))&&(other.leaves.length>q.leaves.length||ancestor(q,other))));
}
export function removeSelection(ids:string[],id:string,questions:Question[]):string[]{
 let selected=resolveSelection(ids,questions).filter(q=>q.id!==id);const map=new Map(questions.map(q=>[q.id,q]));let changed=true;
 while(changed){const covered=new Set(selected.flatMap(q=>q.leaves));const next=selected.filter(q=>(q.dependencies||[]).every(d=>d.kind!=='requires_answer'||map.get(d.question_id||'')?.leaves.every(x=>covered.has(x))));changed=next.length!==selected.length;selected=next;}
 return selected.map(q=>q.id);
}
export function selectedMarks(questions:Question[],catalog:Question[]){const leaves=new Set(questions.flatMap(q=>q.leaves));return catalog.filter(q=>q.is_leaf&&leaves.has(q.id)).reduce((n,q)=>n+q.marks,0);}
export async function loadCatalog(bank:Bank):Promise<Catalog>{
 const r=await fetch(`/question-bank/${bank}.json`);if(!r.ok)throw Error('题库暂时没加载出来，请稍后再试。');const base:Catalog=await r.json();
 const cfg=await fetch('/question-bank/config.json',{cache:'no-store'});if(!cfg.ok)throw Error('题库连接失败，请刷新页面。');const {api,updates:publishedPath}=await cfg.json() as {api?:string;updates?:string};
 if(publishedPath&&!/^\/question-bank\/updates\/[a-f0-9]{64}$/.test(publishedPath))throw Error('题库版本无效，请刷新页面。');
 const updatesUrl=publishedPath?`${publishedPath}/${bank}.json`:api?`${api}/public/${bank}`:null;
 if(!updatesUrl)throw Error('题库发布配置不完整，请稍后再试。');
 {const patch=await fetch(updatesUrl,{cache:'no-store',signal:AbortSignal.timeout(15000)});if(!patch.ok)throw Error('题库暂时无法连接，请稍后再试。');const updates=await patch.json() as {id:string;published:Partial<Question>|null;revision:number}[];const map=new Map<string,{id:string;published:Partial<Question>|null;revision:number}>(updates.map((p:{id:string;published:Partial<Question>|null;revision:number})=>[p.id,p]));
 const withdrawn=new Set(base.questions.filter(q=>map.get(q.id)?.published===null).flatMap(q=>[q.id,...q.leaves]));
 base.questions=base.questions.flatMap(q=>{if(withdrawn.has(q.id))return[];const u=map.get(q.id);return u?(u.published?[{...q,...u.published,id:q.id,bank,revision:u.revision}]:[]):[q];});
 // Do not expose a parent or dependent question when any required child is unpublished.
 let changed=true;while(changed){const available=new Set(base.questions.map(q=>q.id));const next=base.questions.filter(q=>q.leaves.every(id=>available.has(id))&&(q.dependencies||[]).every(d=>d.kind!=='requires_answer'||available.has(d.question_id||'')));changed=next.length!==base.questions.length;base.questions=next;}}
 const byId=new Map(base.questions.map(q=>[q.id,q]));for(const q of base.questions)if(!q.is_leaf)q.marks=q.leaves.reduce((sum,id)=>sum+(byId.get(id)?.marks||0),0);
 return base;
}
