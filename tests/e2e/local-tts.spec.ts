import {test,expect} from '@playwright/test';

test('Voice offers exactly two local voices and explains missing installation',async({page,request})=>{
 const project=await (await request.post('/api/projects',{data:{title:'Kiểm tra TTS local'}})).json();
 await page.addInitScript(id=>localStorage.setItem('crevid-project',id),project.id);
 await page.route('**/api/status',route=>route.fulfill({json:{worker:true,providers:{local:false},localTts:{ready:false,state:'not-installed',message:'Chưa cài TTS local. Chạy npm run tts:setup.'}}}));
 await page.goto('/');await page.getByRole('button',{name:'Voice',exact:true}).click();
 const voices=page.getByLabel('Giọng đọc local');await expect(voices.locator('option')).toHaveText(['Nam · Hải Đăng','Nữ · Trúc Ly']);
 await expect(page.getByRole('slider',{name:/Tốc độ đọc/})).toHaveValue('1');
 await voices.selectOption('male');await expect(voices).toHaveValue('male');
 await expect(page.getByRole('button',{name:'Tạo giọng cho cảnh này',exact:true})).toBeDisabled();
 await expect(page.locator('.inline-warning')).toContainText('Chưa cài TTS local. Chạy npm run tts:setup.');
 await page.getByRole('button',{name:'Xem cấu hình',exact:true}).click();
 await expect(page.getByRole('dialog')).toContainText('npm run tts:setup');
 await expect(page.getByRole('dialog')).not.toContainText('VBEE_TOKEN');
});

test('rejects cloud providers and unknown voices at the API boundary',async({request})=>{
 const project=await (await request.post('/api/projects',{data:{title:'Kiểm tra voice ID'}})).json();
 for(const [provider,voiceId] of [['azure','male'],['local','unknown']]){
  const res=await request.post('/api/actions',{data:{action:'voice',projectId:project.id,revision:project.revision,sceneId:project.scenes[0].id,provider,voiceId,speed:1}});
  expect(res.status()).toBe(400);
 }
});

test('shows narration that finishes before the first queue poll',async({page,request})=>{
 let project=await (await request.post('/api/projects',{data:{title:'Voice hoàn tất nhanh'}})).json();
 let job:Record<string,unknown>|undefined;
 await page.addInitScript(id=>localStorage.setItem('crevid-project',id),project.id);
 await page.route('**/api/status',route=>route.fulfill({json:{worker:true,providers:{local:true},localTts:{ready:true,message:'Sẵn sàng'}}}));
 await page.route(`**/api/projects/${project.id}`,route=>route.fulfill({json:project}));
 await page.route('**/api/actions**',async route=>{
  if(route.request().method()==='POST'){
   const options=route.request().postDataJSON();
   job={id:'instant-voice',projectId:project.id,revision:project.revision,kind:'voice',state:'queued',options,progress:0,message:'Đang chờ',createdAt:new Date().toISOString()};
   project={...project,revision:project.revision+1,assets:[{id:'instant-audio',name:'Giọng tạo nhanh',kind:'audio',file:'instant-audio.wav',mime:'audio/wav',bytes:100,duration:2}],scenes:project.scenes.map((s:{id:string;text:string})=>s.id===options.sceneId?{...s,voice:{assetId:'instant-audio',text:s.text,provider:'local',voiceId:options.voiceId}}:s)};
   await route.fulfill({json:job});job={...job,state:'succeeded',progress:100};
  }else await route.fulfill({json:job?[job]:[]});
 });
 await page.goto('/');await page.getByRole('button',{name:'Voice',exact:true}).click();
 await page.getByRole('button',{name:'Tạo giọng cho cảnh này',exact:true}).click();
 await expect(page.locator('.audio-output audio')).toHaveAttribute('src',new RegExp('/instant-audio.wav$'),{timeout:10000});
 await expect(page.locator('.audio-output')).toContainText('Giọng tạo nhanh');
});

test('creates both real local voices in Studio and renders their audio',async({page,request})=>{
 test.skip(process.env.CREVID_TTS_LIVE!=='1','Opt-in: requires downloaded local model.');test.setTimeout(1500000);
 const status=await (await request.get('/api/status')).json();expect(status.localTts.ready).toBe(true);
 let project=await (await request.post('/api/projects',{data:{title:'TTS local · Nam và Nữ'}})).json();
 project.scenes[0].text='Xin chào các bạn. Đây là giọng nam đọc bản tin trên máy tính.';
 project.scenes[1].text='Xin chào các bạn. Đây là giọng nữ, được tạo hoàn toàn trên máy tính.';
 project=await (await request.put(`/api/projects/${project.id}`,{data:project})).json();
 await page.addInitScript(id=>localStorage.setItem('crevid-project',id),project.id);
 await page.goto('/');await page.getByRole('button',{name:'Voice',exact:true}).click();
 for(const [index,voice] of ['male','female'].entries()){
  if(index)await page.getByRole('button',{name:/02 Nội dung/}).click();
  await page.getByLabel('Giọng đọc local').selectOption(voice);
  await expect(page.getByRole('button',{name:'Tạo giọng cho cảnh này',exact:true})).toBeEnabled();
  const response=page.waitForResponse(r=>r.url().endsWith('/api/actions')&&r.request().method()==='POST');
  await page.getByRole('button',{name:'Tạo giọng cho cảnh này',exact:true}).click();
  const job=await (await response).json();expect(job.id).toBeTruthy();expect(job.options.speed).toBe(1);
  await expect.poll(async()=>{const jobs=await (await request.get(`/api/actions?projectId=${project.id}`)).json();const current=jobs.find((j:{id:string})=>j.id===job.id);if(current?.state==='failed')throw new Error(current.error);return current?.state;},{timeout:650000,intervals:[2000]}).toBe('succeeded');
  await expect(page.locator('.audio-output audio')).toBeVisible();
  await expect.poll(()=>page.locator('.audio-output audio').evaluate((el:HTMLAudioElement)=>el.duration),{timeout:15000}).toBeGreaterThan(1);
 }
 await page.screenshot({path:'test-results/local-tts-ready.png'});
 project=await (await request.get(`/api/projects/${project.id}`)).json();
 expect(project.scenes.map((s:{voice:{provider:string;voiceId:string}})=>[s.voice.provider,s.voice.voiceId])).toEqual([['local','male'],['local','female']]);
 const response=await request.post('/api/actions',{data:{action:'render',projectId:project.id,revision:project.revision,preset:'draft',approved:true}});expect(response.ok()).toBe(true);const render=await response.json();
 await expect.poll(async()=>{const jobs=await (await request.get(`/api/actions?projectId=${project.id}`)).json();const current=jobs.find((j:{id:string})=>j.id===render.id);if(current?.state==='failed')throw new Error(current.error);return current?.state;},{timeout:300000,intervals:[2000]}).toBe('succeeded');
 console.log('Local TTS demo project:',project.id,'render:',render.id);
});
