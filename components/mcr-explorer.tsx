'use client';
import { Copy, SiteLink, useSite } from '@/components/site-context';
import { useState } from 'react';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/select';
import records from '@/lib/mcr-plates.json';
const maxOD = Math.max(...records.plates.flatMap(p => p.values.flat()));
function cellStyle(t: number, dark: boolean) {
    const rgb = dark ? [36 + 154*t, 32 + 118*t, 46 + 181*t] : [249 - 151*t, 245 - 190*t, 255 - 111*t];
    const rounded = rgb.map(Math.round);
    const linear = rounded.map(v => { const c = v/255; return c <= .04045 ? c/12.92 : Math.pow((c+.055)/1.055,2.4); });
    const luminance = linear[0]*.2126 + linear[1]*.7152 + linear[2]*.0722;
    return { background: `rgb(${rounded.join(',')})`, color: luminance > .179 ? '#000' : '#fff' };
}
export function McrExplorer() {
    const { tr, dark } = useSite();
    const [id, setId] = useState(records.plates[0].id), [cell, setCell] = useState([0, 0]);
    const plate = records.plates.find(p => p.id === id)!;
    return <section className="interactive-panel" aria-label={tr("Checkerboard growth explorer")}><div className="explorer-top"><div><p className="eyebrow"><Copy>{"Recorded growth assays"}</Copy></p><h2><Copy>{"Read the checkerboard."}</Copy></h2></div><Select value={id} onValueChange={v => {
            if (v) {
                setId(v);
                setCell([0, 0]);
            }
        }}><SelectTrigger aria-label={tr("Choose experiment")}><SelectValue><Copy>{plate.compound}</Copy> / <Copy>{plate.date}</Copy> / <Copy>{plate.strainLabel}</Copy></SelectValue></SelectTrigger><SelectContent>{records.plates.map(p => <SelectItem value={p.id} key={p.id}><Copy>{p.compound}</Copy> / <Copy>{p.date}</Copy> / <Copy>{p.strainLabel}</Copy></SelectItem>)}</SelectContent></Select></div>
 <p><Copy>{"Select an experiment, then select a well to read its concentrations and OD600. Colours use the same scale across all experiments."}</Copy></p>
 <div className="heatmap-layout"><div><p className="small muted"><Copy>{"Columns: colistin (\u00B5g/mL) \u00B7 Rows:"}</Copy>{' '}<Copy>{plate.compound}</Copy>{' '}<Copy>{"(\u00B5g/mL)"}</Copy></p><div className="data-scroll heatmap-scroll"><table className="heatmap"><caption><Copy>{plate.compound}</Copy>, <Copy>{plate.strainLabel}</Copy>, <Copy>{plate.date}</Copy>{' '}<Copy>{": OD600"}</Copy></caption><thead><tr><th scope="col"><Copy>{"\u00B5g/mL"}</Copy></th>{plate.colistinConcentrations.map(v => <th scope="col" key={v}><Copy>{v}</Copy></th>)}</tr></thead><tbody>{plate.values.map((row, i) => <tr key={i}><th scope="row"><Copy>{plate.adjuvantConcentrations[i]}</Copy></th>{row.map((v, j) => { const t = Math.max(0, v / maxOD); return <td key={j}><button type="button" aria-pressed={cell[0] === i && cell[1] === j} aria-label={tr(`${tr(plate.compound)} ${plate.adjuvantConcentrations[i]}, colistin ${plate.colistinConcentrations[j]} micrograms per millilitre: OD600 ${v}`)} onClick={() => setCell([i, j])} style={cellStyle(t, dark)}><Copy>{v.toFixed(2)}</Copy></button></td>; })}</tr>)}</tbody></table></div><div className="heat-scale"><span>0</span><i /><span><Copy>{maxOD.toFixed(2)}</Copy>{' '}<Copy>{"OD600"}</Copy></span></div></div>
 <aside className="well-detail" aria-live="polite"><span className="eyebrow"><Copy>{"Selected well"}</Copy></span><strong><Copy>{plate.values[cell[0]][cell[1]].toFixed(3)}</Copy></strong><span><Copy>{"OD600"}</Copy></span><dl><dt><Copy>{plate.compound}</Copy></dt><dd><Copy>{plate.adjuvantConcentrations[cell[0]]}</Copy>{' '}<Copy>{"\u00B5g/mL"}</Copy></dd><dt><Copy>{"Colistin"}</Copy></dt><dd><Copy>{plate.colistinConcentrations[cell[1]]}</Copy>{' '}<Copy>{"\u00B5g/mL"}</Copy></dd><dt><Copy>{"Recorded strain"}</Copy></dt><dd><Copy>{plate.strainLabel}</Copy></dd></dl></aside></div>
 <p className="interpretation"><Copy>{"These are exploratory endpoint readouts, not calculated FIC indices. Each cell represents one recorded well. The displayed strain labels do not by themselves establish MCR-1 expression."}</Copy></p><details><summary><Copy>{"Controls, processing and source"}</Copy></summary><p><Copy>{plate.processing}</Copy>{' '}<Copy>{"The source figures corroborate \u00B5g/mL units. MIC thresholds and replicate structure have not been established for this public comparison. Non-monotonic wells and differences between records need to be resolved before a formal synergy estimate."}</Copy></p><p className="small muted"><Copy>{"Source:"}</Copy>{' '}<Copy>{plate.source}</Copy>, <Copy>{plate.sheet}</Copy>, <Copy>{plate.range}</Copy>.</p><div className="data-scroll"><table><caption><Copy>{"Recorded control wells"}</Copy></caption><thead><tr><th><Copy>{"Row"}</Copy></th><th><Copy>{"DMSO"}</Copy></th><th><Copy>{"Growth"}</Copy></th><th><Copy>{"Empty"}</Copy></th><th><Copy>{"Sterility"}</Copy></th></tr></thead><tbody>{plate.controls.map((r, i) => <tr key={i}><th><Copy>{i + 1}</Copy></th><td><Copy>{r.DMSO}</Copy></td><td><Copy>{r.growth}</Copy></td><td><Copy>{r.empty}</Copy></td><td><Copy>{r.sterility}</Copy></td></tr>)}</tbody></table></div><SiteLink className="text-link" href="/data/mcr-checkerboards.csv" download><Copy>{"Download recorded checkerboards (CSV) \u2193"}</Copy></SiteLink></details></section>;
}
