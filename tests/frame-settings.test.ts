import {it,expect} from 'vitest';
import {newProject,projectSchema,type Project} from '../src/lib/model';
import {frameAdjustment,frameKey} from '../src/lib/frame-settings';
import {newsLayout} from '../src/video/layout';
function custom(layout:'lower-third'|'popup'){
 const p=newProject();p.template='custom';p.customStyleId='sample';
 p.customStyles=[{id:'sample',name:'Mẫu',assetId:'image',layout,mode:'adapt',primary:'#008844',secondary:'#003322',text:'#ffffff',roundness:24}];return p;
}
function adjust(p:Project,heightScale:number,verticalOffset=0){p.design.frames[frameKey(p)]={heightScale,verticalOffset};}
it('preserves old settings and isolates each style and custom layout',()=>{
 const p=custom('lower-third');expect(projectSchema.parse({...p,design:{...p.design,frames:undefined}}).design.frames).toEqual({});
 adjust(p,1.5,.1);p.customStyles[0].layout='popup';expect(frameAdjustment(p)).toEqual({heightScale:1,verticalOffset:0});
 adjust(p,.75,-.1);p.customStyles[0].layout='lower-third';expect(frameAdjustment(p)).toEqual({heightScale:1.5,verticalOffset:.1});
 p.template='emerald';expect(frameAdjustment(p).heightScale).toBe(1);
 for(const value of [{heightScale:.49,verticalOffset:0},{heightScale:2.01,verticalOffset:0},{heightScale:1,verticalOffset:.31}])expect(projectSchema.safeParse({...p,design:{...p.design,frames:{emerald:value}}}).success).toBe(false);
});
it('grows a lower third upwards from the bottom and translates without stretching',()=>{
 const p=custom('lower-third');adjust(p,1.5);
 const l=newsLayout(p,p.scenes[0]);expect(l.panelHeight).toBeCloseTo(.5);expect(l.panelBottom).toBe(0);
 adjust(p,1.5,.1);const raised=newsLayout(p,p.scenes[0]);expect(raised.panelHeight).toBe(l.panelHeight);expect(raised.panelBottom).toBe(.1);
 expect(raised.captionBottom-l.captionBottom).toBeCloseTo(.1);expect(raised.headerHeight).toBe(l.headerHeight);
});
it('resizes popups and preset cards and bounds the extremes on each aspect',()=>{
 for(const template of ['custom','emerald','magenta','bulletin','spotlight','sports','cinema','shorts','breaking','editorial','minimal'] as const){
  const p=custom('popup');p.template=template;const base=newsLayout(p,p.scenes[0]);adjust(p,1.5);
  const large=newsLayout(p,p.scenes[0]);expect(large.panelHeight).toBeCloseTo(base.panelHeight*1.5);
  expect(large.panelBottom).toBe(base.panelBottom);expect(large.logoHeaderHeight).toBe(base.logoHeaderHeight);
  for(const aspect of ['9:16','1:1','16:9'] as const)for(const heightScale of [.5,2])for(const offset of [-.3,.3]){
   p.aspect=aspect;adjust(p,heightScale,offset);const l=newsLayout(p,p.scenes[0]);
   expect(l.titleHeight).toBeGreaterThan(0);expect(l.panelBottom).toBeGreaterThanOrEqual(0);expect(l.panelHeight+l.panelBottom).toBeLessThanOrEqual(.85000001);
   expect(l.captionBottom).toBeGreaterThan(l.panelBottom+l.panelHeight);
  }
 }
});
