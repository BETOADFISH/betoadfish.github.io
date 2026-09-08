'use client';
import { useEffect, useState, type ReactNode } from 'react';
import { usePathname } from 'next/navigation';
import { Moon, Sun, Languages, Pause, Play } from 'lucide-react';
import { SiteContext } from './site-context';
import { localizedPath, translate, type Locale } from '@/lib/locale';

export function SiteShell({ children }: { children: ReactNode }) {
  const currentPath = usePathname() || '/';
  const pathname = currentPath.includes('__vinext_nonexistent_for_404__') ? '/' : currentPath;
  const locale: Locale = /^\/zh(?:\/|$)/.test(pathname) ? 'zh' : 'en';
  const [dark, setDark] = useState(false);
  const [motionPaused,setMotionState]=useState(false);
  const tr = (text: string) => translate(text, locale);
  const href = (path: string) => localizedPath(path, locale);
  useEffect(() => {
    const media = window.matchMedia('(prefers-color-scheme: dark)');
    const apply = () => {
      let saved: string | null = null;
      try { saved = localStorage.getItem('bill-theme'); } catch {}
      const next = saved === 'dark' || (saved !== 'light' && media.matches);
      document.documentElement.dataset.theme = next ? 'dark' : 'light';
      setDark(next);
    };
    apply();
    document.documentElement.lang = locale === 'zh' ? 'zh-CN' : 'en';
    media.addEventListener('change', apply);
    return () => media.removeEventListener('change', apply);
  }, [locale]);
  function toggleTheme() {
    const next = !dark;
    document.documentElement.dataset.theme = next ? 'dark' : 'light';
    try { localStorage.setItem('bill-theme', next ? 'dark' : 'light'); } catch {}
    setDark(next);
  }
  useEffect(()=>{
    const preference=window.matchMedia('(prefers-reduced-motion: reduce)');
    const apply=()=>{let saved:string|null=null;try{saved=localStorage.getItem('bill-motion');}catch{}const paused=saved==='paused'||(saved!=='playing'&&preference.matches);setMotionState(paused);document.documentElement.dataset.motion=paused?'paused':'playing';};
    apply();preference.addEventListener('change',apply);return()=>preference.removeEventListener('change',apply);
  },[]);
  function setMotionPaused(paused:boolean){setMotionState(paused);document.documentElement.dataset.motion=paused?'paused':'playing';try{localStorage.setItem('bill-motion',paused?'paused':'playing');}catch{}}
  const otherLocale = locale === 'en' ? 'zh' : 'en';
  return <SiteContext.Provider value={{ locale, dark, motionPaused, setMotionPaused }}>
    <a className="skip-link" href="#main-content">{tr('Skip to content')}</a>
    <header className="site-header"><div className="wrap header-inner">
      <a className="brand" href={href('/')}>Bill<span className="brand-dot">.</span><span className="brand-caption">{tr('Profile')}</span></a>
      <nav aria-label={tr('Main navigation')}>
        <a href={href('/projects')} aria-current={pathname.includes('/projects')?'page':undefined}>{tr('Research')}</a><a href={href('/intelligence')} aria-current={pathname.includes('/intelligence')?'page':undefined}>{tr('Biotech intelligence')}</a><a href={href('/#about')}>{tr('About')}</a><a href="#contact">{tr('Contact')}</a>
      </nav>
      <div className="site-preferences" aria-label={tr('Reading preferences')}>
        <button className="preference-control motion-switch" onClick={()=>setMotionPaused(!motionPaused)} aria-pressed={motionPaused} aria-label={locale==='zh'?(motionPaused?'播放页面动效':'暂停页面动效'):(motionPaused?'Play page motion':'Pause page motion')} title={locale==='zh'?(motionPaused?'播放页面动效':'暂停页面动效'):(motionPaused?'Play page motion':'Pause page motion')}>{motionPaused?<Play size={16}/>:<Pause size={16}/>}</button>
        <button className="preference-control theme-switch" onClick={toggleTheme} aria-label={tr(dark ? 'Switch to light mode' : 'Switch to dark mode')} aria-pressed={dark} title={tr(dark ? 'Switch to light mode' : 'Switch to dark mode')}><Sun className="sun-icon" size={18}/><Moon className="moon-icon" size={18}/></button>
        <a className="preference-control language-switch" href={localizedPath(pathname, otherLocale)} lang={otherLocale === 'zh' ? 'zh-CN' : 'en'} hrefLang={otherLocale === 'zh' ? 'zh-CN' : 'en'} aria-label={locale === 'en' ? '切换到中文' : 'Switch to English'} onClick={e => { try { localStorage.setItem('bill-language', otherLocale); } catch {} e.currentTarget.href = localizedPath(window.location.pathname, otherLocale) + window.location.search + window.location.hash; }}><Languages size={17}/><span>{locale === 'en' ? '中文' : 'EN'}</span></a>
      </div>
    </div></header>
    <div id="main-content">{children}</div>
    <footer id="contact"><div className="wrap"><div className="contact-row"><div><p className="eyebrow">{tr('Let’s connect')}</p><h2>{tr('Research opportunities')}<br/>{tr('and biotechnology discussions.')}</h2></div><div><p>{tr('Research · Biotech R&D · Strategy')}</p><p className="small">{tr('For research opportunities and biotechnology conversations.')}</p><div className="contact-links"><a href="mailto:zh392@cam.ac.uk">zh392@cam.ac.uk ↗</a><a href="https://www.linkedin.com/in/bill-huang-bb0160302/" target="_blank" rel="noreferrer">LinkedIn ↗</a><a href="/downloads/Bill-Huang-CV.pdf" download>{tr('Download CV ↓')}</a></div></div></div><div className="footer-bottom"><span><b>Bill.</b> {tr('Molecular Science & Biotech Intelligence')}</span><span>{tr('© 2026 Bill Huang · Independent portfolio')}</span></div></div></footer>
  </SiteContext.Provider>;
}
