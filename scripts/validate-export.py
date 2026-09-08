"""Validate exported routes, packaged local links and scientific asset invariants."""
from pathlib import Path
from html.parser import HTMLParser
from urllib.parse import urlsplit, unquote
import csv, json, hashlib

ROOT = Path(__file__).resolve().parents[1]
OUT = ROOT / 'dist/client'
class Document(HTMLParser):
    def __init__(self, text):
        super().__init__(); self.ids=set(); self.links=[]; self.assets=[]; self.headings=0; self.title=''; self.in_title=False; self.feed(text)
    def handle_starttag(self, tag, attrs):
        a=dict(attrs)
        if a.get('id'): self.ids.add(a['id'])
        if tag=='a' and a.get('href'): self.links.append(a['href'])
        if tag in ('img','script') and a.get('src'): self.assets.append(a['src'])
        if tag=='image' and a.get('href'): self.assets.append(a['href'])
        if tag=='link' and a.get('rel') in ('stylesheet','icon','modulepreload'): self.assets.append(a.get('href',''))
        if tag=='h1': self.headings+=1
        if tag=='title': self.in_title=True
    def handle_endtag(self, tag):
        if tag=='title': self.in_title=False
    def handle_data(self, data):
        if self.in_title: self.title+=data

def route_file(path):
    p=OUT / unquote(path).lstrip('/')
    if p.is_file(): return p
    if (p/'index.html').is_file(): return p/'index.html'
    if p.with_suffix('.html').is_file(): return p.with_suffix('.html')
    return None

errors=[]; checked=0
paths=['/','/projects','/intelligence','/projects/hubisco','/projects/pet-hydrolase','/projects/mcr1-colistin','/intelligence/3d-cell-culture','/intelligence/yidu']
paths += ['/zh'+(path if path!='/' else '') for path in paths[:]]
routes={path:route_file(path) for path in paths}
docs={}
for route,p in routes.items():
    if not p or not p.is_file(): errors.append(f'Missing route {route}'); continue
    doc=Document(p.read_text(encoding='utf-8')); docs[route]=doc
    if doc.headings!=1: errors.append(f'{route}: expected one h1, found {doc.headings}')
    if not doc.title or 'Untitled' in doc.title: errors.append(f'{route}: missing site-specific title')
    if route.count('/')>=2 and route.rstrip('/').split('/')[-1] in ['hubisco','pet-hydrolase','mcr1-colistin','3d-cell-culture','yidu'] and 'intro' not in doc.ids: errors.append(f'{route}: missing project introduction')
for route,doc in docs.items():
    for url in doc.links+doc.assets:
        u=urlsplit(url)
        if u.scheme or u.netloc: continue
        target=u.path.rstrip('/') or route
        if u.path=='/': target='/'
        p=route_file(target)
        if not p: errors.append(f'{route}: missing local target {url}')
        elif u.fragment:
            targetdoc=docs.get(target) or Document(p.read_text(encoding='utf-8'))
            if u.fragment not in targetdoc.ids: errors.append(f'{route}: missing anchor {url}')
        checked+=1
for name in ['9RUB','5RUB']:
    data=(OUT/'structures'/f'{name}.pdb').read_text()
    for res,num in [('ILE',164),('LYS',191),('SER',368)]:
        assert any(l.startswith('ATOM') and l[17:20]==res and l[21]=='A' and int(l[22:26])==num for l in data.splitlines()),(name,res,num)
    if name=='9RUB':
        for ligand in ['RUB','MG','FMT']: assert any(l.startswith('HETATM') and l[17:20].strip()==ligand for l in data.splitlines()),ligand
        assert any(l.startswith('LINK') and 'LYS A 191' in l and 'FMT A 601' in l for l in data.splitlines())
rows=list(csv.DictReader((OUT/'data/phi-nmr.csv').open(encoding='utf-8-sig')))
assert [(float(r['time_h']),float(r['Hu6P_to_F6P_ratio'])) for r in rows]==[(24,.035),(144,.196)]
concs=list(csv.DictReader((OUT/'data/protein-concentrations.csv').open(encoding='utf-8-sig')))
assert [float(r['concentration_mg_per_mL']) for r in concs]==[6.46,3.66,1.451]
assert concs[2]['reported_mass_mg']==''
approved_pdfs={'downloads/Bill-Huang-CV.pdf','downloads/HuBisCO-project-brief.pdf'}
for p in OUT.rglob('*'):
    if p.suffix.lower() in ('.docx','.xlsx','.env') or (p.suffix.lower()=='.pdf' and p.relative_to(OUT).as_posix() not in approved_pdfs): errors.append(f'Unexpected private or unsupplied document: {p}')
scores=json.loads((ROOT/'lib/docking-scores.json').read_text())
exported=list(csv.DictReader((OUT/'data/hubisco-docking.csv').open(encoding='utf-8')))
assert len(scores)==len(exported)==20
assert {(x['protein'],x['ligand'],x['score']) for x in scores}=={(x['protein'],x['ligand'],float(x['score'])) for x in exported}
manifest=json.loads((ROOT/'dist/server/vinext-prerender.json').read_text())
for r in manifest['routes']:
    if r['status'] not in ('rendered',): errors.append(f'Prerender not complete: {r}')
result={'status':'pass' if not errors else 'fail','routes':list(docs),'local_links_and_assets_checked':checked,'source_values':'exactly matched supplied CSV points','structures':'residue, ligand and covalent-link records verified','private_document_scan':'pass','browser_testing':'not covered by this script','errors':errors}
(ROOT/'qa').mkdir(exist_ok=True)
(ROOT/'qa/export-audit.json').write_text(json.dumps(result,indent=2),encoding='utf-8')
print(json.dumps(result,indent=2))
raise SystemExit(bool(errors))
