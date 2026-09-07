import Page from '@/app/page';
import { LocaleProvider } from '@/components/site-context';
export const metadata = { title: 'Bill Huang | 个人主页', description: '生物化学、酶工程、抗菌研究与生物技术分析。', alternates: { canonical: 'https://betoadfish.github.io/zh', languages: { en: 'https://betoadfish.github.io/', 'zh-CN': 'https://betoadfish.github.io/zh' } } };
export default function ChineseHome() { return <LocaleProvider locale="zh"><div lang="zh-CN"><Page/></div></LocaleProvider>; }
