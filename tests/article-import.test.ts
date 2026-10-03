import {it,expect,vi} from 'vitest';
import {mkdtemp,readFile,rm} from 'node:fs/promises';
import os from 'node:os';import path from 'node:path';
import {Store} from '../src/lib/store';
import {importArticle} from '../src/lib/article-import';
import {fetchArticle,fetchPublicResource} from '../src/lib/integrations';
vi.mock('../src/lib/integrations',()=>({fetchArticle:vi.fn(),fetchPublicResource:vi.fn()}));
it('persists downloadable article photos, preserves existing scripts, tolerates a blocked photo and deduplicates imports',async()=>{
 const root=await mkdtemp(path.join(os.tmpdir(),'crevid-article-'));const store=new Store(root);
 try{
  const p=await store.createProject('Bản đang biên tập');
  const source={url:'https://paper.example/story',title:'Một ngày mới tại Hà Nội',text:'Người dân Hà Nội đón ngày mới. Các phương tiện đi lại trong trật tự.',fetchedAt:new Date().toISOString(),images:['https://cdn.example/photo.png','https://cdn.example/blocked.jpg']};
  vi.mocked(fetchArticle).mockResolvedValue(source);
  const data=await readFile('docs/references/news-style-reference.png');
  vi.mocked(fetchPublicResource).mockImplementation(async url=>{if(url.includes('blocked'))throw new Error('Website trả lỗi 403.');return {data,url,contentType:'image/png'};});
  const result=await importArticle(store,p.id,source.url);
  expect(result.imported).toBe(1);expect(result.project.assets[0].sourceUrl).toBe(source.images[0]);
  expect(result.warnings.join(' ')).toContain('403');expect(result.draft.scenes[0].kind).toBe('intro');
  expect(result.project.scenes).toEqual(p.scenes);
  expect((await readFile(path.join(root,'media',p.id,result.project.assets[0].file))).length).toBeGreaterThan(1000);
  const second=await importArticle(store,p.id,source.url);expect(second.imported).toBe(0);expect(second.project.assets).toHaveLength(1);
 }finally{await rm(root,{recursive:true,force:true});}
});
