import type {Scene} from '../lib/model';
/** Frame-driven motion is identical in the Player and MP4; pan overscan prevents exposed edges. */
export function imageMotion(scene:Scene,frame:number,duration:number,width:number){
 const progress=Math.max(0,Math.min(1,frame/Math.max(1,duration-1)));
 const amount=scene.motionAmount??.15;
 let scale=1,x=0;
 if(scene.motion==='zoom-in')scale=1+amount*progress;
 if(scene.motion==='zoom-out')scale=1+amount*(1-progress);
 if(scene.motion==='pan-left'||scene.motion==='pan-right'){
  scale=1+amount;x=(scene.motion==='pan-left'?1:-1)*width*amount*(.5-progress);
 }
 return {scale,x,transform:`translateX(${x}px) scale(${scale})`};
}
