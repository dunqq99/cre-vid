import type {Project} from './model';
import type {FrameAdjustment} from './templates';
export function frameKey(p:Project){
 const custom=p.customStyles?.find(s=>s.id===p.customStyleId);
 return p.template==='custom'?`custom-${p.customStyleId||'none'}-${custom?.layout||'popup'}`:p.template;
}
export function frameAdjustment(p:Project):FrameAdjustment{
 return p.design?.frames?.[frameKey(p)]||{heightScale:1,verticalOffset:0};
}
