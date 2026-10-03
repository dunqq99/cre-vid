// @refresh reset
import React,{useEffect,useRef,useState} from 'react';
import {delayRender,continueRender,cancelRender} from 'remotion';
export function FittedTitle({text,children,condensed=false,center=false,maxSize=58,minSize=24}:{text:string;children:React.ReactNode;condensed?:boolean;center?:boolean;maxSize?:number;minSize?:number}){
 const ref=useRef<HTMLDivElement>(null);
 const [handle]=useState(()=>delayRender('Căn chữ tiêu đề'));
 useEffect(()=>{
  let active=true;
  const next=delayRender('Đo chữ theo font');
  document.fonts.load(`${condensed?600:800} ${maxSize}px ${condensed?'NewsCondensed':'News'}`,'Tiếng Việt Hà Nội').then(()=>{
   if(!active)return;
   const node=ref.current;
   if(node){let size=maxSize;node.style.fontSize=`${size}px`;while(size>minSize&&((node.firstElementChild?.scrollHeight||0)>node.clientHeight+1||(node.firstElementChild?.scrollWidth||0)>node.clientWidth+1)){size-=1;node.style.fontSize=`${size}px`;}}
   continueRender(next);continueRender(handle);
  }).catch(cancelRender);
  return()=>{active=false;continueRender(next);continueRender(handle);};
 },[text,maxSize,minSize,condensed,handle]);
 return <div ref={ref} data-testid="news-title" style={{display:'flex',flexDirection:'column',justifyContent:center?'center':'flex-start',width:'100%',height:'100%',fontSize:maxSize,fontFamily:condensed?'NewsCondensed, sans-serif':'News, sans-serif',fontWeight:condensed?600:800,lineHeight:condensed?1.38:1.25,whiteSpace:'pre-wrap',wordBreak:'normal',overflowWrap:'normal'}}><div style={{width:'100%',flexShrink:0}}>{children}</div></div>;
}
