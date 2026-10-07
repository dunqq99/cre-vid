import {it,expect} from 'vitest';
import {mkdtemp,rm,stat} from 'node:fs/promises';import os from 'node:os';import path from 'node:path';
import {Store} from '../src/lib/store';import {renderProject} from '../src/lib/render';import {probeMedia} from '../src/lib/media';
it('renders an actual MP4 and exports matching SRT and publication metadata',async()=>{
 const root=await mkdtemp(path.join(os.tmpdir(),'crevid-render-'));const store=new Store(root);
 try{
  let p=await store.createProject('Kiểm thử video');p.scenes=p.scenes.slice(0,1);p.scenes[0].duration=2;p.template='emerald';p.brand.nameScale=2;p.design.frames.emerald={heightScale:1.5,verticalOffset:.1};
  p=await store.saveProject(p,p.revision);const job=await store.enqueue(p.id,'render',{preset:'draft'},p.revision);
  const output=await renderProject(job,store,()=>{});
  const video=output.find(x=>x.mime==='video/mp4')!;expect(video).toBeDefined();
  const file=path.join(root,'media',p.id,video.file);expect((await stat(file)).size).toBeGreaterThan(1000);
  const meta=await probeMedia(file);expect(meta.streams.find(s=>s.codec_type==='video')?.width).toBe(360);expect(Number(meta.format.duration)).toBeCloseTo(2,1);
  expect(output.some(x=>x.file.endsWith('.srt'))).toBe(true);expect(output.some(x=>x.file.endsWith('.json'))).toBe(true);
 }finally{await rm(root,{recursive:true,force:true});}
},120000);

it('exports intro narration, full-volume original Body audio, and per-scene TTS priority',async()=>{
 const {readFile}=await import('node:fs/promises');const {execFile}=await import('node:child_process');const {promisify}=await import('node:util');
 const {ingestMedia,ffmpegPath}=await import('../src/lib/media');const {bodySceneFromMedia}=await import('../src/lib/media-scenes');
 const {timeline,FPS}=await import('../src/lib/model');
 const root=await mkdtemp(path.join(os.tmpdir(),'crevid-audio-render-'));const store=new Store(root);const exec=promisify(execFile);
 try{
  let p=await store.createProject('TTS mở đầu và tiếng gốc nội dung');const dir=path.join(root,'media',p.id);
  const source=path.join(root,'source.mp4'),narration=path.join(root,'voice.wav');
  await exec(ffmpegPath,['-y','-v','error','-f','lavfi','-i','color=c=blue:size=320x180:rate=30:duration=0.8','-f','lavfi','-i','sine=frequency=880:sample_rate=48000:duration=0.8','-c:v','libx264','-pix_fmt','yuv420p','-c:a','aac','-shortest',source]);
  await exec(ffmpegPath,['-y','-v','error','-f','lavfi','-i','sine=frequency=440:sample_rate=48000:duration=1','-c:a','pcm_s16le',narration]);
  const clip=await ingestMedia(dir,'source.mp4',await readFile(source)),voice=await ingestMedia(dir,'voice.wav',await readFile(narration));
  p=await store.addAsset(p.id,clip);p=await store.addAsset(p.id,voice);
  const intro={...p.scenes[0],text:'Lời tóm tắt',voice:{assetId:voice.id,text:'Lời tóm tắt',provider:'local',voiceId:'female'}};
  const body={...bodySceneFromMedia(clip),headline:'',text:'',duration:1.4,trimStart:0.1};
  const voiced={...bodySceneFromMedia(clip),text:'TTS riêng',voice:{assetId:voice.id,text:'TTS riêng',provider:'local',voiceId:'female'},muteOriginal:false};
  const silent={...bodySceneFromMedia(clip),duration:1,muteOriginal:true};
  p.scenes=[intro,body,voiced,silent];p=await store.saveProject(p,p.revision);
  const job=await store.enqueue(p.id,'render',{preset:'draft'},p.revision);
  const output=await renderProject(job,store,()=>{});const file=path.join(dir,output.find(x=>x.mime==='video/mp4')!.file);
  const tone=async(start:number,frequency:number)=>{
   const {stdout}=await exec(ffmpegPath,['-v','error','-ss',String(start),'-i',file,'-t','0.3','-vn','-ac','1','-ar','48000','-f','f32le','pipe:1'],{encoding:'buffer',maxBuffer:1_000_000});
   const count=stdout.length/4;expect(count).toBeGreaterThan(1000);let real=0,imag=0;
   for(let i=0;i<count;i++){const sample=stdout.readFloatLE(i*4),phase=2*Math.PI*frequency*i/48000;real+=sample*Math.cos(phase);imag+=sample*Math.sin(phase);}
   return 2*Math.hypot(real,imag)/count;
  };
  const times=timeline(p).map(s=>s.from/FPS);
  expect(await tone(.2,440)).toBeGreaterThan(.07);
  // Verify the original sound both before and after the trimmed clip loops.
  expect(await tone(times[1]+.2,880)).toBeGreaterThan(.07);
  expect(await tone(times[1]+.9,880)).toBeGreaterThan(.07);
  expect(await tone(times[1]+.2,880)).toBeLessThan(.17); // blurred background must stay silent
  expect(await tone(times[2]+.2,440)).toBeGreaterThan(.07);
  expect(await tone(times[2]+.2,880)).toBeLessThan(.003);
  expect(await tone(times[3]+.2,880)).toBeLessThan(.003);
 }finally{await rm(root,{recursive:true,force:true});}
},120000);

