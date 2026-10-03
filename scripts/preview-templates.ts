import {mkdir,copyFile,writeFile,readFile} from 'node:fs/promises';
import path from 'node:path';
import {store} from '../src/lib/store';
import {renderProject} from '../src/lib/render';
import {REFERENCE_TEMPLATES} from '../src/lib/templates';
import {uid,type Job} from '../src/lib/model';
const samples=[
 'Từ trẻ em đến người lớn đều mê: đậu phộng giòn rụm – món ăn vặt quốc dân qua bao năm vẫn hot, ăn hơi mỏi răng nhưng càng nhai càng cuốn!',
 'Khám phá không gian làm việc đầy cảm hứng của những người kể chuyện',
 'Quá xúc động, những khoảnh khắc đẹp được ghi lại trên sân khấu âm nhạc',
 'Một câu chuyện, nhiều góc nhìn: cùng khám phá thế giới qua những bản tin mỗi ngày',
];
await mkdir('docs/previews',{recursive:true});
const outputs=[];
const previous: {style:string;projectId:string}[]=process.argv.includes('--refresh')?JSON.parse(await readFile('docs/previews/manifest.json','utf8')):[];
for(const [i,t] of REFERENCE_TEMPLATES.entries()){
 const existing=previous.find(x=>x.style===t.id);
 let p=existing?await store.getProject(existing.projectId):await store.createProject(`Mẫu ${i+1} · ${t.name}`);
 if(!existing){p.template=t.id;p.titleMode='all';p.newsTitle=samples[i];p.brand.color=t.color;
 p.design.placement='reference';p.design.highlightTerms=['nhiều góc nhìn','thế giới','mỗi ngày'];
 p.scenes=p.scenes.slice(0,1);p.scenes[0].duration=2;p.scenes[0].text='';p.scenes[0].tag='';p.scenes[0].showCaption=false;
 p=await store.saveProject(p,p.revision);}
 // Render directly without adding a queued job that the running worker might claim.
 const job:Job={id:uid(),projectId:p.id,revision:p.revision,kind:'render',state:'running',snapshot:p,options:{preset:'full'},progress:0,message:'Đang tạo mẫu',createdAt:new Date().toISOString()};
 const started=Date.now();const result=await renderProject(job,store,()=>{});
 await store.atomic(store.file('jobs',job.id),{...job,state:'succeeded',progress:100,message:'Hoàn thành',outputs:result,elapsed:(Date.now()-started)/1000,finishedAt:new Date().toISOString()});
 const thumbnail=result.find(a=>a.mime==='image/jpeg')!;
 await copyFile(path.join(store.root,'media',p.id,thumbnail.file),`docs/previews/${t.id}.jpg`);
 outputs.push({style:t.id,projectId:p.id,jobId:job.id,seconds:(Date.now()-started)/1000});
 console.log(`${t.name}: rendered ${p.id}`);
}
await writeFile('docs/previews/manifest.json',JSON.stringify(outputs,null,2));
