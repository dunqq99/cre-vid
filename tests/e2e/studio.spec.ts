import {test,expect} from '@playwright/test';
test('edits a project, keeps it after reload and exports subtitles',async({page,request})=>{
 const response=await request.post('/api/projects',{data:{title:'Kiểm thử tự động'}});
 expect(response.ok()).toBeTruthy();
 const project=await response.json();
 await page.addInitScript(id=>localStorage.setItem('crevid-project',id),project.id);
 await page.goto('/');
 await expect(page.getByText('Cre-vid', {exact:true})).toBeVisible();
 await expect(page.getByLabel('Tên dự án')).toBeVisible();
 await page.getByLabel('Tên dự án').fill('Bản tin kiểm thử');
 await page.getByRole('button',{name:'Kịch bản',exact:true}).click();
 await page.getByLabel('Tiêu đề cảnh').fill('Hà Nội đón ngày mới');
 await page.getByLabel('Lời đọc').fill('Một câu chuyện mới bắt đầu từ những hình ảnh quen thuộc.');
 await page.getByRole('button',{name:'Lưu dự án',exact:true}).click();
 await expect(page.getByText('Đã lưu',{exact:true})).toBeVisible();
 await page.reload();
 await expect(page.getByLabel('Tên dự án')).toHaveValue('Bản tin kiểm thử');
 await page.getByRole('button',{name:'Kịch bản',exact:true}).click();
 await expect(page.getByLabel('Tiêu đề cảnh')).toHaveValue('Hà Nội đón ngày mới');
 await page.getByRole('button',{name:'Output',exact:true}).click();
 const download=page.waitForEvent('download');
 await page.getByRole('button',{name:'Tải phụ đề SRT'}).click();
 expect((await download).suggestedFilename()).toMatch(/\.srt$/);
});

test('uploads a chosen image even after the file input is reset',async({page,request})=>{
 const response=await request.post('/api/projects',{data:{title:'Kiểm thử upload'}});
 const project=await response.json();
 await page.addInitScript(id=>localStorage.setItem('crevid-project',id),project.id);
 await page.goto('/');
 await expect(page.getByRole('button',{name:'Thêm tư liệu',exact:true})).toBeVisible();
 await page.getByLabel('Tư liệu thư viện',{exact:true}).setInputFiles('docs/references/news-style-reference.png');
 await expect(page.getByRole('button',{name:'news-style-reference.png Ảnh'})).toBeVisible({timeout:10000});
 const stored=await (await request.get(`/api/projects/${project.id}`)).json();
 expect(stored.assets).toHaveLength(1);
});

test('switches intro-only and persistent titles with captions above the frame',async({page,request})=>{
 const project=await (await request.post('/api/projects',{data:{title:'Kiểm thử bố cục'}})).json();
 await page.addInitScript(id=>localStorage.setItem('crevid-project',id),project.id);
 await page.goto('/');
 await page.getByRole('button',{name:'Studio',exact:true}).last().click();
 await page.getByLabel('Tiêu đề bản tin cố định').fill('Một tiêu đề chung cho cả bản tin');
 await page.getByLabel('Chế độ tiêu đề').selectOption('intro');
 await page.getByRole('button',{name:/02 Nội dung/}).click();
 await expect(page.getByTestId('news-title')).toHaveCount(0);
 await expect(page.getByRole('button',{name:/Kết thúc/})).toHaveCount(0);
 await expect(page.getByTestId('news-title')).toHaveCount(0);
 await page.getByLabel('Chế độ tiêu đề').selectOption('all');
 await expect(page.getByTestId('news-title')).toHaveText('Một tiêu đề chung cho cả bản tin');
 const title=await page.getByTestId('news-title').boundingBox();
 const caption=await page.getByTestId('news-caption').boundingBox();
 expect(caption!.y+caption!.height).toBeLessThan(title!.y);
 await page.getByRole('button',{name:/02 Nội dung/}).click();
 await expect(page.getByTestId('news-title')).toHaveText('Một tiêu đề chung cho cả bản tin');
 await page.getByRole('button',{name:'Lưu dự án',exact:true}).click();
 await page.reload();
 await page.getByRole('button',{name:'Studio',exact:true}).last().click();
 await expect(page.getByLabel('Chế độ tiêu đề')).toHaveValue('all');
 await page.screenshot({path:'/private/tmp/crevid-title-modes.png',fullPage:true});
});

test('pasting a URL proposes a script without replacing current scenes until applied',async({page,request})=>{
 const project=await (await request.post('/api/projects',{data:{title:'Kiểm thử đề xuất'}})).json();
 const {suggestScript}=await import('../../src/lib/script');
 const source={url:'https://paper.example/story',title:'Hà Nội mở thêm tuyến xe buýt',text:'Hà Nội mở thêm tuyến xe buýt vào ngày 2 tháng 10. Tuyến mới phục vụ khu vực phía Tây thành phố.',fetchedAt:new Date().toISOString(),images:[]};
 const draft=suggestScript(source);
 await page.route('**/api/actions',async route=>{
  if(route.request().method()==='POST'&&route.request().postDataJSON()?.action==='import')await route.fulfill({json:{source,draft,project,imported:0,warnings:['Không có ảnh trong bài này.']}});
  else await route.continue();
 });
 await page.addInitScript(id=>localStorage.setItem('crevid-project',id),project.id);
 await page.goto('/');
 await page.getByLabel('URL bài báo').evaluate((element,url)=>{const data=new DataTransfer();data.setData('text/plain',url);element.dispatchEvent(new ClipboardEvent('paste',{clipboardData:data,bubbles:true,cancelable:true}));},source.url);
 await expect(page.getByText('BẢN NHÁP TỪ BÀI BÁO',{exact:true})).toBeVisible();
 await expect(page.getByLabel('Tiêu đề cảnh')).toHaveValue(project.scenes[0].headline);
 await page.getByRole('button',{name:'Dùng bản nháp & gắn ảnh'}).click();
 await expect(page.getByLabel('Tiêu đề cảnh')).toHaveValue(source.title);
 await expect(page.getByLabel('Lời đọc')).toHaveValue(draft.scenes[0].text);
 await expect(page.getByLabel('Gợi ý cách đọc')).toHaveValue(draft.scenes[0].voiceDirection);
 await page.getByRole('button',{name:'Lưu dự án',exact:true}).click();
 await expect(page.getByText('Đã lưu',{exact:true})).toBeVisible();
 const saved=await (await request.get(`/api/projects/${project.id}`)).json();
 expect(saved.source.url).toBe(source.url);expect(saved.scenes).toHaveLength(draft.scenes.length);
});

