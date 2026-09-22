"""Build complete AL question groups from paired, layout-indexed local sources.

Every paper is gated by consecutive question numbers and its printed mark total.
Teacher source PDFs are never changed. Outputs stay private until QA passes.
"""
from pathlib import Path
import json,re
ROOT=Path(__file__).resolve().parents[1]
CACHE=ROOT/'work/al-layout'
OUT=ROOT/'work/al-catalogs';OUT.mkdir(exist_ok=True)

def anchors(d):
 result={};bank=d['bank'];role=d['role']
 for pn,pg in enumerate(d['pages'],1):
  if role=='qp' and pn==1:continue
  if role=='ms' and re.search(r'Summary of changes|changes from Provisional',pg['text'],re.I):continue
  if role=='qp' and bank=='edexcel' and re.search(r'TOTAL FOR (?:THE )?PAPER',pg['text'],re.I):
   last_page=pn
  for l in sorted(pg['lines'],key=lambda l:(l['box'][1],l['box'][0])):
   txt=l['text'].strip();x,y=l['box'][:2]
   if y<35 or y>pg['height']-65:continue
   if bank=='edexcel':
    m=re.match(r'^(\d{1,2})\s+(?:[A-Z]|\([a-z]\))',txt) if role=='qp' and x<80 else re.fullmatch(r'(\d{1,2})\s*(?:\([a-z]\)(?:\s*\([ivx]+\))*|[a-z]\s*[ivx]*)',txt) if role=='ms' and x<160 else None
   else:
    m=re.fullmatch(r'(\d(?:\s*\d)?)(?:\s*\.\s*\d)?',txt) if role=='qp' and 40<x<85 else re.fullmatch(r'(\d{1,2})(?:\.\d+)?',txt) if role=='ms' and x<120 and (re.search(r'Marking\s+Guidance',pg['text'],re.I) or (pn>5 and re.fullmatch(r'0[1-9](?:\.\d+)?',txt))) else None
   if not m:continue
   if bank=='aqa' and role=='ms' and '.' not in txt and not re.fullmatch(r'0[1-9]',txt):continue
   n=int(m[1].replace(' ',''))
   if n<1 or n>15 or n in result:continue
   if role=='ms':
    # Labels are vertically centred in table cells: start at their table header.
    heads=[z['box'][1] for z in pg['lines'] if z['text'].strip().lower() in ['question','question number'] and z['box'][1]<y]
    y=max(heads)-5 if heads else 40
   result[n]=(pn,max(35,y-6))
  if role=='qp' and bank=='edexcel' and re.search(r'TOTAL FOR (?:THE )?PAPER',pg['text'],re.I):break
 return result

def regions(d,start,end):
 out=[]
 for p in range(start[0],end[0]+1):
  pg=d['pages'][p-1];top=start[1] if p==start[0] else 36;bottom=end[1] if p==end[0] else pg['height']-55
  if bottom-top<10:continue
  if re.search(r'(?:BLANK PAGE|DO NOT WRITE ON THIS PAGE|There are no questions printed)',pg['text'],re.I) and not re.search(r'\[\d+ marks?\]',pg['text']):continue
  out.append({'page':p,'box':[.055,round(top/pg['height'],6),.945,round(bottom/pg['height'],6)]})
 return out

def content(d,rs):
 return '\n'.join(l['text'] for r in rs for l in d['pages'][r['page']-1]['lines'] if r['box'][1]*d['pages'][r['page']-1]['height']<=l['box'][1]<r['box'][3]*d['pages'][r['page']-1]['height'])

