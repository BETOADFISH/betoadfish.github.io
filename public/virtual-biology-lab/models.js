/* Biology Lab demo: transparent teaching models, not calibrated predictions. */
(function (root) {
  'use strict';
  const VERSION = '1.0.0';
  const MODEL = 'teaching-models-1';
  const RNG = 'fnv1a-mulberry32-1';
  const ANALYSIS = 'paired-and-quadrat-1';
  const number = (key, label, min, max, step, value, unit) => ({key,label,min,max,step,value,unit,type:'number'});
  const select = (key,label,options,value) => ({key,label,options,value,type:'select'});
  const defs = {
    osmosis: {
      name:'Potato osmosis', short:'Water & mass', theme:'teal', specimen:'Fresh potato tissue',
      question:'Which sucrose concentration produces no net change in tissue mass?',
      aim:'Use paired masses, independent tissue pieces and a concentration gradient to estimate a zero-change point.',
      primary:number('x','Sucrose concentration',0,0.6,0.01,0.3,'mol dm⁻³'),
      controls:[number('duration','Immersion time',10,60,10,40,'min'),select('resolution','Balance division',[['0.01','0.01 g'],['0.1','0.1 g']],'0.01')],
      levels:[0,0.1,0.2,0.3,0.4,0.5,0.6],
      xLabel:'Sucrose concentration / mol dm⁻³', yLabel:'Percentage change in mass / %', yUnit:'%',
      fixed:'20 °C · 30 cm³ solution per piece · 30 × 9 mm cylinders · blotted before both weighings',
      sampleLabel:'Fresh tissue piece', source:'One virtual potato; a separate container for each piece.',
      hint:'Compare each final mass with its own initial mass. Does your measured range include both gains and losses?',
      explanation:'Water moves net from higher to lower water potential through partially permeable membranes. Estimate a zero-change concentration only when the measured group means support it. A zero mass change does not mean that water molecules stop moving, or that the external sucrose concentration equals the concentration inside every cell.',
      limitation:'The bounded mass-response curve and its time constant are teaching assumptions. No real potato data calibrated these values. A 40-minute result does not prove equilibrium; the bath concentration is treated as constant.',
      teacher:'每个重复是一块新组织，全部来自同一个虚拟块茎；不是同一块反复称量，也不是多个独立植株。百分比由显示的初终质量计算。0.1 g 天平可能掩盖近零变化。先比较不同浓度，再让学生解释为何不能直接推断胞内蔗糖浓度。',
      columns:[['initial','Initial / g',2],['final','Final / g',2],['y','Change / %',2]],
      sources:[['Water potential — OpenStax','https://openstax.org/books/biology-2e/pages/30-5-transport-of-water-and-solutes-in-plants']]
    },
    enzyme: {
      name:'Enzyme initial rate', short:'Substrate & saturation', theme:'blue', specimen:'Catalase + hydrogen peroxide',
      question:'How does substrate concentration affect the initial rate of an enzyme reaction?',
      aim:'Measure oxygen production in the first 10 seconds, then compare rates across a substrate gradient.',
      primary:number('x','Hydrogen peroxide concentration',0,20,0.5,5,'mmol dm⁻³'),
      controls:[number('loading','Relative catalase loading',0.5,2,0.5,1,'×')],
      levels:[0,0.5,1,2,5,10,20],
      xLabel:'Hydrogen peroxide / mmol dm⁻³',yLabel:'Estimated initial O₂ rate / µmol min⁻¹',yUnit:'µmol min⁻¹',
      fixed:'25 °C · pH 7 · 10 cm³ reaction mixture · initial 0–10 s observation window',
      sampleLabel:'Fresh reaction mixture',source:'New aliquots of one virtual catalase preparation.',
      hint:'Use the change in oxygen amount divided by elapsed time. Convert 10 seconds to minutes. What becomes limiting at high substrate concentration?',
      explanation:'Catalase breaks down hydrogen peroxide, releasing oxygen. In this simplified initial-rate model, increasing substrate raises enzyme occupancy and the rate approaches a ceiling at fixed enzyme loading. More enzyme raises that ceiling. The 0–10 s slope estimates an initial rate because the simulation assumes negligible substrate depletion during this short interval.',
      limitation:'This is an illustrative Michaelis–Menten-type approximation for a catalase assay, not fitted catalase kinetics. It omits substrate inhibition, peroxide damage, gas-transfer delays and heat generation. The initial trace must not be extrapolated to reaction completion.',
      teacher:'本实验显示的是最初 10 秒的氧生成量与斜率，不是“完成反应所需时间”的倒数。相对酶量变化另建数据系列，不能混入同一浓度曲线。常数、理想微量氧测量和线性早期区间均为教学设定。',
      columns:[['oxygen0','O₂ at 0 s / µmol',3],['oxygen10','O₂ at 10 s / µmol',3],['y','Initial rate / µmol min⁻¹',3]],
      sources:[['Enzyme saturation — OpenStax','https://openstax.org/books/biology-2e/pages/6-5-enzymes'],['Catalase practical — Practical Biology','https://practicalbiology.org/bio-molecules/factors-affecting-enzyme-activity/investigating-an-enzyme-controlled-reaction-catalase-and-hydrogen-peroxide-concentration.html']]
    },
    beetroot: {
      name:'Beetroot membranes',short:'Temperature & leakage',theme:'plum',specimen:'Beetroot pigment assay',
      question:'How does temperature affect pigment leakage from beetroot tissue?',
      aim:'Compare the absorbance of surrounding water after equal exposure times, using fresh discs at each temperature.',
      primary:number('x','Water-bath temperature',10,80,5,40,'°C'),
      controls:[number('duration','Exposure time',5,30,5,15,'min'),select('rinsed','Rinse cut surfaces',[['yes','Rinsed'],['no','Not rinsed']],'yes')],
      levels:[10,20,30,40,50,60,70,80],
      xLabel:'Exposure temperature / °C',yLabel:'Absorbance at 535 nm',yUnit:'absorbance (dimensionless)',
      fixed:'One 10 × 2 mm disc per tube · 5 cm³ water · water blank · aliquots read at 20 °C',
      sampleLabel:'Fresh beetroot disc',source:'Separate discs from one virtual beetroot batch.',
      hint:'A darker solution absorbs more light. If cut surfaces are not rinsed, what else could contribute pigment to the water?',
      explanation:'Pigment escaping from vacuoles must pass the tonoplast and cell-surface membrane. Increasing temperature can disrupt membrane organisation and proteins, increasing leakage. Absorbance is a proxy for pigment in the surrounding liquid; it is not a direct measurement of a membrane permeability coefficient.',
      limitation:'The smooth temperature response and leakage time course are illustrative, not a universal denaturation threshold. Unrinsed discs have an added surface-pigment contribution. Geometry, pigment content and optical conditions are simplified.',
      teacher:'吸光度越高表示周围液体色素越多，不是透光率越高。未冲洗切口可产生初始污染，须与温度导致的渗漏区分。变更浸泡时间或冲洗状态会另建系列，不能把不同处理混成一条曲线。',
      columns:[['blank','Blank absorbance',3],['y','Sample absorbance',3]],
      sources:[['Beetroot method — Pearson Biology B','https://qualifications.pearson.com/content/dam/pdf/A%20Level/biology-b/2015/teaching-and-learning-materials/AS-and-A-level-Biology-B-Core-Practical-5---beetroot-membrane-(Student,-Teacher,-Technician-Worksheets).pdf']]
    },
    photosynthesis: {
      name:'Photosynthesis & light',short:'Light & net oxygen',theme:'green',specimen:'Aquatic shoot in an oxygen chamber',
      question:'How does light intensity affect net oxygen production?',
      aim:'Measure net dissolved-oxygen change, including darkness, and investigate a second limiting factor.',
      primary:number('x','Light intensity (PPFD)',0,1000,25,300,'µmol photons m⁻² s⁻¹'),
      controls:[select('carbon','Carbon dioxide supply',[['ample','Ample'],['limited','Limited']],'ample'),number('duration','Measurement interval',2,10,1,5,'min')],
      levels:[0,25,50,100,200,400,600,1000],
      xLabel:'PPFD / µmol photons m⁻² s⁻¹',yLabel:'Net O₂ rate / µmol min⁻¹',yUnit:'µmol min⁻¹',
      fixed:'25 °C · matched 10 cm shoots · 100 cm³ chamber · dissolved-oxygen sensor',
      sampleLabel:'Matched aquatic shoot',source:'A fresh matched shoot for each replicate; the sensor measures net change.',
      hint:'Plants respire in darkness too. Why can net oxygen change be negative, and why might extra light eventually have little effect?',
      explanation:'The sensor records photosynthetic oxygen production minus respiratory oxygen use. In darkness, oxygen can decrease. Net zero occurs when these fluxes balance. At greater light intensity, another factor limits the response; reduced carbon dioxide supply lowers the modelled ceiling. Negative values are net oxygen consumption, not negative gross photosynthesis.',
      limitation:'The saturating response, constant respiration and ideal chamber are teaching approximations. Carbon dioxide and temperature remain fixed during each reading; depletion, acclimation, photorespiration and photoinhibition are not simulated. This is not a bubble-count assay.',
      teacher:'这里测的是净溶解氧变化，暗处负值是呼吸耗氧；请勿称为负的总光合作用。光强为直接设定的 PPFD，不套用未经条件限定的灯距平方反比。CO₂ 选项只是两个假设供给情景，不是实测浓度。',
      columns:[['initial','O₂ initially / µmol',2],['final','O₂ finally / µmol',2],['y','Net rate / µmol min⁻¹',3]],
      sources:[['Photosynthesis limiting factors — Monash','https://www.monash.edu/student-academic-success/biology/photosynthesis/factors-affecting-photosynthesis'],['Oxygen and the compensation point — Furman','https://facweb.furman.edu/~lthompson/bgy34/sunshade']]
    },
    ecology: {
      name:'Quadrat fieldwork',short:'Sampling & populations',theme:'green',specimen:'A 10 × 10 m virtual meadow',
      question:'How well can a sample of quadrats estimate the whole plant population?',
      aim:'Compare random sampling with a biased edge sample or your own choices, then evaluate the estimate.',
      controls:[select('pattern','Plant distribution',[['clustered','Clustered'],['uniform','Uniform random']],'clustered'),select('strategy','Sampling strategy',[['random','Random coordinates'],['edge','Accessible edge only'],['manual','Choose quadrats yourself']],'random'),number('batch','Quadrats per batch',1,20,1,5,'')],
      xLabel:'Number of quadrats sampled',yLabel:'Estimated plants in 100 m²',yUnit:'plants',
      fixed:'100 non-overlapping 1 m² quadrats · count rooted individuals · no replacement',
      sampleLabel:'New quadrat',source:'Each square is sampled at most once within a series.',
      hint:'Estimate population = mean count per m² × 100 m². Does your sampling method give every part of the meadow a chance of selection?',
      explanation:'A random sample gives each 1 m² cell an equal chance of selection. The mean quadrat count estimates density; multiplying by the total area estimates abundance. More samples often improve precision but do not guarantee every successive estimate is closer. Edge-only or deliberate choices may be biased, especially when plants are clustered.',
      limitation:'Plants are countable points in a fixed grid with perfect detection and no movement. Root points on left/top edges count in a cell; right/bottom edges belong to the next cell. Estimates apply to this virtual meadow, not a real population. No confidence interval is inferred from the running trace.',
      teacher:'随机坐标采用不放回抽样。边缘策略只在外围 36 格抽样，刻意体现覆盖不足，不能用增加边缘重复来保证消除偏差。手动模式可用鼠标或键盘选格，已采样格不可重复加入。总体真值仅在主动复盘时揭示。',
      columns:[['cell','Quadrat',0],['count','Plants counted',0],['n','Quadrats so far',0],['y','Population estimate',1]],
      sources:[['Random coordinates — Field Studies Council','https://www.field-studies-council.org/resources/14-16-geography/ecosystems/fieldwork/']]
    }
  };
  function hash(text) { let h=2166136261; for(let i=0;i<text.length;i++){h^=text.charCodeAt(i);h=Math.imul(h,16777619);} return h>>>0; }
  function random(key) { let a=hash(String(key)); return function(){a=(a+0x6D2B79F5)|0;let t=Math.imul(a^(a>>>15),1|a);t^=t+Math.imul(t^(t>>>7),61|t);return ((t^(t>>>14))>>>0)/4294967296;}; }
  function normal(key) {const r=random(key);let z;do{z=Math.sqrt(-2*Math.log(Math.max(r(),1e-12)))*Math.cos(2*Math.PI*r());}while(Math.abs(z)>3);return z;}
  const round=(v,d=3)=>Number(v.toFixed(d));
  const quantize=(v,q)=>round(Math.floor(v/q+0.5+1e-10)*q,6);
  const mean=a=>a.reduce((s,x)=>s+x,0)/a.length;
  function sd(a){if(a.length<2)return null;const m=mean(a);return Math.sqrt(a.reduce((s,x)=>s+(x-m)**2,0)/(a.length-1));}
  function defaults(id){const d=defs[id], c={seed:20261005,repeats:3};if(d.primary)c.x=d.primary.value;d.controls.forEach(f=>c[f.key]=f.value);return c;}
  function validate(id,raw){
    const d=defs[id];if(!d)throw Error('Unknown experiment.');
    const c={};const fields=[number('seed','Seed',0,4294967295,1,20261005,''),number('repeats','Repeats per level',1,5,1,3,''),...(d.primary?[d.primary]:[]),...d.controls];
    for(const f of fields){const v=raw[f.key];if(f.type==='select'){if(!f.options.some(o=>o[0]===v))throw Error('Choose a valid '+f.label.toLowerCase()+'.');c[f.key]=v;}else{if(v===''||v===null||v===undefined)throw Error('Enter '+f.label.toLowerCase()+'.');const n=Number(v);if(!Number.isFinite(n)||n<f.min||n>f.max||Math.abs((n-f.min)/f.step-Math.round((n-f.min)/f.step))>1e-7)throw Error(f.label+': use '+f.min+' to '+f.max+' in steps of '+f.step+'.');c[f.key]=round(n,8);}}
    return c;
  }
  function protocolKey(id,c){const keys=defs[id].controls.map(f=>f.key).filter(k=>k!=='batch');return [id,c.seed,...keys.map(k=>k+'='+c[k])].join('|');}
  function protocolLabel(id,c){return defs[id].controls.filter(f=>f.key!=='batch').map(f=>f.label+': '+(f.type==='select'?f.options.find(o=>o[0]===c[f.key])[1]:c[f.key]+' '+f.unit)).join('; ')+'; seed '+c.seed;}
  function expected(id,x,c,individual={}){
    if(id==='osmosis')return 20*Math.tanh(((individual.c0??0.30)-x)/0.40)*(1-Math.exp(-c.duration/20));
    if(id==='enzyme')return 0.6*c.loading*x/(4+x);
    if(id==='beetroot')return (0.02+1.35/(1+Math.exp(-(x-55)/7)))*(1-Math.exp(-c.duration/12))+(c.rinsed==='no'?0.14*(1-Math.exp(-c.duration/2)):0);
    if(id==='photosynthesis')return (c.carbon==='ample'?1.2:0.6)*x/(180+x)-0.12;
    throw Error('No continuous model for this experiment.');
  }
  function sample(id,c,x,replicate){
    c=validate(id,{...c,x});if(!Number.isInteger(replicate)||replicate<1)throw Error('Invalid replicate identity.');
    const p=protocolKey(id,c), k=p+'|x='+x+'|r='+replicate;
    const row={id:id+'-'+hash(p).toString(16)+'-'+x+'-'+replicate,protocol:p,seed:c.seed,x,replicate,isSimulated:true};
    if(id==='osmosis'){
      const m0=2*(1+0.02*normal(k+'mass')),c0=0.30+0.008*normal(k+'c0');
      const m1=m0*(1+expected(id,x,c,{c0})/100),q=Number(c.resolution);
      row.initial=quantize(m0+0.003*normal(k+'e0'),q);row.final=quantize(m1+0.003*normal(k+'e1'),q);
      row.y=100*(row.final-row.initial)/row.initial;
    } else if(id==='enzyme'){
      const v=expected(id,x,c)*(1+0.04*normal(k+'activity'));
      row.trace=[0,2,4,6,8,10].map(t=>({t,oxygen:t===0||x===0?0:quantize(Math.max(0,v*t/60+0.0003*normal(k+'read'+t)),0.001)}));
      row.oxygen0=row.trace[0].oxygen;row.oxygen10=row.trace[5].oxygen;row.y=(row.oxygen10-row.oxygen0)*6;
    } else if(id==='beetroot'){
      const A=expected(id,x,c)*(1+0.035*normal(k+'pigment'))+0.003*normal(k+'sensor');
      row.blank=0;row.y=quantize(Math.max(0,A),0.001);
    } else if(id==='photosynthesis'){
      const gross=(c.carbon==='ample'?1.2:0.6)*x/(180+x)*(1+0.04*normal(k+'shoot'));
      const respiration=0.12*(1+0.03*normal(k+'resp'));
      row.initial=quantize(25+0.005*normal(k+'e0'),0.01);
      row.final=quantize(25+(gross-respiration)*c.duration+0.005*normal(k+'e1'),0.01);
      row.y=(row.final-row.initial)/c.duration;
    }else throw Error('Use the quadrat sampler for fieldwork.');
    return row;
  }
  function groups(rows){const by=new Map();for(const r of rows){if(!by.has(r.x))by.set(r.x,[]);by.get(r.x).push(r.y);}return [...by].sort((a,b)=>a[0]-b[0]).map(([x,v])=>({x,n:v.length,mean:mean(v),sd:sd(v)}));}
  function roots(gs){
    const zeros=gs.filter(g=>Math.abs(g.mean)<1e-12).map(g=>g.x),crossings=[];
    for(let i=1;i<gs.length;i++){const a=gs[i-1],b=gs[i];if(a.mean*b.mean<0)crossings.push({left:a.x,right:b.x,value:a.x-a.mean*(b.x-a.x)/(b.mean-a.mean)});}
    const n=zeros.length+crossings.length;
    return {status:gs.length<2?'insufficient':n===0?'unbracketed':n>1?'multiple':zeros.length?'observed-zero':'interpolated',zeros,crossings,value:n===1?(zeros[0]??crossings[0].value):null};
  }
  function field(c){
    const r=random('field|'+c.seed),total=160+Math.floor(r()*141),points=[],counts=Array(100).fill(0);
    const p=random('positions|'+c.seed+'|'+c.pattern);
    for(let i=0;i<total;i++){
      let x,y;
      if(c.pattern==='clustered'&&p()<0.75){
        const u=Math.max(p(),1e-12),v=p(),rad=Math.sqrt(-2*Math.log(u));
        x=Math.max(0.001,Math.min(9.999,7+1.1*rad*Math.cos(2*Math.PI*v)));
        y=Math.max(0.001,Math.min(9.999,6+1.1*rad*Math.sin(2*Math.PI*v)));
      }else{x=p()*10;y=p()*10;}
      points.push({x,y});counts[Math.floor(y)*10+Math.floor(x)]++;
    }
    return {total,points,counts};
  }
  function sampleOrder(c){const a=Array.from({length:100},(_,i)=>i).filter(i=>c.strategy!=='edge'||i%10===0||i%10===9||i<10||i>=90);const r=random('order|'+protocolKey('ecology',c));for(let i=a.length-1;i>0;i--){const j=Math.floor(r()*(i+1));[a[i],a[j]]=[a[j],a[i]];}return a;}
  function quadrat(c,previous,cellIndex){
    if(!Number.isInteger(cellIndex)||cellIndex<0||cellIndex>99)throw Error('Choose a quadrat in the meadow.');
    if(previous.some(r=>r.cellIndex===cellIndex))throw Error('That quadrat has already been sampled.');
    if(c.strategy==='edge'&&!(cellIndex%10===0||cellIndex%10===9||cellIndex<10||cellIndex>=90))throw Error('This strategy samples edge quadrats only.');
    const f=field(c),count=f.counts[cellIndex],n=previous.length+1,sum=previous.reduce((s,r)=>s+r.count,0)+count;
    return {id:'Q-'+(cellIndex%10)+'-'+Math.floor(cellIndex/10),cell:'('+cellIndex%10+', '+Math.floor(cellIndex/10)+')',cellIndex,protocol:protocolKey('ecology',c),seed:c.seed,isSimulated:true,count,n,x:n,y:sum/n*100,replicate:n};
  }
  function csvCell(v){if(v===null||v===undefined)return '';const value=typeof v==='number'?String(Number(v.toPrecision(12))):String(v);const safe=typeof v==='string'&&/^[\s]*[=+@\-\t\r]/.test(value)?"'"+value:value;return '"'+safe.replace(/"/g,'""')+'"';}
  function exportCsv(id,series){
    const headers=['simulated_data','app_version','model_version','rng_version','analysis_version','experiment','series','seed','sample_id','replicate','x','x_unit','measured_y','y_unit','fixed_conditions','source_group',...defs[id].controls.filter(f=>f.key!=='batch').map(f=>f.key+(f.unit==='min'?'_min':'')),'initial','final','initial_final_unit','oxygen_0_s_umol','oxygen_2_s_umol','oxygen_4_s_umol','oxygen_6_s_umol','oxygen_8_s_umol','oxygen_10_s_umol','blank_absorbance','quadrat_x_m','quadrat_y_m','count','quadrats_so_far','group_n','group_mean','sample_sd'];
    const all=[headers.map(csvCell).join(',')];
    series.forEach((s,i)=>{
      const gs=id==='ecology'?[]:groups(s.rows),gmap=new Map(gs.map(g=>[g.x,g]));
      s.rows.forEach(r=>{const g=gmap.get(r.x),trace=r.trace||[];const vals=[true,VERSION,MODEL,RNG,ANALYSIS,id,i+1,s.config.seed,r.id,r.replicate,r.x,defs[id].primary?.unit||'quadrats',r.y,defs[id].yUnit,defs[id].fixed,defs[id].source,...defs[id].controls.filter(f=>f.key!=='batch').map(f=>s.config[f.key]),r.initial,r.final,id==='osmosis'?'g':id==='photosynthesis'?'µmol':'',...[0,1,2,3,4,5].map(j=>trace[j]?.oxygen),r.blank,r.cellIndex===undefined?null:r.cellIndex%10,r.cellIndex===undefined?null:Math.floor(r.cellIndex/10),r.count,r.n,g?.n,g?.mean,g?.sd];all.push(vals.map(csvCell).join(','));});
    });return '\uFEFF'+all.join('\r\n')+'\r\n';
  }
  const api={VERSION,MODEL,RNG,ANALYSIS,defs,defaults,validate,protocolKey,protocolLabel,hash,random,normal,round,quantize,mean,sd,expected,sample,groups,roots,field,sampleOrder,quadrat,exportCsv};
  if(typeof module!=='undefined'&&module.exports)module.exports=api;
  root.LabCore=api;
})(typeof globalThis!=='undefined'?globalThis:this);
