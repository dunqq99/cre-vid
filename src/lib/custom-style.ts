export type Palette={primary:string;secondary:string;text:string};
const hex=(rgb:number[])=>'#'+rgb.map(v=>Math.round(v).toString(16).padStart(2,'0')).join('');
export function extractPalette(pixels:ArrayLike<number>):Palette{
 const buckets=new Map<string,{count:number;sum:number[]}>();
 for(let i=0;i<pixels.length;i+=4){if(pixels[i+3]<128)continue;const rgb=[pixels[i],pixels[i+1],pixels[i+2]];const key=rgb.map(v=>Math.floor(v/32)).join(',');const b=buckets.get(key)||{count:0,sum:[0,0,0]};b.count++;rgb.forEach((v,j)=>b.sum[j]+=v);buckets.set(key,b);}
 const colors=[...buckets.values()].sort((a,b)=>b.count-a.count).map(b=>b.sum.map(v=>v/b.count));
 const primary=colors.find(c=>Math.max(...c)-Math.min(...c)>35)||colors[0]||[30,45,60];
 const secondary=colors.find(c=>c.reduce((n,v,i)=>n+(v-primary[i])**2,0)>10000)||primary.map(v=>v*.5);
 const linear=primary.map(v=>{const c=v/255;return c<=.04045?c/12.92:((c+.055)/1.055)**2.4;});
 return {primary:hex(primary),secondary:hex(secondary),text:linear[0]*.2126+linear[1]*.7152+linear[2]*.0722>.35?'#111827':'#ffffff'};
}
export function customStyleName(filename:string,palette:Palette){
 const [r,g,b]=[1,3,5].map(i=>parseInt(palette.primary.slice(i,i+2),16));
 const color=Math.max(r,g,b)-Math.min(r,g,b)<35?'Trung tính':r>g*1.2&&r>b*1.2?'Đỏ':g>r&&g>b?'Xanh lá':b>r?'Xanh lam':'Sắc ấm';
 const base=filename.replace(/\.[^.]+$/,'').replace(/[_-]+/g,' ').trim();
 return `${color} · ${base||'Giao diện riêng'}`.slice(0,80);
}
/** Decode the uploaded, validated local image; it never leaves this application. */
export async function analyzeStyleImage(url:string){
 const image=new Image();image.src=url;await image.decode();
 const canvas=document.createElement('canvas');canvas.width=64;canvas.height=64;
 const ctx=canvas.getContext('2d');if(!ctx)throw new Error('Trình duyệt không hỗ trợ phân tích ảnh.');
 ctx.drawImage(image,0,0,64,64);return extractPalette(ctx.getImageData(0,0,64,64).data);
}