def build(qp,ms):
 qa,ma=anchors(qp),anchors(ms);issues=[]
 if qp['bank']=='aqa' and qp['unit']==3:
  for pn,pg in enumerate(ms['pages'],1):
   if re.search(r'Question\s+0?'+str(max(qa))+r'\.1',pg['text'],re.I):ma.setdefault(max(qa),(pn,40))
 expected=list(range(1,max(qa,default=0)+1))
 if sorted(qa)!=expected or sorted(ma)!=expected:issues.append(['anchors',sorted(qa),sorted(ma)])
 cover=qp['pages'][0]['text'];totalmatch=re.search(r'maximum mark for this paper is\s*(\d+)',cover,re.I)
 total=int(totalmatch[1]) if totalmatch else 50 if qp['unit']==6 else 90
 essay=qp['bank']=='aqa' and qp['unit']==3
 if essay and ma:
  for p,pg in enumerate(ms['pages'],1):
   if re.search(r'(?:Level of response marking guidance|Essay marking|21\s*[–−-]\s*25)',pg['text'],re.I) and p>4:
    ma[max(ma)]=(p,40);break
 questions=[];excluded=[]
 for n,start in sorted(qa.items()):
  if n not in ma:continue
  nxt=qa.get(n+1)
  if nxt:end=(nxt[0],nxt[1]-8)
  else:
   ep=len(qp['pages']);ey=qp['pages'][-1]['height']-55
   for pn in range(start[0],len(qp['pages'])+1):
    pg=qp['pages'][pn-1]
    endings=[l for l in pg['lines'] if re.search(r'TOTAL FOR (?:THE )?PAPER|END OF QUESTIONS',l['text'],re.I)]
    if endings:ep=pn;ey=max(l['box'][3] for l in endings)+5;break
   end=(ep,ey)
  qr=regions(qp,start,end);text=content(qp,qr)
  if qp['bank']=='edexcel':
   mt=re.findall(r'Total for Question\s*'+str(n)+r'\s*=\s*(\d+)\s*marks?',text,re.I)
   marks=int(mt[-1]) if mt else 0
  else:
   marks=sum(int(v) for v in re.findall(r'\[\s*(\d+)\s*marks?\s*\]',text,re.I))
   if essay and n==max(qa):marks=25
  if not marks:issues.append(['marks',n])
  mn=ma.get(n+1);mr=regions(ms,ma[n],(mn[0],mn[1]-7) if mn else (len(ms['pages']),ms['pages'][-1]['height']-45))
  # The Unit 5 scientific article is needed to answer the final question.
  if qp['bank']=='edexcel' and qp['unit']==5 and n==max(qa):
   for pn in range(end[0]+1,len(qp['pages'])+1):
    pg=qp['pages'][pn-1]
    if len(pg['text'].strip())>250 and not re.search(r'DO NOT WRITE ON THIS PAGE|BLANK PAGE',pg['text']):qr.append({'page':pn,'box':[.055,.045,.945,.94]})
  pid=qp['id'];qid=f'{pid}-q{n}';title=f"{qp['session']} {qp['year']} · {qp['code']}"
  q=dict(id=qid,bank=qp['bank'],paper_id=pid,label=f'Q{n}',parent_id=None,major_id=qid,kind='major',marks=marks,summary='',text=text,topics=[],chapters=[],skills=['Essay'] if essay and n==max(qa) else [],year=qp['year'],session=qp['session'],unit=qp['unit'],code=qp['code'],paper_title=title,is_leaf=True,leaves=[qid],qp=qr,ms=mr,dependencies=[],revision=1)
  questions.append(q)
  if re.search(r'(?:removed|omitted|not reproduced|unable to reproduce).{0,100}copyright|copyright.{0,100}(?:removed|omitted|not reproduced|unavailable)',text,re.I|re.S):excluded.append(qid)
 if sum(q['marks'] for q in questions)!=total:issues.append(['total',sum(q['marks'] for q in questions),total])
 paper=dict(id=qp['id'],title=f"{qp['session']} {qp['year']} · {qp['code']}",code=qp['code'],qp='/question-bank/sources/'+qp['sha256']+'.pdf',ms='/question-bank/sources/'+ms['sha256']+'.pdf',general_ms=[])
 return paper,questions,issues,excluded

if __name__=='__main__':
 report=[]
 for bank in ['edexcel','aqa']:
  cat={'bank':bank,'version':2,'questions':[],'papers':[]}
  for path in sorted(CACHE.glob(bank+'*-qp.json')):
   qp=json.loads(path.read_text('utf8'));ms=json.loads(path.with_name(path.name.replace('-qp.json','-ms.json')).read_text('utf8'))
   p,qs,issues,excluded=build(qp,ms)
   report.append({'paper':qp['id'],'questions':len(qs),'marks':sum(q['marks'] for q in qs),'issues':issues,'excluded':excluded})
   cat['papers'].append(p);cat['questions'].extend(q for q in qs if q['id'] not in excluded)
  (OUT/(bank+'.json')).write_text(json.dumps(cat,ensure_ascii=False),encoding='utf8')
 (ROOT/'qa/expansion/al-question-audit.json').write_text(json.dumps(report,indent=2),encoding='utf8')
 for row in report:
  if row['issues'] or row['excluded']:print(row)
 print('Papers',len(report),'passed',sum(not r['issues'] for r in report))
