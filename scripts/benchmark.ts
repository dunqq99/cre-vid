import {cpus,totalmem,platform,arch} from 'node:os';
import {mkdir,writeFile} from 'node:fs/promises';
import {performance} from 'node:perf_hooks';
import {Store} from '../src/lib/store';import {renderProject} from '../src/lib/render';
import {newScene} from '../src/lib/model';
const store=new Store();await store.init();
let p=await store.createProject('Mẫu kiểm tra render · 60 giây');
p.scenes.push(newScene('body'));
p.scenes.forEach((s,i)=>{s.duration=20;s.headline=['Tin tức trong một góc nhìn mới','Kể chuyện bằng hình ảnh và lời dẫn','Sẵn sàng cho bản tin tiếp theo'][i];s.text=['Đây là video mẫu để đo thời gian render. Nội dung minh họa, không phải bản tin thực tế.','Studio ghép cảnh, tiêu đề, logo, watermark và phụ đề trong cùng một luồng xử lý.','Bạn có thể thay nền minh họa bằng ảnh, video và giọng đọc của mình.'][i];s.source='Cre-vid · Mẫu thử';});
p=await store.saveProject(p,p.revision);
const job=await store.enqueue(p.id,'render',{preset:'full'},p.revision);
// Claim our job directly so the persistent worker cannot pick it up concurrently.
const ready=await store.locked(async()=>{const j=await store.getJob(job.id);if(j.state!=='queued')throw new Error('Job already claimed by worker; benchmark via its measured elapsed time.');j.state='running';j.startedAt=new Date().toISOString();j.heartbeat=j.startedAt;await store.atomic(store.file('jobs',j.id),j);return j;});
const start=performance.now();const heartbeat=setInterval(()=>void store.updateJob(job.id,{heartbeat:new Date().toISOString()}),10000);
try{
 let last=0;const outputs=await renderProject(ready,store,(progress,message)=>{if(progress-last>=10){last=progress;console.log(`${progress}% ${message}`);void store.updateJob(job.id,{progress,message});}});
 const elapsed=(performance.now()-start)/1000;await store.updateJob(job.id,{state:'succeeded',progress:100,outputs,elapsed,finishedAt:new Date().toISOString(),message:'Hoàn thành'});
 const result={date:new Date().toISOString(),system:platform(),arch:arch(),cpu:cpus()[0].model,cores:cpus().length,memoryGiB:Math.round(totalmem()/1024**3),videoSeconds:60,resolution:'1080x1920',fps:30,template:p.template,concurrency:2,elapsedSeconds:elapsed,ratio:elapsed/60,fixture:'3 scenes, vector background, headlines, watermark, Vietnamese captions; no uploaded video and no TTS',jobId:job.id,projectId:p.id};
 await mkdir('docs/benchmarks',{recursive:true});await writeFile('docs/benchmarks/local-render.json',JSON.stringify(result,null,2));console.log(JSON.stringify(result,null,2));
}catch(e){await store.updateJob(job.id,{state:'failed',error:String(e)});throw e;}finally{clearInterval(heartbeat);}
