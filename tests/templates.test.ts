import {it,expect} from 'vitest';
import {newProject,projectSchema,validateProject} from '../src/lib/model';
import {REFERENCE_TEMPLATES,highlightParts} from '../src/lib/templates';
import {newsLayout} from '../src/video/layout';

it('supports all four reference styles and preserves old projects',()=>{
 const p=newProject();
 for(const template of REFERENCE_TEMPLATES){expect(projectSchema.parse({...p,template:template.id}).template).toBe(template.id);}
 const old={...p,design:undefined,scenes:p.scenes.map(s=>({...s,insetIds:undefined}))};
 expect(projectSchema.parse(old).design.placement).toBe('safe');
 expect(projectSchema.parse({...p,brand:{...p.brand,display:undefined}}).brand.display).toBe('both');
 expect(projectSchema.parse({...p,design:{...p.design,platform:undefined}}).design.platform).toBe('tiktok');
 expect(projectSchema.parse(old).scenes[0].insetIds).toEqual([]);
 expect(projectSchema.parse({...old,template:'breaking'}).template).toBe('breaking');
});
it('keeps every reference style hidden outside intro and positions subtitles above its full overlay',()=>{
 for(const template of REFERENCE_TEMPLATES){const p=newProject();p.template=template.id;
  expect(newsLayout(p,p.scenes[1]).showTitle).toBe(false);
  p.titleMode='all';
  for(const aspect of ['9:16','16:9','1:1'] as const){p.aspect=aspect;const l=newsLayout(p,p.scenes[1]);expect(l.showTitle).toBe(true);expect(l.captionBottom).toBeGreaterThan(l.titleBottom+l.titleHeight+l.headerHeight);}
 }
});
it('highlights literal phrases without changing title text or interpreting regex',()=>{
 const text='Không thể ngờ: Messi gặp Yamal, C++ và Messi.';
 const parts=highlightParts(text,['Messi','Yamal','C++']);
 expect(parts.map(p=>p.text).join('')).toBe(text);
 expect(parts.filter(p=>p.highlight).map(p=>p.text)).toEqual(['Messi','Yamal','C++','Messi']);
 expect(highlightParts('messi Messi',['MESSI']).every(p=>p.highlight)).toBe(false);
});
it('refuses missing and non-image inset assets',()=>{
 const p=newProject();p.template='spotlight';p.scenes[0].insetIds=['missing'];
 expect(validateProject(p).join(' ')).toContain('ảnh tròn');
});

it('keeps short social cards compact and below the image centre for TikTok and Reels',()=>{
 const p=newProject();p.template='spotlight';p.newsTitle='Hà Nội đón ngày mới';
 for(const platform of ['tiktok','reels'] as const){p.design.platform=platform;
  const l=newsLayout(p,p.scenes[0]);
  expect(l.titleHeight+l.headerHeight).toBeLessThan(.15);
  expect(1-l.titleBottom-l.titleHeight-l.headerHeight).toBeGreaterThan(.65);
  expect(l.captionBottom).toBeLessThan(.37);
  expect(l.titleBottom).toBeGreaterThanOrEqual(.18);
 }
 const short=newsLayout(p,p.scenes[0]).titleHeight;
 p.newsTitle='Một câu chuyện mới bắt đầu từ những hình ảnh quen thuộc, mang đến nhiều góc nhìn khác nhau về cuộc sống mỗi ngày.';
 expect(newsLayout(p,p.scenes[0]).titleHeight).toBeGreaterThan(short);
});

it('defaults old logo sizes and keeps enlarged logo headers below captions',()=>{
 const p=newProject();
 expect(projectSchema.parse({...p,brand:{...p.brand,logoScale:undefined}}).brand.logoScale).toBe(1);
 for(const scale of [.49,10.01])expect(projectSchema.safeParse({...p,brand:{...p.brand,logoScale:scale}}).success).toBe(false);
 p.template='spotlight';p.brand.logoId='logo';const base=newsLayout(p,p.scenes[0]);p.brand.logoScale=2;
 const large=newsLayout(p,p.scenes[0]);expect(large.headerHeight).toBe(base.headerHeight*2);expect(large.captionBottom).toBeGreaterThan(base.captionBottom);
 p.brand.display='name';expect(newsLayout(p,p.scenes[0]).headerHeight).toBe(base.headerHeight);
});

it('accepts themed styles with compact titles and intro/all scene behavior',()=>{
 for(const template of ['sports','cinema','shorts']){
  const p=projectSchema.parse({...newProject(),template,newsTitle:'Khoảnh khắc đáng nhớ'});
  const l=newsLayout(p,p.scenes[0]);expect(l.reference).toBe(true);expect(l.titleHeight+l.headerHeight).toBeLessThan(.15);
  expect(newsLayout(p,p.scenes[1]).showTitle).toBe(false);p.titleMode='all';
  for(const aspect of ['9:16','16:9','1:1'] as const){p.aspect=aspect;const layout=newsLayout(p,p.scenes[1]);expect(layout.showTitle).toBe(true);expect(layout.captionBottom).toBeGreaterThan(layout.titleBottom+layout.titleHeight+layout.headerHeight);}
 }
});

it('reserves room for larger brand names without enlarging the logo allowance',()=>{
 const p=newProject();p.template='emerald';p.brand.logoId='logo';
 const base=newsLayout(p,p.scenes[0]);p.brand.nameScale=3;
 const large=newsLayout(p,p.scenes[0]);
 expect(large.headerHeight).toBeGreaterThan(base.headerHeight);
 expect(large.logoHeaderHeight).toBe(base.logoHeaderHeight);
 expect(large.captionBottom).toBeGreaterThan(base.captionBottom);
 p.brand.display='logo';expect(newsLayout(p,p.scenes[0]).headerHeight).toBe(base.headerHeight);
});

it('preserves legacy custom popups and bounds the full-width lower-third content',()=>{
 const old={id:'custom1',name:'Mẫu ảnh',assetId:'image1',mode:'adapt',primary:'#008844',secondary:'#003322',text:'#ffffff',roundness:24};
 const p=projectSchema.parse({...newProject(),template:'custom',customStyleId:old.id,customStyles:[old]});
 expect(p.customStyles[0].layout).toBe('popup');
 const popup=newsLayout(p,p.scenes[0]);expect(popup.customLowerThird).toBe(false);expect(popup.titleBottom).toBe(.2);
 p.customStyles[0].layout='lower-third';p.brand.logoId='image1';p.brand.logoScale=10;p.brand.nameScale=3;
 for(const aspect of ['9:16','1:1','16:9'] as const){
  p.aspect=aspect;const l=newsLayout(p,p.scenes[0]);
  expect(l.customLowerThird).toBe(true);expect(l.titleHeight).toBeGreaterThan(0);
  expect(l.titleBottom+l.titleHeight+l.headerHeight).toBeCloseTo(1/3,8);
  expect(l.captionBottom).toBeGreaterThan(1/3);
  expect(newsLayout(p,p.scenes[1]).showTitle).toBe(false);
 }
 p.titleMode='all';expect(newsLayout(p,p.scenes[1]).showTitle).toBe(true);
 expect(projectSchema.safeParse({...p,customStyles:[{...old,layout:'invalid'}]}).success).toBe(false);
});
