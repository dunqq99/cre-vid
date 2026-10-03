'use client';
import React from 'react';
import type {Project} from '@/lib/model';
import {frameAdjustment,frameKey} from '@/lib/frame-settings';
import {defaultDesign,type FrameAdjustment} from '@/lib/templates';
export function FrameControls({project,onPatch}:{project:Project;onPatch:(fn:(p:Project)=>Project)=>void}){
 const values=frameAdjustment(project);
 const update=(changes:Partial<FrameAdjustment>)=>onPatch(p=>({...p,design:{...(p.design||defaultDesign()),frames:{...p.design?.frames,[frameKey(p)]:{...frameAdjustment(p),...changes}}}}));
 const offset=Math.round(values.verticalOffset*100);
 return <div className="custom-styles">
  <div className="section-label">KÍCH THƯỚC & VỊ TRÍ KHUNG</div>
  <label>Chiều cao khung<span className="value-badge">{Math.round(values.heightScale*100)}%</span><input aria-label="Chiều cao khung" type="range" min="50" max="200" step="5" value={Math.round(values.heightScale*100)} onChange={e=>update({heightScale:Number(e.target.value)/100})}/><small>100% là chiều cao gốc. Tăng chiều cao mở rộng khung lên trên; không kéo giãn logo hoặc chữ. Chiều cao tối thiểu chừa đủ chỗ cho nhận diện.</small></label>
  <label>Vị trí lên / xuống<span className="value-badge">{offset===0?'Mặc định':`${offset>0?'Lên':'Xuống'} ${Math.abs(offset)}%`}</span><input aria-label="Vị trí khung" type="range" min="-30" max="30" step="1" value={offset} onChange={e=>update({verticalOffset:Number(e.target.value)/100})}/><small>Tính theo chiều cao video. Giới hạn trong video và chừa chỗ cho phụ đề phía trên khung.</small></label>
  <button className="text-button" type="button" onClick={()=>update({heightScale:1,verticalOffset:0})}>Đặt lại kích thước & vị trí</button>
  <p className="muted small">Lưu riêng cho phong cách đang chọn, gồm từng mẫu ảnh và loại 1/3 hoặc popup. Áp dụng cho Intro / Toàn video và bản xuất.</p>
 </div>;
}
