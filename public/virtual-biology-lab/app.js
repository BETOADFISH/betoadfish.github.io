(function () {
  'use strict';
  const C=window.LabCore, ids=Object.keys(C.defs), KEY='virtual-biology-lab-demo-'+C.VERSION;
  const $=id=>document.getElementById(id);
  const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const fmt=(n,d=2)=>n===null||n===undefined?'—':Number(n).toFixed(d).replace(/^-0\.(0+)$/,'0.$1');
  const colours={teal:'#087f82',blue:'#2d5fa8',plum:'#913e65',green:'#42754a'};
  const softs={teal:'#e9f5f4',blue:'#edf3fa',plum:'#f8edf3',green:'#eff5e9'};
  const iconPaths={
    osmosis:'<path d="M10 3v7L4 22q-1 3 3 3h14q4 0 3-3l-6-12V3M8 3h12M7 18h14"/><path d="M13 12c-4 5-4 7 0 7s4-2 0-7Z"/>',
    enzyme:'<path d="M8 3h12M10 3v7L4 22q-1 3 3 3h14q4 0 3-3l-6-12V3M7 18h14"/><circle cx="12" cy="21" r="1"/><circle cx="17" cy="15" r="1.4"/><circle cx="22" cy="6" r="2"/>',
    beetroot:'<path d="M12 9C3 9 4 20 14 25c10-5 11-16 2-16M14 10V3m0 3-5-3m5 2 6-3M8 15h12M10 19h8"/>',
    photosynthesis:'<path d="M7 24C4 9 12 6 24 4c0 14-7 23-17 20ZM7 24 20 10m-7 8v-7m0 7h7"/>',
    ecology:'<path d="M3 3h22v22H3ZM3 10h22M3 18h22M10 3v22M18 3v22"/><circle cx="7" cy="7" r="1"/><circle cx="14" cy="14" r="1"/><circle cx="22" cy="22" r="1"/>'
  };
  function icon(id,size=30){return `<svg width="${size}" height="${size}" viewBox="0 0 28 28" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${iconPaths[id]}</svg>`;}
  function freshModule(id){return {config:C.defaults(id),series:[],prediction:'',conclusion:'',showSD:true,showTruth:false,observedId:null};}
  function freshState(){return {version:C.VERSION,selected:'osmosis',projection:false,modules:Object.fromEntries(ids.map(id=>[id,freshModule(id)]))};}
  let state=freshState(), pending=null, timer=null, initialNotice='', lastRendered=null;
  function validateNotebook(data){
    if(!data||data.version!==C.VERSION||!ids.includes(data.selected)||!data.modules)throw Error('This notebook version is not supported. Keep the original file.');
    const result=freshState();result.selected=data.selected;result.projection=Boolean(data.projection);let total=0;
    for(const id of ids){
      const m=data.modules[id];if(!m||!Array.isArray(m.series)||m.series.length>40)throw Error('The notebook has an invalid experiment record.');
      const dest=result.modules[id];dest.config=C.validate(id,m.config);
      for(const key of ['prediction','conclusion']){if(typeof m[key]!=='string'||m[key].length>4000)throw Error('Notebook text must be under 4,000 characters per field.');dest[key]=m[key];}
      dest.showSD=m.showSD!==false;dest.showTruth=Boolean(m.showTruth);dest.observedId=typeof m.observedId==='string'?m.observedId:null;
      const seen=new Set();
      for(const s of m.series){
        const config=C.validate(id,s.config),key=C.protocolKey(id,config);
        if(seen.has(key)||!Array.isArray(s.rows)||s.rows.length>300)throw Error('The notebook has duplicated or oversized series.');seen.add(key);
        const rows=[];const counts=new Map();
        for(const r of s.rows){
          let expected;
          if(id==='ecology')expected=C.quadrat(config,rows,r.cellIndex);
          else{const rep=(counts.get(r.x)||0)+1;if(r.replicate!==rep)throw Error('Replicate identities are inconsistent.');expected=C.sample(id,config,r.x,rep);counts.set(r.x,rep);}
          if(JSON.stringify(expected)!==JSON.stringify(r))throw Error('Stored readings do not match this model version and seed. The file has not been altered.');
          rows.push(r);
        }
        total+=rows.length;if(total>2000)throw Error('This notebook exceeds the 2,000-observation limit.');
        dest.series.push({key,config,rows});
      }
    }
    return result;
  }
  try{const raw=localStorage.getItem(KEY);if(raw){state=validateNotebook(JSON.parse(raw));initialNotice='Previous notebook restored on this device.';}}catch(e){initialNotice='Local storage is unavailable or the saved notebook could not be restored. Save a notebook file to keep your work.';}
  function moduleState(){return state.modules[state.selected];}
  function activeSeries(){const m=moduleState();return m.series.find(s=>s.key===C.protocolKey(state.selected,m.config));}
  function save(){
    clearTimeout(timer);
    try{localStorage.setItem(KEY,JSON.stringify(state));$('save-status').textContent='Saved on this device';$('save-status').classList.remove('failed');}
    catch(e){$('save-status').textContent='Not saved — save a notebook file';$('save-status').classList.add('failed');}
  }
  function announce(text,error=false){const el=$('global-message');el.textContent=text;el.className='global-message visible'+(error?' error':'');}
  function cfgFields(id){const d=C.defs[id];return [...(d.primary?[d.primary]:[]),...d.controls];}
  function fieldControl(f,c,primary=false){
    const value=c[f.key], disabled=state.selected==='ecology'&&c.strategy==='manual'&&f.key==='batch';
    let input;
    if(f.type==='select')input=`<select class="config-field" name="${f.key}" id="cfg-${f.key}">${f.options.map(([v,label])=>`<option value="${esc(v)}"${value===v?' selected':''}>${esc(label)}</option>`).join('')}</select>`;
    else input=`<div class="input-pair"><input type="range" id="range-${f.key}" data-pair="${f.key}" min="${f.min}" max="${f.max}" step="${f.step}" value="${value}" aria-label="${esc(f.label)} slider"${disabled?' disabled':''}><input class="config-field" name="${f.key}" id="cfg-${f.key}" type="number" min="${f.min}" max="${f.max}" step="${f.step}" value="${value}"${disabled?' disabled':''}></div>`;
    return `<div class="field${primary?' primary-field':''}"><label for="cfg-${f.key}">${esc(f.label)}${f.unit?`<span class="unit">${esc(f.unit)}</span>`:''}</label>${input}${disabled?'<p class="seed-help">Choose one square at a time on the map.</p>':''}</div>`;
  }
  function controls(id,m){const d=C.defs[id],c=m.config,manual=id==='ecology'&&c.strategy==='manual';return `<section class="setup"><h2>Set up your investigation</h2><form id="setup-form" novalidate>
    ${id==='ecology'?d.controls.map(f=>fieldControl(f,c)).join(''):fieldControl(d.primary,c,true)}
    ${id!=='ecology'?`<div class="field"><label for="cfg-repeats">Fresh repeats per level</label><select id="cfg-repeats" name="repeats" class="config-field">${[1,2,3,4,5].map(n=>`<option${c.repeats===n?' selected':''}>${n}</option>`).join('')}</select><p class="seed-help">Used by Run gradient. Run one adds one new sample.</p></div>`:''}
    <div class="run-actions"><button class="primary-button" type="button" data-action="run-one"${manual?' disabled':''}>${id==='ecology'?'Sample one quadrat':'Run one sample'}</button><button class="secondary-button" type="button" data-action="run-series"${manual?' disabled':''}>${id==='ecology'?'Sample '+c.batch+' quadrats':'Run gradient'}</button></div>
    <details id="control-details" class="control-details"><summary>${id==='ecology'?'Reproducible scenario':'Control conditions &amp; seed'}</summary>${id==='ecology'?'':d.controls.map(f=>fieldControl(f,c)).join('')}<div class="field seed-field"><label for="cfg-seed">Scenario seed</label><div class="seed-row"><input class="config-field seed-input" type="number" id="cfg-seed" name="seed" min="0" max="4294967295" step="1" value="${c.seed}"><button type="button" data-action="new-seed">New seed</button></div><p class="seed-help">Same setup + seed + sample order gives the same data.</p></div></details>
    <div id="form-error" class="form-error" role="alert"></div><button type="button" data-action="reset" class="reset-link">Reset this experiment</button>
  </form></section>`;}
  function svgFrame(body,label){return `<svg class="apparatus" viewBox="0 0 680 245" role="img" aria-label="${esc(label)}"><line x1="25" y1="212" x2="655" y2="212" stroke="#bfd3df" stroke-width="2"/>${body}</svg>`;}
  const svgText=(x,y,text,size=15,fill='#345368',anchor='middle')=>`<text x="${x}" y="${y}" text-anchor="${anchor}" font-size="${size}" fill="${fill}">${esc(text)}</text>`;
  function apparatus(id,c,row){
    const x=row?row.x:c.x;
    if(id==='osmosis'){
      const mass=row?fmt(row.final,Number(c.resolution)===0.1?1:2)+' g':'— g';
      return svgFrame(`<path d="M100 53v142q0 17 18 17h92q18 0 18-17V53" fill="#f1f8fc" stroke="#88adbf" stroke-width="3"/><path d="M103 105h122v89q0 15-15 15h-92q-15 0-15-15Z" fill="#d7eaf3"/><ellipse cx="164" cy="105" rx="61" ry="7" fill="#e8f6fb"/><rect x="147" y="125" width="35" height="65" rx="9" fill="#d9c58b" stroke="#9b884e" stroke-width="2"/><path d="M154 138v40m10-35v28m10-30v38" stroke="#ad995d" stroke-width="2"/>${svgText(164,33,'Sucrose '+fmt(x)+' mol dm⁻³',15)}<path d="M270 130h55m-10-7 10 7-10 7" fill="none" stroke="#89a9b9" stroke-width="2"/><rect x="361" y="132" width="214" height="80" rx="12" fill="#e5eef4" stroke="#87a5b7" stroke-width="2"/><path d="M400 130v-12h138v12" fill="none" stroke="#64899f" stroke-width="3"/><rect x="400" y="146" width="135" height="48" rx="4" fill="#153244"/>${svgText(468,179,mass,27,'#f1ffff')}${svgText(468,101,'Paired mass measurement',16)}${svgText(164,237,c.duration+' simulated minutes',13)}${svgText(468,237,'Blotted before weighing',13)}`,'Potato tissue in sucrose solution and a balance displaying the recorded final mass.');
    }
    if(id==='enzyme'){
      const trace=row?.trace||[],mx=trace.length?Math.max(.02,...trace.map(p=>p.oxygen)):.1;
      const path=trace.map((p,i)=>(i?'L':'M')+(360+p.t*24).toFixed(1)+' '+(190-p.oxygen/mx*110).toFixed(1)).join(' ');
      return svgFrame(`<path d="M102 52h47v58l50 77q13 23-15 25H66q-25-2-12-25l48-77Z" fill="#f1f7fd" stroke="#83a7bc" stroke-width="3"/><path d="M84 147h85l28 44q5 17-16 18H69q-18-1-13-18Z" fill="#d7e7f6"/><rect x="101" y="47" width="48" height="16" rx="4" fill="#537894"/>${[0,1,2,3,4].map(i=>`<circle cx="${100+(i%3)*16}" cy="${180-i*17}" r="${3+i%2}" fill="white" stroke="#80a6bf"/>`).join('')}${svgText(125,28,'Catalase + H₂O₂',16)}${svgText(125,237,fmt(x,1)+' mmol dm⁻³',13)}<path d="M344 70v121h265" fill="none" stroke="#91aebe" stroke-width="2"/>${svgText(473,44,'Oxygen in the first 10 seconds',15)}${trace.length?`<path d="${path}" fill="none" stroke="#2d5fa8" stroke-width="3"/>${trace.map(p=>`<circle cx="${360+p.t*24}" cy="${190-p.oxygen/mx*110}" r="4" fill="#2d5fa8"/>`).join('')}`:svgText(480,140,'Run a fresh reaction to record a trace',13)}${svgText(360,211,'0 s',12)}${svgText(600,211,'10 s',12)}${svgText(480,237,row?fmt(row.oxygen10,3)+' µmol O₂ at 10 s':'Initial window; not the full reaction',13)}`,'Catalase reaction vial and the recorded initial oxygen time trace.');
    }
    if(id==='beetroot'){
      const alpha=row?Math.min(.9,.08+row.y*.6):.18;
      return svgFrame(`<path d="M35 140h210v64q0 8-8 8H43q-8 0-8-8Z" fill="#e3edf6" stroke="#99b1c4" stroke-width="2"/><path d="M90 52h48v126q0 24-24 24t-24-24Z" fill="#fcf5f8" stroke="#9c7590" stroke-width="2.5"/><path d="M94 108h40v69q0 21-20 21t-20-21Z" fill="#ad2c63" opacity="${alpha}"/><ellipse cx="114" cy="177" rx="15" ry="7" fill="#8e3159"/>${svgText(140,234,x+' °C water bath',14)}${svgText(113,32,'Fresh disc',15)}<path d="M268 121h54m-10-7 10 7-10 7" fill="none" stroke="#99a9b9" stroke-width="2"/><rect x="359" y="70" width="254" height="140" rx="10" fill="#f0e8ef" stroke="#a38299" stroke-width="2"/><rect x="467" y="50" width="37" height="57" rx="2" fill="#fdf6fa" stroke="#a38299" stroke-width="2"/><rect x="472" y="67" width="27" height="37" fill="#ad2c63" opacity="${alpha}"/><rect x="401" y="120" width="169" height="59" rx="5" fill="#432e40"/>${svgText(486,160,row?fmt(row.y,3):'—',31,'#fff6fc')}${svgText(486,194,'Absorbance at 535 nm',13)}${svgText(486,237,'Read at 20 °C against water blank',12)}`,'Temperature bath, beetroot disc and a colorimeter showing sample absorbance.');
    }
    if(id==='photosynthesis'){
      return svgFrame(`<path d="M63 184V59h62" fill="none" stroke="#7e9cae" stroke-width="7" stroke-linecap="round"/><path d="M108 42h52l27 49h-97Z" fill="#d7e1e9" stroke="#7d98aa" stroke-width="2"/><path d="m183 78 118 26m-115-17 113 55m-119-41 103 83" stroke="#d0ae50" stroke-width="3" opacity="${x===0?0:.15+.65*x/1000}"/><path d="M296 49h178v149q0 14-14 14H310q-14 0-14-14Z" fill="#e8f6f6" stroke="#7da5ad" stroke-width="2.5"/><path d="M300 88h170v109q0 11-12 11H312q-12 0-12-11Z" fill="#d7eceb"/><path d="M385 197V91m0 87c-47-3-47-33 0-22m0-10c41-2 47-33 0-24m0-1c-36-4-37-27 0-18" fill="#78a884" stroke="#42754a" stroke-width="3"/><path d="M441 112V24h113v108" fill="none" stroke="#64889d" stroke-width="3"/><circle cx="441" cy="117" r="5" fill="#376479"/><rect x="514" y="129" width="145" height="73" rx="7" fill="#deebf0" stroke="#7d9eaf" stroke-width="2"/><rect x="528" y="142" width="117" height="41" rx="4" fill="#153244"/>${svgText(587,171,row?fmt(row.final,2):'—',25,'#effcff')}${svgText(129,234,x+' PPFD',13)}${svgText(385,234,c.duration+' simulated minutes',13)}${svgText(586,221,'Dissolved O₂ / µmol',12)}`,'Controlled light source, aquatic shoot and a dissolved-oxygen sensor.');
    }
    return '';
  }
  function fieldView(c,rows,m){const f=C.field(c),sampled=new Map(rows.map(r=>[r.cellIndex,r])),manual=c.strategy==='manual';return `<div class="field-scene"><svg class="plant-map" viewBox="0 0 1000 1000" aria-hidden="true">${f.points.map(p=>`<circle cx="${p.x*100}" cy="${p.y*100}" r="5.5" fill="#4b7951"/>`).join('')}</svg><div class="quadrat-grid" aria-label="100 one-square-metre quadrats. Coordinates start at top left.">${f.counts.map((_,i)=>`<button type="button" class="quadrat-cell${sampled.has(i)?' sampled':''}${manual&&!sampled.has(i)?' available-manual':''}" data-cell="${i}" aria-label="Quadrat ${i%10}, ${Math.floor(i/10)}${sampled.has(i)?', sampled, '+sampled.get(i).count+' plants':''}"${!manual||sampled.has(i)?' disabled':''}>${sampled.has(i)?sampled.get(i).count:''}</button>`).join('')}</div></div><p class="field-caption">10 × 10 m. Each square is 1 m²; each dot is a rooted plant.<br>${manual?'Select a square to sample it. Arrow keys move between squares.':'Highlighted squares show observed counts. No square is counted twice.'}</p><div class="field-actions"><button type="button" data-action="truth"${rows.length?'':' disabled'}>${m.showTruth?'Hide population total':'Reveal population total'}</button>${m.showTruth?`<p class="field-true">This virtual meadow contains <strong>${f.total} plants</strong>.${rows.length?' Latest estimate: '+fmt(rows.at(-1).y,1)+' ('+fmt((rows.at(-1).y-f.total)/f.total*100,1)+'% signed error).':''}</p>`:''}</div>`;}
  function selectedRow(m,s){return s?.rows.find(r=>r.id===m.observedId)||s?.rows.at(-1);}
  function readout(id,c,row,rows){
    if(!row)return '<p class="empty-readout">Set your conditions, then collect your first observation. This is a setup preview; no result has been generated.</p>';
    let value,unit,detail;
    if(id==='osmosis'){const digits=Number(c.resolution)===0.1?1:2;value=(row.y>0?'+':'')+fmt(row.y);unit='mass change / %';detail=`${fmt(row.initial,digits)} g → ${fmt(row.final,digits)} g. (${fmt(row.final,digits)} − ${fmt(row.initial,digits)}) ÷ ${fmt(row.initial,digits)} × 100. Fresh piece ${row.replicate} at ${fmt(row.x)} mol dm⁻³.`;}
    if(id==='enzyme'){value=fmt(row.y,3);unit='initial O₂ rate / µmol min⁻¹';detail=`(${fmt(row.oxygen10,3)} − ${fmt(row.oxygen0,3)}) µmol ÷ (10/60) min. Fresh mixture ${row.replicate} at ${fmt(row.x,1)} mmol dm⁻³. The trace shows the recorded early readings.`;}
    if(id==='beetroot'){value=fmt(row.y,3);unit='absorbance, dimensionless';detail=`Fresh disc ${row.replicate} exposed to ${row.x} °C for ${c.duration} min. ${c.rinsed==='yes'?'Cut surfaces rinsed.':'Cut surfaces not rinsed.'} Water blank: 0.000. The aliquot is read at 20 °C.`;}
    if(id==='photosynthesis'){value=(row.y>0?'+':'')+fmt(row.y,3);unit='net O₂ rate / µmol min⁻¹';detail=`(${fmt(row.final)} − ${fmt(row.initial)}) µmol ÷ ${c.duration} min. Matched shoot ${row.replicate} at PPFD ${row.x}. ${row.y<0?'Negative means net oxygen consumption.':'This is net production after respiratory oxygen use.'}`;}
    if(id==='ecology'){value=fmt(rows.at(-1).y,1);unit='estimated plants in 100 m²';detail=`${rows.reduce((s,r)=>s+r.count,0)} plants in ${rows.length} distinct 1 m² quadrats. Mean density × 100 m² gives the estimate. Last sampled quadrat ${rows.at(-1).cell}: ${rows.at(-1).count} plants.`;}
    return `<div class="bench-readout"><div class="value">${value}<small>${esc(unit)}</small></div><p>${esc(detail)}</p></div>`;
  }
  function graphSvg(id,c,rows,showSD,showTruth){
    const d=C.defs[id],eco=id==='ecology',gs=eco?[]:C.groups(rows),accent=colours[d.theme];
    const left=72,right=776,top=72,bottom=302,width=right-left,height=bottom-top;
    const xmax=eco?Math.max(10,Math.ceil(rows.length/10)*10):d.primary.max,xmin=eco?0:d.primary.min;
    const all=rows.map(r=>r.y);if(showSD)gs.forEach(g=>{if(g.sd!==null)all.push(g.mean-g.sd,g.mean+g.sd);});
    if(eco&&showTruth)all.push(C.field(c).total);
    const defaultMax={osmosis:15,enzyme:1.2,beetroot:1.5,photosynthesis:1,ecology:350}[id];
    let ymin=Math.min(0,...all),ymax=Math.max(0,...all);if(!rows.length){ymax=defaultMax;if(id==='osmosis')ymin=-15;if(id==='photosynthesis')ymin=-.2;}
    const span=ymax-ymin||defaultMax*.2; ymax+=span*.13;if(ymin<0)ymin-=span*.1;
    const rough=(ymax-ymin)/5,power=10**Math.floor(Math.log10(rough)),fraction=rough/power;
    const ystep=(fraction<=1?1:fraction<=2?2:fraction<=2.5?2.5:fraction<=5?5:10)*power;
    ymin=Math.floor(ymin/ystep)*ystep;ymax=Math.ceil(ymax/ystep)*ystep;
    const sx=x=>left+(x-xmin)/(xmax-xmin)*width,sy=y=>bottom-(y-ymin)/(ymax-ymin)*height;
    const tick=v=>Math.abs(v)<1e-10?'0':Math.abs(v)>=100?String(Math.round(v)):Math.abs(v)>=10?fmt(v,0):fmt(v,2).replace(/\.?0+$/,'');
    let body=svgText(left,23,d.name+' — Simulated data',16,'#153244','start')+svgText(left,48,d.yLabel,13,'#36576a','start');
    for(let i=0;i<=Math.round((ymax-ymin)/ystep);i++){const y=ymin+ystep*i,pos=sy(y);body+=`<line x1="${left}" y1="${pos}" x2="${right}" y2="${pos}" stroke="#dce7ec"/>`+svgText(left-12,pos+4,tick(y),12,'#506a7a','end');}
    const xIntervals=id==='osmosis'?6:id==='enzyme'?4:id==='beetroot'?7:5;
    for(let i=0;i<=xIntervals;i++){const x=xmin+(xmax-xmin)*i/xIntervals,pos=sx(x);body+=`<line x1="${pos}" y1="${bottom}" x2="${pos}" y2="${bottom+5}" stroke="#90a8b6"/>`+svgText(pos,bottom+22,tick(x),12);}
    body+=`<path d="M${left} ${top}V${bottom}H${right}" fill="none" stroke="#6b899c" stroke-width="1.5"/>`;
    if(ymin<0)body+=`<line x1="${left}" y1="${sy(0)}" x2="${right}" y2="${sy(0)}" stroke="#597585" stroke-width="1.5"/>`;
    if(eco&&rows.length)body+=`<path d="${rows.map((r,i)=>(i?'L':'M')+sx(r.x)+','+sy(r.y)).join(' ')}" stroke="${accent}" fill="none" stroke-width="2"/>`;
    if(eco&&showTruth){const y=sy(C.field(c).total);body+=`<line x1="${left}" y1="${y}" x2="${right}" y2="${y}" stroke="#935320" stroke-dasharray="6 4"/>`+svgText(right-5,y-7,'Actual population: '+C.field(c).total,12,'#935320','end');}
    body+=rows.map(r=>`<circle class="graph-point" data-observation="${esc(r.id)}" data-x="${r.x}" data-y="${r.y}" tabindex="0" role="button" aria-label="Observation ${esc(r.id)}, x ${fmt(r.x,2)}, result ${fmt(r.y,3)}" cx="${sx(r.x)}" cy="${sy(r.y)}" r="4.5" fill="white" stroke="${accent}" stroke-width="1.6"><title>${esc(r.id)}: ${fmt(r.y,3)}</title></circle>`).join('');
    gs.forEach(g=>{const x=sx(g.x),y=sy(g.mean);if(showSD&&g.sd!==null)body+=`<path d="M${x} ${sy(g.mean-g.sd)}V${sy(g.mean+g.sd)}M${x-5} ${sy(g.mean-g.sd)}h10M${x-5} ${sy(g.mean+g.sd)}h10" stroke="${accent}" fill="none" stroke-width="1.5"/>`;body+=`<path d="M${x} ${y-6}l6 6-6 6-6-6Z" fill="${accent}"><title>Mean ${fmt(g.mean,3)}, n=${g.n}${g.sd!==null?', sample SD='+fmt(g.sd,3):', SD undefined'}</title></path>`;});
    if(!rows.length)body+=svgText((left+right)/2,(top+bottom)/2,'Your observations will appear here.',18,'#718b9a');
    body+=svgText((left+right)/2,351,d.xLabel,13)+svgText(left,377,eco?'Running estimate; not a confidence interval.':'Circles: fresh samples. Diamonds: means.'+(showSD?' Bars: ±1 sample SD, not a confidence interval.':''),11,'#506a7a','start');
    body+=svgText(left,397,`Seed ${c.seed} | ${C.MODEL} | ${C.ANALYSIS} | ${rows.length} observations`,12,'#506a7a','start');
    body+=svgText(left,417,C.protocolLabel(id,c),12,'#506a7a','start');
    body+=svgText(left,437,d.fixed,12,'#506a7a','start');
    return `<svg class="data-chart" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 810 450" role="img" aria-label="${esc(d.name)} results. ${rows.length} observations. Numerical values are in the table below."><title>${esc(d.name)} — simulated data</title><desc>${esc(C.protocolLabel(id,c))}. ${esc(d.fixed)}. ${esc(d.limitation)}</desc><rect width="810" height="450" fill="white"/>${body}</svg>`;
  }
  function analysisText(id,c,rows){
    if(!rows.length)return 'Collect data before drawing a conclusion. Changing a control or the seed starts a separate series and keeps earlier observations.';
    if(id==='ecology')return `${rows.length} distinct quadrats sampled. ${c.strategy==='random'?'Each grid cell has the same chance of selection. The next sample need not improve the estimate.':c.strategy==='edge'?'Only the 36 perimeter quadrats are eligible. More edge samples cannot guarantee a representative estimate.':'You chose the positions. Evaluate whether your choices represent the whole meadow.'}`;
    const gs=C.groups(rows);let out=`${rows.length} independent samples across ${gs.length} levels. `;
    if(gs.some(g=>g.n===1))out+='At least one level has only one sample; its sample SD is undefined. ';
    if(id==='osmosis'){
      const r=C.roots(gs);
      if(r.status==='insufficient')out+='Measure at least two concentrations to examine a zero-change point.';
      else if(r.status==='unbracketed')out+='The measured means do not bracket zero. Do not extrapolate a zero-change concentration from these data.';
      else if(r.status==='multiple')out+='There are several zero or crossing candidates. These data do not support one unique estimate.';
      else if(r.status==='observed-zero')out+=`An observed zero mean occurs at ${fmt(r.value)} mol dm⁻³. This does not establish exact equilibrium.`;
      else{const b=r.crossings[0];out+=`Local interpolation between ${fmt(b.left)} and ${fmt(b.right)} gives about ${fmt(r.value)} mol dm⁻³. This is an estimate from measured means.`;}
      if(rows.some(r=>Math.abs(r.final-r.initial)<=Number(c.resolution)+1e-9))out+=' Some paired changes are within one balance division.';
    }else if(id==='enzyme')out+='Use the initial oxygen slope, not the time for the whole reaction. Compare high-substrate levels before claiming a plateau.';
    else if(id==='beetroot')out+='Compare fresh discs at equal exposure times. Absorbance reflects pigment in solution, not a directly measured permeability coefficient.';
    else out+='The readings include respiration. A negative net rate means oxygen consumption exceeds oxygen production.';
    return out;
  }
  function resultTables(id,rows,observed,config){
    const d=C.defs[id];if(!rows.length)return '<div class="table-empty">No measurements yet. Run one sample or a complete gradient. Each run records fresh, identifiable samples.</div>';
    const cols=(id==='ecology'?d.columns:[['x',d.primary.label+' / '+d.primary.unit, id==='photosynthesis'||id==='beetroot'?0:2],...d.columns]).map(col=>id==='osmosis'&&['initial','final'].includes(col[0])?[col[0],col[1],Number(config.resolution)===0.1?1:2]:col);
    let table=`<div class="table-wrap"><table id="observations-table"><caption>Recorded observations — Simulated data</caption><thead><tr><th scope="col">Sample</th>${cols.map(col=>`<th scope="col">${esc(col[1])}</th>`).join('')}</tr></thead><tbody>${rows.map((r,i)=>`<tr data-record-id="${esc(r.id)}"${r.id===observed?' class="selected"':''}><td><button type="button" data-observation="${esc(r.id)}" title="${esc(r.id)}">${id==='ecology'?'Q'+(i+1):'Sample '+(i+1)}</button></td>${cols.map(([key,,dec])=>`<td data-field="${key}">${typeof r[key]==='string'?esc(r[key]):fmt(r[key],dec)}</td>`).join('')}</tr>`).join('')}</tbody></table></div>`;
    if(id!=='ecology')table+=`<details id="summary-details"><summary>Group means &amp; variation</summary><div class="table-wrap"><table id="summary-table"><caption>Same series; one mean per level</caption><thead><tr><th scope="col">${esc(d.primary.unit)}</th><th scope="col">n</th><th scope="col">Mean</th><th scope="col">Sample SD</th></tr></thead><tbody>${C.groups(rows).map(g=>`<tr><td>${fmt(g.x,2)}</td><td>${g.n}</td><td>${fmt(g.mean,3)}</td><td>${g.sd===null?'Not defined':fmt(g.sd,3)}</td></tr>`).join('')}</tbody></table></div><p class="chart-caption">${id==='osmosis'?'SD is in percentage points.':'SD has the same unit as the measured rate or absorbance.'} It describes spread, not confidence in a population mean.</p></details>`;
    return table;
  }
  function render(){
    const focus=document.activeElement?.id,id=state.selected,d=C.defs[id],m=moduleState(),c=m.config,s=activeSeries(),rows=s?.rows||[],row=selectedRow(m,s);
    const openDetails=lastRendered===id?[...document.querySelectorAll('details[open][id]')].map(el=>el.id):[];
    document.documentElement.style.setProperty('--accent',colours[d.theme]);document.documentElement.style.setProperty('--soft',softs[d.theme]);document.body.classList.toggle('projection',state.projection);$('projection').setAttribute('aria-pressed',String(state.projection));
    $('experiments').innerHTML=ids.map(k=>`<button type="button" class="experiment-button" data-module="${k}" aria-pressed="${k===id}">${icon(k)}<span>${esc(C.defs[k].name)}<small>${esc(C.defs[k].short)}</small></span></button>`).join('');
    $('workspace').innerHTML=`<div class="experiment-heading"><div><ol class="steps"><li><span>1</span> Set conditions</li><li><span>2</span> Collect evidence</li><li><span>3</span> Explain</li></ol><h1>${esc(d.name)}</h1><p class="question">${esc(d.question)}</p></div><div class="module-symbol">${icon(id,65)}</div></div>
      <div class="workbench${id==='ecology'?' ecology-bench':''}">${controls(id,m)}<section class="bench-area"><div class="bench-title"><h2>${esc(d.specimen)}</h2><span>${row?'Recorded observation':'Setup preview'}</span></div><p class="fixed-conditions">${esc(d.fixed)}</p>${id==='ecology'?fieldView(c,rows,m):apparatus(id,c,row)}${readout(id,c,row,rows)}<p class="bench-source">${esc(d.source)} ${id!=='ecology'?'Waiting time is accelerated.':''}</p></section></div>
      <div class="series-bar"><div class="series-select"><label for="series-select">Data series</label><select id="series-select" aria-label="View a recorded series"><option value="draft"${s?'':' selected'}>${s?'Current settings':'New series — current settings'}</option>${m.series.map((a,i)=>`<option value="${i}"${s===a?' selected':''}>Series ${i+1}: ${esc(C.protocolLabel(id,a.config))} (${a.rows.length} observations)</option>`).join('')}</select></div><span class="series-state">Controls and seeds stay separate.<br>Changing them keeps earlier series.</span></div>
      <section class="chart-section"><div class="section-toolbar"><h2>Your evidence</h2><div class="chart-tools">${id!=='ecology'?`<label><input id="show-sd" type="checkbox"${m.showSD?' checked':''}> Show ±1 SD</label>`:''}<button type="button" data-action="export-graph" class="text-button"${rows.length?'':' disabled'}>Save graph</button></div></div><div id="chart" class="chart-host" tabindex="0" role="region" aria-label="Results graph, scroll horizontally if needed">${graphSvg(id,c,rows,m.showSD,m.showTruth)}</div><p class="chart-caption">${esc(d.aim)}</p><details id="evidence-details"><summary>Interpret these observations</summary><div class="detail-content"><p>${esc(analysisText(id,c,rows))}</p></div></details></section>
      <div class="bottom-grid"><section class="results"><h2>Experiment record</h2>${resultTables(id,rows,row?.id,c)}<div class="export-row"><button type="button" data-action="export-csv"${m.series.some(a=>a.rows.length)?'':' disabled'}>Export all series CSV</button><span class="export-hint">Includes raw values, means, controls, seeds and versions.</span></div></section><section class="notebook"><h2>Your notebook</h2><div><label for="prediction">Prediction</label><textarea id="prediction" data-note="prediction" maxlength="4000" placeholder="What do you expect, and why?">${esc(m.prediction)}</textarea></div><div><label for="conclusion">Conclusion &amp; next investigation</label><textarea id="conclusion" data-note="conclusion" maxlength="4000" placeholder="Use a number from your results. Explain a limitation and what you would test next.">${esc(m.conclusion)}</textarea></div><p>Text is saved as written. Scientific explanations need teacher review; they are not automatically graded.</p></section></div>
      <section class="support" aria-label="Help and explanations"><details id="hint-details"><summary>A hint for your investigation</summary><div class="detail-content"><p>${esc(d.hint)}</p></div></details><details id="science-details"><summary>Biological explanation &amp; model limits</summary><div class="detail-content"><p>${esc(d.explanation)}</p><p class="model-warning">${esc(d.limitation)}</p></div></details><details id="teacher-details"><summary>Teacher notes / 教师说明</summary><div class="detail-content"><p class="teacher-text">${esc(d.teacher)}</p><p>${window.LabI18n.zh?'五个模块是教学模拟，不统一标注为任何考试局的 AS 或 core practical。数字常数未由真实数据校准。网页、图表与 CSV 使用同一份实验记录。重置保留设置与种子、清除当前模块数据及笔记；按相同顺序操作可复现。不同实验的记录互不影响。':'These five modules are teaching simulations and are not uniformly designated as any examination board practicals. Numerical constants are not calibrated against real data. The page, graph and CSV use the same records. Reset clears this experiment’s data and notes but keeps its settings and seed; the same sequence reproduces results. Records are separate across experiments.'}</p><p>Model ${C.MODEL}; random generator ${C.RNG}; analysis ${C.ANALYSIS}.</p><ul class="sources-list">${d.sources.map(([label,url])=>`<li><a href="${esc(url)}" target="_blank" rel="noopener noreferrer">${esc(label)}</a> (opens online)</li>`).join('')}</ul><p><a href="guide.html?lang=${window.LabI18n.zh?'zh':'en'}">Local science and model notes</a></p></div></details></section>`;
    openDetails.forEach(key=>{if($(key))$(key).open=true;});lastRendered=id;
    if(focus&&$(focus))$(focus).focus({preventScroll:true});
  }
  function readConfig(){const m=moduleState(),raw={...m.config};document.querySelectorAll('.config-field').forEach(el=>raw[el.name]=el.value);return C.validate(state.selected,raw);}
  function commit(){try{moduleState().config=readConfig();$('form-error').textContent='';return true;}catch(e){$('form-error').textContent=e.message;return false;}}
  function ensureSeries(){const m=moduleState(),key=C.protocolKey(state.selected,m.config);let s=m.series.find(a=>a.key===key);if(!s){if(m.series.length>=40)throw Error('This experiment has 40 series. Save your notebook, then reset it before starting another.');s={key,config:{...m.config},rows:[]};m.series.push(s);}return s;}
  function run(batch=false,manualCell=null){
    if(!commit())return;
    const id=state.selected,m=moduleState(),c=m.config;
    try{
      const s=ensureSeries();const total=ids.reduce((n,k)=>n+state.modules[k].series.reduce((t,a)=>t+a.rows.length,0),0);
      let added=0;
      if(id==='ecology'){
        if(c.strategy==='manual'&&manualCell===null){announce('Choose an unsampled square on the meadow.');return;}
        const order=C.sampleOrder(c).filter(i=>!s.rows.some(r=>r.cellIndex===i));
        const chosen=manualCell===null?order.slice(0,batch?c.batch:1):[manualCell];
        if(total+chosen.length>2000)throw Error('Save your notebook and reset an experiment before adding more than 2,000 observations.');
        for(const cell of chosen){s.rows.push(C.quadrat(c,s.rows,cell));added++;}
        if(!added){announce('All eligible quadrats in this series have been sampled. Reset or change the sampling strategy to investigate again.');render();return;}
      }else{
        const levels=batch?C.defs[id].levels:[c.x],repeats=batch?c.repeats:1,amount=levels.length*repeats;
        if(s.rows.length+amount>300||total+amount>2000)throw Error('Observation limit reached. Save your notebook, then reset this experiment.');
        for(const x of levels)for(let j=0;j<repeats;j++){const rep=s.rows.filter(r=>r.x===x).length+1;s.rows.push(C.sample(id,c,x,rep));added++;}
      }
      m.observedId=s.rows.at(-1).id;save();render();announce(`${added} fresh ${id==='ecology'?'quadrat observations':'samples'} recorded. Earlier observations are unchanged.`);
    }catch(e){announce(e.message,true);}
  }
  function download(filename,content,type){const blob=new Blob([type.startsWith('image/svg')?window.LabI18n.svg(content):content],{type}),url=URL.createObjectURL(blob),a=document.createElement('a');a.href=url;a.download=filename;document.body.append(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(url),1500);announce('Download started. Check your downloads folder.');}
  function saveJson(){save();download('Biology-Lab-notebook-'+C.VERSION+'.json',JSON.stringify(state,null,2),'application/json;charset=utf-8');}
  function confirmation(kind,data){
    pending={kind,data};const reset=kind==='reset';
    $('confirmation').innerHTML=`<section class="confirm-box" role="alertdialog" aria-labelledby="confirm-title"><h3 id="confirm-title">${reset?'Reset '+esc(C.defs[data].name)+'?':'Open this saved notebook?'}</h3><p>${reset?'This clears this experiment’s measurements and notes. It keeps the current setup and seed so you can reproduce a run. Other experiments are untouched.':'This replaces the current notebook in this browser. Save your current notebook first if you want to keep it.'}</p><div class="confirm-actions"><button type="button" id="confirm-save">Save current notebook</button><button type="button" id="confirm-yes" class="danger-button">${reset?'Reset experiment':'Open notebook'}</button><button type="button" id="confirm-cancel">Cancel</button></div></section>`;
    $('confirm-cancel').focus({preventScroll:true});
  }
  function clearConfirmation(){pending=null;$('confirmation').innerHTML='';}
  $('experiments').addEventListener('click',e=>{const b=e.target.closest('[data-module]');if(!b)return;save();clearConfirmation();$('global-message').textContent='';$('global-message').className='global-message';state.selected=b.dataset.module;render();save();$('workspace').focus({preventScroll:true});});
  $('workspace').addEventListener('submit',e=>e.preventDefault());
  $('workspace').addEventListener('input',e=>{
    if(e.target.dataset.pair){$('cfg-'+e.target.dataset.pair).value=e.target.value;}
    if(e.target.dataset.note){moduleState()[e.target.dataset.note]=e.target.value;clearTimeout(timer);$('save-status').textContent='Saving…';timer=setTimeout(save,180);}
  });
  $('workspace').addEventListener('change',e=>{
    if(e.target.id==='show-sd'){moduleState().showSD=e.target.checked;save();render();return;}
    if(e.target.id==='series-select'){if(e.target.value!=='draft'){const s=moduleState().series[Number(e.target.value)];moduleState().config={...s.config};moduleState().observedId=null;save();render();}return;}
    if(e.target.classList.contains('config-field')||e.target.dataset.pair){if(commit()){save();render();}}
  });
  $('workspace').addEventListener('click',e=>{
    const observation=e.target.closest('[data-observation]');if(observation){moduleState().observedId=observation.dataset.observation;render();save();return;}
    const cell=e.target.closest('[data-cell]');if(cell&&!cell.disabled){const i=Number(cell.dataset.cell);run(false,i);const next=document.querySelector(`.quadrat-cell[data-cell="${(i+1)%100}"]:not(:disabled)`)||document.querySelector('.quadrat-cell:not(:disabled)');next?.focus({preventScroll:true});return;}
    const b=e.target.closest('[data-action]');if(!b)return;const action=b.dataset.action;
    if(action==='run-one')run(false);if(action==='run-series')run(true);
    if(action==='new-seed'){const v=new Uint32Array(1);if(window.crypto?.getRandomValues)crypto.getRandomValues(v);else v[0]=Date.now()>>>0;moduleState().config.seed=v[0];moduleState().showTruth=false;save();render();announce('A new seed starts a separate reproducible series. Earlier data are kept.');}
    if(action==='reset')confirmation('reset',state.selected);
    if(action==='truth'){moduleState().showTruth=!moduleState().showTruth;save();render();}
    if(action==='export-csv')download('Biology-Lab-'+state.selected+'-all-series.csv',C.exportCsv(state.selected,moduleState().series),'text/csv;charset=utf-8');
    if(action==='export-graph'){const m=moduleState(),s=activeSeries();if(s?.rows.length)download('Biology-Lab-'+state.selected+'-seed-'+m.config.seed+'.svg',graphSvg(state.selected,m.config,s.rows,m.showSD,m.showTruth),'image/svg+xml;charset=utf-8');}
  });
  $('workspace').addEventListener('keydown',e=>{
    if(e.target.hasAttribute('data-observation')&&(e.key==='Enter'||e.key===' ')){e.preventDefault();e.target.dispatchEvent(new MouseEvent('click',{bubbles:true}));}
    if(e.target.dataset.cell!==undefined&&['ArrowLeft','ArrowRight','ArrowUp','ArrowDown'].includes(e.key)){
      e.preventDefault();const i=Number(e.target.dataset.cell),step={ArrowLeft:-1,ArrowRight:1,ArrowUp:-10,ArrowDown:10}[e.key];for(let j=i+step;j>=0&&j<100;j+=step){const n=document.querySelector(`.quadrat-cell[data-cell="${j}"]`);if(n&&!n.disabled){n.focus({preventScroll:true});break;}}
    }
  });
  $('projection').addEventListener('click',()=>{state.projection=!state.projection;render();save();});
  $('save-json').addEventListener('click',saveJson);
  $('open-json').addEventListener('click',()=>$('import-file').click());
  $('import-file').addEventListener('change',async e=>{
    const file=e.target.files[0];e.target.value='';if(!file)return;
    if(file.size>2*1024*1024){announce('Choose a notebook smaller than 2 MiB. Your current work is unchanged.',true);return;}
    try{const data=validateNotebook(JSON.parse(await file.text()));confirmation('import',data);}catch(err){announce(err.message||'The notebook could not be opened. Your current work is unchanged.',true);}
  });
  $('confirmation').addEventListener('click',e=>{
    if(e.target.id==='confirm-save')saveJson();
    if(e.target.id==='confirm-cancel'){clearConfirmation();$('workspace').focus({preventScroll:true});}
    if(e.target.id==='confirm-yes'&&pending){
      if(pending.kind==='reset'){const id=pending.data,c={...state.modules[id].config};state.modules[id]=freshModule(id);state.modules[id].config=c;}
      else state=pending.data;
      clearConfirmation();save();render();announce('Notebook updated. The current setup and recorded values are shown.');$('workspace').focus({preventScroll:true});
    }
  });
  window.addEventListener('pagehide',save);
  window.addEventListener('keydown',e=>{if(e.key==='Escape'&&pending)clearConfirmation();});
  render();save();if(initialNotice)announce(initialNotice);
  window.LabApp={getState:()=>JSON.parse(JSON.stringify(state)),getActive:()=>JSON.parse(JSON.stringify(activeSeries()||null)),exportCsv:()=>C.exportCsv(state.selected,moduleState().series),validateNotebook};
})();
