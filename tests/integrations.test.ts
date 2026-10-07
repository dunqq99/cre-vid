import { it, expect } from 'vitest';
import { assertPublicUrl, extractArticle } from '../src/lib/integrations';
it.each(['http://127.0.0.1/a','http://169.254.169.254','http://[::1]','http://10.0.0.1','file:///etc/passwd','https://user:pass@example.com','http://[::ffff:127.0.0.1]'])('blocks unsafe source URL %s',async url=>{await expect(assertPublicUrl(url)).rejects.toThrow();});
it('blocks DNS names resolving to a private address',async()=>{
 await expect(assertPublicUrl('https://paper.example/story',async()=>[{address:'192.168.1.1',family:4}])).rejects.toThrow();
});
it('extracts article text without scripts, keeping the source URL',()=>{
 const html='<html><head><title>Bản tin</title></head><body><article><h1>Ngày mới ở Hà Nội</h1><p>'+('Người dân đón ngày mới tại Hà Nội. '.repeat(30))+'</p><script>steal()</script></article></body></html>';
 const a=extractArticle(html,'https://example.com/news');
 expect(a.text).toContain('Người dân');expect(a.text).not.toContain('steal');expect(a.url).toBe('https://example.com/news');
});
it('returns an address list for Node dual-stack lookup without re-resolving DNS',async()=>{
 const {pinnedLookup}=await import('../src/lib/integrations');
 const result=await new Promise(resolve=>pinnedLookup({address:'93.184.216.34',family:4})('example.com',{all:true},(_error:unknown,address:unknown)=>resolve(address)));
 expect(result).toEqual([{address:'93.184.216.34',family:4}]);
});
