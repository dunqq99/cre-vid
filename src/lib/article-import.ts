import path from 'node:path';
import {fetchArticle,fetchPublicResource} from './integrations';
import {ingestMedia} from './media';
import {suggestScript} from './script';
import {type Store} from './store';

export async function importArticle(store:Store,projectId:string,url:string){
 const source=await fetchArticle(url);
 const before=await store.getProject(projectId);
 const warnings:string[]=[];
 const candidates=source.images.filter(src=>!before.assets.some(a=>a.sourceUrl===src)).slice(0,Math.min(6,50-before.assets.length));
 let imported=0;
 // Limit simultaneous downloads and decoders to three.
 for(let offset=0;offset<candidates.length;offset+=3){
  await Promise.all(candidates.slice(offset,offset+3).map(async(src,index)=>{
   try{
    const image=await fetchPublicResource(src,'image');
    const ext=({'image/jpeg':'jpg','image/png':'png','image/webp':'webp'} as const)[image.contentType as 'image/jpeg'];
    const asset=await ingestMedia(path.join(store.root,'media',projectId),`Ảnh bài báo ${offset+index+1}.${ext}`,image.data);
    if(asset.kind!=='image')throw new Error('File nguồn không phải ảnh.');
    await store.addAsset(projectId,{...asset,sourceUrl:src});imported++;
   }catch(e){warnings.push(`Không lấy được ảnh ${offset+index+1}: ${e instanceof Error?e.message:'Lỗi nguồn ảnh'}`);}
  }));
 }
 if(!source.images.length)warnings.push('Bài báo không có ảnh trích xuất được. Bạn có thể tải ảnh lên thủ công.');
 if(source.images.length>candidates.length)warnings.push('Chỉ nhập tối đa 6 ảnh mới mỗi lần, bỏ qua ảnh đã có và giới hạn 50 tư liệu/dự án.');
 return {source,draft:suggestScript(source),project:await store.getProject(projectId),imported,warnings};
}
export type ArticleImport=Awaited<ReturnType<typeof importArticle>>;
