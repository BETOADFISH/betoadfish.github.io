'use client';
import {useEffect,useState} from 'react';
export function ReadingProgress(){
 const [progress,setProgress]=useState(0);
 useEffect(()=>{let frame=0;const update=()=>{cancelAnimationFrame(frame);frame=requestAnimationFrame(()=>{const total=document.documentElement.scrollHeight-innerHeight;setProgress(total>0?Math.min(1,Math.max(0,scrollY/total)):0);});};update();addEventListener('scroll',update,{passive:true});addEventListener('resize',update);return()=>{cancelAnimationFrame(frame);removeEventListener('scroll',update);removeEventListener('resize',update);};},[]);
 return <div aria-hidden="true" className="case-reading-progress" style={{transform:`scaleX(${progress})`}}/>;
}
