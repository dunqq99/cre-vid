import React from 'react';
import {PHONE,PLATFORMS,type SocialPlatform} from '@/lib/platforms';

type IconName='heart'|'like'|'comment'|'bubble'|'share'|'save'|'search'|'home'|'people'|'profile'|'inbox'|'bell'|'shop'|'reels'|'shorts'|'subscriptions'|'sound'|'live'|'remix'|'menu'|'more'|'plus';
function Icon({name,x,y,size=40,solid=false}:{name:IconName;x:number;y:number;size?:number;solid?:boolean}){
 const paths:Record<IconName,React.ReactNode>={
  heart:<path d="M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.7l-1.1-1.1a5.5 5.5 0 0 0-7.8 7.8L12 21l8.8-8.6a5.5 5.5 0 0 0 0-7.8Z"/>,
  like:<><path d="M8 21V10l4-8c3 0 3 3 2 7h5c2 0 3 1 2.5 3l-1.5 7c-.3 1.3-1 2-3 2Z"/><path d="M3 10h4v11H3Z"/></>,
  comment:<><path d="M4 3h16a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2h-9l-6 4v-4H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2Z"/><path d="M6 8h12M6 12h8"/></>,
  bubble:<path d="M21 18l1 5-6-2a11 11 0 1 1 5-3Z"/>,
  share:<path d="M13 2l10 9-10 10v-6C7 14 3 17 1 21c0-9 4-13 12-14Z"/>,
  save:<path d="M5 2h14a1 1 0 0 1 1 1v20l-8-5-8 5V3a1 1 0 0 1 1-1Z"/>,
  search:<><circle cx="10" cy="10" r="8"/><path d="m16 16 7 7"/></>,
  home:<><path d="m1 10 11-9 11 9M4 8v14h6v-9h5v9h6V8"/></>,
  people:<><circle cx="9" cy="7" r="4"/><path d="M1 22v-4c0-5 16-5 16 0v4ZM17 3c6 0 6 8 0 8M20 14c4 1 4 4 4 8"/></>,
  profile:<><circle cx="12" cy="6" r="4"/><path d="M3 22v-4c0-7 18-7 18 0v4Z"/></>,
  inbox:<path d="M4 3h16a2 2 0 0 1 2 2v13H9l-5 5v-5H2V5a2 2 0 0 1 2-2ZM7 8h10M7 12h7"/>,
  bell:<><path d="M3 18h18l-3-4V8a6 6 0 0 0-12 0v6ZM9 21q3 4 6 0"/></>,
  shop:<><path d="M3 3h18l2 7q-3 5-6 0-5 5-8 0-4 5-8 0ZM3 13v9h18v-9M9 22v-6h6v6"/></>,
  reels:<><rect x="2" y="2" width="20" height="20" rx="4"/><path d="M2 8h20M7 2l3 6M15 2l3 6"/><path d="m10 12 6 4-6 4Z" fill="currentColor" stroke="none"/></>,
  shorts:<path d="M16 1c6-1 7 6 3 8l-3 2 3 2c5 4 1 9-3 10L5 17c-5-2-4-8 0-10L16 1Zm-7 7v8l7-4Z" fillRule="evenodd"/>,
  subscriptions:<><path d="M5 1h14M3 5h18"/><rect x="1" y="9" width="22" height="14" rx="1"/><path d="m10 12 6 4-6 4Z" fill="currentColor" stroke="none"/></>,
  sound:<><path d="M2 9h5l7-6v18l-7-6H2ZM18 7q6 5 0 10M21 3q9 9 0 18"/></>,
  live:<><circle cx="12" cy="12" r="2" fill="currentColor"/><path d="M7 7q-5 5 0 10M17 7q5 5 0 10M3 3q-8 9 0 18M21 3q8 9 0 18"/></>,
  remix:<><path d="M3 8a9 9 0 0 1 16-3l3 3M22 2v6h-6M21 16A9 9 0 0 1 5 19l-3-3M2 22v-6h6M12 7v10M7 12h10"/></>,
  menu:<path d="M1 5h22M1 12h22M1 19h22"/>,
  more:<>{[4,12,20].map(cx=><circle key={cx} cx={cx} cy="12" r="2" fill="currentColor" stroke="none"/>)}</>,
  plus:<path d="M12 2v20M2 12h20"/>,
 };
 return <svg data-icon={name} x={x} y={y} width={size} height={size} viewBox="0 0 24 24" overflow="visible" fill={solid?'currentColor':'none'} stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">{paths[name]}</svg>;
}
function Text({x,y,children,size=24,weight=400,anchor='start',width,fill='white'}:{x:number;y:number;children:React.ReactNode;size?:number;weight?:number;anchor?:'start'|'middle';width?:number;fill?:string}){return <text x={x} y={y} fontSize={size} fontWeight={weight} textAnchor={anchor} fill={fill} textLength={width} lengthAdjust={width?'spacingAndGlyphs':undefined}>{children}</text>;}
function Avatar({x,y,r=25,platform,stroke='#ffffff55'}:{x:number;y:number;r?:number;platform:'reels'|'shorts';stroke?:string}){
 const id=`avatar-${platform}-${x}-${y}`;
 return <g><defs><pattern id={id} patternUnits="userSpaceOnUse" width="591" height="1280"><image href={PLATFORMS[platform].reference} width="591" height="1280"/></pattern></defs><circle cx={x} cy={y} r={r} fill={`url(#${id})`} stroke={stroke} strokeWidth="1"/></g>;
}
function Status({platform}:{platform:SocialPlatform}){
 const tik=platform==='tiktok';const fb=platform==='reels';const battery=tik?'78':fb?'68':'67';
 return <g data-testid="platform-status">
  {tik&&<rect width="591" height="80" fill="black"/>}
  <Text x={tik?58:fb?65:79} y={49} size={27} weight={600}>{tik?'22:15':fb?'21:17':'21:16'}</Text>
  {tik?<path d="M135 40h23v8m-23-3v-8h23v8m-19-11h5m5 0h5" fill="none" stroke="white" strokeWidth="3"/>:fb?<path d="m135 36 19-7-8 21-3-11Z" fill="white"/>:null}
  {[9,13,17,21].map((h,i)=><rect key={h} x={416+i*7} y={51-h} width="4.5" height={h} rx="2" fill={i===3?'#ffffff60':'white'}/>)}
  <path d="M460 36q11-10 22 0M464 41q7-6 14 0" fill="none" stroke="white" strokeWidth="3.7" strokeLinecap="round"/><circle cx="471" cy="46" r="2.5" fill="white"/>
  <rect x="498" y="29" width="38" height="22" rx="6" fill={tik?'#f2f2f2':'#53c777'}/><rect x="537" y="36" width="3" height="9" rx="1.5" fill="#fff8"/>
  <Text x={502} y={47} size={21} weight={700} fill={tik?'#121212':'white'}>{battery}</Text>{!tik&&<path d="m532 30-8 12h6l-3 11 9-14h-6Z" fill="white"/>}
 </g>;
}
function TikTok(){return <>
 <g data-testid="platform-top-ui"><Text x={98} y={125} size={26} weight={600} fill="#ddd">Cộng đồng</Text><Text x={262} y={125} size={26} weight={600} fill="#ddd">Đã follow</Text><Text x={401} y={125} size={26} weight={700}>Đề xuất</Text><path d="M429 145h37" stroke="white" strokeWidth="3"/><Icon name="search" x={532} y={101} size={31}/></g>
 <g data-testid="platform-action-rail">
  <circle cx="543" cy="504" r="35" fill="#f4f4f4" stroke="#ddd"/><circle cx="544" cy="540" r="18" fill="#fe2856"/><path d="M536 540h16m-8-8v16" stroke="white" strokeWidth="3"/>
  <Icon name="heart" x={521} y={596} size={44} solid/><Text x={543} y={661} size={20} anchor="middle">14,7K</Text>
  <circle cx="543" cy="720" r="22" fill="#fff"/><path d="m549 736-9 9v-10" fill="white"/>{[532,543,554].map(x=><circle key={x} cx={x} cy="719" r="3" fill="#959888"/>)}<Text x={543} y={766} size={20} anchor="middle">260</Text>
  <Icon name="save" x={525} y={806} size={35} solid/><Text x={543} y={871} size={20} anchor="middle">1.124</Text>
  <Icon name="share" x={522} y={907} size={40} solid/><Text x={543} y={973} size={20} anchor="middle">660</Text>
  <circle cx="543" cy="1044" r="32" fill="url(#record-disc)"/><circle cx="543" cy="1044" r="10" fill="#15181b"/>
 </g>
 <g data-testid="platform-bottom-ui"><Text x={18} y={1007} size={26} weight={700}>PVN Play</Text><Text x={18} y={1053} size={24}>Ủa con hát hay zậy mà sao chú hổng</Text><Text x={18} y={1079} size={24}>chịu... :(((( 🦖 #theisle ... thêm</Text><rect x="0" y="1098" width="591" height="57" fill="#25221f80"/><Icon name="search" x={20} y={1116} size={23}/><Text x={52} y={1134} size={22}>Tìm kiếm · the isle khủng long bay max size</Text><path d="m562 1118 8 8-8 8" stroke="white" strokeWidth="3" fill="none"/></g>
 <g data-testid="platform-navigation"><rect x="0" y="1155" width="591" height="125" fill="black"/><path d="M92 1154h407" stroke="white" strokeWidth="2"/>
  <Icon name="home" x={43} y={1167} size={31} solid/><Text x={59} y={1222} size={16} anchor="middle">Trang chủ</Text>
  <Icon name="people" x={160} y={1168} size={33}/><Text x={177} y={1222} size={16} anchor="middle">Bạn bè</Text>
  <rect x="259" y="1172" width="65" height="41" rx="13" fill="#00efff"/><rect x="268" y="1172" width="63" height="41" rx="13" fill="#ff2359"/><rect x="266" y="1171" width="59" height="43" rx="12" fill="white"/><g color="black"><Icon name="plus" x={280} y={1178} size={29}/></g>
  <Icon name="inbox" x={398} y={1168} size={33}/><rect x="414" y="1157" width="38" height="25" rx="12" fill="#ff2856"/><Text x={433} y={1176} size={20} anchor="middle">71</Text><Text x={414} y={1222} size={16} anchor="middle">Hộp thư</Text>
  <Icon name="profile" x={518} y={1167} size={31}/><Text x={533} y={1222} size={16} anchor="middle">Hồ sơ</Text>
 </g>
 </>;}
function Facebook(){return <>
 <g data-testid="platform-top-ui"><Icon name="menu" x={19} y={111} size={30}/><Text x={62} y={138} size={42} weight={700}>Reels</Text></g>
 <g data-testid="platform-action-rail"><Icon name="like" x={527} y={641} size={38}/><Text x={547} y={711} size={24} anchor="middle">71,8K</Text><Icon name="bubble" x={528} y={756} size={37}/><Text x={547} y={827} size={23} anchor="middle">1,1K</Text><Icon name="share" x={527} y={874} size={38}/><Text x={547} y={941} size={23} anchor="middle">788</Text><Icon name="save" x={530} y={985} size={34}/><Text x={547} y={1056} size={23} anchor="middle">1,8K</Text><Icon name="more" x={529} y={1096} size={35}/></g>
 <g data-testid="platform-bottom-ui"><Avatar platform="reels" x={50} y={1047} r={30} stroke="#1294ef"/><Text x={95} y={1056} size={28} weight={600}>Troll Game</Text><circle cx="248" cy="1046" r="9" fill="white"/><path d="m243 1046 4 4 6-7" stroke="#29212b" strokeWidth="2" fill="none"/><circle cx="276" cy="1046" r="8" fill="none" stroke="white" strokeWidth="2"/><path d="M269 1046h14m-7-8q-8 8 0 16q8-8 0-16" stroke="white" fill="none"/>
  <rect x="296" y="1027" width="132" height="42" rx="13" fill="none" stroke="#ffffff50"/><Text x={307} y={1057} size={28}>Theo dõi</Text><Text x={19} y={1119} size={26}>Nếu như cách đây hơn nữa... xem thêm</Text>
 </g>
 <g data-testid="platform-social-bubble"><Avatar platform="reels" x={50} y={963} r={30}/><circle cx="74" cy="982" r="12" fill="#118bf4"/><Icon name="like" x={67} y={975} size={13} solid/></g>
 <path d="M20 1154h552" stroke="#ffffff40" strokeWidth="3"/><circle cx="20" cy="1154" r="2" fill="white"/>
 <g data-testid="platform-navigation"><rect x="0" y="1164" width="591" height="116" fill="black"/><rect x="19" y="1171" width="553" height="79" rx="40" fill="#292b2b" stroke="#454747"/>
  <Icon name="home" x={50} y={1194} size={34}/><circle cx="159" cy="1211" r="39" fill="#ffffff0e"/><Icon name="reels" x={142} y={1195} size={33}/><Icon name="shop" x={233} y={1194} size={34}/><circle cx="341" cy="1211" r="17" fill="none" stroke="white" strokeWidth="3"/><Icon name="people" x={327} y={1197} size={26}/><Icon name="bell" x={415} y={1194} size={35}/><circle cx="447" cy="1195" r="15" fill="#fa1945"/><Text x={447} y={1205} size={24} anchor="middle">2</Text><Avatar platform="reels" x={522} y={1210} r={21}/>
 </g>
 </>;}
function YouTube(){return <>
 <g data-testid="platform-top-ui"><Text x={25} y={131} size={36} weight={700}>Shorts</Text><Icon name="sound" x={377} y={105} size={32}/><Icon name="search" x={454} y={105} size={32}/><g transform="rotate(90 543 118)"><Icon name="more" x={528} y={103} size={30}/></g>
  <rect x="25" y="162" width="254" height="64" rx="32" fill="#252525bb"/><Icon name="subscriptions" x={53} y={177} size={34}/><Text x={99} y={204} size={26} weight={600}>Kênh đăng ký</Text><rect x="297" y="162" width="251" height="64" rx="32" fill="#252525bb"/><Icon name="live" x={320} y={180} size={31}/><Text x={363} y={204} size={26} weight={600}>Phát trực tiếp</Text><rect x="561" y="162" width="180" height="64" rx="32" fill="#252525bb"/>
 </g>
 <g data-testid="platform-action-rail"><Icon name="heart" x={525} y={598} size={32}/><Text x={541} y={658} size={23} anchor="middle">31 N</Text><Icon name="comment" x={527} y={693} size={29}/><Text x={541} y={753} size={23} anchor="middle">859</Text><Icon name="save" x={527} y={786} size={28}/><Text x={541} y={846} size={23} anchor="middle">Lưu</Text><Icon name="share" x={526} y={882} size={30}/><Text x={541} y={941} size={23} anchor="middle">Chia sẻ</Text><Icon name="remix" x={526} y={977} size={30}/><Text x={541} y={1037} size={23} anchor="middle">1</Text><rect x="517" y="1075" width="48" height="48" rx="13" fill="#131819" stroke="white" strokeWidth="3"/><Text x={541} y={1105} size={13} weight={700} anchor="middle">NHẠC</Text></g>
 <g data-testid="platform-comment-preview"><rect x="26" y="900" width="226" height="65" rx="31" fill="#242424cc"/><Avatar platform="shorts" x={61} y={932} r={22}/><Text x={94} y={926} size={22}>Đây nha mn</Text><Text x={94} y={952} size={22}>Nutriboost ...</Text></g>
 <g data-testid="platform-bottom-ui"><Avatar platform="shorts" x={51} y={1004} r={25}/><Text x={88} y={1012} size={25} weight={600}>@nhacdungguofficial</Text><rect x="327" y="979" width="125" height="50" rx="25" fill="white"/><Text x={346} y={1012} size={24} weight={600} fill="#111">Đăng ký</Text><Text x={26} y={1067} size={25}>Thất tình ngang luôn :)))#nhachaymo ...</Text><rect x="26" y="1089" width="465" height="38" rx="19" fill="#ffffff25"/><path d="m43 1101 13 7-13 7Z" fill="white"/><Text x={64} y={1116} size={23}>Nhìn mà nhứt đầu luôn :)))#nhachaymo...</Text></g>
 <g data-testid="platform-navigation"><rect x="0" y="1156" width="591" height="124" fill="#0f0f0f"/><path d="M0 1154h591" stroke="#777" strokeWidth="3"/><path d="M0 1154h105" stroke="#ff0048" strokeWidth="4"/><circle cx="105" cy="1154" r="10" fill="#ff0048"/>
  <Icon name="home" x={43} y={1170} size={31}/><Text x={58} y={1221} size={16} anchor="middle">Trang chủ</Text><Icon name="shorts" x={162} y={1170} size={30} solid/><Text x={177} y={1221} size={16} anchor="middle">Shorts</Text><circle cx="295" cy="1194" r="28" fill="#292929"/><Icon name="plus" x={281} y={1180} size={28}/><Icon name="subscriptions" x={398} y={1169} size={33}/><circle cx="428" cy="1175" r="6" fill="#ff0048"/><Text x={414} y={1221} size={16} anchor="middle">Kênh đăng ký</Text><Avatar platform="shorts" x={532} y={1183} r={16}/><Text x={532} y={1221} size={16} anchor="middle">Bạn</Text>
 </g>
 </>;}

// Preview only: this module is never imported by the video composition.
export function PlatformGuide({platform}:{platform:SocialPlatform}){
 return <svg className="platform-guide" data-testid="platform-guide" data-platform={platform} viewBox={`0 0 ${PHONE.width} ${PHONE.height}`} aria-label={`Giao diện tham chiếu ${PLATFORMS[platform].name}`} style={{color:'#fff',fontFamily:'-apple-system, BlinkMacSystemFont, Arial, sans-serif'}}>
  <defs><radialGradient id="record-disc"><stop offset="0" stopColor="#080a0c"/><stop offset=".6" stopColor="#25282b"/><stop offset="1" stopColor="#090b0d"/></radialGradient></defs>
  <Status platform={platform}/>
  {platform==='tiktok'?<TikTok/>:platform==='reels'?<Facebook/>:<YouTube/>}
 </svg>;
}
