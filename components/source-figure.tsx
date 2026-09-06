'use client';
import { Copy, SiteLink, useSite } from '@/components/site-context';
export function SourceFigure({ src, title, caption, source, notes }: {
    src: string;
    title: string;
    caption: string;
    source: string;
    notes: string;
}) {
    const { tr } = useSite();
    return <figure className="source-figure"><div className="figure-heading"><h3><Copy>{title}</Copy></h3><SiteLink href={src} target="_blank" rel="noreferrer"><Copy>{"Open full image \u2197"}</Copy></SiteLink></div><SiteLink className="figure-image" href={src} target="_blank" rel="noreferrer" aria-label={tr(`Open full image: ${tr(title)}`)}><img src={src} alt={tr(caption)} loading="lazy"/></SiteLink><figcaption><Copy>{caption}</Copy></figcaption><details><summary><Copy>{"Conditions and source"}</Copy></summary><p><Copy>{notes}</Copy></p><p className="small muted"><Copy>{source}</Copy></p></details></figure>;
}
