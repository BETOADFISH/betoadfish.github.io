'use client';
import {useState} from 'react';
import {randomPaper} from '@/lib/random-paper';
import type {Question} from '@/lib/question-bank';

export function RandomPaper({questions,zh,year,unit,topics,qualification,onSelect}:{questions:Question[];zh:boolean;year:string;unit:string;topics:string[];qualification:string;onSelect:(ids:string[])=>void}){
 const [mode,setMode]=useState<'marks'|'minutes'>('marks'),[target,setTarget]=useState('30'),[notice,setNotice]=useState('');
 const t=(en:string,cn:string)=>zh?cn:en;
 function generate(){try{const result=randomPaper(questions,{target:Number(target),mode,topics,year,unit,qualification});onSelect(result.ids);setNotice(zh?`已选 ${result.marks} 分，预计 ${result.minutes} 分钟。${result.exact?'':'当前筛选下无法正好凑齐，已选取不超过目标的最接近组合。'}`:`Selected ${result.marks} marks, about ${result.minutes} minutes.${result.exact?'':' Closest available within the target; broaden filters to try again.'}`);}catch(e){setNotice(zh?(e as Error).message:'No suitable selection. Increase the target or broaden the filters.');}}
 return <details className="qb-random"><summary>{t('Random practice','随机组卷')}</summary><div className="qb-random-controls"><label>{t('Target','目标')}<select value={mode} onChange={e=>setMode(e.target.value as 'marks'|'minutes')}><option value="marks">{t('Total marks','总分')}</option><option value="minutes">{t('Expected time · minutes','预计时间 · 分钟')}</option></select></label><label>{t(mode==='marks'?'Marks':'Minutes',mode==='marks'?'分数':'分钟')}<input type="number" min="1" max="600" value={target} onChange={e=>setTarget(e.target.value)}/></label></div><p className="qb-random-note">{t('Uses the filters above. Generating a paper replaces your current selection.','按上方的知识点、年份和试卷范围选题。生成后会替换当前选题。')}</p><button className="qb-primary" onClick={generate} disabled={!questions.length}>{t('Generate paper','生成试卷')}</button><p role="status">{notice}</p></details>;
}
