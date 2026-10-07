import {test,expect} from '@playwright/test';

test('preview and SRT move straight to the next scene when narration ends',async({page,request})=>{
 let p=await (await request.post('/api/projects',{data:{title:'Kiểm tra sub theo lời đọc'}})).json();
 // A valid one-second WAV keeps the test independent of downloaded TTS models.
 const wav=Buffer.alloc(44+48000*2);wav.write('RIFF');wav.writeUInt32LE(wav.length-8,4);wav.write('WAVEfmt ',8);wav.writeUInt32LE(16,16);wav.writeUInt16LE(1,20);wav.writeUInt16LE(1,22);wav.writeUInt32LE(48000,24);wav.writeUInt32LE(96000,28);wav.writeUInt16LE(2,32);wav.writeUInt16LE(16,34);wav.write('data',36);wav.writeUInt32LE(wav.length-44,40);
 const upload=await request.post('/api/actions',{multipart:{projectId:p.id,file:{name:'narration.wav',mimeType:'audio/wav',buffer:wav}}});expect(upload.ok()).toBe(true);
 const {project,asset}=await upload.json();p=project;
 p.scenes[0].text='Bản tin hôm nay ghi nhận những thông tin mới nhất tại Hà Nội. Người dân tiếp tục theo dõi diễn biến trong ngày.';
 p.scenes[0].duration=4;p.scenes[0].voice={assetId:asset.id,text:p.scenes[0].text,provider:'upload',voiceId:''};
 p=await (await request.put(`/api/projects/${p.id}`,{data:p})).json();
 await page.addInitScript(id=>localStorage.setItem('crevid-project',id),p.id);await page.goto('/');
 await expect(page.getByTestId('news-caption')).toBeVisible();
 await expect(page.getByRole('spinbutton',{name:'Thời lượng cảnh',exact:true})).toHaveValue('1');
 await expect(page.getByRole('spinbutton',{name:'Thời lượng cảnh',exact:true})).toBeDisabled();
 await page.reload();
 await expect(page.getByRole('spinbutton',{name:'Thời lượng cảnh',exact:true})).toHaveValue('1');
 await page.getByRole('slider',{name:'Vị trí xem trước'}).fill('60');
 await expect(page.getByTestId('news-caption')).toHaveText(p.scenes[1].text);
 await page.getByRole('slider',{name:'Vị trí xem trước'}).fill('132');
 await expect(page.getByTestId('news-caption')).toBeVisible();
 await page.getByRole('button',{name:'Output',exact:true}).click();
 const downloaded=page.waitForEvent('download');await page.getByRole('button',{name:'Tải phụ đề SRT'}).click();
 const stream=await (await downloaded).createReadStream();let srt='';for await(const chunk of stream!)srt+=chunk.toString();
 expect(srt).toContain('--> 00:00:01,000');expect(srt).toContain('00:00:01,000 -->');expect(srt).not.toContain('00:00:04,000 -->');
});
