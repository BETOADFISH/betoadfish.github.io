'use client';
import { Copy, useSite } from '@/components/site-context';
import type { CopyText } from '@/lib/bilingual';
import { useState, type CSSProperties } from 'react';
import { Maximize2, X, ZoomIn, ZoomOut } from 'lucide-react';
import { Dialog, DialogTrigger, DialogContent, DialogTitle, DialogDescription, DialogClose } from './ui/dialog';
import { t } from '@/lib/bilingual';

export type FigureCrop = { width: number; height: number; box: [number, number, number, number] };
export function SourceFigure({ src, title, caption, crop, legend }: {
  src: string; title: CopyText; caption: CopyText; crop?: FigureCrop; legend?: CopyText;
  source?: CopyText; notes?: CopyText;
}) {
  const { tr, locale } = useSite();
  const [open,setOpen]=useState(false),[zoom,setZoom]=useState(1);
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
  function figureImage(expanded=false){return crop ? <svg className={imageClass} viewBox={crop.box.join(' ')} role="img" aria-label={plain(caption)} style={style}><image href={src} width={crop.width} height={crop.height}/></svg> : <img className={imageClass} src={src} width={size?.[0]} height={size?.[1]} alt={plain(caption)} loading={expanded?'eager':'lazy'} draggable={false}/>;}
  return <figure className="source-figure protected-figure" onContextMenu={event=>event.preventDefault()} onDragStart={event=>event.preventDefault()}>
    <div className="figure-heading"><h3><Copy>{title}</Copy></h3><Dialog open={open} onOpenChange={value=>{setOpen(value);setZoom(1);}}><DialogTrigger className="figure-expand" aria-label={plain(t('Enlarge figure: ','放大查看：'))+plain(title)}><Maximize2 size={16}/><Copy>{t('Enlarge','放大查看')}</Copy></DialogTrigger><DialogContent className="figure-inspection" showCloseButton={false} onContextMenu={e=>e.preventDefault()} onDragStart={e=>e.preventDefault()}><div className="figure-inspection-bar"><DialogTitle><Copy>{title}</Copy></DialogTitle><div><button onClick={()=>setZoom(Math.max(1,zoom-.5))} disabled={zoom===1} aria-label={plain(t('Zoom out','缩小图像'))}><ZoomOut size={19}/></button><span>{Math.round(zoom*100)}%</span><button onClick={()=>setZoom(Math.min(3,zoom+.5))} disabled={zoom===3} aria-label={plain(t('Zoom in','放大图像'))}><ZoomIn size={19}/></button><DialogClose aria-label={plain(t('Close figure','关闭图像'))}><X size={21}/></DialogClose></div></div><DialogDescription className="figure-pan-hint"><Copy>{t('Enlarge to inspect labels; scroll within the image to move around.','可放大检查标注，再在图像区域内滚动查看。')}</Copy></DialogDescription><div className="figure-pan"><div className="figure-inspection-image" style={{width:`${zoom*100}%`}}>{figureImage(true)}</div></div><div className="figure-inspection-caption">{legend&&<p><Copy>{legend}</Copy></p>}<p><Copy>{caption}</Copy></p></div></DialogContent></Dialog></div>
    <div className="figure-image" style={ratio ? {maxWidth:`min(100%, ${Math.round(660*ratio)}px)`} : undefined}>
      {figureImage()}
    </div>
    <figcaption>{legend && <p className="figure-legend"><Copy>{legend}</Copy></p>}<p><Copy>{caption}</Copy></p></figcaption>
  </figure>;
}
