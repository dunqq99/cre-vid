import React from 'react';
export function TemplateSwatch({kind}:{kind:string}){
 const themed=['sports','cinema','shorts'].includes(kind);
 const green=kind==='emerald';const pink=kind==='magenta';const card=kind==='bulletin';
 return <div className={`reference-swatch ${kind}`} aria-hidden="true">
  <div className="swatch-sky"/><div className="swatch-person"/>
  {themed?<div className="swatch-theme-panel"><header>CRE NEWS <span>{kind==='sports'?'SPORT':kind==='cinema'?'CINEMA':'▶'}</span></header><b>{kind==='sports'?<>BỨT PHÁ<br/>ĐẾN PHÚT CUỐI</>:kind==='cinema'?<>Phía sau<br/>một thước phim</>:<>Một phút.<br/>Một câu chuyện.</>}</b><i/></div>:green||pink?<><div className="swatch-gradient"/><div className="swatch-brand">{green?'● CRE NEWS':'CRE NEWS'}</div><div className="swatch-headline">MỖI CÂU CHUYỆN<br/>MỘT GÓC NHÌN MỚI</div><div className="swatch-pattern">{green?'◈ ◇ ◈ ◇':'▥ ▤ ▥ ▥ ▤'}</div>{pink&&<div className="swatch-social">● ● ● ● ●</div>}</>:card?<div className="swatch-news-card"><i>CRE NEWS</i><b>MỖI CÂU CHUYỆN<br/>MỘT GÓC NHÌN MỚI</b></div>:<><span className="swatch-circle one"/><span className="swatch-circle two"/><div className="swatch-white-card"><header>CRE NEWS <span>● ● ●</span></header><b>Mỗi câu chuyện<br/><em>một góc nhìn</em><br/>mới mỗi ngày</b></div></>}
 </div>;
}
