'use client';
import React,{useRef,useState} from 'react';
import {type Project,assetUrl} from '@/lib/model';
export function CustomStyles({project:p,busy,onPatch,onUpload}:{project:Project;busy:boolean;onPatch:(fn:(p:Project)=>Project)=>void;onUpload:(file:File,layout:'lower-third'|'popup')=>void}){
 const [uploadLayout,setUploadLayout]=useState<'lower-third'|'popup'>('lower-third');
 const input=useRef<HTMLInputElement>(null);const styles=p.customStyles||[];const active=p.template==='custom'?styles.find(s=>s.id===p.customStyleId):undefined;
 const change=(values:Partial<NonNullable<typeof active>>)=>onPatch(p=>({...p,customStyles:p.customStyles.map(s=>s.id===active?.id?{...s,...values}:s)}));
 return <div className="custom-styles"><div className="section-label">GIAO DIỆN CỦA BẠN <span>{styles.length}/20</span></div>
  <input aria-label="Ảnh tạo giao diện" ref={input} type="file" accept="image/png,image/jpeg,image/webp" hidden onChange={e=>{const file=e.target.files?.[0];e.target.value='';if(file)onUpload(file,uploadLayout);}}/>
  <label>Loại giao diện khi tải ảnh<select aria-label="Loại giao diện khi tải ảnh" value={uploadLayout} disabled={busy||styles.length>=20} onChange={e=>setUploadLayout(e.target.value as 'lower-third'|'popup')}><option value="lower-third">Tiêu đề 1/3 Intro</option><option value="popup">Popup · thẻ nổi</option></select><small>{uploadLayout==='lower-third'?'Nền phủ 1/3 phía dưới video, logo và tiêu đề nằm ở đầu dải.':'Thẻ tiêu đề nổi, có lề hai bên và bo góc.'}</small></label>
  <button className="button secondary full" disabled={busy||styles.length>=20} onClick={()=>input.current?.click()}>Tải ảnh & tạo giao diện</button>
  <p className="muted small">Tự lấy bảng màu và đặt tên theo ảnh. Tạo khung chữ chỉnh sửa được; chưa tách chữ/logo có sẵn trong ảnh. Mẫu được lưu trong dự án này.</p>
  {!!styles.length&&<label>Giao diện đã tạo<select aria-label="Giao diện custom" value={active?.id||''} onChange={e=>onPatch(p=>({...p,template:'custom',customStyleId:e.target.value}))}><option value="" disabled>Chọn giao diện riêng</option>{styles.map(s=><option key={s.id} value={s.id}>{s.name}</option>)}</select></label>}
  {active&&<>
   <div className="custom-style-source"><img src={assetUrl(p,active.assetId)} alt="Ảnh nguồn của giao diện"/><span>Ảnh nguồn · {p.assets.find(a=>a.id===active.assetId)?.name}</span></div>
   <label>Tên giao diện<input aria-label="Tên giao diện custom" maxLength={80} value={active.name} onChange={e=>change({name:e.target.value||'Giao diện riêng'})}/></label>
   <label>Loại giao diện<select aria-label="Loại giao diện custom" value={active.layout||'popup'} onChange={e=>change({layout:e.target.value as 'lower-third'|'popup'})}><option value="lower-third">Tiêu đề 1/3 Intro</option><option value="popup">Popup · thẻ nổi</option></select><small>Áp dụng theo lựa chọn Chỉ Intro / Toàn video của dự án.</small></label>
   <label>Cách dùng ảnh<select aria-label="Cách dùng ảnh custom" value={active.mode} onChange={e=>change({mode:e.target.value as 'adapt'|'image'})}><option value="adapt">Lấy bảng màu · chữ chỉnh sửa được</option><option value="image">Dùng nguyên ảnh trong khung tiêu đề</option></select><small>Ảnh nguyên sẽ được cắt phủ khung; chữ có sẵn trong ảnh vẫn còn.</small></label>
   <div className="field-row"><label>Màu chính<input aria-label="Màu chính custom" type="color" value={active.primary} onChange={e=>change({primary:e.target.value})}/></label><label>Màu phụ<input aria-label="Màu phụ custom" type="color" value={active.secondary} onChange={e=>change({secondary:e.target.value})}/></label><label>Màu chữ<input aria-label="Màu chữ custom" type="color" value={active.text} onChange={e=>change({text:e.target.value})}/></label></div>
   {(active.layout||'popup')==='popup'&&<label>Bo góc khung<input aria-label="Bo góc khung custom" type="range" min="0" max="100" value={active.roundness} onChange={e=>change({roundness:Number(e.target.value)})}/></label>}
  </>}
 </div>;
}
