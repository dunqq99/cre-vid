import type {Scene,Asset} from '../lib/model';
/** Keep media above the lower title area; preserve its ratio and blur the remaining space. */
export function bodyWindow(scene:Scene,width:number,height:number,asset?:Asset){
 const native=asset?.width&&asset?.height?asset.width/asset.height:undefined;
 const ratio=scene.kind==='body'&&scene.bodyLayout==='source'?native:scene.kind==='body'&&scene.bodyLayout==='4:3'?4/3:scene.kind==='body'&&scene.bodyLayout==='1:1'?1:undefined;
 if(!ratio||!Number.isFinite(ratio)||ratio<=0)return {x:0,y:0,width,height,framed:false};
 const w=Math.min(width,height*ratio),h=w/ratio;
 const y=Math.min(height-h,Math.max(0,(height-h)/2-height*(scene.bodyOffsetY??.08)));
 return {x:(width-w)/2,y,width:w,height:h,framed:w<width||h<height};
}
