import {fetchWithTimeout} from './request-timeout';
import type {Bank} from './question-bank';
// Best-effort counters only. No cookies, persistent visitor IDs, question IDs or search terms.
export function reportDownload(event:{event_id:string;bank:Bank;kind:'qp'|'ms';status:'success'|'error';bytes:number;duration_ms:number;questions:number}){
 if(typeof location==='undefined'||location.origin!=='https://betoadfish.github.io')return;
 void fetchWithTimeout('https://bill-biology-admin.betoadfish.workers.dev/events/download',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(event),credentials:'omit',referrerPolicy:'no-referrer',keepalive:true},4000).catch(()=>{});
}

export function downloadEventId(){
 const bytes=new Uint8Array(16);crypto.getRandomValues(bytes);bytes[6]=(bytes[6]&15)|64;bytes[8]=(bytes[8]&63)|128;
 const hex=Array.from(bytes,n=>n.toString(16).padStart(2,'0')).join('');return `${hex.slice(0,8)}-${hex.slice(8,12)}-${hex.slice(12,16)}-${hex.slice(16,20)}-${hex.slice(20)}`;
}
