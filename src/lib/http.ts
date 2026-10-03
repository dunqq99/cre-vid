import {NextRequest,NextResponse} from 'next/server';
import {ZodError} from 'zod';
import {AppError} from './store';
// Local-only launch: reject DNS rebinding and cross-origin mutations.
export function guardHost(req:NextRequest){
 const host=req.headers.get('host');if(!host||!/^(localhost|127\.0\.0\.1|\[::1\])(?::[0-9]+)?$/.test(host))throw new AppError('Bản local chỉ hỗ trợ localhost.',403);
}
export function guard(req:NextRequest){
 guardHost(req);
 const origin=req.headers.get('origin');if(origin&&origin!==new URL(req.url).origin&&origin!==`http://${req.headers.get('host')}`)throw new AppError('Yêu cầu khác nguồn bị từ chối.',403);
 if(req.headers.get('sec-fetch-site')==='cross-site')throw new AppError('Yêu cầu khác nguồn bị từ chối.',403);
}
export function endpoint(fn:(req:NextRequest)=>Promise<Response>){return async(req:NextRequest)=>{try{guard(req);return await fn(req);}catch(e){if(e instanceof ZodError)return NextResponse.json({error:'Dữ liệu không hợp lệ. Kiểm tra trường nhập và giới hạn.'},{status:400});return NextResponse.json({error:e instanceof Error?e.message:'Có lỗi xảy ra.'},{status:e instanceof AppError?e.status:500});}};}
export async function limitedBody(req:Request,max:number){const reader=req.body?.getReader();if(!reader)throw new AppError('Thiếu dữ liệu.');let size=0;const chunks:Uint8Array[]=[];for(;;){const {value,done}=await reader.read();if(done)break;size+=value.length;if(size>max){await reader.cancel();throw new AppError('Dữ liệu vượt giới hạn.',413);}chunks.push(value);}return Buffer.concat(chunks);}
export async function jsonBody(req:Request){return JSON.parse((await limitedBody(req,2_000_000)).toString('utf8'));}
