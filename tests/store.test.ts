import { it, expect, beforeEach, afterEach } from 'vitest';
import { mkdtemp, rm } from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import { Store } from '../src/lib/store';
let root:string; let store:Store;
beforeEach(async()=>{root=await mkdtemp(path.join(os.tmpdir(),'crevid-test-'));store=new Store(root);});
afterEach(async()=>{await rm(root,{recursive:true,force:true});});
it('rejects concurrent stale writes and preserves the accepted revision',async()=>{
 const p=await store.createProject('Bản tin');
 const results=await Promise.allSettled([store.saveProject({...p,title:'A'},p.revision),store.saveProject({...p,title:'B'},p.revision)]);
 expect(results.filter(x=>x.status==='fulfilled')).toHaveLength(1);
 expect((await store.getProject(p.id)).revision).toBe(2);
});
it('keeps render snapshots immutable and queues one job for repeated clicks',async()=>{
 const p=await store.createProject('Tin');
 const a=await store.enqueue(p.id,'render',{preset:'draft'},p.revision);
 const b=await store.enqueue(p.id,'render',{preset:'draft'},p.revision);
 expect(a.id).toBe(b.id);
 await store.saveProject({...p,title:'Changed'},p.revision);
 expect((await store.getJob(a.id)).snapshot.title).toBe('Tin');
 expect((await store.claimJob())?.id).toBe(a.id);
 expect(await store.claimJob()).toBeUndefined();
});
it('rejects traversal in identifiers',async()=>{await expect(store.getProject('../outside')).rejects.toThrow();});
it('does not attach audio after its job was canceled',async()=>{
 const p=await store.createProject('Tin');const j=await store.enqueue(p.id,'voice',{sceneId:p.scenes[0].id,provider:'vbee',voiceId:'voice'},p.revision);
 await store.cancelJob(j.id);
 await store.attachVoice(j,{id:'audio',name:'Voice',kind:'audio',file:'audio.wav',mime:'audio/wav',bytes:100,duration:2});
 expect((await store.getProject(p.id)).assets).toHaveLength(0);
});
it('allows only one running job on the local worker queue',async()=>{
 const a=await store.createProject('One');const b=await store.createProject('Two');
 await store.enqueue(a.id,'render',{preset:'draft'},a.revision);await store.enqueue(b.id,'render',{preset:'draft'},b.revision);
 expect(await store.claimJob()).toBeDefined();expect(await store.claimJob()).toBeUndefined();
});
