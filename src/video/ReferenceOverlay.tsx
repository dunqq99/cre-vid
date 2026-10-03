import React from 'react';
import {AbsoluteFill,Img,useVideoConfig} from 'remotion';
import {assetUrl,type Project,type Scene} from '../lib/model';
import {defaultDesign,highlightParts} from '../lib/templates';
import {FittedTitle} from './FittedTitle';
import {ThemedOverlay} from './ThemedOverlay';
import {CustomOverlay} from './CustomOverlay';
import {BrandMark} from './BrandMark';
import {newsLayout} from './layout';

// Editable vector decoration; no text or logos are baked into the artwork.
function WorldMap(){return <svg viewBox="0 0 1000 460" preserveAspectRatio="xMidYMid slice" style={{width:'100%',height:'100%'}} aria-hidden="true"><g fill="currentColor"><path d="M45 91L72 58 152 31 181 55 243 46 269 81 244 113 209 122 199 155 158 182 140 209 109 202 97 157 61 143ZM180 202L214 189 251 226 279 239 287 287 263 328 246 394 221 430 209 389 218 345 192 307 185 260ZM276 28L330 13 355 50 331 92 301 101 286 62ZM437 102L460 73 490 64 511 82 545 52 563 90 537 116 564 135 539 168 504 167 485 144 453 151 433 132ZM463 175L513 160 551 189 576 228 549 280 533 333 497 360 482 316 456 277 445 234ZM561 97L589 51 651 35 701 64 756 44 812 62 845 48 918 77 941 116 905 145 868 155 851 197 817 213 784 184 755 226 713 210 691 165 648 165 623 146 585 162 558 127ZM677 199L708 198 730 231 716 263 692 233ZM772 229L800 231 816 267 847 278 865 299 843 310 822 285 786 276ZM791 338L828 314 868 329 902 325 935 361 929 398 882 407 851 393 805 406 782 376ZM949 403L966 382 980 389 965 423 945 440Z"/></g></svg>;}
function CityLines(){return <svg viewBox="0 0 1080 450" preserveAspectRatio="none" style={{width:'100%',height:'100%'}} aria-hidden="true"><g fill="none" stroke="currentColor" strokeWidth="6"><path d="M0 432H1080M0 345L85 310 165 350V434M35 342V410M94 329V431M165 333L250 291 335 337V433M195 355H302M195 383H302M365 433V227H457V433M376 257H446M376 289H446M376 321H446M484 433V180H568V433M494 216H558M494 250H558M494 284H558M605 433V140L640 83 675 140V433M617 182H663M617 220H663M617 258H663M699 433V257H786V433M715 280H769M715 310H769M815 433V194H910V433M830 225H895M830 261H895M948 433V303L1014 266 1080 307M965 325H1068M965 365H1068"/><circle cx="275" cy="391" r="38"/><circle cx="347" cy="391" r="38"/><path d="M275 391L309 346 347 391H275L298 354H324"/></g></svg>;}
function SocialMarks(){return <div style={{display:'flex',gap:14}}>{['f','◎','♪','▶','≋'].map((icon,i)=><span key={i} style={{height:34,width:34,borderRadius:'50%',background:'#17121bd0',fontSize:24,fontFamily:'Arial',fontWeight:800,display:'flex',alignItems:'center',justifyContent:'center'}}>{icon}</span>)}</div>;}

