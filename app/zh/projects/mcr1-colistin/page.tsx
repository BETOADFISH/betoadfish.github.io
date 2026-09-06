import Page from '@/app/projects/mcr1-colistin/page';
import { LocaleProvider } from '@/components/site-context';
export const metadata = { title: '多黏菌素 E 增效剂 | Bill Huang', description: '抗菌组合实验与膜通透性测定。', alternates: { canonical: 'https://betoadfish.github.io/zh/projects/mcr1-colistin', languages: { en: 'https://betoadfish.github.io/projects/mcr1-colistin', 'zh-CN': 'https://betoadfish.github.io/zh/projects/mcr1-colistin' } } };
export default function ChineseColistin() { return <LocaleProvider locale="zh"><div lang="zh-CN"><Page/></div></LocaleProvider>; }
