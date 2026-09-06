import Page from '@/app/projects/hubisco/page';
import { LocaleProvider } from '@/components/site-context';
export const metadata = { title: 'HuBisCO | Bill Huang', description: '替代底物研究、结构假设与生化实验。', alternates: { canonical: 'https://betoadfish.github.io/zh/projects/hubisco', languages: { en: 'https://betoadfish.github.io/projects/hubisco', 'zh-CN': 'https://betoadfish.github.io/zh/projects/hubisco' } } };
export default function ChineseHuBisCO() { return <LocaleProvider locale="zh"><div lang="zh-CN"><Page/></div></LocaleProvider>; }
