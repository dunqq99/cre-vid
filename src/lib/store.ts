import { mkdir, readFile, writeFile, rename, readdir } from 'node:fs/promises';
import path from 'node:path';
import lockfile from 'proper-lockfile';
import { idSchema, newProject, projectSchema, uid, validateProject, type Project, type Asset, type Job, type JobOptions } from './model';
export class AppError extends Error {constructor(message:string,public status=400){super(message);}}
export const dataRoot=()=>path.resolve(/* turbopackIgnore: true */ process.env.CREVID_DATA_DIR||'.data');
export class Store {
 constructor(public root=dataRoot()){}
 async init(){for(const d of ['projects','jobs','media','history'])await mkdir(path.join(/* turbopackIgnore: true */ this.root,d),{recursive:true});}
 async atomic(file:string,value:unknown){await mkdir(path.dirname(file),{recursive:true});const tmp=file+'.'+uid()+'.tmp';await writeFile(tmp,JSON.stringify(value,null,2));await rename(tmp,file);}
 async locked<T>(fn:()=>Promise<T>):Promise<T>{await this.init();const release=await lockfile.lock(this.root,{realpath:false,retries:{retries:50,minTimeout:20,maxTimeout:100},stale:30000});try{return await fn();}finally{await release();}}
 file(kind:'projects'|'jobs',id:string){idSchema.parse(id);return path.join(this.root,kind,`${id}.json`);}
 async read<T>(file:string):Promise<T>{try{return JSON.parse(await readFile(file,'utf8'));}catch(e){if((e as NodeJS.ErrnoException).code==='ENOENT')throw new AppError('Không tìm thấy dữ liệu.',404);throw e;}}
 async listProjects(){await this.init();const files=await readdir(path.join(this.root,'projects'));return (await Promise.all(files.filter(f=>f.endsWith('.json')).map(f=>this.read<Project>(path.join(this.root,'projects',f)).then(p=>projectSchema.parse(p))))).sort((a,b)=>b.updatedAt.localeCompare(a.updatedAt));}
 async getProject(id:string){return projectSchema.parse(await this.read<Project>(this.file('projects',id)));}
 async createProject(title:string){const p=projectSchema.parse(newProject(title));await this.locked(()=>this.atomic(this.file('projects',p.id),p));return p;}
 async persist(p:Project){await this.atomic(path.join(this.root,'history',p.id,`${p.revision}.json`),p);await this.atomic(this.file('projects',p.id),p);return p;}
 async saveProject(input:Project,baseRevision:number){return this.locked(async()=>{const old=await this.getProject(input.id);if(old.revision!==baseRevision)throw new AppError('Dự án đã thay đổi. Hãy tải lại trước khi lưu.',409);
  const p=projectSchema.parse({...input,assets:old.assets,revision:old.revision+1,updatedAt:new Date().toISOString()});return this.persist(p);});}
 async addAsset(projectId:string,asset:Asset){return this.locked(async()=>{const p=await this.getProject(projectId);if(p.assets.length>=50)throw new AppError('Dự án đã đủ 50 tư liệu.');p.assets.push(asset);p.revision++;p.updatedAt=new Date().toISOString();return this.persist(p);});}
 async enqueue(projectId:string,kind:Job['kind'],options:JobOptions,revision:number){return this.locked(async()=>{
  const p=await this.getProject(projectId);if(p.revision!==revision)throw new AppError('Bản lưu đã đổi. Hãy tải lại dự án.',409);
  if(kind==='render'){const errors=validateProject(p);if(errors.length)throw new AppError(errors.join('\n'));}
  if(kind==='voice'&&!p.scenes.some(s=>s.id===options.sceneId&&s.text.trim()))throw new AppError('Chọn cảnh có lời đọc.');
  const existing=(await this.listJobs(projectId)).find(j=>j.kind===kind&&j.revision===revision&&JSON.stringify(j.options)===JSON.stringify(options)&&['queued','running'].includes(j.state));if(existing)return existing;
  const j:Job={id:uid(),projectId,revision,kind,snapshot:structuredClone(p),options,state:'queued',progress:0,message:'Đang chờ xử lý',createdAt:new Date().toISOString()};
  await this.atomic(this.file('jobs',j.id),j);return j;
 });}
 async listJobs(projectId?:string){await this.init();const files=await readdir(path.join(this.root,'jobs'));const jobs=await Promise.all(files.filter(f=>f.endsWith('.json')).map(f=>this.read<Job>(path.join(this.root,'jobs',f))));return jobs.filter(j=>!projectId||j.projectId===projectId).sort((a,b)=>b.createdAt.localeCompare(a.createdAt));}
 async getJob(id:string){return this.read<Job>(this.file('jobs',id));}
 async updateJob(id:string,patch:Partial<Job>){return this.locked(async()=>{const j=await this.getJob(id);if(j.state==='canceled'||(!patch.state&&['succeeded','failed'].includes(j.state)))return j;const n={...j,...patch};await this.atomic(this.file('jobs',id),n);return n;});}
 async cancelJob(id:string){return this.locked(async()=>{const j=await this.getJob(id);if(['queued','running'].includes(j.state)){j.state='canceled';j.message='Đã hủy';j.finishedAt=new Date().toISOString();await this.atomic(this.file('jobs',id),j);}return j;});}
 async claimJob(){return this.locked(async()=>{const jobs=await this.listJobs();for(const j of jobs){if(j.state==='running'&&Date.now()-Date.parse(j.heartbeat||j.startedAt||j.createdAt)>60000){j.state='failed';j.error='Worker bị ngắt. Hãy thử lại từ phiên bản đã lưu.';await this.atomic(this.file('jobs',j.id),j);}}
  if(jobs.some(j=>j.state==='running'))return undefined;const j=jobs.reverse().find(j=>j.state==='queued');if(!j)return undefined;j.state='running';j.startedAt=new Date().toISOString();j.heartbeat=j.startedAt;await this.atomic(this.file('jobs',j.id),j);return j;
 });}
 async attachVoice(job:Job,asset:Asset){return this.locked(async()=>{if((await this.getJob(job.id)).state==='canceled')return;const p=await this.getProject(job.projectId);const source=job.snapshot.scenes.find(s=>s.id===job.options.sceneId)!;p.assets.push(asset);const target=p.scenes.find(s=>s.id===source.id);
  if(target&&target.text===source.text){target.voice={assetId:asset.id,text:source.text,provider:job.options.provider!,voiceId:job.options.voiceId||''};}
  p.revision++;p.updatedAt=new Date().toISOString();await this.persist(projectSchema.parse(p));
 });}
}
export const store=new Store();
