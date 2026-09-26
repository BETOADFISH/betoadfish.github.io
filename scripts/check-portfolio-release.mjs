import fs from 'node:fs';
import assert from 'node:assert/strict';
import path from 'node:path';
const routes=['','projects','projects/hubisco','projects/pet-hydrolase','projects/mcr1-colistin','intelligence','intelligence/3d-cell-culture','intelligence/yidu','tools','tools/biology'];
for(const prefix of ['','zh/'])for(const route of routes){
 const key=(prefix+route).replace(/\/$/,'')||'index';
 const html=fs.readFileSync('dist/client/'+key+'.html','utf8');
 const text=html.replace(/<script\b[^>]*>[\s\S]*?<\/script>/g,'').replace(/<[^>]*>/g,' ');
 assert(!/Bursary|bursary report|总结记录|简历记录|CV record/.test(text),key+' exposes internal copy');
 assert.equal((html.match(/<h1(?:\s|>)/g)||[]).length,1,key+' has one page title');
 assert(html.includes('viewport-fit=cover'));assert(html.includes('mobile-menu-toggle'));
 if(!route){assert(html.includes('personal-opening'));assert(!html.includes('research-atlas'));assert(html.includes('I164-S368-interaction.webp'));}
 if(route==='projects/pet-hydrolase'){assert(html.includes('3.9'));assert(prefix?text.includes('定性观察'):text.includes('qualitative'));}
 if(route==='projects/hubisco'){assert(prefix?text.includes('理论'):text.includes('Theoretical'));assert(prefix?text.includes('尚未确立替代底物催化'):text.includes('alternative-substrate turnover was not established'));}
 if(route==='intelligence/yidu'){assert(prefix?text.includes('咨询实习生'):text.includes('Consulting Intern'));assert(text.includes('FXI/FXIa'));}
 for(const [,src] of html.matchAll(/(?:src|href)="(\/(?!\/)[^"?#]+)(?:[?#][^"]*)?"/g)){
  if(!/\.(?:css|js|svg|png|webp|jpg|pdf|woff2)$/.test(src))continue;
  assert(fs.existsSync(path.join('dist/client',decodeURIComponent(src))),key+' missing '+src);
 }
 console.log('/'+(key==='index'?'':key)+': public copy, evidence qualifications and asset links checked');
}
console.log('Portfolio output checks passed; rendered layout and real-device interaction still require a browser.');
