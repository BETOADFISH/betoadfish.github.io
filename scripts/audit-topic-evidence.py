"""Extract the already published question/mark-scheme regions for a local audit.

No source PDF or public question content is modified. The cache stays in work/.
"""
from pathlib import Path
from functools import lru_cache
import json, sys, hashlib
ROOT = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(ROOT / 'work/pytools'))
import pymupdf as fitz

@lru_cache(maxsize=48)
def document(url):
    return fitz.open(ROOT / ('public' + url))

def extract(q, role):
    asset = q['assets'][role]
    doc = document(asset['url'])
    result = []
    for region in q[role]:
        page = doc[asset['pages'][str(region['page'])] - 1]
        x0,y0,x1,y1 = region['box']
        rect = page.rect
        result.append(page.get_text(clip=fitz.Rect(x0*rect.width,y0*rect.height,x1*rect.width,y1*rect.height)))
    return '\n'.join(result)

def scoring_text(q):
    """Read the answer column without examiner comments/alternative guidance."""
    doc=document(q['assets']['ms']['url']); result=[]
    for region in q['ms']:
        page=doc[q['assets']['ms']['pages'][str(region['page'])]-1]
        width=page.rect.width; height=page.rect.height
        x0,y0,x1,y1=region['box']
        headings=[w[0] for w in page.get_text('words')
                  if w[4] in ('Comments','Additional','Guidance') and w[0]>width*.48]
        # Column layouts vary; only narrow when a header is actually visible.
        right=min(x1*width,min(headings)-8) if headings else x1*width
        result.append(page.get_text(clip=fitz.Rect(x0*width,y0*height,right,y1*height)))
    return '\n'.join(result)

if __name__ == '__main__':
    out = ROOT / 'work/classification'; out.mkdir(parents=True, exist_ok=True)
    for bank in ['aqa','edexcel','cie','esat']:
        path = ROOT / f'public/question-bank/{bank}.json'
        backup = out / f'{bank}-before.json'
        if not backup.exists(): backup.write_bytes(path.read_bytes())
        cat = json.loads(backup.read_text('utf8'))
        if '--scoring' in sys.argv:
            rows=json.loads((out/f'{bank}-evidence.json').read_text('utf8'))
            byid={q['id']:q for q in cat['questions']}
            for row in rows:
                q=byid[row['id']]
                row['scoring_ms']=scoring_text(q) if '-al-' in q['id'] or (bank=='cie' and q['unit']!=1) else row['ms']
            (out/f'{bank}-evidence.json').write_text(json.dumps(rows,ensure_ascii=False),encoding='utf8')
            print(bank,'scoring columns extracted',flush=True)
            continue
        rows = []
        for q in cat['questions']:
            if not q['is_leaf']: continue
            rows.append({'id':q['id'], 'qp':extract(q,'qp'), 'ms':extract(q,'ms')})
        (out/f'{bank}-evidence.json').write_text(json.dumps(rows,ensure_ascii=False),encoding='utf8')
        print(bank, 'leaves',len(rows),'papers',len({q['paper_id'] for q in cat['questions']}),
              'empty MS',sum(not r['ms'].strip() for r in rows),flush=True)
