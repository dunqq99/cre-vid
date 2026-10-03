'use client';
import React from 'react';
import type {Asset,Scene} from '@/lib/model';
export function MediaControls({scene,asset,onChange}:{scene:Scene;asset:Asset;onChange:(changes:Partial<Scene>)=>void}){
 return <>
  <p className="muted small">{asset.kind==='video'?'Video':'Ảnh'} · {asset.width} × {asset.height}{asset.duration?` · ${asset.duration.toFixed(1)} giây`:''}</p>
  <label>Hiển thị<select aria-label="Hiển thị tư liệu" value={scene.fit} onChange={e=>onChange({fit:e.target.value as Scene['fit']})}><option value="cover">Phủ đầy khung · cắt phần thừa</option><option value="contain">Giữ toàn bộ hình</option></select></label>
  <label>Vị trí ngang<span className="value-badge">{scene.cropX}%</span><input aria-label="Vị trí ngang" type="range" min="0" max="100" value={scene.cropX} onChange={e=>onChange({cropX:Number(e.target.value)})}/></label>
  <label>Vị trí dọc<span className="value-badge">{scene.cropY}%</span><input aria-label="Vị trí dọc" type="range" min="0" max="100" value={scene.cropY} onChange={e=>onChange({cropY:Number(e.target.value)})}/></label>
  <small>Chỉnh vùng ảnh/video muốn giữ khi cắt. Nếu tỷ lệ nguồn trùng khung và không có phần thừa, thanh vị trí không làm dịch hình.</small>
  <button className="text-button" onClick={()=>onChange({cropX:50,cropY:50})}>Căn giữa tư liệu</button>
  {scene.kind==='body'&&scene.bodyLayout!=='full'&&<label>Vị trí khung tư liệu<span className="value-badge">{Math.round((scene.bodyOffsetY??.08)*100)}%</span><input aria-label="Vị trí khung tư liệu" type="range" min="-40" max="40" value={Math.round((scene.bodyOffsetY??.08)*100)} onChange={e=>onChange({bodyOffsetY:Number(e.target.value)/100})}/><small>Dương: lên trên · Âm: xuống dưới. Khung dừng tại mép video.</small></label>}
  {asset.kind==='image'&&<>
   <label>Hiệu ứng ảnh<select aria-label="Hiệu ứng ảnh" value={scene.motion||'none'} onChange={e=>onChange({motion:e.target.value as Scene['motion']})}><option value="none">Đứng yên</option><option value="zoom-in">Zoom in · Phóng gần</option><option value="zoom-out">Zoom out · Thu xa</option><option value="pan-left">Lướt sang trái</option><option value="pan-right">Lướt sang phải</option></select></label>
   {(scene.motion||'none')!=='none'&&<label>Mức chuyển động<span className="value-badge">{Math.round((scene.motionAmount??.15)*100)}%</span><input aria-label="Mức chuyển động" type="range" min="5" max="50" step="1" value={Math.round((scene.motionAmount??.15)*100)} onChange={e=>onChange({motionAmount:Number(e.target.value)/100})}/><small>Chuyển động kéo dài suốt cảnh, gồm cả thời gian lời đọc. Lướt ảnh sẽ phóng nhẹ để không hở mép.</small></label>}
  </>}
  {asset.kind==='video'&&<><label>Bắt đầu clip (giây)<input aria-label="Bắt đầu clip" type="number" min="0" max={Math.max(0,(asset.duration||1)-.1)} step=".1" value={scene.trimStart} onChange={e=>onChange({trimStart:Math.min(Math.max(0,(asset.duration||1)-.1),Math.max(0,Number(e.target.value)||0))})}/></label><label className="toggle-label">Tắt tiếng gốc<input type="checkbox" checked={scene.muteOriginal} onChange={e=>onChange({muteOriginal:e.target.checked})}/></label><p className="muted small">Clip ngắn hơn cảnh sẽ lặp lại để không cắt lời đọc.</p></>}
 </>;
}
export function BodyFraming({scene,aspect,onChange}:{scene:Scene;aspect:string;onChange:(changes:Partial<Scene>)=>void}){
 return <label>Bố cục Nội dung / Body<select aria-label="Bố cục Body" value={scene.bodyLayout||'full'} onChange={e=>onChange({bodyLayout:e.target.value as Scene['bodyLayout']})}><option value="full">Đầy khung · {aspect}</option><option value="4:3">Tư liệu 4:3 · nền mờ</option><option value="1:1">Tư liệu 1:1 · nền mờ</option><option value="source">Theo tỷ lệ gốc tư liệu · nền mờ</option></select><small>Áp dụng riêng cho cảnh đang chọn. Chọn tỷ lệ gốc để giữ khung của ảnh/video ngang hoặc dọc; phần còn lại dùng nền mờ.</small></label>;
}
