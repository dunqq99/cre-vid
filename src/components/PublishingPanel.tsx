'use client';
import {useEffect,useState} from 'react';
import {Send,Link2,ExternalLink} from 'lucide-react';
import type {Job} from '@/lib/model';
import type {SocialStatus,Provider,Publication} from '@/lib/social/types';
const names={facebook:'Facebook Page · Reels',x:'X'};
const states:Record<Publication['state'],string>={queued:'Đang chờ',running:'Đang gửi',succeeded:'Đã đăng',failed:'Thất bại',uncertain:'Cần kiểm tra',canceled:'Đã hủy'};
async function request<T>(projectId:string,body?:unknown):Promise<T>{const res=await fetch(`/api/social?projectId=${projectId}`,body?{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(body)}:{cache:'no-store'});const data=await res.json();if(!res.ok)throw new Error(data.error||'Không kết nối được dịch vụ xuất bản.');return data;}
export function PublishingPanel({projectId,revision,jobs,worker}:{projectId:string;revision:number;jobs:Job[];worker:boolean}){
 const [status,setStatus]=useState<SocialStatus>();const [provider,setProvider]=useState<Provider>('facebook');const [accountId,setAccountId]=useState('');const [renderId,setRenderId]=useState('');const [text,setText]=useState('');const [error,setError]=useState('');const [busy,setBusy]=useState(false);const [review,setReview]=useState(false);const [approved,setApproved]=useState(false);
 useEffect(()=>{let alive=true;const refresh=async()=>{try{const data=await request<SocialStatus>(projectId);if(alive)setStatus(data);}catch(e){if(alive)setError((e as Error).message);}};void refresh();const timer=setInterval(()=>void refresh(),3000);return()=>{alive=false;clearInterval(timer);};},[projectId]);
 const renders=jobs.filter(j=>j.kind==='render'&&j.state==='succeeded'&&j.options.preset==='full');const render=renders.find(j=>j.id===renderId);const accounts=status?.accounts.filter(a=>a.provider===provider)||[];const account=accounts.find(a=>a.id===accountId);const config=status?.configuration[provider];
 const resetReview=()=>{setReview(false);setApproved(false);};
 async function act(body:unknown){setBusy(true);setError('');try{await request(projectId,body);setStatus(await request(projectId));resetReview();}catch(e){setError((e as Error).message);}finally{setBusy(false);}}
 async function connect(){
  const popup=window.open('about:blank','_blank');if(popup){popup.opener=null;popup.document.body.textContent='Đang mở kết nối tài khoản…';}
  setBusy(true);setError('');try{const result=await request<{url:string}>(projectId,{action:'connect',provider});if(popup)popup.location.href=result.url;else{setError('Trình duyệt chặn tab kết nối. Cho phép cửa sổ bật lên rồi thử lại.');}}
  catch(e){popup?.close();setError((e as Error).message);}finally{setBusy(false);}
 }
 const duplicate=status?.publications.some(j=>j.renderId===renderId&&j.accountId===accountId&&!['failed','canceled'].includes(j.state));
 return <section className="publishing-panel" aria-label="Xuất bản mạng xã hội">
  <div className="section-label"><span><Send size={16}/> XUẤT BẢN</span><span>Facebook · X</span></div>
  <p>Chọn bản video đã render và tài khoản sẽ đăng.</p>
  <label>Nền tảng đăng<select value={provider} disabled={busy} onChange={e=>{setProvider(e.target.value as Provider);setAccountId('');resetReview();}}><option value="facebook">Facebook Page · Reels</option><option value="x">X</option></select></label>
  {config&&!config.ready&&<div className="publish-config"><strong>Chưa cấu hình ứng dụng {provider==='facebook'?'Meta':'X'}</strong><p>Thêm các biến sau vào .env.local rồi khởi động lại ứng dụng:</p><code>{config.missing.join(', ')}</code><small>Hướng dẫn: docs/17-social-publishing.md</small></div>}
  {config&&<details className="publish-config"><summary>Địa chỉ callback cần đăng ký</summary><code>{config.callback}</code><small>Kết nối ở đúng địa chỉ localhost này. Nếu nhà cung cấp yêu cầu HTTPS, cần triển khai bản có đăng nhập trước khi mở ra Internet.</small></details>}
  <button type="button" className="button secondary full" disabled={busy||!config?.ready} onClick={()=>void connect()}><Link2 size={15}/>{accounts.length?'Kết nối lại':'Kết nối'} {provider==='facebook'?'Facebook':'X'}</button>
  <label>{provider==='facebook'?'Page nhận video':'Tài khoản X'}<select aria-label={provider==='facebook'?'Page nhận video':'Tài khoản X'} disabled={busy} value={accountId} onChange={e=>{setAccountId(e.target.value);resetReview();}}><option value="">{accounts.length?'Chọn tài khoản':'Chưa có tài khoản kết nối'}</option>{accounts.map(a=><option key={a.id} value={a.id}>{a.name} · {a.remoteId}</option>)}</select></label>
  {account&&<button className="text-button" disabled={busy} onClick={()=>void act({action:'disconnect',accountId})}>Ngắt kết nối {account.name} khỏi Studio</button>}
  <label>Video xuất bản<select aria-label="Video xuất bản" disabled={busy} value={renderId} onChange={e=>{const j=renders.find(j=>j.id===e.target.value);setRenderId(e.target.value);setText(j?.snapshot.title||'');resetReview();}}><option value="">{renders.length?'Chọn bản render':'Cần render bản chính trước'}</option>{renders.map(j=><option key={j.id} value={j.id}>Phiên bản {j.revision} · {new Date(j.createdAt).toLocaleString('vi-VN')}</option>)}</select></label>
  {render&&<><video className="render-preview" controls preload="metadata" src={`/api/media/${projectId}/${render.id}.mp4`}/><small>Đăng đúng file của phiên bản {render.revision}.{render.revision!==revision?' Dự án hiện tại đã thay đổi; render lại nếu muốn dùng chỉnh sửa mới.':''}</small></>}
  <label>Nội dung bài đăng<textarea aria-label="Nội dung bài đăng" rows={4} disabled={busy} value={text} maxLength={provider==='x'?280:5000} onChange={e=>{setText(e.target.value);resetReview();}}/><small>{Array.from(text).length}/{provider==='x'?280:5000} ký tự · {provider==='facebook'?'Reels 9:16, 4–60 giây, bản chính ≥540×960.':'Video tối đa 140 giây. Quyền API và số dư X phải đủ; URL/emoji còn được X kiểm tra.'}</small></label>
  {duplicate&&<p className="warning-text">Video này đã được gửi tới tài khoản đã chọn. Xem trạng thái trong lịch sử bên dưới.</p>}
  {!worker&&<p className="warning-text">Worker chưa hoạt động. Khởi động worker để đăng video.</p>}
  <button className="button secondary full" disabled={busy||!worker||!account||!render||!text.trim()||!!duplicate} onClick={()=>{setReview(true);setApproved(false);}}>Xem lại bài đăng</button>
  {review&&account&&render&&<div className="publish-review"><strong>Duyệt bài đăng · {names[provider]}</strong><p>Tài khoản: <b>{account.name}</b> · {account.remoteId}<br/>Video phiên bản {render.revision}</p><p className="publish-caption">{text}</p><label className="check-label"><input type="checkbox" disabled={busy} checked={approved} onChange={e=>setApproved(e.target.checked)}/> Tôi đã kiểm tra đúng tài khoản, video và nội dung. Đăng công khai ngay.</label><button className="button primary full" disabled={busy||!approved||!worker||!!duplicate} onClick={()=>void act({action:'publish',projectId,renderId,accountId,text,approved:true})}><Send size={15}/>{busy?'Đang gửi yêu cầu…':`Đăng ngay lên ${provider==='facebook'?'Page':'X'}`}</button></div>}
  {error&&<p role="alert" className="warning-text">{error}</p>}
  <div className="section-label">LỊCH SỬ ĐĂNG</div>
  {!status?.publications.length&&<small>Chưa gửi bài đăng nào trong dự án này.</small>}
  {status?.publications.map(j=><article key={j.id} className="job-card"><div><strong>{j.accountName}</strong><span className={`job-state ${j.state}`}>{states[j.state]}</span></div><small>{names[j.provider]} · phiên bản {j.revision} · {new Date(j.createdAt).toLocaleString('vi-VN')}</small><p>{j.message}</p>{j.state==='uncertain'&&<p className="warning-text">Không tự động gửi lại. Kiểm tra bài trên tài khoản/Page trước khi tạo bản đăng mới.{j.mediaId?` Mã media: ${j.mediaId}`:''}</p>}{j.url&&<a className="text-button" href={j.url} target="_blank" rel="noreferrer"><ExternalLink size={14}/> Mở bài đã đăng</a>}{j.provider==='facebook'&&j.state==='uncertain'&&j.mediaId&&<a className="text-button" href={`https://www.facebook.com/reel/${j.mediaId}`} target="_blank" rel="noreferrer">Kiểm tra video trên Facebook</a>}{j.state==='queued'&&<button className="text-button" disabled={busy} onClick={()=>void act({action:'cancel',id:j.id})}>Hủy trước khi gửi</button>}</article>)}
 </section>;
}
