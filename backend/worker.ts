/// <reference types="@cloudflare/workers-types" />
import {verifyOwner,type AuthEnv} from './auth';
import {githubAuth,verifyGithubSession,loginHtml,type GithubAuthEnv} from './github-auth';
import {validatePatch,ValidationError} from './validation';
import adminHtml from './admin.html';
import type {Question} from '../lib/question-bank';
type Env=AuthEnv&GithubAuthEnv&{PUBLIC_ORIGIN:string};
type Row={bank:string;id:string;base:string;draft:string|null;published:string|null;changed:number;revision:number};
const json=(data:unknown,status=200,headers:Record<string,string>={})=>new Response(JSON.stringify(data),{status,headers:{'Content-Type':'application/json; charset=utf-8','Cache-Control':'no-store','X-Content-Type-Options':'nosniff',...headers}});
export default {async fetch(req:Request,env:Env):Promise<Response>{
 const url=new URL(req.url),path=url.pathname;const origin=env.PUBLIC_ORIGIN||'https://betoadfish.github.io';
 if(path==='/health')return json({ok:true});
 if(path.startsWith('/auth/'))return githubAuth(req,env);
 const pub=path.match(/^\/public\/(edexcel|aqa|esat|cie)$/);
 if(pub){if(req.method!=='GET')return json({error:'Method not allowed'},405);const {results}=await env.DB.prepare('SELECT id,published,revision FROM questions WHERE bank=? AND changed=1').bind(pub[1]).all<{id:string;published:string|null;revision:number}>();return json(results.map(r=>({...r,published:r.published?JSON.parse(r.published):null})),200,{'Access-Control-Allow-Origin':origin,'Vary':'Origin'});}
 if(!path.startsWith('/admin'))return json({error:'Not found'},404);
 try{if(env.GITHUB_CLIENT_ID)await verifyGithubSession(req,env);else await verifyOwner(req.headers.get('Cf-Access-Jwt-Assertion')||'',env);}catch{if((path==='/admin'||path==='/admin/')&&env.GITHUB_CLIENT_ID&&req.method==='GET')return new Response(loginHtml,{status:401,headers:{'Content-Type':'text/html; charset=utf-8','Cache-Control':'no-store','Referrer-Policy':'no-referrer'}});return json({error:'请先使用管理员账号登录。'},401);}
 if(path==='/admin'||path==='/admin/'){if(req.method!=='GET')return json({error:'Method not allowed'},405);return new Response(adminHtml.replace('<!--SIGNOUT-->',env.GITHUB_CLIENT_ID?'<form method="post" action="/auth/logout"><button>退出登录</button></form>':''),{headers:{'Content-Type':'text/html; charset=utf-8','Cache-Control':'no-store','X-Content-Type-Options':'nosniff','Referrer-Policy':'no-referrer','Content-Security-Policy':"default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline'; connect-src 'self'; frame-ancestors 'none'; base-uri 'none'; form-action 'self'"}});}
 if(path==='/admin/api/list'&&req.method==='GET'){const bank=url.searchParams.get('bank');if(!['edexcel','aqa','esat','cie'].includes(bank||''))return json({error:'请选择题库。'},400);const page=Math.max(0,Math.min(1000,Number(url.searchParams.get('page'))||0));const query=(url.searchParams.get('q')||'').slice(0,100);const {results}=await env.DB.prepare("SELECT id,base,draft,published,changed,revision FROM questions WHERE bank=? AND (id LIKE ? OR json_extract(base,'summary') LIKE ?) ORDER BY id LIMIT 50 OFFSET ?").bind(bank,'%'+query+'%','%'+query+'%',page*50).all<Row>();return json(results.map(r=>{const base=JSON.parse(r.base);return{id:r.id,label:base.label,title:base.bank==='edexcel'?`Unit ${base.unit} · ${base.paper_title}`:base.paper_title,summary:base.summary,revision:r.revision,status:r.draft?'draft':r.changed&&!r.published?'unpublished':'published'};}));}
 if(path==='/admin/api/backup'&&req.method==='GET'){const rows=await env.DB.prepare('SELECT * FROM questions WHERE changed=1 OR draft IS NOT NULL').all();return json({format:'biology-admin-backup-v1',exported_at:new Date().toISOString(),questions:rows.results},200,{'Content-Disposition':'attachment; filename="biology-admin-backup.json"'});}
 const match=path.match(/^\/admin\/api\/(edexcel|aqa|esat|cie)\/([^/]+)$/);if(!match)return json({error:'Not found'},404);const bank=match[1],id=decodeURIComponent(match[2]);const row=await env.DB.prepare('SELECT * FROM questions WHERE bank=? AND id=?').bind(bank,id).first<Row>();if(!row)return json({error:'题目不存在。'},404);
 if(req.method==='GET')return json({...row,base:JSON.parse(row.base),draft:row.draft?JSON.parse(row.draft):null,published:row.published?JSON.parse(row.published):null});
 if(req.method!=='POST')return json({error:'Method not allowed'},405);
 if(req.headers.get('Origin')!==url.origin||req.headers.get('Content-Type')?.split(';')[0]!=='application/json')return json({error:'请求来源不正确。'},403);
 if(Number(req.headers.get('Content-Length')||0)>32768)return json({error:'修改内容过长。'},413);
 const text=await req.text();if(text.length>32768)return json({error:'修改内容过长。'},413);
 try{const body=JSON.parse(text);if(body.revision!==row.revision)return json({error:'题目刚被更新，请重新打开后再保存。'},409);const base=JSON.parse(row.base) as Question;let statement:D1PreparedStatement;
 if(body.action==='save'){const patch=validatePatch(body.patch,base);statement=env.DB.prepare('UPDATE questions SET draft=?,revision=revision+1,updated_at=CURRENT_TIMESTAMP WHERE bank=? AND id=? AND revision=? RETURNING revision').bind(JSON.stringify(patch),bank,id,row.revision);}
 else if(body.action==='publish'){if(!row.draft)return json({error:'请先保存并检查草稿。'},400);const patch=validatePatch(JSON.parse(row.draft),base);statement=env.DB.prepare('UPDATE questions SET published=?,draft=NULL,changed=1,revision=revision+1,updated_at=CURRENT_TIMESTAMP WHERE bank=? AND id=? AND revision=? RETURNING revision').bind(JSON.stringify(patch),bank,id,row.revision);}
 else if(body.action==='unpublish'){statement=env.DB.prepare('UPDATE questions SET published=NULL,draft=NULL,changed=1,revision=revision+1,updated_at=CURRENT_TIMESTAMP WHERE bank=? AND id=? AND revision=? RETURNING revision').bind(bank,id,row.revision);}
 else return json({error:'操作无效。'},400);
 const updated=await statement.first<{revision:number}>();if(!updated)return json({error:'题目刚被更新，请重新打开后再保存。'},409);await env.DB.prepare('INSERT INTO audit(bank,question_id,action,revision) VALUES(?,?,?,?)').bind(bank,id,body.action,updated.revision).run();return json({ok:true,revision:updated.revision});
 }catch(e){if(e instanceof SyntaxError)return json({error:'内容格式不正确。'},400);if(e instanceof ValidationError)return json({error:e.message},400);return json({error:'保存失败，请重试。'},500);}
}};
