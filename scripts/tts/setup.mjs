import {spawnSync} from 'node:child_process';
import {existsSync} from 'node:fs';
import path from 'node:path';

const run=(command,args)=>{const result=spawnSync(command,args,{stdio:'inherit',env:{...process.env,PIP_DISABLE_PIP_VERSION_CHECK:'1',PYTHONUTF8:'1',PYTHONIOENCODING:'utf-8'}});if(result.error)throw result.error;if(result.status!==0)process.exit(result.status||1);};
const python=process.env.CREVID_TTS_PYTHON||path.resolve(`.venv-tts/${process.platform==='win32'?'Scripts/python.exe':'bin/python'}`);
if(!existsSync(python)){
 const candidates=process.env.CREVID_PYTHON?[process.env.CREVID_PYTHON]:process.platform==='win32'?['python']:['python3.12','python3.13','python3'];
 const base=candidates.find(command=>spawnSync(command,['-c','import sys; sys.exit(0 if (3, 12) <= sys.version_info[:2] < (3, 14) else 1)']).status===0);
 if(!base)throw new Error('Cài Python 3.12–3.13, hoặc đặt CREVID_PYTHON là đường dẫn Python rồi chạy lại.');
 run(base,['-m','venv',path.dirname(path.dirname(python))]);
}
if(spawnSync(python,['-c','import sys; sys.exit(0 if (3, 12) <= sys.version_info[:2] < (3, 14) else 1)']).status!==0)throw new Error('Môi trường TTS cần Python 3.12–3.13. Chọn môi trường mới qua CREVID_TTS_PYTHON.');
const requirements=existsSync('scripts/tts/requirements.lock.txt')?'scripts/tts/requirements.lock.txt':'scripts/tts/requirements.txt';
run(python,['-m','pip','install','--timeout','120','--retries','5',...(requirements.endsWith('.lock.txt')?['--no-deps']:[]),'-r',requirements]);
run(python,['-m','pip','install','--timeout','120','--retries','5','--no-deps','vieneu==3.8.3']);
run(python,['scripts/tts/setup.py','--root',path.resolve(process.env.CREVID_DATA_DIR||'.data','tts')]);
