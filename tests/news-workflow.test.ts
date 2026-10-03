import {it,expect} from 'vitest';
import {newProject,newScene,projectSchema} from '../src/lib/model';
import {newsLayout} from '../src/video/layout';
import {suggestScript} from '../src/lib/script';
import {extractArticle} from '../src/lib/integrations';

it('shows a title only on intro or keeps the same title throughout all scenes',()=>{
 const p=newProject();p.newsTitle='Câu chuyện chung';p.titleMode='intro';
 expect(newsLayout(p,p.scenes[0]).showTitle).toBe(true);
 expect(newsLayout(p,p.scenes[1]).showTitle).toBe(false);

 p.titleMode='all';
 for(const s of p.scenes){const layout=newsLayout(p,s);expect(layout.showTitle).toBe(true);expect(layout.title).toBe(p.newsTitle);expect(layout.captionBottom).toBeGreaterThan(layout.titleBottom+layout.titleHeight);}
 expect(projectSchema.parse({...p,titleMode:undefined,newsTitle:undefined}).titleMode).toBe('intro');
});
it('keeps labels and title away from the right action rail and bottom UI',()=>{
 const p=newProject();const l=newsLayout(p,newScene());expect(l.right).toBeGreaterThanOrEqual(.18);expect(l.titleBottom).toBeGreaterThanOrEqual(.20);expect(l.labelTop).toBeGreaterThanOrEqual(.09);
});
it('suggests bounded factual segments and an opening voice direction without fabricated facts',()=>{
 const source={url:'https://example.com/tin',title:'Hà Nội mở thêm tuyến xe buýt',text:'Hà Nội mở thêm tuyến xe buýt vào ngày 2 tháng 10. Tuyến mới phục vụ khu vực phía Tây thành phố. Người dân có thể tra cứu lộ trình tại điểm dừng.',fetchedAt:new Date().toISOString()};
 const draft=suggestScript(source);
 expect(draft.scenes[0].kind).toBe('intro');expect(draft.scenes.at(-1)?.kind).toBe('body');
 expect(draft.scenes.every(s=>s.text.length<=300)).toBe(true);
 expect(draft.scenes[0].voiceDirection).toContain('nhấn');
 expect(draft.scenes.map(s=>s.text).join(' ')).toContain('2 tháng 10');
 expect(draft.scenes.map(s=>s.text).join(' ')).not.toMatch(/chấn động|triệu|độc quyền/);
 expect(draft.scenes.reduce((n,s)=>n+s.duration,0)).toBeLessThanOrEqual(180);
});
it('extracts article and lazy images as absolute deduplicated URLs while excluding tracking images',()=>{
 const html=`<html><head><title>Bản tin mới</title><meta property="og:image" content="/cover.jpg"></head><body><article><h1>Bản tin mới</h1><p>${'Nội dung bài báo đầy đủ thông tin. '.repeat(30)}</p><img src="/cover.jpg" width="1200"><img data-src="https://cdn.example.com/photo.webp" width="800"><img src="/pixel.png" width="1" height="1"></article></body></html>`;
 const source=extractArticle(html,'https://paper.example.com/news');
 expect(source.images).toContain('https://paper.example.com/cover.jpg');
 expect(source.images).toContain('https://cdn.example.com/photo.webp');
 expect(source.images.filter(x=>x.includes('cover'))).toHaveLength(1);
 expect(source.images.some(x=>x.includes('pixel'))).toBe(false);
});
