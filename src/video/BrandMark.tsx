// @refresh reset
// Remount this render-only component on code edits so Fast Refresh cannot reuse an older hook layout.
import React,{useEffect,useRef} from 'react';
import {Img,delayRender,continueRender,cancelRender} from 'remotion';
import {logoBox} from './logo-box';
import {assetUrl,type Project} from '../lib/model';

/** Shared by all templates and both Studio / export. */
export function BrandMark({project,mediaBase,size,maxWidth,maxHeight=Infinity,align='left',badge=false,badgeBleed=0}:{project:Project;mediaBase?:string;size:number;maxWidth:number;maxHeight?:number;align?:'left'|'right';badge?:boolean;badgeBleed?:number}){
 const logo=assetUrl(project,project.brand.logoId,mediaBase);
 const mode=project.brand.display||'both';
 const showLogo=!!logo&&mode!=='name';const showName=mode!=='logo'||!logo;
 const nameRef=useRef<HTMLSpanElement>(null);
 const textSize=size*(project.brand.nameScale??1);
 const logoScale=project.brand.logoScale??1;
 const roundness=project.brand.logoRoundness??0;const box=logoBox(size,maxWidth,showName,logoScale,roundness,maxHeight);
 const source=project.assets.find(a=>a.id===project.brand.logoId);
 const naturalWidth=badge&&!roundness&&source?.width&&source?.height?box.height*source.width/source.height:box.width;
 const fit=Math.min(1,maxWidth*(showName?.6:1)/Math.max(1,naturalWidth));
 const logoWidth=naturalWidth*fit,logoHeight=box.height*fit;
 useEffect(()=>{
  const handle=delayRender('Căn tên thương hiệu');let active=true;
  document.fonts.load(`800 ${textSize}px News`,'Tiếng Việt').then(()=>{
   if(!active)return;
   const el=nameRef.current;
   if(el){
    el.style.fontSize=`${textSize}px`;const text=el.firstElementChild as HTMLElement;
    for(let i=0;text&&i<4;i++){
     const css=getComputedStyle(el);const padding=badge?parseFloat(css.paddingLeft)+parseFloat(css.paddingRight):0;
     const available=el.clientWidth-padding;if(available<=0||text.scrollWidth<=available+.5)break;
     el.style.fontSize=`${parseFloat(css.fontSize)*available/text.scrollWidth}px`;
    }
   }
   continueRender(handle);
  }).catch(cancelRender);
  return()=>{active=false;continueRender(handle);};
 },[project.brand.name,size,textSize,maxWidth,showLogo,showName,logoScale,roundness,maxHeight,badge,logoWidth]);
 return <div data-testid="brand-mark" style={{display:'flex',alignItems:'flex-end',justifyContent:align==='right'?'flex-end':'flex-start',gap:badge?0:size*.3,width:badge?'max-content':maxWidth,maxWidth:badge?maxWidth:'100%',minWidth:0,height:Math.max(textSize*(badge?1.63:1.35),showLogo?logoHeight+(badge&&showName?textSize*.24:0):0),paddingBottom:badge&&showName?textSize*.24:0,boxSizing:'border-box',letterSpacing:0}}>
  {showLogo&&<Img data-testid="brand-logo" src={logo!} style={{position:badge?'relative':undefined,zIndex:badge?2:undefined,height:logoHeight,width:logoWidth,flexShrink:0,borderRadius:box.radius,objectFit:roundness?'cover':'contain',objectPosition:roundness?'center':'left center'}}/>}
  {showName&&<span ref={nameRef} data-testid="brand-name" style={{display:'flex',alignItems:'flex-end',fontSize:textSize,fontWeight:800,lineHeight:1.15,whiteSpace:'nowrap',minWidth:0,flex:badge||align==='right'?'0 1 auto':1,...(badge?{position:'relative',zIndex:1,marginLeft:showLogo?-size*.4:0,padding:`0 .6em 0 ${showLogo?'.75em':'.6em'}`}:{})}}><span style={{display:'inline-block',position:'relative',zIndex:1}}>{project.brand.name}</span>{badge&&<span data-testid="brand-badge" aria-hidden="true" style={{position:'absolute',top:'-.24em',bottom:'-.24em',right:0,left:-badgeBleed-(showLogo?logoWidth-size*.4:0),borderRadius:'0 9999px 9999px 0',background:`linear-gradient(110deg,#007c48,${project.brand.color})`,border:'1px solid #ffffff',pointerEvents:'none'}}/>}</span>}

 </div>;
}
