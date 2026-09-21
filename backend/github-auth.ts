/// <reference types="@cloudflare/workers-types" />
import {EncryptJWT,jwtDecrypt} from 'jose';
export type GithubAuthEnv={DB:D1Database;GITHUB_CLIENT_ID?:string;GITHUB_CLIENT_SECRET?:string;GITHUB_OWNER_ID?:string;SESSION_SECRET?:string};
const sessionName='__Host-biology-session',stateName='__Host-biology-oauth';
const headers={'Cache-Control':'no-store','Referrer-Policy':'no-referrer','X-Content-Type-Options':'nosniff'};
const random=()=>{const bytes=crypto.getRandomValues(new Uint8Array(32));return btoa(String.fromCharCode(...bytes)).replaceAll('+','-').replaceAll('/','_').replaceAll('=','');};
const hash=async(value:string)=>Array.from(new Uint8Array(await crypto.subtle.digest('SHA-256',new TextEncoder().encode(value)))).map(b=>b.toString(16).padStart(2,'0')).join('');
const key=async(secret:string)=>new Uint8Array(await crypto.subtle.digest('SHA-256',new TextEncoder().encode(secret)));
const cookie=(name:string,value:string,seconds:number)=>`${name}=${value}; Path=/; HttpOnly; Secure; SameSite=Lax; Max-Age=${seconds}`;
function readCookie(req:Request,name:string){return(req.headers.get('Cookie')||'').split(';').map(x=>x.trim()).find(x=>x.startsWith(name+'='))?.slice(name.length+1)||'';}
function response(text:string,status:number,extra:Record<string,string>={}){return new Response(text,{status,headers:{...headers,'Content-Type':'text/plain; charset=utf-8',...extra}});}
export async function verifyGithubSession(req:Request,env:GithubAuthEnv){
 const token=readCookie(req,sessionName);if(!env.GITHUB_OWNER_ID||!/^[A-Za-z0-9_-]{43}$/.test(token))throw Error('Unauthorized');
 const row=await env.DB.prepare('SELECT subject FROM admin_sessions WHERE token_hash=? AND expires>?').bind(await hash(token),Math.floor(Date.now()/1000)).first<{subject:string}>();
 if(row?.subject!==env.GITHUB_OWNER_ID)throw Error('Unauthorized');return row.subject;
}
export async function githubAuth(req:Request,env:GithubAuthEnv):Promise<Response>{
 const url=new URL(req.url),callback=url.origin+'/auth/callback';
 if(url.pathname==='/auth/logout'){
  if(req.method!=='POST'||req.headers.get('Origin')!==url.origin)return response('请求来源不正确。',403);
  const token=readCookie(req,sessionName);if(token)await env.DB.prepare('DELETE FROM admin_sessions WHERE token_hash=?').bind(await hash(token)).run();
  return response('',303,{Location:'/admin','Set-Cookie':cookie(sessionName,'',0)});
 }
 if(!env.GITHUB_CLIENT_ID||!env.GITHUB_CLIENT_SECRET||!env.GITHUB_OWNER_ID||!env.SESSION_SECRET||env.SESSION_SECRET.length<32)return response('管理员登录尚未配置。',503);
 if(req.method!=='GET')return response('Method not allowed',405);
 if(url.pathname==='/auth/login'){
  const state=random(),verifier=random();const challengeBytes=new Uint8Array(await crypto.subtle.digest('SHA-256',new TextEncoder().encode(verifier)));const challenge=btoa(String.fromCharCode(...challengeBytes)).replaceAll('+','-').replaceAll('/','_').replaceAll('=','');
  const sealed=await new EncryptJWT({state,verifier}).setProtectedHeader({alg:'dir',enc:'A256GCM'}).setIssuer(url.origin).setAudience('biology-oauth').setIssuedAt().setExpirationTime('10m').encrypt(await key(env.SESSION_SECRET));
  const target=new URL('https://github.com/login/oauth/authorize');target.search=new URLSearchParams({client_id:env.GITHUB_CLIENT_ID,redirect_uri:callback,state,scope:'',code_challenge:challenge,code_challenge_method:'S256',allow_signup:'false'}).toString();
  return response('',302,{Location:target.href,'Set-Cookie':cookie(stateName,sealed,600)});
 }
 if(url.pathname!=='/auth/callback')return response('Not found',404);
 const clear={'Set-Cookie':cookie(stateName,'',0)};
 try{
  const {payload}=await jwtDecrypt(readCookie(req,stateName),await key(env.SESSION_SECRET),{issuer:url.origin,audience:'biology-oauth',keyManagementAlgorithms:['dir'],contentEncryptionAlgorithms:['A256GCM'],requiredClaims:['exp','iat','state','verifier']});
  const code=url.searchParams.get('code'),state=url.searchParams.get('state');if(!code||code.length>512||!state||state!==payload.state||typeof payload.verifier!=='string')return response('登录验证已失效，请重新登录。',400,clear);
  const exchange=await fetch('https://github.com/login/oauth/access_token',{method:'POST',headers:{Accept:'application/json','Content-Type':'application/x-www-form-urlencoded'},body:new URLSearchParams({client_id:env.GITHUB_CLIENT_ID,client_secret:env.GITHUB_CLIENT_SECRET,code,redirect_uri:callback,code_verifier:payload.verifier}),signal:AbortSignal.timeout(10000)});
  if(!exchange.ok)return response('GitHub 暂时无法连接，请重新登录。',502,clear);const token=await exchange.json() as {access_token?:string;token_type?:string};if(!token.access_token||token.token_type?.toLowerCase()!=='bearer')return response('GitHub 登录未完成，请重试。',401,clear);
  const identity=await fetch('https://api.github.com/user',{headers:{Authorization:`Bearer ${token.access_token}`,Accept:'application/vnd.github+json','User-Agent':'Bill-Biology-Editor'},signal:AbortSignal.timeout(10000)});
  if(!identity.ok)return response('无法确认账号，请重新登录。',502,clear);const profile=await identity.json() as {id:number};if(String(profile.id)!==env.GITHUB_OWNER_ID)return response('这个账号没有管理权限。',403,clear);
  const session=random(),now=Math.floor(Date.now()/1000);await env.DB.prepare('DELETE FROM admin_sessions WHERE expires<=?').bind(now).run();await env.DB.prepare('INSERT INTO admin_sessions(token_hash,subject,expires) VALUES(?,?,?)').bind(await hash(session),String(profile.id),now+28800).run();
  // GitHub tokens are used only for this identity check, never stored or sent to the browser.
  const result=new Response(null,{status:303,headers:{...headers,Location:'/admin'}});result.headers.append('Set-Cookie',cookie(stateName,'',0));result.headers.append('Set-Cookie',cookie(sessionName,session,28800));return result;
 }catch{return response('登录验证已失效，请重新登录。',400,clear);}
}
export const loginHtml='<!doctype html><html lang="zh-CN"><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>题库管理 · 登录</title><body style="font-family:system-ui;background:#f4f6f3;color:#203c32;max-width:480px;margin:15vh auto;padding:24px"><h1>题库管理</h1><p>使用管理员的 GitHub 账号登录。</p><a href="/auth/login" style="display:inline-block;padding:12px 22px;border-radius:8px;background:#23645d;color:white;text-decoration:none">用 GitHub 登录</a></body></html>';
