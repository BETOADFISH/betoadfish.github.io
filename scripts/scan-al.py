"""Read local AL QP/MS PDFs without modifying the teaching archive."""
from pathlib import Path
import sys,re,json,hashlib,concurrent.futures
ROOT=Path(__file__).resolve().parents[1]
sys.path.insert(0,str(ROOT/'work/pytools'))
import pymupdf as fitz
CACHE=ROOT/'work/al-layout';CACHE.mkdir(parents=True,exist_ok=True)
SOURCES=ROOT/'work/al-sources';SOURCES.mkdir(exist_ok=True)

def process(args):
 bank,unit,role,path=args;p=Path(path);name=p.name
 year_match=re.search(r'20\d\d',name)
 year=int(year_match[0]) if year_match else 2014
 session=next((s for s in ['January','June','October','November','Specimen'] if s.lower() in name.lower()),'June')
 pid=f'{bank}-al-{unit}-{year}-{session.lower()}'
 dest=CACHE/f'{pid}-{role}.json';sha=hashlib.sha256(p.read_bytes()).hexdigest()
 if dest.exists():
  data=json.loads(dest.read_text(encoding='utf8'))
  if data['original_sha256']==sha:return {'id':pid,'role':role,'issues':data['issues']}
 d=fitz.open(p);cover=' '.join(d[i].get_text() for i in range(min(2,len(d))))
 code=f'WBI1{unit}' if bank=='edexcel' else f'7402/{unit}'
 issues=[]
 if code not in re.sub(r'\s*/\s*','/',cover):issues.append('cover code')
 if str(year) not in cover and session!='Specimen':issues.append('cover year')
 if role=='ms' and not re.search('Mark Scheme',cover,re.I):issues.append('cover role')
 for pg in d:
  if pg.rotation:pg.remove_rotation()
 raw=d.tobytes(garbage=4,deflate=True);digest=hashlib.sha256(raw).hexdigest();source=SOURCES/f'{digest}.pdf'
 if not source.exists():source.write_bytes(raw)
 pages=[]
 for pg in d:
  lines=[]
  for b in pg.get_text('dict')['blocks']:
   for line in b.get('lines',[]):
    text=''.join(s['text'] for s in line['spans']).strip()
    if text:lines.append({'text':text,'box':[round(v,3) for v in line['bbox']]})
  pages.append({'width':pg.rect.width,'height':pg.rect.height,'text':pg.get_text(),'lines':lines})
 data={'id':pid,'bank':bank,'unit':unit,'role':role,'year':year,'session':session,'code':code+('/01' if bank=='edexcel' else ''),'source':str(p),'private_pdf':str(source.relative_to(ROOT)),'original_sha256':sha,'sha256':digest,'issues':issues,'pages':pages}
 dest.write_text(json.dumps(data,ensure_ascii=False),encoding='utf8')
 return {'id':pid,'role':role,'issues':issues}

if __name__=='__main__':
 jobs=[]
 for bank,units,folder in [('edexcel',[4,5,6],'BIO AL/Edexcel/Materials/Pastpapers'),('aqa',[1,2,3],'BIO AL/AQA/Materials/Pastpapers/7402')]:
  for unit in units:
   for role,sub in [('qp','Question Papers'),('ms','Mark Schemes')]:
    for path in sorted((ROOT.parent/folder/(f'Unit {unit}' if bank=='edexcel' else f'Paper {unit}')/sub).glob('*.pdf')):jobs.append((bank,unit,role,str(path)))
 with concurrent.futures.ProcessPoolExecutor(max_workers=4) as pool:results=list(pool.map(process,jobs))
 (ROOT/'qa/expansion/source-audit.json').write_text(json.dumps(results,indent=2),encoding='utf8')
 print('FILES',len(results),'ISSUES',[r for r in results if r['issues']])
