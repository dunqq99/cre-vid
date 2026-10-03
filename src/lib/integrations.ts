import { lookup } from 'node:dns/promises';
import { isIP, type LookupFunction } from 'node:net';
import { Agent, request } from 'undici';
import { parseHTML } from 'linkedom';
import { Readability } from '@mozilla/readability';
import { AppError } from './store';

type Resolver=(host:string)=>Promise<{address:string;family:number}[]>;
function publicIp(ip:string):boolean {
 if(isIP(ip)===4){const [a,b]=ip.split('.').map(Number);return !(a===0||a===10||a===127||a>=224||(a===169&&b===254)||(a===172&&b>=16&&b<=31)||(a===192&&b===168)||(a===100&&b>=64&&b<=127)||(a===198&&(b===18||b===19)));}
 // Accept only global unicast IPv6; excludes mapped IPv4, loopback, link-local and ULA.
 return isIP(ip)===6&&/^[23][0-9a-f]{3}:/i.test(ip)&&!ip.toLowerCase().startsWith('2001:db8:');
}
export async function assertPublicUrl(raw:string,resolver:Resolver=host=>lookup(host,{all:true})){
 const u=new URL(raw);if(!['https:','http:'].includes(u.protocol)||u.username||u.password||(u.port&&!['80','443'].includes(u.port)))throw new AppError('Chỉ hỗ trợ URL website công khai.');
 const host=u.hostname.replace(/^\[|\]$/g,'');const addresses=isIP(host)?[{address:host,family:isIP(host)}]:await resolver(host);
 if(!addresses.length||addresses.some(a=>!publicIp(a.address)))throw new AppError('Địa chỉ nội bộ không được phép nhập.');
 return {url:u,addresses};
}
// Node requests an array when autoSelectFamily passes all:true. Pin both forms.
export function pinnedLookup(address:{address:string;family:number}) {
 return (_host:string,options:{all?:boolean},callback:(error:null,address:unknown,family?:number)=>void)=>callback(null,options.all?[address]:address.address,address.family);
}
type Download={data:Buffer;url:string;contentType:string};
export async function fetchPublicResource(raw:string,kind:'html'|'image'):Promise<Download>{
 let current=raw;
 const limit=kind==='html'?2_000_000:12_000_000;
 const deadline=AbortSignal.timeout(20000);
 for(let redirects=0;redirects<4;redirects++){
  const {url,addresses}=await assertPublicUrl(current);
  const dispatcher=new Agent({connect:{lookup:pinnedLookup(addresses[0]) as LookupFunction}});
  try{
   const res=await request(url,{dispatcher,method:'GET',headersTimeout:15000,bodyTimeout:15000,signal:deadline,headers:{'user-agent':'CreVid/0.2 (article import)','accept':kind==='html'?'text/html':'image/jpeg,image/png,image/webp'}});
   if([301,302,303,307,308].includes(res.statusCode)&&res.headers.location){res.body.destroy();current=new URL(String(res.headers.location),url).href;continue;}
   if(res.statusCode!==200){res.body.destroy();throw new AppError(`Website trả lỗi ${res.statusCode}. Bạn có thể nhập thủ công.`);}
   const contentType=String(res.headers['content-type']).split(';')[0].trim().toLowerCase();
   if(kind==='html'?contentType!=='text/html':!['image/jpeg','image/png','image/webp'].includes(contentType)){res.body.destroy();throw new AppError(kind==='html'?'URL không trả về trang HTML.':'Ảnh không phải JPG, PNG hoặc WebP.');}
   const chunks:Buffer[]=[];let size=0;
   for await(const chunk of res.body){size+=chunk.length;if(size>limit){res.body.destroy();throw new AppError('Dữ liệu nguồn quá lớn.');}chunks.push(Buffer.from(chunk));}
   return {data:Buffer.concat(chunks),url:url.href,contentType};
  }finally{await dispatcher.close();}
 }
 throw new AppError('Website chuyển hướng quá nhiều lần.');
}
export async function fetchArticle(raw:string){const result=await fetchPublicResource(raw,'html');return extractArticle(result.data.toString('utf8'),result.url);}
export function extractArticle(html:string,url:string){
 const {document}=parseHTML(html);document.querySelectorAll('script,style,iframe,nav,footer,header,aside').forEach(n=>n.remove());
 const images:string[]=[];
 const add=(raw:string|null|undefined)=>{if(!raw)return;try{const u=new URL(raw,url);if(['https:','http:'].includes(u.protocol)&&!u.username&&!u.password&&u.href.length<=2000&&!images.includes(u.href))images.push(u.href);}catch{}};
 document.querySelectorAll('meta[property="og:image"],meta[name="twitter:image"]').forEach(n=>add(n.getAttribute('content')));
 const scope=document.querySelector('article')||document.querySelector('main')||document.body;
 scope?.querySelectorAll('img').forEach(n=>{
  const width=Number(n.getAttribute('width'));const height=Number(n.getAttribute('height'));
  if((width>0&&width<250)||(height>0&&height<150))return;
  const src=n.getAttribute('data-src')||n.getAttribute('data-original')||n.getAttribute('data-lazy-src')||n.getAttribute('src');
  if(src&&!/logo|avatar|icon|tracking|pixel|banner|advert/i.test(src))add(src);
 });
 const pageTitle=document.title;
 const article=new Readability(document as unknown as Document).parse();
 const text=article?.textContent?.replace(/\s+/g,' ').trim();if(!text||text.length<40)throw new AppError('Không lấy được nội dung chính. Hãy dán văn bản thủ công.');
 return {url,title:(article?.title||pageTitle||'Bài nguồn').slice(0,500),text:text.slice(0,100000),fetchedAt:new Date().toISOString(),images:images.slice(0,12)};
}
export function vbeeRequest(text:string,voiceCode:string,speed:number){if(!text.trim()||text.length>300)throw new AppError('Vbee hỗ trợ tối đa 300 ký tự mỗi đoạn. Hãy chia nhỏ lời đọc.');return {text:text.trim(),voiceCode,speed,mode:'sync',outputFormat:'mp3',bitrate:128};}
export function azureSsml(text:string,voice:string,speed:number){if(!/^vi-VN-[A-Za-z]+Neural$/.test(voice))throw new AppError('Giọng Azure không hợp lệ.');const safe=text.replace(/[<>&"']/g,c=>({'<':'&lt;','>':'&gt;','&':'&amp;','"':'&quot;',"'":'&apos;'}[c]!));return `<speak version="1.0" xml:lang="vi-VN"><voice name="${voice}"><prosody rate="${Math.round((speed-1)*100)}%">${safe}</prosody></voice></speak>`;}
export function providerStatus(){return {vbee:!!(process.env.VBEE_TOKEN&&process.env.VBEE_APP_ID),azure:!!(process.env.AZURE_SPEECH_KEY&&process.env.AZURE_SPEECH_REGION),vbeeVoice:process.env.VBEE_VOICE_CODE||'hn_female_ngochuyen_full_48k-fhg'};}
export async function synthesize(text:string,provider:'vbee'|'azure',voiceId:string,speed:number,signal?:AbortSignal){
 if(!providerStatus()[provider])throw new AppError(`Chưa cấu hình ${provider==='vbee'?'Vbee App ID/Token':'Azure Speech Key/Region'} trên server. Bạn có thể nhập MP3/WAV.`);
 let response:Response;
 const timeout=AbortSignal.timeout(120000);const combined=signal?AbortSignal.any([timeout,signal]):timeout;
 if(provider==='vbee')response=await fetch('https://api.vbee.vn/v1/tts',{method:'POST',headers:{Authorization:`Bearer ${process.env.VBEE_TOKEN}`,'App-Id':process.env.VBEE_APP_ID!,'Content-Type':'application/json'},body:JSON.stringify(vbeeRequest(text,voiceId,speed)),signal:combined});
 else{
  const region=process.env.AZURE_SPEECH_REGION!;if(!/^[a-z0-9-]+$/.test(region))throw new AppError('Azure region không hợp lệ.');
  response=await fetch(`https://${region}.tts.speech.microsoft.com/cognitiveservices/v1`,{method:'POST',headers:{'Ocp-Apim-Subscription-Key':process.env.AZURE_SPEECH_KEY!,'Content-Type':'application/ssml+xml','X-Microsoft-OutputFormat':'audio-48khz-192kbitrate-mono-mp3'},body:azureSsml(text,voiceId,speed),signal:combined});
 }
 if(!response.ok||response.headers.get('content-type')?.includes('json'))throw new AppError(`Dịch vụ giọng đọc từ chối yêu cầu (${response.status}). Kiểm tra khóa, giọng đọc và hạn mức.`);
 const data=Buffer.from(await response.arrayBuffer());if(data.length<100||data.length>30_000_000)throw new AppError('Audio trả về không hợp lệ.');return data;
}
