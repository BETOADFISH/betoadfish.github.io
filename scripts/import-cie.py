from pathlib import Path
import json,re,collections
ROOT=Path(__file__).resolve().parents[1];CACHE=ROOT/'work/cie-layout'
if (ROOT/'public/question-bank/cie.json').exists() and json.loads((ROOT/'public/question-bank/cie.json').read_text('utf8')).get('version',1)>=3:raise SystemExit('Use private base catalogs and prepare-practice-assets.py for question-only releases.')
SESSION={'m':'February/March','s':'May/June','w':'October/November'}
TOPICS={
'Cell structure':r'microscop|micrograph|organelle|prokaryot|eukaryot|ribosome|lysosome|cell structure|magnification',
'Biological molecules':r'amino acid|peptide|protein structure|glycosidic|carbohydrate|polysaccharide|triglyceride|disaccharide|monosaccharide|reducing sugar|biuret|benedict',
'Enzymes':r'enzym|catalys|active site|competitive inhibit',
'Cell membranes and transport':r'osmosis|osmotic|water potential|diffusion|cell membrane|phospholipid|active transport|endocytosis|exocytosis',
'Mitotic cell cycle':r'mitosis|mitotic|cell cycle|stem cell|telophase|anaphase|metaphase|prophase',
'Nucleic acids and protein synthesis':r'nucleotide|transcription|translation|messenger rna|mrna|trna|dna replication|codon|anticodon|polynucleotide',
'Transport in plants':r'xylem|phloem|transpiration|translocation|root hair|potometer|sieve tube|cohesion.tension|casparian',
'Transport in mammals':r'haemoglobin|hemoglobin|arter|capillar|cardiac|blood pressure|ventricle|atrium|atrial|erythrocyte|blood vessel|tissue fluid',
'Gas exchange':r'alveol|gas exchange|trachea|bronchio|lung|emphysema|goblet cell|ciliated|ventilation',
'Infectious diseases':r'malaria|cholera|tuberculosis|\bhiv\b|antibiotic|pathogen|infectious|plasmodium',
'Immunity':r'antibod|antigen|lymphocyte|vaccin|phagocyt|immune|immunity|monoclonal',
'Energy and respiration':r'respiration|glycolysis|krebs|respiratory|oxidative phosphorylation|chemiosmosis|lactate|ethanol|respirometer',
'Photosynthesis':r'photosynthe|calvin|chlorophyll|photophosphorylation|rubisco|light.dependent|light.independent|thylakoid',
'Homeostasis':r'homeostas|nephron|glomerul|kidney|insulin|glucagon|blood glucose|osmoregulat|antidiuretic|\bADH\b|loop of henle|ultrafiltrat',
'Coordination':r'neurone|neuron|synapse|action potential|depolaris|acetylcholin|receptor|auxin|gibberellin|tropism|reflex|myelin',
'Inheritance':r'allele|inherit|genotype|phenotype|monohybrid|dihybrid|meiosis|genetic cross|epistasis|codominan|sex.link|test cross|chi.squared',
'Selection and evolution':r'evolution|natural selection|selective advantage|speciation|hardy.weinberg|genetic drift|selective breeding|directional selection|stabilising selection',
'Classification biodiversity and conservation':r'biodiversity|conservation|classification|ecosystem|habitat|species richness|simpson|taxonom|dichotomous|extinction|sampling|quadrat|transect',
'Genetic technology':r'genetic engineer|genetic technolog|polymerase chain|\bPCR\b|restriction enzyme|gel electrophoresis|plasmid|recombinant|gene therapy|microarray|crispr|transgenic',
'Planning analysis and evaluation':r'standard deviation|standard error|confidence interval|t.test|correlation|statistical test|control variable|independent variable|dependent variable|reliability|validity|random sampl|null hypothesis',
}
def rect(page,top,bottom,left=30,right=None):
 return {'page':page[0]+1,'box':[round(left/page[1]['width'],6),round(max(0,top)/page[1]['height'],6),round((right or page[1]['width']-25)/page[1]['width'],6),round(min(page[1]['height'],bottom)/page[1]['height'],6)]}
def bottom_limit(p):
 foot=[l['box'][1] for l in p['lines'] if l['box'][1]>p['height']*.90 and re.search(r'©|9700/|\[Turn over|Cambridge University Press',l['text'])]
 return min(foot) if foot else p['height']-25
