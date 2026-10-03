import {NextResponse} from 'next/server';
import {z} from 'zod';
import {endpoint,jsonBody} from '@/lib/http';
import {store,AppError} from '@/lib/store';
import {idSchema} from '@/lib/model';
import {PublishQueue} from '@/lib/social/queue';
import {beginOAuth,configuration,socialOrigin} from '@/lib/social/oauth';
export const runtime='nodejs';
const queue=new PublishQueue(store);
const providerSchema=z.enum(['facebook','x']);
export const GET=endpoint(async req=>{
 const projectId=idSchema.parse(new URL(req.url).searchParams.get('projectId'));await store.getProject(projectId);
 return NextResponse.json({accounts:await queue.vault.publicAccounts(),configuration:configuration(),publications:await queue.list(projectId)},{headers:{'Cache-Control':'no-store'}});
});
export const POST=endpoint(async req=>{
 const data=await jsonBody(req);
 if(data.action==='connect'){
  if(new URL(req.url).origin!==socialOrigin())throw new AppError(`Hãy mở Studio tại ${socialOrigin()} để cookie kết nối khớp callback.`);
  const provider=providerSchema.parse(data.provider);const result=await beginOAuth(provider,queue.vault);const response=NextResponse.json({url:result.url});
  response.cookies.set(`crevid-oauth-${provider}`,result.browser,{httpOnly:true,sameSite:'lax',secure:socialOrigin().startsWith('https:'),maxAge:600,path:`/api/social/callback/${provider}`});return response;
 }
 if(data.action==='disconnect'){
  const id=idSchema.parse(data.accountId);if((await queue.list()).some(j=>j.accountId===id&&['running','queued'].includes(j.state)))throw new AppError('Chờ tác vụ đăng hoàn tất hoặc hủy bài đang chờ trước khi ngắt kết nối.',409);
  await queue.vault.remove(id);return NextResponse.json({ok:true});
 }
 if(data.action==='publish')return NextResponse.json(await queue.enqueue(data));
 if(data.action==='cancel'){await queue.cancel(idSchema.parse(data.id));return NextResponse.json({ok:true});}
 throw new AppError('Thao tác không hợp lệ.');
});
