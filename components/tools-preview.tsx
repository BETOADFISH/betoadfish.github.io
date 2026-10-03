'use client';

import { useState } from 'react';
import { BookOpen, Check, FileDown, ListFilter } from 'lucide-react';
import { Copy, SiteLink, useSite } from './site-context';
import { t } from '@/lib/bilingual';

const steps = [
  { icon: ListFilter, label: t('Choose questions', '选择题目'), title: t('Start with the material you want to practise.', '先确定要练什么。'), note: t('Choose an exam board and topic, then inspect each question before adding it to your paper.', '选择考试局与知识点，预览题目后加入练习卷。') },
  { icon: FileDown, label: t('Make a paper', '生成练习'), title: t('Take a focused set of questions away.', '把选好的题目带走练习。'), note: t('Download a question paper with its matching mark scheme. The selected questions stay together in the export.', '下载题目卷和对应评分标准，导出内容与已选题目对应。') },
  { icon: Check, label: t('Review the answers', '核对答案'), title: t('Check where the marks come from.', '看清每一分要求什么。'), note: t('Use the matching mark scheme after practice, then return to the topics that need another attempt.', '完成练习后对照评分标准，找出需要再练的知识点。') },
];

export function ToolsPreview() {
  const [active, setActive] = useState(0);
  const { locale } = useSite();
  const step = steps[active];
  return <section className="tools-preview theme-tools" aria-label={locale === 'zh' ? '练习流程预览' : 'Practice workflow preview'}>
    <div className="tools-preview-copy"><h2><Copy>{t('From a topic to a practice paper.', '从知识点到一份练习卷。')}</Copy></h2><fieldset className="tools-preview-steps" aria-label={locale === 'zh' ? '查看练习步骤' : 'Inspect practice steps'}>{steps.map((item, index) => { const Icon = item.icon; return <button type="button" key={index} aria-pressed={active === index} onClick={() => setActive(index)}><Icon size={18}/><Copy>{item.label}</Copy></button>; })}</fieldset><div className="tools-preview-detail" aria-live="polite"><h3><Copy>{step.title}</Copy></h3><p><Copy>{step.note}</Copy></p></div><SiteLink className="tools-preview-link" href="/tools/biology"><BookOpen size={17}/><Copy>{t('Open the question bank', '打开题库')}</Copy></SiteLink></div>
    <div className="practice-paper-scene" data-step={active} aria-hidden="true"><div className="practice-paper answer-paper"><span><Copy>{t('Mark scheme', '评分标准')}</Copy></span>{[0, 1, 2].map(index => <div className="preview-answer" key={index}><Check size={15}/><i/></div>)}</div><div className="practice-paper question-paper"><span><Copy>{t('Practice paper', '练习卷')}</Copy></span><div className="paper-title-line"/>{[0, 1, 2].map(index => <div className="preview-question" key={index}><b>{index + 1}</b><div><i/><i/><i/></div></div>)}</div><span className="paper-scene-caption"><Copy>{t('Workflow preview', '流程预览')}</Copy></span></div>
  </section>;
}
