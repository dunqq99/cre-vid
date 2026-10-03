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
