import Page from '@/app/intelligence/page';
import { LocaleProvider } from '@/components/site-context';
export const metadata = { title: '生物技术分析 | Bill Huang', description: '评估新兴生物技术的科学依据与实际应用。', alternates: { canonical: 'https://betoadfish.github.io/zh/intelligence', languages: { en: 'https://betoadfish.github.io/intelligence', 'zh-CN': 'https://betoadfish.github.io/zh/intelligence' } } };
export default function ChineseIntelligence() { return <LocaleProvider locale="zh"><div lang="zh-CN"><Page/></div></LocaleProvider>; }
