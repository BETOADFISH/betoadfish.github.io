 'use client';
import { Copy, SiteLink, useSite } from '@/components/site-context';
import type { CopyText } from '@/lib/bilingual';
import { useId, type CSSProperties } from 'react';
export type FigureCrop = { width: number; height: number; box: [number, number, number, number] };
export function SourceFigure({ src, title, caption, source, notes, crop }: {
  src: string; title: CopyText; caption: CopyText; source: CopyText; notes: CopyText; crop?: FigureCrop;
}) {
  const { tr, locale } = useSite();
  const contrastId = `figure-contrast-${useId().replace(/:/g,'')}`;
  const plain = (text: CopyText) => typeof text === 'string' ? tr(text) : text[locale];
  const imageSizes: Record<string, [number,number]> = {
    '/evidence/hubisco/reaction-scheme.svg': [1306,836],
    '/evidence/hubisco/coupled-assay.svg': [1065,629],
    '/evidence/hubisco/nmr.webp': [1600,1116],
  };
  const size = imageSizes[src];
  const ratio = crop ? crop.box[2] / crop.box[3] : size ? size[0]/size[1] : undefined;
  const imageClass = `scientific-image${src.includes('purification') ? ' photographic-record' : ''}`;
  const contrastStyle = { '--figure-contrast': `url(#${contrastId})` } as CSSProperties;
  return <figure className="source-figure"><svg width="0" height="0" aria-hidden="true" style={{position:'absolute'}}><defs><filter id={contrastId} colorInterpolationFilters="sRGB"><feComponentTransfer><feFuncR type="gamma" amplitude="1" exponent="0.4" offset="0"/><feFuncG type="gamma" amplitude="1" exponent="0.4" offset="0"/><feFuncB type="gamma" amplitude="1" exponent="0.4" offset="0"/></feComponentTransfer></filter></defs></svg><div className="figure-heading"><h3><Copy>{title}</Copy></h3><SiteLink href={src} target="_blank" rel="noreferrer"><Copy>Open full image ↗</Copy></SiteLink></div>
    <SiteLink className="figure-image" href={src} target="_blank" rel="noreferrer" aria-label={`${tr('Open full image')}: ${plain(title)}`} style={ratio ? { maxWidth: `min(100%, ${Math.round(760 * ratio)}px)` } : undefined}>
      {crop ? <svg className={imageClass} viewBox={crop.box.join(' ')} role="img" aria-label={plain(caption)} style={{ ...contrastStyle, aspectRatio: `${ratio}` }}><image href={src} width={crop.width} height={crop.height}/></svg> : <img className={imageClass} style={contrastStyle} src={src} width={size?.[0]} height={size?.[1]} alt={plain(caption)} loading="lazy"/>}
    </SiteLink><figcaption><Copy>{caption}</Copy></figcaption><details><summary><Copy>Conditions and source</Copy></summary><p><Copy>{notes}</Copy></p><p className="small muted"><Copy>{source}</Copy></p></details></figure>;
}
