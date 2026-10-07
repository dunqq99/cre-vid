import {spawn,execFile,type ChildProcessWithoutNullStreams} from 'node:child_process';
import {promisify} from 'node:util';
import {createInterface} from 'node:readline';
import {access,mkdir,mkdtemp,readFile,rm,stat} from 'node:fs/promises';
import path from 'node:path';
import {randomUUID} from 'node:crypto';
import ffmpegStatic from 'ffmpeg-static';
import {localVoiceRequest,type LocalTtsStatus} from './voices';

const exec=promisify(execFile);
const config=()=>({
 root:path.resolve(/* turbopackIgnore: true */ process.env.CREVID_DATA_DIR||'.data','tts'),
 python:path.resolve(/* turbopackIgnore: true */ process.env.CREVID_TTS_PYTHON||`.venv-tts/${process.platform==='win32'?'Scripts/python.exe':'bin/python'}`),
 script:path.resolve(/* turbopackIgnore: true */ 'scripts/tts/runtime.py'),
});
const offlineEnv=(root:string)=>({...process.env,HF_HOME:path.join(root,'hf'),HF_HUB_OFFLINE:'1',HF_HUB_DISABLE_TELEMETRY:'1',TRANSFORMERS_OFFLINE:'1',PYTHONUNBUFFERED:'1',PYTHONDONTWRITEBYTECODE:'1',PYTHONUTF8:'1',PYTHONIOENCODING:'utf-8'});
export async function localTtsStatus(overrides:Partial<ReturnType<typeof config>>={}):Promise<LocalTtsStatus>{
 const {python,root,script}={...config(),...overrides};
 try{await access(python);}catch{return {ready:false,state:'not-installed',message:'Chưa cài TTS local. Chạy npm run tts:setup.'};}
 try{
  const manifest=JSON.parse(await readFile(path.join(root,'manifest.json'),'utf8'));
  if(manifest.schema!==1||manifest.sdk!=='3.8.3'||!manifest.verifiedAt||manifest.voices?.male!=='Hải Đăng'||manifest.voices?.female!=='Trúc Ly'||!Array.isArray(manifest.files)||!manifest.files.length)throw new Error('Manifest không hợp lệ.');
  for(const entry of manifest.files){
   if(typeof entry.path!=='string'||!entry.path||path.isAbsolute(entry.path)||entry.path.split(/[\\/]/).includes('..')||!Number.isSafeInteger(entry.bytes)||entry.bytes<=0)throw new Error('Manifest không hợp lệ.');
   if((await stat(path.join(root,entry.path))).size!==entry.bytes)throw new Error('File model bị thiếu hoặc thay đổi.');
  }
 }catch{return {ready:false,state:'missing-model',message:'Model local chưa đầy đủ hoặc chưa kiểm tra. Chạy npm run tts:setup.'};}
 try{await exec(python,[script,'--check','--root',root],{env:offlineEnv(root),timeout:15000,maxBuffer:10000});}
 catch{return {ready:false,state:'error',message:'Môi trường TTS local không hợp lệ. Chạy lại npm run tts:setup.'};}
 return {ready:true,state:'ready',message:'Sẵn sàng · 2 giọng tiếng Việt · chạy trên máy'};
}
let statusCache:{key:string;expires:number;value:Promise<LocalTtsStatus>}|undefined;
export function cachedLocalTtsStatus(){const key=JSON.stringify(config());if(!statusCache||statusCache.key!==key||Date.now()>statusCache.expires)statusCache={key,expires:Date.now()+10000,value:localTtsStatus()};return statusCache.value;}

