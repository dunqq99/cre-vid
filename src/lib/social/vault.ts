import {createCipheriv,createDecipheriv,randomBytes} from 'node:crypto';
import {readFile,writeFile,rename,mkdir} from 'node:fs/promises';
import path from 'node:path';
import {Store,AppError} from '../store';
import type {Account,Provider} from './types';

type OAuthState={state:string;browser:string;provider:Provider;verifier:string;redirect:string;expires:number};
type VaultData={accounts:Account[];states:OAuthState[]};
export class SocialVault {
 constructor(public store:Store){}
 private get dir(){return path.join(this.store.root,'social');}
 private async key(){
  await mkdir(this.dir,{recursive:true,mode:0o700});const file=path.join(this.dir,'key');
  try{return await readFile(file);}catch(e){if((e as NodeJS.ErrnoException).code!=='ENOENT')throw e;}
  const key=randomBytes(32);try{await writeFile(file,key,{flag:'wx',mode:0o600});return key;}catch(e){if((e as NodeJS.ErrnoException).code==='EEXIST')return readFile(file);throw e;}
 }
 private async read():Promise<VaultData>{
  try{const bytes=await readFile(path.join(this.dir,'vault'));const decipher=createDecipheriv('aes-256-gcm',await this.key(),bytes.subarray(0,12));decipher.setAuthTag(bytes.subarray(12,28));return JSON.parse(Buffer.concat([decipher.update(bytes.subarray(28)),decipher.final()]).toString());}
  catch(e){if((e as NodeJS.ErrnoException).code==='ENOENT')return {accounts:[],states:[]};throw new AppError('Không mở được kho kết nối. Kiểm tra bản sao lưu thư mục social.',500);}
 }
 private async write(data:VaultData){const key=await this.key(),iv=randomBytes(12),cipher=createCipheriv('aes-256-gcm',key,iv);const encrypted=Buffer.concat([cipher.update(JSON.stringify(data)),cipher.final()]);const file=path.join(this.dir,'vault'),tmp=file+'.tmp';await writeFile(tmp,Buffer.concat([iv,cipher.getAuthTag(),encrypted]),{mode:0o600});await rename(tmp,file);}
 async accounts(){return (await this.read()).accounts;}
 async publicAccounts(){return (await this.accounts()).map(({id,provider,name,remoteId})=>({id,provider,name,remoteId}));}
 async account(id:string){const a=(await this.accounts()).find(a=>a.id===id);if(!a)throw new AppError('Tài khoản đã ngắt kết nối. Hãy kết nối lại.',409);return a;}
 async replace(provider:Provider,accounts:Account[]){await this.store.locked(async()=>{const data=await this.read();data.accounts=[...data.accounts.filter(a=>a.provider!==provider),...accounts];await this.write(data);});}
 async update(account:Account){await this.store.locked(async()=>{const data=await this.read();const i=data.accounts.findIndex(a=>a.id===account.id);if(i<0)throw new AppError('Tài khoản đã ngắt kết nối.',409);data.accounts[i]=account;await this.write(data);});}
 async remove(id:string){await this.store.locked(async()=>{const data=await this.read();data.accounts=data.accounts.filter(a=>a.id!==id);await this.write(data);});}
 async addState(state:OAuthState){await this.store.locked(async()=>{const data=await this.read();data.states=data.states.filter(s=>s.expires>Date.now()).slice(-19);data.states.push(state);await this.write(data);});}
 async consumeState(state:string,browser:string,provider:Provider){return this.store.locked(async()=>{const data=await this.read();const found=data.states.find(s=>s.state===state&&s.browser===browser&&s.provider===provider&&s.expires>Date.now());if(!found)throw new AppError('Phiên kết nối hết hạn hoặc không hợp lệ. Hãy kết nối lại từ Studio.',403);data.states=data.states.filter(s=>s!==found);await this.write(data);return found;});}
}
