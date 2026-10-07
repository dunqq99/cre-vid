"""Online provisioning only. A separate offline process must pass before ready."""
import argparse
from concurrent.futures import ThreadPoolExecutor
from datetime import datetime, timezone
import hashlib
import importlib.metadata
import json
import os
from pathlib import Path
import subprocess
import sys
import shutil

from runtime import SDK_VERSION, VOICES

MODEL = 'pnnbao-ump/VieNeu-TTS-v3-Turbo'
CODEC = 'OpenMOSS-Team/MOSS-Audio-Tokenizer-Nano-ONNX'
GRAPHS = ['vieneu_prefill.onnx', 'vieneu_decode_step.onnx', 'vieneu_acoustic_cached.onnx', 'vieneu_backbone_shared.data', 'vieneu_v3_heads.npz', 'config.json', 'tokenizer.json']
CODECS = ['moss_audio_tokenizer_decode_full.onnx', 'moss_audio_tokenizer_decode_shared.data', 'moss_audio_tokenizer_decode_step.onnx', 'codec_browser_onnx_meta.json', 'moss_audio_tokenizer_encode.onnx', 'moss_audio_tokenizer_encode.data']


def materialize(source, destination):
    """ONNX external-data files must share a real directory, not cache symlinks."""
    destination.parent.mkdir(parents=True, exist_ok=True)
    temporary = destination.with_name(destination.name + '.installing')
    temporary.unlink(missing_ok=True)
    try:
        os.link(source.resolve(), temporary)
    except OSError:
        shutil.copy2(source, temporary)
    temporary.replace(destination)


def checksum(file):
    digest = hashlib.sha256()
    with file.open('rb') as stream:
        for chunk in iter(lambda: stream.read(1024*1024), b''):
            digest.update(chunk)
    return digest.hexdigest()


def main():
    sys.stdout.reconfigure(encoding='utf-8')
    sys.stderr.reconfigure(encoding='utf-8')
    parser = argparse.ArgumentParser()
    parser.add_argument('--root', type=Path, required=True)
    args = parser.parse_args()
    root = args.root.resolve()
    root.mkdir(parents=True, exist_ok=True)
    os.environ['HF_HOME'] = str(root / 'hf')
    os.environ['HF_HUB_DISABLE_TELEMETRY'] = '1'
    os.environ['HF_XET_HIGH_PERFORMANCE'] = '1'
    from huggingface_hub import HfApi, hf_hub_download
    api = HfApi()
    lock_file = Path(__file__).with_name('models.lock.json')
    revisions = json.loads(lock_file.read_text()) if lock_file.exists() else {repo: api.model_info(repo).sha for repo in [MODEL, CODEC]}
    downloads = [(MODEL, 'onnx_update/'+name) for name in GRAPHS] + [(CODEC, name) for name in CODECS]
    artifact_dirs = {MODEL: 'models/vieneu', CODEC: 'models/codec'}
    def download(item):
        repo, name = item
        print('Downloading', repo, name, flush=True)
        cached = Path(hf_hub_download(repo, name, revision=revisions[repo]))
        file = root / artifact_dirs[repo] / name
        materialize(cached, file)
        return file
    with ThreadPoolExecutor(max_workers=4) as pool:
        files = list(pool.map(download, downloads))
    model_dir = files[0].parent.parent
    import vieneu
    presets_file = Path(vieneu.__file__).parent / 'assets' / 'voices_v3_turbo.json'
    presets = json.loads(presets_file.read_text(encoding='utf8'))
    for key, name in VOICES.items():
        preset = presets['presets'].get(name)
        if not preset or preset.get('gender', '').lower() not in ({'male', 'm', 'nam'} if key == 'male' else {'female', 'f', 'nữ'}):
            raise ValueError('Không xác minh được preset: '+name)
    local_presets = model_dir / 'voices_v3_turbo.json'
    local_presets.write_text(json.dumps({'default_voice':VOICES['female'], 'presets':{name:presets['presets'][name] for name in VOICES.values()}}, ensure_ascii=False), encoding='utf8')
    files.append(local_presets)
    for repo in [MODEL, CODEC]:
        info = api.model_info(repo, revision=revisions[repo])
        for entry in info.siblings:
            if Path(entry.rfilename).name.lower() in {'license', 'license.txt', 'license.md', 'notice', 'readme.md'}:
                files.append(Path(hf_hub_download(repo, entry.rfilename, revision=revisions[repo])))
    # Lock the actual environment used for the smoke test, including phonemizer.
    dependencies = {dist.metadata['Name']:dist.version for dist in importlib.metadata.distributions() if dist.metadata['Name'] not in {'pip', 'setuptools'}}
    manifest = dict(schema=1, sdk=SDK_VERSION, voices=VOICES, revisions=revisions, dependencies=dependencies, artifactDirectories=artifact_dirs,
                    modelDirectory=str(model_dir.relative_to(root)), files=[])
    for file in files:
        manifest['files'].append(dict(path=str(file.relative_to(root)), bytes=file.stat().st_size, sha256=checksum(file)))
    candidate = root / 'setup-manifest.json'
    candidate.write_text(json.dumps(manifest, ensure_ascii=False, indent=2), encoding='utf8')
    print('Testing both voices with network disabled...', flush=True)
    completed = subprocess.run([sys.executable, str(Path(__file__).with_name('runtime.py')), '--root', str(root), '--manifest', candidate.name, '--smoke'], check=True, capture_output=True, encoding='utf-8', timeout=1200, env={**os.environ, 'HF_HUB_OFFLINE':'1', 'PYTHONUTF8':'1', 'PYTHONIOENCODING':'utf-8'})
    manifest['samples'] = json.loads(completed.stdout)
    manifest['verifiedAt'] = datetime.now(timezone.utc).isoformat()
    candidate.write_text(json.dumps(manifest, ensure_ascii=False, indent=2), encoding='utf8')
    candidate.replace(root / 'manifest.json')
    if not lock_file.exists():
        lock_file.write_text(json.dumps(revisions, indent=2)+'\n')
    frozen = subprocess.check_output([sys.executable, '-m', 'pip', 'freeze'], text=True)
    (root / 'requirements-installed.txt').write_text(frozen)
    print(json.dumps(manifest['samples'], ensure_ascii=False, indent=2), flush=True)
    print('TTS local ready: Hải Đăng / Trúc Ly', flush=True)


if __name__ == '__main__':
    try:
        main()
    except subprocess.CalledProcessError as error:
        print(error.stderr or str(error), file=sys.stderr)
        raise SystemExit(1)