type Options=Partial<ReturnType<typeof config>>&{timeoutMs?:number;idleMs?:number};
type Reply={id:string;ok:boolean;error?:string};
export class LocalTtsClient{
 private child?:ChildProcessWithoutNullStreams;
 private pending?:{id:string;resolve:(reply:Reply)=>void;reject:(error:Error)=>void};
 private busy=false;private idle?:NodeJS.Timeout;private stderr='';
 constructor(private options:Options={}){}
 private start(){
  if(this.child)return this.child;
  const c={...config(),...this.options};this.stderr='';
  const child=spawn(c.python,[c.script,'--root',c.root],{env:offlineEnv(c.root),stdio:['pipe','pipe','pipe'],windowsHide:true});this.child=child;
  const lines=createInterface({input:child.stdout});
  lines.on('line',line=>{if(line.length>10000)return;try{const reply=JSON.parse(line) as Reply;if(reply.id===this.pending?.id)this.pending.resolve(reply);}catch{/* SDK diagnostics must not become protocol replies. */}});
  child.stderr.on('data',chunk=>{this.stderr=(this.stderr+chunk.toString()).slice(-4000);});
  child.on('error',()=>this.pending?.reject(new Error('Không khởi động được TTS local. Chạy npm run tts:setup.')));
  child.stdin.on('error',()=>this.pending?.reject(new Error('Kết nối tiến trình TTS local bị ngắt.')));
  child.on('close',()=>{lines.close();if(this.child===child){this.child=undefined;this.pending?.reject(new Error(`Tiến trình TTS local bị ngắt.${this.stderr?' '+this.stderr.slice(-700):''}`));}});
  return child;
 }
 async stop(){
  clearTimeout(this.idle);const child=this.child;if(!child)return;
  await new Promise<void>(resolve=>{const force=setTimeout(()=>child.kill('SIGKILL'),1500);child.once('close',()=>{clearTimeout(force);resolve();});child.kill('SIGTERM');});
  if(this.child===child)this.child=undefined;
 }
 async synthesize(text:string,voiceId:string,speed:number,signal?:AbortSignal):Promise<Buffer>{
  const input=localVoiceRequest.parse({text,voiceId,speed});
  if(signal?.aborted)throw new Error('Đã hủy tạo giọng.');
  if(this.busy)throw new Error('TTS local đang xử lý một tác vụ khác.');
  this.busy=true;clearTimeout(this.idle);
  const c={...config(),...this.options};let dir:string|undefined;let timer:NodeJS.Timeout|undefined;let abort:(()=>void)|undefined;
  try{
   await mkdir(c.root,{recursive:true});dir=await mkdtemp(path.join(c.root,'job-'));
   const output=path.join(dir,'voice.wav');const child=this.start();const id=randomUUID();
   const reply=await new Promise<Reply>((resolve,reject)=>{
    this.pending={id,resolve,reject};
    abort=()=>reject(new Error('Đã hủy tạo giọng.'));
    signal?.addEventListener('abort',abort,{once:true});
    timer=setTimeout(()=>reject(new Error('TTS local vượt thời gian chờ 10 phút.')),c.timeoutMs??600000);
    if(signal?.aborted){abort();return;}
    child.stdin.write(JSON.stringify({id,...input,output})+'\n');
   });
   if(!reply.ok)throw new Error(reply.error||'TTS local không tạo được audio.');
   if(signal?.aborted)throw new Error('Đã hủy tạo giọng.');
   const size=(await stat(output)).size;if(size<=44||size>100*1024*1024)throw new Error('Audio WAV trả về không hợp lệ.');
   let bytes=await readFile(output);
   if(bytes.toString('ascii',0,4)!=='RIFF'||bytes.toString('ascii',8,12)!=='WAVE')throw new Error('TTS local không trả về audio WAV hợp lệ.');
   if(speed!==1){
    const adjusted=path.join(dir,'adjusted.wav');
    await exec(process.env.FFMPEG_PATH||ffmpegStatic!,['-y','-v','error','-i',output,'-filter:a',`atempo=${speed}`,'-c:a','pcm_s16le',adjusted],{timeout:60000,signal,maxBuffer:10000});
    bytes=await readFile(adjusted);
   }
   return bytes;
  }catch(error){await this.stop();throw error;}
  finally{
   clearTimeout(timer);if(abort)signal?.removeEventListener('abort',abort);this.pending=undefined;this.busy=false;
   if(dir)await rm(dir,{recursive:true,force:true});
   if(this.child){this.idle=setTimeout(()=>void this.stop(),c.idleMs??30000);this.idle.unref();}
  }
 }
}
const client=new LocalTtsClient();
export const stopLocalTts=()=>client.stop();
export async function synthesizeLocal(text:string,voiceId:string,speed:number,signal?:AbortSignal){
 localVoiceRequest.parse({text,voiceId,speed});
 const status=await cachedLocalTtsStatus();if(!status.ready)throw new Error(status.message);
 return client.synthesize(text,voiceId,speed,signal);
}
