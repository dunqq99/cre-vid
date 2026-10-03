import {mkdtemp,mkdir,copyFile,rm,stat,writeFile} from 'node:fs/promises';
import {Store} from '../src/lib/store';import {renderProject} from '../src/lib/render';import {probeMedia} from '../src/lib/media';
import {newProject,uid,type Job,validateProject} from '../src/lib/model';import assert from 'node:assert/strict';
const root=await mkdtemp('/tmp/crevid-custom-'),store=new Store(root);
try{
 const p=newProject('Mẫu custom · logo tròn');const dir=`${root}/media/${p.id}`;await mkdir(dir,{recursive:true});
 await copyFile('docs/references/news-style-reference.png',`${dir}/reference.png`);
 p.assets=[{id:'reference',name:'Ảnh tham khảo',kind:'image',file:'reference.png',mime:'image/png',bytes:(await stat(`${dir}/reference.png`)).size}];
 p.template='custom';p.customStyleId='sample';p.customStyles=[{id:'sample',name:'Sắc đỏ · Bản tin riêng',assetId:'reference',layout:'popup',mode:'image',primary:'#f21841',secondary:'#740c42',text:'#ffffff',roundness:24}];
 p.brand.logoId='reference';p.brand.logoScale=10;p.brand.logoRoundness=100;p.titleMode='all';p.newsTitle='Một giao diện riêng cho bản tin của bạn';
 p.scenes.forEach(s=>{s.duration=1;s.text='Logo tròn và tên thương hiệu hiển thị cùng nhau.';});
 assert.deepEqual(validateProject(p),[]);
 const job:Job={id:uid(),projectId:p.id,revision:1,kind:'render',state:'running',snapshot:p,options:{preset:'full'},progress:0,message:'Custom',createdAt:new Date().toISOString()};
 const outputs=await renderProject(job,store,()=>{});const video=outputs.find(o=>o.mime==='video/mp4')!;const meta=await probeMedia(`${dir}/${video.file}`);
 assert.equal(meta.streams.find(s=>s.codec_type==='video')?.width,1080);assert.ok(Math.abs(Number(meta.format.duration)-2)<.1);
 await mkdir('docs/previews',{recursive:true});for(const ext of ['mp4','jpg']){const out=outputs.find(o=>o.file.endsWith('.'+ext))!;await copyFile(`${dir}/${out.file}`,`docs/previews/custom-logo.${ext}`);}
 await writeFile('docs/previews/custom-logo-manifest.json',JSON.stringify({resolution:'1080x1920',seconds:2,logoScale:10,logoRoundness:100,customMode:'image',checkedAt:new Date().toISOString()},null,2));
 console.log('Custom image template + circular logo at 1000% rendered at 1080x1920, 2 seconds.');
}finally{await rm(root,{recursive:true,force:true});}