it('exports a moving image followed by a native-aspect video into one MP4',async()=>{
 const {readFile}=await import('node:fs/promises');const {execFile}=await import('node:child_process');const {promisify}=await import('node:util');
 const {ingestMedia,ffmpegPath}=await import('../src/lib/media');const {bodySceneFromMedia}=await import('../src/lib/media-scenes');
 const root=await mkdtemp(path.join(os.tmpdir(),'crevid-motion-render-'));const store=new Store(root);const exec=promisify(execFile);
 try{
  let p=await store.createProject('Ảnh chuyển động và video');const dir=path.join(root,'media',p.id);
  const photo=await ingestMedia(dir,'photo.png',await readFile('docs/references/news-style-reference.png'));
  p=await store.addAsset(p.id,photo);
  const source=path.join(root,'wide.mp4');await exec(ffmpegPath,['-y','-v','error','-f','lavfi','-i','testsrc2=size=320x180:rate=30:duration=1','-c:v','libx264','-pix_fmt','yuv420p',source]);
  const clip=await ingestMedia(dir,'wide.mp4',await readFile(source));p=await store.addAsset(p.id,clip);
  p.scenes=[{...bodySceneFromMedia(photo),duration:1,motion:'zoom-in',motionAmount:.3},{...bodySceneFromMedia(clip),duration:1}];
  p=await store.saveProject(p,p.revision);const job=await store.enqueue(p.id,'render',{preset:'draft'},p.revision);
  const output=await renderProject(job,store,()=>{});const video=output.find(x=>x.mime==='video/mp4')!;const file=path.join(dir,video.file);
  const meta=await probeMedia(file);expect(Number(meta.format.duration)).toBeCloseTo(2,1);
  const {stdout}=await exec(ffmpegPath,['-v','error','-i',file,'-vf','select=eq(n\\,5)+eq(n\\,25)','-vsync','0','-f','rawvideo','-pix_fmt','rgb24','pipe:1'],{encoding:'buffer',maxBuffer:4_000_000});
  const frameBytes=360*640*3;expect(stdout.length).toBe(frameBytes*2);expect(stdout.subarray(0,frameBytes).equals(stdout.subarray(frameBytes))).toBe(false);
 }finally{await rm(root,{recursive:true,force:true});}
},120000);
