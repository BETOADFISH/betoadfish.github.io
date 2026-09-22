import {PDFDocument,StandardFonts,rgb} from 'pdf-lib';
import {type Catalog,type Question,type Region,type Asset,expectedMinutes,selectedMarks,resolveSelection,banks} from './question-bank';
export type Role='qp'|'ms';
const byteCache=new Map<string,Uint8Array>();let cachedBytes=0;
async function fetchAsset(url:string){
 if(!/^\/question-bank\/items\/[a-f0-9]{64}\.pdf$/.test(url))throw Error('题目文件地址无效。');
 const hit=byteCache.get(url);if(hit){byteCache.delete(url);byteCache.set(url,hit);return hit;}
 const response=await fetch(url,{signal:AbortSignal.timeout(60000)});if(!response.ok)throw Error('题目文件暂时无法下载，请稍后重试。');
 const bytes=new Uint8Array(await response.arrayBuffer());
 while(cachedBytes+bytes.length>64*1024*1024&&byteCache.size){const key=byteCache.keys().next().value!;cachedBytes-=byteCache.get(key)!.length;byteCache.delete(key);}
 if(bytes.length<=64*1024*1024){byteCache.set(url,bytes);cachedBytes+=bytes.length;}return bytes;
}
function mapped(asset:Asset|undefined,regions:Region[]){if(!asset)throw Error('题目文件未准备好。');return regions.map(r=>{const page=asset.pages[String(r.page)];if(!page)throw Error('题目范围已更新，请刷新重试。');return {...r,page};});}
const safe=(s:string)=>s.replace(/[^\x20-\x7E]/g,' ').replace(/\s+/g,' ').trim();
export async function createQuestionPdf(catalog:Catalog,ids:string[],role:Role,progress?:(done:number,total:number)=>void,preview=false):Promise<Uint8Array>{
 const selected=resolveSelection(ids,catalog.questions);if(!selected.length)throw Error('先选几道题吧。');if(selected.length>100)throw Error('一次最多下载100个选题单元，请分批下载。');
 const pdf=await PDFDocument.create();const font=await pdf.embedFont(StandardFonts.Helvetica);const bold=await pdf.embedFont(StandardFonts.HelveticaBold);const cache=new Map<string,PDFDocument>();
 const papers=new Map(catalog.papers.map(p=>[p.id,p]));const accent=banks[catalog.bank].color;const color=rgb(parseInt(accent.slice(1,3),16)/255,parseInt(accent.slice(3,5),16)/255,parseInt(accent.slice(5,7),16)/255);
 pdf.setTitle(`${banks[catalog.bank].name} Biology - ${role==='qp'?'Questions':'Answers'}`);pdf.setAuthor('Bill Huang');pdf.setSubject('Selected practice questions. Original source attribution retained.');
 if(!preview){const page=pdf.addPage([595.28,841.89]);page.drawRectangle({x:42,y:738,width:64,height:5,color});page.drawText('BIOLOGY',{x:42,y:690,size:28,font:bold,color});page.drawText(safe(banks[catalog.bank].name),{x:42,y:655,size:19,font});page.drawText(role==='qp'?'SELECTED PRACTICE QUESTIONS':'ANSWERS / MARK SCHEME',{x:42,y:593,size:16,font:bold});page.drawText(`${selected.length} question groups | ${selectedMarks(selected,catalog.questions)} marks | ~${expectedMinutes(selected,catalog.questions)} min`,{x:42,y:553,size:12,font});
 const lines=role==='qp'?['Name: __________________________________________','Class: __________________   Date: ________________','Answer only the selected parts. Original question numbers are retained.','Print at actual size to preserve scales and measurement questions.']:['Question group numbers match the question PDF.','Original mark scheme wording is retained.'];
 if(catalog.bank==='esat')lines.push('Historical NSAA Biology practice; not an official ESAT paper.',role==='ms'?'Official answer letters only; worked solutions are not supplied.':'Choose one answer for each question.');
 lines.push('Sources: '+(catalog.bank==='edexcel'?'Pearson Edexcel':catalog.bank==='aqa'?'AQA':catalog.bank==='cie'?'Cambridge International':'NSAA / Cambridge Assessment Admissions Testing')+'. Original rights retained.');
 lines.forEach((text,i)=>page.drawText(text,{x:42,y:470-i*35,size:10,font}));}
 const urls=[...new Set(selected.map(q=>q.assets?.[role].url).filter((u):u is string=>!!u))];
 let next=0;await Promise.all(Array.from({length:Math.min(4,urls.length)},async()=>{while(next<urls.length)await fetchAsset(urls[next++]);}));
 async function source(url:string){if(!cache.has(url))cache.set(url,await PDFDocument.load(await fetchAsset(url),{ignoreEncryption:true}));return cache.get(url)!;}
 async function append(url:string,segments:Region[],title:string,subtitle:string){const src=await source(url);const grouped=new Map<number,number[][]>();for(const s of segments){if(s.page<1||s.page>src.getPageCount())throw Error('题目页码有误，请联系维护者。');const box=s.box||[0,0,1,1];if(box.length!==4||box.some(x=>!Number.isFinite(x)||x<0||x>1)||box[2]<=box[0]||box[3]<=box[1])throw Error('题目范围有误，请联系维护者。');const arr=grouped.get(s.page)||[];if(!arr.some(b=>b.every((v,i)=>Math.abs(v-box[i])<1e-7)))arr.push(box);grouped.set(s.page,arr);}
 for(const [pn,boxes] of [...grouped].sort(([a],[b])=>a-b)){const original=src.getPage(pn-1);const rect=original.getCropBox();const x0=Math.min(...boxes.map(b=>b[0]))*rect.width+rect.x,x1=Math.max(...boxes.map(b=>b[2]))*rect.width+rect.x,y0=(1-Math.max(...boxes.map(b=>b[3])))*rect.height+rect.y,y1=(1-Math.min(...boxes.map(b=>b[1])))*rect.height+rect.y;
 const cw=x1-x0,ch=y1-y0,pw=Math.max(595.28,cw+40),ph=Math.max(841.89,ch+100);const page=pdf.addPage([pw,ph]);page.drawText(safe(title),{x:28,y:ph-25,size:12,font:bold,color});page.drawText(safe(subtitle).slice(0,115),{x:28,y:ph-42,size:8,font});page.drawLine({start:{x:28,y:ph-51},end:{x:pw-28,y:ph-51},thickness:.5,color});
 for(const b of boxes){const left=rect.x+b[0]*rect.width,right=rect.x+b[2]*rect.width,bottom=rect.y+(1-b[3])*rect.height,top=rect.y+(1-b[1])*rect.height;const embedded=await pdf.embedPage(original,{left,right,bottom,top});page.drawPage(embedded,{x:(pw-cw)/2+left-x0,y:ph-68-ch+bottom-y0,width:right-left,height:top-bottom});}
 page.drawText(`Page ${pdf.getPageCount()} | Original scale | ${role==='qp'?'Questions':'Answers'}`,{x:28,y:18,size:8,font});}}
 if(role==='ms'&&(catalog.bank==='esat'||catalog.bank==='cie'&&selected.every(q=>q.unit===1))){
  let answerPage:ReturnType<typeof pdf.addPage>|undefined,y=0;
  for(let i=0;i<selected.length;i++){
   const q=selected[i],p=papers.get(q.paper_id)!;const asset=q.assets?.ms;if(!asset)throw Error('题目文件未准备好。');const src=await source(asset.url);
   for(const region of mapped(asset,q.ms)){const original=src.getPage(region.page-1),rect=original.getCropBox(),b=region.box||[0,0,1,1];const left=rect.x+b[0]*rect.width,right=rect.x+b[2]*rect.width,bottom=rect.y+(1-b[3])*rect.height,top=rect.y+(1-b[1])*rect.height;const width=right-left,height=top-bottom;
    if(!answerPage||y-height<48){answerPage=pdf.addPage([Math.max(595.28,width+330),841.89]);answerPage.drawText('BIOLOGY — ANSWER KEY'.replace('—','-'),{x:36,y:799,size:18,font:bold,color});answerPage.drawText(catalog.bank==='cie'?'Original answer rows | Cambridge Biology 9700':'Original answer rows | NSAA Biology',{x:36,y:777,size:9,font});y=740;}
    answerPage.drawText(`${i+1}. ${safe(p.title)} | ${safe(q.label)}`,{x:36,y:y-12,size:10,font});const embedded=await pdf.embedPage(original,{left,right,bottom,top});answerPage.drawPage(embedded,{x:answerPage.getWidth()-width-40,y:y-height,width,height});y-=Math.max(34,height+16);
   }progress?.(i+1,selected.length);
  }return pdf.save();
 }
 if(role==='ms'&&!preview){for(const pid of new Set(selected.map(q=>q.paper_id))){const p=papers.get(pid)!;if(p.general_ms?.length&&p.guidance_asset)await append(p.guidance_asset.url,mapped(p.guidance_asset,p.general_ms),'Marking guidance',`${p.title} | ${p.code}`);}}
 for(let i=0;i<selected.length;i++){const q=selected[i],p=papers.get(q.paper_id);if(!p)throw Error('原题信息不完整。');const regions=[...q[role]];if(role==='qp')for(const d of q.dependencies||[])if(d.kind!=='requires_answer')regions.push(...d.qp||[]);
 const asset=q.assets?.[role];if(!asset)throw Error('题目文件未准备好。');await append(asset.url,mapped(asset,regions),`Question group ${i+1}`,`${p.title} | ${p.code} | Original ${q.label} | ${q.marks} marks | ~${q.expected_seconds/60} min`);progress?.(i+1,selected.length);}
 return pdf.save();
}
