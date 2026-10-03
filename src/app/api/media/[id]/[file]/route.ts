import {NextRequest} from 'next/server';import {createReadStream} from 'node:fs';import {stat} from 'node:fs/promises';import path from 'node:path';import {Readable} from 'node:stream';import {endpoint} from '@/lib/http';import {store,AppError} from '@/lib/store';import {idSchema} from '@/lib/model';
export const runtime='nodejs';
export const GET=endpoint(async(req:NextRequest)=>{
 const parts=new URL(req.url).pathname.split('/');const id=idSchema.parse(parts.at(-2));const file=parts.at(-1)!;
 if(!/^[a-zA-Z0-9_-]+\.[a-z0-9]+$/.test(file))throw new AppError('Tên file không hợp lệ.');
 const p=await store.getProject(id);const a=p.assets.find(a=>a.file===file);let mime=a?.mime;
 if(!a){const jobs=await store.listJobs(id);mime=jobs.filter(j=>j.state==='succeeded').flatMap(j=>j.outputs||[]).find(o=>o.file===file)?.mime;}
 if(!mime)throw new AppError('Không tìm thấy file.',404);
 const full=path.join(store.root,'media',id,file);const info=await stat(full);const headers:Record<string,string>={'Content-Type':mime,'Accept-Ranges':'bytes','Cache-Control':'private, max-age=3600','X-Content-Type-Options':'nosniff'};
 if(new URL(req.url).searchParams.has('download'))headers['Content-Disposition']=`attachment; filename="${file}"`;
 const range=req.headers.get('range');let start=0,end=info.size-1,status=200;
 if(range){const match=/^bytes=(\d*)-(\d*)$/.exec(range);if(!match||(!match[1]&&!match[2]))return new Response(null,{status:416,headers:{'Content-Range':`bytes */${info.size}`}});
  if(!match[1])start=Math.max(0,info.size-Number(match[2]));else{start=Number(match[1]);if(match[2])end=Math.min(end,Number(match[2]));}
  if(start>end||start>=info.size)return new Response(null,{status:416,headers:{'Content-Range':`bytes */${info.size}`}});status=206;headers['Content-Range']=`bytes ${start}-${end}/${info.size}`;
 }
 headers['Content-Length']=String(end-start+1);return new Response(Readable.toWeb(createReadStream(full,{start,end})) as ReadableStream,{status,headers});
});
