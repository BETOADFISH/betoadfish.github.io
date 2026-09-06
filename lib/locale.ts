import chinese from './zh.json';
export type Locale = 'en' | 'zh';
const dictionary: Record<string, string> = chinese;
const templates = Object.entries(dictionary).filter(([key]) => key.includes('${')).map(([key, value]) => {
  const names = [...key.matchAll(/\$\{([^}]+)\}/g)].map(m => m[1]);
  const parts = key.split(/\$\{[^}]+\}/).map(s => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'));
  return { expression: new RegExp(`^${parts.join('(.+?)')}$`), names, value };
});
export function translate(value: string, locale: Locale) {
  if (locale === 'en') return value;
  const key = value.replace(/\s+/g, ' ').trim();
  let result = dictionary[key];
  if (result === undefined) {
    for (const template of templates) {
      const match = key.match(template.expression);
      if (match) { result = template.value.replace(/\$\{([^}]+)\}/g, (_, name) => match[template.names.indexOf(name) + 1] || ''); break; }
    }
  }
  return result === undefined ? value : `${/^\s/.test(value) ? ' ' : ''}${result}${/\s$/.test(value) ? ' ' : ''}`;
}
export function localizedPath(path: string, locale: Locale) {
  if (!path.startsWith('/') || path.startsWith('//') || /^\/(downloads|data|evidence|structures|_next)\b/.test(path) || /\.[a-z0-9]+(?:[?#]|$)/i.test(path)) return path;
  const base = path.replace(/^\/zh(?=\/|$|[?#])/, '') || '/';
  const [, route, suffix] = base.match(/^([^?#]*)(.*)$/)!;
  const clean = route.replace(/\/+$/, '') || '/';
  return (locale === 'zh' ? `/zh${clean === '/' ? '' : clean}` : clean) + suffix;
}
