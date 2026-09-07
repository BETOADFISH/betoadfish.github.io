export type Bilingual = { en: string; zh: string };
export type CopyText = string | Bilingual;
export const t = (en: string, zh: string): Bilingual => ({ en, zh });
