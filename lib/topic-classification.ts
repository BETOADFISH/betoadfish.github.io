import taxonomy from './question-taxonomy.json';
import type {Bank,Question} from './question-bank';

export const questionTaxonomy=taxonomy;
const indexes=new Map<Bank,Map<string,{topic:string;chapter:string}>>();
export function topicLabels(bank:Bank,ids:string[]){
 let entries=indexes.get(bank);
 if(!entries){entries=new Map(taxonomy[bank].flatMap(ch=>ch.children.map(p=>[p.id,{topic:p.label,chapter:ch.label}] as const)));indexes.set(bank,entries);}
 if(!ids.length||ids.some(id=>!entries.has(id)))throw Error('Invalid topic IDs');
 return {topics:ids.map(id=>entries.get(id)!.topic),chapters:[...new Set(ids.map(id=>entries.get(id)!.chapter))]};
}
const skillOnly=new Set(['edexcel-point-55','edexcel-point-65','aqa-point-55','aqa-point-65','aqa-point-69','cie-point-55','cie-point-65','cie-point-69','esat-point-55','esat-point-65','esat-point-69']);
export function matchesTopicScope(q:Question,selected:string[]){
 if(!selected.length)return true;
 const ids=q.topic_ids||q.topics;
 if(!ids.some(id=>selected.includes(id)))return false;
 // A skills-only filter remains useful for practical practice. A biology-topic
 // filter must cover every assessed biology topic of an indivisible question.
 if(selected.every(id=>skillOnly.has(id)))return true;
 return ids.filter(id=>!skillOnly.has(id)).every(id=>selected.includes(id));
}
