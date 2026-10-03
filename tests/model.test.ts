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
