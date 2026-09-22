import fs from 'node:fs';
const esc=s=>"'"+String(s).replaceAll("'","''")+"'";
let sql=fs.readFileSync('backend/schema.sql','utf8')+'\n';
for(const bank of (process.argv.includes('--cie-only')?['cie']:['edexcel','aqa','esat','cie'])){const data=JSON.parse(fs.readFileSync(`public/question-bank/${bank}.json`,'utf8'));for(const q of data.questions)sql+=`INSERT INTO questions(bank,id,base) VALUES(${esc(bank)},${esc(q.id)},${esc(JSON.stringify(q))}) ON CONFLICT(bank,id) DO UPDATE SET base=excluded.base WHERE questions.changed=0 AND questions.draft IS NULL AND questions.revision=1 AND questions.base<>excluded.base;\n`;}
fs.mkdirSync('work',{recursive:true});fs.writeFileSync('work/seed.sql',sql);console.log('Seed SQL written. Existing edits are preserved.');
