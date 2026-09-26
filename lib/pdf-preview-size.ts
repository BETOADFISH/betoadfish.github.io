export function previewScale(pageWidth:number,pageHeight:number,availableWidth:number,pixelRatio:number){
 const width=Math.max(1,pageWidth),height=Math.max(1,pageHeight);
 const fit=Math.max(1,availableWidth)/width*Math.min(2,Math.max(1,pixelRatio));
 return Math.min(fit,Math.sqrt(2500000/(width*height)),2.5);
}
