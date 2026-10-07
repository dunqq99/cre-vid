import { describe, it, expect } from 'vitest';
import { newProject, sceneFrames, timeline, validateProject, captions, toSrt } from '../src/lib/model';

describe('timeline contracts', () => {
  it('extends a scene to the measured voice duration without dropping the final frame', () => {
    const p = newProject('Bản tin');
    p.assets.push({id:'audio1', name:'Voice', kind:'audio', file:'audio1.wav', mime:'audio/wav', bytes:10, duration:5.01});
    p.scenes[0].duration=3;
    p.scenes[0].voice={assetId:'audio1',text:p.scenes[0].text,provider:'upload',voiceId:''};
    expect(sceneFrames(p.scenes[0], p.assets)).toBe(151);
    expect(timeline(p)[1].from).toBe(151);
  });
  it('blocks stale voice, missing assets, and an oversized timeline', () => {
    const p = newProject('Bản tin');
    p.scenes[0].voice={assetId:'missing',text:'Lời cũ',provider:'upload',voiceId:''};
    expect(validateProject(p).some(x => x.includes('giọng đọc'))).toBe(true);
    p.scenes[0].voice=undefined;
    p.scenes[0].mediaId='missing';
    expect(validateProject(p).some(x => x.includes('tư liệu'))).toBe(true);
    p.scenes[0].mediaId=undefined;
    p.scenes.forEach(s=>s.duration=100);
    expect(validateProject(p).some(x=>x.includes('180'))).toBe(true);
  });
  it('exports complete Vietnamese subtitle text at monotonic non-overlapping times', () => {
    const p=newProject('Tin');
    p.scenes=p.scenes.slice(0,1);
    p.scenes[0].text='Hà Nội hôm nay. Người dân đón một ngày mới.';
    p.scenes[0].duration=4;
    const cues=captions(p);
    expect(cues.map(x=>x.text).join(' ')).toBe(p.scenes[0].text);
    expect(cues[0].start).toBe(0);
    expect(cues.at(-1)?.end).toBe(4);
    expect(toSrt(p)).toContain('00:00:00,000 -->');
    expect(toSrt(p)).toContain('Hà Nội');
  });
});

it('shortens existing voiced scenes and moves the next scene and subtitles with them',()=>{
 const p=newProject('Đồng bộ lời và sub');
 p.scenes[0].text='Bản tin hôm nay ghi nhận những thông tin mới nhất tại Hà Nội. Người dân tiếp tục theo dõi diễn biến trong ngày.';
 p.scenes[0].duration=17;
 p.assets.push({id:'narration',name:'Voice',kind:'audio',file:'narration.wav',mime:'audio/wav',bytes:100,duration:12.11});
 p.scenes[0].voice={assetId:'narration',text:p.scenes[0].text,provider:'local',voiceId:'female'};
 const cues=captions(p);const nextStart=364/30;const firstScene=cues.filter(c=>c.start<nextStart);
 expect(firstScene.length).toBeGreaterThan(1);
 expect(firstScene.at(-1)!.end).toBeCloseTo(12.11,6);
 expect(sceneFrames(p.scenes[0],p.assets)).toBe(364);
 expect(cues[firstScene.length].start).toBe(nextStart);
 expect(timeline(p)[1].from).toBe(364);
 expect(toSrt(p)).toContain('00:00:12,110');
 const timings=firstScene.map(({start,end})=>[start,end]);
 p.scenes[0].duration=25;
 expect(captions(p).filter(c=>c.start<nextStart).map(({start,end})=>[start,end])).toEqual(timings);
});

it('uses exact audio seconds beyond the scene length, but ignores stale or non-audio voice references',()=>{
 const p=newProject('Đồng bộ');p.scenes=p.scenes.slice(0,1);p.scenes[0].duration=3;
 p.assets.push({id:'voice',name:'Voice',kind:'audio',file:'voice.wav',mime:'audio/wav',bytes:100,duration:5.01});
 p.scenes[0].voice={assetId:'voice',text:p.scenes[0].text,provider:'upload',voiceId:''};
 expect(captions(p).at(-1)!.end).toBeCloseTo(5.01,6);
 p.scenes[0].voice!.text='Lời đã cũ';
 expect(captions(p).at(-1)!.end).toBe(timeline(p)[0].duration/30);
 p.scenes[0].voice!.text=p.scenes[0].text;p.assets[0].kind='video';
 expect(captions(p).at(-1)!.end).toBe(timeline(p)[0].duration/30);
});

 it('joins voiced scenes with less than one frame of padding and restores manual timing without valid narration',()=>{
 const p=newProject('Nối cảnh');
 p.scenes.forEach((s,i)=>{s.duration=17;const id=`voice${i}`;p.assets.push({id,name:'Voice',kind:'audio',file:`${id}.wav`,mime:'audio/wav',bytes:100,duration:i?4.96:12.11});s.voice={assetId:id,text:s.text,provider:'local',voiceId:'female'};});
 const times=timeline(p);expect(times.map(t=>t.duration)).toEqual([364,149]);
 expect(times[1].from/30-12.11).toBeLessThan(1/30);
 p.scenes[0].voice!.text='Lời cũ';expect(sceneFrames(p.scenes[0],p.assets)).toBe(510);
 p.scenes[0].voice=undefined;expect(sceneFrames(p.scenes[0],p.assets)).toBe(510);
 p.scenes[1].voice!.assetId='missing';expect(sceneFrames(p.scenes[1],p.assets)).toBe(510);
 });
