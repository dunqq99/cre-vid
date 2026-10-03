import {readdir,stat} from 'node:fs/promises';
import path from 'node:path';
import {z} from 'zod';
import {Store,AppError} from '../store';
import {idSchema,uid} from '../model';
import {probeMedia,type Probe} from '../media';
import {SocialVault} from './vault';
import {freshAccount} from './oauth';
import {publishVideo} from './providers';
import type {Publication,Provider} from './types';
export const publishSchema=z.object({projectId:idSchema,renderId:idSchema,accountId:idSchema,text:z.string().trim().min(1).max(5000),approved:z.literal(true)});
export function validatePublication(provider:Provider,probe:Probe,bytes:number){
 const video=probe.streams.find(s=>s.codec_type==='video'),duration=Number(probe.format.duration);
 if(!video||video.codec_name!=='h264'||!Number.isFinite(duration)||duration<=0)throw new AppError('Cần video MP4 H.264 hợp lệ.');
 if(bytes>512*1024*1024)throw new AppError('Video đăng trực tiếp tối đa 512 MB.');
 if(provider==='x'&&duration>140.1)throw new AppError('Bản tích hợp X hỗ trợ video tối đa 140 giây. Hãy rút ngắn và render lại.');
 // Conservative supported profile from Meta's official Reels collection; not a universal platform limit.
 if(provider==='facebook'&&(duration<4||duration>60.1||!video.width||!video.height||Math.abs(video.width/video.height-9/16)>.01||video.width<540||video.height<960))throw new AppError('Facebook Reels: bản tích hợp hỗ trợ 9:16, tối thiểu 540×960, dài 4–60 giây. Chọn render bản chính.');
}
export class PublishQueue {
 readonly vault:SocialVault;
 constructor(public store:Store){this.vault=new SocialVault(store);}
 private file(id:string){return path.join(this.store.root,'social-jobs',`${idSchema.parse(id)}.json`);}
 async list(projectId?:string){let names:string[];try{names=await readdir(path.join(this.store.root,'social-jobs'));}catch(e){if((e as NodeJS.ErrnoException).code==='ENOENT')return [];throw e;}const all=await Promise.all(names.filter(n=>n.endsWith('.json')).map(n=>this.store.read<Publication>(path.join(this.store.root,'social-jobs',n))));return all.filter(j=>!projectId||j.projectId===projectId).sort((a,b)=>b.createdAt.localeCompare(a.createdAt));}
 get(id:string){return this.store.read<Publication>(this.file(id));}
 async update(id:string,patch:Partial<Publication>){await this.store.locked(async()=>{const j=await this.get(id);await this.store.atomic(this.file(id),{...j,...patch});});}
 async renderFile(projectId:string,renderId:string){
  idSchema.parse(projectId);const job=await this.store.getJob(renderId);
  if(job.projectId!==projectId||job.kind!=='render'||job.state!=='succeeded'||job.options.preset!=='full'||!job.outputs?.some(o=>o.file===`${job.id}.mp4`&&o.mime==='video/mp4'))throw new AppError('Chọn video bản chính đã render thành công trong dự án này.');
  return {job,file:path.join(this.store.root,'media',projectId,`${idSchema.parse(job.id)}.mp4`)};
 }
 async enqueue(input:unknown){
  const data=publishSchema.parse(input);const account=await this.vault.account(data.accountId);
  if(account.provider==='x'&&Array.from(data.text).length>280)throw new AppError('Nội dung X tối đa 280 ký tự; X sẽ kiểm tra thêm trọng số URL/emoji.');
  const {job,file}=await this.renderFile(data.projectId,data.renderId);validatePublication(account.provider,await probeMedia(file),(await stat(file)).size);
  return this.store.locked(async()=>{
   await this.vault.account(data.accountId);
   const existing=(await this.list(data.projectId)).find(j=>j.renderId===data.renderId&&j.accountId===data.accountId&&!['failed','canceled'].includes(j.state));
   if(existing)throw new AppError('Video này đã được gửi tới tài khoản này. Xem lịch sử đăng; tác vụ cần kiểm tra sẽ không được gửi lại tự động.',409);
   const j:Publication={id:uid(),projectId:data.projectId,renderId:data.renderId,revision:job.revision,accountId:account.id,accountName:account.name,provider:account.provider,text:data.text,state:'queued',message:'Đang chờ worker đăng video',createdAt:new Date().toISOString()};await this.store.atomic(this.file(j.id),j);return j;
  });
 }
 async cancel(id:string){await this.store.locked(async()=>{const j=await this.get(id);if(j.state!=='queued')throw new AppError('Chỉ hủy được bài đang chờ. Bài đang gửi cần kiểm tra trên nền tảng.',409);await this.store.atomic(this.file(id),{...j,state:'canceled',message:'Đã hủy trước khi gửi'});});}
 async claim(){return this.store.locked(async()=>{const jobs=await this.list();for(const j of jobs){if(j.state==='running'&&Date.now()-(j.heartbeat||0)>60_000){j.state=j.submitted?'uncertain':'failed';j.message=j.submitted?'Worker bị ngắt lúc đăng. Kiểm tra tài khoản trước khi đăng lại.':'Worker bị ngắt trước khi xuất bản. Có thể thử lại.';await this.store.atomic(this.file(j.id),j);}}
  if(jobs.some(j=>j.state==='running'))return;const j=jobs.reverse().find(j=>j.state==='queued');if(!j)return;j.state='running';j.heartbeat=Date.now();await this.store.atomic(this.file(j.id),j);return j;
 });}
 async runNext(){const j=await this.claim();if(!j)return false;let beating=false;const timer=setInterval(async()=>{if(beating)return;beating=true;try{await this.update(j.id,{heartbeat:Date.now()});}catch{}finally{beating=false;}},5000);
  try{
   const {file}=await this.renderFile(j.projectId,j.renderId);const account=await freshAccount(await this.vault.account(j.accountId),this.vault);
   const result=await publishVideo(account,file,j.text,patch=>this.update(j.id,patch));await this.update(j.id,{...result,state:'succeeded',message:'Đã xuất bản'});
  }catch(e){const latest=await this.get(j.id);await this.update(j.id,{state:latest.submitted?'uncertain':'failed',message:e instanceof AppError?e.message:'Xử lý đăng video thất bại. Kiểm tra kết nối và file render.'});}
  finally{clearInterval(timer);}return true;
 }
}
