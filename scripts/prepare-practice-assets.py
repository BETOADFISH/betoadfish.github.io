"""Publish question-only PDFs, with content outside approved regions removed.

Original page coordinates are retained for the private crop editor. This is not
access control: users can save practice questions, but no complete source papers
are shipped with the site. Build from the private catalog snapshot, not fragments.
"""
from pathlib import Path
import sys,json,hashlib,shutil,concurrent.futures
ROOT=Path(__file__).resolve().parents[1]
sys.path.insert(0,str(ROOT/'work/pytools'))
import pymupdf as fitz
PRIVATE=ROOT/'work/private-sources';PRIVATE.mkdir(exist_ok=True)
BASE=ROOT/'work/base-catalogs';BASE.mkdir(exist_ok=True)
ASSETS=ROOT/'public/question-bank/items';ASSETS.mkdir(exist_ok=True)

def process(job):
 digest,regions=job
 original=PRIVATE/(digest+'.pdf')
 if not original.exists():original=ROOT/'work/al-sources'/(digest+'.pdf')
 key=hashlib.sha256((digest+json.dumps(regions,sort_keys=True)+'redacted-v1').encode()).hexdigest()
 dest=ASSETS/(key+'.pdf');page_numbers=sorted(set(r['page'] for r in regions))
 if not dest.exists():
  src=fitz.open(original);out=fitz.open()
  for pn in page_numbers:
   out.insert_pdf(src,from_page=pn-1,to_page=pn-1)
   pg=out[-1];w,h=pg.rect.width,pg.rect.height
   boxes=[(r.get('box') or [0,0,1,1]) for r in regions if r['page']==pn]
   xs=sorted(set([0,1]+[b[k] for b in boxes for k in (0,2)]));ys=sorted(set([0,1]+[b[k] for b in boxes for k in (1,3)]))
   for x0,x1 in zip(xs,xs[1:]):
    for y0,y1 in zip(ys,ys[1:]):
     x,y=(x0+x1)/2,(y0+y1)/2
     if not any(b[0]<=x<=b[2] and b[1]<=y<=b[3] for b in boxes):pg.add_redact_annot(fitz.Rect(x0*w,y0*h,x1*w,y1*h),fill=(1,1,1))
   pg.apply_redactions(images=2,graphics=1,text=0)
  out.set_metadata({});out.subset_fonts();out.save(dest,garbage=4,deflate=True,clean=True)
 return key,{str(p):i+1 for i,p in enumerate(page_numbers)},dest.stat().st_size

if __name__=='__main__':
 for p in (ROOT/'public/question-bank/sources').glob('*.pdf'):
  if not (PRIVATE/p.name).exists():shutil.copy2(p,PRIVATE/p.name)
 cats=[];jobs=[];targets=[]
 for bank in ['edexcel','aqa','esat','cie']:
  snapshot=BASE/(bank+'.json')
  if not snapshot.exists():shutil.copy2(ROOT/'public/question-bank'/(bank+'.json'),snapshot)
  cat=json.loads(snapshot.read_text('utf8'))
  if bank in ['edexcel','aqa']:
   al=json.loads((ROOT/'work/al-catalogs'/(bank+'.json')).read_text('utf8'))
   cat['questions']+=al['questions'];cat['papers']+=al['papers']
  if bank=='cie':cat['questions']=[q for q in cat['questions'] if q['unit']!=3]
  used={q['paper_id'] for q in cat['questions']};cat['papers']=[p for p in cat['papers'] if p['id'] in used]
  papers={p['id']:p for p in cat['papers']}
  grouped={}
  for q in cat['questions']:
   group=grouped.setdefault(q['major_id'],{'qp':[],'ms':[],'questions':[],'paper':papers[q['paper_id']]})
   group['questions'].append(q)
   for role in ['qp','ms']:
    group[role]+=q[role]
   for dep in q.get('dependencies',[]):
    if dep.get('kind')!='requires_answer':group['qp']+=dep.get('qp',[])
  for group in grouped.values():
   assets={}
   for role in ['qp','ms']:
    rs=list({json.dumps(r,sort_keys=True):r for r in group[role]}.values())
    if not rs:raise ValueError((group['questions'][0]['id'],role,'empty'))
    jobs.append((Path(group['paper'][role]).stem,rs));targets.append((assets,role))
   for q in group['questions']:q['assets']=assets
  for p in cat['papers']:
   if p.get('general_ms'):
    jobs.append((Path(p['ms']).stem,p['general_ms']));targets.append((p,'guidance_asset'))
  cats.append(cat)
 unique={json.dumps(job,sort_keys=True):job for job in jobs}
 results={}
 with concurrent.futures.ProcessPoolExecutor(max_workers=4) as pool:
  for i,(identity,result) in enumerate(zip(unique,pool.map(process,unique.values(),chunksize=5))):
   results[identity]=result
   if i%500==0:print('Assets',i,'/',len(unique),flush=True)
 for job,(obj,role) in zip(jobs,targets):
  key,pages,size=results[json.dumps(job,sort_keys=True)]
  obj[role]={'url':'/question-bank/items/'+key+'.pdf','pages':pages}
 for cat in cats:
  for p in cat['papers']:p['qp']='';p['ms']=''
  (ROOT/'public/question-bank'/(cat['bank']+'.json')).write_text(json.dumps(cat,ensure_ascii=False,separators=(',',':')),encoding='utf8')
 print('PDF bytes',sum(p.stat().st_size for p in ASSETS.glob('*.pdf')),flush=True)
