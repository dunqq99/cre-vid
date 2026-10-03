import {AppError} from '../store';
export class SocialApiError extends AppError {constructor(message:string,public ambiguous=false){super(message,502);}}
export type ApiFetch=typeof fetch;
// Never expose provider response bodies: they may echo tokens or request parameters.
export async function socialRequest(url:string,init:RequestInit={},fetcher:ApiFetch=fetch):Promise<any>{
 let response:Response;
 try{response=await fetcher(url,{...init,redirect:'error',signal:AbortSignal.timeout(120_000)});}catch{throw new SocialApiError('Không nhận được phản hồi từ nền tảng. Kiểm tra mạng và lịch sử đăng.',true);}
 if(!response.ok){const code=response.status;throw new SocialApiError(code===401?'Phiên đăng nhập hết hạn. Hãy kết nối lại.':code===403?'Ứng dụng hoặc tài khoản chưa có quyền đăng. Kiểm tra quyền API và gói dịch vụ.':code===429?'Nền tảng đang giới hạn yêu cầu. Hãy thử lại sau.':`Nền tảng từ chối yêu cầu (HTTP ${code}). Kiểm tra cấu hình và điều kiện video.`,code>=500);}
 if(response.status===204)return {};
 try{const raw=await response.text();return raw?JSON.parse(raw):{};}catch{throw new SocialApiError('Phản hồi nền tảng không hợp lệ. Kiểm tra lịch sử đăng.',true);}
}
export const bearer=(token:string)=>({Authorization:`Bearer ${token}`});
export const form=(values:Record<string,string>)=>({method:'POST',body:new URLSearchParams(values)});
export function remoteId(value:unknown){if(typeof value!=='string'||!/^\d+$/.test(value))throw new SocialApiError('Nền tảng không trả về mã nội dung hợp lệ.',true);return value;}
