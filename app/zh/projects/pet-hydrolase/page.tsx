import Page from '@/app/projects/pet-hydrolase/page';
import { LocaleProvider } from '@/components/site-context';
export const metadata = { title: 'PET 水解酶 | Bill Huang', description: '蛋白质表达与纯化，以及 CCH11 实验曲线。', alternates: { canonical: 'https://betoadfish.github.io/zh/projects/pet-hydrolase', languages: { en: 'https://betoadfish.github.io/projects/pet-hydrolase', 'zh-CN': 'https://betoadfish.github.io/zh/projects/pet-hydrolase' } } };
export default function ChinesePET() { return <LocaleProvider locale="zh"><div lang="zh-CN"><Page/></div></LocaleProvider>; }
