import Page from '@/app/intelligence/3d-cell-culture/page';
import { LocaleProvider } from '@/components/site-context';
export const metadata = { title: '三维细胞培养 | Bill Huang', description: '三维细胞培养平台的技术尽职调查。', alternates: { canonical: 'https://betoadfish.github.io/zh/intelligence/3d-cell-culture', languages: { en: 'https://betoadfish.github.io/intelligence/3d-cell-culture', 'zh-CN': 'https://betoadfish.github.io/zh/intelligence/3d-cell-culture' } } };
export default function ChineseCulture() { return <LocaleProvider locale="zh"><div lang="zh-CN"><Page/></div></LocaleProvider>; }
