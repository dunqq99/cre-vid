import {it,expect} from 'vitest';
import {PLATFORMS,PHONE} from '../src/lib/platforms';
import {newProject,projectSchema} from '../src/lib/model';
import {newsLayout} from '../src/video/layout';
it('maps three native phone references without stretching the exported video',()=>{
 expect(PHONE).toEqual({width:591,height:1280});
 for(const platform of ['tiktok','reels','shorts'] as const){
  const p=projectSchema.parse({...newProject(),design:{...newProject().design,platform},template:'spotlight',newsTitle:'Hà Nội đón ngày mới'});
  const preset=PLATFORMS[platform];const l=newsLayout(p,p.scenes[0]);
  expect(591/preset.video.height).toBeCloseTo(9/16,6);
  expect(preset.video.y).toBeGreaterThanOrEqual(64);expect(preset.video.y+preset.video.height).toBeLessThan(preset.navY);
  const cardBottom=preset.video.y+(1-l.titleBottom)*preset.video.height;
  expect(cardBottom).toBeLessThan(preset.bottomUi.y);
  const baseline={...p,design:{...p.design,platform:'tiktok' as const}};expect(l).toEqual(newsLayout(baseline,baseline.scenes[0]));
 }
});
