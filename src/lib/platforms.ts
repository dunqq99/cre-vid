// Coordinates measured from the user's 591 × 1280 reference screenshots.
// Phone UI coordinates are separate from the exported 9:16 video coordinates.
export const PHONE={width:591,height:1280};
const videoHeight=591*16/9;
// One fixed viewport for comparison: only the social UI changes.
export const PREVIEW_VIDEO={y:80+(1155-80-videoHeight)/2,height:videoHeight};
export const PLATFORMS={
 tiktok:{name:'TikTok',bottom:.20,right:.18,video:{y:80+(1155-80-videoHeight)/2,height:videoHeight},reference:'/platform-references/tiktok.jpg',rail:{x:508,y:469,width:70,height:607},bottomUi:{x:18,y:983,width:481,height:172},navY:1155,topSafeY:163},
 reels:{name:'Facebook Reels',bottom:.20,right:.18,video:{y:64+(1164-64-videoHeight)/2,height:videoHeight},reference:'/platform-references/reels.jpg',rail:{x:520,y:639,width:57,height:483},bottomUi:{x:18,y:1015,width:487,height:123},navY:1164,topSafeY:155},
 shorts:{name:'YouTube Shorts',bottom:.25,right:.18,video:{y:64+(1156-64-videoHeight)/2,height:videoHeight},reference:'/platform-references/shorts.jpg',rail:{x:506,y:596,width:70,height:530},bottomUi:{x:25,y:980,width:470,height:148},navY:1156,topSafeY:240},
} as const;
export type SocialPlatform=keyof typeof PLATFORMS;