test('renders all four reference styles, fits Vietnamese text, and preserves editable highlights',async({page,request})=>{
 const project=await (await request.post('/api/projects',{data:{title:'Bốn phong cách tham khảo'}})).json();
 await page.addInitScript(id=>localStorage.setItem('crevid-project',id),project.id);
 await page.goto('/');
 await page.getByRole('button',{name:'Studio',exact:true}).last().click();
 await page.getByLabel('Chế độ tiêu đề').selectOption('all');
 const cases=[['Xanh bản đồ','emerald','Từ trẻ em đến người lớn đều mê: đậu phộng giòn rụm – món ăn vặt quốc dân qua bao năm vẫn hot, ăn hơi mỏi răng nhưng càng nhai càng cuốn!'],['Đỏ hồng','magenta','Dẫn bạn đi xem chỗ làm việc đầy cảm hứng của những người kể chuyện'],['Khung bản tin','bulletin','Quá xúc động, đây là những khoảnh khắc đẹp được ghi lại trên sân khấu âm nhạc'],['Thẻ nổi bật','spotlight','Không thể ngờ câu chuyện của Messi và Yamal lại được nhắc đến ở chung kết']];
 for(const [name,id,title] of cases){
  await page.getByRole('button',{name:`Phong cách ${name}`,exact:true}).click();
  await page.getByLabel('Vị trí theo mẫu').selectOption('reference');
  await page.getByLabel('Tiêu đề bản tin cố định').fill(title);
  if(id==='spotlight')await page.getByLabel('Cụm chữ nhấn màu').fill('Messi, Yamal, chung kết');
  await expect(page.getByTestId(`template-${id}`)).toBeVisible();
  await expect.poll(()=>page.getByTestId('news-title').evaluate(el=>el.scrollHeight<=el.clientHeight+1&&el.scrollWidth<=el.clientWidth+1)).toBeTruthy();
  const caption=await page.getByTestId('news-caption').boundingBox();
  const titleBox=await page.getByTestId('news-title').boundingBox();
  expect(caption!.y+caption!.height).toBeLessThan(titleBox!.y);
  await page.screenshot({path:`/private/tmp/crevid-${id}-studio.png`,fullPage:true});
 }
 await page.getByRole('button',{name:'Input',exact:true}).click();
 await page.getByLabel('Tư liệu thư viện',{exact:true}).setInputFiles('docs/references/news-style-reference.png');
 await expect(page.getByRole('button',{name:'news-style-reference.png Ảnh'})).toBeVisible();
 await page.getByRole('button',{name:'Studio',exact:true}).last().click();
 await page.getByLabel('Ảnh tròn 1',{exact:true}).selectOption({label:'news-style-reference.png'});
 await page.getByLabel('Ảnh tròn 2',{exact:true}).selectOption({label:'news-style-reference.png'});
 await expect(page.getByTestId('portrait-inset')).toHaveCount(2);
 await page.getByLabel('Vị trí theo mẫu').selectOption('safe');
 const safeCaption=await page.getByTestId('news-caption').boundingBox();
 for(const inset of await page.getByTestId('portrait-inset').all()){const box=await inset.boundingBox();expect(box!.y+box!.height).toBeLessThan(safeCaption!.y);}
 await page.getByLabel('Vị trí theo mẫu').selectOption('reference');
 const highlighted=page.getByTestId('news-title').getByText('Messi',{exact:true});
 await expect(highlighted).toHaveCSS('color','rgb(255, 103, 30)');
 await page.getByLabel('Chế độ tiêu đề').selectOption('intro');
 await page.getByRole('button',{name:/02 Nội dung/}).click();
 await expect(page.getByTestId('template-spotlight')).toHaveCount(0);
 await page.getByRole('button',{name:'Lưu dự án',exact:true}).click();
 await expect(page.getByText('Đã lưu',{exact:true})).toBeVisible();
 const saved=await (await request.get(`/api/projects/${project.id}`)).json();
 expect(saved.template).toBe('spotlight');expect(saved.design.highlightTerms).toEqual(['Messi','Yamal','chung kết']);
});

