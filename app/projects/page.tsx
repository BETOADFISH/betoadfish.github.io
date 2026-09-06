import { WorkGrid } from '@/components/work-grid';
export const metadata = { title: 'Research | Bill Huang', description: 'Projects in enzyme engineering, protein production and antimicrobial research.' };
export default function Directory() { return <main className="wrap directory-page"><p className="eyebrow">Research</p><h1>Experiments and the decisions behind them.</h1><p className="directory-intro">Projects in enzyme engineering, protein production and antimicrobial research.</p><WorkGrid category="Research"/></main>; }
