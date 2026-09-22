"""Read-only import of approved source content. Never copy teacher tables."""
from pathlib import Path
import sys,json,sqlite3,hashlib,shutil,importlib,io
from pypdf import PdfReader,PdfWriter
import pypdfium2 as pdfium
ROOT=Path(__file__).resolve().parents[1];BASE=ROOT.parent
BANKS={'edexcel':'Biology Question Desk','aqa':'AQA AS Biology Question Desk','esat':'ESAT Biology Question Desk'}
OUT=ROOT/'public/question-bank';OUT.mkdir(exist_ok=True)
if (OUT/'edexcel.json').exists() and json.loads((OUT/'edexcel.json').read_text('utf8')).get('version',1)>=3:
 raise SystemExit('Legacy importer disabled for question-only releases. Use the private base catalogs and scripts/prepare-practice-assets.py.')
reports={};retained=set()
cie_archive=OUT/'cie-papers.json'
if cie_archive.exists():
 for paper in json.loads(cie_archive.read_text(encoding='utf-8'))['papers']:
  for role in ['qp','ms']:
   if paper.get(role):retained.add(Path(paper[role]).name)
for bank,folder in BANKS.items():
 root=BASE/folder
 sys.path.insert(0,str(root/'app'))
 db=importlib.import_module('database')
 qs=db.all_questions()
 with sqlite3.connect(f'file:{(root/"data/desk.sqlite3").as_posix()}?mode=ro',uri=True) as con:
  con.row_factory=sqlite3.Row
  papers={r['id']:json.loads(r['data']) for r in con.execute('SELECT * FROM papers')}
  sources={(r['paper_id'],r['role']):dict(r) for r in con.execute('SELECT * FROM sources')}
 children={}
 for q in qs.values():
  if q.get('parent_id'):children.setdefault(q['parent_id'],[]).append(q['id'])
 def leaves(qid):
  return sum((leaves(c) for c in children.get(qid,[])),[]) if qid in children else [qid]
 eligible={qid for qid,q in qs.items() if not q.get('archived') and not q.get('source_missing') and db.structurally_verified(q) and q.get('qp') and q.get('ms') and isinstance(q.get('marks'),int)}
 while True:
  bad={qid for qid in eligible if any(x not in eligible for x in leaves(qid)) or any(d.get('kind')=='requires_answer' and d.get('question_id') not in eligible for d in qs[qid].get('dependencies',[]))}
  if not bad:break
  eligible-=bad
 public=[];used=set()
 for qid,q in qs.items():
  if qid not in eligible:continue
  p=papers[q['paper_id']];used.add(p['id'])
  fields=['id','paper_id','label','parent_id','major_id','kind','marks','summary','text','topics','skills','practical_skills','experiment_topics','question_type','chapters','qp','ms','historical_extension']
  clean={k:q[k] for k in fields if k in q}
  clean['leaves']=leaves(qid);clean['is_leaf']=qid not in children
  clean['dependencies']=[{k:d[k] for k in ['id','kind','question_id','qp'] if k in d} for d in q.get('dependencies',[])]
  clean.update(bank=bank,year=p.get('year'),session=p.get('session',''),unit=db.paper_unit(p),paper_title=p['title'],code=p['code'],revision=1)
  public.append(clean)
 pubpapers=[]
 for pid in sorted(used):
  p=papers[pid];entry={k:p[k] for k in ['id','title','code','year','session','general_ms'] if k in p}
  for role in ['qp','ms']:
   src=sources[pid,role];path=root/src['path'];digest=hashlib.sha256(path.read_bytes()).hexdigest();assert digest==src['sha256'],path
   raw=path.read_bytes();reader=PdfReader(io.BytesIO(raw))
   encrypted=reader.is_encrypted
   if encrypted:assert reader.decrypt(''),f'Cannot open source: {path}'
   rotated=any(page.rotation for page in reader.pages)
   if encrypted or rotated:
    writer=PdfWriter();writer.clone_document_from_reader(reader)
    for page in writer.pages:
     if page.rotation:page.transfer_rotation_to_content()
    buffer=io.BytesIO();writer.write(buffer);raw=buffer.getvalue()
   digest=hashlib.sha256(raw).hexdigest()
   relative=f'sources/{digest}.pdf';target=OUT/relative;target.parent.mkdir(exist_ok=True);retained.add(target.name)
   if not target.exists():target.write_bytes(raw)
   entry[role]='/question-bank/'+relative
  pubpapers.append(entry)
 # Discard only short continuation strips with no answer text, never answer pages.
 pdfs={};paper_map={p['id']:p for p in pubpapers};removed_strips=0
 for q in public:
  if len(q['ms'])<2:continue
  kept=[]
  for seg in q['ms']:
   b=seg.get('box',[0,0,1,1])
   if b[3]-b[1]<0.04:
    url=paper_map[q['paper_id']]['ms']
    if url not in pdfs:pdfs[url]=pdfium.PdfDocument(str(ROOT/'public'/url.lstrip('/')))
    pg=pdfs[url][seg['page']-1];w,h=pg.get_size();tp=pg.get_textpage()
    content=tp.get_text_bounded(left=b[0]*w,bottom=(1-b[3])*h,right=b[2]*w,top=(1-b[1])*h)
    tp.close();pg.close()
    if not content.strip():removed_strips+=1;continue
   kept.append(seg)
  if kept:q['ms']=kept
 for pdf in pdfs.values():pdf.close()
 data={'bank':bank,'version':1,'papers':pubpapers,'questions':public}
 (OUT/f'{bank}.json').write_text(json.dumps(data,ensure_ascii=False,separators=(',',':')),encoding='utf-8')
 reports[bank]={'public':len(public),'leaf':sum(q['is_leaf'] for q in public),'papers':len(pubpapers),'excluded':len(qs)-len(public),'empty_ms_strips_removed':removed_strips}
 sys.path.pop(0);del sys.modules['database']
for path in (OUT/'sources').glob('*.pdf'):
 if path.name not in retained:
  assert path.resolve().parent==(OUT/'sources').resolve() and len(path.stem)==64
  path.unlink()
print(json.dumps(reports));print('Public source bytes:',sum(p.stat().st_size for p in (OUT/'sources').glob('*.pdf')))
(ROOT/'qa').mkdir(exist_ok=True);(ROOT/'qa/public-import.json').write_text(json.dumps(reports,indent=2),encoding='utf-8')