test('uses compact lower cards with TikTok and Reels guides outside the video',async({page,request})=>{
 const project=await (await request.post('/api/projects',{data:{title:'Kiểm thử TikTok và Reels'}})).json();
 await page.addInitScript(id=>localStorage.setItem('crevid-project',id),project.id);
 await page.goto('/');
 await page.getByRole('button',{name:'Studio',exact:true}).last().click();
 await page.getByRole('button',{name:'Phong cách Thẻ nổi bật',exact:true}).click();
 await page.getByLabel('Tiêu đề bản tin cố định').fill('Hà Nội đón ngày mới');
 for(const platform of ['tiktok','reels','shorts']){
  await page.getByLabel('Nền tảng bố cục').selectOption(platform);
  await expect(page.getByTestId('platform-guide')).toHaveAttribute('data-platform',platform);
  const guide=(await page.getByTestId('platform-guide').boundingBox())!;
  expect(guide.width/guide.height).toBeCloseTo(591/1280,3);
  const icon=page.getByTestId('platform-action-rail').locator(`[data-icon=${platform==='reels'?'like':'heart'}]`);
  const iconBox=(await icon.boundingBox())!;
  const measured=platform==='tiktok'?[521,596,44]:platform==='reels'?[527,641,38]:[525,598,32];
  // Nested SVG bounding boxes describe the drawn path, not the icon's viewport.
  await expect(icon).toHaveAttribute('x',String(measured[0]));
  await expect(icon).toHaveAttribute('y',String(measured[1]));
  await expect(icon).toHaveAttribute('width',String(measured[2]));
  expect(Math.abs((iconBox.x-guide.x)/guide.width*591-measured[0])).toBeLessThan(5);
  expect(Math.abs((iconBox.y-guide.y)/guide.height*1280-measured[1])).toBeLessThan(5);
  const videoBox=(await page.getByTestId('video-viewport').boundingBox())!;expect(videoBox.width/videoBox.height).toBeCloseTo(9/16,3);

  const frame=(await page.getByTestId('video-viewport').boundingBox())!;
  const panel=(await page.getByTestId('title-panel').boundingBox())!;
  const caption=(await page.getByTestId('news-caption').boundingBox())!;
  expect((panel.y-frame.y)/frame.height).toBeGreaterThan(.65);
  expect(panel.height/frame.height).toBeLessThan(.15);
  expect((caption.y-frame.y)/frame.height).toBeGreaterThan(.57);
  expect(caption.y+caption.height).toBeLessThan(panel.y);
  const rail=(await page.getByTestId('platform-action-rail').boundingBox())!;
  expect(panel.x+panel.width).toBeLessThan(rail.x);
  const bottom=(await page.getByTestId('platform-bottom-ui').boundingBox())!;
  expect(panel.y+panel.height).toBeLessThan(bottom.y);
  await page.locator('.player-wrap').screenshot({path:`/private/tmp/crevid-${platform}-guide.png`});
 }
 await page.getByRole('button',{name:'Đối chiếu ảnh mẫu',exact:true}).click();
 await expect(page.getByTestId('platform-reference-image')).toHaveAttribute('src','/platform-references/shorts.jpg');
 await expect(page.getByTestId('platform-reference-image')).toBeVisible();
 await page.getByRole('button',{name:'Trở lại video',exact:true}).click();
 await expect(page.getByTestId('platform-reference-image')).toHaveCount(0);
 await page.getByLabel('Hiện giao diện nền tảng').uncheck();
 await expect(page.getByTestId('platform-guide')).toHaveCount(0);
 await page.locator('.player-wrap').screenshot({path:'/private/tmp/crevid-compact-clean.png'});
 await page.getByRole('button',{name:'Phát xem trước',exact:true}).click();
 await expect(page.getByRole('button',{name:'Tạm dừng xem trước',exact:true})).toBeVisible();
 await page.getByRole('button',{name:'Tạm dừng xem trước',exact:true}).click();
 await page.getByRole('button',{name:'Lưu dự án',exact:true}).click();
 await page.reload();
 await expect(page.getByLabel('Nền tảng bố cục')).toHaveValue('shorts');
 await page.getByLabel('Tỷ lệ khung hình').selectOption('16:9');
 await expect(page.getByTestId('platform-guide')).toHaveCount(0);
});

