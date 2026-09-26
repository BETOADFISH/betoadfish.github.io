'use client';
import { Copy, SiteLink } from '@/components/site-context';
import { t } from '@/lib/bilingual';
import { InstitutionMark } from './institution-mark';
import { ReadingProgress } from './reading-progress';
import type { ReactNode } from 'react';
import type { CopyText } from '@/lib/bilingual';
export function CaseShell({ theme, title, subtitle, role, date, institution, summary, children, category = 'Research' }: {
    theme: string;
    title: CopyText;
    subtitle: CopyText;
    role: CopyText;
    date: CopyText;
    institution: CopyText;
    summary: CopyText;
    children: ReactNode;
    category?: string;
}) {
    return <main className={`project-page theme-${theme}`}><ReadingProgress/><header className="case-masthead"><div className="wrap"><div className="case-brand-row"><SiteLink className="back-link" href={category === 'Research' ? '/projects' : '/intelligence'}>← <Copy>{category}</Copy></SiteLink><div className="case-institution"><InstitutionMark theme={theme}/></div></div><p className="eyebrow"><Copy>{category}</Copy> / <Copy>{date}</Copy></p><h1><Copy>{title}</Copy></h1><h2><Copy>{subtitle}</Copy></h2><p className="case-deck"><Copy>{summary}</Copy></p><div className="case-reading-links"><a href="#intro"><Copy>{t('Project background','项目背景')}</Copy></a><a href="#journey"><Copy>{t('Methods and results','方法与结果')}</Copy><span aria-hidden="true">↓</span></a></div><div className="case-facts"><div><span><Copy>{"Role"}</Copy></span><b><Copy>{role}</Copy></b></div><div><span><Copy>{"Setting"}</Copy></span><b><Copy>{institution}</Copy></b></div><div><span><Copy>{"Period"}</Copy></span><b><Copy>{date}</Copy></b></div></div></div></header><div className="wrap case-content"><Copy>{children}</Copy><div className="case-end"><SiteLink href={category === 'Research' ? '/projects' : '/intelligence'}><Copy>{"\u2190 Browse"}</Copy>{' '}<Copy>{category.toLowerCase()}</Copy></SiteLink><SiteLink href="mailto:zh392@cam.ac.uk"><Copy>{"Discuss this work \u2197"}</Copy></SiteLink></div></div></main>;
}
