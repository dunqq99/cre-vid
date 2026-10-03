import {it,expect} from 'vitest';
import {newScene,sceneSchema,type Asset} from '../src/lib/model';
import {bodySceneFromMedia} from '../src/lib/media-scenes';
import {bodyWindow} from '../src/video/body-layout';
import {imageMotion} from '../src/video/image-motion';
const photo:Asset={id:'photo',name:'Bản tin.jpg',file:'photo.png',kind:'image',mime:'image/png',bytes:100,width:1600,height:900};
it('creates independent Body scenes with editable empty narration and original aspect',()=>{
 const a=bodySceneFromMedia(photo),b=bodySceneFromMedia({...photo,id:'clip',name:'Clip.mp4',kind:'video',duration:2});
 expect(a).toMatchObject({kind:'body',headline:'Bản tin',text:'',mediaId:'photo',duration:5,bodyLayout:'source',fit:'contain',motion:'none'});
 expect(b.duration).toBe(2);expect(a.id).not.toBe(b.id);expect(b.voice).toBeUndefined();
 expect(()=>bodySceneFromMedia({...photo,kind:'audio'})).toThrow();
});
it('keeps arbitrary native ratios and clamps shifted windows inside video',()=>{
 const s=bodySceneFromMedia(photo);let w=bodyWindow(s,1080,1920,photo);
 expect(w.width/w.height).toBeCloseTo(16/9);expect(w.framed).toBe(true);
 s.bodyOffsetY=.4;expect(bodyWindow(s,1080,1920,photo).y).toBe(0);
 s.bodyOffsetY=-.4;w=bodyWindow(s,1080,1920,photo);expect(w.y+w.height).toBe(1920);
 expect(bodyWindow(s,1080,1920).framed).toBe(false);
});
it('animates from exact first to last frame and bounds horizontal panning without gaps',()=>{
 const s=newScene();s.motionAmount=.2;
 for(const motion of ['zoom-in','zoom-out'] as const){s.motion=motion;const a=imageMotion(s,0,120,1080),b=imageMotion(s,119,120,1080);expect([a.scale,b.scale].sort()).toEqual([1,1.2]);}
 s.motion='zoom-in';expect(imageMotion(s,59.5,120,1080).scale).toBeCloseTo(1.1);
 for(const motion of ['pan-left','pan-right'] as const){s.motion=motion;
  const a=imageMotion(s,0,120,1080),b=imageMotion(s,119,120,1080);expect(a.x).toBe(-b.x);expect(motion==='pan-left'?a.x>b.x:a.x<b.x).toBe(true);
  for(const frame of [0,30,60,119]){const m=imageMotion(s,frame,120,1080);expect(Math.abs(m.x)).toBeLessThanOrEqual(1080*(m.scale-1)/2+.00001);}
 }
 s.motion='none';expect(imageMotion(s,99,120,1080)).toMatchObject({x:0,scale:1});expect(Number.isFinite(imageMotion(s,0,1,1080).scale)).toBe(true);
});
it('defaults legacy projects to no motion and rejects unsupported values',()=>{
 const s=newScene();expect(sceneSchema.parse({...s,motion:undefined,motionAmount:undefined,bodyOffsetY:undefined})).toMatchObject({motion:'none',motionAmount:.15,bodyOffsetY:.08});
 for(const value of [{motion:'spin'},{motionAmount:.51},{bodyOffsetY:.41}])expect(sceneSchema.safeParse({...s,...value}).success).toBe(false);
});