test('uploads and assigns logo and background music directly in Studio',async({page,request})=>{
 const project=await (await request.post('/api/projects',{data:{title:'Kiểm thử logo và nhạc'}})).json();
 await page.addInitScript(id=>localStorage.setItem('crevid-project',id),project.id);
 await page.goto('/');
 await page.getByRole('button',{name:'Studio',exact:true}).last().click();
 const logoPicker=page.waitForEvent('filechooser');await page.getByRole('button',{name:'Tải logo',exact:true}).click();
 await (await logoPicker).setFiles('docs/references/news-style-reference.png');
 await expect(page.getByLabel('Logo',{exact:true}).locator('option:checked')).toHaveText('news-style-reference.png');
 await expect(page.getByText('Đã tải và gắn logo vào dự án.',{exact:true})).toBeVisible();
 const wav=Buffer.alloc(44+16000*2);wav.write('RIFF');wav.writeUInt32LE(wav.length-8,4);wav.write('WAVEfmt ',8);wav.writeUInt32LE(16,16);wav.writeUInt16LE(1,20);wav.writeUInt16LE(1,22);wav.writeUInt32LE(16000,24);wav.writeUInt32LE(32000,28);wav.writeUInt16LE(2,32);wav.writeUInt16LE(16,34);wav.write('data',36);wav.writeUInt32LE(wav.length-44,40);
 const musicPicker=page.waitForEvent('filechooser');await page.getByRole('button',{name:'Tải nhạc nền',exact:true}).click();
 await (await musicPicker).setFiles({name:'nhac-kiem-thu.wav',mimeType:'audio/wav',buffer:wav});
 await expect(page.getByLabel('Nhạc nền',{exact:true}).locator('option:checked')).toHaveText('nhac-kiem-thu.wav');
 await expect(page.getByText('Đã tải và gắn nhạc nền vào dự án.',{exact:true})).toBeVisible();
 const saved=await (await request.get(`/api/projects/${project.id}`)).json();
 expect(saved.assets.find((a:{id:string})=>a.id===saved.brand.logoId)?.kind).toBe('image');
 expect(saved.assets.find((a:{id:string})=>a.id===saved.musicId)?.kind).toBe('audio');
 expect(saved.scenes[0].voice).toBeUndefined();
 await page.reload();await page.getByRole('button',{name:'Studio',exact:true}).last().click();
 await expect(page.getByLabel('Logo',{exact:true})).toHaveValue(saved.brand.logoId);
 await expect(page.getByLabel('Nhạc nền',{exact:true})).toHaveValue(saved.musicId);
 await expect(page.getByLabel('Hiển thị thương hiệu')).toHaveValue('both');
 await expect(page.getByTestId('brand-logo')).toBeVisible();
 await expect(page.getByTestId('brand-name')).toHaveText('CRE NEWS');
 await page.getByRole('button',{name:'Phong cách Xanh bản đồ',exact:true}).click();
 await expect.poll(async()=>{const mark=(await page.getByTestId('brand-mark').boundingBox())!,header=(await page.getByTestId('template-brand').boundingBox())!;return mark.width/header.width;}).toBeLessThan(.55);
 const originalBadge=(await page.getByTestId('brand-badge').boundingBox())!;
 await page.getByLabel('Kích cỡ logo',{exact:true}).fill('300');
 const raisedLogo=(await page.getByTestId('brand-logo').boundingBox())!,nameBadge=(await page.getByTestId('brand-name').boundingBox())!;
 expect(raisedLogo.height).toBeGreaterThan(nameBadge.height);
 expect(raisedLogo.y).toBeLessThan(nameBadge.y);
 const badge=page.getByTestId('brand-badge');
 expect((await badge.boundingBox())!.height).toBeCloseTo(originalBadge.height,1);
 await page.getByLabel('Kích cỡ tên thương hiệu',{exact:true}).fill('200');
 await expect.poll(async()=>((await badge.boundingBox())!.height/originalBadge.height)).toBeCloseTo(2,1);
 expect((await page.getByTestId('brand-logo').boundingBox())!.height).toBeCloseTo(raisedLogo.height,1);
 const pill=(await badge.boundingBox())!,viewport=(await page.getByTestId('video-viewport').boundingBox())!;
 expect(pill.x).toBeCloseTo(viewport.x,0);
 const corners=await badge.evaluate(el=>{const c=getComputedStyle(el);return [c.borderTopLeftRadius,c.borderBottomLeftRadius,c.borderTopRightRadius,c.borderBottomRightRadius];});
 expect(corners).toEqual(['0px','0px','9999px','9999px']);
 const outline=await badge.evaluate(el=>{const c=getComputedStyle(el);return [c.borderTopWidth,c.borderTopStyle,c.borderTopColor];});
 expect(outline).toEqual(['1px','solid','rgb(255, 255, 255)']);
 const logoBottom=await page.getByTestId('brand-logo').evaluate(el=>el.getBoundingClientRect().bottom);
 const textBottom=await page.getByTestId('brand-name').evaluate(el=>el.firstElementChild!.getBoundingClientRect().bottom);
 expect(logoBottom).toBeCloseTo(textBottom,0);
 await page.locator('.player-wrap').screenshot({path:'/private/tmp/crevid-half-pill-brand.png'});
 await page.getByLabel('Kích cỡ tên thương hiệu',{exact:true}).fill('100');
 await page.getByRole('button',{name:'Đặt lại kích cỡ logo',exact:true}).click();
 await page.getByLabel('Tên thương hiệu',{exact:true}).fill('TRUYỀN THÔNG THÀNH PHỐ HÀ NỘI');
 for(const style of ['Xanh bản đồ','Đỏ hồng','Khung bản tin','Thẻ nổi bật','Thể thao','Phim ảnh','YouTube Shorts']){
  await page.getByRole('button',{name:`Phong cách ${style}`,exact:true}).click();
  await expect(page.getByTestId('brand-logo')).toBeVisible();
  await expect(page.getByTestId('brand-name')).toHaveText('TRUYỀN THÔNG THÀNH PHỐ HÀ NỘI');
  await expect.poll(()=>page.getByTestId('brand-name').evaluate(el=>(el.firstElementChild?.getBoundingClientRect().width||0)<=el.clientWidth+1)).toBeTruthy();
  const initial=(await page.getByTestId('brand-logo').boundingBox())!;
  await page.getByLabel('Kích cỡ logo',{exact:true}).focus();await page.getByLabel('Kích cỡ logo',{exact:true}).fill('200');
  await expect(page.getByLabel('Kích cỡ logo',{exact:true})).toHaveValue('200');
  const enlarged=(await page.getByTestId('brand-logo').boundingBox())!;expect(enlarged.height).toBeCloseTo(initial.height*2,0);
  const header=(await page.getByTestId('template-brand').boundingBox())!;expect(enlarged.y).toBeGreaterThanOrEqual(header.y-1);expect(enlarged.y+enlarged.height).toBeLessThanOrEqual(header.y+header.height+1);
  await page.getByRole('button',{name:'Đặt lại kích cỡ logo',exact:true}).click();
  await expect(page.getByLabel('Kích cỡ logo',{exact:true})).toHaveValue('100');

 }
 await page.getByLabel('Hiển thị thương hiệu').selectOption('logo');
 await expect(page.getByTestId('brand-logo')).toBeVisible();await expect(page.getByTestId('brand-name')).toHaveCount(0);
 await page.getByLabel('Hiển thị thương hiệu').selectOption('name');
 await expect(page.getByTestId('brand-logo')).toHaveCount(0);await expect(page.getByTestId('brand-name')).toBeVisible();
 await page.getByLabel('Hiển thị thương hiệu').selectOption('both');
 await page.getByLabel('Kích cỡ logo',{exact:true}).focus();await page.getByLabel('Kích cỡ logo',{exact:true}).press('Home');
 await page.getByLabel('Kích cỡ tên thương hiệu',{exact:true}).fill('250');
 await page.getByRole('button',{name:'Lưu dự án',exact:true}).click();
 await page.reload();await page.getByRole('button',{name:'Studio',exact:true}).last().click();
 await expect(page.getByLabel('Kích cỡ tên thương hiệu',{exact:true})).toHaveValue('250');
 await expect(page.getByLabel('Hiển thị thương hiệu')).toHaveValue('both');
 await expect(page.getByTestId('brand-logo')).toBeVisible();await expect(page.getByTestId('brand-name')).toBeVisible();
 await expect(page.getByLabel('Kích cỡ logo',{exact:true})).toHaveValue('50');
 await page.getByRole('button',{name:'Tải nhạc nền',exact:true}).scrollIntoViewIfNeeded();
 await page.screenshot({path:'/private/tmp/crevid-studio-uploads.png',fullPage:true});
});

