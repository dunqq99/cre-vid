import { z } from 'zod';
import {defaultDesign} from './templates';

export const FPS = 30;
export const idSchema = z.string().regex(/^[a-zA-Z0-9_-]{1,80}$/);
export const assetSchema = z.object({
  id:idSchema, name:z.string().max(200), kind:z.enum(['image','video','audio']),
  file:z.string().regex(/^[a-zA-Z0-9_-]+\.[a-z0-9]+$/), mime:z.string(), bytes:z.number().nonnegative(),
  sourceUrl:z.string().max(2000).optional(), duration:z.number().positive().optional(), width:z.number().optional(), height:z.number().optional(),
});
export type Asset = z.infer<typeof assetSchema>;
export const sceneSchema = z.object({
  id:idSchema, kind:z.enum(['intro','body','outro']).transform(kind=>kind==='outro'?'body' as const:kind), headline:z.string().max(180), text:z.string().max(3000),
  duration:z.number().min(1).max(180), mediaId:idSchema.optional(), trimStart:z.number().min(0).max(36000),
  cropX:z.number().min(0).max(100), cropY:z.number().min(0).max(100), fit:z.enum(['cover','contain']),
  bodyLayout:z.enum(['full','4:3','1:1','source']).default('full'), bodyOffsetY:z.number().min(-.4).max(.4).default(.08), motion:z.enum(['none','zoom-in','zoom-out','pan-left','pan-right']).default('none'),motionAmount:z.number().min(.05).max(.5).default(.15), signOpacity:z.number().min(0).max(1).default(1),
  insetIds:z.array(idSchema).max(2).default([]), voiceDirection:z.string().max(500).default(''), tag:z.string().max(40), source:z.string().max(180), showCaption:z.boolean(), muteOriginal:z.boolean(),
  voice:z.object({assetId:idSchema, text:z.string().max(3000), provider:z.string().max(50), voiceId:z.string().max(200)}).optional(),
});
export type Scene = z.infer<typeof sceneSchema>;
function removeUnusedEnding(value:unknown):unknown {
 if(!Array.isArray(value)||value.length<2)return value;
 const kept=value.filter(s=>!(s&&s.kind==='outro'&&s.headline==='Những góc nhìn đáng chú ý'&&s.text==='Thêm hình ảnh, video và lời dẫn cho phần nội dung này.'&&s.tag==='CẬP NHẬT'&&s.duration===8&&!s.mediaId&&!s.voice&&!s.source&&!(s.insetIds?.length)&&!s.voiceDirection&&s.trimStart===0&&s.cropX===50&&s.cropY===50&&s.fit==='cover'&&s.showCaption===true&&s.muteOriginal===true&&(s.signOpacity??1)===1&&(s.bodyLayout??'full')==='full'&&(s.motion??'none')==='none'&&(s.bodyOffsetY??.08)===.08&&(s.motionAmount??.15)===.15));
 return kept.length?kept:value;
}
export const projectSchema = z.object({
  id:idSchema, revision:z.number().int().positive(), title:z.string().trim().min(1).max(100),
  titleMode:z.enum(['intro','all']).default('intro'), newsTitle:z.string().max(140).default(''),
  template:z.enum(['breaking','editorial','minimal','emerald','magenta','bulletin','spotlight','sports','cinema','shorts','custom']),
  design:z.object({frames:z.record(z.string().min(1).max(110),z.object({heightScale:z.number().min(.5).max(2),verticalOffset:z.number().min(-.3).max(.3)})).default({}),platform:z.enum(['tiktok','reels','shorts']).default('tiktok'),placement:z.enum(['safe','reference']),accent:z.string().regex(/^#[0-9a-fA-F]{6}$/),highlightTerms:z.array(z.string().max(80)).max(16),showSocials:z.boolean(),socialHandle:z.string().max(40)}).default(defaultDesign), aspect:z.enum(['9:16','16:9','1:1']),
  customStyleId:idSchema.optional(), customStyles:z.array(z.object({id:idSchema,name:z.string().trim().min(1).max(80),assetId:idSchema,layout:z.enum(['lower-third','popup']).default('popup'),mode:z.enum(['adapt','image']),primary:z.string().regex(/^#[0-9a-fA-F]{6}$/),secondary:z.string().regex(/^#[0-9a-fA-F]{6}$/),text:z.string().regex(/^#[0-9a-fA-F]{6}$/),roundness:z.number().min(0).max(100)})).max(20).default([]),
  brand:z.object({nameScale:z.number().min(.5).max(3).default(1),logoRoundness:z.number().min(0).max(100).default(0),logoScale:z.number().min(.5).max(10).default(1),display:z.enum(['both','logo','name']).default('both'),name:z.string().max(30), color:z.string().regex(/^#[0-9a-fA-F]{6}$/), watermark:z.string().max(40), logoId:idSchema.optional()}),
  scenes:z.preprocess(removeUnusedEnding,z.array(sceneSchema).min(1).max(30)), assets:z.array(assetSchema).max(50),
  musicId:idSchema.optional(), musicVolume:z.number().min(0).max(0.5),
  source:z.object({url:z.string().max(2000),title:z.string().max(500),text:z.string().max(100000),fetchedAt:z.string(),images:z.array(z.string().max(2000)).max(12).optional()}).optional(),
  updatedAt:z.string(),
});
export type Project = z.infer<typeof projectSchema>;
export type JobOptions = {preset?:'draft'|'full'; sceneId?:string; provider?:'vbee'|'azure'; voiceId?:string; speed?:number};
export type Job = {
  id:string; projectId:string; revision:number; kind:'render'|'voice'; state:'queued'|'running'|'succeeded'|'failed'|'canceled';
  snapshot:Project; options:JobOptions; progress:number; message:string; createdAt:string; startedAt?:string; finishedAt?:string;
  heartbeat?:string; elapsed?:number; error?:string; outputs?:{name:string;file:string;mime:string}[];
};
export const uid = () => globalThis.crypto.randomUUID();
export function newScene(kind:Scene['kind']='body'):Scene {
  return {id:uid(),kind,headline:kind==='intro'?'Câu chuyện của bạn bắt đầu từ đây':'Những góc nhìn đáng chú ý',
    text:kind==='intro'?'Chào mừng bạn đến với bản tin. Hãy thêm lời dẫn để bắt đầu câu chuyện của mình.':'Thêm hình ảnh, video và lời dẫn cho phần nội dung này.',
    bodyLayout:'full',bodyOffsetY:.08,motion:'none',motionAmount:.15, signOpacity:1, insetIds:[], voiceDirection:'', duration:kind==='intro'?5:8, trimStart:0,cropX:50,cropY:50,fit:'cover',tag:kind==='intro'?'BẢN TIN':'CẬP NHẬT',source:'',showCaption:true,muteOriginal:true};
}
export function newProject(title='Bản tin đầu tiên'):Project {
 return {id:uid(),revision:1,title,design:defaultDesign(),titleMode:'intro',newsTitle:'',template:'breaking',aspect:'9:16',brand:{nameScale:1,logoRoundness:0,logoScale:1,display:'both',name:'CRE NEWS',color:'#ee414e',watermark:'CRE NEWS'},
 scenes:[newScene('intro'),newScene('body')],customStyles:[],assets:[],musicVolume:0.12,updatedAt:new Date().toISOString()};
}
export function sceneFrames(scene:Scene,assets:Asset[]):number {
 const voice=assets.find(a=>a.id===scene.voice?.assetId);
 return Math.ceil(Math.max(scene.duration,voice?.duration||0)*FPS);
}
export function timeline(p:Project) {
 let from=0;
 return p.scenes.map(scene=>{const duration=sceneFrames(scene,p.assets);const item={scene,from,duration};from+=duration;return item;});
}
export function durationFrames(p:Project){return timeline(p).reduce((n,s)=>n+s.duration,0);}
export function dimensions(aspect:Project['aspect']) {return aspect==='16:9'?{width:1920,height:1080}:aspect==='1:1'?{width:1080,height:1080}:{width:1080,height:1920};}
export function validateProject(p:Project):string[] {
 const errors:string[]=[];
 if(durationFrames(p)>180*FPS)errors.push('Tổng thời lượng vượt 180 giây. Hãy rút ngắn hoặc chia bản tin.');
 const ids=new Set(p.scenes.map(s=>s.id)); if(ids.size!==p.scenes.length)errors.push('ID cảnh bị trùng.');
 for(const [i,s] of p.scenes.entries()){
  const name=`Cảnh ${i+1}`;
  if((s.insetIds||[]).some(id=>!p.assets.some(a=>a.id===id&&a.kind==='image')))errors.push(`${name}: ảnh tròn cần là tư liệu ảnh hợp lệ.`);
  if(s.voice && (!p.assets.some(a=>a.id===s.voice!.assetId&&a.kind==='audio')||s.voice.text!==s.text))errors.push(`${name}: giọng đọc cần cập nhật theo lời dẫn mới.`);
  if(s.mediaId&&!p.assets.some(a=>a.id===s.mediaId&&a.kind!=='audio'))errors.push(`${name}: thiếu tư liệu ảnh/video.`);
  const a=p.assets.find(a=>a.id===s.mediaId);
  if(a?.kind==='video'&&s.trimStart>=(a.duration||0))errors.push(`${name}: điểm cắt vượt thời lượng clip.`);
  if(s.headline.length>140)errors.push(`${name}: tiêu đề quá dài (tối đa 140 ký tự để render).`);
  if(s.text.split(/\s+/).some(w=>w.length>32))errors.push(`${name}: một từ phụ đề quá dài để hiển thị.`);
 }
 if(p.template==='custom'){const style=p.customStyles?.find(t=>t.id===p.customStyleId);if(!style)errors.push('Chưa chọn giao diện custom.');else if(!p.assets.some(a=>a.id===style.assetId&&a.kind==='image'))errors.push('Giao diện custom thiếu ảnh nguồn.');}
 if(p.brand.logoId&&!p.assets.some(a=>a.id===p.brand.logoId&&a.kind==='image'))errors.push('Logo không hợp lệ.');
 if(p.musicId&&!p.assets.some(a=>a.id===p.musicId&&a.kind==='audio'))errors.push('Nhạc nền không hợp lệ.');
 return errors;
}
export function textChunks(text:string,max=62):string[]{
 const words=text.trim().split(/\s+/).filter(Boolean);const out:string[]=[];let line='';
 for(const word of words){if(line&&(line.length+1+word.length>max)){out.push(line);line='';}line+=(line?' ':'')+word;}
 if(line)out.push(line);return out;
}
export function captions(p:Project) {
 return timeline(p).flatMap(({scene,from,duration})=>{
  if(!scene.showCaption)return [];
  const chunks=textChunks(scene.text);const weight=chunks.reduce((n,t)=>n+t.length,0);let offset=0;
  return chunks.map((text,i)=>{const start=(from+offset)/FPS;offset=i===chunks.length-1?duration:offset+duration*text.length/weight;return {text,start,end:(from+offset)/FPS};});
 });
}
function srtTime(s:number){const ms=Math.round(s*1000);return `${String(Math.floor(ms/3600000)).padStart(2,'0')}:${String(Math.floor(ms/60000)%60).padStart(2,'0')}:${String(Math.floor(ms/1000)%60).padStart(2,'0')},${String(ms%1000).padStart(3,'0')}`;}
export function toSrt(p:Project){return captions(p).map((c,i)=>`${i+1}\n${srtTime(c.start)} --> ${srtTime(c.end)}\n${c.text}\n`).join('\n');}
export function assetUrl(p:Project,id:string|undefined,base='') {const asset=p.assets.find(a=>a.id===id);return asset?`${base}/api/media/${p.id}/${asset.file}`:undefined;}
