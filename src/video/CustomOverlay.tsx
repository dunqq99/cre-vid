import React from 'react';
import {Img,useVideoConfig} from 'remotion';
import {type Project,type Scene,assetUrl} from '../lib/model';
import {newsLayout} from './layout';import {BrandMark} from './BrandMark';import {FittedTitle} from './FittedTitle';
export function CustomOverlay({project:p,scene,mediaBase}:{project:Project;scene:Scene;mediaBase?:string}){
 const {width,height}=useVideoConfig();const style=p.customStyles?.find(t=>t.id===p.customStyleId);if(!style)return null;
 const l=newsLayout(p,scene),u=Math.min(width,height)/1080,w=width*(1-l.left-l.right),header=height*l.headerHeight;
 const lowerThird=l.customLowerThird,padding=lowerThird?0:26*u;
 return <div data-testid="title-panel" data-custom-style={style.id} data-custom-layout={lowerThird?'lower-third':'popup'} style={{position:'absolute',left:lowerThird?0:width*l.left,right:lowerThird?0:width*l.right,bottom:height*l.panelBottom,height:height*l.panelHeight,borderRadius:lowerThird?0:style.roundness*u,overflow:'hidden',background:`linear-gradient(125deg,${style.primary},${style.secondary})`,boxShadow:lowerThird?undefined:`0 ${8*u}px ${26*u}px #0004`,color:style.mode==='image'?'#ffffff':style.text}}>
  {style.mode==='image'&&<><Img data-testid="custom-style-image" src={assetUrl(p,style.assetId,mediaBase)!} style={{position:'absolute',width:'100%',height:'100%',objectFit:'cover'}}/><div style={{position:'absolute',inset:0,background:'linear-gradient(0deg,#000b,#0005)'}}/></>}
  <div style={{position:'absolute',top:0,left:lowerThird?width*l.left:0,right:lowerThird?width*l.right:0}}>
   <div data-testid="template-brand" style={{height:header,padding:`0 ${padding}px`,display:'flex',alignItems:'center',borderBottom:`${u}px solid ${style.text}44`}}><BrandMark project={p} mediaBase={mediaBase} size={27*u} maxHeight={height*l.logoHeaderHeight*.85} maxWidth={w-2*padding}/></div>
   <div style={{height:height*l.titleHeight,padding:`${14*u}px ${padding}px`,boxSizing:'border-box'}}><FittedTitle text={l.title} maxSize={(l.compact?44:60)*u} minSize={22*u} center={!lowerThird}>{l.title}</FittedTitle></div>
  </div>
 </div>;
}
