'use client';
import { Copy, SiteLink, useSite } from '@/components/site-context';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import content from '@/lib/culture-content.json';
export function CultureExplorer() {
    const { tr } = useSite();
    const [focus, setFocus] = useState('All'), [selected, setSelected] = useState(content.explorer.platforms[0].id);
    const platforms = content.explorer.platforms.filter(p => focus === 'All' || p.focus.includes(focus));
    const platform = platforms.find(p => p.id === selected) || platforms[0];
    return <section className="interactive-panel culture-explorer"><p className="eyebrow"><Copy>{"Review framework"}</Copy></p><h2><Copy>{content.explorer.title}</Copy></h2><p><Copy>{content.explorer.caption}</Copy></p><div className="filter-buttons" aria-label={tr("Assessment dimension")}>{['All', ...content.explorer.dimensions].map(d => <Button variant="outline" key={d} aria-pressed={focus === d} onClick={() => setFocus(d)}><Copy>{d}</Copy></Button>)}</div><div className="culture-layout"><div className="platform-list" aria-label={tr("Material families")}>{platforms.map(p => <Button variant="outline" key={p.id} aria-pressed={platform.id === p.id} onClick={() => setSelected(p.id)}><Copy>{p.label}</Copy></Button>)}</div><article className="platform-detail" aria-live="polite"><p className="eyebrow"><Copy>{platform.family}</Copy></p><h3><Copy>{platform.label}</Copy></h3><h4><Copy>{"What I would examine"}</Copy></h4><p><Copy>{platform.examine}</Copy></p><h4><Copy>{"Evidence to request"}</Copy></h4><p><Copy>{platform.request}</Copy></p><div className="focus-tags">{platform.focus.map(f => <span key={f}><Copy>{f}</Copy></span>)}</div></article></div></section>;
}
