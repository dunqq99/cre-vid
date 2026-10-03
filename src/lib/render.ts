import {createServer} from 'node:http';import {createReadStream,existsSync} from 'node:fs';import {mkdir,writeFile,stat} from 'node:fs/promises';import {execFile} from 'node:child_process';import {promisify} from 'node:util';import path from 'node:path';
import {bundle} from '@remotion/bundler';import {renderMedia,selectComposition,makeCancelSignal} from '@remotion/renderer';
import {uid,toSrt,type Job} from './model';import {Store,AppError} from './store';import {ffmpegPath,probeMedia} from './media';
let bundlePromise:Promise<string>|undefined;
export function browserPath(){const chrome='/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';return process.env.CHROME_PATH||(existsSync(chrome)?chrome:undefined);}
async function serveMedia(job:Job,store:Store){
 const token=uid();const allowed=new Map(job.snapshot.assets.map(a=>[a.file,a.mime]));
 const server=createServer(async(req,res)=>{try{const u=new URL(req.url||'/','http://localhost');const prefix=`/${token}/api/media/${job.projectId}/`;if(!u.pathname.startsWith(prefix)){res.writeHead(404).end();return;}const file=u.pathname.slice(prefix.length);if(!allowed.has(file)){res.writeHead(404).end();return;}
  const full=path.join(store.root,'media',job.projectId,file);const {size}=await stat(full);let start=0,end=size-1;const range=req.headers.range;
  if(range){const m=/^bytes=(\d+)-(\d*)$/.exec(range);if(!m){res.writeHead(416).end();return;}start=Number(m[1]);if(m[2])end=Math.min(end,Number(m[2]));if(start>end){res.writeHead(416).end();return;}}
  res.writeHead(range?206:200,{'Content-Type':allowed.get(file)!,'Content-Length':end-start+1,'Accept-Ranges':'bytes','Access-Control-Allow-Origin':'*',...(range?{'Content-Range':`bytes ${start}-${end}/${size}`}:{})});createReadStream(full,{start,end}).on('error',()=>res.destroy()).pipe(res);
 }catch{res.writeHead(404).end();}});
 await new Promise<void>((resolve,reject)=>{server.once('error',reject);server.listen(0,'127.0.0.1',()=>resolve());});const address=server.address() as {port:number};
 return {base:`http://127.0.0.1:${address.port}/${token}`,close:()=>{server.closeAllConnections();server.close();}};
}
export async function renderProject(job:Job,store:Store,onProgress:(n:number,message:string)=>void,signal?:AbortSignal){
 const dir=path.join(store.root,'media',job.projectId);await mkdir(dir,{recursive:true});const server=await serveMedia(job,store);const cancel=makeCancelSignal();const cancelListener=()=>cancel.cancel();signal?.addEventListener('abort',cancelListener);
 const name=`${job.id}`;const file=path.join(dir,`${name}.mp4`);
 try{
  onProgress(2,'Chuẩn bị engine và font');
  bundlePromise??=bundle({entryPoint:path.resolve('src/video/index.tsx'),publicDir:path.resolve('public')}).catch(e=>{bundlePromise=undefined;throw e;});const serveUrl=await bundlePromise;
  signal?.throwIfAborted();const inputProps={project:job.snapshot,mediaBase:server.base};
  const composition=await selectComposition({serveUrl,id:'NewsVideo',inputProps,browserExecutable:browserPath()});
  onProgress(5,'Đang dựng cảnh');
  await renderMedia({serveUrl,composition,inputProps,codec:'h264',audioCodec:'aac',outputLocation:file,browserExecutable:browserPath(),concurrency:2,scale:job.options.preset==='draft'?1/3:1,pixelFormat:'yuv420p',x264Preset:'veryfast',crf:20,enforceAudioTrack:true,cancelSignal:cancel.cancelSignal,onProgress:({progress})=>onProgress(Math.round(5+progress*89),'Đang dựng hình và ghép âm thanh')});
  signal?.throwIfAborted();onProgress(95,'Kiểm tra video và tạo bộ xuất bản');const probe=await probeMedia(file);if(!probe.streams.some(s=>s.codec_type==='video'))throw new AppError('File xuất không có hình.');
  await writeFile(path.join(dir,`${name}.srt`),toSrt(job.snapshot));
  await writeFile(path.join(dir,`${name}.json`),JSON.stringify({title:job.snapshot.title,description:job.snapshot.scenes.map(s=>s.text).join('\n\n'),hashtags:['#bantin','#tintuc'],source:job.snapshot.source?.url,revision:job.revision,aspect:job.snapshot.aspect,preset:job.options.preset,createdAt:new Date().toISOString()},null,2));
  await promisify(execFile)(ffmpegPath,['-y','-v','error','-ss','0.3','-i',file,'-frames:v','1',path.join(dir,`${name}.jpg`)],{timeout:30000});
  return [{name:'Video MP4',file:`${name}.mp4`,mime:'video/mp4'},{name:'Phụ đề SRT',file:`${name}.srt`,mime:'text/plain; charset=utf-8'},{name:'Nội dung bài đăng',file:`${name}.json`,mime:'application/json'},{name:'Ảnh bìa',file:`${name}.jpg`,mime:'image/jpeg'}];
 }finally{signal?.removeEventListener('abort',cancelListener);server.close();}
}
