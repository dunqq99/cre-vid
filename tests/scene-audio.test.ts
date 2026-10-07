import {expect,it} from 'vitest';
import {newProject,newScene,type Asset} from '../src/lib/model';
import {bodySceneFromMedia} from '../src/lib/media-scenes';
import {sceneAudio} from '../src/lib/scene-audio';

const clip:Asset={id:'clip',name:'Clip.mp4',kind:'video',file:'clip.mp4',mime:'video/mp4',bytes:100,duration:2};
const voice:Asset={id:'voice',name:'Voice.wav',kind:'audio',file:'voice.wav',mime:'audio/wav',bytes:100,duration:1};

it('keeps source audio by default on new scenes and uploaded video scenes',()=>{
 expect(newScene().muteOriginal).toBe(false);
 expect(bodySceneFromMedia(clip).muteOriginal).toBe(false);
});

it('selects narration independently for each scene, falling back to full source audio',()=>{
 const p=newProject();
 p.assets=[clip,voice];
 p.scenes[0].voice={assetId:voice.id,text:p.scenes[0].text,provider:'local',voiceId:'female'};
 p.scenes[1]={...bodySceneFromMedia(clip),headline:'',text:''};
 expect(sceneAudio(p.scenes[0],p.assets)).toEqual({voice,originalVolume:0});
 expect(sceneAudio(p.scenes[1],p.assets)).toEqual({voice:undefined,originalVolume:1});
 p.scenes[1].voice={assetId:voice.id,text:'',provider:'local',voiceId:'male'};
 expect(sceneAudio(p.scenes[1],p.assets)).toEqual({voice,originalVolume:0});
});

it('honors an explicit mute and never plays stale or non-audio narration',()=>{
 const s={...bodySceneFromMedia(clip),muteOriginal:false,voice:{assetId:voice.id,text:'outdated',provider:'local',voiceId:'female'}};
 expect(sceneAudio(s,[clip,voice])).toEqual({voice:undefined,originalVolume:1});
 s.voice.text=s.text;s.voice.assetId=clip.id;
 expect(sceneAudio(s,[clip,voice])).toEqual({voice:undefined,originalVolume:1});
 s.voice.assetId='missing';
 expect(sceneAudio(s,[clip,voice])).toEqual({voice:undefined,originalVolume:1});
 s.muteOriginal=true;
 expect(sceneAudio(s,[clip,voice])).toEqual({voice:undefined,originalVolume:0});
});
