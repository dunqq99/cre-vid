import {newScene,textChunks,type Project,type Scene} from './model';
export type ArticleSource=NonNullable<Project['source']>;
export type ScriptDraft={title:string;scenes:Scene[];method:'extractive';note:string};
function shortTitle(text:string,max=140){if(text.length<=max)return text;const clipped=text.slice(0,max-1);return clipped.slice(0,clipped.lastIndexOf(' '))+'…';}

// Deterministic extractive draft: source text stays data, never instructions to execute.
export function suggestScript(source:ArticleSource):ScriptDraft{
 const title=shortTitle(source.title.replace(/\s+/g,' ').trim());
 const sentences=source.text.replace(/\s+/g,' ').trim().match(/[^.!?]+(?:[.!?]+|$)/g)||[source.text];
 const paragraphs:string[]=[];let current='';
 for(const sentence of sentences){
  for(const piece of textChunks(sentence.trim(),260)){
   if(current&&current.length+piece.length+1>260){paragraphs.push(current);current='';}
   current+=(current?' ':'')+piece;
  }
 }
 if(current)paragraphs.push(current);
 const chosen=paragraphs.slice(0,6);
 const sourceName=new URL(source.url).hostname.replace(/^www\./,'');
 const make=(kind:Scene['kind'],text:string,index:number):Scene=>({...newScene(kind),headline:title,text,source:sourceName,
  duration:Math.min(24,Math.max(4,Math.ceil(text.split(/\s+/).length/3.1))),
  tag:kind==='intro'?'ĐIỂM TIN':'DIỄN BIẾN',
  voiceDirection:kind==='intro'?'Đọc dứt khoát; nhấn cụm chính trong tiêu đề, nghỉ một nhịp trước phần diễn biến. Tốc độ gợi ý 1.05×.':'Đọc rõ tên riêng, số liệu và mốc thời gian; nhịp vừa phải 1.0×.',
 });
 const hook=`Điểm tin đáng chú ý: ${title.replace(/[.!?]+$/,'')}.`;
 const scenes=[make('intro',hook,0),...chosen.map((text,i)=>make('body',text,i+1))];
 return {title,scenes,method:'extractive',note:'Bản nháp trích nội dung nguồn, chưa dùng mô hình AI. Kiểm tra tên riêng, số liệu và ngữ cảnh trước khi duyệt. '+(paragraphs.length>chosen.length?'Đã chọn phần đầu bài; xem nguồn để bổ sung các diễn biến còn lại.':'')};
}
