import {randomBytes,createHash} from 'node:crypto';
import {AppError} from '../store';
import {SocialVault} from './vault';
import {bearer,form,remoteId,socialRequest,type ApiFetch} from './api';
import type {Provider,Account} from './types';

export function socialOrigin(){const value=process.env.SOCIAL_ORIGIN||'http://127.0.0.1:3000';const u=new URL(value);if(!['localhost','127.0.0.1','[::1]'].includes(u.hostname)||!['http:','https:'].includes(u.protocol)||u.username||u.password||u.pathname!=='/'||u.search||u.hash)throw new AppError('SOCIAL_ORIGIN phải là địa chỉ localhost của Studio.');return u.origin;}
export function configuration(){const origin=socialOrigin();return Object.fromEntries((['facebook','x'] as const).map(p=>{const keys=p==='facebook'?['FACEBOOK_APP_ID','FACEBOOK_APP_SECRET','FACEBOOK_GRAPH_VERSION']:['X_CLIENT_ID','X_CLIENT_SECRET'];const missing=keys.filter(k=>!process.env[k]?.trim());if(p==='facebook'&&process.env.FACEBOOK_GRAPH_VERSION&&!/^v\d+\.0$/.test(process.env.FACEBOOK_GRAPH_VERSION))missing.push('FACEBOOK_GRAPH_VERSION (vN.0)');return [p,{ready:!missing.length,missing,callback:`${origin}/api/social/callback/${p}`}];})) as Record<Provider,{ready:boolean;missing:string[];callback:string}>;}
export function graphUrl(endpoint:string){const version=process.env.FACEBOOK_GRAPH_VERSION;if(!version||!/^v\d+\.0$/.test(version))throw new AppError('Thiếu FACEBOOK_GRAPH_VERSION hợp lệ.');return `https://graph.facebook.com/${version}/${endpoint}`;}
export async function beginOAuth(provider:Provider,vault:SocialVault){
 const config=configuration()[provider];if(!config.ready)throw new AppError(`Cần cấu hình: ${config.missing.join(', ')}.`);
 const state=randomBytes(32).toString('base64url'),browser=randomBytes(32).toString('base64url'),verifier=randomBytes(48).toString('base64url');
 await vault.addState({state,browser,provider,verifier,redirect:config.callback,expires:Date.now()+600_000});
 const url=new URL(provider==='facebook'?`https://www.facebook.com/${process.env.FACEBOOK_GRAPH_VERSION}/dialog/oauth`:'https://x.com/i/oauth2/authorize');
 url.search=new URLSearchParams({response_type:'code',client_id:process.env[provider==='facebook'?'FACEBOOK_APP_ID':'X_CLIENT_ID']!,redirect_uri:config.callback,state,scope:provider==='facebook'?'pages_show_list,pages_read_engagement,pages_manage_posts':'tweet.read tweet.write users.read media.write offline.access',...(provider==='x'?{code_challenge:createHash('sha256').update(verifier).digest('base64url'),code_challenge_method:'S256'}:{})}).toString();
 return {url:url.toString(),browser};
}
function xAuth(){return {Authorization:`Basic ${Buffer.from(`${process.env.X_CLIENT_ID}:${process.env.X_CLIENT_SECRET}`).toString('base64')}`};}
function token(value:any){if(typeof value?.access_token!=='string'||!value.access_token)throw new AppError('Không nhận được quyền truy cập từ nền tảng.');return value.access_token as string;}
export async function finishOAuth(provider:Provider,state:string,browser:string,code:string,vault:SocialVault,fetcher:ApiFetch=fetch){
 const session=await vault.consumeState(state,browser,provider);
 if(!code)throw new AppError('Bạn đã hủy hoặc chưa cấp quyền kết nối.');
 if(provider==='x'){
  const t=await socialRequest('https://api.x.com/2/oauth2/token',{...form({grant_type:'authorization_code',code,redirect_uri:session.redirect,code_verifier:session.verifier}),headers:xAuth()},fetcher);
  const accessToken=token(t);const me=await socialRequest('https://api.x.com/2/users/me',{headers:bearer(accessToken)},fetcher);const id=remoteId(me.data?.id);
  await vault.replace('x',[{id:`x-${id}`,provider:'x',name:`@${me.data.username}`,remoteId:id,accessToken,refreshToken:t.refresh_token,expiresAt:Date.now()+Number(t.expires_in||7200)*1000}]);
 }else{
  const t=await socialRequest(graphUrl('oauth/access_token'),form({client_id:process.env.FACEBOOK_APP_ID!,client_secret:process.env.FACEBOOK_APP_SECRET!,redirect_uri:session.redirect,code}),fetcher);
  const long=await socialRequest(graphUrl('oauth/access_token'),form({grant_type:'fb_exchange_token',client_id:process.env.FACEBOOK_APP_ID!,client_secret:process.env.FACEBOOK_APP_SECRET!,fb_exchange_token:token(t)}),fetcher);
  const accounts:Account[]=[];let cursor='';
  for(let page=0;page<20;page++){
   const u=new URL(graphUrl('me/accounts'));u.search=new URLSearchParams({fields:'id,name,access_token,tasks',limit:'100',...(cursor?{after:cursor}:{})}).toString();
   const r=await socialRequest(u.toString(),{headers:bearer(token(long))},fetcher);
   for(const a of r.data||[]){if(!a.access_token||!a.tasks?.some((t:string)=>['CREATE_CONTENT','MANAGE','PROFILE_PLUS_CREATE_CONTENT','PROFILE_PLUS_FULL_CONTROL'].includes(t)))continue;const id=remoteId(a.id);accounts.push({id:`facebook-${id}`,remoteId:id,provider:'facebook',name:String(a.name),accessToken:a.access_token});}
   if(!r.paging?.next)break;cursor=r.paging?.cursors?.after;if(!cursor)break;
   if(page===19)throw new AppError('Danh sách Page quá lớn. Cấp quyền cho ít Page hơn rồi kết nối lại.');
  }
  if(!accounts.length)throw new AppError('Không có Page được cấp quyền tạo nội dung. Kiểm tra quyền Page và quyền ứng dụng Meta.');
  await vault.replace('facebook',accounts);
 }
}
export async function freshAccount(account:Account,vault:SocialVault,fetcher:ApiFetch=fetch){
 if(account.provider!=='x'||(account.expiresAt||0)>Date.now()+120_000)return account;
 if(!account.refreshToken)throw new AppError('Phiên X hết hạn. Hãy kết nối lại.');
 const r=await socialRequest('https://api.x.com/2/oauth2/token',{...form({grant_type:'refresh_token',refresh_token:account.refreshToken}),headers:xAuth()},fetcher);
 const updated={...account,accessToken:token(r),refreshToken:r.refresh_token||account.refreshToken,expiresAt:Date.now()+Number(r.expires_in||7200)*1000};await vault.update(updated);return updated;
}