test('supports sports cinema and Shorts styles with fitted titles and saved settings',async({page,request})=>{
 const project=await (await request.post('/api/projects',{data:{title:'Kiểm thử ba phong cách mới'}})).json();
 const errors:string[]=[];page.on('pageerror',e=>errors.push(e.message));page.on('console',m=>{if(m.type()==='error')errors.push(`${m.text()} ${m.location().url}`);});
 await page.addInitScript(id=>localStorage.setItem('crevid-project',id),project.id);await page.goto('/');
 await page.getByRole('button',{name:'Studio',exact:true}).last().click();
 await page.getByLabel('Hiện giao diện nền tảng').uncheck();
 const styles=[['Thể thao','sports','Bứt phá đến phút cuối'],['Phim ảnh','cinema','Phía sau một thước phim'],['YouTube Shorts','shorts','Một phút. Một câu chuyện.']];
 for(const [name,id,title] of styles){
  await page.getByRole('button',{name:`Phong cách ${name}`,exact:true}).click();
  await page.getByLabel('Tiêu đề bản tin cố định').fill(title);
  await expect(page.getByTestId(`template-${id}`)).toBeVisible();
  const panel=(await page.getByTestId('title-panel').boundingBox())!;const frame=(await page.getByTestId('video-viewport').boundingBox())!;
  expect((panel.y-frame.y)/frame.height).toBeGreaterThan(.65);
  await expect.poll(()=>page.getByTestId('news-title').evaluate(el=>el.scrollHeight<=el.clientHeight+1&&el.scrollWidth<=el.clientWidth+1)).toBeTruthy();
  await page.locator('.player-wrap').screenshot({path:`/private/tmp/crevid-${id}-new.png`});
  await page.getByLabel('Tiêu đề bản tin cố định').fill('Những câu chuyện đáng chú ý phía sau khoảnh khắc đặc biệt, cùng nhìn lại hành trình đầy cảm hứng qua từng hình ảnh và góc nhìn mới');
  for(const aspect of ['9:16','16:9','1:1']){
   await page.getByLabel('Tỷ lệ khung hình').selectOption(aspect);
   await expect.poll(()=>page.getByTestId('news-title').evaluate(el=>el.scrollHeight<=el.clientHeight+1&&el.scrollWidth<=el.clientWidth+1)).toBeTruthy();
   const caption=(await page.getByTestId('news-caption').boundingBox())!;const card=(await page.getByTestId('title-panel').boundingBox())!;expect(caption.y+caption.height).toBeLessThan(card.y);
  }
  await page.getByLabel('Tỷ lệ khung hình').selectOption('9:16');
  await page.getByLabel('Chế độ tiêu đề').selectOption('intro');await page.getByRole('button',{name:/02 Nội dung/}).click();
  await expect(page.getByTestId(`template-${id}`)).toHaveCount(0);
  await page.getByLabel('Chế độ tiêu đề').selectOption('all');await expect(page.getByTestId(`template-${id}`)).toBeVisible();
  await page.getByRole('button',{name:/01 Mở đầu/}).click();
 }
 await page.getByRole('button',{name:'Lưu dự án',exact:true}).click();await page.reload();
 await expect(page.getByTestId('template-shorts')).toBeVisible();
 const saved=await (await request.get(`/api/projects/${project.id}`)).json();expect(saved.template).toBe('shorts');expect(saved.titleMode).toBe('all');
 expect(errors.filter(e=>!e.includes('favicon'))).toEqual([]);
});

test('uses separate Body framing, opposite branding and persisted Sign opacity',async({page,request})=>{
 const project=await (await request.post('/api/projects',{data:{title:'Body và Sign'}})).json();
 expect(project.scenes.map((s:{kind:string})=>s.kind)).toEqual(['intro','body']);
 await page.addInitScript(id=>localStorage.setItem('crevid-project',id),project.id);
 await page.goto('/');
 await page.getByRole('button',{name:'Studio',exact:true}).last().click();
 await expect(page.getByLabel('Bố cục Body')).toHaveCount(0);
 await page.getByRole('button',{name:/02 Nội dung/}).click();
 await page.getByLabel('Độ mờ Sign').focus();await page.getByLabel('Độ mờ Sign').press('Home');for(let i=0;i<60;i++)await page.getByLabel('Độ mờ Sign').press('ArrowRight');
 await expect(page.getByTestId('news-sign')).toHaveCSS('opacity','0.4');
 for(const layout of ['4:3','1:1','full']){
  await page.getByLabel('Bố cục Body').selectOption(layout);
  const frame=(await page.getByTestId('video-viewport').boundingBox())!;
  const media=(await page.getByTestId('body-media-window').boundingBox())!;
  expect(media.width/media.height).toBeCloseTo(layout==='4:3'?4/3:layout==='1:1'?1:9/16,2);
  expect(media.y-frame.y).toBeCloseTo(layout==='full'?0:Math.max(0,(frame.height-media.height)/2-frame.height*.08),0);
  await expect(page.getByTestId('body-blur')).toHaveCount(layout==='full'?0:1);
  const brand=(await page.getByTestId('scene-brand').boundingBox())!;
  const sign=(await page.getByTestId('news-sign').boundingBox())!;
  expect(brand.x).toBeGreaterThan(frame.x+frame.width*.4);
  expect(sign.x).toBeLessThan(frame.x+frame.width*.2);
  await page.locator('.player-wrap').screenshot({path:`/private/tmp/crevid-body-${layout.replace(':','-')}.png`});
 }
 await page.getByLabel('Chế độ tiêu đề').selectOption('all');
 for(const style of ['Xanh bản đồ','Đỏ hồng','Khung bản tin','Thẻ nổi bật','Thể thao','Phim ảnh','YouTube Shorts']){
  await page.getByRole('button',{name:`Phong cách ${style}`,exact:true}).click();
  await expect(page.getByTestId('brand-mark')).toHaveCount(1);
  await expect(page.getByTestId('scene-brand')).toHaveCount(0);
  await expect(page.getByTestId('template-brand').getByTestId('brand-name')).toHaveText('CRE NEWS');
  await expect(page.getByTestId('template-brand').getByTestId('brand-mark')).toHaveCount(1);
 }
 await page.getByLabel('Chế độ tiêu đề').selectOption('intro');
 await page.getByLabel('Bố cục Body').selectOption('4:3');
 await page.getByRole('button',{name:'Lưu dự án',exact:true}).click();
 await expect(page.getByText('Đã lưu',{exact:true})).toBeVisible();
 await page.reload();
 await page.getByRole('button',{name:'Studio',exact:true}).last().click();
 await page.getByRole('button',{name:/02 Nội dung/}).click();
 await expect(page.getByLabel('Bố cục Body')).toHaveValue('4:3');
 await expect(page.getByLabel('Độ mờ Sign')).toHaveValue('60');
 await page.getByLabel('Độ mờ Sign').focus();await page.getByLabel('Độ mờ Sign').press('End');
 await expect(page.getByTestId('news-sign')).toHaveCSS('opacity','0');
});

