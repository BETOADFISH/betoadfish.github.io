import { SiteShell } from '@/components/site-shell';
import type { Metadata } from 'next';
import '@fontsource/inter/latin-400.css';
import '@fontsource/inter/latin-500.css';
import '@fontsource/inter/latin-600.css';
import '@fontsource/inter/latin-700.css';
import './globals.css';
export const metadata: Metadata = {
  title: 'Bill Huang | Profile',
  description:
    'Bill Huang’s work in enzyme engineering, antimicrobial research and biotechnology assessment, with experimental data and interactive molecular structures.',
  icons: { icon: '/favicon.svg' },
  alternates: { canonical: 'https://betoadfish.github.io/', languages: { en: 'https://betoadfish.github.io/', 'zh-CN': 'https://betoadfish.github.io/zh' } },
};
const appearanceScript = `(function(){try{var t=localStorage.getItem('bill-theme');document.documentElement.dataset.theme=t==='dark'||(t!=='light'&&matchMedia('(prefers-color-scheme: dark)').matches)?'dark':'light';var m=localStorage.getItem('bill-motion');document.documentElement.dataset.motion=m==='paused'||(m!=='playing'&&matchMedia('(prefers-reduced-motion: reduce)').matches)?'paused':'playing';document.documentElement.lang=location.pathname.split('/')[1]==='zh'?'zh-CN':'en';if(location.pathname==='/'&&localStorage.getItem('bill-language')==='zh'){location.replace('/zh'+location.search+location.hash)}}catch(e){}})()`;
export default function RootLayout({children}: Readonly<{children: React.ReactNode}>) {
  return <html lang="en" suppressHydrationWarning><head><script dangerouslySetInnerHTML={{__html:appearanceScript}}/></head><body><SiteShell>{children}</SiteShell></body></html>;
}