export function ReferenceOverlay({project:p,scene:s,mediaBase,opacity=1}:{project:Project;scene:Scene;mediaBase?:string;opacity?:number}){
 const {width,height}=useVideoConfig();const l=newsLayout(p,s);const d=p.design||defaultDesign();const unit=Math.min(width,height)/1080;
 const logo=assetUrl(p,p.brand.logoId,mediaBase);const bodyHeight=height*l.titleHeight;const headerHeight=height*l.headerHeight;
 const panelWidth=width*(1-l.left-l.right);const left=width*l.left;const right=width*l.right;const bottom=height*l.titleBottom;
 const compact=l.compact;const title=l.title;const emerald=p.template==='emerald';const magenta=p.template==='magenta';const bulletin=p.template==='bulletin';const spotlight=p.template==='spotlight';
 const brand=(size:number,maxWidth=panelWidth)=><BrandMark project={p} mediaBase={mediaBase} size={size} maxWidth={maxWidth} maxHeight={height*l.logoHeaderHeight*.7}/>;
 const condensedSize=(compact?46:title.length>180?52:title.length>110?59:68)*unit;
 const normalSize=(compact?40:title.length>180?34:title.length>110?40:bulletin?44:magenta?50:56)*unit;
 // Both gradient styles meet the lower part of the brand area without washing over the media.
 const brandTop=100*(1-l.titleBottom-l.titleHeight-l.headerHeight)-(magenta?14*unit/height*100:0);
 const solidTop=Math.max(0,brandTop+l.headerHeight*75);
 const fadeStart=Math.max(0,brandTop,solidTop-3);
 const highlights=highlightParts(title,d.highlightTerms);
 return <AbsoluteFill data-testid={`template-${p.template}`} style={{opacity,pointerEvents:'none'}}>
  {p.template==='custom'&&<CustomOverlay project={p} scene={s} mediaBase={mediaBase}/>}
  {['sports','cinema','shorts'].includes(p.template)&&<ThemedOverlay project={p} scene={s} mediaBase={mediaBase}/>}
  {(emerald||magenta)&&<>
   <div data-testid="title-backdrop" style={{position:'absolute',inset:0,background:`linear-gradient(180deg,${p.brand.color}00 ${fadeStart}%,${p.brand.color} ${solidTop}%,${emerald?'#005230':'#8b0051'} 100%)`}}/>
   <div style={{position:'absolute',left:0,right:0,bottom:0,height:height*.27,color:emerald?'#94d89f':'#650048',opacity:emerald?.18:.36}}>{emerald?<WorldMap/>:<CityLines/>}</div>
   {emerald?<div data-testid="template-brand" style={{position:'absolute',left,bottom:bottom+bodyHeight,width:panelWidth,height:headerHeight,display:'flex',alignItems:'center'}}><BrandMark project={p} mediaBase={mediaBase} size={(compact?27:34)*unit} maxWidth={panelWidth} maxHeight={height*l.logoHeaderHeight*.7} badge badgeBleed={left}/></div>:<div data-testid="template-brand" style={{position:'absolute',left,right,bottom:bottom+bodyHeight+14*unit,height:headerHeight,display:'flex',alignItems:'end'}}>{brand((compact?39:75)*unit)}</div>}
   <div style={{position:'absolute',left,right,bottom:bottom+(magenta&&d.showSocials?(compact?42:70)*unit:0),height:bodyHeight-(magenta&&d.showSocials?(compact?42:70)*unit:0),paddingTop:(compact?10:emerald?40:15)*unit}}>
    <FittedTitle text={title} condensed={emerald} maxSize={emerald?condensedSize:normalSize} minSize={24*unit}>{title.toLocaleUpperCase('vi')}</FittedTitle>
   </div>
   {magenta&&d.showSocials&&<div style={{position:'absolute',left,bottom:bottom+5*unit,display:'flex',alignItems:'center',gap:18*unit,transform:`scale(${unit})`,transformOrigin:'left bottom'}}><SocialMarks/>{d.socialHandle&&<span style={{fontSize:20}}>{d.socialHandle}</span>}</div>}
  </>}
  {bulletin&&<div data-testid="title-panel" style={{position:'absolute',left,right,bottom,height:bodyHeight+headerHeight}}>
   <svg width="100%" height="100%" viewBox="0 0 900 520" preserveAspectRatio="none" style={{position:'absolute',inset:0}} aria-hidden="true"><defs><linearGradient id={`panel-${s.id}`}><stop stopColor="#b00e85"/><stop offset=".54" stopColor={p.brand.color}/><stop offset="1" stopColor="#ff6125"/></linearGradient></defs><path d="M0 157Q0 132 25 132H328L379 71H807L900 160V489Q900 520 873 520H30Q0 520 0 490Z" fill="#fff"/><path d="M0 144Q0 121 24 121H325L378 61H806L900 151V465Q900 496 872 496H645Q622 496 601 470H27Q0 470 0 445Z" fill={`url(#panel-${s.id})`} stroke="#fff8" strokeWidth="2"/><path d="M0 31Q0 0 31 0H296L337 57H405L349 122H29Q0 122 0 92Z" fill={`url(#panel-${s.id})`} stroke="#ffb574" strokeWidth="2"/></svg>
   <div data-testid="template-brand" style={{position:'absolute',left:28*unit,top:headerHeight*.10,height:headerHeight*.75,display:'flex',alignItems:'center',maxWidth:'42%',overflow:'hidden'}}>{brand((compact?29:49)*unit,panelWidth*.38-28*unit)}</div>
   <div style={{position:'absolute',right:32*unit,top:headerHeight*.65,fontSize:(compact?19:27)*unit,fontWeight:800,textShadow:`${2*unit}px ${2*unit}px #222`,lineHeight:1}}>NEWS <span style={{color:'#14141d'}}>◈</span></div>
   <div style={{position:'absolute',top:headerHeight+(compact?8:43)*unit,bottom:(compact?18:52)*unit,left:35*unit,right:35*unit,display:'flex',alignItems:'center'}}><FittedTitle text={title} center maxSize={normalSize} minSize={22*unit}>{title.toLocaleUpperCase('vi')}</FittedTitle></div>
  </div>}
  {spotlight&&<>
   <div style={{position:'absolute',left:0,right:0,bottom:0,height:height*.28,background:`linear-gradient(180deg,${d.accent}00,${d.accent} 50%,#ffe47a)`}}/>
   <div data-testid="title-panel" style={{position:'absolute',left,right,bottom,height:bodyHeight+headerHeight,border:`${3*unit}px solid #171717`,borderRadius:(compact?24:40)*unit,background:'#faf8f0',overflow:'hidden',color:'#121212'}}>
    <div style={{height:headerHeight,borderBottom:`${2*unit}px solid #333`,background:'#fff',display:'flex',alignItems:'center',justifyContent:'space-between',padding:`0 ${30*unit}px`}}><div data-testid="template-brand" style={{color:p.brand.color}}>{brand(27*unit,panelWidth-220*unit)}</div><div style={{display:'flex',gap:17*unit}}>{['#4fa774','#f5cb4c','#fa6731'].map(c=><span key={c} style={{width:26*unit,height:26*unit,borderRadius:'50%',background:c,border:`${2*unit}px solid #333`}}/>)}</div></div>
    <div style={{height:bodyHeight,padding:`${(compact?12:30)*unit}px ${24*unit}px`,textAlign:'center'}}><FittedTitle text={title} center maxSize={normalSize+8*unit} minSize={24*unit}>{highlights.map((part,i)=><span key={i} style={{color:part.highlight?d.accent:undefined}}>{part.text}</span>)}</FittedTitle></div>
   </div>
   {(s.insetIds||[]).slice(0,2).map((id,i)=>{const src=assetUrl(p,id,mediaBase);const panelTop=height-bottom-bodyHeight-headerHeight;const captionGap=height*.10;const diameter=Math.max(80*unit,Math.min(width*.34,height*.20,(panelTop-height*.10-captionGap)/2.08));const top=Math.max(height*.10,panelTop-captionGap-diameter*(2.08-i));return src?<div key={id+i} data-testid="portrait-inset" style={{position:'absolute',right:width*(l.right+(i===1?.08:0)),top,width:diameter,height:diameter,borderRadius:'50%',border:`${8*unit}px solid ${d.accent}`,overflow:'hidden',background:'#172536',boxShadow:`0 ${6*unit}px ${12*unit}px #0003`}}><Img src={src} style={{width:'100%',height:'100%',objectFit:'cover'}}/></div>:null;})}
  </>}
 </AbsoluteFill>;
}