test('enlarges and rounds logos and creates named editable styles from uploaded images',async({page,request})=>{
 const project=await (await request.post('/api/projects',{data:{title:'Logo 1000 và custom'}})).json();
 await page.addInitScript(id=>localStorage.setItem('crevid-project',id),project.id);await page.goto('/');
 await page.getByRole('button',{name:'Studio',exact:true}).last().click();
 await page.getByLabel('Loại giao diện khi tải ảnh',{exact:true}).selectOption('lower-third');
 await page.getByLabel('Ảnh tạo giao diện').setInputFiles('docs/references/news-style-reference.png');
 await expect(page.getByLabel('Tên giao diện custom')).toHaveValue(/news style reference/);
 await expect(page.getByLabel('Loại giao diện custom',{exact:true})).toHaveValue('lower-third');
 const lower=(await page.getByTestId('title-panel').boundingBox())!,view=(await page.getByTestId('video-viewport').boundingBox())!;
 expect(lower.width/view.width).toBeCloseTo(1,3);expect(lower.height/view.height).toBeCloseTo(1/3,3);
 expect(lower.y+lower.height).toBeCloseTo(view.y+view.height,0);
 await page.getByLabel('Loại giao diện custom',{exact:true}).selectOption('popup');
 await expect(page.getByTestId('title-panel')).toHaveAttribute('data-custom-layout','popup');
 expect((await page.getByTestId('title-panel').boundingBox())!.width).toBeLessThan(view.width);

 await expect(page.getByTestId('template-custom')).toBeVisible();
 await page.getByLabel('Tên giao diện custom').fill('Bản tin của tôi');
 await page.getByLabel('Tiêu đề bản tin cố định').fill('Một góc nhìn mới từ giao diện riêng');
 await expect(page.getByTestId('news-title')).toContainText('Một góc nhìn mới');
 await page.getByLabel('Cách dùng ảnh custom').selectOption('image');
 await expect(page.getByTestId('custom-style-image')).toBeVisible();
 await page.getByLabel('Logo',{exact:true}).selectOption({label:'news-style-reference.png'});
 await page.getByLabel('Kích cỡ logo',{exact:true}).fill('1000');
 await page.getByLabel('Bo góc logo',{exact:true}).fill('100');
 const logo=page.getByTestId('brand-logo');await expect(logo).toHaveCSS('border-radius','50%');
 const box=(await logo.boundingBox())!;expect(box.width).toBeCloseTo(box.height,1);
 await page.getByRole('button',{name:'Lưu dự án',exact:true}).click();await expect(page.getByText('Đã lưu',{exact:true})).toBeVisible();
 await page.reload();await page.getByRole('button',{name:'Studio',exact:true}).last().click();
 await expect(page.getByLabel('Tên giao diện custom')).toHaveValue('Bản tin của tôi');
 await expect(page.getByLabel('Loại giao diện custom',{exact:true})).toHaveValue('popup');
 await expect(page.getByLabel('Kích cỡ logo',{exact:true})).toHaveValue('1000');
 await expect(page.getByLabel('Bo góc logo',{exact:true})).toHaveValue('100');
 const customId=await page.getByLabel('Giao diện custom',{exact:true}).inputValue();
 for(const aspect of ['9:16','16:9']){
  await page.getByLabel('Tỷ lệ khung hình').selectOption(aspect);
  for(const style of ['Xanh bản đồ','Đỏ hồng','Khung bản tin','Thẻ nổi bật','Thể thao','Phim ảnh','YouTube Shorts']){
   await page.getByRole('button',{name:`Phong cách ${style}`,exact:true}).click();
   const logoBox=(await page.getByTestId('brand-logo').boundingBox())!,header=(await page.getByTestId('template-brand').boundingBox())!;
   expect(logoBox.width).toBeCloseTo(logoBox.height,1);
   expect(logoBox.y).toBeGreaterThanOrEqual(header.y-1);expect(logoBox.y+logoBox.height).toBeLessThanOrEqual(header.y+header.height+1);
  }
 }
 await page.getByLabel('Tỷ lệ khung hình').selectOption('9:16');
 await page.getByLabel('Giao diện custom',{exact:true}).selectOption(customId);
 await page.getByLabel('Cách dùng ảnh custom').selectOption('adapt');
 await expect(page.getByTestId('custom-style-image')).toHaveCount(0);
 await page.getByRole('button',{name:/02 Nội dung/}).click();
 await expect(page.getByTestId('template-custom')).toHaveCount(0);
 await expect(page.getByTestId('brand-logo')).toHaveCSS('border-radius','50%');
 await page.getByLabel('Chế độ tiêu đề').selectOption('all');
 await expect(page.getByTestId('template-custom')).toBeVisible();
 await expect(page.getByTestId('brand-mark')).toHaveCount(1);
 await page.locator('.player-wrap').screenshot({path:'/private/tmp/crevid-custom-logo.png'});
});

