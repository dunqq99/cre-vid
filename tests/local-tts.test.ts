import {afterEach,expect,it} from 'vitest';
import {mkdtemp,writeFile,rm} from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import {LocalTtsClient,localTtsStatus} from '../src/lib/local-tts';
import {localVoiceRequest,LOCAL_VOICES} from '../src/lib/voices';

const dirs:string[]=[];const clients:LocalTtsClient[]=[];
afterEach(async()=>{await Promise.all(clients.splice(0).map(c=>c.stop()));await Promise.all(dirs.splice(0).map(d=>rm(d,{recursive:true,force:true})));});
it('only accepts the two local voices and valid narration settings',()=>{
 expect(LOCAL_VOICES.map(v=>v.id)).toEqual(['male','female']);
 expect(localVoiceRequest.parse({text:' Xin chào ',voiceId:'male',speed:1}).text).toBe('Xin chào');
 for(const patch of [{voiceId:'cloud'},{text:' '},{text:'a'.repeat(3001)},{speed:0},{speed:NaN}])expect(()=>localVoiceRequest.parse({text:'Tin mới',voiceId:'female',speed:1,...patch})).toThrow();
});
it('does not claim ready when Python or verified model manifest is missing',async()=>{
 const dir=await mkdtemp(path.join(os.tmpdir(),'crevid-tts-status-'));dirs.push(dir);
 expect((await localTtsStatus({root:dir,python:path.join(dir,'missing')})).state).toBe('not-installed');
 expect((await localTtsStatus({root:dir,python:process.execPath})).state).toBe('missing-model');
 await writeFile(path.join(dir,'manifest.json'),'{}');
 expect((await localTtsStatus({root:dir,python:process.execPath})).ready).toBe(false);
});
async function fixture(mode='ok'){
 const dir=await mkdtemp(path.join(os.tmpdir(),'crevid-tts-test-'));dirs.push(dir);
 const script=path.join(dir,'worker.cjs');
 await writeFile(script,`const rl=require('readline').createInterface({input:process.stdin});const fs=require('fs');
 rl.on('line',line=>{const r=JSON.parse(line);fs.writeFileSync(require('path').join(${JSON.stringify(dir)},'request.json'),JSON.stringify({text:r.text,utf8:process.env.PYTHONUTF8,encoding:process.env.PYTHONIOENCODING}));if(${JSON.stringify(mode)}==='hang')return;
 if(${JSON.stringify(mode)}==='crash'){process.exit(2);return;}
 const wav=Buffer.alloc(48044);wav.write('RIFF');wav.writeUInt32LE(48036,4);wav.write('WAVEfmt ',8);wav.writeUInt32LE(16,16);wav.writeUInt16LE(1,20);wav.writeUInt16LE(1,22);wav.writeUInt32LE(24000,24);wav.writeUInt32LE(48000,28);wav.writeUInt16LE(2,32);wav.writeUInt16LE(16,34);wav.write('data',36);wav.writeUInt32LE(48000,40);for(let i=0;i<24000;i++)wav.writeInt16LE(Math.round(8000*Math.sin(i*.1)),44+i*2);
 fs.writeFileSync(r.output,${JSON.stringify(mode)}==='bad'?Buffer.from('invalid audio'):wav);
 console.log(JSON.stringify({id:r.id,ok:true}));});`);
 const client=new LocalTtsClient({python:process.execPath,script,root:dir,timeoutMs:500,idleMs:10000});clients.push(client);return {client,dir};
}
it('passes Unicode text over stdin and returns WAV bytes from a real subprocess',async()=>{
 const {client,dir}=await fixture();const audio=await client.synthesize('Ngày mới ở Hà Nội','female',1);
 const {readFile}=await import('node:fs/promises');expect(JSON.parse(await readFile(path.join(dir,'request.json'),'utf8'))).toEqual({text:'Ngày mới ở Hà Nội',utf8:'1',encoding:'utf-8'});
 expect(audio.toString('ascii',0,4)).toBe('RIFF');expect(audio.toString('ascii',8,12)).toBe('WAVE');
 expect((await client.synthesize('Tin tiếp theo','male',1)).length).toBeGreaterThan(44);
});
it('rejects corrupt audio',async()=>{const {client}=await fixture('bad');await expect(client.synthesize('Tin','male',1)).rejects.toThrow(/WAV/);});
it('changes speaking speed using real audio processing',async()=>{const {client}=await fixture();const normal=await client.synthesize('Tin','male',1);const fast=await client.synthesize('Tin','male',1.5);expect(fast.length).toBeLessThan(normal.length*.8);expect(fast.length).toBeGreaterThan(normal.length*.5);});
it('reports a crashed process instead of waiting forever',async()=>{const {client}=await fixture('crash');await expect(client.synthesize('Tin','male',1)).rejects.toThrow(/TTS/);});
it('kills timed out inference and clears its temporary directory',async()=>{
 const {client,dir}=await fixture('hang');await expect(client.synthesize('Tin','male',1)).rejects.toThrow(/thời gian/);
 const {readdir}=await import('node:fs/promises');expect((await readdir(dir)).filter(n=>n.startsWith('job-'))).toEqual([]);
});
it('cancels in-flight inference and rejects already canceled jobs',async()=>{
 const {client}=await fixture('hang');const controller=new AbortController();
 const result=client.synthesize('Tin','female',1,controller.signal);setTimeout(()=>controller.abort(),40);
 await expect(result).rejects.toThrow(/hủy/);await expect(client.synthesize('Tin','female',1,controller.signal)).rejects.toThrow(/hủy/);
});
