"""Verify content preservation and prepare a classification-only D1 migration."""
from pathlib import Path
from collections import Counter
import csv, hashlib, json, sqlite3
ROOT=Path(__file__).resolve().parents[1]
work=ROOT/'work/classification'
FIELDS={'topic_ids','topics','chapters','summary'}
esc=lambda s: "'"+str(s).replace("'","''")+"'"
db=sqlite3.connect(':memory:')
db.executescript((work/'d1-before.sql').read_text('utf8'))
report={'date':'2026-09-28','method':'Rule-assisted audit of all records; targeted source and mark-scheme review. Not a manual verification of every answer.', 'banks':{}}
sql=[];rollback=[];changes=[]
for bank in ['edexcel','aqa','cie','esat']:
    path=ROOT/f'public/question-bank/{bank}.json'
    cat=json.loads(path.read_text('utf8'))
    before=json.loads((work/f'{bank}-before.json').read_text('utf8'))
    old={q['id']:q for q in before['questions']}
    assert cat['papers']==before['papers']
    assert set(old)=={q['id'] for q in cat['questions']}
    audit=json.loads((work/f'{bank}-audit.json').read_text('utf8'))
    evidence=json.loads((work/f'{bank}-evidence.json').read_text('utf8'))
    changed=0
    for q in cat['questions']:
        assert {k:v for k,v in q.items() if k not in FIELDS}=={k:v for k,v in old[q['id']].items() if k not in FIELDS},q['id']
        if q['topic_ids']!=old[q['id']]['topic_ids']:
            changed+=1
            changes.append([bank,q['id'],';'.join(old[q['id']]['topic_ids']),';'.join(q['topic_ids'])])
        row=db.execute('SELECT base,revision,changed,draft FROM questions WHERE bank=? AND id=?',(bank,q['id'])).fetchone()
        assert row and not row[2] and row[3] is None,'Existing owner edit requires individual merge'
        base=json.loads(row[0]); rev=row[1]
        updates=','.join(esc('$.'+key)+',json('+esc(json.dumps(q[key],ensure_ascii=False,separators=(',',':')))+')' for key in sorted(FIELDS))
        restore=','.join(esc('$.'+key)+',json('+esc(json.dumps(base[key],ensure_ascii=False,separators=(',',':')))+')' for key in sorted(FIELDS))
        where=' WHERE bank='+esc(bank)+' AND id='+esc(q['id'])+' AND changed=0 AND draft IS NULL AND revision='
        if any(q[k]!=base[k] for k in FIELDS):
            sql.append('UPDATE questions SET base=json_set(base,'+updates+'),revision=revision+1,updated_at=CURRENT_TIMESTAMP'+where+str(rev)+';')
            rollback.append('UPDATE questions SET base=json_set(base,'+restore+'),revision=revision+1,updated_at=CURRENT_TIMESTAMP'+where+str(rev+1)+';')
    report['banks'][bank]={
        'papers':len(cat['papers']),'records':len(cat['questions']),
        'leaves':sum(q['is_leaf'] for q in cat['questions']),
        'changed_topic_sets':changed,
        'methods':dict(Counter(r['method'] for r in audit)),
        'chapter_level_fallbacks':sum(q['is_leaf'] and any('-review-' in t for t in q['topic_ids']) for q in cat['questions']),
        'mark_schemes_without_extractable_text':sum(not r['ms'].strip() for r in evidence),
        'sha256':hashlib.sha256(path.read_bytes()).hexdigest(),
    }
with (work/'all-topic-changes.csv').open('w',encoding='utf-8-sig',newline='') as f:
    writer=csv.writer(f);writer.writerow(['bank','question_id','previous_topics','corrected_topics']);writer.writerows(changes)
(work/'classification-migration.sql').write_text('\n'.join(sql),encoding='utf8')
(work/'classification-rollback.sql').write_text('\n'.join(rollback),encoding='utf8')
report['migration_rows']=len(sql)
(ROOT/'docs').mkdir(exist_ok=True)
(ROOT/'docs/topic-classification-audit.json').write_text(json.dumps(report,ensure_ascii=False,indent=2)+'\n',encoding='utf8')
print(json.dumps(report,ensure_ascii=False,indent=2))
