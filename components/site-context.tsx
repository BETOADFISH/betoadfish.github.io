'use client';
import { createContext, useContext, type ReactNode, type ComponentProps } from 'react';
import { translate, localizedPath, type Locale } from '@/lib/locale';
import type { Bilingual } from '@/lib/bilingual';
export const SiteContext = createContext({ locale: 'en' as Locale, dark: false, motionPaused:false, setMotionPaused:(_paused:boolean)=>{} });
export function useSite() {
  const settings = useContext(SiteContext);
  return { ...settings, tr: (text: string) => translate(text, settings.locale), href: (path: string) => localizedPath(path, settings.locale) };
}
export function LocaleProvider({ locale, children }: { locale: Locale; children: ReactNode }) {
  const settings = useContext(SiteContext);
  return <SiteContext.Provider value={{ ...settings, locale }}>{children}</SiteContext.Provider>;
}
export function Copy({ children }: { children: ReactNode | Bilingual }) {
  const { tr, locale } = useSite();
  if (children && typeof children === 'object' && 'en' in children && 'zh' in children) return <>{children[locale]}</>;
  return <>{typeof children === 'string' ? tr(children) : children}</>;
}
export function SiteLink({ href = '', ...props }: ComponentProps<'a'>) {
  const site = useSite();
  return <a href={site.href(href)} {...props} />;
}
