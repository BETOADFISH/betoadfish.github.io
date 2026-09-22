"""Inventory every local CIE past-paper PDF by content, preserve sources, cache layouts."""
from pathlib import Path
import sys,re,json,hashlib,concurrent.futures
ROOT=Path(__file__).resolve().parents[1]
sys.path.insert(0,str(ROOT/'work/pytools'))
import pymupdf as fitz
SOURCE=ROOT.parent/'BIO AL/CIE/Materials/Past Papers'
CACHE=ROOT/'work/cie-layout';CACHE.mkdir(parents=True,exist_ok=True)
OUT=ROOT/'public/question-bank/sources';OUT.mkdir(parents=True,exist_ok=True)
def key(p):
 m=re.fullmatch(r'9700_([msw])(\d\d)_(qp|ms)_(\d\d)\.pdf',p.name)
 if m:return int('20'+m[2]),m[1],m[4],m[3]
 m=re.fullmatch(r'9700-biology-(march|june|november)-(\d{4})-(question-paper|mark-scheme)-(\d\d)\.pdf',p.name)
 if m:return int(m[2]),{'march':'m','june':'s','november':'w'}[m[1]],m[4],{'question-paper':'qp','mark-scheme':'ms'}[m[3]]
 raise ValueError(str(p))
def process(path):
 p=Path(path);year,session,component,role=key(p);pid=f'cie-{year}-{session}-{component}';dest=CACHE/f'{pid}-{role}.json'
 sha=hashlib.sha256(p.read_bytes()).hexdigest()
 if dest.exists():
  saved=json.loads(dest.read_text());
  if saved['original_sha256']==sha and (ROOT/'public'/saved['url'].lstrip('/')).exists():return {'id':pid,'role':role,'bytes':saved['bytes'],'issues':saved['issues']}
 d=fitz.open(p);cover=d[0].get_text();issues=[]
 if not re.search(r'9700\s*/\s*'+component,cover):issues.append('cover component mismatch')
 if str(year) not in cover:issues.append('cover year mismatch')
 session_names={'m':r'February|March','s':r'May|June','w':r'October|November'}
 if not re.search(session_names[session],cover,re.I):issues.append('cover session mismatch')
 if role=='ms' and 'MARK SCHEME' not in cover.upper():issues.append('cover role mismatch')
 if role=='qp' and 'MARK SCHEME' in cover.upper():issues.append('cover role mismatch')
 seen=set();image_changes=0
 for pg in d:
  for im in pg.get_images(full=True):
   x=im[0]
   if x in seen or im[1] or im[4]<8:continue
   seen.add(x);old=d.xref_stream_raw(x)
   if len(old)<80000:continue
   pix=fitz.Pixmap(fitz.csRGB,fitz.Pixmap(d,x));new=pix.tobytes('jpeg',jpg_quality=95)
   if len(new)<len(old)*.8:pg.replace_image(x,stream=new);image_changes+=1
  if pg.rotation:pg.remove_rotation()
 d.subset_fonts();raw=d.tobytes(garbage=4,deflate=True)
 digest=hashlib.sha256(raw).hexdigest();target=OUT/f'{digest}.pdf'
 if not target.exists():target.write_bytes(raw)
 pages=[]
 for pg in d:
  lines=[]
  for b in pg.get_text('dict')['blocks']:
   for line in b.get('lines',[]):
    spans=line['spans'];s=''.join(x['text'] for x in spans).strip()
    if s:lines.append({'text':s,'box':[round(v,2) for v in line['bbox']],'bold':bool(spans and spans[0]['flags']&16)})
  pages.append({'width':pg.rect.width,'height':pg.rect.height,'lines':lines,'text':pg.get_text()})
 result={'id':pid,'year':year,'session':session,'component':component,'role':role,'source':str(p.relative_to(ROOT.parent)),'original_sha256':sha,'url':'/question-bank/sources/'+target.name,'bytes':len(raw),'original_bytes':p.stat().st_size,'image_changes':image_changes,'issues':issues,'pages':pages}
 dest.write_text(json.dumps(result,ensure_ascii=False),encoding='utf-8');d.close()
 return {'id':pid,'role':role,'bytes':len(raw),'issues':issues}
if __name__=='__main__':
 files=sorted(SOURCE.rglob('*.pdf'));results=[]
 with concurrent.futures.ProcessPoolExecutor(max_workers=4) as pool:
  for i,row in enumerate(pool.map(process,map(str,files))):
   results.append(row)
   if (i+1)%25==0:print(f'{i+1}/{len(files)} processed',flush=True)
 (ROOT/'qa/cie-file-audit.json').write_text(json.dumps(results,indent=2),encoding='utf-8')
 print('TOTAL',len(results),'BYTES',sum(x['bytes'] for x in results),'ISSUES',[x for x in results if x['issues']],flush=True)
