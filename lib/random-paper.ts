import {type Question,resolveSelection,selectedMarks,expectedMinutes,qualification} from './question-bank';

export type RandomOptions={target:number;mode:'marks'|'minutes';topics:string[];year?:string;unit?:string;qualification?:string};
export function randomPaper(questions:Question[],options:RandomOptions,random:()=>number=Math.random){
 const {target,mode}=options;
 if(!Number.isFinite(target)||target<=0||target>600)throw Error('目标需要在1–600之间。');
 const limit=mode==='minutes'?Math.floor(target*4+1e-9):Math.floor(target);
 const leaves=questions.filter(q=>q.is_leaf&&q.marks>0);
 const map=new Map(questions.map(q=>[q.id,q]));
 const parent=new Map(leaves.map(q=>[q.id,q.id]));
 function root(id:string):string{const p=parent.get(id);if(!p)return id;if(p===id)return p;const r=root(p);parent.set(id,r);return r;}
 function join(a:string,b:string){if(parent.has(a)&&parent.has(b))parent.set(root(a),root(b));}
 // A dependency component is an indivisible bundle, so required answers cannot
 // disappear or be counted twice when questions from different papers are mixed.
 for(const q of questions)for(const d of q.dependencies||[])if(d.kind==='requires_answer'){
  const dependency=map.get(d.question_id||'');if(!dependency)continue;
  for(const a of q.leaves)for(const b of dependency.leaves)join(a,b);
 }
 const groups=new Map<string,Question[]>();
 for(const q of leaves){const r=root(q.id);groups.set(r,[...(groups.get(r)||[]),q]);}
 const matches=(q:Question)=>(!options.qualification||qualification(q)===options.qualification)&&(!options.year||String(q.year)===options.year)&&(!options.unit||String(q.unit)===options.unit)&&(!options.topics.length||options.topics.some(t=>(q.topic_ids||q.topics).includes(t)));
 const bundles=[...groups.values()].filter(group=>group.every(matches)).map(group=>({ids:group.map(q=>q.id),marks:group.reduce((n,q)=>n+q.marks,0),cost:group.reduce((n,q)=>n+(mode==='minutes'?q.expected_seconds/15:q.marks),0)}));
 for(let i=bundles.length-1;i>0;i--){const j=Math.floor(random()*(i+1));[bundles[i],bundles[j]]=[bundles[j],bundles[i]];}
 type State={ids:string[]};const dp:(State|undefined)[]=Array(limit+1);dp[0]={ids:[]};
 for(const bundle of bundles){if(bundle.cost>limit)continue;for(let sum=limit;sum>=bundle.cost;sum--){const prev=dp[sum-bundle.cost];if(prev&&prev.ids.length+bundle.ids.length<=100&&(!dp[sum]||prev.ids.length+bundle.ids.length<dp[sum]!.ids.length))dp[sum]={ids:[...prev.ids,...bundle.ids]};}}
 let achieved=limit;while(achieved>0&&!dp[achieved])achieved--;
 if(!achieved)throw Error('这个范围内没有能放进目标的题目，请增加时间或分数，或放宽知识点。');
 const result=resolveSelection(dp[achieved]!.ids,questions);
 const marks=selectedMarks(result,questions);
 return {ids:result.map(q=>q.id),marks,minutes:expectedMinutes(result,questions),exact:mode==='minutes'?result.reduce((n,q)=>n+q.expected_seconds,0)===target*60:marks===target,availableMarks:bundles.reduce((n,b)=>n+b.marks,0)};
}
