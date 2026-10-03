import {newScene,type Asset,type Scene} from './model';
/** Each uploaded visual gets independent editable narration, timing, and framing. */
export function bodySceneFromMedia(asset:Asset):Scene{
 if(asset.kind==='audio')throw new Error('Chọn ảnh hoặc video để tạo cảnh Nội dung.');
 return {...newScene('body'),headline:asset.name.replace(/\.[^.]+$/,'').trim().slice(0,180)||'Nội dung mới',text:'',mediaId:asset.id,bodyLayout:'source',fit:'contain',duration:asset.kind==='video'?Math.max(1,Math.min(8,asset.duration||8)):5};
}
