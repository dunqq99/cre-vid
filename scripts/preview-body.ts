import {mkdtemp,mkdir,copyFile,rm,writeFile,stat} from 'node:fs/promises';
import {execFile} from 'node:child_process';import {promisify} from 'node:util';
import assert from 'node:assert/strict';
import {Store} from '../src/lib/store';import {renderProject} from '../src/lib/render';
import {ffmpegPath,probeMedia} from '../src/lib/media';
import {newProject,newScene,uid,type Job} from '../src/lib/model';
const run=promisify(execFile),root=await mkdtemp('/tmp/crevid-body-'),store=new Store(root);
try{
 const p=newProject('Body · kiểm tra ảnh và âm thanh');p.scenes=[newScene(),newScene()];
 const dir=`${root}/media/${p.id}`;await mkdir(dir,{recursive:true});
 await run(ffmpegPath,['-y','-v','error','-f','lavfi','-i','testsrc2=size=640x480:rate=30:duration=0.6','-f','lavfi','-i','sine=frequency=440:sample_rate=48000:duration=0.6','-c:v','libx264','-pix_fmt','yuv420p','-c:a','aac','-shortest',`${dir}/fixture.mp4`]);
 p.assets=[{id:'fixture',name:'Bảng kiểm thử 4:3 có tiếng',kind:'video',file:'fixture.mp4',mime:'video/mp4',bytes:(await stat(`${dir}/fixture.mp4`)).size,width:640,height:480,duration:.6}];
 p.scenes.forEach((s,i)=>{s.duration=1;s.mediaId='fixture';s.trimStart=.2;s.muteOriginal=false;s.bodyLayout=i?'1:1':'4:3';s.signOpacity=.4;s.text='Tư liệu rõ nét. Nền trên và dưới được làm mờ.';});
 const job:Job={id:uid(),projectId:p.id,revision:1,kind:'render',state:'running',snapshot:p,options:{preset:'full'},progress:0,message:'Kiểm tra Body',createdAt:new Date().toISOString()};
 const outputs=await renderProject(job,store,()=>{});const video=`${dir}/${outputs.find(o=>o.mime==='video/mp4')!.file}`;
 const meta=await probeMedia(video);assert.equal(meta.streams.find(s=>s.codec_type==='video')?.width,1080);assert.ok(Math.abs(Number(meta.format.duration)-2)<.1);
 const audio=await run(ffmpegPath,['-v','error','-i',video,'-map','0:a:0','-f','f32le','-ac','1','-ar','48000','pipe:1'],{encoding:'buffer',maxBuffer:2000000});
 let sum=0,count=0;for(let i=0;i<audio.stdout.length-3;i+=4){sum+=audio.stdout.readFloatLE(i)**2;count++;}const rms=Math.sqrt(sum/count);
 // Sine source RMS ~0.088, original track volume 0.35 -> ~0.031. A second audible background doubles it.
 assert.ok(rms>.02&&rms<.04,`Original audio duplicated or missing: RMS ${rms}`);
 await mkdir('docs/previews',{recursive:true});await copyFile(video,'docs/previews/body-layout.mp4');
 for(const [i,name] of ['4-3','1-1'].entries())await run(ffmpegPath,['-y','-v','error','-ss',String(i+.4),'-i',video,'-frames:v','1',`docs/previews/body-${name}.jpg`]);
 await writeFile('docs/previews/body-manifest.json',JSON.stringify({resolution:'1080x1920',seconds:2,layouts:['4:3','1:1'],source:'Generated 640x480 video with 440 Hz sine; trim 0.2s and loop',signOpacity:.4,originalAudioVolume:.35,audioRms:rms,checkedAt:new Date().toISOString()},null,2));
 console.log(`Rendered Body 4:3 + 1:1, 1080x1920, 2s. Audio RMS ${rms.toFixed(5)} (one original audio track).`);
}finally{await rm(root,{recursive:true,force:true});}
