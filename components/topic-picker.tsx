'use client';
import {useEffect,useRef} from 'react';
import type {TopicNode} from '@/lib/question-bank';
const leaves=(n:TopicNode):string[]=>n.children?n.children.flatMap(leaves):[n.id];
function GroupCheck({checked,partial,onChange,label}:{checked:boolean;partial:boolean;onChange:()=>void;label:string}){const ref=useRef<HTMLInputElement>(null);useEffect(()=>{if(ref.current)ref.current.indeterminate=partial;},[partial]);return <input ref={ref} type="checkbox" checked={checked} onChange={onChange} aria-label={label}/>;}
export function TopicPicker({nodes,value,onChange,zh}:{nodes:TopicNode[];value:string[];onChange:(ids:string[])=>void;zh:boolean}){
 const all=nodes.flatMap(leaves);const selected=new Set(value);
 function toggle(ids:string[]){const remove=ids.every(id=>selected.has(id));const next=new Set(value);ids.forEach(id=>remove?next.delete(id):next.add(id));onChange([...next]);}
 function branch(n:TopicNode){const ids=leaves(n),count=ids.filter(id=>selected.has(id)).length;const label=zh?n.label:n.label.split(' · ')[0];return n.children?<details className="qb-topic-group" key={n.id}><summary><GroupCheck checked={count===ids.length} partial={count>0&&count<ids.length} onChange={()=>toggle(ids)} label={`${zh?'全选':'Select all'} ${label}`}/><span>{label}</span><small>{count}/{ids.length}</small></summary><div>{n.children.map(branch)}</div></details>:<label className="qb-topic-leaf" key={n.id}><input type="checkbox" checked={selected.has(n.id)} onChange={()=>toggle([n.id])}/><span>{label}</span></label>;}
 return <details className="qb-topic-picker"><summary>{zh?'知识点':'Topics'} · {value.length?`${value.length} ${zh?'项已选':'selected'}`:zh?'不限':'Any'}</summary><div className="qb-topic-actions"><button type="button" onClick={()=>onChange(all)}>{zh?'全选所有章节':'Select all chapters'}</button><button type="button" onClick={()=>onChange([])}>{zh?'清除':'Clear'}</button></div><div className="qb-topic-tree">{nodes.map(branch)}</div></details>;
}
