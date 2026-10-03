import {it,expect} from 'vitest';
import {newProject,newScene,projectSchema,sceneSchema} from '../src/lib/model';
import {bodyWindow} from '../src/video/body-layout';
it('removes only untouched legacy endings and retains edited endings as Body',()=>{
 const p=newProject();expect(p.scenes.map(s=>s.kind)).toEqual(['intro','body']);
 const ending={...newScene(),kind:'outro'};
 const migrated=projectSchema.parse({...p,scenes:[...p.scenes,ending]});expect(migrated.scenes).toHaveLength(2);
 for(const change of [{text:'Lời kết đã biên tập'},{mediaId:'photo'},{signOpacity:.5},{duration:9}]){
  const result=projectSchema.parse({...p,scenes:[...p.scenes,{...ending,...change}]});
  expect(result.scenes).toHaveLength(3);expect(result.scenes[2]).toMatchObject({...change,kind:'body',id:ending.id});
 }
 expect(projectSchema.parse({...p,scenes:[ending]}).scenes).toHaveLength(1);
});
it('defaults old scenes to full frame and opaque Sign and rejects invalid controls',()=>{
 const s=newScene();expect(sceneSchema.parse({...s,bodyLayout:undefined,signOpacity:undefined})).toMatchObject({bodyLayout:'full',signOpacity:1});
 expect(sceneSchema.safeParse({...s,signOpacity:1.1}).success).toBe(false);
 expect(sceneSchema.safeParse({...s,bodyLayout:'bad'}).success).toBe(false);
});
it('raises exact 4:3 and 1:1 clear windows; keeps Intro and full frame unchanged',()=>{
 const s=newScene();s.bodyLayout='4:3';
 expect(bodyWindow(s,1080,1920)).toEqual({x:0,y:401.4,width:1080,height:810,framed:true});
 s.bodyLayout='1:1';expect(bodyWindow(s,1080,1920)).toEqual({x:0,y:266.4,width:1080,height:1080,framed:true});
 s.bodyLayout='full';expect(bodyWindow(s,1080,1920)).toEqual({x:0,y:0,width:1080,height:1920,framed:false});
 s.bodyLayout='4:3';s.kind='intro';expect(bodyWindow(s,1080,1920).framed).toBe(false);
 s.kind='body';expect(bodyWindow(s,1920,1080)).toEqual({x:240,y:0,width:1440,height:1080,framed:true});
});
