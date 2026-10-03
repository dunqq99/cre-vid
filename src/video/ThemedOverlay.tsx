import React from 'react';
import {useVideoConfig} from 'remotion';
import {type Project,type Scene} from '../lib/model';
import {newsLayout} from './layout';
import {BrandMark} from './BrandMark';
import {FittedTitle} from './FittedTitle';

export function ThemedOverlay({project:p,scene,mediaBase}:{project:Project;scene:Scene;mediaBase?:string}){
 const {width,height}=useVideoConfig();const l=newsLayout(p,scene);const u=Math.min(width,height)/1080;
 const sports=p.template==='sports';const cinema=p.template==='cinema';
 const accent=p.brand.color;const w=width*(1-l.left-l.right);const header=height*l.headerHeight;const body=height*l.titleHeight;
 const pad=26*u;const label=sports?'THỂ THAO':cinema?'ĐIỆN ẢNH':'SHORTS';
 const labelSpace=cinema?200*u:180*u;
 return <>
  <div style={{position:'absolute',left:0,right:0,bottom:0,height:height*.3,background:cinema?'linear-gradient(0deg,#080a10e8,transparent)':'linear-gradient(0deg,#07101680,transparent)'}}/>
  <div data-testid="title-panel" style={{position:'absolute',left:width*l.left,right:width*l.right,bottom:height*l.titleBottom,height:header+body,color:cinema?'#fff7e7':sports?'white':'#11131a'}}>
   {sports&&<>
    <div style={{position:'absolute',inset:0,background:'#0b1a23',clipPath:`polygon(0 0,100% 0,100% calc(100% - ${22*u}px),calc(100% - ${22*u}px) 100%,0 100%)`,borderLeft:`${9*u}px solid ${accent}`}}/>
    <div style={{position:'absolute',left:0,right:0,bottom:0,height:6*u,background:accent}}/>
    <div style={{position:'absolute',right:0,bottom:10*u,width:80*u,height:body*.65,background:`repeating-linear-gradient(125deg,transparent 0 12px,${accent}33 12px 17px)`,clipPath:'polygon(70% 0,100% 0,100% 100%,0 100%)'}}/>
   </>}
   {cinema&&<>
    <div style={{position:'absolute',inset:0,background:'linear-gradient(120deg,#14151df5,#090b10ec)',border:`${2*u}px solid ${accent}99`,borderRadius:8*u}}/>
    <div style={{position:'absolute',left:pad,right:pad,bottom:7*u,height:4*u,background:`repeating-linear-gradient(90deg,${accent}66 0 9px,transparent 9px 22px)`}}/>
   </>}
   {!sports&&!cinema&&<>
    <div style={{position:'absolute',inset:0,borderRadius:22*u,background:'#fffefa',boxShadow:`${7*u}px ${8*u}px 0 #090d16`,border:`${3*u}px solid #090d16`}}/>
    <div style={{position:'absolute',left:0,top:0,bottom:0,width:9*u,background:accent,borderRadius:`${22*u}px 0 0 ${22*u}px`}}/>
   </>}
   <div data-testid="template-brand" style={{position:'relative',height:header,display:'flex',alignItems:'center',justifyContent:'space-between',padding:`0 ${pad}px`,gap:16*u,color:cinema?accent:sports?'#edf4f4':'#23232a',borderBottom:`${u}px solid ${cinema?accent+'44':sports?'#ffffff20':'#15192315'}`}}>
    <BrandMark project={p} mediaBase={mediaBase} size={26*u} maxHeight={height*l.logoHeaderHeight*.8} maxWidth={Math.max(60*u,w-2*pad-labelSpace)}/>
    <span style={{fontSize:18*u,fontWeight:800,letterSpacing:2*u,whiteSpace:'nowrap',display:'flex',alignItems:'center',gap:10*u}}>
     {!sports&&!cinema&&<span style={{display:'grid',placeItems:'center',width:28*u,height:32*u,background:accent,color:'white',borderRadius:7*u,fontSize:16*u}}>▶</span>}
     {sports&&<span style={{width:22*u,height:17*u,background:accent,transform:'skew(-18deg)'}}/>}{label}
    </span>
   </div>
   <div style={{position:'relative',height:body,padding:`${14*u}px ${(sports?38:26)*u}px ${18*u}px`,textAlign:cinema?'center':'left',boxSizing:'border-box'}}>
    <FittedTitle text={l.title} condensed={sports} center maxSize={(l.compact?(sports?49:cinema?39:44):(sports?65:cinema?52:60))*u} minSize={22*u}>
     {sports?l.title.toLocaleUpperCase('vi'):l.title}
    </FittedTitle>
   </div>
  </div>
 </>;
}
