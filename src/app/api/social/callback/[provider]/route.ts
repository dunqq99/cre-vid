import {NextRequest,NextResponse} from 'next/server';
import {guardHost} from '@/lib/http';
import {store} from '@/lib/store';
import {SocialVault} from '@/lib/social/vault';
import {finishOAuth,socialOrigin} from '@/lib/social/oauth';
export const runtime='nodejs';
// OAuth is the ONLY cross-site navigation exception. Host, browser cookie, one-time
// state, provider and expiry are verified before exchanging any authorization code.
export async function GET(req:NextRequest,{params}:{params:Promise<{provider:string}>}){
 const {provider}=await params;let success=false;
 try{
  guardHost(req);if(!['facebook','x'].includes(provider)||new URL(req.url).origin!==socialOrigin())throw new Error('Invalid callback');
  const u=new URL(req.url);const state=u.searchParams.get('state')||'',code=u.searchParams.get('code')||'';
  if(state.length>100||code.length>4096)throw new Error('Invalid callback');
  await finishOAuth(provider as 'facebook'|'x',state,req.cookies.get(`crevid-oauth-${provider}`)?.value||'',code,new SocialVault(store));success=true;
 }catch{/* Never reflect the authorization code, provider error or tokens into HTML/logs. */}
 const body=`<!doctype html><html lang="vi"><meta charset="utf-8"><meta name="viewport" content="width=device-width"><title>Kết nối Cre-vid</title><body><h1>${success?'Đã kết nối tài khoản':'Không thể hoàn tất kết nối'}</h1><p>${success?'Quay lại tab Studio → Output → Xuất bản. Danh sách tài khoản sẽ tự cập nhật.':'Phiên kết nối có thể đã hết hạn, bị từ chối hoặc thiếu quyền API. Kiểm tra cấu hình ứng dụng, quyền Page và thử kết nối lại từ Studio.'}</p><p>Bạn có thể đóng tab này.</p><a href="/">Mở Studio</a></body></html>`;
 const response=new NextResponse(body,{status:success?200:400,headers:{'Content-Type':'text/html; charset=utf-8','Cache-Control':'no-store','Referrer-Policy':'no-referrer','Content-Security-Policy':"default-src 'none'; frame-ancestors 'none'; base-uri 'none'"}});
 if(['facebook','x'].includes(provider))response.cookies.set(`crevid-oauth-${provider}`,'',{httpOnly:true,sameSite:'lax',maxAge:0,path:`/api/social/callback/${provider}`});return response;
}