def regions(data,start,end):
 out=[]
 for n in range(start[0],end[0]+1):
  if n==end[0] and n!=start[0] and end[1]<110:continue
  p=data['pages'][n];top=start[1]-4 if n==start[0] else 53;bottom=end[1]-5 if n==end[0] else bottom_limit(p)
  if bottom<=top or re.search(r'^\s*BLANK PAGE\s*$',p['text'],re.M):continue
  out.append(rect((n,p),top,bottom))
 return out
def text_regions(data,regs):
 return '\n'.join(l['text'] for r in regs for l in data['pages'][r['page']-1]['lines'] if l['box'][1]>=r['box'][1]*data['pages'][r['page']-1]['height']-1 and l['box'][3]<=r['box'][3]*data['pages'][r['page']-1]['height']+1)
def qp_starts(data):
 candidates=[];totals=[]
 for pn,p in enumerate(data['pages'][1:],1):
  for l in sorted(p['lines'],key=lambda l:(round(l['box'][1],1),l['box'][0])):
   x,y,_,_=l['box'];m=re.match(r'^(\d{1,2})(?:\s|$)',l['text'])
   if re.search(r'\[\s*Total\s*:',l['text'],re.I):totals.append((pn,y))
   if m and 32<x<62 and 52<y<p['height']-35:candidates.append((pn,y,int(m[1])))
 found=[];after=(-1,0)
 for num in range(1,41):
  choices=[c for c in candidates if c[2]==num and c[:2]>after]
  if not choices:break
  start=min(choices);found.append(start);after=start[:2]
  if not data['component'].startswith('1'):
   next_totals=[t for t in totals if t>after]
   if next_totals:
    first_total=min(next_totals)
    early_next=[c for c in candidates if c[2]==num+1 and after<c[:2]<first_total and c[1]<200]
    if not early_next:after=first_total
 return found
def ms_starts(data):
 found=[]
 for pn,p in enumerate(data['pages'][1:],1):
  for l in sorted(p['lines'],key=lambda l:(l['box'][1],l['box'][0])):
   m=re.match(r'^(\d{1,2})\s*\([a-z]\)',l['text']);x,y,_,_=l['box']
   if m and x<120 and 45<y<p['height']-40:
    num=int(m[1])
    if not any(s[2]==num for s in found):found.append((pn,y,num))
 # Some complete questions have no (a), so the mark-scheme cell is a bare number.
 for pn,p in enumerate(data['pages'][1:],1):
  if not any(l['text']=='Question' for l in p['lines']) or not any(l['text']=='Answer' for l in p['lines']):continue
  for l in p['lines']:
   if re.fullmatch(r'\d{1,2}',l['text']) and 45<l['box'][0]<108 and 65<l['box'][1]<p['height']-40:
    num=int(l['text'])
    if not any(s[2]==num for s in found):found.append((pn,l['box'][1],num))
 return sorted(found)
def mc_answers(data):
 out={}
 for pn,p in enumerate(data['pages'][1:],1):
  for l in p['lines']:
   if not re.fullmatch(r'\d{1,2}',l['text']):continue
   num=int(l['text']);x,y,right,bottom=l['box']
   if not 1<=num<=40 or not 65<y<p['height']-45:continue
   ans=[a for a in p['lines'] if re.fullmatch('[ABCD]',a['text']) and abs(a['box'][1]-y)<3 and right<a['box'][0]<right+150]
   if ans:
    a=min(ans,key=lambda a:a['box'][0]);out[num]=[rect((pn,p),y-3,max(bottom,a['box'][3])+4,x-7,a['box'][2]+7)]
 return out
