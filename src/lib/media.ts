import {execFile} from 'node:child_process';
import {promisify} from 'node:util';
import {mkdir,writeFile,rm,stat} from 'node:fs/promises';
import path from 'node:path';
import ffmpegStatic from 'ffmpeg-static';
import ffprobeStatic from 'ffprobe-static';
import {uid,type Asset} from './model';
import {AppError} from './store';
export const ffmpegPath=process.env.FFMPEG_PATH||ffmpegStatic!;
export const ffprobePath=process.env.FFPROBE_PATH||ffprobeStatic.path;
const exec=promisify(execFile);
export type Probe={streams:{codec_type:string;codec_name:string;width?:number;height?:number;duration?:string}[];format:{duration?:string;format_name?:string}};
const inputFormat:Record<string,string>={'.jpg':'jpeg_pipe','.jpeg':'jpeg_pipe','.png':'png_pipe','.webp':'webp_pipe','.mp4':'mov','.mov':'mov','.m4a':'mov','.mp3':'mp3','.wav':'wav'};
export async function probeMedia(file:string):Promise<Probe>{const {stdout}=await exec(ffprobePath,['-v','error','-protocol_whitelist','file','-f',inputFormat[path.extname(file).toLowerCase()],'-show_streams','-show_format','-of','json',file],{timeout:15000,maxBuffer:2_000_000});return JSON.parse(stdout);}
export async function ingestMedia(dir:string,name:string,data:Buffer):Promise<Asset>{
 if(!data.length||data.length>100*1024*1024)throw new AppError('Mỗi file cần có dữ liệu và không vượt 100 MB.');
 const extension=path.extname(name).toLowerCase();if(!['.jpg','.jpeg','.png','.webp','.mp4','.mov','.mp3','.wav','.m4a'].includes(extension))throw new AppError('Hỗ trợ JPG, PNG, WebP, MP4, MOV, MP3, WAV và M4A.');
 await mkdir(dir,{recursive:true});const id=uid();const original=path.join(dir,`${id}-original${extension}`);await writeFile(original,data);
 let output='';
 try{
  const probe=await probeMedia(original);const video=probe.streams.find(s=>s.codec_type==='video');const audio=probe.streams.find(s=>s.codec_type==='audio');
  const imageExt=['.jpg','.jpeg','.png','.webp'].includes(extension);
  const kind:Asset['kind']=imageExt?'image':video?'video':'audio';
  if(imageExt&&!video||(!video&&!audio))throw new Error('No decodable stream');
  const duration=Number(probe.format.duration||audio?.duration||video?.duration);
  if(kind!=='image'&&(!Number.isFinite(duration)||duration<=0||duration>1800))throw new AppError('Media phải dài từ 0 đến 1.800 giây.');
  if(video&&((video.width||0)>8192||(video.height||0)>8192))throw new AppError('Ảnh/video không được vượt 8.192 pixel mỗi chiều.');
  const ext=kind==='image'?'png':kind==='audio'?'wav':'mp4';output=path.join(/* turbopackIgnore: true */ dir,`${id}.${ext}`);
  const args=['-y','-v','error','-threads','2','-protocol_whitelist','file','-f',inputFormat[extension],'-i',original];
  if(kind==='image')args.push('-frames:v','1','-vf','scale=1920:1920:force_original_aspect_ratio=decrease');
  else if(kind==='audio')args.push('-vn','-ac','2','-ar','48000','-c:a','pcm_s16le');
  else args.push('-vf','scale=w=min(1920\\,iw):h=min(1920\\,ih):force_original_aspect_ratio=decrease:force_divisible_by=2,setsar=1','-r','30','-c:v','libx264','-preset','veryfast','-crf','20','-pix_fmt','yuv420p','-c:a','aac','-ar','48000','-movflags','+faststart');
  args.push(output);await exec(ffmpegPath,args,{timeout:300000,maxBuffer:2_000_000});
  const normalized=await probeMedia(output);const stream=normalized.streams.find(s=>s.codec_type==='video');
  return {id,name:name.slice(0,200),kind,file:path.basename(output),mime:kind==='image'?'image/png':kind==='audio'?'audio/wav':'video/mp4',bytes:(await stat(/* turbopackIgnore: true */ output)).size,
   ...(kind==='image'?{}:{duration:Number(normalized.format.duration)}),...(stream?{width:stream.width,height:stream.height}:{})};
 }catch(error){await rm(original,{force:true});if(output)await rm(output,{force:true});if(error instanceof AppError)throw error;throw new AppError('Không đọc được file media. Kiểm tra định dạng hoặc file bị hỏng.');}
}
