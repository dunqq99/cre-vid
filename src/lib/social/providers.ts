import {open,stat} from 'node:fs/promises';
import {openAsBlob} from 'node:fs';
import {setTimeout as sleep} from 'node:timers/promises';
import {AppError} from '../store';
import {socialRequest,bearer,form,remoteId,SocialApiError,type ApiFetch} from './api';
import {graphUrl} from './oauth';
import type {Account,Publication} from './types';
type Update=(patch:Partial<Publication>)=>Promise<void>;
export async function publishVideo(account:Account,file:string,text:string,update:Update,fetcher:ApiFetch=fetch,wait:(ms:number)=>Promise<unknown>=sleep){
 const size=(await stat(file)).size;
 const call=(url:string,init:RequestInit={})=>socialRequest(url,{...init,headers:{...bearer(account.accessToken),...init.headers}},fetcher);
 if(account.provider==='facebook'){
  const start=await call(graphUrl(`${account.remoteId}/video_reels`),form({upload_phase:'start'}));
  const id=remoteId(start.video_id);await update({mediaId:id,message:'Đang tải video lên Facebook'});
  // Construct the fixed upload host instead of following a URL supplied in a response.
  const uploaded=await socialRequest(`https://rupload.facebook.com/video-upload/${process.env.FACEBOOK_GRAPH_VERSION}/${id}`,{method:'POST',headers:{Authorization:`OAuth ${account.accessToken}`,offset:'0',file_size:String(size),'Content-Type':'application/octet-stream'},body:await openAsBlob(file)},fetcher);
  if(uploaded.success!==true)throw new AppError('Facebook chưa xác nhận tải video thành công.');
  await update({submitted:true,message:'Đang yêu cầu Facebook xuất bản'});
  const finished=await call(graphUrl(`${account.remoteId}/video_reels`),form({video_id:id,upload_phase:'finish',video_state:'PUBLISHED',description:text}));
  if(finished.success!==true)throw new SocialApiError('Facebook chưa xác nhận yêu cầu xuất bản.',true);
  await update({message:'Facebook đang xử lý video'});
  for(let n=0;n<60;n++){
   const r=await call(`${graphUrl(id)}?fields=status`);
   if(r.status?.publishing_phase?.status==='complete')return {postId:id,url:`https://www.facebook.com/reel/${id}`};
   if([r.status?.video_status,r.status?.processing_phase?.status,r.status?.publishing_phase?.status].some(s=>s==='error'||s==='failed'))throw new SocialApiError('Facebook báo lỗi xử lý video. Kiểm tra video trên Page.',true);
   await wait(5000);
  }
  throw new SocialApiError('Facebook chưa xác nhận video đã xuất bản. Kiểm tra Page trước khi đăng lại.',true);
 }
 const start=await call('https://api.x.com/2/media/upload/initialize',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({media_type:'video/mp4',total_bytes:size,media_category:'tweet_video'})});
 const id=remoteId(start.data?.id);await update({mediaId:id,message:'Đang tải video lên X'});
 const fileHandle=await open(file,'r');
 try{for(let offset=0,index=0;offset<size;index++){
  const bytes=Buffer.alloc(Math.min(5*1024*1024,size-offset));const {bytesRead}=await fileHandle.read(bytes,0,bytes.length,offset);if(!bytesRead)throw new AppError('Không đọc được phần tiếp theo của video.');
  const body=new FormData();body.set('segment_index',String(index));body.set('media',new Blob([new Uint8Array(bytes.subarray(0,bytesRead))],{type:'application/octet-stream'}),'chunk');
  await call(`https://api.x.com/2/media/upload/${id}/append`,{method:'POST',body});offset+=bytesRead;
  await update({message:`Đang tải video lên X · ${Math.round(offset/size*100)}%`});
 }}finally{await fileHandle.close();}
 let result=await call(`https://api.x.com/2/media/upload/${id}/finalize`,{method:'POST'});
 for(let n=0;result.data?.processing_info&&result.data.processing_info.state!=='succeeded';n++){
  if(result.data.processing_info.state==='failed')throw new AppError('X không xử lý được video. Kiểm tra định dạng và giới hạn tài khoản.');
  if(n>=60)throw new AppError('X xử lý video quá lâu; chưa gửi bài đăng.');
  await update({message:'X đang xử lý video'});
  await wait(Math.min(10,Math.max(1,Number(result.data.processing_info.check_after_secs)||1))*1000);
  result=await call(`https://api.x.com/2/media/upload?command=STATUS&media_id=${id}`);
 }
 await update({submitted:true,message:'Đang gửi bài đăng lên X'});
 const post=await call('https://api.x.com/2/tweets',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({text,media:{media_ids:[id]}})});
 const postId=remoteId(post.data?.id);return {postId,url:`https://x.com/i/status/${postId}`};
}
