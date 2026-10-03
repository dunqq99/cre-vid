/** Scale within the allocated brand area. Rounded masks are square, so 100% is a true circle. */
export function logoBox(size:number,maxWidth:number,showName:boolean,scale:number,roundness:number,maxHeight=Infinity){
 const available=Math.max(1,maxWidth*(showName?.6:1));
 const requestedWidth=(showName?size*1.6:size*6)*scale,requestedHeight=size*1.25*scale;
 if(roundness>0){const side=Math.min(requestedHeight,available,maxHeight);return {width:side,height:side,radius:`${roundness/2}%`};}
 const fit=Math.min(1,available/requestedWidth,maxHeight/requestedHeight);
 return {width:requestedWidth*fit,height:requestedHeight*fit,radius:'0%'};
}
