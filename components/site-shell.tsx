'use client';
import { CVDownloads } from './cv-downloads';
import { useEffect, useRef, useState, type ReactNode } from 'react';
import { usePathname } from 'next/navigation';
import { Moon, Sun, Languages, Menu, X } from 'lucide-react';
import { SiteContext } from './site-context';
import { localizedPath, translate, type Locale } from '@/lib/locale';

export function SiteShell({ children }: { children: ReactNode }) {
  const currentPath = usePathname() || '/';
  const pathname = currentPath.includes('__vinext_nonexistent_for_404__') ? '/' : currentPath;
  const locale: Locale = /^\/zh(?:\/|$)/.test(pathname) ? 'zh' : 'en';
  const [menuOpen,setMenuOpen]=useState(false);const menuButton=useRef<HTMLButtonElement>(null);const header=useRef<HTMLElement>(null);
  useEffect(()=>setMenuOpen(false),[pathname]);
  useEffect(()=>{
    if(!menuOpen)return;
    const outside=(event:PointerEvent)=>{if(event.target instanceof Node&&!header.current?.contains(event.target))setMenuOpen(false);};
    const escape=(event:KeyboardEvent)=>{if(event.key==='Escape'){setMenuOpen(false);menuButton.current?.focus();}};
    const desktop=window.matchMedia('(min-width: 721px)');
    const resize=()=>{if(desktop.matches)setMenuOpen(false);};
    document.addEventListener('pointerdown',outside);document.addEventListener('keydown',escape);desktop.addEventListener('change',resize);
    return()=>{document.removeEventListener('pointerdown',outside);document.removeEventListener('keydown',escape);desktop.removeEventListener('change',resize);};
  },[menuOpen]);
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
    const apply=()=>{setMotionState(preference.matches);document.documentElement.dataset.motion=preference.matches?'paused':'playing';};
    apply();preference.addEventListener('change',apply);return()=>preference.removeEventListener('change',apply);
  },[]);
  const otherLocale = locale === 'en' ? 'zh' : 'en';
  return <SiteContext.Provider value={{ locale, dark, motionPaused }}>
    <a className="skip-link" href="#main-content">{tr('Skip to content')}</a>
    <header className="site-header" ref={header}><div className="wrap header-inner">
      <a className="brand" href={href('/')}>Bill<span className="brand-dot">.</span><span className="brand-caption">{tr('Profile')}</span></a>
      <nav id="site-navigation" className={menuOpen?'is-open':''} aria-label={tr('Main navigation')} onClick={()=>setMenuOpen(false)}>
        <a href={href('/projects')} aria-current={pathname.includes('/projects')?'page':undefined}>{tr('Research')}</a><a href={href('/intelligence')} aria-current={pathname.includes('/intelligence')?'page':undefined}>{tr('Biotech intelligence')}</a><a href={href('/tools')} aria-current={pathname.includes('/tools')?'page':undefined}>{locale === 'zh' ? '工具' : 'Tools'}</a><a href={href('/#about')}>{tr('About')}</a><a href="#contact">{tr('Contact')}</a>
      </nav>
      <div className="site-preferences" aria-label={tr('Reading preferences')}>
        <button className="preference-control theme-switch" onClick={toggleTheme} aria-label={tr(dark ? 'Switch to light mode' : 'Switch to dark mode')} aria-pressed={dark} title={tr(dark ? 'Switch to light mode' : 'Switch to dark mode')}><Sun className="sun-icon" size={18}/><Moon className="moon-icon" size={18}/></button>
        <a className="preference-control language-switch" href={localizedPath(pathname, otherLocale)} lang={otherLocale === 'zh' ? 'zh-CN' : 'en'} hrefLang={otherLocale === 'zh' ? 'zh-CN' : 'en'} aria-label={locale === 'en' ? '切换到中文' : 'Switch to English'} onClick={e => { try { localStorage.setItem('bill-language', otherLocale); } catch {} e.currentTarget.href = localizedPath(window.location.pathname, otherLocale) + window.location.search + window.location.hash; }}><Languages size={17}/><span>{locale === 'en' ? '中文' : 'EN'}</span></a>
      </div>
      <button ref={menuButton} className="preference-control mobile-menu-toggle" aria-expanded={menuOpen} aria-controls="site-navigation" aria-label={locale==='zh'?(menuOpen?'关闭菜单':'打开菜单'):(menuOpen?'Close menu':'Open menu')} onClick={()=>setMenuOpen(v=>!v)}>{menuOpen?<X size={21}/>:<Menu size={21}/>}</button>
    </div></header>
    <div id="main-content">{children}</div>
    <footer id="contact"><div className="wrap"><div className="contact-row"><div><h2>{locale==='zh'?'联系我':'Contact'}</h2><p className="small">{locale==='zh'?'如果你想聊项目、研究机会或生物教学，可以给我写信。':'Write to me about a project, research opportunity or biology teaching.'}</p></div><div><div className="contact-links"><a href="mailto:zh392@cam.ac.uk">zh392@cam.ac.uk</a><a href="https://www.linkedin.com/in/bill-huang-bb0160302/" target="_blank" rel="noreferrer">LinkedIn</a><CVDownloads compact/></div></div></div><div className="footer-bottom"><span>Bill Huang</span><span>© 2026</span></div><details className="site-privacy small"><summary>{locale==='zh'?'访问统计与隐私':'Visits and privacy'}</summary><p>{locale==='zh'?'本站匿名统计页面访问、可见时长与题库操作，使用临时标签页编号，记录保留 90 天。不向统计接口发送身份、搜索内容、题目编号或来源网址。浏览器的 Do Not Track 或 Global Privacy Control 开启时不发送统计。':'This site counts anonymous page visits, visible time and question-bank actions using a temporary tab ID. Events are kept for 90 days. Identity, search text, question IDs and referring URLs are not sent to the analytics endpoint. Do Not Track and Global Privacy Control disable collection.'}</p></details></div></footer>
  </SiteContext.Provider>;
}