test('platform guides leave video layers and saved placement unchanged',async({page,request})=>{
 const p=await (await request.post('/api/projects',{data:{title:'Lớp phủ độc lập'}})).json();
 await page.addInitScript(id=>localStorage.setItem('crevid-project',id),p.id);await page.goto('/');
 await page.getByRole('button',{name:'Studio',exact:true}).last().click();
 await page.getByRole('button',{name:'Phong cách Xanh bản đồ',exact:true}).click();
 await page.getByLabel('Chế độ tiêu đề').selectOption('all');
 await page.getByRole('button',{name:/02 Nội dung/}).click();
 await expect(page.getByTestId('template-brand').getByTestId('brand-name')).toHaveText('CRE NEWS');
 await expect(page.getByTestId('scene-brand')).toHaveCount(0);
 for(const placement of ['safe','reference']){
  await page.getByLabel('Vị trí theo mẫu').selectOption(placement);
  await page.getByRole('button',{name:'Lưu dự án',exact:true}).click();await expect(page.getByText('Đã lưu',{exact:true})).toBeVisible();
  const saved=await (await request.get(`/api/projects/${p.id}`)).json();
  const geometry=()=>page.evaluate(()=>Object.fromEntries(['video-viewport','news-sign','news-watermark','brand-mark','news-title','news-caption'].map(id=>{const r=document.querySelector(`[data-testid="${id}"]`)!.getBoundingClientRect();return [id,[r.x,r.y,r.width,r.height]];})));
  await page.evaluate(()=>document.fonts.ready);const before=await geometry();
  for(const platform of ['reels','shorts','tiktok']){
   await page.getByLabel('Nền tảng bố cục').selectOption(platform);
   await expect(page.getByTestId('platform-guide')).toHaveAttribute('data-platform',platform);
   expect(await geometry()).toEqual(before);
   await expect(page.getByLabel('Vị trí theo mẫu')).toHaveValue(placement);
   await expect(page.getByText('Đã lưu',{exact:true})).toBeVisible();
  }
  const after=await (await request.get(`/api/projects/${p.id}`)).json();expect(after.revision).toBe(saved.revision);expect(after.design).toEqual(saved.design);
 }
});

for(const [style,template] of [['Xanh bản đồ','emerald'],['Đỏ hồng','magenta']])test(`intro title background remains opaque when an image is inserted (${template})`,async({page,request})=>{
 const p=await (await request.post('/api/projects',{data:{title:'Intro rõ chữ'}})).json();
 await page.addInitScript(id=>localStorage.setItem('crevid-project',id),p.id);await page.goto('/');
 await page.getByRole('button',{name:'Studio',exact:true}).last().click();
 await page.getByRole('button',{name:`Phong cách ${style}`,exact:true}).click();
 await page.getByLabel('Hiện giao diện nền tảng').uncheck();
 await expect(page.getByTestId(`template-${template}`)).toHaveCSS('opacity','1');
 await page.evaluate(()=>document.fonts.ready);
 const before=await page.getByTestId('news-title').screenshot();
 await page.getByRole('button',{name:'Input',exact:true}).click();
 await page.getByLabel('Tư liệu thư viện',{exact:true}).setInputFiles('docs/references/news-style-reference.png');
 await page.getByRole('button',{name:'news-style-reference.png Ảnh'}).click();
 await page.getByRole('button',{name:'Đóng thông báo'}).click();
 await page.getByRole('button',{name:'Studio',exact:true}).last().click();
 await expect(page.getByTestId('body-media-window').locator('img')).toBeVisible();
 const after=await page.getByTestId('news-title').screenshot();expect(after.equals(before)).toBe(true);
 await page.locator('.player-wrap').screenshot({path:`/private/tmp/crevid-intro-opaque-${template}.png`});
});

test('resizes and moves frames while preserving settings per custom layout',async({page,request})=>{
 const p=await (await request.post('/api/projects',{data:{title:'Chiều cao và vị trí khung'}})).json();
 await page.addInitScript(id=>localStorage.setItem('crevid-project',id),p.id);await page.goto('/');
 await page.getByRole('button',{name:'Studio',exact:true}).last().click();
 await page.getByLabel('Loại giao diện khi tải ảnh',{exact:true}).selectOption('lower-third');
 await page.getByLabel('Ảnh tạo giao diện').setInputFiles('docs/references/news-style-reference.png');
 await expect(page.getByTestId('title-panel')).toHaveAttribute('data-custom-layout','lower-third');
 await page.getByRole('button',{name:'Đóng thông báo',exact:true}).click();
 const rect=()=>page.getByTestId('title-panel').boundingBox();
 const initial=(await rect())!;
 await page.getByLabel('Chiều cao khung',{exact:true}).fill('150');
 const large=(await rect())!;expect(large.height/initial.height).toBeCloseTo(1.5,2);expect(large.y+large.height).toBeCloseTo(initial.y+initial.height,0);
 await page.getByLabel('Vị trí khung',{exact:true}).fill('10');
 const raised=(await rect())!,view=(await page.getByTestId('video-viewport').boundingBox())!;
 expect(raised.height).toBeCloseTo(large.height,0);expect((large.y-raised.y)/view.height).toBeCloseTo(.1,2);
 await page.locator('.player-wrap').screenshot({path:'/private/tmp/crevid-frame-lower-third.png'});
 await page.getByLabel('Loại giao diện custom',{exact:true}).selectOption('popup');
 await expect(page.getByLabel('Chiều cao khung',{exact:true})).toHaveValue('100');
 await expect(page.getByLabel('Vị trí khung',{exact:true})).toHaveValue('0');
 const popup=(await rect())!;
 await page.getByLabel('Chiều cao khung',{exact:true}).fill('175');await page.getByLabel('Vị trí khung',{exact:true}).fill('-10');
 const moved=(await rect())!;expect(moved.height/popup.height).toBeCloseTo(1.75,2);expect(moved.y+moved.height).toBeGreaterThan(popup.y+popup.height);
 await page.locator('.player-wrap').screenshot({path:'/private/tmp/crevid-frame-popup.png'});
 await page.getByRole('button',{name:'Lưu dự án',exact:true}).click();await page.reload();
 await page.getByRole('button',{name:'Studio',exact:true}).last().click();
 await expect(page.getByLabel('Chiều cao khung',{exact:true})).toHaveValue('175');
 await expect(page.getByLabel('Vị trí khung',{exact:true})).toHaveValue('-10');
 await page.getByLabel('Loại giao diện custom',{exact:true}).selectOption('lower-third');
 await expect(page.getByLabel('Chiều cao khung',{exact:true})).toHaveValue('150');await expect(page.getByLabel('Vị trí khung',{exact:true})).toHaveValue('10');
 await page.getByRole('button',{name:'Đặt lại kích thước & vị trí',exact:true}).click();
 await expect(page.getByLabel('Chiều cao khung',{exact:true})).toHaveValue('100');await expect(page.getByLabel('Vị trí khung',{exact:true})).toHaveValue('0');
});

