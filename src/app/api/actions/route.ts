import {NextResponse} from 'next/server';import {z} from 'zod';import path from 'node:path';
import {endpoint,jsonBody,limitedBody} from '@/lib/http';import {store,AppError} from '@/lib/store';import {idSchema} from '@/lib/model';import {ingestMedia} from '@/lib/media';import {providerStatus} from '@/lib/integrations';
import {importArticle} from '@/lib/article-import';
export const runtime='nodejs';export const maxDuration=300;
export const GET=endpoint(async req=>{const id=new URL(req.url).searchParams.get('projectId');if(!id)throw new AppError('Thiếu dự án.');await store.getProject(id);return NextResponse.json(await store.listJobs(id));});
export const POST=endpoint(async req=>{
 if(req.headers.get('content-type')?.startsWith('multipart/form-data')){
  const bytes=await limitedBody(req,101*1024*1024);const form=await new Response(new Uint8Array(bytes),{headers:{'Content-Type':req.headers.get('content-type')!}}).formData();
  const projectId=idSchema.parse(form.get('projectId'));const file=form.get('file');if(!(file instanceof File))throw new AppError('Thiếu file.');
  const p=await store.getProject(projectId);if(p.assets.length>=50)throw new AppError('Dự án đã đủ 50 tư liệu.');
  const asset=await ingestMedia(path.join(store.root,'media',projectId),file.name,Buffer.from(await file.arrayBuffer()));
  return NextResponse.json({asset,project:await store.addAsset(projectId,asset)});
 }
 const body=await jsonBody(req);const action=z.enum(['import','render','voice','cancel']).parse(body.action);
 if(action==='cancel')return NextResponse.json(await store.cancelJob(idSchema.parse(body.jobId)));
 const projectId=idSchema.parse(body.projectId);await store.getProject(projectId);
 if(action==='import')return NextResponse.json(await importArticle(store,projectId,z.string().url().max(2000).parse(body.url)));
 const revision=z.number().int().positive().parse(body.revision);
 if(action==='render'){if(body.approved!==true)throw new AppError('Cần duyệt bản xem trước để render.');return NextResponse.json(await store.enqueue(projectId,'render',{preset:z.enum(['draft','full']).parse(body.preset)},revision));}
 const options=z.object({sceneId:idSchema,provider:z.enum(['vbee','azure']),voiceId:z.string().min(1).max(200),speed:z.number().min(0.5).max(1.5)}).parse(body);
 if(!providerStatus()[options.provider])throw new AppError('Chưa cấu hình khóa giọng đọc trên server. Dùng nhập MP3/WAV hoặc xem hướng dẫn cấu hình.');
 if(options.provider==='vbee'){const p=await store.getProject(projectId);if((p.scenes.find(s=>s.id===options.sceneId)?.text.length||0)>300)throw new AppError('Vbee hỗ trợ tối đa 300 ký tự mỗi đoạn. Hãy chia lời đọc thành nhiều cảnh.');}
 return NextResponse.json(await store.enqueue(projectId,'voice',options,revision));
});
