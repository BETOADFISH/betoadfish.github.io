'use client';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import content from '@/lib/culture-content.json';
export function CultureExplorer() {
 const [focus,setFocus]=useState('All'),[selected,setSelected]=useState(content.explorer.platforms[0].id);
 const platforms=content.explorer.platforms.filter(p=>focus==='All'||p.focus.includes(focus));
 const platform=platforms.find(p=>p.id===selected)||platforms[0];
 return <section className="interactive-panel culture-explorer"><p className="eyebrow">Review framework</p><h2>{content.explorer.title}</h2><p>{content.explorer.caption}</p><div className="filter-buttons" aria-label="Assessment dimension">{['All',...content.explorer.dimensions].map(d=><Button variant="outline" key={d} aria-pressed={focus===d} onClick={()=>setFocus(d)}>{d}</Button>)}</div><div className="culture-layout"><div className="platform-list" aria-label="Material families">{platforms.map(p=><Button variant="outline" key={p.id} aria-pressed={platform.id===p.id} onClick={()=>setSelected(p.id)}>{p.label}</Button>)}</div><article className="platform-detail" aria-live="polite"><p className="eyebrow">{platform.family}</p><h3>{platform.label}</h3><h4>What I would examine</h4><p>{platform.examine}</p><h4>Evidence to request</h4><p>{platform.request}</p><div className="focus-tags">{platform.focus.map(f=><span key={f}>{f}</span>)}</div></article></div></section>;
}
