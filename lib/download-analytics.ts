import type {Bank} from './question-bank';
// Best-effort counters only. No cookies, persistent visitor IDs, question IDs or search terms.
export function reportDownload(event:{event_id:string;bank:Bank;kind:'qp'|'ms';status:'success'|'error';bytes:number;duration_ms:number;questions:number}){
 if(typeof location==='undefined'||location.origin!=='https://betoadfish.github.io')return;
 void fetch('https://bill-biology-admin.betoadfish.workers.dev/events/download',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(event),credentials:'omit',referrerPolicy:'no-referrer',keepalive:true,signal:AbortSignal.timeout(4000)}).catch(()=>{});
}
