import {mkdtemp,mkdir,copyFile,rm,writeFile} from 'node:fs/promises';
import {Store} from '../src/lib/store';
import {renderProject} from '../src/lib/render';
import {THEMED_TEMPLATES} from '../src/lib/templates';
import {uid,newProject,type Job} from '../src/lib/model';

const root=await mkdtemp('/tmp/crevid-themed-');const store=new Store(root);
const titles=['Bứt phá đến phút cuối','Phía sau một thước phim','Một phút. Một câu chuyện.'];
const results=[];
try{
 await mkdir('docs/previews',{recursive:true});
 for(const [i,t] of THEMED_TEMPLATES.entries()){
  const p=newProject(`Mẫu · ${t.name}`);p.template=t.id;p.brand.color=t.color;p.newsTitle=titles[i];p.titleMode='all';
  p.scenes=p.scenes.slice(0,1);p.scenes[0].duration=2;p.scenes[0].text='Mỗi khoảnh khắc đều mang một câu chuyện riêng.';p.scenes[0].tag='';
  const job:Job={id:uid(),projectId:p.id,revision:p.revision,kind:'render',state:'running',snapshot:p,options:{preset:'full'},progress:0,message:'Mẫu phong cách',createdAt:new Date().toISOString()};
  const started=Date.now();const outputs=await renderProject(job,store,()=>{});
  for(const ext of ['jpg','mp4']){const output=outputs.find(o=>o.file.endsWith(`.${ext}`))!;await copyFile(`${root}/media/${p.id}/${output.file}`,`docs/previews/${t.id}.${ext}`);}
  results.push({template:t.id,resolution:'1080x1920',videoSeconds:2,elapsedSeconds:(Date.now()-started)/1000});
  console.log(`${t.name}: MP4 + JPG rendered`);
 }
 await writeFile('docs/previews/themed-manifest.json',JSON.stringify(results,null,2));
}finally{await rm(root,{recursive:true,force:true});}
