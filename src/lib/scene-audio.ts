import type {Asset,Scene} from './model';

/** Narration belongs to this scene only; otherwise retain the clip's own sound. */
export function sceneAudio(scene:Scene,assets:Asset[]){
 const voice=scene.voice?.text===scene.text
  ?assets.find(a=>a.id===scene.voice?.assetId&&a.kind==='audio')
  :undefined;
 return {voice,originalVolume:voice||scene.muteOriginal?0:1};
}