def build():
 sources=[json.loads(p.read_text(encoding='utf-8')) for p in sorted(CACHE.glob('*.json'))];pairs={};archive=[];questions=[];papers=[];issues=[]
 for d in sources:pairs.setdefault(d['id'],{})[d['role']]=d
 for pid,pair in sorted(pairs.items(),reverse=True):
  d=next(iter(pair.values()));component=d['component'];unit=int(component[0]);title=f"{SESSION[d['session']]} {d['year']} · Paper {component}"
  entry={'id':pid,'title':title,'code':'9700/'+component,'year':d['year'],'session':SESSION[d['session']],'unit':unit,'component':component,**{role:doc['url'] for role,doc in pair.items()}}
  if 'qp' in pair and re.search(r'Content removed due to copyright',pair['qp']['pages'][0]['text']+' '.join(p['text'] for p in pair['qp']['pages']),re.I):entry['missing_figures']=True
  archive.append(entry)
  if 'qp' not in pair or 'ms' not in pair:issues.append({'id':pid,'reason':'unpaired','roles':list(pair)});continue
  qp,ms=pair['qp'],pair['ms'];starts=qp_starts(qp);answers=mc_answers(ms) if unit==1 else {};msstarts=ms_starts(ms) if unit!=1 else []
  if unit==1 and (len(starts)!=40 or len(answers)!=40):issues.append({'id':pid,'reason':'mc boundaries','qp':len(starts),'ms':len(answers)})
  if unit!=1:
   max_q=max((s[2] for s in msstarts),default=0)
   starts=[s for s in starts if s[2]<=max_q]
  if unit!=1 and set(s[2] for s in starts)!=set(s[2] for s in msstarts):issues.append({'id':pid,'reason':'structured boundaries','qp':[s[2] for s in starts],'ms':[s[2] for s in msstarts]})
  for i,start in enumerate(starts):
   num=start[2];end=starts[i+1] if i+1<len(starts) else (len(qp['pages'])-1,bottom_limit(qp['pages'][-1])+5,0)
   regs=regions(qp,start,end);text=text_regions(qp,regs)
   if re.search(r'Content removed due to copyright',text,re.I):issues.append({'id':pid,'q':num,'reason':'missing source figure'});continue
   if unit==1:
    marks=1;msregs=answers.get(num)
   else:
    totals=re.findall(r'\[\s*Total\s*:\s*(\d+)\s*\]',text,re.I)
    partmarks=sum(map(int,re.findall(r'\[\s*(\d{1,2})\s*\]',text)))
    marks=int(totals[-1]) if totals else partmarks
    matching=[(j,s) for j,s in enumerate(msstarts) if s[2]==num]
    if not matching:continue
    j,s=matching[0];e=msstarts[j+1] if j+1<len(msstarts) else (len(ms['pages'])-1,bottom_limit(ms['pages'][-1])+5,0)
    msregs=regions(ms,s,e)
    if marks<=0 or marks>40 or len(totals)>1:issues.append({'id':pid,'q':num,'reason':'marks mismatch','total':totals,'parts':partmarks});continue
   if not regs or not msregs:continue
   topics=[label for label,pattern in TOPICS.items() if re.search(pattern,text,re.I)]
   if not topics:topics=['General biology']
   if unit==3:topics=list(dict.fromkeys(['Practical skills']+topics))
   if unit==5:topics=list(dict.fromkeys(['Planning analysis and evaluation']+topics))
   summary=' · '.join(topics[:2]);qid=pid+'-q'+str(num)
   search_text=' '.join(re.sub(r'\.{3,}',' ',line).strip() for line in text.splitlines() if 'DO NOT WRITE IN' not in line and re.search(r'[A-Za-z]{2}',line))
   questions.append({'id':qid,'bank':'cie','paper_id':pid,'label':f'Q{num}','parent_id':None,'major_id':qid,'kind':'leaf' if unit==1 else 'major','marks':marks,'summary':summary,'text':search_text,'topics':topics,'chapters':topics,'skills':['Multiple choice' if unit==1 else 'Practical' if unit==3 else 'Structured questions'],'year':d['year'],'session':entry['session'],'unit':unit,'code':entry['code'],'paper_title':title,'is_leaf':True,'leaves':[qid],'qp':regs,'ms':msregs,'dependencies':[],'revision':1})
  papers.append(entry)
 (ROOT/'public/question-bank/cie.json').write_text(json.dumps({'bank':'cie','version':1,'papers':papers,'questions':questions},ensure_ascii=False),encoding='utf-8')
 (ROOT/'public/question-bank/cie-papers.json').write_text(json.dumps({'papers':archive,'fileCount':len(sources)},ensure_ascii=False),encoding='utf-8')
 (ROOT/'qa/cie-import-audit.json').write_text(json.dumps({'files':len(sources),'papers':len(archive),'questions':len(questions),'issues':issues},ensure_ascii=False,indent=2),encoding='utf-8')
 print('FILES',len(sources),'PAPERS',len(archive),'QUESTIONS',len(questions),'ISSUES',collections.Counter(x['reason'] for x in issues));print('MATCHED',len(papers))
if __name__=='__main__':build()
