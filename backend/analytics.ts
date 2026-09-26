const banks=['edexcel','aqa','cie','esat'];
export type DownloadEvent={event_id:string;bank:string;kind:'qp'|'ms';status:'success'|'error';bytes:number;duration_ms:number;questions:number};
export function validateDownloadEvent(value:unknown):DownloadEvent {
 if(!value||typeof value!=='object'||Array.isArray(value))throw Error('Invalid event');
 const v=value as Record<string,unknown>,keys=['event_id','bank','kind','status','bytes','duration_ms','questions'];
 if(Object.keys(v).some(k=>!keys.includes(k))||keys.some(k=>!(k in v)))throw Error('Invalid fields');
 if(typeof v.event_id!=='string'||!/^[a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12}$/.test(v.event_id)||!banks.includes(String(v.bank))||!['qp','ms'].includes(String(v.kind))||!['success','error'].includes(String(v.status)))throw Error('Invalid event');
 for(const [key,max] of [['bytes',100*1024*1024],['duration_ms',3600000],['questions',100]] as const)if(!Number.isSafeInteger(v[key])||Number(v[key])<0||Number(v[key])>max)throw Error('Invalid value');
 if(Number(v.questions)<1||v.status==='error'&&v.bytes!==0)throw Error('Invalid value');
 return v as DownloadEvent;
}
export async function collectDownload(req:Request,db:D1Database,origin:string){
 const headers={'Access-Control-Allow-Origin':origin,'Vary':'Origin','Cache-Control':'no-store'};
 if(req.headers.get('Origin')!==origin)return new Response(null,{status:403});
 if(req.method==='OPTIONS')return new Response(null,{status:204,headers:{...headers,'Access-Control-Allow-Methods':'POST','Access-Control-Allow-Headers':'Content-Type','Access-Control-Max-Age':'86400'}});
 if(req.method!=='POST')return new Response(null,{status:405,headers});
 if(req.headers.get('Content-Type')?.split(';')[0]!=='application/json')return new Response(null,{status:415,headers});
 if(Number(req.headers.get('Content-Length')||0)>1024)return new Response(null,{status:413,headers});
 try {
  const reader=req.body?.getReader();if(!reader)throw Error('Empty');let raw='',size=0;const decoder=new TextDecoder();
  while(true){const {done,value}=await reader.read();if(done)break;size+=value.length;if(size>1024){await reader.cancel();return new Response(null,{status:413,headers});}raw+=decoder.decode(value,{stream:true});}raw+=decoder.decode();
  const v=validateDownloadEvent(JSON.parse(raw));
  await db.prepare('INSERT OR IGNORE INTO download_events(event_id,bank,kind,status,bytes,duration_ms,questions) VALUES(?,?,?,?,?,?,?)').bind(v.event_id,v.bank,v.kind,v.status,v.bytes,v.duration_ms,v.questions).run();
  await db.prepare("DELETE FROM download_events WHERE created_at < datetime('now','-90 days')").run();
  return new Response(null,{status:204,headers});
 }catch{return new Response(null,{status:400,headers});}
}
export async function downloadStats(db:D1Database,days:number){
 const {results}=await db.prepare("SELECT date(created_at,'+8 hours') AS day,bank,kind,count(*) AS attempts,sum(status='success') AS successes,sum(status='error') AS failures,sum(bytes) AS bytes,sum(CASE WHEN status='success' THEN duration_ms ELSE 0 END) AS duration_ms,sum(CASE WHEN status='success' THEN questions ELSE 0 END) AS questions FROM download_events WHERE created_at >= datetime('now',?) GROUP BY day,bank,kind ORDER BY day DESC,bank,kind").bind(`-${days} days`).all();
 return {days,timezone:'Asia/Shanghai',rows:results};
}
