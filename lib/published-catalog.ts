import {topicLabels} from './topic-classification';
import type {Bank,Catalog,Question} from './question-bank';

export type PublishedUpdate={id:string;published:Partial<Question>|null;revision:number};
export function cloneCatalog(input:Catalog):Catalog{
 return typeof structuredClone==='function'?structuredClone(input):JSON.parse(JSON.stringify(input));
}

// Used by publication and legacy clients alike: a withdrawal must never be
// bypassed by falling back to the original question file.
export function mergePublishedCatalog(input:Catalog,updates:PublishedUpdate[]):Catalog{
 const base=cloneCatalog(input),bank=base.bank;
 const map=new Map(updates.map(update=>[update.id,update]));
 const withdrawn=new Set(base.questions.filter(q=>map.get(q.id)?.published===null).flatMap(q=>[q.id,...q.leaves]));
 base.questions=base.questions.flatMap(q=>{
  if(withdrawn.has(q.id))return[];
  const u=map.get(q.id);
  return u?(u.published?[{...q,...u.published,id:q.id,bank,revision:u.revision}]:[]):[q];
 });
 let changed=true;
 while(changed){
  const available=new Set(base.questions.map(q=>q.id));
  const next=base.questions.filter(q=>q.leaves.every(id=>available.has(id))&&(q.dependencies||[]).every(d=>d.kind!=='requires_answer'||available.has(d.question_id||'')));
  changed=next.length!==base.questions.length;base.questions=next;
 }
 const byId=new Map(base.questions.map(q=>[q.id,q]));
 for(const q of base.questions){
  if(!q.is_leaf){q.marks=q.leaves.reduce((sum,id)=>sum+(byId.get(id)?.marks||0),0);q.expected_seconds=q.leaves.reduce((sum,id)=>sum+(byId.get(id)?.expected_seconds||0),0);q.topic_ids=[...new Set(q.leaves.flatMap(id=>byId.get(id)?.topic_ids||[]))];}
  if(q.topic_ids?.length)Object.assign(q,topicLabels(bank as Bank,q.topic_ids));
 }
 return base;
}
