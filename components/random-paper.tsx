'use client';
import {useState} from 'react';
import {randomPaper} from '@/lib/random-paper';
import type {Question} from '@/lib/question-bank';

export function RandomPaper({questions,zh,year,unit,topics,qualification,onSelect}:{questions:Question[];zh:boolean;year:string;unit:string;topics:string[];qualification:string;onSelect:(ids:string[])=>void}){
 const [mode,setMode]=useState<'marks'|'minutes'>('marks'),[target,setTarget]=useState('30'),[notice,setNotice]=useState('');
 const t=(en:string,cn:string)=>zh?cn:en;
 function generate(){try{const result=randomPaper(questions,{target:Number(target),mode,topics,year,unit,qualification});onSelect(result.ids);setNotice(zh?`已选 ${result.marks} 分，预计 ${result.minutes} 分钟。${result.exact?'':'已尽量接近目标，可放宽筛选再试。'}`:`Selected ${result.marks} marks, about ${result.minutes} minutes.${result.exact?'':' Closest available within the target; broaden filters to try again.'}`);}catch(e){setNotice(zh?(e as Error).message:'No suitable selection. Increase the target or broaden the filters.');}}
 return <details className="qb-random"><summary>{t('Random practice','随机组卷')}</summary><div className="qb-random-controls"><label>{t('Target','目标')}<select value={mode} onChange={e=>setMode(e.target.value as 'marks'|'minutes')}><option value="marks">{t('Total marks','总分')}</option><option value="minutes">{t('Expected time · minutes','预计时间 · 分钟')}</option></select></label><label>{t('Amount','数值')}<input type="number" min="1" max="600" value={target} onChange={e=>setTarget(e.target.value)}/></label></div><p className="qb-random-note">{t('Uses topic, year, level and paper filters. Adds up marks or expected time.','沿用知识点、年份、阶段和卷型筛选，累加分数或预计用时。')}</p><button className="qb-primary" onClick={generate} disabled={!questions.length}>{t('Generate · replace selection','随机生成 · 替换当前选题')}</button><p role="status">{notice}</p></details>;
}
