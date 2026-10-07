"""Offline-only JSON-lines TTS worker. Run via Cre-vid, not a network server."""
import argparse
import contextlib
import importlib.metadata
import json
import math
import os
from pathlib import Path
import socket
import sys
import time

SDK_VERSION = '3.8.3'
VOICES = {'male': 'Hải Đăng', 'female': 'Trúc Ly'}


def validate_request(request, root):
    text = request.get('text', '')
    speed = request.get('speed')
    if not isinstance(text, str) or not text.strip() or len(text) > 3000:
        raise ValueError('Lời đọc phải có từ 1 đến 3.000 ký tự.')
    if request.get('voiceId') not in VOICES:
        raise ValueError('Chỉ hỗ trợ hai giọng Nam và Nữ.')
    if isinstance(speed, bool) or not isinstance(speed, (int, float)) or not math.isfinite(speed) or not 0.5 <= speed <= 1.5:
        raise ValueError('Tốc độ phải từ 0.5 đến 1.5.')
    output = Path(request.get('output', '')).resolve()
    if not output.is_relative_to(root.resolve()) or output.suffix != '.wav':
        raise ValueError('Đường dẫn audio không hợp lệ.')
    return {**request, 'text': text.strip(), 'output': str(output)}


def validate_manifest(manifest, root):
    if manifest.get('schema') != 1 or manifest.get('sdk') != SDK_VERSION or manifest.get('voices') != VOICES or not manifest.get('files') or not manifest.get('revisions'):
        raise ValueError('Model chưa cài đầy đủ. Chạy npm run tts:setup.')
    for item in manifest['files']:
        file = (root / item['path']).resolve()
        if not file.is_relative_to(root.resolve()) or not file.is_file() or file.stat().st_size != item['bytes'] or item['bytes'] <= 0:
            raise ValueError('Thiếu hoặc hỏng file model. Chạy npm run tts:setup.')


def disable_network():
    os.environ['HF_HUB_OFFLINE'] = '1'
    os.environ['HF_HUB_DISABLE_TELEMETRY'] = '1'
    os.environ['TRANSFORMERS_OFFLINE'] = '1'

    def denied(*args, **kwargs):
        raise RuntimeError('TTS local không được phép kết nối mạng.')

    socket.create_connection = denied
    socket.socket.connect = denied
    socket.socket.connect_ex = denied


def load_model(root, manifest):
    disable_network()
    import onnxruntime
    onnxruntime.disable_telemetry_events()
    import huggingface_hub
    def local_download(repo_id, filename, **kwargs):
        if repo_id not in manifest['revisions']:
            raise ValueError('Model ngoài danh sách đã cài: ' + repo_id)
        file = root / manifest['artifactDirectories'][repo_id] / (kwargs.get('subfolder') or '') / filename
        if not file.resolve().is_relative_to(root.resolve()) or not file.is_file():
            raise ValueError('Thiếu file model local: ' + filename)
        return str(file)

    huggingface_hub.hf_hub_download = local_download
    from vieneu import Vieneu
    model_dir = root / manifest['modelDirectory']
    model = Vieneu(mode='v3turbo', backend='onnx', device='cpu', precision='fp32',
                   backbone_repo=str(model_dir), onnx_dir=str(model_dir / 'onnx_update'), threads=4)
    available = {name for _, name in model.list_preset_voices()}
    if not set(VOICES.values()).issubset(available):
        raise ValueError('Model thiếu giọng Hải Đăng hoặc Trúc Ly.')
    return model


def generate(model, request):
    import numpy as np
    import soundfile as sf
    # SDK splits long Vietnamese prose by sentences and rejoins with pauses.
    audio = model.infer(request['text'], voice=VOICES[request['voiceId']], max_chars=220)
    if not len(audio) or not np.isfinite(audio).all() or float(np.max(np.abs(audio))) < 0.00001:
        raise ValueError('Model trả về audio rỗng hoặc không hợp lệ.')
    sf.write(request['output'], audio, model.sample_rate, subtype='PCM_16')
    return len(audio) / model.sample_rate


def main():
    sys.stdin.reconfigure(encoding='utf-8')
    sys.stdout.reconfigure(encoding='utf-8')
    sys.stderr.reconfigure(encoding='utf-8')
    parser = argparse.ArgumentParser()
    parser.add_argument('--root', type=Path, required=True)
    parser.add_argument('--manifest', default='manifest.json')
    parser.add_argument('--check', action='store_true')
    parser.add_argument('--smoke', action='store_true')
    args = parser.parse_args()
    root = args.root.resolve()
    os.environ['HF_HOME'] = str(root / 'hf')
    manifest = json.loads((root / args.manifest).read_text(encoding='utf8'))
    validate_manifest(manifest, root)
    if importlib.metadata.version('vieneu') != SDK_VERSION:
        raise ValueError('Sai phiên bản SDK. Chạy npm run tts:setup.')
    for package, version in manifest.get('dependencies', {}).items():
        if importlib.metadata.version(package) != version:
            raise ValueError('Thư viện TTS đã thay đổi. Chạy npm run tts:setup.')
    disable_network()
    if args.check:
        return
    with contextlib.redirect_stdout(sys.stderr):
        model = load_model(root, manifest)
    if args.smoke:
        samples = root / 'samples'
        samples.mkdir(exist_ok=True)
        results = {}
        for voice in VOICES:
            started = time.monotonic()
            request = validate_request(dict(text='Xin chào các bạn. Hôm nay, ngày 3 tháng 10 năm 2026, bản tin ghi nhận 25 trường học tại Hà Nội đón học sinh. Chúng tôi sẽ tiếp tục cập nhật những thông tin mới nhất.', voiceId=voice, speed=1, output=str(samples / f'{voice}.wav')), root)
            with contextlib.redirect_stdout(sys.stderr):
                duration = generate(model, request)
            results[voice] = dict(seconds=round(time.monotonic()-started, 2), audioSeconds=round(duration, 2), file=f'samples/{voice}.wav')
        print(json.dumps(results, ensure_ascii=False), flush=True)
        return
    for line in sys.stdin:
        request = {}
        try:
            if len(line) > 50000:
                raise ValueError('Yêu cầu quá lớn.')
            request = json.loads(line)
            request = validate_request(request, root)
            with contextlib.redirect_stdout(sys.stderr):
                generate(model, request)
            reply = dict(id=request['id'], ok=True)
        except Exception as error:
            reply = dict(id=request.get('id'), ok=False, error=str(error)[:700])
        print(json.dumps(reply, ensure_ascii=False), flush=True)


if __name__ == '__main__':
    main()
