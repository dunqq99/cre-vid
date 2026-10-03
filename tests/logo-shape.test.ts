import {it,expect} from 'vitest';
import {newProject,projectSchema,validateProject} from '../src/lib/model';
import {logoBox} from '../src/video/logo-box';
it('accepts 1000% logos and defaults old projects to square corners',()=>{
 const p=newProject();expect(projectSchema.parse({...p,brand:{...p.brand,logoScale:10}}).brand.logoScale).toBe(10);
 expect(projectSchema.parse({...p,brand:{...p.brand,logoRoundness:undefined}}).brand.logoRoundness).toBe(0);
 for(const logoScale of [.49,10.01])expect(projectSchema.safeParse({...p,brand:{...p.brand,logoScale}}).success).toBe(false);
 for(const logoRoundness of [-1,101])expect(projectSchema.safeParse({...p,brand:{...p.brand,logoRoundness}}).success).toBe(false);
});
it('makes full rounding a circle and keeps oversized masks inside the allotted width',()=>{
 const box=logoBox(30,300,true,10,100);expect(box.width).toBe(box.height);expect(box.radius).toBe('50%');expect(box.width).toBeLessThanOrEqual(180);
 const constrained=logoBox(75,1600,true,10,100,200);expect(constrained.width).toBe(200);expect(constrained.height).toBe(200);
 const flat=logoBox(30,300,true,1,0);expect(flat.width).toBe(48);expect(flat.height).toBe(37.5);
 expect(logoBox(30,300,true,10,0).height).toBeGreaterThan(logoBox(30,300,true,2,0).height);
});

import {extractPalette,customStyleName} from '../src/lib/custom-style';
it('extracts an image palette, ignores transparent pixels and derives a bounded editable name',()=>{
 const palette=extractPalette([255,0,0,255,255,0,0,255,0,0,255,255,0,255,0,0]);
 expect(palette).toEqual({primary:'#ff0000',secondary:'#0000ff',text:'#ffffff'});
 expect(customStyleName('tin-the-thao.png',palette)).toBe('Đỏ · tin the thao');
 expect(customStyleName('a'.repeat(100)+'.png',palette).length).toBeLessThanOrEqual(80);
 expect(extractPalette([]).primary).toBe('#1e2d3c');
});
it('persists named custom styles and rejects a template with a missing image',()=>{
 const p=newProject();const custom={id:'style1',name:'Mẫu riêng',assetId:'image1',mode:'adapt',primary:'#ff0000',secondary:'#000000',text:'#ffffff',roundness:24};
 const saved=projectSchema.parse({...p,template:'custom',customStyles:[custom],customStyleId:'style1'});
 expect(saved.customStyles[0]).toMatchObject(custom);
 expect(validateProject(saved)).toContain('Giao diện custom thiếu ảnh nguồn.');
 expect(projectSchema.parse(p).customStyles).toEqual([]);
});

it('loads old brand sizes and accepts independent name sizes from 50 to 300 percent',()=>{
 const p=newProject();
 expect(projectSchema.parse({...p,brand:{...p.brand,nameScale:undefined}}).brand.nameScale).toBe(1);
 for(const nameScale of [.5,1,3])expect(projectSchema.parse({...p,brand:{...p.brand,nameScale}}).brand.nameScale).toBe(nameScale);
 for(const nameScale of [.49,3.01])expect(projectSchema.safeParse({...p,brand:{...p.brand,nameScale}}).success).toBe(false);
});
