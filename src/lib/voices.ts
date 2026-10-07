import {z} from 'zod';

export const LOCAL_VOICES = [
 {id:'male',name:'Hải Đăng',label:'Nam · Hải Đăng'},
 {id:'female',name:'Trúc Ly',label:'Nữ · Trúc Ly'},
] as const;
export const localVoiceRequest=z.object({
 text:z.string().trim().min(1,'Nhập lời đọc.').max(3000,'Lời đọc tối đa 3.000 ký tự.'),
 voiceId:z.enum(['male','female']),speed:z.number().min(0.5).max(1.5),
});
export type LocalTtsStatus={ready:boolean;state:'not-installed'|'missing-model'|'ready'|'error';message:string};
