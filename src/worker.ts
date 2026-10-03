import {writeFile,mkdir} from 'node:fs/promises';import path from 'node:path';
import {store} from './lib/store';import {renderProject} from './lib/render';import {synthesize} from './lib/integrations';import {ingestMedia} from './lib/media';
import {PublishQueue} from './lib/social/queue';
const publishing=new PublishQueue(store);
await store.init();
const heartbeat=async()=>writeFile(path.join(store.root,'worker-heartbeat'),String(Date.now()));await heartbeat();setInterval(()=>void heartbeat().catch(console.error),4000);
console.log('Cre-vid worker ready. Data:',store.root);
for(;;){
 const job=await store.claimJob();if(!job){if(!await publishing.runNext())await new Promise(r=>setTimeout(r,1000));continue;}
 const started=Date.now();const controller=new AbortController();let progress=1,message='Đang xử lý';let polling=false;
 const timer=setInterval(async()=>{if(polling)return;polling=true;try{const current=await store.getJob(job.id);if(current.state==='canceled')controller.abort();else await store.updateJob(job.id,{heartbeat:new Date().toISOString(),progress,message});}catch(e){console.error('Job heartbeat failed',e);}finally{polling=false;}},1000);
 try{
  let outputs;
  if(job.kind==='render')outputs=await renderProject(job,store,(n,m)=>{progress=n;message=m;},controller.signal);
  else{
   const scene=job.snapshot.scenes.find(s=>s.id===job.options.sceneId)!;message='Đang tạo giọng đọc';
   const audio=await synthesize(scene.text,job.options.provider!,job.options.voiceId!,job.options.speed||1,controller.signal);controller.signal.throwIfAborted();
   const dir=path.join(store.root,'media',job.projectId);await mkdir(dir,{recursive:true});const asset=await ingestMedia(dir,`Voice-${scene.kind}.mp3`,audio);controller.signal.throwIfAborted();await store.attachVoice(job,asset);
   outputs=[{name:'Giọng đọc',file:asset.file,mime:asset.mime}];
  }
  await store.updateJob(job.id,{state:'succeeded',progress:100,message:'Hoàn thành',outputs,finishedAt:new Date().toISOString(),elapsed:(Date.now()-started)/1000});
  console.log(`${job.kind} ${job.id} completed in ${((Date.now()-started)/1000).toFixed(1)}s`);
 }catch(e){await store.updateJob(job.id,{state:'failed',error:e instanceof Error?e.message:'Xử lý thất bại',message:'Xử lý thất bại',finishedAt:new Date().toISOString(),elapsed:(Date.now()-started)/1000});console.error(`Job ${job.id}:`,e);}
 finally{clearInterval(timer);}
}
