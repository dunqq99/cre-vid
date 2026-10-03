import {type Project,type Scene} from '../lib/model';
import {frameAdjustment} from '../lib/frame-settings';
import {STUDIO_TEMPLATES,REFERENCE_TEMPLATES} from '../lib/templates';

export function newsLayout(project:Project,scene:Scene){
 const portrait=project.aspect==='9:16';
 const reference=project.template==='custom'||STUDIO_TEMPLATES.some(t=>t.id===project.template);
 const match=REFERENCE_TEMPLATES.some(t=>t.id===project.template)&&project.design?.placement==='reference';
 const compact=portrait&&!match;
 const customLowerThird=project.template==='custom'&&project.customStyles?.find(s=>s.id===project.customStyleId)?.layout==='lower-third';
 // Platform previews never change exported composition geometry.
 const preset={bottom:.20,right:.18};
 const title=(project.newsTitle||'').trim()||project.scenes.find(s=>s.kind==='intro')?.headline||scene.headline;
 const lines=Math.max(title.split('\n').length,Math.ceil(title.length/29));
 let titleHeight=compact?Math.min(.17,Math.max(.065,lines*.027+.025)+(project.template==='magenta'&&project.design.showSocials?.018:0))
  :match&&portrait?(project.template==='emerald'?.20:project.template==='magenta'?.17:.27):reference?.29:.24;
 let titleBottom=compact?preset.bottom:match&&portrait?(project.template==='emerald'?.23:project.template==='magenta'?.20:.06):.17;
 const logoScale=project.brand.logoId&&project.brand.display!=='name'?Math.max(1,project.brand.logoScale??1):1;
 const baseHeader=compact?.028:portrait?.065:.075;
 const nameScale=project.brand.display!=='logo'||!project.brand.logoId?Math.max(1,project.brand.nameScale??1):1;
 const headerLimit=customLowerThird?(portrait?.10:.14):.32;
 const logoHeaderHeight=reference?Math.min(headerLimit,baseHeader*logoScale):0;
 const headerHeight=reference?Math.max(logoHeaderHeight,Math.min(headerLimit,baseHeader*(1+(nameScale-1)*1.3))):0;
 // Full-width lower third keeps its content above the bottom platform controls.
 if(customLowerThird){titleBottom=portrait?.18:.06;titleHeight=1/3-titleBottom-headerHeight;}
 const adjustment=frameAdjustment(project);
 let panelHeight=customLowerThird?1/3:titleHeight+headerHeight;
 panelHeight=Math.min(.7,Math.max(headerHeight+(portrait?.045:.08),panelHeight*adjustment.heightScale));
 const panelBottom=Math.max(0,Math.min(.85-panelHeight,(customLowerThird?0:titleBottom)+adjustment.verticalOffset));
 if(customLowerThird){
  const footer=Math.min(portrait?.18:.06,Math.max(0,panelHeight-headerHeight-(portrait?.045:.08)));
  titleBottom=panelBottom+footer;titleHeight=panelHeight-headerHeight-footer;
 }else{titleBottom=panelBottom;titleHeight=panelHeight-headerHeight;}
 return {
  showTitle:project.titleMode==='all'||scene.kind==='intro',title,
  left:.08,right:match?.08:portrait?preset.right:.08,labelTop:compact?.09:.15,
  titleBottom,titleHeight,headerHeight,logoHeaderHeight,compact,
  captionBottom:titleBottom+titleHeight+headerHeight+(compact?.014:.022),
  standaloneCaptionBottom:portrait?preset.bottom+.02:.18,
  reference,customLowerThird,panelHeight,panelBottom,
 };
}
