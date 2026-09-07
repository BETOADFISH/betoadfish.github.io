'use client';
import { Copy, useSite } from '@/components/site-context';
import type { CopyText } from '@/lib/bilingual';
import type { CSSProperties } from 'react';

export type FigureCrop = { width: number; height: number; box: [number, number, number, number] };
export function SourceFigure({ src, title, caption, crop, legend }: {
  src: string; title: CopyText; caption: CopyText; crop?: FigureCrop; legend?: CopyText;
  source?: CopyText; notes?: CopyText;
}) {
  const { tr, locale } = useSite();
  const plain = (text: CopyText) => typeof text === 'string' ? tr(text) : text[locale];
  const sizes: Record<string, [number,number]> = {
    '/evidence/hubisco/reaction-scheme.svg': [1306,836],
    '/evidence/hubisco/coupled-assay.svg': [1065,629],
    '/evidence/hubisco/nmr.webp': [1600,1116],
  };
  const size = sizes[src];
  const ratio = crop ? crop.box[2] / crop.box[3] : size ? size[0]/size[1] : undefined;
  const style: CSSProperties = ratio ? { aspectRatio: `${ratio}` } : {};
  const imageClass = `scientific-image${src.includes('purification') ? ' photographic-record' : ''}`;
  return <figure className="source-figure protected-figure" onContextMenu={event=>event.preventDefault()} onDragStart={event=>event.preventDefault()}>
    <div className="figure-heading"><h3><Copy>{title}</Copy></h3></div>
    <div className="figure-image" style={ratio ? {maxWidth:`min(100%, ${Math.round(660*ratio)}px)`} : undefined}>
      {crop ? <svg className={imageClass} viewBox={crop.box.join(' ')} role="img" aria-label={plain(caption)} style={style}><image href={src} width={crop.width} height={crop.height}/></svg> : <img className={imageClass} src={src} width={size?.[0]} height={size?.[1]} alt={plain(caption)} loading="lazy" draggable={false}/>}
    </div>
    <figcaption>{legend && <p className="figure-legend"><Copy>{legend}</Copy></p>}<p><Copy>{caption}</Copy></p></figcaption>
  </figure>;
}
