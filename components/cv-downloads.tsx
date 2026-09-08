 'use client';
import { Download } from 'lucide-react';
import { useSite } from './site-context';
export function CVDownloads({compact=false}:{compact?:boolean}){const {locale}=useSite();return <div className={`cv-downloads ${compact?'compact':''}`} aria-label={locale==='zh'?'简历下载':'Download CVs'}>{['research','commercial'].map(kind=><a className={compact?'':'button primary'} key={kind} href={`/downloads/Bill-Huang-${locale}-${kind}.pdf`} download><span>{locale==='zh'?(kind==='research'?'科研简历':'商业简历'):(kind==='research'?'Research CV':'Commercial CV')}</span><Download size={16}/></a>)}</div>;}
