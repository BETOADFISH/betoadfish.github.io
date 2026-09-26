// AbortSignal.timeout is missing in some mobile and embedded browsers.
export async function fetchWithTimeout(url:string,options:RequestInit={},milliseconds=30000){
 const controller=new AbortController();const abort=()=>controller.abort();
 if(options.signal?.aborted)abort();else options.signal?.addEventListener('abort',abort,{once:true});
 const timer=setTimeout(abort,milliseconds);
 try{return await fetch(url,{...options,signal:controller.signal});}
 finally{clearTimeout(timer);options.signal?.removeEventListener('abort',abort);}
}
