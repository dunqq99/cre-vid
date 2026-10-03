import {it,expect} from 'vitest';
import {mkdtemp,readFile,rm} from 'node:fs/promises';
import os from 'node:os';import path from 'node:path';
import {execFile} from 'node:child_process';import {promisify} from 'node:util';
import ffmpeg from 'ffmpeg-static';
import {ingestMedia,probeMedia} from '../src/lib/media';
it('rejects an invalid media file and normalizes a real video with duration',async()=>{
 const root=await mkdtemp(path.join(os.tmpdir(),'crevid-media-'));
 try{
  await expect(ingestMedia(root,'bad.mp4',Buffer.from('not video'))).rejects.toThrow();
  const file=path.join(root,'source.mp4');
  await promisify(execFile)(ffmpeg!,['-y','-f','lavfi','-i','color=c=blue:s=160x240:d=1','-c:v','libx264','-pix_fmt','yuv420p',file]);
  const a=await ingestMedia(root,'Clip.mp4',await readFile(file));
  expect(a.kind).toBe('video');expect(a.duration).toBeGreaterThanOrEqual(1);expect(a.width).toBe(160);
  expect((await probeMedia(path.join(root,a.file))).streams.some((s:{codec_type:string})=>s.codec_type==='video')).toBe(true);
  const audioFile=path.join(root,'source.wav');
  await promisify(execFile)(ffmpeg!,['-y','-f','lavfi','-i','sine=frequency=440:duration=1',audioFile]);
  const wav=await readFile(audioFile);
  await expect(ingestMedia(root,'disguised.mp4',wav)).rejects.toThrow();
  expect((await ingestMedia(root,'voice.wav',wav)).kind).toBe('audio');
 }finally{await rm(root,{recursive:true,force:true});}
});