test('uploads mixed visuals as separate Body scenes with narration motion and video framing',async({page,request})=>{
 const {mkdtemp,readFile,rm}=await import('node:fs/promises');const {tmpdir}=await import('node:os');const {join}=await import('node:path');
 const {execFile}=await import('node:child_process');const {promisify}=await import('node:util');const {default:ffmpeg}=await import('ffmpeg-static');
 const dir=await mkdtemp(join(tmpdir(),'crevid-batch-'));
 try{
  const video=join(dir,'clip.mp4');await promisify(execFile)(ffmpeg!,['-y','-v','error','-f','lavfi','-i','testsrc2=size=640x360:rate=30:duration=2','-c:v','libx264','-pix_fmt','yuv420p',video]);
  const p=await (await request.post('/api/projects',{data:{title:'Nhiều tư liệu và chuyển động'}})).json();
  await page.addInitScript(id=>localStorage.setItem('crevid-project',id),p.id);await page.goto('/');
  const chooser=page.waitForEvent('filechooser');await page.getByRole('button',{name:'Tải nhiều ảnh/video → tạo Nội dung',exact:true}).click();
  const png=await readFile('docs/references/news-style-reference.png');
  await (await chooser).setFiles([{name:'anh-1.png',mimeType:'image/png',buffer:png},{name:'clip.mp4',mimeType:'video/mp4',buffer:await readFile(video)},{name:'anh-2.png',mimeType:'image/png',buffer:png}]);
  await expect(page.getByText(/Đã tạo 3 cảnh Nội dung/)).toBeVisible();
  const saved=await (await request.get(`/api/projects/${p.id}`)).json();expect(saved.scenes).toHaveLength(5);expect(saved.assets.map((a:{kind:string})=>a.kind)).toEqual(['image','video','image']);
  expect(saved.scenes.slice(2).map((s:{mediaId:string})=>s.mediaId)).toEqual(saved.assets.map((a:{id:string})=>a.id));
  await expect(page.getByLabel('Lời đọc của cảnh',{exact:true})).toHaveValue('');
  await page.getByLabel('Lời đọc của cảnh',{exact:true}).fill('Lời đọc cho ảnh đầu tiên.');
  const start=saved.scenes.slice(0,2).reduce((n:number,s:{duration:number})=>n+s.duration*30,0);
  for(const motion of ['zoom-in','zoom-out','pan-left','pan-right']){
   await page.getByLabel('Hiệu ứng ảnh',{exact:true}).selectOption(motion);
   await page.getByLabel('Vị trí xem trước',{exact:true}).fill(String(start));const first=await page.getByTestId('media-motion').evaluate(el=>getComputedStyle(el).transform);
   await page.getByLabel('Vị trí xem trước',{exact:true}).fill(String(start+149));
   await expect.poll(()=>page.getByTestId('media-motion').evaluate(el=>getComputedStyle(el).transform)).not.toBe(first);
  }
  await page.getByRole('button',{name:/04 Nội dung clip/}).click();
  await expect(page.getByLabel('Hiệu ứng ảnh',{exact:true})).toHaveCount(0);
  await expect(page.getByLabel('Bố cục Body',{exact:true})).toHaveValue('source');
  const native=(await page.getByTestId('body-media-window').boundingBox())!;expect(native.width/native.height).toBeCloseTo(16/9,2);
  await page.getByLabel('Bố cục Body',{exact:true}).selectOption('4:3');await page.getByLabel('Hiển thị tư liệu',{exact:true}).selectOption('cover');
  await page.getByLabel('Vị trí ngang',{exact:true}).fill('80');await page.getByLabel('Vị trí dọc',{exact:true}).fill('20');
  await page.getByLabel('Vị trí khung tư liệu',{exact:true}).fill('20');await page.getByLabel('Bắt đầu clip',{exact:true}).fill('0.5');
  await expect(page.getByTestId('body-media-window').locator('video')).toHaveCSS('object-position','80% 20%');
  await page.getByLabel('Lời đọc của cảnh',{exact:true}).fill('Lời đọc riêng cho video.');
  await page.getByRole('button',{name:'Lưu dự án',exact:true}).click();await page.reload();
  await page.getByRole('button',{name:/03 Nội dung anh-1/}).click();
  await expect(page.getByLabel('Hiệu ứng ảnh',{exact:true})).toHaveValue('pan-right');await expect(page.getByLabel('Lời đọc của cảnh',{exact:true})).toHaveValue('Lời đọc cho ảnh đầu tiên.');
  await page.getByRole('button',{name:/04 Nội dung clip/}).click();
  await expect(page.getByLabel('Vị trí ngang',{exact:true})).toHaveValue('80');await expect(page.getByLabel('Vị trí khung tư liệu',{exact:true})).toHaveValue('20');
  await expect(page.getByLabel('Lời đọc của cảnh',{exact:true})).toHaveValue('Lời đọc riêng cho video.');
  await page.locator('.player-wrap').screenshot({path:'/private/tmp/crevid-mixed-body-video.png'});
 }finally{await rm(dir,{recursive:true,force:true});}
});
