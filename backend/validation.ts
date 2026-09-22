import type {Question,Region} from '../lib/question-bank';
export class ValidationError extends Error {}
export function validatePatch(input:unknown,base:Question){
 if(!input||typeof input!=='object'||Array.isArray(input))throw new ValidationError('修改内容格式不正确。');
 const value=input as Record<string,unknown>;const out:Record<string,unknown>={};
 for(const key of Object.keys(value))if(!['summary','topics','chapters','skills','marks','expected_seconds','qp','ms'].includes(key))throw new ValidationError('包含不支持修改的字段。');
 if('summary' in value){if(typeof value.summary!=='string'||!value.summary.trim()||value.summary.length>180)throw new ValidationError('题目简述需要1–180个字符。');out.summary=value.summary.trim();}
 for(const k of ['topics','chapters','skills'])if(k in value){const list=value[k];if(!Array.isArray(list)||list.length>20||list.some(x=>typeof x!=='string'||!x.trim()||x.length>120))throw new ValidationError('标签格式不正确。');out[k]=[...new Set(list)];}
 if('marks' in value){if(!Number.isInteger(value.marks)||(value.marks as number)<0||(value.marks as number)>100)throw new ValidationError('分值需要是0–100之间的整数。');if(base.bank==='esat'&&value.marks!==1)throw new ValidationError('ESAT单选练习每题1分。');if(!base.is_leaf&&value.marks!==base.marks)throw new ValidationError('完整大题的分值由小题合计，请修改对应小题。');out.marks=value.marks;}
 if('expected_seconds' in value){const seconds=value.expected_seconds as number;if(!Number.isInteger(seconds)||seconds<15||seconds>36000||seconds%15)throw new ValidationError('预计用时请按15秒递增，范围15秒至600分钟。');if(!base.is_leaf&&seconds!==base.expected_seconds)throw new ValidationError('完整大题用时由小题合计。');out.expected_seconds=seconds;}
 for(const role of ['qp','ms'] as const)if(role in value){const segments=value[role];const pages=new Set(base[role].map(s=>s.page));if(!Array.isArray(segments)||!segments.length||segments.length>30)throw new ValidationError('至少保留一个题目区域。');
 out[role]=segments.map((seg:Region)=>{if(!seg||!Number.isInteger(seg.page)||!pages.has(seg.page)||!Array.isArray(seg.box)||seg.box.length!==4||seg.box.some(x=>typeof x!=='number'||!Number.isFinite(x)||x<0||x>1)||seg.box[0]>=seg.box[2]||seg.box[1]>=seg.box[3])throw new ValidationError('裁切范围不正确。页码只能使用已核查的原页。');return{page:seg.page,box:seg.box};});}
 return out;
}
