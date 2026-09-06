import Page from '@/app/projects/page';
import { LocaleProvider } from '@/components/site-context';
export const metadata = { title: '科研项目 | Bill Huang', description: '酶工程、蛋白质制备与抗菌研究项目。', alternates: { canonical: 'https://betoadfish.github.io/zh/projects', languages: { en: 'https://betoadfish.github.io/projects', 'zh-CN': 'https://betoadfish.github.io/zh/projects' } } };
export default function ChineseResearch() { return <LocaleProvider locale="zh"><div lang="zh-CN"><Page/></div></LocaleProvider>; }
