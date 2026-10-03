export const REFERENCE_TEMPLATES=[
 {id:'emerald',name:'Xanh bản đồ',detail:'Mẫu 01 · Chữ hẹp, nền xanh',color:'#16b568'},
 {id:'magenta',name:'Đỏ hồng',detail:'Mẫu 02 · Chuyển sắc, chữ đậm',color:'#f4004c'},
 {id:'bulletin',name:'Khung bản tin',detail:'Mẫu 03 · Tai logo, viền trắng',color:'#f21841'},
 {id:'spotlight',name:'Thẻ nổi bật',detail:'Mẫu 04 · Thẻ trắng, chữ cam',color:'#ff671e'},
] as const;
export const THEMED_TEMPLATES=[
 {id:'sports',name:'Thể thao',detail:'Góc cạnh · Xanh lime',color:'#c5f542'},
 {id:'cinema',name:'Phim ảnh',detail:'Điện ảnh · Đen vàng',color:'#d9b778'},
 {id:'shorts',name:'YouTube Shorts',detail:'Chữ lớn · Trắng đỏ',color:'#ff334b'},
] as const;
export const STUDIO_TEMPLATES=[...REFERENCE_TEMPLATES,...THEMED_TEMPLATES];
export const LEGACY_TEMPLATES=[{id:'breaking',name:'Tin nóng',detail:'Khung đơn',color:'#ee414e'},{id:'editorial',name:'Thời sự',detail:'Nền tối',color:'#407d8b'},{id:'minimal',name:'Lời dẫn',detail:'Tối giản',color:'#cfab70'}] as const;
export type FrameAdjustment={heightScale:number;verticalOffset:number};
export const defaultDesign=()=>({frames:{} as Record<string,FrameAdjustment>,platform:'tiktok' as 'tiktok'|'reels',placement:'safe' as 'safe'|'reference',accent:'#ff671e',highlightTerms:[] as string[],showSocials:true,socialHandle:''});
export function highlightParts(text:string,terms:string[]){
 const phrases=[...new Set(terms.map(s=>s.trim()).filter(Boolean))].sort((a,b)=>b.length-a.length);
 if(!phrases.length)return [{text,highlight:false}];
 const escaped=phrases.map(s=>s.replace(/[.*+?^${}()|[\]\\]/g,'\\$&'));
 const regex=new RegExp(`(${escaped.join('|')})`,'giu');
 return text.split(regex).filter(Boolean).map(part=>({text:part,highlight:phrases.some(t=>t.toLocaleLowerCase('vi')===part.toLocaleLowerCase('vi'))}));
}
